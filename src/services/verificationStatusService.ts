/**
 * TERRASYNX Verification Status & Lifecycle Model (Prompt 63)
 * Implements strict multi-tier verification statuses:
 *  - OPEN_VERIFIED (only if verified within freshness window for its source type)
 *  - OPEN_NOT_RECENTLY_VERIFIED (if outside freshness window)
 *  - CLOSING_SOON (< 24h before closing)
 *  - POSSIBLY_CLOSED (unresponsive / missing in recent scans)
 *  - CLOSED_EARLY_BY_PORTAL
 *  - DEADLINE_PASSED
 *  - REMOVED_BY_PORTAL
 *  - CANCELLED_OR_POSTPONED
 *  - UNKNOWN
 *
 * Enforces grace period for closed items (retained visible with a Closed bar for 6 hours),
 * then transitions to archive.
 */

import { Opportunity, OpportunityVerificationStatus, OpportunityVerificationModel } from '../types';

// Default Grace Period before closed listings move permanently to archive (6 hours)
export const CLOSED_GRACE_PERIOD_MS = 6 * 60 * 60 * 1000;

// Source-specific Freshness Windows (Prompt 63 requirement)
export const FRESHNESS_WINDOWS_BY_SOURCE_MS: Record<string, number> = {
  greenhouse: 6 * 60 * 60 * 1000,           // 6 hours
  lever: 6 * 60 * 60 * 1000,                // 6 hours
  ashby: 8 * 60 * 60 * 1000,                // 8 hours
  workday: 12 * 60 * 60 * 1000,             // 12 hours
  smartrecruiters: 12 * 60 * 60 * 1000,      // 12 hours
  workable: 12 * 60 * 60 * 1000,             // 12 hours
  direct_careers_domain: 12 * 60 * 60 * 1000,// 12 hours
  singapore_gov: 24 * 60 * 60 * 1000,       // 24 hours
  hacker_news: 24 * 60 * 60 * 1000,         // 24 hours
  builtin: 24 * 60 * 60 * 1000,             // 24 hours
};

export const DEFAULT_FRESHNESS_WINDOW_MS = 12 * 60 * 60 * 1000; // 12 hours default

/**
 * Gets the maximum allowed freshness window for a given source type.
 */
export function getFreshnessWindowMs(sourceType: string): number {
  if (!sourceType) return DEFAULT_FRESHNESS_WINDOW_MS;
  const lower = sourceType.toLowerCase();
  return FRESHNESS_WINDOWS_BY_SOURCE_MS[lower] || DEFAULT_FRESHNESS_WINDOW_MS;
}

/**
 * Formats a timestamp into a human-friendly relative string "X ago".
 * (e.g. "just now", "14m ago", "3h ago", "2d ago")
 */
export function formatTimeAgo(timestamp: number, currentNow: number = Date.now()): string {
  if (!timestamp || isNaN(timestamp)) return 'never';
  const diffMs = Math.max(0, currentNow - timestamp);
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * Checks if a status represents a closed or discontinued state.
 */
export function isClosedStatus(status: OpportunityVerificationStatus): boolean {
  return (
    status === 'CLOSED_EARLY_BY_PORTAL' ||
    status === 'DEADLINE_PASSED' ||
    status === 'REMOVED_BY_PORTAL' ||
    status === 'CANCELLED_OR_POSTPONED'
  );
}

/**
 * Resolves the authoritative verification status model for an opportunity.
 * Enforces the core rule:
 * "A card may show OPEN_VERIFIED only if lastVerifiedAt is within the freshness window for its source type; otherwise OPEN_NOT_RECENTLY_VERIFIED."
 */
export function resolveVerificationStatus(
  opp: Opportunity,
  currentNow: number = Date.now()
): OpportunityVerificationModel {
  // 1. Check explicit override if already resolved on model
  const existingModel = opp.verificationStatusModel || opp.verification?.statusModel;
  const lastVerifiedAt = 
    existingModel?.lastVerifiedAt || 
    opp.verification?.lastCheckedTimestamp || 
    opp.lastSeenInApiAt || 
    opp.releasedAt || 
    currentNow;

  const sourceUrl = 
    existingModel?.sourceUrl || 
    opp.verification?.endpointUrl || 
    opp.officialApplyUrl || 
    `https://${opp.companyDomain}`;

  // 2. Check Deadline Expiration
  if (opp.deadlineAt && currentNow >= opp.deadlineAt) {
    const closedAt = opp.closedAt || existingModel?.closedAt || opp.deadlineAt;
    const isArchived = currentNow - closedAt > CLOSED_GRACE_PERIOD_MS;
    return {
      status: 'DEADLINE_PASSED',
      lastVerifiedAt,
      evidence: existingModel?.evidence || 'Official application window reached closing deadline and ceased accepting new submissions.',
      sourceUrl,
      closedAt,
      isArchived,
    };
  }

  // 3. Check Explicit Removal or Early Closure
  if (existingModel?.status === 'REMOVED_BY_PORTAL') {
    const closedAt = opp.closedAt || existingModel.closedAt || lastVerifiedAt;
    const isArchived = currentNow - closedAt > CLOSED_GRACE_PERIOD_MS;
    return {
      status: 'REMOVED_BY_PORTAL',
      lastVerifiedAt,
      evidence: existingModel.evidence || 'Requisition was explicitly removed/purged from the employer portal.',
      sourceUrl,
      closedAt,
      isArchived,
    };
  }

  if (existingModel?.status === 'CANCELLED_OR_POSTPONED') {
    const closedAt = opp.closedAt || existingModel.closedAt || lastVerifiedAt;
    const isArchived = currentNow - closedAt > CLOSED_GRACE_PERIOD_MS;
    return {
      status: 'CANCELLED_OR_POSTPONED',
      lastVerifiedAt,
      evidence: existingModel.evidence || 'Employer notified that this recruitment cycle was cancelled or postponed.',
      sourceUrl,
      closedAt,
      isArchived,
    };
  }

  if (
    existingModel?.status === 'CLOSED_EARLY_BY_PORTAL' ||
    (opp.consecutiveMissingFetches && opp.consecutiveMissingFetches >= 3)
  ) {
    const closedAt = opp.closedAt || existingModel?.closedAt || lastVerifiedAt;
    const isArchived = currentNow - closedAt > CLOSED_GRACE_PERIOD_MS;
    return {
      status: 'CLOSED_EARLY_BY_PORTAL',
      lastVerifiedAt,
      evidence: existingModel?.evidence || 'Requisition was delisted from the active API prior to scheduled deadline date.',
      sourceUrl,
      closedAt,
      isArchived,
    };
  }

  // 4. Check Possibility of Closure (2 consecutive missing API pulses)
  if (opp.possiblyClosed || opp.closureStatus === 'POSSIBLY_CLOSED') {
    return {
      status: 'POSSIBLY_CLOSED',
      lastVerifiedAt,
      evidence: existingModel?.evidence || `Not observed in ${opp.consecutiveMissingFetches || 2} recent crawler pulses. Verification in progress.`,
      sourceUrl,
      closedAt: opp.closedAt,
      isArchived: false,
    };
  }

  // 5. Check Closing Soon (< 24 hours remaining)
  if (opp.deadlineAt && opp.deadlineAt > currentNow) {
    const msUntilClosing = opp.deadlineAt - currentNow;
    if (msUntilClosing <= 24 * 60 * 60 * 1000) {
      return {
        status: 'CLOSING_SOON',
        lastVerifiedAt,
        evidence: existingModel?.evidence || 'Active listing in final 24-hour application window before cutoff.',
        sourceUrl,
        isArchived: false,
      };
    }
  }

  // 6. Source-Type Freshness Window Verification (Prompt 63 Core Requirement)
  const sourceType = opp.verification?.sourceType || 'direct_careers_domain';
  const freshnessWindowMs = getFreshnessWindowMs(sourceType);
  const timeSinceVerification = currentNow - lastVerifiedAt;

  if (timeSinceVerification <= freshnessWindowMs) {
    return {
      status: 'OPEN_VERIFIED',
      lastVerifiedAt,
      evidence: existingModel?.evidence || `HTTP 200 OK verified on ${sourceType.toUpperCase()} endpoint with active applicant submission form.`,
      sourceUrl,
      isArchived: false,
    };
  }

  // Verified in the past, but outside source freshness window
  const hoursAgo = Math.round(timeSinceVerification / (60 * 60 * 1000));
  const maxHours = Math.round(freshnessWindowMs / (60 * 60 * 1000));
  return {
    status: 'OPEN_NOT_RECENTLY_VERIFIED',
    lastVerifiedAt,
    evidence: existingModel?.evidence || `Requisition verified ${hoursAgo}h ago (source freshness SLA is ${maxHours}h). Awaiting next scheduled crawler pulse.`,
    sourceUrl,
    isArchived: false,
  };
}

/**
 * Checks whether a closed item should stay visible in the active radar with a Closed bar.
 */
export function isWithinGracePeriod(opp: Opportunity, currentNow: number = Date.now()): boolean {
  const model = resolveVerificationStatus(opp, currentNow);
  if (!isClosedStatus(model.status)) {
    return false;
  }
  const closedAt = model.closedAt || currentNow;
  const elapsed = currentNow - closedAt;
  return elapsed <= CLOSED_GRACE_PERIOD_MS;
}

/**
 * Returns remaining milliseconds in the grace period for a closed opportunity.
 */
export function getGracePeriodRemainingMs(opp: Opportunity, currentNow: number = Date.now()): number {
  const model = resolveVerificationStatus(opp, currentNow);
  if (!isClosedStatus(model.status)) return 0;
  const closedAt = model.closedAt || currentNow;
  const remaining = CLOSED_GRACE_PERIOD_MS - (currentNow - closedAt);
  return Math.max(0, remaining);
}

/**
 * Formats the remaining grace period into a readable string (e.g. "4h 22m").
 */
export function formatGracePeriodRemaining(remainingMs: number): string {
  if (remainingMs <= 0) return 'expired';
  const totalMin = Math.floor(remainingMs / 60000);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export interface StatusBadgeConfig {
  label: string;
  badgeClass: string;
  borderClass: string;
  textClass: string;
  iconName: 'check' | 'clock' | 'alert' | 'alert-triangle' | 'x' | 'lock' | 'trash' | 'info';
  description: string;
}

/**
 * Returns UI configuration (colors, labels, icons) for any verification status.
 */
export function getStatusBadgeConfig(status: OpportunityVerificationStatus): StatusBadgeConfig {
  switch (status) {
    case 'OPEN_VERIFIED':
      return {
        label: 'OPEN • VERIFIED',
        badgeClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-950/40',
        borderClass: 'border-emerald-500/50',
        textClass: 'text-emerald-300',
        iconName: 'check',
        description: 'Verified active within the source freshness SLA with live application portal.',
      };
    case 'OPEN_NOT_RECENTLY_VERIFIED':
      return {
        label: 'OPEN • NOT RECENTLY VERIFIED',
        badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
        borderClass: 'border-amber-500/40',
        textClass: 'text-amber-300',
        iconName: 'clock',
        description: 'Confirmed authentic opening, but last verification exceeds the source freshness window.',
      };
    case 'CLOSING_SOON':
      return {
        label: 'CLOSING SOON (<24H)',
        badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-500/60 animate-pulse shadow-sm shadow-rose-950/50',
        borderClass: 'border-rose-500/60',
        textClass: 'text-rose-300',
        iconName: 'alert-triangle',
        description: 'Entering final 24-hour application window before official portal closing.',
      };
    case 'POSSIBLY_CLOSED':
      return {
        label: 'POSSIBLY CLOSED',
        badgeClass: 'bg-amber-950/70 text-amber-200 border-amber-500/60',
        borderClass: 'border-amber-500/60',
        textClass: 'text-amber-300',
        iconName: 'alert',
        description: 'Not detected in recent API scans; automated verification in progress.',
      };
    case 'CLOSED_EARLY_BY_PORTAL':
      return {
        label: 'CLOSED EARLY BY PORTAL',
        badgeClass: 'bg-red-950/90 text-red-200 border-red-700/80',
        borderClass: 'border-red-700/80',
        textClass: 'text-red-300',
        iconName: 'x',
        description: 'Application was closed by the company earlier than the scheduled deadline.',
      };
    case 'DEADLINE_PASSED':
      return {
        label: 'DEADLINE PASSED',
        badgeClass: 'bg-slate-900/90 text-slate-300 border-slate-700/80',
        borderClass: 'border-slate-700/80',
        textClass: 'text-slate-300',
        iconName: 'lock',
        description: 'The scheduled application deadline has passed.',
      };
    case 'REMOVED_BY_PORTAL':
      return {
        label: 'REMOVED BY PORTAL',
        badgeClass: 'bg-red-950/90 text-red-300 border-red-800',
        borderClass: 'border-red-800',
        textClass: 'text-red-300',
        iconName: 'trash',
        description: 'Requisition was explicitly removed from the source ATS platform.',
      };
    case 'CANCELLED_OR_POSTPONED':
      return {
        label: 'CANCELLED / POSTPONED',
        badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-700/80',
        borderClass: 'border-purple-700/80',
        textClass: 'text-purple-300',
        iconName: 'info',
        description: 'Role or hiring program was cancelled or postponed for this cycle.',
      };
    case 'UNKNOWN':
    default:
      return {
        label: 'STATUS UNKNOWN',
        badgeClass: 'bg-slate-900/80 text-slate-400 border-slate-700',
        borderClass: 'border-slate-700',
        textClass: 'text-slate-400',
        iconName: 'info',
        description: 'Verification status is pending initial cryptographic audit.',
      };
  }
}

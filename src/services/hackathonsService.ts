import { curatedRecordsService } from './curatedRecordsService';
/**
 * TERRASYNX: Hackathons & Open Innovation Competitions Service (Prompt 42)
 * 
 * Provides verified data, filtering, search, and status detection for top global hackathons:
 * - Sources: 'devpost-live' & 'recurring-series'
 * - Modes: 'online' | 'in-person' | 'hybrid'
 * - Country: 'Online/Global' when virtual, authentic country otherwise
 * - Strict Rule: Zero hiding based on student eligibility (Never hide a hackathon because of eligibility)
 * - Honest Empty State when filters yield 0 matches
 */

import { Hackathon, HackathonMode, HackathonSource, HackathonStatusTab, HackathonStatus, HackathonType, DateConfidence } from '../types';

export interface HackathonFilters {
  statusTab?: HackathonStatusTab;
  status?: HackathonStatus | 'all';
  type?: HackathonType | 'all';
  mode?: HackathonMode | 'all';
  country?: string | 'all';
  theme?: string | 'all';
  query?: string;
}

// Prompt 64: Data out of code — Hardcoded array migrated to Firestore 'records' and 'sources' collections
export const HACKATHONS_DATABASE: Hackathon[] = curatedRecordsService.getHackathons();

export class HackathonsService {
  /**
   * Return the entire verified hackathons list with guaranteed dateConfidence.
   */
  public static getAllHackathons(): Hackathon[] {
    return HACKATHONS_DATABASE.map(h => ({
      ...h,
      dateConfidence: h.dateConfidence || (
        h.status === 'ANNOUNCED_VERIFIED' || h.id === 'hack_nasa_space_apps' || h.id.includes('mlh')
          ? 'OFFICIAL'
          : 'REPORTED'
      ),
    }));
  }

  /**
   * Enriches hackathons with data from official page watcher snapshots (Prompt 46)
   */
  public static enrichWithWatcherSnapshots(
    hackathons: Hackathon[],
    snapshots: Array<{
      organizer: string;
      sourceUrl: string;
      detectedOn: string;
      status: HackathonStatus;
      isStale?: boolean;
      consecutiveMatches?: number;
      dateConfidence?: DateConfidence;
      grounded?: {
        name?: string | null;
        dates?: string | null;
        deadline?: string | null;
        fee?: string | null;
      };
    }>
  ): Hackathon[] {
    if (!snapshots || snapshots.length === 0) return hackathons;

    const snapshotMap = new Map<string, any>();
    for (const snap of snapshots) {
      if (snap.organizer) {
        snapshotMap.set(snap.organizer.toLowerCase().trim(), snap);
      }
    }

    return hackathons.map(h => {
      const snap = snapshotMap.get(h.organizer.toLowerCase().trim()) ||
                   snapshotMap.get(h.name.toLowerCase().trim());
      if (!snap) return h;

      // Prompt 60: The watcher may mark a date OFFICIAL only after the grounding check and two consistent runs.
      const hasGroundedDate = Boolean(snap.grounded?.dates && snap.grounded.dates.trim().length > 0);
      const isTwoRuns = (snap.consecutiveMatches || 0) >= 2;
      let newDateConfidence = h.dateConfidence;
      if (snap.dateConfidence) {
        newDateConfidence = snap.dateConfidence;
      } else if (hasGroundedDate && isTwoRuns) {
        newDateConfidence = 'OFFICIAL';
      } else if (hasGroundedDate) {
        newDateConfidence = 'REPORTED';
      }

      return {
        ...h,
        sourceUrl: snap.sourceUrl || h.sourceUrl || h.officialUrl,
        detectedOn: snap.detectedOn || h.detectedOn,
        isStale: typeof snap.isStale === 'boolean' ? snap.isStale : h.isStale,
        status: snap.status || h.status,
        dates: snap.grounded?.dates || h.dates,
        dateConfidence: newDateConfidence,
        registrationDeadline: snap.grounded?.deadline || h.registrationDeadline,
        name: snap.grounded?.name || h.name,
      };
    });
  }

  /**
   * Determine whether a hackathon is OPEN_NOW, UPCOMING, or PASSED based on a given reference date.
   * Prompt 57: Compute status (Open Now / Upcoming / Passed) from the current date ONLY when dateConfidence is OFFICIAL or REPORTED.
   * For CONFLICTING or UNKNOWN, returns null (status is not computed from date).
   */
  public static getHackathonStatus(hackathon: Hackathon, referenceDate: Date = new Date()): HackathonStatusTab | null {
    // Prompt 57: Compute status ONLY when dateConfidence is OFFICIAL or REPORTED
    const conf = hackathon.dateConfidence || (hackathon.status === 'ANNOUNCED_VERIFIED' ? 'OFFICIAL' : 'REPORTED');
    if (conf === 'CONFLICTING' || conf === 'UNKNOWN') {
      return null;
    }

    // Prompt 44: Recurring series with no fixed dates (or datesNote) are active ongoing recurring programs
    if (hackathon.datesNote || !hackathon.startDate || !hackathon.endDate) {
      return 'OPEN_NOW';
    }

    const now = referenceDate.getTime();
    
    // Parse ISO dates with safety (handles both YYYY-MM-DD and YYYY-MM-DDTHH:mm:ss.sssZ)
    const end = new Date(hackathon.endDate.includes('T') ? hackathon.endDate : hackathon.endDate + 'T23:59:59Z').getTime();
    const deadline = hackathon.registrationDeadline 
      ? new Date(hackathon.registrationDeadline.includes('T') ? hackathon.registrationDeadline : hackathon.registrationDeadline + 'T23:59:59Z').getTime()
      : end;
    const start = new Date(hackathon.startDate.includes('T') ? hackathon.startDate : hackathon.startDate + 'T00:00:00Z').getTime();

    // 1. If the hackathon end date has passed, it is PASSED
    if (now > end) {
      return 'PASSED';
    }

    // 2. If the hackathon is currently ongoing (between start and end date)
    if (now >= start && now <= end) {
      return 'OPEN_NOW';
    }

    // 3. If registration is currently open (now <= registrationDeadline)
    if (now <= deadline) {
      // If the hackathon start is within 45 days, or registration is active, consider OPEN_NOW
      const daysUntilStart = (start - now) / (1000 * 60 * 60 * 24);
      if (daysUntilStart <= 45) {
        return 'OPEN_NOW';
      }
      return 'UPCOMING';
    }

    // 4. If registration deadline has passed but event hasn't happened yet (registered participants awaiting kickoff)
    if (now < start) {
      return 'UPCOMING';
    }

    return 'PASSED';
  }

  /**
   * Filters hackathons by mode, country, theme, status, status tab, and search query.
   * STRICT GUARANTEE: Never hide a hackathon because of eligibility!
   */
  public static filterHackathons(
    hackathons: Hackathon[],
    filters: HackathonFilters,
    referenceDate: Date = new Date()
  ): Hackathon[] {
    return hackathons.filter(hackathon => {
      // 1. Status Tab filter ('OPEN_NOW' | 'UPCOMING' | 'PASSED')
      if (filters.statusTab) {
        const computedStatus = this.getHackathonStatus(hackathon, referenceDate);
        if (!computedStatus || computedStatus !== filters.statusTab) {
          return false;
        }
      }

      // 2. Status filter ('NOT_ANNOUNCED' | 'ANNOUNCED_UNCONFIRMED' | 'ANNOUNCED_VERIFIED' | 'PASSED')
      if (filters.status && filters.status !== 'all') {
        if (hackathon.status !== filters.status) {
          return false;
        }
      }

      // 2b. Type filter ('hackathon' | 'coding-contest') (Prompt 51)
      if (filters.type && filters.type !== 'all') {
        const itemType = hackathon.type || 'hackathon';
        if (itemType !== filters.type) {
          return false;
        }
      }

      // 3. Mode filter ('online' | 'in-person' | 'hybrid')
      if (filters.mode && filters.mode !== 'all') {
        if (hackathon.mode !== filters.mode) {
          return false;
        }
      }

      // 3. Country filter
      if (filters.country && filters.country !== 'all') {
        if (hackathon.country !== filters.country) {
          return false;
        }
      }

      // 4. Theme filter
      if (filters.theme && filters.theme !== 'all') {
        const hasTheme = hackathon.themes.some(
          t => t.toLowerCase() === filters.theme?.toLowerCase()
        );
        if (!hasTheme) {
          return false;
        }
      }

      // 5. Search query (matches name, organizer, themes, country, description)
      if (filters.query && filters.query.trim().length > 0) {
        const q = filters.query.toLowerCase().trim();
        const matchesName = hackathon.name.toLowerCase().includes(q);
        const matchesOrganizer = hackathon.organizer.toLowerCase().includes(q);
        const matchesCountry = hackathon.country.toLowerCase().includes(q);
        const matchesThemes = hackathon.themes.some(t => t.toLowerCase().includes(q));
        const matchesDesc = (hackathon.description || '').toLowerCase().includes(q);
        const matchesPrizes = hackathon.prizeText.toLowerCase().includes(q);
        const matchesEligibility = hackathon.eligibilityText.toLowerCase().includes(q);
        const matchesDatesNote = (hackathon.datesNote || '').toLowerCase().includes(q);
        const matchesSpocNote = (hackathon.spocNote || '').toLowerCase().includes(q);
        const matchesLastEditionNote = (hackathon.lastEditionNote || '').toLowerCase().includes(q);

        if (
          !matchesName && 
          !matchesOrganizer && 
          !matchesCountry && 
          !matchesThemes && 
          !matchesDesc && 
          !matchesPrizes &&
          !matchesEligibility &&
          !matchesDatesNote &&
          !matchesSpocNote &&
          !matchesLastEditionNote
        ) {
          return false;
        }
      }

      // STRICT RULE (Prompt 42): Never hide a hackathon because of eligibility.
      return true;
    });
  }

  /**
   * Extract unique countries from the dataset.
   */
  public static getUniqueCountries(hackathons: Hackathon[] = HACKATHONS_DATABASE): string[] {
    const set = new Set<string>();
    for (const h of hackathons) {
      if (h.country) set.add(h.country);
    }
    return Array.from(set).sort();
  }

  /**
   * Extract unique themes from the dataset.
   */
  public static getUniqueThemes(hackathons: Hackathon[] = HACKATHONS_DATABASE): string[] {
    const set = new Set<string>();
    for (const h of hackathons) {
      for (const t of h.themes) {
        set.add(t);
      }
    }
    return Array.from(set).sort();
  }

  /**
   * Extract unique modes from the dataset.
   */
  public static getUniqueModes(): HackathonMode[] {
    return ['online', 'in-person', 'hybrid'];
  }

  /**
   * Prompt 45: Source badge text ("Listed on Devpost" or "Official series")
   */
  public static getSourceBadgeText(source: HackathonSource): 'Listed on Devpost' | 'Official series' {
    return source === 'devpost-live' ? 'Listed on Devpost' : 'Official series';
  }

  /**
   * Prompt 45: Determine if a prize was explicitly listed by the organizer
   */
  public static isPrizeListed(prizeText?: string): boolean {
    if (!prizeText) return false;
    const trimmed = prizeText.trim();
    if (trimmed.length === 0) return false;
    const lower = trimmed.toLowerCase();
    if (
      lower === 'not listed' ||
      lower === 'none' ||
      lower === 'n/a' ||
      lower === 'no prize' ||
      lower === '0' ||
      lower === '$0' ||
      lower.includes('confirm on official') ||
      lower.includes('see official') ||
      lower.includes('check official') ||
      lower.includes('tbd')
    ) {
      return false;
    }
    return true;
  }

  /**
   * Prompt 45: Format prize display returning prize text as "listed by organizer" (or "not listed")
   */
  public static getPrizeDisplay(prizeText?: string): {
    isListed: boolean;
    displayText: string;
    badgeText: 'listed by organizer' | 'not listed';
  } {
    if (this.isPrizeListed(prizeText)) {
      return {
        isListed: true,
        displayText: prizeText!.trim(),
        badgeText: 'listed by organizer',
      };
    }
    return {
      isListed: false,
      displayText: 'Not listed',
      badgeText: 'not listed',
    };
  }

  /**
   * Prompt 45 & 51: Flag clearly if an entry fee or stake exists
   * For any hackathon whose source mentions a stake or entry fee, show a clear "Fee / stake required" flag.
   */
  public static isFeeRequired(entryFeeText?: string): boolean {
    if (!entryFeeText) return false;
    const lower = entryFeeText.toLowerCase().trim();

    // Explicitly refunded/refundable stake on check-in is not a net entry fee
    if (
      lower.includes('refunded stake') || 
      lower.includes('refundable stake') || 
      lower.includes('100% refunded') ||
      (lower.includes('refundable') && lower.includes('stake'))
    ) {
      return false;
    }

    if (
      lower === 'free' ||
      lower.startsWith('free') ||
      lower.includes('100% free') ||
      lower.includes('free entry') ||
      lower.includes('no fee') ||
      lower.includes('$0') ||
      lower.includes('zero')
    ) {
      if (
        !lower.includes('not free') && 
        !lower.includes('fee exists') && 
        !lower.includes('stake required') && 
        !lower.includes('fee required')
      ) {
        return false;
      }
    }
    if (
      lower.includes('paid') ||
      lower.includes('fee exists') ||
      lower.includes('fee required') ||
      lower.includes('entry fee') ||
      lower.includes('stake required') ||
      lower.includes('stake exists') ||
      lower.includes('deposit stake') ||
      (lower.includes('stake') && !lower.includes('stakeholder')) ||
      /\$\s*\d+/.test(lower) ||
      /₹\s*\d+/.test(lower) ||
      /€\s*\d+/.test(lower) ||
      /\d+\s*(usd|eur|inr|gbp|usdc|usdt|eth|sol)/.test(lower)
    ) {
      return true;
    }
    return !lower.includes('free');
  }

  /**
   * Prompt 51: Check if any hackathon field or source text mentions a stake or entry fee
   * Returns true if entryFeeText, description, eligibility, or rules mention stake or entry fee.
   */
  public static hasFeeOrStake(hackathon: Partial<Hackathon>): boolean {
    if (this.isFeeRequired(hackathon.entryFeeText)) return true;
    const combined = [
      hackathon.entryFeeText,
      hackathon.description,
      hackathon.eligibilityText,
      hackathon.datesNote,
      hackathon.lastEditionNote
    ].filter(Boolean).join(' ').toLowerCase();

    if (
      combined.includes('refunded stake') || 
      combined.includes('refundable stake') || 
      combined.includes('100% refunded') ||
      (combined.includes('refundable') && combined.includes('stake'))
    ) {
      return false;
    }

    if (
      combined.includes('stake required') ||
      combined.includes('fee required') ||
      combined.includes('entry fee') ||
      combined.includes('paid entry') ||
      combined.includes('fee of') ||
      combined.includes('fee / stake') ||
      combined.includes('stake / fee') ||
      combined.includes('staking required') ||
      combined.includes('stake to participate') ||
      combined.includes('deposit stake') ||
      combined.includes('participation stake') ||
      (combined.includes('stake') && !combined.includes('stakeholder'))
    ) {
      return true;
    }
    return false;
  }

  /**
   * Prompt 45: Mandatory rule note on eligibility
   * "Check the event's own rules"
   */
  public static readonly ELIGIBILITY_RULES_LINE = "Check the event's own rules";
}

/**
 * TERRASYNX: Tracked Opportunity Closure Alert Relay Service (Prompt 67)
 * 
 * Invariant:
 * When a tracked opportunity changes to:
 *   - POSSIBLY_CLOSED
 *   - CLOSED_EARLY_BY_PORTAL
 *   - REMOVED_BY_PORTAL
 *   - CANCELLED_OR_POSTPONED
 * Add an Alert Relay message for users tracking it, saying what changed
 * and when it was detected.
 */

import {
  Opportunity,
  AlertEmailSimulation,
  ClosureAlertStatus,
  OpportunityClosureDetails,
  OpportunityVerificationStatus,
} from '../types';
import { RadarEngine } from './radarEngine';
import { AppliedDossierService } from './appliedDossierService';
import { formatTimeAgo } from './verificationStatusService';
import { logger } from '../utils/logger';

export const CLOSURE_ALERT_STATUSES: ReadonlySet<string> = new Set([
  'POSSIBLY_CLOSED',
  'CLOSED_EARLY_BY_PORTAL',
  'REMOVED_BY_PORTAL',
  'CANCELLED_OR_POSTPONED',
]);

export interface ClosureAlertDispatchParams {
  opportunity: Partial<Opportunity>;
  previousStatus?: string;
  newStatus: OpportunityVerificationStatus | string;
  evidence?: string;
  detectedAt?: number;
  recipientEmail?: string;
}

export class ClosureAlertService {
  /**
   * Checks whether a status matches one of the 4 Prompt 67 closure statuses.
   */
  public static isClosureAlertStatus(status: any): status is ClosureAlertStatus {
    return typeof status === 'string' && CLOSURE_ALERT_STATUSES.has(status);
  }

  /**
   * Identifies whether an opportunity is currently tracked by the active user.
   * An opportunity is tracked if:
   * 1. Explicitly marked isTracked === true
   * 2. Logged in RadarEngine.isTracked(id) or stored tracked IDs
   * 3. Part of the candidate's active execution pipeline (applied, assessment, interview, offer)
   * 4. Found in AppliedDossierService records
   */
  public static isOpportunityTracked(opportunity: Partial<Opportunity>): boolean {
    if (!opportunity || !opportunity.id) return false;

    // 1. Explicit flag on model
    if (opportunity.isTracked === true) {
      return true;
    }

    // 2. RadarEngine tracked list
    if (RadarEngine.isTracked(opportunity.id)) {
      return true;
    }

    // 3. Candidate execution stage
    const stage = opportunity.stage;
    if (stage && stage !== 'discovered' && stage !== 'archived') {
      return true;
    }

    // 4. Applied Dossier records
    if (AppliedDossierService.getRecordByOpportunityId(opportunity.id)) {
      return true;
    }

    return false;
  }

  /**
   * Explains what changed and the root reason for the closure status.
   */
  public static formatClosureExplanation(
    status: ClosureAlertStatus,
    previousStatus: string,
    evidence?: string
  ): { whatChanged: string; reason: string } {
    const prev = previousStatus || 'OPEN_VERIFIED';

    switch (status) {
      case 'POSSIBLY_CLOSED':
        return {
          whatChanged: `Status changed from ${prev} to POSSIBLY_CLOSED.`,
          reason: evidence || 'Job requisition disappeared from 2 consecutive official ATS API scan cycles. The employer may have paused or closed applications.',
        };

      case 'CLOSED_EARLY_BY_PORTAL':
        return {
          whatChanged: `Status changed from ${prev} to CLOSED_EARLY_BY_PORTAL.`,
          reason: evidence || 'Requisition link was redirected directly to the employer portal homepage, signaling the posting closed early before its scheduled deadline.',
        };

      case 'REMOVED_BY_PORTAL':
        return {
          whatChanged: `Status changed from ${prev} to REMOVED_BY_PORTAL.`,
          reason: evidence || 'The official employer portal returned an HTTP 404 (Not Found) or HTTP 410 (Gone) response. The listing was officially taken down.',
        };

      case 'CANCELLED_OR_POSTPONED':
        return {
          whatChanged: `Status changed from ${prev} to CANCELLED_OR_POSTPONED.`,
          reason: evidence || 'Official Schema.org announcement or organizer update confirmed the recruitment cycle or event has been cancelled or postponed.',
        };
    }
  }

  /**
   * Creates an Alert Relay message conforming to Prompt 67 specifications.
   */
  public static createClosureAlertMessage(params: ClosureAlertDispatchParams): AlertEmailSimulation {
    const opp = params.opportunity;
    const now = params.detectedAt || Date.now();
    const newStatus = params.newStatus as ClosureAlertStatus;
    const prevStatus = params.previousStatus || 'OPEN_VERIFIED';

    const { whatChanged, reason } = this.formatClosureExplanation(
      newStatus,
      prevStatus,
      params.evidence
    );

    const detectedDate = new Date(now);
    const detectedAtFormatted = `${detectedDate.toUTCString()} (UTC)`;
    const timeAgo = formatTimeAgo(now);

    const companyName = opp.companyName || 'Employer Portal';
    const jobTitle = opp.title || 'Tracked Role';
    const domain = opp.companyDomain || `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

    const closureDetails: OpportunityClosureDetails = {
      previousStatus: prevStatus,
      newStatus,
      detectedAt: now,
      detectedAtFormatted,
      whatChanged: `${whatChanged} ${reason}`,
      evidence: params.evidence || reason,
    };

    const studentProfile = RadarEngine.getStudentProfile();
    const recipientEmail = params.recipientEmail || studentProfile.email || 'candidate@terrasynx.com';

    return {
      id: `eml_closure_${opp.id || 'opp'}_${now}`,
      type: 'closure_alert',
      tier: newStatus === 'REMOVED_BY_PORTAL' || newStatus === 'CANCELLED_OR_POSTPONED' ? 'neon' : 'slate',
      subject: `⚠️ [Closure Alert] ${companyName} (${jobTitle}): Marked ${newStatus.replace(/_/g, ' ')}`,
      recipientEmail,
      fromHeader: 'TERRASYNX Alert Relay <no-reply@terrasynx.com>',
      payloadSizeKb: 16.8,
      timestamp: now,
      jobId: opp.id || 'opp_closure',
      jobTitle,
      companyName,
      companyDomain: domain,
      actionUrl: opp.officialStatusTrackerUrl || opp.officialApplyUrl || '#',
      closureDetails,
      actionAdvisorPoints: [
        `What Changed: ${whatChanged} (Previous: ${prevStatus} ➔ New: ${newStatus}).`,
        `When Detected: Detected on ${detectedAtFormatted} (${timeAgo}).`,
        `Verification Evidence: ${closureDetails.evidence}`,
        `Candidate Advisory: If you have already submitted, monitor your official candidate portal tracker or follow up directly with your recruiter.`,
      ],
    };
  }

  /**
   * Inspects status transition on an opportunity.
   * If the opportunity is tracked and the status changed to one of the 4 closure statuses,
   * dispatches an Alert Relay message and saves it to user alert storage.
   */
  public static dispatchClosureAlertIfTracked(
    params: ClosureAlertDispatchParams
  ): { alertCreated: boolean; alert?: AlertEmailSimulation; reason?: string } {
    const newStatus = params.newStatus;
    const prevStatus = params.previousStatus;

    // 1. Verify target status is one of the 4 closure statuses
    if (!this.isClosureAlertStatus(newStatus)) {
      return { alertCreated: false, reason: `Status ${newStatus} is not a closure status` };
    }

    // 2. Verify status actually changed
    if (prevStatus && prevStatus === newStatus) {
      return { alertCreated: false, reason: 'Status unchanged' };
    }

    // 3. Verify user is tracking this opportunity
    const isTracked = this.isOpportunityTracked(params.opportunity);
    if (!isTracked) {
      return { alertCreated: false, reason: `Opportunity ${params.opportunity.id} is not tracked by the user` };
    }

    // 4. Create and dispatch the Alert Relay message
    const alert = this.createClosureAlertMessage(params);
    RadarEngine.addAlertEmail(alert);

    logger.info(
      'ClosureAlertService',
      `Closure Alert Relay message generated for tracked opportunity [${params.opportunity.id}]: ${newStatus}`
    );

    return { alertCreated: true, alert };
  }
}

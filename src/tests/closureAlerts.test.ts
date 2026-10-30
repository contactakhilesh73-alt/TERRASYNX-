import { describe, it, expect, beforeEach } from 'vitest';
import { ClosureAlertService, CLOSURE_ALERT_STATUSES } from '../services/closureAlertService';
import { RadarEngine } from '../services/radarEngine';
import { AppliedDossierService } from '../services/appliedDossierService';
import { AtsClosureDetectionService } from '../services/atsClosureDetectionService';
import { Opportunity, ApplicationStage } from '../types';

// In-memory mock for localStorage in headless test runner
const memoryStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => memoryStorage[key] ?? null,
  setItem: (key: string, value: string) => {
    memoryStorage[key] = String(value);
  },
  removeItem: (key: string) => {
    delete memoryStorage[key];
  },
  clear: () => {
    for (const key of Object.keys(memoryStorage)) {
      delete memoryStorage[key];
    }
  },
};
(globalThis as any).localStorage = mockLocalStorage;

describe('Prompt 67: Tracked Opportunity Closure Alerts', () => {
  const mockTrackedOpportunity: Opportunity = {
    id: 'opp_test_tracked_001',
    title: 'Distributed Systems Engineer Intern',
    companyName: 'Anthropic Labs',
    companyDomain: 'anthropic.com',
    companyLogo: 'https://logo.clearbit.com/anthropic.com',
    location: 'San Francisco, CA',
    department: 'Infrastructure',
    type: 'internship',
    workMode: 'hybrid',
    releasedAt: Date.now() - 3600000,
    deadlineAt: Date.now() + 86400000 * 14,
    stage: 'applied',
    isTracked: true,
    verification: {
      verified: true,
      rootDomain: 'anthropic.com',
      endpointUrl: 'https://api.greenhouse.io/v1/boards/anthropic/jobs/8821',
      lastCheckedTimestamp: Date.now(),
      sslStatus: 'A+',
      noFeeGuarantee: true,
      requisitionId: 'REQ-ANTH-8821',
      sourceType: 'greenhouse',
    },
    fitment: {
      overallScore: 92,
      overallGrade: 'A',
      dimensions: {
        roleFit: 92,
        skillsAlignment: 90,
        batchEligibility: 95,
        companyPrestige: 90,
        learningTrajectory: 90,
        compensationFairness: 90,
      },
      matchedSkills: ['Rust', 'Distributed Systems'],
      missingSkills: [],
      strategicVerdict: 'Strong fit for systems intern.',
    },
    compensation: {
      currency: 'USD',
      range: '$65 - $80 / hr',
      period: 'hourly',
      isPaid: true,
      transparentBenchmark: 'Levels.fyi $70/hr',
    },
    eligibility: {
      allowedGraduationYears: [2026, 2027],
      degrees: ['BS', 'B.Tech', 'MS'],
      undergradOnly: false,
      sponsorshipAvailable: true,
      locationsAllowed: ['United States', 'Remote'],
    },
    assessmentIntel: {
      hasHistoricalData: true,
      platform: 'HackerRank',
      durationMinutes: 90,
      frequentTopics: ['Distributed Systems', 'Raft'],
      difficulty: 'Hard',
    },
    officialApplyUrl: 'https://boards.greenhouse.io/anthropic/jobs/8821',
    description: 'Core infrastructure systems engineering',
  };

  const mockUntrackedOpportunity: Opportunity = {
    ...mockTrackedOpportunity,
    id: 'opp_test_untracked_002',
    stage: 'discovered',
    isTracked: false,
  };

  beforeEach(() => {
    mockLocalStorage.clear();
    AtsClosureDetectionService.resetTracking();
    RadarEngine.setOpportunities([mockTrackedOpportunity, mockUntrackedOpportunity]);
  });

  describe('Closure status validation', () => {
    it('recognizes all 4 Prompt 67 closure statuses', () => {
      expect(ClosureAlertService.isClosureAlertStatus('POSSIBLY_CLOSED')).toBe(true);
      expect(ClosureAlertService.isClosureAlertStatus('CLOSED_EARLY_BY_PORTAL')).toBe(true);
      expect(ClosureAlertService.isClosureAlertStatus('REMOVED_BY_PORTAL')).toBe(true);
      expect(ClosureAlertService.isClosureAlertStatus('CANCELLED_OR_POSTPONED')).toBe(true);
      expect(CLOSURE_ALERT_STATUSES.size).toBe(4);
    });

    it('rejects non-closure statuses', () => {
      expect(ClosureAlertService.isClosureAlertStatus('OPEN_VERIFIED')).toBe(false);
      expect(ClosureAlertService.isClosureAlertStatus('APPLICATION_EXPIRING_SOON')).toBe(false);
      expect(ClosureAlertService.isClosureAlertStatus('ACTIVE')).toBe(false);
      expect(ClosureAlertService.isClosureAlertStatus(undefined)).toBe(false);
    });
  });

  describe('Tracked opportunity determination', () => {
    it('identifies an opportunity with isTracked === true as tracked', () => {
      expect(ClosureAlertService.isOpportunityTracked({ id: 'any_id', isTracked: true })).toBe(true);
    });

    it('identifies an opportunity tracked via RadarEngine.trackOpportunity as tracked', () => {
      RadarEngine.trackOpportunity('custom_tracked_id', true);
      expect(ClosureAlertService.isOpportunityTracked({ id: 'custom_tracked_id' })).toBe(true);
    });

    it('identifies opportunities in active execution pipeline stages as tracked', () => {
      const activeStages: ApplicationStage[] = ['applied', 'assessment', 'interview', 'offer'];
      for (const stage of activeStages) {
        expect(ClosureAlertService.isOpportunityTracked({ id: `job_${stage}`, stage })).toBe(true);
      }
    });

    it('identifies opportunities with an applied dossier receipt as tracked', () => {
      // opp_stripe_sys_01 is seeded in AppliedDossierService
      expect(ClosureAlertService.isOpportunityTracked({ id: 'opp_stripe_sys_01' })).toBe(true);

      // Or when recorded via recordApplicationSubmission
      const mockReceipt: any = {
        confirmationId: 'CONF-TEST-999',
        sha256Hash: 'hash999',
        portalType: 'Greenhouse',
        submittedAt: Date.now(),
      };
      AppliedDossierService.recordApplicationSubmission(mockReceipt, {
        ...mockTrackedOpportunity,
        id: 'new_dossier_job_99',
      });
      expect(ClosureAlertService.isOpportunityTracked({ id: 'new_dossier_job_99' })).toBe(true);
    });

    it('identifies an unapplied discovered role without tracking flag as NOT tracked', () => {
      expect(ClosureAlertService.isOpportunityTracked({ id: 'untracked_job', stage: 'discovered', isTracked: false })).toBe(false);
    });
  });

  describe('Alert message content: what changed and when detected', () => {
    it('generates closure alert with what changed and when detected for POSSIBLY_CLOSED', () => {
      const testTimestamp = 1793000000000;
      const alert = ClosureAlertService.createClosureAlertMessage({
        opportunity: mockTrackedOpportunity,
        previousStatus: 'OPEN_VERIFIED',
        newStatus: 'POSSIBLY_CLOSED',
        evidence: 'Job disappeared from 2 consecutive ATS scan cycles.',
        detectedAt: testTimestamp,
      });

      expect(alert.type).toBe('closure_alert');
      expect(alert.subject).toContain('Closure Alert');
      expect(alert.subject).toContain('POSSIBLY CLOSED');
      expect(alert.closureDetails).toBeDefined();
      expect(alert.closureDetails?.newStatus).toBe('POSSIBLY_CLOSED');
      expect(alert.closureDetails?.previousStatus).toBe('OPEN_VERIFIED');
      expect(alert.closureDetails?.detectedAt).toBe(testTimestamp);
      expect(alert.closureDetails?.whatChanged).toContain('Status changed from OPEN_VERIFIED to POSSIBLY_CLOSED');
      expect(alert.closureDetails?.evidence).toContain('Job disappeared from 2 consecutive ATS scan cycles');

      // Check action advisor points explicitly mention what changed and when detected
      const whatChangedPoint = alert.actionAdvisorPoints?.find(p => p.startsWith('What Changed:'));
      const whenDetectedPoint = alert.actionAdvisorPoints?.find(p => p.startsWith('When Detected:'));
      expect(whatChangedPoint).toBeDefined();
      expect(whatChangedPoint).toContain('OPEN_VERIFIED ➔ New: POSSIBLY_CLOSED');
      expect(whenDetectedPoint).toBeDefined();
      expect(whenDetectedPoint).toContain('Detected on');
    });

    it('generates closure alert for CLOSED_EARLY_BY_PORTAL with homepage redirect evidence', () => {
      const testTimestamp = Date.now();
      const alert = ClosureAlertService.createClosureAlertMessage({
        opportunity: mockTrackedOpportunity,
        previousStatus: 'OPEN_VERIFIED',
        newStatus: 'CLOSED_EARLY_BY_PORTAL',
        evidence: 'HTTP 302 Redirect to /careers homepage received.',
        detectedAt: testTimestamp,
      });

      expect(alert.closureDetails?.newStatus).toBe('CLOSED_EARLY_BY_PORTAL');
      expect(alert.closureDetails?.whatChanged).toContain('CLOSED_EARLY_BY_PORTAL');
      expect(alert.closureDetails?.evidence).toContain('HTTP 302 Redirect');
    });

    it('generates closure alert for REMOVED_BY_PORTAL with HTTP 404/410 evidence', () => {
      const alert = ClosureAlertService.createClosureAlertMessage({
        opportunity: mockTrackedOpportunity,
        previousStatus: 'OPEN_VERIFIED',
        newStatus: 'REMOVED_BY_PORTAL',
        evidence: 'Endpoint returned HTTP 404 Not Found.',
      });

      expect(alert.closureDetails?.newStatus).toBe('REMOVED_BY_PORTAL');
      expect(alert.closureDetails?.whatChanged).toContain('REMOVED_BY_PORTAL');
      expect(alert.closureDetails?.evidence).toContain('404');
    });

    it('generates closure alert for CANCELLED_OR_POSTPONED with Schema.org eventStatus evidence', () => {
      const alert = ClosureAlertService.createClosureAlertMessage({
        opportunity: mockTrackedOpportunity,
        previousStatus: 'OPEN_VERIFIED',
        newStatus: 'CANCELLED_OR_POSTPONED',
        evidence: 'JSON-LD schema eventStatus: EventCancelled detected.',
      });

      expect(alert.closureDetails?.newStatus).toBe('CANCELLED_OR_POSTPONED');
      expect(alert.closureDetails?.whatChanged).toContain('CANCELLED_OR_POSTPONED');
      expect(alert.closureDetails?.evidence).toContain('EventCancelled');
    });
  });

  describe('Dispatching rules and invariants', () => {
    it('dispatches alert to RadarEngine storage when tracked opportunity changes status', () => {
      const res = ClosureAlertService.dispatchClosureAlertIfTracked({
        opportunity: mockTrackedOpportunity,
        previousStatus: 'OPEN_VERIFIED',
        newStatus: 'CLOSED_EARLY_BY_PORTAL',
        evidence: 'Requisition URL redirected to index page.',
      });

      expect(res.alertCreated).toBe(true);
      expect(res.alert).toBeDefined();

      const emails = RadarEngine.getSimulatedEmails();
      expect(emails.some(e => e.id === res.alert?.id)).toBe(true);
      expect(emails.find(e => e.id === res.alert?.id)?.type).toBe('closure_alert');
    });

    it('does NOT dispatch alert when opportunity is untracked', () => {
      const res = ClosureAlertService.dispatchClosureAlertIfTracked({
        opportunity: mockUntrackedOpportunity,
        previousStatus: 'OPEN_VERIFIED',
        newStatus: 'CLOSED_EARLY_BY_PORTAL',
      });

      expect(res.alertCreated).toBe(false);
      expect(res.reason).toContain('not tracked');
    });

    it('does NOT dispatch alert when status is unchanged', () => {
      const res = ClosureAlertService.dispatchClosureAlertIfTracked({
        opportunity: mockTrackedOpportunity,
        previousStatus: 'POSSIBLY_CLOSED',
        newStatus: 'POSSIBLY_CLOSED',
      });

      expect(res.alertCreated).toBe(false);
      expect(res.reason).toContain('Status unchanged');
    });

    it('does NOT dispatch alert for non-closure status transitions', () => {
      const res = ClosureAlertService.dispatchClosureAlertIfTracked({
        opportunity: mockTrackedOpportunity,
        previousStatus: 'OPEN_VERIFIED',
        newStatus: 'APPLICATION_EXPIRING_SOON',
      });

      expect(res.alertCreated).toBe(false);
      expect(res.reason).toContain('not a closure status');
    });
  });

  describe('Integration with RadarEngine.updateOpportunityVerification', () => {
    it('triggers closure alert when updateOpportunityVerification updates a tracked opportunity', () => {
      RadarEngine.trackOpportunity(mockTrackedOpportunity.id, true);

      RadarEngine.updateOpportunityVerification(
        mockTrackedOpportunity.id,
        'REMOVED_BY_PORTAL',
        'Direct check yielded HTTP 410 Gone',
        Date.now()
      );

      const emails = RadarEngine.getSimulatedEmails();
      const closureAlert = emails.find(e => e.jobId === mockTrackedOpportunity.id && e.type === 'closure_alert');
      expect(closureAlert).toBeDefined();
      expect(closureAlert?.closureDetails?.newStatus).toBe('REMOVED_BY_PORTAL');
      expect(closureAlert?.closureDetails?.evidence).toContain('HTTP 410 Gone');
    });
  });

  describe('Integration with AtsClosureDetectionService', () => {
    it('dispatches closure alert when an existing tracked job is missing from 2 consecutive scans', () => {
      const atsTrackedJob: Opportunity = {
        ...mockTrackedOpportunity,
        id: 'live_gh_anthropic_9999',
        stage: 'applied',
        isTracked: true,
        consecutiveMissingFetches: 1, // already missing once
        possiblyClosed: false,
        closureStatus: 'ACTIVE',
        verification: {
          ...mockTrackedOpportunity.verification,
          sourceType: 'greenhouse',
        },
      };

      // In this cycle, the job is missing again (empty fresh jobs for this company)
      const { mergedOpportunities } = AtsClosureDetectionService.processFetchCycle(
        [atsTrackedJob],
        [],
        { companyKeys: ['anthropic.com'] }
      );

      const updatedJob = mergedOpportunities.find(j => j.id === atsTrackedJob.id);
      expect(updatedJob?.possiblyClosed).toBe(true);
      expect(updatedJob?.closureStatus).toBe('POSSIBLY_CLOSED');

      // Verify closure alert was stored
      const emails = RadarEngine.getSimulatedEmails();
      const alert = emails.find(e => e.jobId === atsTrackedJob.id && e.type === 'closure_alert');
      expect(alert).toBeDefined();
      expect(alert?.closureDetails?.newStatus).toBe('POSSIBLY_CLOSED');
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RecruiterRadarService } from '../services/recruiterRadarService';
import { VerificationEngine } from '../services/verificationEngine';
import { FastApplyService } from '../services/fastApplyService';
import { OfferEvaluationEngine } from '../services/offerEvaluationEngine';
import { RadarEngine, DEFAULT_STUDENT_PROFILE } from '../services/radarEngine';
import { Opportunity } from '../types';

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

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
}

if (typeof globalThis.window === 'undefined') {
  Object.defineProperty(globalThis, 'window', {
    value: globalThis,
    writable: true,
  });
}

if (globalThis.window && typeof globalThis.window.localStorage === 'undefined') {
  Object.defineProperty(globalThis.window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
}

// Sample authentic opportunity structure for testing
const testOpportunity: Opportunity = {
  id: 'opp_test_guardrail_01',
  companyName: 'OpenAI',
  companyLogo: 'openai',
  companyDomain: 'openai.com',
  title: 'Software Engineer Intern, Systems',
  type: 'internship',
  workMode: 'on-site',
  location: 'San Francisco, CA',
  department: 'Systems & Infrastructure',
  officialApplyUrl: 'https://boards.greenhouse.io/openai/jobs/test01',
  officialStatusTrackerUrl: 'https://boards.greenhouse.io/openai/jobs/test01',
  releasedAt: Date.now() - 86400000,
  deadlineAt: Date.now() + 864000000,
  verification: {
    verified: true,
    sourceType: 'greenhouse',
    requisitionId: 'REQ-OPENAI-TEST-01',
    rootDomain: 'openai.com',
    endpointUrl: 'https://boards.greenhouse.io/openai/jobs/test01',
    sslStatus: 'VALID',
    noFeeGuarantee: true,
    lastCheckedTimestamp: Date.now(),
  },
  eligibility: {
    allowedGraduationYears: [2025, 2026],
    degrees: ['B.Tech', 'BS', 'MS'],
    undergradOnly: false,
    sponsorshipAvailable: true,
    locationsAllowed: ['United States'],
  },
  compensation: {
    currency: 'USD',
    range: '$65 / hr',
    period: 'hourly',
    isPaid: true,
    transparentBenchmark: 'Levels.fyi 2026 Intern Index',
  },
  fitment: {
    overallScore: 92,
    overallGrade: 'A',
    dimensions: {
      roleFit: 90,
      skillsAlignment: 95,
      batchEligibility: 100,
      companyPrestige: 98,
      learningTrajectory: 95,
      compensationFairness: 90,
    },
    missingSkills: [],
    matchedSkills: ['TypeScript', 'Distributed Systems'],
    strategicVerdict: 'Strong alignment with candidate profile.',
  },
  assessmentIntel: {
    hasHistoricalData: true,
    platform: 'CodeSignal',
    durationMinutes: 90,
    frequentTopics: ['Algorithms', 'System Design'],
    difficulty: 'Hard',
  },
  stage: 'discovered',
};

describe('Trust-Critical Guardrails & Regression Tests', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.restoreAllMocks();
  });

  /**
   * 1. RECRUITER RADAR SERVICE GUARANTEE
   * Strict Zero-Fake Policy: CANONICAL_RECRUITERS must permanently remain empty ([]).
   * Regression Guard: Prevents hardcoded/placeholder recruiters from creeping back.
   */
  describe('Guardrail 1: RecruiterRadarService (Zero Fake Data)', () => {
    it('guarantees CANONICAL_RECRUITERS is strictly an empty array', () => {
      expect(RecruiterRadarService.CANONICAL_RECRUITERS).toBeDefined();
      expect(Array.isArray(RecruiterRadarService.CANONICAL_RECRUITERS)).toBe(true);
      expect(RecruiterRadarService.CANONICAL_RECRUITERS.length).toBe(0);
      expect(RecruiterRadarService.CANONICAL_RECRUITERS).toEqual([]);
    });

    it('returns empty array when candidate has not added any custom recruiters', () => {
      const recruiters = RecruiterRadarService.getRecruiters();
      expect(Array.isArray(recruiters)).toBe(true);
      expect(recruiters.length).toBe(0);
      expect(recruiters).toEqual([]);
    });

    it('automatically purges any legacy demo/fake recruiter IDs if present in storage', () => {
      const dirtyLegacyContacts = [
        { id: 'rec_stripe_01', name: 'Fake Recruiter' },
        { id: 'rec_google_01', name: 'Demo Contact' },
      ];
      mockLocalStorage.setItem('terrasynx_recruiter_radar_nodes_v1', JSON.stringify(dirtyLegacyContacts));

      const cleanList = RecruiterRadarService.getRecruiters();
      expect(cleanList).toEqual([]);
    });
  });

  /**
   * 2. VERIFICATION ENGINE GUARANTEE
   * Fail-Closed Guarantee: When DNS checks fail, throw, or return invalid status,
   * verified must ALWAYS be false, NEVER true.
   */
  describe('Guardrail 2: VerificationEngine (Fail-Closed Security Guarantee)', () => {
    it('returns verified: false and checkFailed: true when DNS endpoint encounters network error or throws', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('DNS Resolution Timeout'));

      const result = await VerificationEngine.verifyLiveDns('openai.com');
      expect(result.verified).toBe(false);
      expect(result.checkFailed).toBe(true);
      expect(result.ips).toEqual([]);
    });

    it('returns verified: false when DNS endpoint returns HTTP 500 or non-ok response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal DNS Resolver Failure' }),
      } as Response);

      const result = await VerificationEngine.verifyLiveDns('openai.com');
      expect(result.verified).toBe(false);
      expect(result.checkFailed).toBe(true);
    });

    it('guarantees auditOpportunity fails closed (passedAllLayers: false, score: 0) if DNS check fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network unreachable'));

      const report = await VerificationEngine.auditOpportunity(testOpportunity);
      expect(report.passedAllLayers).toBe(false);
      expect(report.checkFailed).toBe(true);
      expect(report.securityScore).toBe(0);
      expect(report.layers.layer1DnsStatus).toBe('CHECK_UNAVAILABLE');
    });

    it('never allows domain mismatch to pass verification', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ verified: true, resolvedIps: ['104.18.22.18'] }),
      } as Response);

      const spoofedOpp: Opportunity = {
        ...testOpportunity,
        companyDomain: 'phishing-openai.com',
        verification: {
          ...testOpportunity.verification,
          rootDomain: 'openai.com', // mismatch
        },
      };

      const report = await VerificationEngine.auditOpportunity(spoofedOpp);
      expect(report.passedAllLayers).toBe(false);
      expect(report.layers.layer1DnsStatus).toBe('FAILED_DOMAIN_MISMATCH');
    });
  });

  /**
   * 3. FAST APPLY SERVICE GUARANTEE
   * Student Autonomy & Anti-Deception:
   * prepareApplicationPayload() must NEVER transition job stage to 'applied' and must NEVER save receipts.
   * ONLY confirmStudentSubmission() explicitly sets 'applied' stage and produces receipts.
   */
  describe('Guardrail 3: FastApplyService (Mandatory Student Submission Gate)', () => {
    it('prepareApplicationPayload does NOT update stage to applied and does NOT save receipts', async () => {
      const initialReceipts = FastApplyService.getReceipts();
      expect(initialReceipts.length).toBe(0);

      // Prepare payload
      const payload = await FastApplyService.prepareApplicationPayload(
        testOpportunity,
        DEFAULT_STUDENT_PROFILE,
        {
          workAuthConfirmed: true,
          sponsorshipStatus: 'Authorized to work without sponsorship',
          batchYearConfirmed: true,
          locationConsent: true,
        }
      );

      // Verified: Payload contains prepared details
      expect(payload).toBeDefined();
      expect(payload.opportunityId).toBe(testOpportunity.id);
      expect(payload.candidateName).toBe(DEFAULT_STUDENT_PROFILE.fullName);

      // Guardrail Check: Still 0 receipts saved
      const receiptsAfterPrepare = FastApplyService.getReceipts();
      expect(receiptsAfterPrepare.length).toBe(0);

      // Guardrail Check: Opportunity passed into preparer was NOT mutated to 'applied'
      expect(testOpportunity.stage).toBe('discovered');
    });

    it('ONLY confirmStudentSubmission transitions stage to applied and records immutable receipt', async () => {
      const receipt = await FastApplyService.confirmStudentSubmission(
        testOpportunity,
        DEFAULT_STUDENT_PROFILE,
        { sponsorshipStatus: 'Authorized to work without sponsorship' },
        'Akhilesh_Singh_Tailored.pdf',
        2.5
      );

      // Receipt must be created with student self-reported confirmation
      expect(receipt).toBeDefined();
      expect(receipt.selfConfirmedByStudent).toBe(true);
      expect(receipt.status).toBe('confirmed');
      expect(receipt.confirmationId).toMatch(/^STU-CONF-/);

      // Receipt must now exist in persistent store
      const receipts = FastApplyService.getReceipts();
      expect(receipts.length).toBe(1);
      expect(receipts[0].confirmationId).toBe(receipt.confirmationId);
    });
  });

  /**
   * 4. OFFER EVALUATION ENGINE GUARANTEE
   * Zero Fake Offers: getInitialCandidateOffers() must always return an empty array ([]).
   */
  describe('Guardrail 4: OfferEvaluationEngine (Zero Hardcoded Demo Offers)', () => {
    it('guarantees getInitialCandidateOffers is strictly an empty array', () => {
      const initialOffers = OfferEvaluationEngine.getInitialCandidateOffers();
      expect(Array.isArray(initialOffers)).toBe(true);
      expect(initialOffers.length).toBe(0);
      expect(initialOffers).toEqual([]);
    });

    it('guarantees getSavedOffers returns empty array when no candidate offers have been logged', () => {
      const savedOffers = OfferEvaluationEngine.getSavedOffers();
      expect(Array.isArray(savedOffers)).toBe(true);
      expect(savedOffers.length).toBe(0);
      expect(savedOffers).toEqual([]);
    });

    it('automatically purges any legacy demo offers if found in storage', () => {
      const legacyMockOffers = [
        { id: 'off_stripe_swe_2026', companyName: 'Stripe', roleTitle: 'SWE' },
        { id: 'off_openai_mts_2026', companyName: 'OpenAI', roleTitle: 'MTS' },
      ];
      mockLocalStorage.setItem('terrasynx_candidate_offers_v1', JSON.stringify(legacyMockOffers));

      const cleanedOffers = OfferEvaluationEngine.getSavedOffers();
      expect(cleanedOffers).toEqual([]);
    });
  });
});

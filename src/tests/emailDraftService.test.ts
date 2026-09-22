import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailDraftService } from '../services/emailDraftService';
import { Opportunity, StudentProfile } from '../types';

// Mock localStorage for test environment
const mockStorage: Record<string, string> = {};
const testLocalStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = String(val);
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k of Object.keys(mockStorage)) delete mockStorage[k];
  },
};

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: testLocalStorage,
    writable: true,
  });
}

const mockProfile: StudentProfile = {
  id: 'usr_stud_2026_test',
  fullName: 'Arjun Sharma',
  email: 'arjun.sharma@iitb.ac.in',
  phoneNumber: '+91 98765 43210',
  collegeName: 'IIT Bombay',
  degree: 'B.Tech in Computer Science',
  graduationYear: 2026,
  currentCgpa: '9.2 / 10.0',
  targetBatch: [2026],
  primarySkills: ['TypeScript', 'React', 'Go', 'Distributed Systems'],
  secondarySkills: ['PostgreSQL', 'Docker', 'Kubernetes', 'Redis'],
  projects: [
    {
      id: 'proj_01',
      title: 'GeoDistributed Key-Value Store',
      techStack: ['Go', 'Raft Consensus', 'gRPC'],
      description: 'Engineered a consensus-backed distributed KV store supporting 25k ops/sec.',
      metricsAchieved: 'Reduced tail latency by 38% under partition conditions.',
    },
  ],
  githubUrl: 'https://github.com/arjunsharma',
  linkedinUrl: 'https://linkedin.com/in/arjunsharma',
  preferredRoles: ['Software Engineer', 'Systems Engineer'],
  preferredWorkMode: 'remote',
  targetLocations: ['Bengaluru', 'Remote'],
  workAuthorization: 'India / APAC Domestic Only',
  emailAlertsEnabled: true,
  dailyDigestTime: 'morning',
  urgentAlertThresholdHours: 72,
};

const mockOpportunity: Opportunity = {
  id: 'opp_stripe_sys_2026',
  companyName: 'Stripe',
  companyLogo: 'https://stripe.com/favicon.ico',
  companyDomain: 'stripe.com',
  title: 'Software Engineer - Infrastructure',
  department: 'Core Infrastructure',
  type: 'full-time',
  workMode: 'remote',
  location: 'Bengaluru / Remote',
  officialApplyUrl: 'https://stripe.com/jobs/req_infrastructure_2026',
  releasedAt: Date.now() - 3600000,
  deadlineAt: Date.now() + 86400000 * 7,
  stage: 'discovered',
  description: 'Join the Infrastructure Core team at Stripe building distributed telemetry and low-latency storage pipelines.',
  compensation: {
    currency: 'INR',
    range: '₹32,00,000 / year',
    period: 'annual',
    isPaid: true,
    transparentBenchmark: 'Levels.fyi verified benchmark',
  },
  eligibility: {
    allowedGraduationYears: [2026],
    degrees: ['B.Tech in Computer Science', 'M.Tech in CS'],
    undergradOnly: false,
    sponsorshipAvailable: true,
    locationsAllowed: ['India', 'Remote APAC'],
  },
  fitment: {
    overallScore: 95,
    overallGrade: 'A+',
    dimensions: {
      roleFit: 96,
      skillsAlignment: 94,
      batchEligibility: 100,
      companyPrestige: 95,
      learningTrajectory: 92,
      compensationFairness: 90,
    },
    matchedSkills: ['Go', 'Distributed Systems', 'TypeScript'],
    missingSkills: [],
    strategicVerdict: 'Direct skill overlap in Go & Distributed Systems.',
  },
  verification: {
    verified: true,
    sourceType: 'greenhouse',
    rootDomain: 'stripe.com',
    endpointUrl: 'https://boards.greenhouse.io/stripe/jobs/123456',
    lastCheckedTimestamp: Date.now(),
    sslStatus: 'A+',
    noFeeGuarantee: true,
    requisitionId: 'REQ-STRIPE-8910',
  },
  assessmentIntel: {
    hasHistoricalData: true,
    platform: 'Custom Take-Home',
    durationMinutes: 90,
    frequentTopics: ['Distributed Systems', 'Concurrency'],
    difficulty: 'Hard',
  },
};

describe('EmailDraftService (Outreach & Referral Intelligence)', () => {
  beforeEach(() => {
    testLocalStorage.clear();
    vi.restoreAllMocks();
  });

  describe('synthesizeAlgorithmicDraft', () => {
    it('generates a high-converting referral request email for campus alumni', () => {
      const draft = EmailDraftService.synthesizeAlgorithmicDraft(
        mockOpportunity,
        mockProfile,
        'referral-request',
        'alumni'
      );

      expect(draft.type).toBe('referral-request');
      expect(draft.recipientPersona).toBe('alumni');
      expect(draft.subject).toContain('IIT Bombay');
      expect(draft.subject).toContain('Referral Inquiry');
      expect(draft.subject).toContain('Stripe');
      expect(draft.body).toContain('Arjun Sharma');
      expect(draft.body).toContain('IIT Bombay');
      expect(draft.body).toContain('GeoDistributed Key-Value Store');
      expect(draft.body).toContain('Go, Raft Consensus, gRPC');
      expect(draft.attachmentChecklist.length).toBeGreaterThanOrEqual(2);
      expect(draft.followUpAdvice).toBeTruthy();
    });

    it('generates a crisp cold outreach email highlighting project evidence', () => {
      const draft = EmailDraftService.synthesizeAlgorithmicDraft(
        mockOpportunity,
        mockProfile,
        'cold-outreach',
        'recruiter'
      );

      expect(draft.type).toBe('cold-outreach');
      expect(draft.subject).toContain('Software Engineer - Infrastructure');
      expect(draft.subject).toContain('Arjun Sharma');
      expect(draft.body).toContain('Stripe');
      expect(draft.body).toContain('GeoDistributed Key-Value Store');
      expect(draft.body).toContain('arjun.sharma@iitb.ac.in');
      expect(draft.attachmentChecklist).toContain('Tailored 1-page PDF Resume (Verified contact info & relevant skills highlighted)');
      expect(draft.followUpAdvice).toContain('Cold emails');
    });

    it('generates a targeted checklist of attachments anchored to job and student profile', () => {
      const checklist = EmailDraftService.getDefaultAttachmentChecklist(mockOpportunity, mockProfile);
      expect(checklist.some(i => i.includes('Resume'))).toBe(true);
      expect(checklist.some(i => i.includes(mockOpportunity.officialApplyUrl))).toBe(true);
      expect(checklist.some(i => i.includes('GitHub'))).toBe(true);
      expect(checklist.some(i => i.includes('Transcript'))).toBe(true);
    });
  });

  describe('Local Draft Persistence (Safe, Zero Auto-Send)', () => {
    it('saves, retrieves, checks existence, and deletes email drafts safely', () => {
      const initialDraft = EmailDraftService.synthesizeAlgorithmicDraft(
        mockOpportunity,
        mockProfile,
        'referral-request',
        'alumni'
      );

      // Verify no draft initially
      expect(EmailDraftService.hasSavedDraft(mockOpportunity.id, 'referral-request')).toBe(false);

      // Save draft
      initialDraft.subject = 'Customized Subject Line by Arjun';
      EmailDraftService.saveDraft(mockOpportunity.id, initialDraft);

      expect(EmailDraftService.hasSavedDraft(mockOpportunity.id, 'referral-request')).toBe(true);
      const retrieved = EmailDraftService.getSavedDraft(mockOpportunity.id, 'referral-request');
      expect(retrieved?.subject).toBe('Customized Subject Line by Arjun');

      // Delete draft
      EmailDraftService.deleteDraft(mockOpportunity.id, 'referral-request');
      expect(EmailDraftService.hasSavedDraft(mockOpportunity.id, 'referral-request')).toBe(false);
    });

    it('isolates drafts by draft type (referral-request vs cold-outreach)', () => {
      const refDraft = EmailDraftService.synthesizeAlgorithmicDraft(mockOpportunity, mockProfile, 'referral-request');
      const coldDraft = EmailDraftService.synthesizeAlgorithmicDraft(mockOpportunity, mockProfile, 'cold-outreach');

      EmailDraftService.saveDraft(mockOpportunity.id, refDraft);
      EmailDraftService.saveDraft(mockOpportunity.id, coldDraft);

      const retrievedRef = EmailDraftService.getSavedDraft(mockOpportunity.id, 'referral-request');
      const retrievedCold = EmailDraftService.getSavedDraft(mockOpportunity.id, 'cold-outreach');

      expect(retrievedRef?.type).toBe('referral-request');
      expect(retrievedCold?.type).toBe('cold-outreach');
    });
  });

  describe('Network Failure & Autonomous Fallback', () => {
    it('gracefully falls back to algorithmic draft when API call fails or times out', async () => {
      // Simulate network outage
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network connection timeout')));

      const result = await EmailDraftService.generateEmailDraft(
        mockOpportunity,
        mockProfile,
        'referral-request',
        'alumni',
        undefined,
        true
      );

      expect(result.success).toBe(true);
      expect(result.source).toBe('algorithmic-synthesis');
      expect(result.draft.body).toContain('Arjun Sharma');
      expect(result.draft.body).toContain('Stripe');
    });

    it('uses server AI response when API returns success', async () => {
      const mockServerDraft = {
        type: 'referral-request',
        recipientPersona: 'alumni',
        subject: 'IIT Bombay Alum | Inquiry about Stripe Infrastructure Role',
        body: 'Hi Alum, hope all is well! I am Arjun Sharma from IIT Bombay...',
        attachmentChecklist: ['Tailored Resume', 'Job Link'],
        keyHooks: ['Raft consensus KV store'],
        followUpAdvice: 'Follow up in 5 days.'
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          draft: mockServerDraft,
          source: 'gemini-3.8-flash'
        })
      }));

      const result = await EmailDraftService.generateEmailDraft(
        mockOpportunity,
        mockProfile,
        'referral-request',
        'alumni',
        undefined,
        true
      );

      expect(result.success).toBe(true);
      expect(result.source).toBe('gemini-3.8-flash');
      expect(result.draft.subject).toBe(mockServerDraft.subject);
      expect(result.draft.body).toBe(mockServerDraft.body);
    });
  });

  describe('Student Agency & Strict Safety Constraint', () => {
    it('does not alter candidate application stage or mutate opportunity object', async () => {
      const initialStage = mockOpportunity.stage;
      await EmailDraftService.generateEmailDraft(mockOpportunity, mockProfile, 'referral-request');
      expect(mockOpportunity.stage).toBe(initialStage);
    });
  });
});

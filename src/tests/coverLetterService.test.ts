import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CoverLetterService } from '../services/coverLetterService';
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
  title: 'Software Engineer, Infrastructure & Core Systems',
  department: 'Core Infrastructure',
  type: 'internship',
  workMode: 'remote',
  location: 'Remote, US / APAC',
  officialApplyUrl: 'https://stripe.com/jobs/infrastructure-swe',
  releasedAt: Date.now() - 3600000,
  deadlineAt: Date.now() + 86400000 * 7,
  stage: 'discovered',
  compensation: {
    currency: 'USD',
    range: '$150k - $165k',
    period: 'annual',
    isPaid: true,
    transparentBenchmark: 'Levels.fyi verified benchmark',
  },
  fitment: {
    overallScore: 94,
    overallGrade: 'A+',
    dimensions: {
      roleFit: 96,
      skillsAlignment: 94,
      batchEligibility: 100,
      companyPrestige: 95,
      learningTrajectory: 92,
      compensationFairness: 90,
    },
    missingSkills: [],
    matchedSkills: ['Distributed Systems', 'Go', 'High Throughput Architecture'],
    strategicVerdict: 'Outstanding infrastructure candidate with verified consensus engineering background.',
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
  eligibility: {
    allowedGraduationYears: [2026],
    degrees: ['B.Tech', 'BS', 'MS'],
    undergradOnly: false,
    sponsorshipAvailable: true,
    locationsAllowed: ['US', 'Remote', 'India'],
  },
  assessmentIntel: {
    hasHistoricalData: true,
    platform: 'Custom Take-Home',
    durationMinutes: 90,
    frequentTopics: ['Distributed Systems', 'Concurrency', 'State Machines'],
    difficulty: 'Hard',
  },
};

describe('CoverLetterService (Personalized Cover Letter Intelligence)', () => {
  beforeEach(() => {
    testLocalStorage.clear();
    vi.restoreAllMocks();
  });

  it('synthesizes a high-quality algorithmic draft personalized with student profile and real JD', () => {
    const draft = CoverLetterService.synthesizeAlgorithmicDraft(mockOpportunity, mockProfile);

    // Verifies candidate details are included
    expect(draft).toContain('Arjun Sharma');
    expect(draft).toContain('arjun.sharma@iitb.ac.in');
    expect(draft).toContain('IIT Bombay');
    expect(draft).toContain('2026');

    // Verifies company and target role
    expect(draft).toContain('Stripe');
    expect(draft).toContain('Software Engineer, Infrastructure & Core Systems');

    // Verifies real project integration
    expect(draft).toContain('GeoDistributed Key-Value Store');
    expect(draft).toContain('Go');

    // Verifies matched skills
    expect(draft).toContain('Distributed Systems');
  });

  it('persists, retrieves, and checks saved drafts correctly in localStorage', () => {
    expect(CoverLetterService.hasSavedDraft(mockOpportunity.id)).toBe(false);

    const customText = 'Dear Stripe Team, this is my custom edited cover letter.';
    CoverLetterService.saveDraft(mockOpportunity.id, customText);

    expect(CoverLetterService.hasSavedDraft(mockOpportunity.id)).toBe(true);
    expect(CoverLetterService.getSavedDraft(mockOpportunity.id)).toBe(customText);

    CoverLetterService.deleteDraft(mockOpportunity.id);
    expect(CoverLetterService.hasSavedDraft(mockOpportunity.id)).toBe(false);
  });

  it('returns saved draft on subsequent calls unless forceFresh is requested', async () => {
    const savedDraft = 'My preserved customized draft for Stripe application.';
    CoverLetterService.saveDraft(mockOpportunity.id, savedDraft);

    const result = await CoverLetterService.generateCoverLetter(mockOpportunity, mockProfile, undefined, false);
    expect(result.success).toBe(true);
    expect(result.source).toBe('saved-draft');
    expect(result.coverLetter).toBe(savedDraft);
  });

  it('falls back gracefully to algorithmic synthesis if network fetch fails', async () => {
    // Mock global fetch to simulate offline or network error
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network unreachable'));

    const result = await CoverLetterService.generateCoverLetter(mockOpportunity, mockProfile, undefined, true);

    expect(result.success).toBe(true);
    expect(result.source).toBe('algorithmic-synthesis');
    expect(result.coverLetter).toContain('Stripe');
    expect(result.coverLetter).toContain('Arjun Sharma');

    fetchSpy.mockRestore();
  });

  it('strictly preserves student agency: does NOT alter opportunity stage or auto-submit', async () => {
    const originalStage = mockOpportunity.stage;
    await CoverLetterService.generateCoverLetter(mockOpportunity, mockProfile);

    // Opportunity stage must strictly remain untouched ('discovered')
    expect(mockOpportunity.stage).toBe(originalStage);
  });
});

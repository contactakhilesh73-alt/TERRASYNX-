import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TelemetryAnalyticsService } from '../services/telemetryAnalyticsService';
import { Opportunity, StudentProfile } from '../types';
import { AppliedDossierService } from '../services/appliedDossierService';
import { FastApplyService } from '../services/fastApplyService';

// Mock localStorage for test isolation
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
  id: 'usr_stud_telemetry_test',
  fullName: 'Arjun Sharma',
  email: 'arjun@example.com',
  phoneNumber: '+1 555 123 4567',
  collegeName: 'UC Berkeley',
  degree: 'B.S. in Computer Science',
  graduationYear: 2026,
  currentCgpa: '3.9 / 4.0',
  targetBatch: [2026],
  primarySkills: ['Go', 'Distributed Systems', 'TypeScript', 'Kubernetes'],
  secondarySkills: ['PostgreSQL', 'Docker', 'Redis'],
  projects: [],
  githubUrl: 'https://github.com/arjunsharma',
  linkedinUrl: 'https://linkedin.com/in/arjunsharma',
  preferredRoles: ['Systems Engineer', 'Backend Engineer'],
  preferredWorkMode: 'remote',
  targetLocations: ['San Francisco', 'Remote'],
  workAuthorization: 'US Citizen / Green Card',
  emailAlertsEnabled: true,
  dailyDigestTime: 'morning',
  urgentAlertThresholdHours: 72,
};

const createMockOpp = (
  id: string,
  companyName: string,
  title: string,
  stage: Opportunity['stage'],
  missingSkills: string[] = [],
  releasedAtOffsetHours = 48
): Opportunity => ({
  id,
  companyName,
  companyLogo: 'https://logo.clearbit.com/stripe.com',
  companyDomain: `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
  title,
  department: 'Engineering',
  type: 'internship',
  workMode: 'remote',
  location: 'Remote',
  officialApplyUrl: `https://${companyName.toLowerCase()}.com/careers/1`,
  releasedAt: Date.now() - (releasedAtOffsetHours * 3600000),
  deadlineAt: Date.now() + 86400000 * 7,
  stage,
  compensation: {
    currency: 'USD',
    range: '$140k - $160k',
    period: 'annual',
    isPaid: true,
    transparentBenchmark: 'Levels.fyi benchmark',
  },
  fitment: {
    overallScore: 90,
    overallGrade: 'A',
    dimensions: {
      roleFit: 90,
      skillsAlignment: 88,
      batchEligibility: 100,
      companyPrestige: 90,
      learningTrajectory: 90,
      compensationFairness: 90,
    },
    missingSkills,
    matchedSkills: ['Go', 'Distributed Systems'],
    strategicVerdict: 'Good alignment.',
  },
  verification: {
    verified: true,
    sourceType: 'greenhouse',
    rootDomain: `${companyName.toLowerCase()}.com`,
    endpointUrl: 'https://boards.greenhouse.io',
    lastCheckedTimestamp: Date.now(),
    sslStatus: 'A+',
    noFeeGuarantee: true,
    requisitionId: `REQ-${id}`,
  },
  eligibility: {
    allowedGraduationYears: [2026],
    degrees: ['BS'],
    undergradOnly: false,
    sponsorshipAvailable: true,
    locationsAllowed: ['US', 'Remote'],
  },
  assessmentIntel: {
    hasHistoricalData: false,
    platform: 'Custom Take-Home',
    durationMinutes: 60,
    frequentTopics: ['Algorithms'],
    difficulty: 'Medium',
  },
});

describe('TelemetryAnalyticsService (Genuine Pattern Analysis & No Hardcoded Data)', () => {
  beforeEach(() => {
    testLocalStorage.clear();
    vi.restoreAllMocks();
  });

  it('genuinely computes speed-to-apply velocity from actual applied record timestamps', () => {
    const opp1 = createMockOpp('opp_stripe_01', 'Stripe', 'Distributed Systems Engineer', 'applied', [], 24);
    const opp2 = createMockOpp('opp_datadog_02', 'Datadog', 'Backend Systems Engineer', 'applied', [], 48);

    // Mock applied records where apply time was 4 hours after discovery for opp1, 10 hours for opp2
    vi.spyOn(AppliedDossierService, 'getAppliedRecords').mockReturnValue([
      {
        opportunityId: 'opp_stripe_01',
        companyName: 'Stripe',
        jobTitle: 'Distributed Systems Engineer',
        companyDomain: 'stripe.com',
        appliedTimestamp: opp1.releasedAt + (4 * 3600000), // 4h
        confirmationId: 'CONF-1',
        sha256Proof: 'token1',
        portalType: 'Greenhouse',
        workAuthClaimed: 'US Citizen',
        resumePersonaUsed: 'Systems',
        currentStage: 'applied',
        officialApplyUrl: opp1.officialApplyUrl,
      },
      {
        opportunityId: 'opp_datadog_02',
        companyName: 'Datadog',
        jobTitle: 'Backend Systems Engineer',
        companyDomain: 'datadoghq.com',
        appliedTimestamp: opp2.releasedAt + (10 * 3600000), // 10h
        confirmationId: 'CONF-2',
        sha256Proof: 'token2',
        portalType: 'Greenhouse',
        workAuthClaimed: 'US Citizen',
        resumePersonaUsed: 'Systems',
        currentStage: 'applied',
        officialApplyUrl: opp2.officialApplyUrl,
      },
    ]);

    const telemetry = TelemetryAnalyticsService.computeTelemetry([opp1, opp2], mockProfile);

    // Average should be exactly (4 + 10) / 2 = 7.0 hours
    expect(telemetry.velocity.avgHoursToApplyAfterDiscovery).toBe(7.0);
    // Fastest should be exactly 4.0 hours
    expect(telemetry.velocity.fastestAppliedHours).toBe(4.0);
    // Human safety should be 100%
    expect(telemetry.velocity.botSafetyScore).toBe(100);
    expect(telemetry.velocity.totalSubmissionsConfirmed).toBe(2);
  });

  it('correctly calculates rejection rates by company type (Frontier AI vs Enterprise Cloud vs Fintech)', () => {
    const opps: Opportunity[] = [
      // 2 Frontier AI applications: 1 rejected, 1 interviewing => 50% rejection
      createMockOpp('opp_openai_1', 'OpenAI', 'Research Systems Engineer', 'archived', ['PyTorch', 'CUDA']),
      createMockOpp('opp_anthropic_2', 'Anthropic', 'Systems Engineer', 'interview'),

      // 2 Fintech applications: both interviewing => 0% rejection
      createMockOpp('opp_stripe_1', 'Stripe', 'Core Systems Engineer', 'interview'),
      createMockOpp('opp_coinbase_2', 'Coinbase', 'Backend Engineer', 'offer'),

      // 1 Enterprise Cloud application: rejected => 100% rejection
      createMockOpp('opp_datadog_1', 'Datadog', 'Cloud Infrastructure', 'archived', ['eBPF']),
    ];

    const telemetry = TelemetryAnalyticsService.computeTelemetry(opps, mockProfile);
    const rejection = telemetry.rejectionAnalysis;

    expect(rejection.totalApplied).toBe(5);
    expect(rejection.totalRejections).toBe(2);
    expect(rejection.overallRejectionRate).toBe(40); // 2/5 = 40%

    // Find Frontier AI segment
    const frontierSegment = rejection.byCompanyType.find(s => s.name === 'Frontier AI & Big Tech');
    expect(frontierSegment).toBeDefined();
    expect(frontierSegment?.appliedCount).toBe(2);
    expect(frontierSegment?.rejectedCount).toBe(1);
    expect(frontierSegment?.rejectionRate).toBe(50);
    expect(frontierSegment?.topMissingSkills).toContain('PyTorch');

    // Find Fintech segment
    const fintechSegment = rejection.byCompanyType.find(s => s.name === 'High-Growth Fintech & Crypto');
    expect(fintechSegment).toBeDefined();
    expect(fintechSegment?.appliedCount).toBe(2);
    expect(fintechSegment?.rejectedCount).toBe(0);
    expect(fintechSegment?.rejectionRate).toBe(0);
    expect(fintechSegment?.interviewConversionRate).toBe(100);
  });

  it('correctly calculates rejection rates by role type (Backend vs AI/ML)', () => {
    const opps: Opportunity[] = [
      // 2 AI/ML roles: both archived (rejected) => 100% rejection rate
      createMockOpp('opp_ml_1', 'Scale AI', 'Machine Learning Engineer', 'archived', ['PyTorch', 'Triton']),
      createMockOpp('opp_ml_2', 'Anthropic', 'AI Research Engineer', 'archived', ['JAX']),

      // 2 Backend roles: 1 interviewing, 1 offer => 0% rejection rate
      createMockOpp('opp_swe_1', 'Stripe', 'Distributed Systems Backend Engineer', 'interview'),
      createMockOpp('opp_swe_2', 'Cloudflare', 'Core Infrastructure Backend Engineer', 'offer'),
    ];

    const telemetry = TelemetryAnalyticsService.computeTelemetry(opps, mockProfile);
    const rejection = telemetry.rejectionAnalysis;

    const mlSegment = rejection.byRoleType.find(s => s.name === 'AI, Machine Learning & Research');
    expect(mlSegment).toBeDefined();
    expect(mlSegment?.appliedCount).toBe(2);
    expect(mlSegment?.rejectedCount).toBe(2);
    expect(mlSegment?.rejectionRate).toBe(100);
    expect(mlSegment?.topMissingSkills).toContain('PyTorch');

    const backendSegment = rejection.byRoleType.find(s => s.name === 'Distributed Systems & Backend');
    expect(backendSegment).toBeDefined();
    expect(backendSegment?.appliedCount).toBe(2);
    expect(backendSegment?.rejectedCount).toBe(0);
    expect(backendSegment?.rejectionRate).toBe(0);
    expect(backendSegment?.interviewConversionRate).toBe(100);

    // Highest Rejection segment should point to 100% rejection segment
    expect(rejection.highestRejectionSegment?.rejectionRate).toBe(100);
    expect(['AI, Machine Learning & Research', 'Frontier AI & Big Tech']).toContain(rejection.highestRejectionSegment?.name);

    // Highest Yield segment should point to 100% interview segment
    expect(rejection.highestYieldSegment?.interviewRate).toBe(100);
    expect(['Distributed Systems & Backend', 'Enterprise Cloud & Distributed Systems', 'High-Growth Fintech & Crypto']).toContain(rejection.highestYieldSegment?.name);
  });

  it('identifies drop-off stages accurately (Resume Screen vs OA vs Ghosted)', () => {
    // 1 with assessment drop, 1 with resume drop
    const oppOA = createMockOpp('opp_oa_drop', 'Roblox', 'Software Engineer', 'archived');
    oppOA.assessmentIntel = {
      hasHistoricalData: true,
      platform: 'HackerRank',
      durationMinutes: 90,
      frequentTopics: ['DP'],
      difficulty: 'Hard',
    };

    const oppResume = createMockOpp('opp_resume_drop', 'Dropbox', 'Software Engineer', 'archived');

    const report = TelemetryAnalyticsService.computeRejectionAnalysis([oppOA, oppResume], mockProfile, []);

    expect(report.stageDropOffBreakdown.oaDropCount).toBe(1);
    expect(report.stageDropOffBreakdown.resumeScreenDropCount).toBe(1);
  });
});

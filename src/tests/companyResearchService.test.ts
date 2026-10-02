import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CompanyResearchService } from '../services/companyResearchService';
import { Opportunity, StudentProfile, CompanyResearchDossier } from '../types';

// Mock localStorage for isolated testing
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
  id: 'usr_candidate_2026',
  fullName: 'Arjun Sharma',
  email: 'arjun.sharma@example.edu',
  phoneNumber: '+1 555 123 4567',
  collegeName: 'University of California, Berkeley',
  degree: 'B.S. in Electrical Engineering & Computer Sciences',
  graduationYear: 2026,
  currentCgpa: '3.92 / 4.0',
  targetBatch: [2026],
  primarySkills: ['Go', 'Distributed Systems', 'TypeScript', 'Kubernetes'],
  secondarySkills: ['PostgreSQL', 'Docker', 'Redis', 'gRPC'],
  projects: [
    {
      id: 'proj_01',
      title: 'Distributed Log Consensus Engine',
      techStack: ['Go', 'Raft Consensus', 'gRPC'],
      description: 'Engineered a consensus-backed distributed ledger supporting high write throughput.',
      metricsAchieved: 'Sustained 25,000 requests/sec with p99 latency < 12ms under partition testing.',
    },
  ],
  githubUrl: 'https://github.com/arjunsharma',
  linkedinUrl: 'https://linkedin.com/in/arjunsharma',
  preferredRoles: ['Software Engineer', 'Systems Engineer'],
  preferredWorkMode: 'remote',
  targetLocations: ['San Francisco', 'Remote'],
  workAuthorization: 'US Citizen / Green Card',
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
  description: 'Join our Core Infrastructure engineering group to design ultra-reliable, high-throughput payment rails and distributed state engines.',
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
    matchedSkills: ['Distributed Systems', 'Go'],
    strategicVerdict: 'Outstanding infrastructure candidate.',
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
    locationsAllowed: ['US', 'Remote'],
  },
  assessmentIntel: {
    hasHistoricalData: true,
    platform: 'Custom Take-Home',
    durationMinutes: 90,
    frequentTopics: ['Distributed Systems', 'Concurrency', 'State Machines'],
    difficulty: 'Hard',
  },
};

describe('CompanyResearchService (6-Axis Strategic Intelligence)', () => {
  beforeEach(() => {
    testLocalStorage.clear();
    vi.restoreAllMocks();
  });

  it('synthesizes a complete 6-axis dossier with all required strategic dimensions', () => {
    const dossier = CompanyResearchService.synthesizeAlgorithmicDossier(
      'Stripe',
      'stripe.com',
      'Software Engineering Intern',
      mockProfile,
      mockOpportunity
    );

    expect(dossier).toBeDefined();
    expect(dossier.companyName).toBe('Stripe');
    expect(dossier.companyDomain).toBe('stripe.com');
    expect(dossier.source).toBe('algorithmic_fallback');

    // Axis 1: Tech Strategy
    expect(dossier.techStrategy.coreStack.length).toBeGreaterThan(0);
    expect(dossier.techStrategy.aiRoadmap.length).toBeGreaterThan(10);
    expect(dossier.techStrategy.architecturePriorities.length).toBeGreaterThan(0);
    expect(dossier.techStrategy.engineeringPrinciples.length).toBeGreaterThan(0);

    // Axis 2: Recent News
    expect(dossier.recentNews.headline).toContain('Stripe');
    expect(dossier.recentNews.summary.length).toBeGreaterThan(20);
    expect(dossier.recentNews.impactOnHiring.length).toBeGreaterThan(10);
    expect(dossier.recentNews.keyMilestones.length).toBeGreaterThan(1);

    // Axis 3: Culture
    expect(dossier.culture.coreValues.length).toBeGreaterThan(2);
    expect(dossier.culture.engineeringCadence.length).toBeGreaterThan(15);
    expect(dossier.culture.internAndJuniorExpectations.length).toBeGreaterThan(15);

    // Axis 4: Challenges
    expect(dossier.challenges.technicalBottlenecks.length).toBeGreaterThan(0);
    expect(dossier.challenges.marketThreats.length).toBeGreaterThan(0);
    expect(dossier.challenges.openProblemsCandidatesCanSolve.length).toBeGreaterThan(0);

    // Axis 5: Competitors & Moat
    expect(dossier.competitors.directRivals.length).toBeGreaterThan(1);
    expect(dossier.competitors.marketMoat.length).toBeGreaterThan(15);
    expect(dossier.competitors.differentiation.length).toBeGreaterThan(15);

    // Axis 6: Candidate Value Angle
    expect(dossier.candidateAngle.immediateValuePitch).toContain(mockProfile.primarySkills[0]);
    expect(dossier.candidateAngle.highImpactProjectIdeas.length).toBeGreaterThan(1);
    expect(dossier.candidateAngle.interviewTalkingPoints.length).toBeGreaterThan(1);
    expect(dossier.candidateAngle.questionsToAskInterviewer.length).toBeGreaterThan(1);

    // Metric and Summary
    expect(dossier.interviewAdvantageScore).toBeGreaterThanOrEqual(80);
    expect(dossier.summaryVerdict.length).toBeGreaterThan(20);
  });

  it('tailors domain-specific tech stack and bottlenecks for different sectors', () => {
    // Cloud / Infra company
    const datadogDossier = CompanyResearchService.synthesizeAlgorithmicDossier('Datadog', 'datadoghq.com');
    expect(datadogDossier.techStrategy.coreStack).toContain('Go');
    expect(datadogDossier.competitors.directRivals).toContain('Elastic');

    // AI company
    const anthropicDossier = CompanyResearchService.synthesizeAlgorithmicDossier('Anthropic', 'anthropic.com');
    expect(anthropicDossier.techStrategy.coreStack).toContain('PyTorch');
    expect(anthropicDossier.competitors.directRivals).toContain('OpenAI');

    // Productivity company
    const figmaDossier = CompanyResearchService.synthesizeAlgorithmicDossier('Figma', 'figma.com');
    expect(figmaDossier.techStrategy.coreStack).toContain('React');
    expect(figmaDossier.competitors.directRivals).toContain('Miro');
  });

  it('invokes /api/ai/company-research when network is available and parses response', async () => {
    const mockApiResponse: Partial<CompanyResearchDossier> = {
      techStrategy: {
        coreStack: ['Go', 'Rust', 'Kubernetes'],
        aiRoadmap: 'Autonomous payment agentic settlement.',
        architecturePriorities: ['Sub-5ms p99 latency'],
        engineeringPrinciples: ['Extreme ownership'],
      },
      recentNews: {
        headline: 'Stripe Launches New Agentic Financial Infrastructure',
        summary: 'Major platform upgrade for autonomous agent payments.',
        impactOnHiring: 'Aggressive expansion of systems engineering teams.',
        keyMilestones: ['Global launch in 40+ countries'],
      },
      culture: {
        coreValues: ['Users First', 'Rigorous Thinking'],
        engineeringCadence: 'Continuous deploys 100+ times daily',
        internAndJuniorExpectations: 'Full PR ownership within 14 days',
        workLifeStyle: 'High-autonomy written memos',
      },
      challenges: {
        technicalBottlenecks: ['Cross-region replication throughput'],
        marketThreats: ['Evolving global payments regulation'],
        openProblemsCandidatesCanSolve: ['Distributed rate-limiting optimization'],
      },
      competitors: {
        directRivals: ['Adyen', 'Modern Treasury'],
        marketMoat: 'Global banking network and developer mindshare',
        differentiation: 'Highest API reliability in industry',
        industryStanding: 'Definitive global standard for payments',
      },
      candidateAngle: {
        immediateValuePitch: 'Proven experience building Raft consensus engines.',
        highImpactProjectIdeas: ['Telemetry pipeline refactor'],
        interviewTalkingPoints: ['Deep knowledge of distributed state replication'],
        questionsToAskInterviewer: ['How do you verify cross-region idempotency?'],
      },
      summaryVerdict: 'Elite strategic match for core infrastructure.',
      interviewAdvantageScore: 98,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        dossier: mockApiResponse,
      }),
    } as any);

    const result = await CompanyResearchService.getResearch(
      'Stripe',
      'stripe.com',
      'Systems Engineer',
      mockProfile,
      mockOpportunity,
      true
    );

    expect(result.source).toBe('gemini-3.8-flash');
    expect(result.interviewAdvantageScore).toBe(98);
    expect(result.techStrategy.coreStack).toEqual(['Go', 'Rust', 'Kubernetes']);
  });

  it('falls back gracefully to algorithmic synthesis if network fetch throws', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network connection offline'));

    const result = await CompanyResearchService.getResearch(
      'Stripe',
      'stripe.com',
      'Systems Engineer',
      mockProfile,
      mockOpportunity,
      true
    );

    expect(result).toBeDefined();
    expect(result.source).toBe('algorithmic_fallback');
    expect(result.companyName).toBe('Stripe');
    expect(result.techStrategy.coreStack.length).toBeGreaterThan(0);
    expect(result.candidateAngle.interviewTalkingPoints.length).toBeGreaterThan(0);
  });

  it('caches generated research and serves from cache on subsequent calls without network', async () => {
    const fetchSpy = vi.fn().mockRejectedValue(new Error('Offline'));
    globalThis.fetch = fetchSpy;

    // First call generates and caches
    const firstCall = await CompanyResearchService.getResearch('Stripe', 'stripe.com');
    expect(firstCall.companyName).toBe('Stripe');

    // Second call without forceRefresh should read from cache
    fetchSpy.mockClear();
    const secondCall = await CompanyResearchService.getResearch('Stripe', 'stripe.com', undefined, undefined, undefined, false);
    expect(secondCall.companyName).toBe('Stripe');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('exports formatted Markdown and supports talking point copying', async () => {
    const dossier = CompanyResearchService.synthesizeAlgorithmicDossier('Stripe', 'stripe.com');
    const md = CompanyResearchService.exportDossierMarkdown(dossier);

    expect(md).toContain('# 6-Axis Company Intelligence Dossier: Stripe');
    expect(md).toContain('## 1. AI & Technology Strategy');
    expect(md).toContain('## 6. Candidate Value Angle');
    expect(md).toContain('Executive Verdict:');

    // Mock clipboard
    let writtenText = '';
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(async (txt: string) => {
          writtenText = txt;
          return Promise.resolve();
        }),
      },
    });

    const copied = await CompanyResearchService.copyTalkingPoints(dossier);
    expect(copied).toBe(true);
    expect(writtenText).toContain('INTERVIEW TALKING POINTS FOR STRIPE:');
    expect(writtenText).toContain('HIGH-CONVICTION QUESTIONS TO ASK:');
  });

  it('strictly preserves candidate agency: does NOT mutate opportunity stage or auto-submit', async () => {
    const initialStage = mockOpportunity.stage;
    await CompanyResearchService.getResearch('Stripe', 'stripe.com', 'Systems Engineer', mockProfile, mockOpportunity);

    expect(mockOpportunity.stage).toBe(initialStage);
    expect(mockOpportunity.stage).not.toBe('applied');
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import {
  AtsClosureDetectionService,
  ATS_CLOSURE_BADGE_TEXT,
  SupportedAtsSource
} from '../services/atsClosureDetectionService';
import { Opportunity } from '../types';

describe('Prompt 41B: ATS Jobs API-Based Closure Detection', () => {
  beforeEach(() => {
    AtsClosureDetectionService.resetTracking();
  });

  const createDummyJob = (
    id: string,
    sourceType: SupportedAtsSource,
    companyDomain = 'testcompany.com',
    companyName = 'Test Company'
  ): Opportunity => ({
    id,
    companyName,
    companyLogo: 'https://logo.clearbit.com/' + companyDomain,
    companyDomain,
    title: 'Software Engineer Intern',
    type: 'internship',
    workMode: 'remote',
    location: 'Remote',
    department: 'Engineering',
    officialApplyUrl: `https://jobs.${sourceType}.com/test/${id}`,
    releasedAt: Date.now() - 3600000,
    deadlineAt: Date.now() + 86400000,
    verification: {
      verified: true,
      sourceType,
      rootDomain: companyDomain,
      endpointUrl: `https://api.${sourceType}.com/v1/test`,
      lastCheckedTimestamp: Date.now(),
      sslStatus: 'A+',
      noFeeGuarantee: true,
      requisitionId: `REQ-${id}`,
    },
    eligibility: {
      allowedGraduationYears: [2026, 2027],
      degrees: ['BS', 'B.Tech'],
      undergradOnly: true,
      sponsorshipAvailable: true,
      locationsAllowed: ['US', 'Remote'],
    },
    compensation: {
      currency: 'USD',
      range: '$50 - $65 / hr',
      period: 'hourly',
      isPaid: true,
      transparentBenchmark: 'Market rate',
    },
    fitment: {
      overallScore: 90,
      overallGrade: 'A',
      dimensions: {
        roleFit: 90,
        skillsAlignment: 90,
        batchEligibility: 100,
        companyPrestige: 90,
        learningTrajectory: 90,
        compensationFairness: 90,
      },
      matchedSkills: ['TypeScript', 'React'],
      missingSkills: [],
      strategicVerdict: 'Strong alignment',
    },
    assessmentIntel: {
      hasHistoricalData: true,
      platform: 'LeetCode',
      durationMinutes: 60,
      frequentTopics: ['Algorithms'],
      difficulty: 'Medium',
    },
    stage: 'discovered',
  });

  it('provides exact badge text "Possibly closed, verify on official page"', () => {
    expect(ATS_CLOSURE_BADGE_TEXT).toBe('Possibly closed, verify on official page');
  });

  it('supports all 4 required ATS providers: Greenhouse, Lever, SmartRecruiters, and Workable', () => {
    const ghJob = createDummyJob('live_gh_figma_101', 'greenhouse');
    const leverJob = createDummyJob('live_lever_stripe_202', 'lever');
    const srJob = createDummyJob('live_sr_canva_303', 'smartrecruiters');
    const wkJob = createDummyJob('live_wk_target_404', 'workable');

    expect(AtsClosureDetectionService.isSupportedAtsJob(ghJob)).toBe(true);
    expect(AtsClosureDetectionService.isSupportedAtsJob(leverJob)).toBe(true);
    expect(AtsClosureDetectionService.isSupportedAtsJob(srJob)).toBe(true);
    expect(AtsClosureDetectionService.isSupportedAtsJob(wkJob)).toBe(true);
  });

  it('does NOT mark a job as possibly closed after only ONE missing fetch', () => {
    const jobA = createDummyJob('live_gh_stripe_1', 'greenhouse', 'stripe.com', 'Stripe');
    const jobB = createDummyJob('live_gh_stripe_2', 'greenhouse', 'stripe.com', 'Stripe');

    // Fetch 1: Both jobs appear in source API
    const cycle1 = AtsClosureDetectionService.processFetchCycle([], [jobA, jobB]);
    expect(cycle1.mergedOpportunities.length).toBe(2);
    expect(cycle1.mergedOpportunities.find(j => j.id === jobB.id)?.possiblyClosed).toBeFalsy();

    // Fetch 2: Job B disappears for the FIRST time (only Job A is returned)
    const cycle2 = AtsClosureDetectionService.processFetchCycle(cycle1.mergedOpportunities, [jobA]);
    
    // CRITICAL: Job B MUST NOT be deleted automatically!
    expect(cycle2.mergedOpportunities.length).toBe(2);
    const jobBAfter1Disappearance = cycle2.mergedOpportunities.find(j => j.id === jobB.id);
    expect(jobBAfter1Disappearance, 'Job B must still exist in opportunities list').toBeDefined();
    expect(jobBAfter1Disappearance?.consecutiveMissingFetches).toBe(1);
    expect(jobBAfter1Disappearance?.possiblyClosed, 'Must not be marked closed after only 1 missing fetch').toBe(false);
  });

  it('marks a job "Possibly closed" when it disappears from TWO consecutive fetches of its source API', () => {
    const jobA = createDummyJob('live_lever_netflix_1', 'lever', 'netflix.com', 'Netflix');
    const jobB = createDummyJob('live_lever_netflix_2', 'lever', 'netflix.com', 'Netflix');

    // Fetch 1: Both jobs exist
    const cycle1 = AtsClosureDetectionService.processFetchCycle([], [jobA, jobB]);

    // Fetch 2: Job B disappears (1st consecutive disappearance)
    const cycle2 = AtsClosureDetectionService.processFetchCycle(cycle1.mergedOpportunities, [jobA]);
    expect(cycle2.mergedOpportunities.find(j => j.id === jobB.id)?.consecutiveMissingFetches).toBe(1);
    expect(cycle2.mergedOpportunities.find(j => j.id === jobB.id)?.possiblyClosed).toBe(false);

    // Fetch 3: Job B disappears again (2nd consecutive disappearance)
    const cycle3 = AtsClosureDetectionService.processFetchCycle(cycle2.mergedOpportunities, [jobA]);

    // CRITICAL: Job B is NOT deleted automatically!
    expect(cycle3.mergedOpportunities.length).toBe(2);
    const jobBAfter2Disappearances = cycle3.mergedOpportunities.find(j => j.id === jobB.id);
    expect(jobBAfter2Disappearances).toBeDefined();
    expect(jobBAfter2Disappearances?.consecutiveMissingFetches).toBe(2);
    expect(jobBAfter2Disappearances?.possiblyClosed).toBe(true);
    expect(jobBAfter2Disappearances?.closureStatus).toBe('POSSIBLY_CLOSED');
  });

  it('restores active status if a previously missing job reappears in a subsequent fetch', () => {
    const jobA = createDummyJob('live_sr_canva_1', 'smartrecruiters', 'canva.com', 'Canva');
    const jobB = createDummyJob('live_sr_canva_2', 'smartrecruiters', 'canva.com', 'Canva');

    // Fetch 1: Both exist
    const cycle1 = AtsClosureDetectionService.processFetchCycle([], [jobA, jobB]);

    // Fetch 2 & 3: Job B disappears twice -> marked possibly closed
    const cycle2 = AtsClosureDetectionService.processFetchCycle(cycle1.mergedOpportunities, [jobA]);
    const cycle3 = AtsClosureDetectionService.processFetchCycle(cycle2.mergedOpportunities, [jobA]);
    expect(cycle3.mergedOpportunities.find(j => j.id === jobB.id)?.possiblyClosed).toBe(true);

    // Fetch 4: Job B reappears on the employer API
    const cycle4 = AtsClosureDetectionService.processFetchCycle(cycle3.mergedOpportunities, [jobA, jobB]);
    const jobBReappeared = cycle4.mergedOpportunities.find(j => j.id === jobB.id);

    expect(jobBReappeared?.possiblyClosed).toBe(false);
    expect(jobBReappeared?.closureStatus).toBe('ACTIVE');
    expect(jobBReappeared?.consecutiveMissingFetches).toBe(0);
  });

  it('works accurately across Workable and Greenhouse providers', () => {
    const wkJob = createDummyJob('live_wk_target_1', 'workable', 'workable-corp.com', 'Workable Corp');

    // Initial fetch: job appears
    const c1 = AtsClosureDetectionService.processFetchCycle([], [wkJob]);

    // Missing twice from Workable Corp board
    const c2 = AtsClosureDetectionService.processFetchCycle(c1.mergedOpportunities, [], {
      companyKeys: ['workable-corp.com'],
      sourceTypes: ['workable'],
    });
    expect(c2.mergedOpportunities.find(j => j.id === wkJob.id)?.possiblyClosed).toBe(false);

    const c3 = AtsClosureDetectionService.processFetchCycle(c2.mergedOpportunities, [], {
      companyKeys: ['workable-corp.com'],
      sourceTypes: ['workable'],
    });
    const finalWk = c3.mergedOpportunities.find(j => j.id === wkJob.id);
    expect(finalWk?.possiblyClosed).toBe(true);
    expect(finalWk?.closureStatus).toBe('POSSIBLY_CLOSED');
    // Ensure not deleted
    expect(c3.mergedOpportunities.length).toBe(1);
  });
});

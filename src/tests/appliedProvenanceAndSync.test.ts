import { describe, it, expect, beforeEach } from 'vitest';
import { AppliedDossierService } from '../services/appliedDossierService';
import { Opportunity, FastApplyReceipt } from '../types';

const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storage.get(key) || null,
  setItem: (key: string, value: string) => storage.set(key, String(value)),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Applied Application Provenance & Multi-Route Tracking', () => {
  const mockOpportunity: Opportunity = {
    id: 'opp_roblox_swe_test_01',
    companyName: 'Roblox',
    companyLogo: 'https://logo.clearbit.com/roblox.com',
    companyDomain: 'roblox.com',
    title: 'Software Engineer, Early Career 2026',
    type: 'new-grad',
    workMode: 'hybrid',
    location: 'San Mateo, CA',
    department: 'Engineering',
    officialApplyUrl: 'https://job-boards.greenhouse.io/embed/job_app?for=roblox&token=8072244',
    releasedAt: Date.now() - 3600000,
    deadlineAt: Date.now() + 86400000 * 7,
    verification: {
      verified: true,
      sourceType: 'greenhouse',
      rootDomain: 'roblox.com',
      endpointUrl: 'https://boards-api.greenhouse.io/v1/boards/roblox/jobs',
      lastCheckedTimestamp: Date.now(),
      sslStatus: 'A+',
      noFeeGuarantee: true,
      requisitionId: 'GH-ROBLOX-8072244',
    },
    eligibility: {
      allowedGraduationYears: [2026],
      degrees: ['B.Tech', 'BS in CS'],
      undergradOnly: false,
      sponsorshipAvailable: true,
      locationsAllowed: ['United States'],
    },
    compensation: {
      currency: 'USD',
      range: '$140,000 - $175,000 / yr',
      period: 'annual',
      rawMonthlyUsd: 13000,
      isPaid: true,
      transparentBenchmark: 'Verified Greenhouse ATS Record',
    },
    fitment: {
      overallScore: 92,
      overallGrade: 'A',
      dimensions: {
        roleFit: 92,
        skillsAlignment: 90,
        batchEligibility: 100,
        companyPrestige: 95,
        learningTrajectory: 90,
        compensationFairness: 90,
      },
      matchedSkills: ['Distributed Systems', 'C++', 'Go'],
      missingSkills: [],
      strategicVerdict: 'Strong Candidate Match',
    },
    assessmentIntel: {
      hasHistoricalData: true,
      platform: 'CodeSignal',
      durationMinutes: 70,
      frequentTopics: ['Algorithms', 'Data Structures'],
      difficulty: 'Medium',
    },
    stage: 'discovered',
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('records direct official ATS submission with authentic route provenance and applicant email', async () => {
    const studentEmail = 'kakhileshsingh310@gmail.com';
    const studentUid = 'usr_google_test_123';

    const record = await AppliedDossierService.recordDirectAtsApplication(
      mockOpportunity,
      studentEmail,
      studentUid,
      true,
      'Applied directly on official Roblox Greenhouse portal.'
    );

    expect(record.opportunityId).toBe('opp_roblox_swe_test_01');
    expect(record.submissionRoute).toBe('direct_official_ats');
    expect(record.routeLabel).toBe('Applied directly on Official ATS Portal');
    expect(record.applicantEmail).toBe(studentEmail);
    expect(record.applicantUid).toBe(studentUid);
    expect(record.confirmationId).toContain('DIR-ATS-');
    expect(record.sha256Proof).toBeDefined();

    // Verify lookup by opportunity ID
    const retrieved = AppliedDossierService.getRecordByOpportunityId('opp_roblox_swe_test_01');
    expect(retrieved).toBeDefined();
    expect(retrieved?.submissionRoute).toBe('direct_official_ats');
    expect(retrieved?.applicantEmail).toBe(studentEmail);
  });

  it('records fast-apply assistant submission with terrasynx_assisted provenance', () => {
    const studentEmail = 'kakhileshsingh310@gmail.com';
    const mockReceipt: FastApplyReceipt = {
      confirmationId: 'CONF-2026-ROBLOX-8841X',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      opportunityId: 'opp_roblox_swe_test_01',
      companyName: 'Roblox',
      jobTitle: 'Software Engineer, Early Career 2026',
      submittedAt: Date.now(),
      portalType: 'Greenhouse',
      candidateName: 'Akhilesh Singh',
      candidateEmail: studentEmail,
      workAuthSelected: 'US Citizen / Green Card',
      tailoredResumeUsed: 'Distributed Systems & Microservices',
      humanLatencySeconds: 4.2,
      antiBotStatus: 'Student Self-Reported Submission',
      status: 'confirmed',
      receiptUrl: mockOpportunity.officialApplyUrl,
    };

    const record = AppliedDossierService.recordApplicationSubmission(
      mockReceipt,
      mockOpportunity,
      studentEmail,
      'usr_google_test_123',
      true
    );

    expect(record.submissionRoute).toBe('terrasynx_assisted');
    expect(record.routeLabel).toBe('Applied via TERRASYNX Fast-Apply Assistant');
    expect(record.applicantEmail).toBe(studentEmail);
    expect(record.confirmationId).toBe('CONF-2026-ROBLOX-8841X');
  });
});

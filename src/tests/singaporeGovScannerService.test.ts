import { describe, it, expect } from 'vitest';
import { 
  SingaporeGovScannerService, 
  VERIFIED_SINGAPORE_ANCHORS,
  SingaporeGovRawJob 
} from '../services/singaporeGovScannerService';
import { 
  RECURRING_ANNUAL_INTERNSHIPS, 
  NATURAL_SEARCH_SYNONYMS 
} from '../services/upcomingInternshipsService';

describe('Singapore MyCareersFuture Government Portal Scanner (PROMPT 31)', () => {
  it('correctly parses raw API item from MyCareersFuture v2 response', () => {
    const rawApiItem = {
      title: 'Software Engineer Intern (Cloud & Distributed Systems)',
      metadata: {
        jobPostId: 'MCF-2026-1756986',
        jobDetailsUrl: 'https://www.mycareersfuture.gov.sg/job/information-technology/software-engineer-intern-codex-solutions-199ef38b989140cb942fdb4b1910ca56',
        originalPostingDate: '2026-10-01T08:00:00.000Z',
        expiryDate: '2026-11-01T08:00:00.000Z',
      },
      postedCompany: {
        name: 'CODEX SOLUTIONS PTE. LTD.',
        uen: '202015243M',
        logoUploadPath: 'https://static.mycareersfuture.gov.sg/images/company/logos/codex.jpg',
      },
      salary: {
        minimum: 1500,
        maximum: 2000,
        type: { salaryType: 'Monthly' },
      },
      skills: [
        { skill: 'TypeScript' },
        { skill: 'Node.js' },
        { skill: 'PostgreSQL' },
        { skill: 'Docker' },
      ],
      categories: [{ category: 'Information Technology' }],
      employmentTypes: [{ employmentType: 'Internship' }],
      positionLevels: [{ position: 'Fresh/entry level' }],
      address: {
        districts: [{ location: 'West', region: 'West' }],
      },
    };

    const parsed = SingaporeGovScannerService.parseApiResponseItem(rawApiItem);
    expect(parsed).not.toBeNull();
    expect(parsed?.jobPostId).toBe('MCF-2026-1756986');
    expect(parsed?.title).toBe('Software Engineer Intern (Cloud & Distributed Systems)');
    expect(parsed?.companyName).toBe('CODEX SOLUTIONS PTE. LTD.');
    expect(parsed?.companyUen).toBe('202015243M');
    expect(parsed?.salaryMin).toBe(1500);
    expect(parsed?.salaryMax).toBe(2000);
    expect(parsed?.skills).toContain('TypeScript');
    expect(parsed?.skills).toContain('Docker');
    expect(parsed?.isInternship).toBe(true);
    expect(parsed?.location).toContain('West, Singapore');
  });

  it('correctly maps Singapore Government job into Opportunity with official verified badge and signals', () => {
    const rawJob: SingaporeGovRawJob = {
      jobPostId: 'MCF-2026-1739501',
      title: 'Cybersecurity Analyst (Fresh Graduate Track)',
      companyName: 'GOVERNMENT TECHNOLOGY AGENCY (GovTech)',
      companyLogo: 'https://logo.clearbit.com/tech.gov.sg',
      companyUen: 'T08GB0025B',
      jobDetailsUrl: 'https://www.mycareersfuture.gov.sg/job/information-technology/cybersecurity-analyst-govtech-singapore',
      salaryMin: 4500,
      salaryMax: 5500,
      salaryType: 'Monthly',
      skills: ['Threat Intelligence', 'Penetration Testing', 'Incident Response', 'Network Security'],
      location: 'Mapletree Business City, Singapore',
      categories: ['Information Technology'],
      employmentTypes: ['Permanent'],
      positionLevels: ['Fresh/entry level'],
      isInternship: false,
    };

    const opp = SingaporeGovScannerService.mapJobToOpportunity(rawJob);

    expect(opp.id).toBe('singapore_gov_MCF-2026-1739501');
    expect(opp.companyName).toBe('GOVERNMENT TECHNOLOGY AGENCY (GovTech)');
    expect(opp.title).toBe('Cybersecurity Analyst (Fresh Graduate Track)');
    expect(opp.type).toBe('new-grad');
    expect(opp.location).toContain('Singapore');
    expect(opp.verification.sourceType).toBe('singapore_gov');
    expect(opp.verification.verified).toBe(true);
    expect(opp.verification.rootDomain).toBe('mycareersfuture.gov.sg');
    expect(opp.compensation.currency).toBe('SGD');
    expect(opp.compensation.range).toContain('S$4,500 - S$5,500 / mo');
    expect(opp.isSingaporeGovPortal).toBe(true);
    expect(opp.singaporeGovDetails).toBeDefined();
    expect(opp.singaporeGovDetails?.jobPostId).toBe('MCF-2026-1739501');
    expect(opp.singaporeGovDetails?.uen).toBe('T08GB0025B');
    expect(opp.singaporeGovDetails?.portalUrl).toBe('https://www.mycareersfuture.gov.sg/job/information-technology/cybersecurity-analyst-govtech-singapore');
  });

  it('links Singapore Government portal into Global Calendar existing Singapore category alongside NUS-IRIS', () => {
    // 1. Natural search synonyms includes both NUS IRIS and MyCareersFuture in Singapore
    const sgSynonym = NATURAL_SEARCH_SYNONYMS['singapore'];
    expect(sgSynonym).toBeDefined();
    expect(sgSynonym.aliases).toContain('iris');
    expect(sgSynonym.aliases).toContain('nus');
    expect(sgSynonym.aliases).toContain('mycareersfuture');
    expect(sgSynonym.aliases).toContain('govtech');

    // 2. Global Calendar contains both NUS-IRIS and MyCareersFuture Singapore Gov
    const nusIris = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_nus_iris_singapore');
    const myCareersFuture = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_mycareersfuture_singapore_gov');

    expect(nusIris).toBeDefined();
    expect(nusIris?.companyName).toContain('National University of Singapore');
    expect(nusIris?.programTitle).toContain('NUS IRIS');

    expect(myCareersFuture).toBeDefined();
    expect(myCareersFuture?.companyName).toContain('MyCareersFuture');
    expect(myCareersFuture?.programTitle).toContain('Singapore National Tech Careers');
    expect(myCareersFuture?.officialCareersUrl).toBe('https://www.mycareersfuture.gov.sg');

    // 3. Service helper generates matching calendar cycles
    const serviceCycles = SingaporeGovScannerService.getSingaporeCalendarCycles();
    expect(serviceCycles.length).toBeGreaterThanOrEqual(1);
    expect(serviceCycles[0].id).toBe('cycle_mycareersfuture_singapore_gov');
  });

  it('provides verified fallback anchors for reliable offline and recovery execution', () => {
    expect(VERIFIED_SINGAPORE_ANCHORS.length).toBeGreaterThanOrEqual(4);
    const hasInternship = VERIFIED_SINGAPORE_ANCHORS.some(a => a.isInternship);
    const hasEntryLevel = VERIFIED_SINGAPORE_ANCHORS.some(a => !a.isInternship);
    expect(hasInternship).toBe(true);
    expect(hasEntryLevel).toBe(true);
  });
});

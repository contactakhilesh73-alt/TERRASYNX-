import { describe, it, expect } from 'vitest';
import { 
  BuiltInScannerService, 
  BUILTIN_HUB_URLS, 
  VERIFIED_BUILTIN_ANCHORS,
  BuiltInRawListing 
} from '../services/builtInScannerService';

describe('Built In Aggregator Service (PROMPT 30)', () => {
  it('has valid URL patterns defined for Remote and all major US tech hubs (SF, NYC, Austin, Seattle)', () => {
    const hubs = BuiltInScannerService.getAvailableHubs();
    expect(hubs).toEqual(['Remote', 'SF', 'NYC', 'Austin', 'Seattle']);

    for (const hub of hubs) {
      const config = BUILTIN_HUB_URLS[hub];
      expect(config).toBeDefined();
      expect(config['entry-level']).toContain('builtin.com');
      expect(config['internship']).toContain('builtin.com');
      expect(config.defaultLocation).toBeTruthy();
    }

    expect(BUILTIN_HUB_URLS.Remote['entry-level']).toBe('https://builtin.com/jobs/remote/entry-level');
    expect(BUILTIN_HUB_URLS.Remote['internship']).toBe('https://builtin.com/jobs/remote/internships');
    expect(BUILTIN_HUB_URLS.SF['entry-level']).toBe('https://builtin.com/jobs/entry-level/san-francisco');
    expect(BUILTIN_HUB_URLS.SF['internship']).toBe('https://builtin.com/jobs/internships/san-francisco');
    expect(BUILTIN_HUB_URLS.NYC['entry-level']).toBe('https://builtin.com/jobs/entry-level/new-york');
    expect(BUILTIN_HUB_URLS.NYC['internship']).toBe('https://builtin.com/jobs/internships/new-york');
    expect(BUILTIN_HUB_URLS.Austin['entry-level']).toBe('https://builtin.com/jobs/entry-level/austin');
    expect(BUILTIN_HUB_URLS.Austin['internship']).toBe('https://builtin.com/jobs/internships/austin');
    expect(BUILTIN_HUB_URLS.Seattle['entry-level']).toBe('https://builtin.com/jobs/entry-level/seattle');
    expect(BUILTIN_HUB_URLS.Seattle['internship']).toBe('https://builtin.com/jobs/internships/seattle');
  });

  it('correctly parses server-rendered job cards from Built In HTML', () => {
    const mockHtml = `
      <div id="search-results-top">
        <div id="job-card-11511366" data-id="job-card">
          <div class="col-12 col-lg-7 left-side-tile">
            <a href="/company/vercel" data-id="company-title">
              <span>Vercel</span>
            </a>
            <img data-id="company-img" src="https://cdn.builtin.com/files/vercel.png" alt="Vercel Logo" />
            <h2 class="font-barlow"><a href="/job/account-executive-startups-greenfield/11511366" data-id="job-card-title">Account Executive- Startups, Greenfield</a></h2>
          </div>
          <div class="col-12 col-lg-5">
            <span class="fs-xs"><i class="fa-regular fa-clock"></i>15 Minutes Ago</span>
            <div class="d-flex"><i class="fa-regular fa-house-building"></i></div>
            <span class="font-barlow text-gray-04">Hybrid</span>
            <span class="font-barlow" data-bs-title="&lt;div class=&#x27;text-truncate&#x27;&gt;Austin, TX, USA&lt;/div&gt;&lt;div class=&#x27;text-truncate&#x27;&gt;San Francisco, CA, USA&lt;/div&gt;">2 Locations</span>
            <div class="d-flex"><i class="fa-regular fa-sack-dollar"></i></div>
            <span class="font-barlow text-gray-04">170K-209K Annually</span>
          </div>
        </div>
        <div id="job-card-11509854" data-id="job-card">
          <div class="col-12 col-lg-7 left-side-tile">
            <a href="/company/inkind" data-id="company-title">
              <span>inKind</span>
            </a>
            <img data-id="company-img" src="https://cdn.builtin.com/files/inkind.png" alt="inKind Logo" />
            <h2 class="font-barlow"><a href="/job/finance-systems-automation-analyst/11509854" data-id="job-card-title">Finance Systems &amp; Automation Analyst</a></h2>
          </div>
          <div class="col-12 col-lg-5">
            <span class="fs-xs"><i class="fa-regular fa-clock"></i>1 Hour Ago</span>
            <div class="d-flex"><i class="fa-regular fa-house-building"></i></div>
            <span class="font-barlow text-gray-04">Hybrid</span>
            <span class="font-barlow" data-bs-title="&lt;div class=&#x27;text-truncate&#x27;&gt;Austin, TX, USA&lt;/div&gt;">Austin, TX</span>
            <div class="d-flex"><i class="fa-regular fa-sack-dollar"></i></div>
            <span class="font-barlow text-gray-04">80K-90K Annually</span>
          </div>
        </div>
      </div>
    `;

    const parsed = BuiltInScannerService.parseBuiltInHtml(mockHtml, 'SF', 'entry-level');
    expect(parsed.length).toBe(2);

    const first = parsed[0];
    expect(first.jobId).toBe('11511366');
    expect(first.title).toBe('Account Executive- Startups, Greenfield');
    expect(first.company).toBe('Vercel');
    expect(first.logo).toBe('https://cdn.builtin.com/files/vercel.png');
    expect(first.workMode).toBe('Hybrid');
    expect(first.salary).toBe('170K-209K Annually');
    expect(first.link).toBe('https://builtin.com/job/account-executive-startups-greenfield/11511366');
    expect(first.hub).toBe('SF');
    expect(first.roleType).toBe('entry-level');

    const second = parsed[1];
    expect(second.jobId).toBe('11509854');
    expect(second.title).toBe('Finance Systems & Automation Analyst');
    expect(second.company).toBe('inKind');
    expect(second.salary).toBe('80K-90K Annually');
  });

  it('correctly maps raw Built In listing to a verified Opportunity model', () => {
    const raw: BuiltInRawListing = {
      jobId: '11506120',
      title: 'Front-End Engineering Intern (Remote)',
      company: 'Zapier',
      logo: 'https://logo.clearbit.com/zapier.com',
      workMode: 'Remote',
      location: 'Remote, USA',
      salary: '$48 - $65 / hr',
      postedAgo: 'Recent',
      link: 'https://builtin.com/jobs/remote/internships',
      hub: 'Remote',
      roleType: 'internship',
    };

    const opp = BuiltInScannerService.mapListingToOpportunity(raw);

    expect(opp.id).toBe('builtin_11506120');
    expect(opp.companyName).toBe('Zapier');
    expect(opp.title).toBe('Front-End Engineering Intern (Remote)');
    expect(opp.type).toBe('internship');
    expect(opp.workMode).toBe('remote');
    expect(opp.verification.sourceType).toBe('builtin');
    expect(opp.verification.verified).toBe(true);
    expect(opp.verification.rootDomain).toBe('builtin.com');
    expect(opp.compensation.range).toBe('$48 - $65 / hr');
    expect(opp.compensation.period).toBe('hourly');
    expect(opp.isBuiltInListing).toBe(true);
    expect(opp.builtInDetails).toBeDefined();
    expect(opp.builtInDetails?.jobId).toBe('11506120');
    expect(opp.builtInDetails?.hub).toBe('Remote');
    expect(opp.builtInDetails?.isRemote).toBe(true);
    expect(opp.builtInDetails?.roleCategory).toBe('internship');
  });

  it('provides verified fallback anchors for all required hubs', () => {
    expect(VERIFIED_BUILTIN_ANCHORS.length).toBeGreaterThanOrEqual(4);
    const hubs = VERIFIED_BUILTIN_ANCHORS.map(a => a.hub);
    expect(hubs).toContain('SF');
    expect(hubs).toContain('NYC');
    expect(hubs).toContain('Austin');
    expect(hubs).toContain('Seattle');
    expect(hubs).toContain('Remote');
  });
});

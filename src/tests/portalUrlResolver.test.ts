import { describe, it, expect } from 'vitest';
import { resolveCanonicalApplyUrl, sanitizeOpportunityUrls, COMPANY_ATS_REGISTRY } from '../utils/portalUrlResolver';
import { Opportunity } from '../types';

describe('Portal URL Resolver & SSL Safety Audit', () => {
  it('correctly resolves Roblox to direct SSL-safe Greenhouse application form avoiding SSL mismatch', () => {
    const opp: Partial<Opportunity> = {
      id: 'live_gh_roblox_8072244',
      companyName: 'Roblox',
      officialApplyUrl: 'https://careers.roblox.com/jobs/8072244?gh_jid=8072244',
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
    };

    const resolved = resolveCanonicalApplyUrl(opp);
    expect(resolved).toBe('https://job-boards.greenhouse.io/embed/job_app?for=roblox&token=8072244');
    expect(resolved).not.toContain('careers.roblox.com');
  });

  it('correctly resolves Pinterest avoiding 403 bot blocks and homepage redirect', () => {
    const opp: Partial<Opportunity> = {
      id: 'live_gh_pinterest_7816424',
      companyName: 'Pinterest',
      officialApplyUrl: 'https://www.pinterestcareers.com/jobs/?gh_jid=7816424',
    };

    const resolved = resolveCanonicalApplyUrl(opp);
    expect(resolved).toBe('https://job-boards.greenhouse.io/embed/job_app?for=pinterest&token=7816424');
  });

  it('correctly resolves Coinbase avoiding generic homepage redirect', () => {
    const opp: Partial<Opportunity> = {
      id: 'live_gh_coinbase_8175363',
      companyName: 'Coinbase',
      officialApplyUrl: 'https://www.coinbase.com/careers/positions/8175363?gh_jid=8175363',
    };

    const resolved = resolveCanonicalApplyUrl(opp);
    expect(resolved).toBe('https://job-boards.greenhouse.io/embed/job_app?for=coinbase&token=8175363');
  });

  it('correctly resolves Dropbox avoiding 403 Forbidden', () => {
    const opp: Partial<Opportunity> = {
      id: 'live_gh_dropbox_6330377',
      companyName: 'Dropbox',
      officialApplyUrl: 'https://jobs.dropbox.com/listing/6330377?gh_jid=6330377',
    };

    const resolved = resolveCanonicalApplyUrl(opp);
    expect(resolved).toBe('https://job-boards.greenhouse.io/embed/job_app?for=dropbox&token=6330377');
  });

  it('correctly resolves Lever opportunities directly to lever.co application endpoint', () => {
    const opp: Partial<Opportunity> = {
      id: 'live_lever_palantir_10dfc8bc-99ad-4ca2-ab76-853cb90a92c2',
      companyName: 'Palantir Technologies',
      officialApplyUrl: 'https://jobs.lever.co/palantir/10dfc8bc-99ad-4ca2-ab76-853cb90a92c2',
    };

    const resolved = resolveCanonicalApplyUrl(opp);
    expect(resolved).toBe('https://jobs.lever.co/palantir/10dfc8bc-99ad-4ca2-ab76-853cb90a92c2');
  });

  it('sanitizes opportunity objects in-place', () => {
    const opp = {
      id: 'live_gh_asana_7964297',
      companyName: 'Asana',
      officialApplyUrl: 'https://www.asana.com/jobs/apply/7964297?gh_jid=7964297',
    } as Opportunity;

    const sanitized = sanitizeOpportunityUrls(opp);
    expect(sanitized.officialApplyUrl).toBe('https://job-boards.greenhouse.io/embed/job_app?for=asana&token=7964297');
  });

  it('preserves existing valid greenhouse embed URLs', () => {
    const opp = {
      id: 'live_gh_figma_6144755004',
      companyName: 'Figma',
      officialApplyUrl: 'https://job-boards.greenhouse.io/embed/job_app?for=figma&token=6144755004',
    } as Opportunity;

    const resolved = resolveCanonicalApplyUrl(opp);
    expect(resolved).toBe('https://job-boards.greenhouse.io/embed/job_app?for=figma&token=6144755004');
  });
});

import { describe, it, expect } from 'vitest';
import { HackathonsService, HACKATHONS_DATABASE } from '../services/hackathonsService';
import { Hackathon } from '../types';
import { isHostnameAllowed } from '../services/linkAllowlistService';

describe('Prompt 44: Recurring Series Specifications & Compliance', () => {
  const allHackathons = HackathonsService.getAllHackathons();

  it('contains the three required recurring entries with source recurring-series and no fixed dates', () => {
    const recurring = allHackathons.filter(h => h.source === 'recurring-series');
    expect(recurring.length).toBeGreaterThanOrEqual(3);

    // 1. MLH Global Hack Week
    const ghw = recurring.find(h => 
      h.name.toLowerCase().includes('global hack week') || 
      h.officialUrl.includes('ghw.mlh.com')
    );
    expect(ghw).toBeDefined();
    if (!ghw) return;

    expect(ghw.source).toBe('recurring-series');
    expect(ghw.mode).toBe('online');
    expect(ghw.country).toBe('Online/Global');
    expect(ghw.officialUrl).toContain('ghw.mlh.com');
    expect(ghw.datesNote).toBe('Dates change every edition, confirm on the official page');
    expect(ghw.startDate).toBe('');
    expect(ghw.endDate).toBe('');
    expect(ghw.registrationDeadline).toBe('');
    expect(ghw.eligibilityText.toLowerCase()).toContain('free');
    expect(ghw.eligibilityText.toLowerCase()).toContain('13+');
    expect(ghw.eligibilityText.toLowerCase()).toContain('all countries');
    expect(ghw.eligibilityText.toLowerCase()).toContain('online');
    // Does not invent prizes or fees
    expect(ghw.prizeText.toLowerCase()).toContain('confirm on official page');
    expect(ghw.entryFeeText.toLowerCase()).toContain('free');

    // 2. MLH Hackathon Season
    const season = recurring.find(h => 
      h.name.toLowerCase().includes('hackathon season') || 
      h.officialUrl.includes('mlh.com/events')
    );
    expect(season).toBeDefined();
    if (!season) return;

    expect(season.source).toBe('recurring-series');
    expect(season.officialUrl).toContain('mlh.com/events');
    expect(season.datesNote).toBe('Dates change every edition, confirm on the official page');
    expect(season.startDate).toBe('');
    expect(season.endDate).toBe('');
    expect(season.registrationDeadline).toBe('');
    expect(season.eligibilityText.toLowerCase()).toContain('student-run');
    expect(season.eligibilityText.toLowerCase()).toContain('80%');
    expect(season.prizeText.toLowerCase()).toContain('confirm on official page');

    // 3. Smart India Hackathon
    const sih = recurring.find(h => 
      h.name.toLowerCase().includes('smart india hackathon') || 
      h.officialUrl.includes('sih.gov.in')
    );
    expect(sih).toBeDefined();
    if (!sih) return;

    expect(sih.source).toBe('recurring-series');
    expect(sih.country).toBe('India');
    expect(sih.officialUrl).toContain('sih.gov.in');
    expect(sih.datesNote).toBe('Dates change every edition, confirm on the official page');
    expect(sih.startDate).toBe('');
    expect(sih.endDate).toBe('');
    expect(sih.registrationDeadline).toBe('');
    expect(sih.eligibilityText.toLowerCase()).toContain('india');
    expect(sih.eligibilityText.toLowerCase()).toContain('university students');
    expect(sih.eligibilityText.toLowerCase()).toContain('spoc');
    // Has explicit SPOC note
    expect(sih.spocNote).toBeDefined();
    expect(sih.spocNote!.toLowerCase()).toContain('spoc');
    // Does not invent prizes or fees
    expect(sih.prizeText.toLowerCase()).toContain('confirm on official page');
  });

  it('correctly maps recurring series with datesNote to active OPEN_NOW status', () => {
    const recurring = allHackathons.filter(h => h.datesNote);
    expect(recurring.length).toBeGreaterThanOrEqual(3);

    for (const item of recurring) {
      const status = HackathonsService.getHackathonStatus(item);
      expect(status).toBe('OPEN_NOW');
    }
  });

  it('validates link allowlist permits devpost.com, mlh.io, mlh.com, and sih.gov.in', () => {
    // Top allowlisted domains for Hackathons
    expect(isHostnameAllowed('devpost.com')).toBe(true);
    expect(isHostnameAllowed('mlh.io')).toBe(true);
    expect(isHostnameAllowed('mlh.com')).toBe(true);
    expect(isHostnameAllowed('sih.gov.in')).toBe(true);
    // Subdomains of mlh.com such as ghw.mlh.com and mlh.com
    expect(isHostnameAllowed('ghw.mlh.com')).toBe(true);
    expect(isHostnameAllowed('news.ycombinator.com')).toBe(true);
  });

  it('filters recurring entries by search query including SPOC and datesNote', () => {
    const spocResults = HackathonsService.filterHackathons(allHackathons, { query: 'SPOC' });
    expect(spocResults.some(h => h.name.includes('Smart India Hackathon'))).toBe(true);

    const editionResults = HackathonsService.filterHackathons(allHackathons, { query: 'edition' });
    expect(editionResults.length).toBeGreaterThanOrEqual(3);
  });
});

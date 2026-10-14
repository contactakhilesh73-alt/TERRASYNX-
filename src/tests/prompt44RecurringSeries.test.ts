import { describe, it, expect } from 'vitest';
import { HackathonsService, HACKATHONS_DATABASE } from '../services/hackathonsService';
import { Hackathon } from '../types';
import { isHostnameAllowed } from '../services/linkAllowlistService';

describe('Prompt 44: Recurring Organizers Specifications & Compliance', () => {
  const allHackathons = HackathonsService.getAllHackathons();

  it('contains the recurring entries with source recurring-series, no fixed dates, and status NOT_ANNOUNCED', () => {
    const recurring = allHackathons.filter(h => h.source === 'recurring-series');
    expect(recurring.length).toBeGreaterThanOrEqual(7);

    // 1. ETHGlobal
    const ethglobal = recurring.find(h => 
      h.name.toLowerCase() === 'ethglobal' || 
      h.officialUrl.includes('ethglobal.com/events')
    );
    expect(ethglobal).toBeDefined();
    if (ethglobal) {
      expect(ethglobal.status).toBe('NOT_ANNOUNCED');
      expect(ethglobal.source).toBe('recurring-series');
      expect(ethglobal.startDate).toBe('');
      expect(ethglobal.endDate).toBe('');
      expect(ethglobal.registrationDeadline).toBe('');
      expect(ethglobal.officialUrl).toContain('ethglobal.com/events');
      expect(ethglobal.prizeText.toLowerCase()).toBe('not listed');
      expect(ethglobal.dates).toContain('Confirm on the official page');
    }

    // 2. Google Solution Challenge
    const google = recurring.find(h => 
      h.name.toLowerCase().includes('solution challenge')
    );
    expect(google).toBeDefined();
    if (google) {
      expect(google.status).toBe('NOT_ANNOUNCED');
      expect(google.source).toBe('recurring-series');
      expect(google.startDate).toBe('');
      expect(google.endDate).toBe('');
      expect(google.eligibilityText.toLowerCase()).toContain('student teams');
      expect(google.eligibilityText.toLowerCase()).toContain('google developer groups');
      expect(google.lastEditionNote).toBeDefined();
      expect(google.lastEditionNote).toContain('20 April 2026 PT');
      expect(google.prizeText.toLowerCase()).toBe('not listed');
      expect(google.dates).toContain('Confirm on the official page');
    }

    // 3. HackMIT
    const hackmit = recurring.find(h => 
      h.name.toLowerCase() === 'hackmit' ||
      h.officialUrl.includes('hackmit.org')
    );
    expect(hackmit).toBeDefined();
    if (hackmit) {
      expect(hackmit.status).toBe('NOT_ANNOUNCED');
      expect(hackmit.source).toBe('recurring-series');
      expect(hackmit.startDate).toBe('');
      expect(hackmit.endDate).toBe('');
      expect(hackmit.officialUrl).toContain('hackmit.org');
      expect(hackmit.lastEditionNote).toBeDefined();
      expect(hackmit.lastEditionNote).toContain('19-20 Sept 2026');
      expect(hackmit.lastEditionNote?.toLowerCase()).toContain('selective application');
      expect(hackmit.prizeText.toLowerCase()).toBe('not listed');
      expect(hackmit.dates).toContain('Confirm on the official page');
    }

    // 4. Hack the North
    const hackthenorth = recurring.find(h => 
      h.name.toLowerCase() === 'hack the north' ||
      h.officialUrl.includes('hackthenorth.com')
    );
    expect(hackthenorth).toBeDefined();
    if (hackthenorth) {
      expect(hackthenorth.status).toBe('NOT_ANNOUNCED');
      expect(hackthenorth.source).toBe('recurring-series');
      expect(hackthenorth.startDate).toBe('');
      expect(hackthenorth.endDate).toBe('');
      expect(hackthenorth.officialUrl).toContain('hackthenorth.com');
      expect(hackthenorth.lastEditionNote).toBeDefined();
      expect(hackthenorth.lastEditionNote).toContain('18-20 Sept 2026');
      expect(hackthenorth.lastEditionNote?.toLowerCase()).toContain('waterloo');
      expect(hackthenorth.prizeText.toLowerCase()).toBe('not listed');
      expect(hackthenorth.dates).toContain('Confirm on the official page');
    }

    // 5. MLH Global Hack Week
    const ghw = recurring.find(h => 
      h.name.toLowerCase().includes('global hack week') || 
      h.officialUrl.includes('ghw.mlh.com')
    );
    expect(ghw).toBeDefined();
    if (ghw) {
      expect(ghw.status).toBe('NOT_ANNOUNCED');
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
      expect(ghw.prizeText.toLowerCase()).toBe('not listed');
      expect(ghw.entryFeeText.toLowerCase()).toContain('free');
    }

    // 6. MLH Season
    const season = recurring.find(h => 
      h.name.toLowerCase().includes('mlh season') || 
      h.officialUrl.includes('mlh.com/events')
    );
    expect(season).toBeDefined();
    if (season) {
      expect(season.status).toBe('NOT_ANNOUNCED');
      expect(season.source).toBe('recurring-series');
      expect(season.officialUrl).toContain('mlh.com/events');
      expect(season.datesNote).toBe('Dates change every edition, confirm on the official page');
      expect(season.startDate).toBe('');
      expect(season.endDate).toBe('');
      expect(season.eligibilityText.toLowerCase()).toContain('student-run');
      expect(season.eligibilityText.toLowerCase()).toContain('80%');
      expect(season.prizeText.toLowerCase()).toBe('not listed');
    }

    // 7. Smart India Hackathon
    const sih = recurring.find(h => 
      h.name.toLowerCase().includes('smart india hackathon') || 
      h.officialUrl.includes('sih.gov.in')
    );
    expect(sih).toBeDefined();
    if (sih) {
      expect(sih.status).toBe('NOT_ANNOUNCED');
      expect(sih.source).toBe('recurring-series');
      expect(sih.country).toBe('India');
      expect(sih.officialUrl).toContain('sih.gov.in');
      expect(sih.datesNote).toBe('Dates change every edition, confirm on the official page');
      expect(sih.startDate).toBe('');
      expect(sih.endDate).toBe('');
      expect(sih.eligibilityText.toLowerCase()).toContain('india');
      expect(sih.eligibilityText.toLowerCase()).toContain('university students');
      expect(sih.eligibilityText.toLowerCase()).toContain('spoc');
      expect(sih.spocNote).toBeDefined();
      expect(sih.spocNote!.toLowerCase()).toContain('spoc');
      expect(sih.prizeText.toLowerCase()).toBe('not listed');
    }
  });

  it('correctly maps recurring series with datesNote to active OPEN_NOW status', () => {
    const recurring = allHackathons.filter(h => h.datesNote);
    expect(recurring.length).toBeGreaterThanOrEqual(7);

    for (const item of recurring) {
      const status = HackathonsService.getHackathonStatus(item);
      expect(status).toBe('OPEN_NOW');
    }
  });

  it('validates link allowlist permits devpost.com, mlh.io, mlh.com, ethglobal.com, hackmit.org, hackthenorth.com and sih.gov.in', () => {
    expect(isHostnameAllowed('devpost.com')).toBe(true);
    expect(isHostnameAllowed('mlh.io')).toBe(true);
    expect(isHostnameAllowed('mlh.com')).toBe(true);
    expect(isHostnameAllowed('sih.gov.in')).toBe(true);
    expect(isHostnameAllowed('ghw.mlh.com')).toBe(true);
    expect(isHostnameAllowed('ethglobal.com')).toBe(true);
    expect(isHostnameAllowed('hackmit.org')).toBe(true);
    expect(isHostnameAllowed('hackthenorth.com')).toBe(true);
  });

  it('filters recurring entries by search query including SPOC, lastEditionNote and datesNote', () => {
    const spocResults = HackathonsService.filterHackathons(allHackathons, { query: 'SPOC' });
    expect(spocResults.some(h => h.name.includes('Smart India Hackathon'))).toBe(true);

    const editionResults = HackathonsService.filterHackathons(allHackathons, { query: 'edition' });
    expect(editionResults.length).toBeGreaterThanOrEqual(7);

    const waterlooResults = HackathonsService.filterHackathons(allHackathons, { query: 'Waterloo' });
    expect(waterlooResults.some(h => h.name.includes('Hack the North'))).toBe(true);
  });
});

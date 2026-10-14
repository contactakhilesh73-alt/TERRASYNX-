import { describe, it, expect } from 'vitest';
import { HackathonsService, HACKATHONS_DATABASE } from '../services/hackathonsService';
import { Hackathon, HackathonMode, HackathonSource } from '../types';

describe('Prompt 42: Hackathons Portal & Data Specification', () => {
  const allHackathons = HackathonsService.getAllHackathons();

  it('validates that all hackathons conform to the Hackathon type specification', () => {
    expect(allHackathons.length).toBeGreaterThanOrEqual(15);

    for (const h of allHackathons) {
      expect(typeof h.id).toBe('string');
      expect(h.id.length).toBeGreaterThan(0);

      expect(typeof h.name).toBe('string');
      expect(h.name.length).toBeGreaterThan(0);

      expect(typeof h.organizer).toBe('string');
      expect(h.organizer.length).toBeGreaterThan(0);

      expect(['online', 'in-person', 'hybrid']).toContain(h.mode);

      // Prompt 42 requirement: country ('Online/Global' when virtual)
      if (h.mode === 'online') {
        expect(h.country).toBe('Online/Global');
      } else {
        expect(typeof h.country).toBe('string');
        expect(h.country.length).toBeGreaterThan(0);
      }

      expect(Array.isArray(h.themes)).toBe(true);
      expect(h.themes.length).toBeGreaterThan(0);

      expect(typeof h.eligibilityText).toBe('string');
      expect(h.eligibilityText.length).toBeGreaterThan(0);

      expect(typeof h.entryFeeText).toBe('string');
      expect(h.entryFeeText.length).toBeGreaterThan(0);

      expect(typeof h.prizeText).toBe('string');
      expect(h.prizeText.length).toBeGreaterThan(0);

      expect(typeof h.startDate).toBe('string');
      expect(typeof h.endDate).toBe('string');
      expect(typeof h.registrationDeadline).toBe('string');

      expect(typeof h.officialUrl).toBe('string');
      expect(h.officialUrl.startsWith('http')).toBe(true);

      // Prompt 42 requirement: source ('devpost-live' | 'recurring-series')
      expect(['devpost-live', 'recurring-series']).toContain(h.source);
    }
  });

  it('contains hackathons across both devpost-live and recurring-series sources', () => {
    const devpost = allHackathons.filter(h => h.source === 'devpost-live');
    const recurring = allHackathons.filter(h => h.source === 'recurring-series');

    expect(devpost.length).toBeGreaterThanOrEqual(4);
    expect(recurring.length).toBeGreaterThanOrEqual(8);
  });

  it('contains hackathons across all 3 modes: online, in-person, hybrid', () => {
    const online = allHackathons.filter(h => h.mode === 'online');
    const inPerson = allHackathons.filter(h => h.mode === 'in-person');
    const hybrid = allHackathons.filter(h => h.mode === 'hybrid');

    expect(online.length).toBeGreaterThanOrEqual(5);
    expect(inPerson.length).toBeGreaterThanOrEqual(3);
    expect(hybrid.length).toBeGreaterThanOrEqual(4);
  });

  it('correctly resolves status tabs (Open Now, Upcoming, Passed)', () => {
    const refDate = new Date('2026-10-15T12:00:00Z');

    const openNow = HackathonsService.filterHackathons(
      allHackathons,
      { statusTab: 'OPEN_NOW' },
      refDate
    );
    const upcoming = HackathonsService.filterHackathons(
      allHackathons,
      { statusTab: 'UPCOMING' },
      refDate
    );
    const passed = HackathonsService.filterHackathons(
      allHackathons,
      { statusTab: 'PASSED' },
      refDate
    );

    expect(openNow.length).toBeGreaterThan(0);
    expect(upcoming.length).toBeGreaterThan(0);
    expect(passed.length).toBeGreaterThan(0);

    // Sum should equal total hackathons
    expect(openNow.length + upcoming.length + passed.length).toBe(allHackathons.length);
  });

  it('filters by mode, country, theme, and query without error', () => {
    const refDate = new Date('2026-10-15T12:00:00Z');

    // Filter by mode
    const onlineHackathons = HackathonsService.filterHackathons(
      allHackathons,
      { mode: 'online' },
      refDate
    );
    for (const h of onlineHackathons) {
      expect(h.mode).toBe('online');
    }

    // Filter by country
    const usHackathons = HackathonsService.filterHackathons(
      allHackathons,
      { country: 'United States' },
      refDate
    );
    for (const h of usHackathons) {
      expect(h.country).toBe('United States');
    }

    // Filter by theme
    const aiHackathons = HackathonsService.filterHackathons(
      allHackathons,
      { theme: 'AI / Machine Learning' },
      refDate
    );
    for (const h of aiHackathons) {
      expect(h.themes).toContain('AI / Machine Learning');
    }

    // Filter by search query
    const devpostQuery = HackathonsService.filterHackathons(
      allHackathons,
      { query: 'devpost' },
      refDate
    );
    expect(devpostQuery.length).toBeGreaterThan(0);
  });

  it('guarantees that hackathons are NEVER hidden based on eligibility', () => {
    const refDate = new Date('2026-10-15T12:00:00Z');
    
    // Default unfiltered list has all hackathons
    const unfiltered = HackathonsService.filterHackathons(allHackathons, {}, refDate);
    expect(unfiltered.length).toBe(allHackathons.length);

    // Every item retains its honest eligibilityText for student transparency
    for (const h of unfiltered) {
      expect(h.eligibilityText).toBeDefined();
      expect(h.eligibilityText.length).toBeGreaterThan(5);
    }
  });

  it('supports an honest empty state when no hackathons match restrictive filters', () => {
    const refDate = new Date('2026-10-15T12:00:00Z');
    const impossibleMatches = HackathonsService.filterHackathons(
      allHackathons,
      {
        mode: 'in-person',
        country: 'Online/Global', // An in-person hackathon never has 'Online/Global' country
        query: 'xyznonexistentterm99999'
      },
      refDate
    );

    expect(impossibleMatches.length).toBe(0);
  });
});

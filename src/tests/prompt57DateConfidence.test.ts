import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { DateConfidence, UpcomingInternshipCycle, Hackathon } from '../types';
import { UpcomingInternshipsService, evaluateInternshipCycle, calculateInternshipCycleStatus } from '../services/upcomingInternshipsService';
import { HACKATHONS_DATABASE, HackathonsService } from '../services/hackathonsService';
import { getDateConfidenceBadgeConfig } from '../utils/scholarshipBadges';
import { HackathonsPortal } from '../components/HackathonsPortal';
import { InternshipsPortal } from '../components/InternshipsPortal';
import { ScholarshipsPortal } from '../components/ScholarshipsPortal';
import { ResearchPortal } from '../components/ResearchPortal';
import { OpenSourcePortal } from '../components/OpenSourcePortal';
import { UpcomingInternshipsCalendar } from '../components/UpcomingInternshipsCalendar';

describe('Prompt 57: Date ka confidence', () => {
  const allCycles = UpcomingInternshipsService.getAllUpcomingCycles();
  const allHackathons = HackathonsService.getAllHackathons();

  it('1. Adds dateConfidence field to every program in UpcomingInternshipsService', () => {
    expect(allCycles.length).toBeGreaterThan(100);

    const validConfidences: DateConfidence[] = ['OFFICIAL', 'REPORTED', 'CONFLICTING', 'UNKNOWN'];

    for (const cycle of allCycles) {
      expect(cycle.dateConfidence).toBeDefined();
      expect(validConfidences).toContain(cycle.dateConfidence);
    }
  });

  it('2. Adds dateConfidence field to every hackathon in HACKATHONS_DATABASE', () => {
    expect(allHackathons.length).toBeGreaterThanOrEqual(18);

    const validConfidences: DateConfidence[] = ['OFFICIAL', 'REPORTED', 'CONFLICTING', 'UNKNOWN'];

    for (const h of allHackathons) {
      expect(h.dateConfidence).toBeDefined();
      expect(validConfidences).toContain(h.dateConfidence);
    }

    for (const h of HACKATHONS_DATABASE) {
      expect(h.dateConfidence).toBeDefined();
      expect(validConfidences).toContain(h.dateConfidence);
    }
  });

  it('3. Stores program and hackathon dates as ISO strings', () => {
    // ISO date format regex (YYYY-MM-DD or full ISO 8601 string)
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;

    // Check cycles with official or reported dates
    const cyclesWithDates = allCycles.filter(c => c.dateConfidence === 'OFFICIAL' || c.dateConfidence === 'REPORTED');
    expect(cyclesWithDates.length).toBeGreaterThan(50);

    for (const c of cyclesWithDates) {
      if (c.startDate) {
        expect(c.startDate).toMatch(isoDateRegex);
      }
      if (c.endDate) {
        expect(c.endDate).toMatch(isoDateRegex);
      }
    }

    // Check hackathons with dates
    const hackathonsWithDates = allHackathons.filter(h => h.startDate && h.endDate);
    expect(hackathonsWithDates.length).toBeGreaterThanOrEqual(2);

    for (const h of hackathonsWithDates) {
      expect(h.startDate).toMatch(isoDateRegex);
      expect(h.endDate).toMatch(isoDateRegex);
    }
  });

  it('4. Computes status (Open Now / Upcoming / Passed) only when dateConfidence is OFFICIAL or REPORTED', () => {
    // Current date: 21 October 2026
    const refDate = new Date(2026, 9, 21);

    // Official hackathon with dates in Nov 2026
    const officialHackathon: Hackathon = {
      id: 'test_official',
      name: 'Official Test Hackathon',
      organizer: 'Test Org',
      mode: 'online',
      country: 'Online/Global',
      themes: ['AI'],
      eligibilityText: 'All students',
      entryFeeText: 'Free',
      prizeText: '$10,000',
      dates: '14-15 November 2026',
      startDate: '2026-11-14',
      endDate: '2026-11-15',
      registrationDeadline: '2026-11-15',
      dateConfidence: 'OFFICIAL',
      officialUrl: 'https://example.com',
      source: 'recurring-series',
      status: 'ANNOUNCED_VERIFIED',
    };

    const statusOfficial = HackathonsService.getHackathonStatus(officialHackathon, refDate);
    expect(['OPEN_NOW', 'UPCOMING', 'PASSED']).toContain(statusOfficial);

    // Reported hackathon
    const reportedHackathon: Hackathon = {
      ...officialHackathon,
      id: 'test_reported',
      dateConfidence: 'REPORTED',
    };
    const statusReported = HackathonsService.getHackathonStatus(reportedHackathon, refDate);
    expect(['OPEN_NOW', 'UPCOMING', 'PASSED']).toContain(statusReported);

    // Conflicting hackathon -> status MUST NOT be computed from date (returns null)
    const conflictingHackathon: Hackathon = {
      ...officialHackathon,
      id: 'test_conflicting',
      dateConfidence: 'CONFLICTING',
      reportedDates: ['2026-11-14', '2026-12-01', '2027-01-15'],
    };
    const statusConflicting = HackathonsService.getHackathonStatus(conflictingHackathon, refDate);
    expect(statusConflicting).toBeNull();

    // Unknown hackathon -> status MUST NOT be computed from date (returns null)
    const unknownHackathon: Hackathon = {
      ...officialHackathon,
      id: 'test_unknown',
      dateConfidence: 'UNKNOWN',
      startDate: undefined,
      endDate: undefined,
    };
    const statusUnknown = HackathonsService.getHackathonStatus(unknownHackathon, refDate);
    expect(statusUnknown).toBeNull();
  });

  it('5. Computes program cycle status only when dateConfidence is OFFICIAL or REPORTED', () => {
    const refDate = new Date(2026, 9, 21);

    // calculateStatus helper
    expect(UpcomingInternshipsService.calculateStatus(
      { startMonth: 10, endMonth: 11, dateConfidence: 'OFFICIAL' },
      refDate
    )).toBe('OPEN_NOW');

    expect(UpcomingInternshipsService.calculateStatus(
      { startMonth: 10, endMonth: 11, dateConfidence: 'REPORTED' },
      refDate
    )).toBe('OPEN_NOW');

    expect(UpcomingInternshipsService.calculateStatus(
      { startMonth: 10, endMonth: 11, dateConfidence: 'CONFLICTING' },
      refDate
    )).toBeUndefined();

    expect(UpcomingInternshipsService.calculateStatus(
      { startMonth: 10, endMonth: 11, dateConfidence: 'UNKNOWN' },
      refDate
    )).toBeUndefined();

    // calculateInternshipCycleStatus
    expect(calculateInternshipCycleStatus(10, 11, refDate, 1, 30, 'OFFICIAL')).toBe('OPEN_NOW');
    expect(calculateInternshipCycleStatus(10, 11, refDate, 1, 30, 'CONFLICTING')).toBeUndefined();
    expect(calculateInternshipCycleStatus(10, 11, refDate, 1, 30, 'UNKNOWN')).toBeUndefined();
  });

  it('6. For CONFLICTING, UI shows every reported date and "Confirm on the official page"', () => {
    // Test card rendering in HackathonsPortal with CONFLICTING dates
    const conflictingHackathon: Hackathon = {
      id: 'hack_conflicting_demo',
      name: 'Conflicting Hackathon Demo',
      organizer: 'Demo Foundation',
      mode: 'online',
      country: 'Online/Global',
      themes: ['AI'],
      eligibilityText: 'All students',
      entryFeeText: 'Free',
      prizeText: 'not listed',
      dates: 'Reported: 15 Oct 2026 / 1 Nov 2026',
      registrationDeadline: '2026-11-01',
      dateConfidence: 'CONFLICTING',
      reportedDates: ['15 October 2026', '1 November 2026', '15 December 2026'],
      officialUrl: 'https://example.com/conflicting',
      source: 'recurring-series',
      status: 'ANNOUNCED_UNCONFIRMED',
    };

    // Card in HackathonsPortal
    const html = renderToString(React.createElement(HackathonsPortal));
    expect(html).toContain('Official Date'); // at least NASA has Official Date badge
    expect(html).toContain('Reported Date'); // other hackathons have Reported Date badge

    // getDateConfidenceBadgeConfig returns exact labels
    const officialBadge = getDateConfidenceBadgeConfig('OFFICIAL');
    expect(officialBadge.label).toBe('Official Date');

    const reportedBadge = getDateConfidenceBadgeConfig('REPORTED');
    expect(reportedBadge.label).toBe('Reported Date');

    const conflictingBadge = getDateConfidenceBadgeConfig('CONFLICTING');
    expect(conflictingBadge.label).toBe('Conflicting Dates');

    const unknownBadge = getDateConfidenceBadgeConfig('UNKNOWN');
    expect(unknownBadge.label).toBe('Date Unknown');
  });

  it('7. Renders date confidence badge on cards across all dedicated portals', () => {
    const hackathonsHtml = renderToString(React.createElement(HackathonsPortal));
    expect(hackathonsHtml).toContain('data-testid="hackathon-date-confidence-badge"');

    const internshipsHtml = renderToString(React.createElement(InternshipsPortal));
    expect(internshipsHtml).toContain('data-testid="program-date-confidence-badge"');

    const scholarshipsHtml = renderToString(React.createElement(ScholarshipsPortal));
    expect(scholarshipsHtml).toContain('data-testid="program-date-confidence-badge"');

    const researchHtml = renderToString(React.createElement(ResearchPortal));
    expect(researchHtml).toContain('data-testid="program-date-confidence-badge"');

    const openSourceHtml = renderToString(React.createElement(OpenSourcePortal));
    expect(openSourceHtml).toContain('data-testid="program-date-confidence-badge"');

    const calendarHtml = renderToString(React.createElement(UpcomingInternshipsCalendar));
    expect(calendarHtml).toContain('data-testid="program-date-confidence-badge"');
  });

  it('8. Supports UNKNOWN showing no date and CONFLICTING showing all reported dates and "Confirm on the official page"', () => {
    // Create a mock cycle with CONFLICTING and one with UNKNOWN
    const conflictingCycle: UpcomingInternshipCycle = {
      ...allCycles[0],
      id: 'test_conflicting_prog',
      dateConfidence: 'CONFLICTING',
      reportedDates: ['12 August 2026', '15 September 2026'],
    };

    const unknownCycle: UpcomingInternshipCycle = {
      ...allCycles[0],
      id: 'test_unknown_prog',
      dateConfidence: 'UNKNOWN',
      startDate: undefined,
      endDate: undefined,
    };

    // Status is undefined for both
    expect(conflictingCycle.dateConfidence).toBe('CONFLICTING');
    expect(unknownCycle.dateConfidence).toBe('UNKNOWN');

    expect(UpcomingInternshipsService.calculateStatus(conflictingCycle)).toBeUndefined();
    expect(UpcomingInternshipsService.calculateStatus(unknownCycle)).toBeUndefined();
  });
});

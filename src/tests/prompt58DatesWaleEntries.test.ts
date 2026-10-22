import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { UpcomingInternshipsService } from '../services/upcomingInternshipsService';
import { HACKATHONS_DATABASE, HackathonsService } from '../services/hackathonsService';
import { HackathonsPortal } from '../components/HackathonsPortal';
import { ResearchPortal } from '../components/ResearchPortal';

describe('Prompt 58: Dates wale entries', () => {
  const allCycles = UpcomingInternshipsService.getAllUpcomingCycles();
  const allHackathons = HackathonsService.getAllHackathons();

  it('1. EPFL Life Sciences Summer Research Program has complete specifications and REPORTED dateConfidence', () => {
    const epflLifeSciences = allCycles.find(c => c.id === 'cycle_epfl_life_sciences');
    expect(epflLifeSciences).toBeDefined();
    if (!epflLifeSciences) return;

    // Switzerland, summer_research
    expect(epflLifeSciences.country).toBe('Switzerland');
    expect(epflLifeSciences.studyLevel).toBe('summer_research');

    // dateConfidence: REPORTED
    expect(epflLifeSciences.dateConfidence).toBe('REPORTED');

    // rateType: MARKET_ESTIMATED
    expect(epflLifeSciences.rateType).toBe('MARKET_ESTIMATED');

    // 20-25 places
    expect(epflLifeSciences.seatQuotaInfo).toBe('20-25 places');

    const combinedText = [
      epflLifeSciences.eligibility,
      epflLifeSciences.eligibilityCriteria,
      epflLifeSciences.selectionCriteria,
      epflLifeSciences.exactWindowText,
      epflLifeSciences.expectedWindowDuration,
      epflLifeSciences.annualRecurrencePattern,
      epflLifeSciences.historicalCompensation,
      epflLifeSciences.coverageBreakdown,
      epflLifeSciences.actionTip,
      epflLifeSciences.disclaimerNotice,
      JSON.stringify(epflLifeSciences.timelinePhases || {})
    ].join(' ').toLowerCase();

    // life sciences students only (not computer science)
    expect(combinedText).toContain('life sciences students only');
    expect(combinedText).toContain('not computer science');

    // deadline 15 November 2026 23:59 CET (REPORTED)
    expect(combinedText).toContain('15 november 2026 23:59 cet');
    expect(epflLifeSciences.endDate).toBe('2026-11-15');

    // program 5 July to 27 August 2027
    expect(combinedText).toContain('5 july to 27 august 2027');

    // stipend CHF 3,600
    expect(combinedText).toContain('chf 3,600');

    // housing/living covered by the stipend
    expect(combinedText).toContain('housing/living covered by the stipend');

    // airfare support reported by some sources: confirm
    expect(combinedText).toContain('airfare support reported by some sources: confirm');

    // no fee
    expect(combinedText).toContain('no fee');

    // 20-25 places
    expect(combinedText).toContain('20-25 places');
  });

  it('2. EPFL Excellence in Engineering and Summer@EPFL have dateConfidence REPORTED and aggregator note', () => {
    const epflEee = allCycles.find(c => c.id === 'cycle_epfl_excellence_engineering');
    const epflCs = allCycles.find(c => c.id === 'cycle_epfl_summer_ic');

    expect(epflEee).toBeDefined();
    expect(epflCs).toBeDefined();
    if (!epflEee || !epflCs) return;

    // Both dateConfidence REPORTED
    expect(epflEee.dateConfidence).toBe('REPORTED');
    expect(epflCs.dateConfidence).toBe('REPORTED');

    // Deadlines
    expect(epflEee.endDate).toBe('2026-11-01');
    expect(epflCs.endDate).toBe('2026-11-29');

    // Both contain "dates from aggregators, confirm on epfl.ch"
    const textEee = [
      epflEee.eligibility,
      epflEee.eligibilityCriteria,
      epflEee.actionTip,
      epflEee.disclaimerNotice,
      epflEee.exactWindowText,
      epflEee.annualRecurrencePattern
    ].join(' ').toLowerCase();

    const textCs = [
      epflCs.eligibility,
      epflCs.eligibilityCriteria,
      epflCs.actionTip,
      epflCs.disclaimerNotice,
      epflCs.exactWindowText,
      epflCs.annualRecurrencePattern
    ].join(' ').toLowerCase();

    expect(textEee).toContain('dates from aggregators, confirm on epfl.ch');
    expect(textCs).toContain('dates from aggregators, confirm on epfl.ch');
  });

  it('3. ETHGlobal Mumbai has CONFLICTING dates, registration closing note, and refundable crypto stake', () => {
    const mumbai = allHackathons.find(h => h.id === 'hack_ethglobal_mumbai' || h.name === 'ETHGlobal Mumbai');
    expect(mumbai).toBeDefined();
    if (!mumbai) return;

    // dateConfidence CONFLICTING
    expect(mumbai.dateConfidence).toBe('CONFLICTING');

    // reportedDates contains both 5-7 November and 6-8 November
    expect(mumbai.reportedDates).toBeDefined();
    expect(mumbai.reportedDates).toContain('5-7 November 2026');
    expect(mumbai.reportedDates).toContain('6-8 November 2026');

    // registration reported to close 3 November: confirm
    expect(mumbai.registrationDeadline).toBe('2026-11-03');

    const allText = [
      mumbai.description,
      mumbai.lastEditionNote,
      mumbai.eligibilityText,
      mumbai.entryFeeText,
      mumbai.dates
    ].join(' ').toLowerCase();

    // application and approval required
    expect(allText).toContain('application and approval required');

    // small refundable crypto stake
    expect(allText).toContain('small refundable crypto stake');

    // registration reported to close 3 november: confirm
    expect(allText).toContain('registration reported to close 3 november: confirm');

    // Ensure status computation does not return OPEN_NOW / UPCOMING for CONFLICTING dates
    const computedStatus = HackathonsService.getHackathonStatus(mumbai);
    expect(computedStatus).toBeNull();
  });

  it('4. NASA Space Apps Challenge has 14-15 November 2026 and OFFICIAL dateConfidence', () => {
    const nasa = allHackathons.find(h => h.id === 'hack_nasa_space_apps' || h.name.includes('Space Apps'));
    expect(nasa).toBeDefined();
    if (!nasa) return;

    expect(nasa.dates).toContain('14-15 November 2026');
    expect(nasa.dateConfidence).toBe('OFFICIAL');
  });

  it('5. TCS CodeVita has registration deadline 13 November 2026 and REPORTED dateConfidence', () => {
    const codevita = allHackathons.find(h => h.id === 'contest_tcs_codevita' || h.name === 'TCS CodeVita');
    expect(codevita).toBeDefined();
    if (!codevita) return;

    expect(codevita.registrationDeadline).toBe('2026-11-13');
    expect(codevita.dateConfidence).toBe('REPORTED');
  });

  it('6. HTML rendering displays date confidence badges and notes for Prompt 58 entries', () => {
    const hackathonsHtml = renderToString(React.createElement(HackathonsPortal));
    expect(hackathonsHtml).toContain('ETHGlobal Mumbai');
    expect(hackathonsHtml).toContain('Conflicting Dates');
    expect(hackathonsHtml).toContain('5-7 November 2026');
    expect(hackathonsHtml).toContain('6-8 November 2026');
    expect(hackathonsHtml).toContain('small refundable crypto stake');
    expect(hackathonsHtml).toContain('TCS CodeVita');
    expect(hackathonsHtml).toContain('Reported Date');

    const researchHtml = renderToString(React.createElement(ResearchPortal));
    expect(researchHtml).toContain('EPFL Life Sciences');
    expect(researchHtml).toContain('20-25 places');
    expect(researchHtml).toContain('dates from aggregators, confirm on epfl.ch');
  });
});

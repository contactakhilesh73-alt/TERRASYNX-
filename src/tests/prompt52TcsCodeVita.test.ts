import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { HACKATHONS_DATABASE, HackathonsService } from '../services/hackathonsService';
import { HackathonsPortal } from '../components/HackathonsPortal';
import { HackathonWhitePageModal } from '../components/HackathonWhitePageModal';
import { isHostnameAllowed, validateSafeTargetUrl } from '../services/linkAllowlistService';

describe('Prompt 52: TCS CodeVita Entry, Coding Contest Type, & Constraints', () => {
  const codevita = HACKATHONS_DATABASE.find(h => h.name === 'TCS CodeVita');

  it('contains TCS CodeVita in the database with type "coding-contest"', () => {
    expect(codevita).toBeDefined();
    expect(codevita!.type).toBe('coding-contest');
  });

  it('sets status to ANNOUNCED_UNCONFIRMED', () => {
    expect(codevita!.status).toBe('ANNOUNCED_UNCONFIRMED');
  });

  it('shows officialUrl codevita.tcsapps.com', () => {
    expect(codevita!.officialUrl).toContain('codevita.tcsapps.com');
    expect(isHostnameAllowed('codevita.tcsapps.com')).toBe(true);
  });

  it('contains the exact specified note verbatim', () => {
    const expectedNote = 'Season 14 dates reported by third-party sources (registration deadline 13 November 2026, MockVita 23-24 October and 13-14 November, Pre-Qualifier 11-12 December); prize figures differ between sources; confirm on the official portal';
    
    // Check in datesNote or lastEditionNote
    const hasNote = 
      (codevita!.datesNote && codevita!.datesNote.includes(expectedNote)) ||
      (codevita!.lastEditionNote && codevita!.lastEditionNote.includes(expectedNote));
    
    expect(hasNote).toBe(true);
  });

  it('has prizeText "not listed"', () => {
    expect(codevita!.prizeText.toLowerCase()).toBe('not listed');
  });

  it('has exact eligibility text: "Science/Engineering UG/PG students, graduation year as stated on the official portal"', () => {
    expect(codevita!.eligibilityText).toBe('Science/Engineering UG/PG students, graduation year as stated on the official portal');
  });

  it('does NOT state that it leads to a job, hiring, or recruitment', () => {
    const allText = [
      codevita!.name,
      codevita!.description,
      codevita!.eligibilityText,
      codevita!.prizeText,
      codevita!.datesNote,
      codevita!.lastEditionNote
    ].filter(Boolean).join(' ').toLowerCase();

    expect(allText).not.toContain('job offer');
    expect(allText).not.toContain('leads to a job');
    expect(allText).not.toContain('hiring offer');
    expect(allText).not.toContain('guaranteed interview');
    expect(allText).not.toContain('placement');
    expect(allText).not.toContain('recruitment');
  });

  it('correctly filters TCS CodeVita when filtering by type "coding-contest"', () => {
    const contests = HackathonsService.filterHackathons(HACKATHONS_DATABASE, { type: 'coding-contest' });
    expect(contests.length).toBeGreaterThanOrEqual(1);
    expect(contests.some(c => c.name === 'TCS CodeVita')).toBe(true);

    const hackathons = HackathonsService.filterHackathons(HACKATHONS_DATABASE, { type: 'hackathon' });
    expect(hackathons.every(h => h.name !== 'TCS CodeVita')).toBe(true);
  });

  it('does NOT render the HackathonWhitePageModal because status is ANNOUNCED_UNCONFIRMED', () => {
    const html = renderToString(
      React.createElement(HackathonWhitePageModal, {
        hackathon: codevita!,
        isOpen: true,
        onClose: () => {},
      })
    );
    expect(html).toBe('');
  });

  it('renders TCS CodeVita card with officialUrl codevita.tcsapps.com and contest note on HackathonsPortal', () => {
    const html = renderToString(React.createElement(HackathonsPortal));
    expect(html).toContain('TCS CodeVita');
    expect(html).toContain('codevita.tcsapps.com');
    expect(html).toContain('coding-contest');
    expect(html).toContain('Pre-Qualifier 11-12 December');
    expect(html).toContain('Science/Engineering UG/PG students');
  });
});

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { HACKATHONS_DATABASE, HackathonsService } from '../services/hackathonsService';
import { HackathonsPortal } from '../components/HackathonsPortal';
import { isHostnameAllowed } from '../services/linkAllowlistService';

describe('Prompt 48 (naya version): Updated HACKATHONS_DATABASE & Strict Specification', () => {
  const allHackathons = HackathonsService.getAllHackathons();

  it('ensures source is ALWAYS recurring-series (never devpost-live)', () => {
    for (const h of allHackathons) {
      expect(h.source).toBe('recurring-series');
      expect(h.source).not.toBe('devpost-live');
    }
  });

  it('ensures prizeText is "not listed" unless explicitly stated', () => {
    for (const h of allHackathons) {
      if (h.name === 'Cal Hacks') {
        expect(h.prizeText).toBe('$200,000+');
      } else if (h.name === 'Microsoft Imagine Cup') {
        expect(h.prizeText).toContain('$100,000');
      } else {
        expect(h.prizeText.toLowerCase()).toBe('not listed');
      }
    }
  });

  it('ensures every card includes confirmation guidance ("Confirm on the official page")', () => {
    for (const h of allHackathons) {
      const combinedNotes = [
        h.lastEditionNote,
        h.datesNote,
        h.dates
      ].filter(Boolean).join(' ').toLowerCase();

      expect(combinedNotes).toContain('confirm on the official');
    }
  });

  it('accurately configures NASA International Space Apps Challenge', () => {
    const nasa = allHackathons.find(h => h.name.includes('Space Apps'));
    expect(nasa).toBeDefined();
    expect(nasa!.status).toBe('ANNOUNCED_VERIFIED');
    expect(nasa!.dates).toContain('14-15 November 2026');
    expect(nasa!.startDate).toBe('2026-11-14');
    expect(nasa!.endDate).toBe('2026-11-15');
    expect(nasa!.officialUrl).toContain('spaceappschallenge.org');
    expect(isHostnameAllowed('spaceappschallenge.org')).toBe(true);
    expect(nasa!.entryFeeText.toLowerCase()).toContain('free');
    expect(nasa!.eligibilityText).toContain('all ages');
    expect(nasa!.eligibilityText).toContain('teams up to 6');
    expect(nasa!.lastEditionNote).toContain('registration open since 26 August');
    expect(nasa!.lastEditionNote).toContain('challenge statements 28 October');
    expect(nasa!.lastEditionNote).toContain('some local events are full');
  });

  it('accurately configures Junction with "Registration closed"', () => {
    const junction = allHackathons.find(h => h.name === 'Junction');
    expect(junction).toBeDefined();
    expect(junction!.dates).toContain('13-15 Nov');
    expect(junction!.startDate).toBe('2026-11-13');
    expect(junction!.endDate).toBe('2026-11-15');
    expect(junction!.registrationDeadline).toBe('2026-09-06');
    expect(junction!.lastEditionNote).toContain('travel grants');
    expect(junction!.lastEditionNote).toContain('Espoo');
    expect(junction!.lastEditionNote).toContain('registration closed 6 Sept');

    // Portal rendering shows "Registration closed"
    const html = renderToString(React.createElement(HackathonsPortal));
    expect(html).toContain('Registration closed');
  });

  it('accurately configures Colosseum / Solana hackathons', () => {
    const colosseum = allHackathons.find(h => h.name.includes('Colosseum'));
    expect(colosseum).toBeDefined();
    expect(colosseum!.status).toBe('NOT_ANNOUNCED');
    expect(colosseum!.mode).toBe('online');
    expect(colosseum!.prizeText.toLowerCase()).toBe('not listed');
    expect(colosseum!.lastEditionNote).toContain('Frontier');
    expect(colosseum!.lastEditionNote).toContain('$2.5M');
    expect(colosseum!.lastEditionNote).toContain('NOT_ANNOUNCED');
    expect(isHostnameAllowed('colosseum.org')).toBe(true);
  });

  it('accurately configures Cal Hacks with prize "$200,000+"', () => {
    const calHacks = allHackathons.find(h => h.name === 'Cal Hacks');
    expect(calHacks).toBeDefined();
    expect(calHacks!.status).toBe('NOT_ANNOUNCED');
    expect(calHacks!.prizeText).toBe('$200,000+');
    expect(calHacks!.lastEditionNote).toContain('24-26 Oct 2025');
    expect(calHacks!.lastEditionNote).toContain('2026 not confirmed');
    expect(isHostnameAllowed('calhacks.io')).toBe(true);
  });

  it('accurately configures PennApps', () => {
    const pennapps = allHackathons.find(h => h.name === 'PennApps');
    expect(pennapps).toBeDefined();
    expect(pennapps!.status).toBe('NOT_ANNOUNCED');
    expect(pennapps!.prizeText.toLowerCase()).toBe('not listed');
    expect(pennapps!.lastEditionNote).toContain('Runs twice a year');
    expect(pennapps!.lastEditionNote).toContain('2026 fall not confirmed');
    expect(isHostnameAllowed('pennapps.com')).toBe(true);
  });

  it('verifies that all other major recurring series are marked NOT_ANNOUNCED', () => {
    const notAnnouncedNames = [
      'ETHGlobal',
      'Google Solution Challenge',
      'HackMIT',
      'Hack the North',
      'TreeHacks',
      'Microsoft Imagine Cup',
      'MLH Global Hack Week',
      'MLH Season',
      'Smart India Hackathon',
      'Colosseum / Solana Hackathons',
      'Cal Hacks',
      'PennApps'
    ];

    for (const name of notAnnouncedNames) {
      const h = allHackathons.find(item => item.name === name);
      expect(h).toBeDefined();
      expect(h!.status).toBe('NOT_ANNOUNCED');
    }
  });

  it('preserves the user-added coding contests from Prompts 52 and 53', () => {
    const codevita = allHackathons.find(h => h.name === 'TCS CodeVita');
    expect(codevita).toBeDefined();
    expect(codevita!.type).toBe('coding-contest');
    expect(codevita!.status).toBe('ANNOUNCED_UNCONFIRMED');

    const hackerCup = allHackathons.find(h => h.name === 'Meta Hacker Cup');
    expect(hackerCup).toBeDefined();
    expect(hackerCup!.type).toBe('coding-contest');
    expect(hackerCup!.status).toBe('NOT_ANNOUNCED');
  });
});

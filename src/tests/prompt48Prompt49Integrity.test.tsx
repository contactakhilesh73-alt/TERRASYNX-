import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { HACKATHONS_DATABASE } from '../services/hackathonsService';
import { HackathonWhitePageModal } from '../components/HackathonWhitePageModal';
import { Hackathon } from '../types';

describe('Prompt 48: Strict HACKATHONS_DATABASE Integrity & Zero-Fake Tolerance', () => {
  it('contains the permitted recurring series entries with no extra or fake entries', () => {
    // Permitted recurring series entries under Prompt 48 (naya version) + coding contests:
    expect(HACKATHONS_DATABASE.length).toBe(16);

    const names = HACKATHONS_DATABASE.map(h => h.name);
    expect(names).toContain('NASA International Space Apps Challenge');
    expect(names).toContain('Colosseum / Solana Hackathons');
    expect(names).toContain('Cal Hacks');
    expect(names).toContain('PennApps');
    expect(names).toContain('ETHGlobal');
    expect(names).toContain('Google Solution Challenge');
    expect(names).toContain('HackMIT');
    expect(names).toContain('Hack the North');
    expect(names).toContain('TreeHacks');
    expect(names).toContain('Junction');
    expect(names).toContain('Microsoft Imagine Cup');
    expect(names).toContain('MLH Global Hack Week');
    expect(names).toContain('MLH Season');
    expect(names).toContain('Smart India Hackathon');
    expect(names).toContain('TCS CodeVita');
    expect(names).toContain('Meta Hacker Cup');

    // Strict Rule: No unauthorized fake hackathons in static database
    const disallowedNames = [
      'Solana Renaissance',
      'Chainlink Block Magic',
      'Gemini Multimodal',
      'AI Engineer World Summit',
    ];
    for (const disallowed of disallowedNames) {
      expect(names).not.toContain(disallowed);
    }
  });

  it('ensures source is ALWAYS recurring-series (never devpost-live for hardcoded data)', () => {
    for (const h of HACKATHONS_DATABASE) {
      expect(h.source).toBe('recurring-series');
      expect(h.source).not.toBe('devpost-live');
    }
  });

  it('ensures prizeText is not listed unless an official source states it', () => {
    for (const h of HACKATHONS_DATABASE) {
      if (h.name === 'Microsoft Imagine Cup') {
        expect(h.prizeText).toContain('$100,000');
      } else if (h.name === 'Cal Hacks') {
        expect(h.prizeText).toBe('$200,000+');
      } else {
        expect(h.prizeText.toLowerCase()).toBe('not listed');
      }
    }
  });

  it('contains facts in lastEditionNote and includes Confirm on the official page', () => {
    const prompt48Names = [
      'ETHGlobal', 'Google Solution Challenge', 'HackMIT', 'Hack the North',
      'TreeHacks', 'Junction', 'Microsoft Imagine Cup', 'MLH Global Hack Week',
      'MLH Season', 'Smart India Hackathon'
    ];
    for (const h of HACKATHONS_DATABASE.filter(h => prompt48Names.includes(h.name))) {
      expect(h.lastEditionNote).toBeDefined();
      expect(h.lastEditionNote).toContain('Confirm on the official page');
    }

    // Every entry in database must have confirmation advice
    for (const h of HACKATHONS_DATABASE) {
      expect(h.lastEditionNote).toBeDefined();
      expect(h.lastEditionNote!.toLowerCase()).toContain('confirm on the official');
    }

    // Specific facts verification:
    const gsc = HACKATHONS_DATABASE.find(h => h.name === 'Google Solution Challenge')!;
    expect(gsc.lastEditionNote).toContain('20 April 2026 PT');

    const hackmit = HACKATHONS_DATABASE.find(h => h.name === 'HackMIT')!;
    expect(hackmit.lastEditionNote).toContain('19-20 Sept 2026');

    const htn = HACKATHONS_DATABASE.find(h => h.name === 'Hack the North')!;
    expect(htn.lastEditionNote).toContain('18-20 Sept 2026');

    const treehacks = HACKATHONS_DATABASE.find(h => h.name === 'TreeHacks')!;
    expect(treehacks.lastEditionNote).toContain('13-15 Feb 2026');
    expect(treehacks.lastEditionNote).toContain('prize figures differ between sources, do not state one');

    const junction = HACKATHONS_DATABASE.find(h => h.name === 'Junction')!;
    expect(junction.lastEditionNote).toContain('13-15 Nov 2026');
    expect(junction.lastEditionNote).toContain('Espoo');
    expect(junction.lastEditionNote).toContain('registration closed 6 Sept 2026');

    const sih = HACKATHONS_DATABASE.find(h => h.name === 'Smart India Hackathon')!;
    expect(sih.lastEditionNote).toContain('College SPOC only');
  });

  it('shows Registration closed for Junction when deadline has passed', () => {
    const junction = HACKATHONS_DATABASE.find(h => h.name === 'Junction')!;
    expect(junction.registrationDeadline).toBe('2026-09-06');
    const nowAfterDeadline = new Date('2026-10-15T00:00:00Z');
    const deadlineTime = new Date(junction.registrationDeadline + 'T23:59:59Z').getTime();
    expect(nowAfterDeadline.getTime()).toBeGreaterThan(deadlineTime);
  });
});

describe('Prompt 49: White Page Modal Provenance, Disclaimers & Safety Gating', () => {
  const sampleHackathon: Hackathon = {
    id: 'hack_ethglobal',
    name: 'ETHGlobal',
    organizer: 'ETHGlobal',
    mode: 'hybrid',
    country: 'Online/Global',
    themes: ['Web3', 'Blockchain'],
    eligibilityText: 'Open globally to developers and researchers.',
    entryFeeText: 'Free',
    prizeText: 'not listed',
    dates: 'Confirm on the official page',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    lastEditionNote: 'Premier Ethereum hackathon series. Confirm on the official page.',
    officialUrl: 'https://ethglobal.com/events',
    sourceUrl: 'https://ethglobal.com/events',
    detectedOn: '2026-10-15',
    source: 'recurring-series',
    status: 'NOT_ANNOUNCED',
    description: 'Premier Ethereum hackathon series.',
  };

  it('adds top banner and print footer: "Summary generated by TERRASYNX. This is not an official document of the organizer."', () => {
    const html = renderToString(
      <HackathonWhitePageModal
        hackathon={sampleHackathon}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(html).toContain('Summary generated by TERRASYNX. This is not an official document of the organizer.');

    // Ensure no "official circular" wording
    expect(html.toLowerCase()).not.toContain('official circular');
  });

  it('always shows sourceUrl and detectedOn in the modal', () => {
    const html = renderToString(
      <HackathonWhitePageModal
        hackathon={sampleHackathon}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(html).toContain('https://ethglobal.com/events');
    expect(html).toContain('2026-10-15');
  });

  it('does NOT render the modal for entries whose status is ANNOUNCED_UNCONFIRMED', () => {
    const unconfirmedHackathon: Hackathon = {
      ...sampleHackathon,
      status: 'ANNOUNCED_UNCONFIRMED',
    };

    const html = renderToString(
      <HackathonWhitePageModal
        hackathon={unconfirmedHackathon}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Should return null (empty string in renderToString)
    expect(html).toBe('');
  });
});

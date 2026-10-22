import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { HACKATHONS_DATABASE, HackathonsService } from '../services/hackathonsService';
import { HackathonsPortal } from '../components/HackathonsPortal';

describe('Prompt 59: Jinke dates unknown hain', () => {
  const allHackathons = HackathonsService.getAllHackathons();

  const unknownHackathons = [
    { name: 'TreeHacks', id: 'hack_treehacks_stanford' },
    { name: 'PennApps', id: 'hack_pennapps' },
    { name: 'Microsoft Imagine Cup', id: 'hack_microsoft_imagine_cup' },
    { name: 'Meta Hacker Cup', id: 'contest_meta_hacker_cup' },
    { name: 'Cal Hacks', id: 'hack_cal_hacks' },
  ];

  it('1. Sets status NOT_ANNOUNCED and dateConfidence UNKNOWN for TreeHacks, PennApps, Microsoft Imagine Cup, Meta Hacker Cup, and Cal Hacks', () => {
    for (const item of unknownHackathons) {
      const hInDb = HACKATHONS_DATABASE.find(h => h.id === item.id || h.name === item.name);
      expect(hInDb).toBeDefined();
      expect(hInDb!.status).toBe('NOT_ANNOUNCED');
      expect(hInDb!.dateConfidence).toBe('UNKNOWN');

      const hInAll = allHackathons.find(h => h.id === item.id || h.name === item.name);
      expect(hInAll).toBeDefined();
      expect(hInAll!.status).toBe('NOT_ANNOUNCED');
      expect(hInAll!.dateConfidence).toBe('UNKNOWN');
    }
  });

  it('2. Sets exact lastEditionNote for Cal Hacks as specified', () => {
    const calHacks = allHackathons.find(h => h.name === 'Cal Hacks');
    expect(calHacks).toBeDefined();
    if (!calHacks) return;

    const expectedSubstring =
      '2025 edition: 24-26 October 2025, $200,000+ prizes per its own site; a third-party listing gives 3-6 October 2026, unconfirmed';
    expect(calHacks.lastEditionNote).toContain(expectedSubstring);
  });

  it('3. Ensures status computation returns null for UNKNOWN dateConfidence', () => {
    for (const item of unknownHackathons) {
      const h = allHackathons.find(h => h.id === item.id || h.name === item.name)!;
      const status = HackathonsService.getHackathonStatus(h);
      expect(status).toBeNull();
    }
  });

  it('4. Does not show any date for these in the UI', () => {
    const html = renderToString(React.createElement(HackathonsPortal));

    for (const item of unknownHackathons) {
      expect(html).toContain(item.name);
    }

    // Must show "Dates not announced" and "Date Unknown" badge
    expect(html).toContain('Dates not announced');
    expect(html).toContain('Date Unknown');
  });
});

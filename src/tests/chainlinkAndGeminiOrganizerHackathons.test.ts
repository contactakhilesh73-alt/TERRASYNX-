import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { HACKATHONS_DATABASE, HackathonsService } from '../services/hackathonsService';
import { OFFICIAL_HACKATHON_WATCHLIST, OfficialPageWatcherService } from '../services/officialPageWatcherService';
import { isHostnameAllowed, validateSafeTargetUrl } from '../services/linkAllowlistService';
import { HackathonsPortal } from '../components/HackathonsPortal';

describe('Chainlink & Google/Devpost Gemini Organizer Entries & Watchlist Integration', () => {
  const allHackathons = HackathonsService.getAllHackathons();
  const allNames = allHackathons.map(h => h.name);

  it('strictly excludes removed hackathons: Global AI Innovators Challenge, Gemini Multimodal Innovation Challenge, AI Engineer World Summit Hackathon, Chainlink Block Magic', () => {
    const removedHackathons = [
      'Global AI Innovators Challenge',
      'Gemini Multimodal Innovation Challenge',
      'AI Engineer World Summit Hackathon',
      'Chainlink Block Magic',
    ];

    for (const name of removedHackathons) {
      expect(allNames).not.toContain(name);
      const match = allHackathons.find(h => h.name.toLowerCase().includes(name.toLowerCase()));
      expect(match).toBeUndefined();
    }
  });

  it('accurately configures the Chainlink organizer entry (NOT_ANNOUNCED)', () => {
    const chainlink = allHackathons.find(h => h.organizer === 'Chainlink' || h.name === 'Chainlink');
    expect(chainlink).toBeDefined();
    expect(chainlink!.status).toBe('NOT_ANNOUNCED');
    expect(chainlink!.source).toBe('recurring-series');
    expect(chainlink!.prizeText.toLowerCase()).toBe('not listed');
    expect(chainlink!.officialUrl).toBe('https://chain.link/hackathon');

    const combinedNotes = [
      chainlink!.lastEditionNote,
      chainlink!.datesNote,
      chainlink!.description,
    ].filter(Boolean).join(' ').toLowerCase();

    expect(combinedNotes).toContain('hackathon name changes every year');
    expect(combinedNotes).toContain('2026 edition "convergence" ran 6-8 february with a $120,000 prize pool per a community newsletter');
    expect(combinedNotes).toContain('confirm on the official page');
  });

  it('accurately configures Google/Devpost Gemini hackathons organizer entry (NOT_ANNOUNCED)', () => {
    const gemini = allHackathons.find(h => 
      h.name.includes('Google/Devpost Gemini') || 
      h.name.includes('Gemini hackathons')
    );
    expect(gemini).toBeDefined();
    expect(gemini!.status).toBe('NOT_ANNOUNCED');
    expect(gemini!.source).toBe('recurring-series');
    expect(gemini!.prizeText.toLowerCase()).toBe('not listed');

    const combinedNotes = [
      gemini!.lastEditionNote,
      gemini!.datesNote,
      gemini!.description,
    ].filter(Boolean).join(' ');

    expect(combinedNotes).toContain('2026: Gemini 3 Hackathon, Gemini Live Agent Challenge; all closed');
    expect(combinedNotes).toContain('Confirm on the official page');
  });

  it('verifies chain.link/hackathon is added to the watcher watchlist', () => {
    const watchlist = OfficialPageWatcherService.getWatchlist();
    const chainlinkWatchItem = watchlist.find(w => 
      w.officialListingUrl === 'https://chain.link/hackathon' || 
      w.organizer === 'Chainlink'
    );

    expect(chainlinkWatchItem).toBeDefined();
    expect(chainlinkWatchItem!.officialListingUrl).toBe('https://chain.link/hackathon');
    expect(chainlinkWatchItem!.organizer).toBe('Chainlink');
  });

  it('confirms chain.link is allowed on the link allowlist and passes SSRF validation', async () => {
    expect(isHostnameAllowed('chain.link')).toBe(true);

    const safeUrlCheck = await validateSafeTargetUrl('https://chain.link/hackathon');
    expect(safeUrlCheck.safe).toBe(true);
  });

  it('renders both organizer cards cleanly on HackathonsPortal', () => {
    const html = renderToString(React.createElement(HackathonsPortal));
    expect(html).toContain('Chainlink');
    expect(html).toContain('Google/Devpost Gemini');
    expect(html).toContain('Convergence');
    expect(html).toContain('Gemini 3 Hackathon');
    expect(html).toContain('Confirm on the official page');
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  OfficialPageWatcherService,
  OFFICIAL_HACKATHON_WATCHLIST,
  isJsShell,
  extractReadableText,
  parseRobotsTxt,
  groundValue,
  groundExtractedData,
  determineWatcherStatus,
  WatcherSnapshot,
  WatcherExtractedData,
} from '../services/officialPageWatcherService';
import { isHostnameAllowed, HONEST_USER_AGENT } from '../services/linkAllowlistService';
import { HackathonsService } from '../services/hackathonsService';
import { Hackathon } from '../types';

describe('Prompt 46: Official Page Watcher Service & Integrity Rules', () => {
  beforeEach(() => {
    OfficialPageWatcherService.clearSnapshots();
  });

  afterEach(() => {
    OfficialPageWatcherService.stopScheduler();
  });

  it('maintains a watchlist of organizers where every host is strictly on the link allowlist', () => {
    const watchlist = OfficialPageWatcherService.getWatchlist();
    expect(watchlist.length).toBeGreaterThanOrEqual(6);

    for (const item of watchlist) {
      expect(item.organizer).toBeDefined();
      expect(item.officialListingUrl).toMatch(/^https:\/\//);

      const url = new URL(item.officialListingUrl);
      const isAllowed = isHostnameAllowed(url.hostname);
      expect(isAllowed, `Hostname ${url.hostname} must be on allowlist`).toBe(true);
    }

    // Verify key recurring organizers are present
    const organizers = watchlist.map(w => w.organizer.toLowerCase());
    expect(organizers.some(o => o.includes('ethglobal'))).toBe(true);
    expect(organizers.some(o => o.includes('google'))).toBe(true);
    expect(organizers.some(o => o.includes('hackmit'))).toBe(true);
    expect(organizers.some(o => o.includes('hack the north'))).toBe(true);
    expect(organizers.some(o => o.includes('smart india hackathon') || o.includes('sih'))).toBe(true);
  });

  it('uses the honest User-Agent and parses robots.txt rules correctly', () => {
    expect(HONEST_USER_AGENT).toBe('TerrasynxLinkChecker/1.0');

    // Test robots.txt parsing: Disallow /admin and /events
    const robotsSample = `
User-agent: *
Disallow: /admin
Disallow: /private/

User-agent: TerrasynxLinkChecker/1.0
Disallow: /blocked-path/
`;
    const parsed = parseRobotsTxt(robotsSample, HONEST_USER_AGENT);
    expect(parsed.isAllowed('/public-page')).toBe(true);
    expect(parsed.isAllowed('/blocked-path/events')).toBe(false);
  });

  it('detects JavaScript shells with no readable text and assigns status UNKNOWN', () => {
    // Empty shell
    const emptyHtml = '<div id="root"></div>';
    const emptyText = extractReadableText(emptyHtml);
    expect(isJsShell(emptyHtml, emptyText)).toBe(true);

    // React/Vue loading boilerplate
    const jsRequiredHtml = '<div id="app"><noscript>You need to enable JavaScript to run this app.</noscript></div>';
    const jsRequiredText = extractReadableText(jsRequiredHtml);
    expect(isJsShell(jsRequiredHtml, jsRequiredText)).toBe(true);

    // Status evaluation on JS shell must yield UNKNOWN
    const extracted: WatcherExtractedData = {
      name: null,
      dates: null,
      deadline: null,
      eligibility: null,
      mode: null,
      location: null,
      fee: null,
    };
    const { status } = determineWatcherStatus(extracted, null, true);
    expect(status).toBe('UNKNOWN');

    // Rich textual HTML is NOT a JS shell
    const richHtml = `
      <html>
        <body>
          <main>
            <h1>Global Hackathon 2026</h1>
            <p>Join 1,000 developers worldwide for our 48-hour build sprint on Nov 14 - 16, 2026.</p>
            <p>Registration is completely free for all university students.</p>
          </main>
        </body>
      </html>
    `;
    const richText = extractReadableText(richHtml);
    expect(isJsShell(richHtml, richText)).toBe(false);
    expect(richText).toContain('Nov 14 - 16, 2026');
  });

  it('strictly grounds every extracted field against the fetched page text and drops ungrounded values', () => {
    const pageText = 'Welcome to HackMIT 2026. Dates: Sept 19 - 20, 2026. Entry is 100% Free for undergraduate students. Held in Cambridge, MA.';

    // Grounded value test
    expect(groundValue('Sept 19 - 20, 2026', pageText)).toBe('Sept 19 - 20, 2026');
    expect(groundValue('Cambridge, MA', pageText)).toBe('Cambridge, MA');

    // Ungrounded value test (e.g. invented date by hallucinating LLM)
    expect(groundValue('Dec 25, 2026', pageText)).toBeNull();
    expect(groundValue('$100 Registration Fee', pageText)).toBeNull();

    // Full data structure grounding
    const rawExtraction: WatcherExtractedData = {
      name: 'HackMIT 2026',
      dates: 'Sept 19 - 20, 2026',
      deadline: 'Oct 01, 2026', // Hallucinated/not on page
      eligibility: 'undergraduate students',
      mode: 'in-person', // not explicitly on page
      location: 'Cambridge, MA',
      fee: '$50 per team', // Hallucinated fee!
    };

    const grounded = groundExtractedData(rawExtraction, pageText);
    expect(grounded.name).toBe('HackMIT 2026');
    expect(grounded.dates).toBe('Sept 19 - 20, 2026');
    expect(grounded.deadline).toBeNull(); // dropped because not in page text!
    expect(grounded.eligibility).toBe('undergraduate students');
    expect(grounded.location).toBe('Cambridge, MA');
    expect(grounded.fee).toBeNull(); // dropped because not in page text!
  });

  it('sets ANNOUNCED_UNCONFIRMED if no date is grounded', () => {
    const groundedNoDate: WatcherExtractedData = {
      name: 'ETHGlobal Annual Series',
      dates: null, // No date grounded
      deadline: null,
      eligibility: 'Open worldwide',
      mode: 'online',
      location: null,
      fee: 'Free',
    };

    const result = determineWatcherStatus(groundedNoDate, null, false);
    expect(result.status).toBe('ANNOUNCED_UNCONFIRMED');
    expect(result.consecutiveMatches).toBe(0);
  });

  it('sets ANNOUNCED_VERIFIED only after two consecutive consistent extractions', () => {
    const firstExtraction: WatcherExtractedData = {
      name: 'Hack the North 2027',
      dates: 'Sept 18 - 20, 2027',
      deadline: 'Aug 15, 2027',
      eligibility: 'Undergraduate students',
      mode: 'in-person',
      location: 'Waterloo, ON',
      fee: 'Free',
    };

    // Run 1: First time date is observed -> must be ANNOUNCED_UNCONFIRMED
    const run1 = determineWatcherStatus(firstExtraction, null, false);
    expect(run1.status).toBe('ANNOUNCED_UNCONFIRMED');
    expect(run1.consecutiveMatches).toBe(1);

    const snapshotRun1: WatcherSnapshot = {
      organizer: 'Hack the North',
      officialListingUrl: 'https://hackthenorth.com',
      sourceUrl: 'https://hackthenorth.com',
      detectedOn: '2026-10-14',
      status: run1.status,
      isStale: false,
      consecutiveMatches: run1.consecutiveMatches,
      extracted: firstExtraction,
      grounded: firstExtraction,
      lastCheckedOn: '2026-10-14',
    };

    // Run 2: Second consecutive run with consistent dates -> becomes ANNOUNCED_VERIFIED
    const run2 = determineWatcherStatus(firstExtraction, snapshotRun1, false);
    expect(run2.status).toBe('ANNOUNCED_VERIFIED');
    expect(run2.consecutiveMatches).toBe(2);

    // If an inconsistent run occurs, it drops back to ANNOUNCED_UNCONFIRMED
    const inconsistentExtraction: WatcherExtractedData = {
      ...firstExtraction,
      dates: 'Oct 02 - 04, 2027', // Changed date
    };
    const runInconsistent = determineWatcherStatus(inconsistentExtraction, snapshotRun1, false);
    expect(runInconsistent.status).toBe('ANNOUNCED_UNCONFIRMED');
    expect(runInconsistent.consecutiveMatches).toBe(1);
  });

  it('formats "Detected on the official page on <date>" provenance badge accurately', () => {
    const badgeText = OfficialPageWatcherService.formatDetectedBadge('2026-10-14');
    expect(badgeText).toBe('Detected on the official page on 2026-10-14');
  });

  it('preserves the last verified snapshot and labels it stale when a fetch fails', () => {
    const verifiedSnapshot: WatcherSnapshot = {
      organizer: 'ETHGlobal',
      officialListingUrl: 'https://ethglobal.com/events',
      sourceUrl: 'https://ethglobal.com/events',
      detectedOn: '2026-10-10',
      status: 'ANNOUNCED_VERIFIED',
      isStale: false,
      consecutiveMatches: 2,
      extracted: {
        name: 'ETHGlobal San Francisco',
        dates: 'Nov 20 - 22, 2026',
        deadline: 'Nov 10, 2026',
        eligibility: 'All developers',
        mode: 'in-person',
        location: 'San Francisco, CA',
        fee: 'Free',
      },
      grounded: {
        name: 'ETHGlobal San Francisco',
        dates: 'Nov 20 - 22, 2026',
        deadline: 'Nov 10, 2026',
        eligibility: 'All developers',
        mode: 'in-person',
        location: 'San Francisco, CA',
        fee: 'Free',
      },
      lastVerifiedOn: '2026-10-10',
      lastCheckedOn: '2026-10-10',
    };

    OfficialPageWatcherService.setSnapshot(verifiedSnapshot);

    // Enrich a hackathon with this snapshot
    const rawHackathons = HackathonsService.getAllHackathons();
    const enriched = HackathonsService.enrichWithWatcherSnapshots(rawHackathons, [
      {
        ...verifiedSnapshot,
        isStale: true, // Upstream network fetch failed in current run
      },
    ]);

    const eth = enriched.find(h => h.organizer.toLowerCase().includes('ethglobal'));
    expect(eth).toBeDefined();
    if (eth) {
      expect(eth.detectedOn).toBe('2026-10-10');
      expect(eth.sourceUrl).toBe('https://ethglobal.com/events');
      expect(eth.isStale).toBe(true);
      expect(eth.status).toBe('ANNOUNCED_VERIFIED');
      expect(eth.dates).toBe('Nov 20 - 22, 2026');
    }
  });

  it('never invents dates when parsing or fallbacking', () => {
    const pageWithNoDates = 'Smart India Hackathon is a nationwide initiative. Registration is free through the college SPOC.';
    const fallback = OfficialPageWatcherService.literalFallbackExtraction(pageWithNoDates, 'Smart India Hackathon');

    expect(fallback.dates).toBeNull();
    expect(fallback.deadline).toBeNull();

    const grounded = groundExtractedData(fallback, pageWithNoDates);
    expect(grounded.dates).toBeNull();
    expect(grounded.deadline).toBeNull();
  });
});

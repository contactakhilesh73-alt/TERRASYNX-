import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  OfficialPageWatcherService,
  OFFICIAL_HACKATHON_WATCHLIST,
  determineWatcherStatus,
  groundExtractedData,
  isDateMarkedOfficial,
  WatcherExtractedData,
  WatcherSnapshot,
} from '../services/officialPageWatcherService';
import { isHostnameAllowed } from '../services/linkAllowlistService';
import { HackathonsService } from '../services/hackathonsService';
import { Hackathon } from '../types';

describe('Prompt 60: Watcher watchlist & Date Confidence Rules', () => {
  beforeEach(() => {
    OfficialPageWatcherService.clearSnapshots();
  });

  afterEach(() => {
    OfficialPageWatcherService.stopScheduler();
  });

  const requiredWatchlistPages = [
    'ethglobal.com/events',
    'hackthenorth.com',
    'treehacks.com',
    'pennapps.com',
    'calhacks.io',
    'imaginecup.microsoft.com',
    'codevita.tcsapps.com',
    'chain.link/hackathon',
    'spaceappschallenge.org',
  ];

  it('1. Adds all required official pages to OFFICIAL_HACKATHON_WATCHLIST', () => {
    const watchlist = OfficialPageWatcherService.getWatchlist();

    for (const requiredPage of requiredWatchlistPages) {
      const found = watchlist.some(item => {
        const url = item.officialListingUrl.toLowerCase();
        return url.includes(requiredPage);
      });
      expect(found, `Expected ${requiredPage} to be in OFFICIAL_HACKATHON_WATCHLIST`).toBe(true);
    }
  });

  it('2. Enforces that hosts for all required watchlist pages are on the link allowlist', () => {
    for (const page of requiredWatchlistPages) {
      const domain = page.split('/')[0];
      const isAllowed = isHostnameAllowed(domain);
      expect(isAllowed, `Hostname ${domain} must be on allowlist`).toBe(true);
    }

    // Verify all watchlist items have valid allowlist hostnames
    const watchlist = OfficialPageWatcherService.getWatchlist();
    for (const item of watchlist) {
      const url = new URL(item.officialListingUrl);
      expect(isHostnameAllowed(url.hostname), `Host ${url.hostname} must be on allowlist`).toBe(true);
    }
  });

  it('3. Does NOT mark date OFFICIAL if date is not grounded against page text', () => {
    const pageText = 'Cal Hacks 2026. Come build with us at UC Berkeley. Hackathon dates to be announced soon!';
    
    // Extracted date is hallucinated / ungrounded
    const extracted: WatcherExtractedData = {
      name: 'Cal Hacks 2026',
      dates: '3-6 October 2026', // Ungrounded date
      deadline: null,
      eligibility: 'UC Berkeley students',
      mode: 'in-person',
      location: 'Berkeley',
      fee: 'Free',
    };

    const grounded = groundExtractedData(extracted, pageText);
    expect(grounded.dates).toBeNull(); // Ungrounded date dropped!

    // Even if previous snapshot existed, with no grounded date, status is ANNOUNCED_UNCONFIRMED and confidence UNKNOWN
    const prevSnapshot: WatcherSnapshot = {
      organizer: 'Cal Hacks',
      officialListingUrl: 'https://calhacks.io',
      sourceUrl: 'https://calhacks.io',
      detectedOn: '2026-10-14',
      status: 'ANNOUNCED_UNCONFIRMED',
      isStale: false,
      consecutiveMatches: 1,
      extracted,
      grounded,
      lastCheckedOn: '2026-10-14',
    };

    const result = determineWatcherStatus(grounded, prevSnapshot, false);
    expect(result.status).toBe('ANNOUNCED_UNCONFIRMED');
    expect(result.dateConfidence).toBe('UNKNOWN');
    expect(isDateMarkedOfficial(grounded, result.consecutiveMatches)).toBe(false);
  });

  it('4. Does NOT mark date OFFICIAL on first run (single observation only gives REPORTED)', () => {
    const pageText = 'TreeHacks 2027 will take place 12-14 February 2027 at Stanford University.';

    const extracted: WatcherExtractedData = {
      name: 'TreeHacks 2027',
      dates: '12-14 February 2027',
      deadline: null,
      eligibility: 'Students',
      mode: 'in-person',
      location: 'Stanford University',
      fee: 'Free',
    };

    const grounded = groundExtractedData(extracted, pageText);
    expect(grounded.dates).toBe('12-14 February 2027');

    // Run 1: first observation, no previous snapshot
    const run1 = determineWatcherStatus(grounded, null, false);
    expect(run1.status).toBe('ANNOUNCED_UNCONFIRMED');
    expect(run1.consecutiveMatches).toBe(1);
    expect(run1.dateConfidence).toBe('REPORTED'); // Not OFFICIAL yet!
    expect(isDateMarkedOfficial(grounded, run1.consecutiveMatches)).toBe(false);
  });

  it('5. Marks date OFFICIAL only after grounding check AND two consistent runs', () => {
    const pageText = 'TreeHacks 2027 will take place 12-14 February 2027 at Stanford University.';

    const extracted: WatcherExtractedData = {
      name: 'TreeHacks 2027',
      dates: '12-14 February 2027',
      deadline: null,
      eligibility: 'Students',
      mode: 'in-person',
      location: 'Stanford University',
      fee: 'Free',
    };

    const grounded = groundExtractedData(extracted, pageText);
    expect(grounded.dates).toBe('12-14 February 2027');

    // Run 1
    const run1 = determineWatcherStatus(grounded, null, false);
    expect(run1.status).toBe('ANNOUNCED_UNCONFIRMED');
    expect(run1.consecutiveMatches).toBe(1);
    expect(run1.dateConfidence).toBe('REPORTED');

    const snapshotRun1: WatcherSnapshot = {
      organizer: 'TreeHacks',
      officialListingUrl: 'https://treehacks.com',
      sourceUrl: 'https://treehacks.com',
      detectedOn: '2026-10-14',
      status: run1.status,
      isStale: false,
      consecutiveMatches: run1.consecutiveMatches,
      extracted,
      grounded,
      lastCheckedOn: '2026-10-14',
    };

    // Run 2: Same grounded date across second consecutive run
    const run2 = determineWatcherStatus(grounded, snapshotRun1, false);
    expect(run2.status).toBe('ANNOUNCED_VERIFIED');
    expect(run2.consecutiveMatches).toBe(2);
    expect(run2.dateConfidence).toBe('OFFICIAL'); // OFFICIAL achieved!
    expect(isDateMarkedOfficial(grounded, run2.consecutiveMatches)).toBe(true);
  });

  it('6. Reverts to REPORTED if date changes on the second run (inconsistent dates)', () => {
    const pageText1 = 'Hack the North 2027: Sept 18 - 20, 2027.';
    const pageText2 = 'Hack the North 2027: Oct 02 - 04, 2027.';

    const extracted1: WatcherExtractedData = {
      name: 'Hack the North',
      dates: 'Sept 18 - 20, 2027',
      deadline: null,
      eligibility: null,
      mode: 'in-person',
      location: 'Waterloo',
      fee: null,
    };

    const grounded1 = groundExtractedData(extracted1, pageText1);
    const run1 = determineWatcherStatus(grounded1, null, false);

    const snapshotRun1: WatcherSnapshot = {
      organizer: 'Hack the North',
      officialListingUrl: 'https://hackthenorth.com',
      sourceUrl: 'https://hackthenorth.com',
      detectedOn: '2026-10-14',
      status: run1.status,
      isStale: false,
      consecutiveMatches: run1.consecutiveMatches,
      extracted: extracted1,
      grounded: grounded1,
      lastCheckedOn: '2026-10-14',
    };

    const extracted2: WatcherExtractedData = {
      name: 'Hack the North',
      dates: 'Oct 02 - 04, 2027',
      deadline: null,
      eligibility: null,
      mode: 'in-person',
      location: 'Waterloo',
      fee: null,
    };

    const grounded2 = groundExtractedData(extracted2, pageText2);
    const run2 = determineWatcherStatus(grounded2, snapshotRun1, false);

    // Inconsistent dates reset to consecutiveMatches = 1 and dateConfidence REPORTED
    expect(run2.status).toBe('ANNOUNCED_UNCONFIRMED');
    expect(run2.consecutiveMatches).toBe(1);
    expect(run2.dateConfidence).toBe('REPORTED');
    expect(isDateMarkedOfficial(grounded2, run2.consecutiveMatches)).toBe(false);
  });

  it('7. Enriches hackathon dateConfidence as OFFICIAL only with grounded date and 2 consistent runs', () => {
    const mockHackathons: Hackathon[] = [
      {
        id: 'hack_test_1',
        name: 'TreeHacks',
        organizer: 'Stanford University',
        mode: 'in-person',
        country: 'United States',
        themes: ['AI'],
        eligibilityText: 'Students',
        entryFeeText: 'Free',
        prizeText: 'not listed',
        dates: 'Dates not announced',
        registrationDeadline: '',
        dateConfidence: 'UNKNOWN',
        officialUrl: 'https://treehacks.com',
        source: 'recurring-series',
        status: 'NOT_ANNOUNCED',
      },
    ];

    // Snapshot with 1 run: should become REPORTED, not OFFICIAL
    const singleRunSnapshots = [
      {
        organizer: 'Stanford University',
        sourceUrl: 'https://treehacks.com',
        detectedOn: '2026-10-21',
        status: 'ANNOUNCED_UNCONFIRMED' as const,
        isStale: false,
        consecutiveMatches: 1,
        dateConfidence: 'REPORTED' as const,
        grounded: {
          name: 'TreeHacks',
          dates: '12-14 February 2027',
          deadline: null,
          fee: 'Free',
        },
      },
    ];

    const enrichedSingle = HackathonsService.enrichWithWatcherSnapshots(mockHackathons, singleRunSnapshots);
    expect(enrichedSingle[0].dateConfidence).toBe('REPORTED');

    // Snapshot with 2 consistent runs: becomes OFFICIAL
    const twoRunSnapshots = [
      {
        organizer: 'Stanford University',
        sourceUrl: 'https://treehacks.com',
        detectedOn: '2026-10-21',
        status: 'ANNOUNCED_VERIFIED' as const,
        isStale: false,
        consecutiveMatches: 2,
        dateConfidence: 'OFFICIAL' as const,
        grounded: {
          name: 'TreeHacks',
          dates: '12-14 February 2027',
          deadline: null,
          fee: 'Free',
        },
      },
    ];

    const enrichedTwo = HackathonsService.enrichWithWatcherSnapshots(mockHackathons, twoRunSnapshots);
    expect(enrichedTwo[0].dateConfidence).toBe('OFFICIAL');
  });
});

/**
 * TERRASYNX: Official Page Watcher Service (Prompt 46)
 * 
 * Server-side service scheduled every 24 hours:
 * 1. Watchlist: { organizer, officialListingUrl } where the host is on the allowlist.
 * 2. Fetch with honest User-Agent ('TerrasynxLinkChecker/1.0'), respect robots.txt.
 * 3. Rate limiting: exactly one request per organizer per run.
 * 4. JavaScript shell detection: if page has no readable text, set status to UNKNOWN.
 * 5. Extraction via Gemini (/api/ai/extract-hackathon): returns JSON with name, dates,
 *    deadline, eligibility, mode, location, fee, using null for anything not literally stated.
 * 6. Grounding: every extracted value's text must appear in the fetched page text, else drop that field.
 * 7. Status transition:
 *    - ANNOUNCED_UNCONFIRMED if no date is grounded.
 *    - ANNOUNCED_VERIFIED only after two consecutive consistent extractions.
 * 8. Provenance: store sourceUrl and detectedOn, showing "Detected on the official page on <date>".
 * 9. Resilience: if a fetch fails, keep the last verified snapshot and label it stale.
 * 10. Strict integrity: never invent a date.
 */

import { GoogleGenAI } from '@google/genai';
import { Hackathon, HackathonStatus, HackathonMode } from '../types';
import { HONEST_USER_AGENT, isHostnameAllowed, validateSafeTargetUrl } from './linkAllowlistService';
import { logger } from '../utils/logger';

export interface WatchlistItem {
  organizer: string;
  officialListingUrl: string;
}

export interface WatcherExtractedData {
  name: string | null;
  dates: string | null;
  deadline: string | null;
  eligibility: string | null;
  mode: HackathonMode | null;
  location: string | null;
  fee: string | null;
}

export interface WatcherSnapshot {
  organizer: string;
  officialListingUrl: string;
  sourceUrl: string;
  detectedOn: string; // YYYY-MM-DD or formatted date
  status: HackathonStatus;
  isStale: boolean;
  consecutiveMatches: number;
  extracted: WatcherExtractedData;
  grounded: WatcherExtractedData;
  lastVerifiedOn?: string;
  lastCheckedOn: string;
  isJsShell?: boolean;
  error?: string;
}

// Watchlist of top recurring organizers on verified allowlist domains
export const OFFICIAL_HACKATHON_WATCHLIST: WatchlistItem[] = [
  {
    organizer: 'ETHGlobal',
    officialListingUrl: 'https://ethglobal.com/events',
  },
  {
    organizer: 'Google Developer Groups',
    officialListingUrl: 'https://developers.google.com/community/gdsc-solution-challenge',
  },
  {
    organizer: 'HackMIT',
    officialListingUrl: 'https://hackmit.org',
  },
  {
    organizer: 'Hack the North',
    officialListingUrl: 'https://hackthenorth.com',
  },
  {
    organizer: 'Major League Hacking (Global Hack Week)',
    officialListingUrl: 'https://ghw.mlh.com',
  },
  {
    organizer: 'Major League Hacking (Season)',
    officialListingUrl: 'https://mlh.io',
  },
  {
    organizer: 'Smart India Hackathon',
    officialListingUrl: 'https://sih.gov.in',
  },
];

/**
 * Extracts readable plain text from raw HTML by stripping non-visible tags.
 */
export function extractReadableText(html: string): string {
  if (!html || typeof html !== 'string') return '';

  return html
    // Strip scripts and styles
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, ' ')
    // Strip HTML comments
    .replace(/<!--[\s\S]*?-->/g, ' ')
    // Strip all HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Replace HTML entities
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detects if a page is an empty JavaScript shell with no readable text.
 */
export function isJsShell(html: string, readableText: string): boolean {
  if (!html || html.trim().length === 0) return true;
  if (!readableText || readableText.trim().length === 0) return true;

  // Extremely short text or explicit JS-required shells
  const cleaned = readableText.trim();
  if (cleaned.length < 80) return true;

  const lower = cleaned.toLowerCase();
  if (
    lower.includes('you need to enable javascript to run this app') ||
    lower.includes('enable javascript to continue') ||
    lower.includes('javascript is required to view this website')
  ) {
    return true;
  }

  return false;
}

/**
 * Basic robots.txt parser respecting standard Disallow directives.
 */
export function parseRobotsTxt(robotsTxt: string, userAgent: string = HONEST_USER_AGENT): { isAllowed: (path: string) => boolean } {
  if (!robotsTxt || typeof robotsTxt !== 'string') {
    return { isAllowed: () => true };
  }

  const lines = robotsTxt.split(/\r?\n/).map(l => l.trim());
  const disallows: string[] = [];
  let isTargetAgentSection = false;

  for (const line of lines) {
    if (line.startsWith('#') || !line) continue;
    const lower = line.toLowerCase();

    if (lower.startsWith('user-agent:')) {
      const agent = lower.replace('user-agent:', '').trim();
      isTargetAgentSection = agent === '*' || agent === userAgent.toLowerCase() || agent.includes('terrasynx');
    } else if (isTargetAgentSection && lower.startsWith('disallow:')) {
      const disallowPath = line.replace(/disallow:/i, '').trim();
      if (disallowPath) {
        disallows.push(disallowPath);
      }
    }
  }

  return {
    isAllowed: (path: string) => {
      for (const rule of disallows) {
        if (rule === '/') return false;
        if (rule && path.startsWith(rule)) return false;
      }
      return true;
    },
  };
}

/**
 * Grounds a single value against the page text.
 * The value's text must appear in the fetched page text (case-insensitive normalized), else returns null.
 */
export function groundValue(value: string | null | undefined, pageText: string): string | null {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normPage = pageText.toLowerCase().replace(/\s+/g, ' ');
  const normVal = trimmed.toLowerCase().replace(/\s+/g, ' ');

  if (normPage.includes(normVal)) {
    return trimmed;
  }

  return null;
}

/**
 * Grounds every extracted field. If a value does not appear in the page text, it is dropped (set to null).
 */
export function groundExtractedData(extracted: WatcherExtractedData, pageText: string): WatcherExtractedData {
  const grounded: WatcherExtractedData = {
    name: groundValue(extracted.name, pageText),
    dates: groundValue(extracted.dates, pageText),
    deadline: groundValue(extracted.deadline, pageText),
    eligibility: groundValue(extracted.eligibility, pageText),
    mode: null,
    location: groundValue(extracted.location, pageText),
    fee: groundValue(extracted.fee, pageText),
  };

  // Ground mode: only keep if explicitly grounded in page text or matches keywords
  if (extracted.mode) {
    const normPage = pageText.toLowerCase();
    const modeKeywords: Record<HackathonMode, string[]> = {
      'online': ['online', 'virtual', 'remote'],
      'in-person': ['in-person', 'onsite', 'on-site', 'physical'],
      'hybrid': ['hybrid', 'in-person and online'],
    };

    const validKeywords = modeKeywords[extracted.mode] || [];
    const isModePresent = validKeywords.some(kw => normPage.includes(kw));
    if (isModePresent) {
      grounded.mode = extracted.mode;
    }
  }

  return grounded;
}

/**
 * Determines hackathon status according to Prompt 46 rules:
 * - If JS shell with no readable text: UNKNOWN
 * - ANNOUNCED_UNCONFIRMED if no date is grounded.
 * - ANNOUNCED_VERIFIED only after two consecutive consistent extractions.
 */
export function determineWatcherStatus(
  grounded: WatcherExtractedData,
  previousSnapshot?: WatcherSnapshot | null,
  isJsShellFlag?: boolean
): { status: HackathonStatus; consecutiveMatches: number } {
  if (isJsShellFlag) {
    return { status: 'UNKNOWN', consecutiveMatches: 0 };
  }

  // If no date is grounded, status is strictly ANNOUNCED_UNCONFIRMED
  if (!grounded.dates || grounded.dates.trim().length === 0) {
    return { status: 'ANNOUNCED_UNCONFIRMED', consecutiveMatches: 0 };
  }

  // Date is grounded! Check if we have a consistent previous extraction
  if (previousSnapshot && !previousSnapshot.isStale && previousSnapshot.grounded.dates) {
    const prevDateNorm = previousSnapshot.grounded.dates.toLowerCase().replace(/\s+/g, ' ').trim();
    const currDateNorm = grounded.dates.toLowerCase().replace(/\s+/g, ' ').trim();

    // Check consistency between runs
    if (prevDateNorm === currDateNorm) {
      const consecutive = (previousSnapshot.consecutiveMatches || 1) + 1;
      return {
        status: consecutive >= 2 ? 'ANNOUNCED_VERIFIED' : 'ANNOUNCED_UNCONFIRMED',
        consecutiveMatches: consecutive,
      };
    }
  }

  // First time date is observed, or inconsistent with previous
  return { status: 'ANNOUNCED_UNCONFIRMED', consecutiveMatches: 1 };
}

export class OfficialPageWatcherService {
  private static snapshots: Map<string, WatcherSnapshot> = new Map();
  private static schedulerIntervalId: NodeJS.Timeout | null = null;
  private static robotsCache: Map<string, { allowed: (path: string) => boolean; expiresAt: number }> = new Map();

  /**
   * Returns all watchlist items.
   */
  public static getWatchlist(): WatchlistItem[] {
    return [...OFFICIAL_HACKATHON_WATCHLIST];
  }

  /**
   * Returns all stored watcher snapshots.
   */
  public static getSnapshots(): WatcherSnapshot[] {
    return Array.from(this.snapshots.values());
  }

  /**
   * Returns a snapshot for a specific organizer.
   */
  public static getSnapshot(organizer: string): WatcherSnapshot | undefined {
    return this.snapshots.get(organizer);
  }

  /**
   * Sets or updates a snapshot in memory (useful for testing and seed data).
   */
  public static setSnapshot(snapshot: WatcherSnapshot): void {
    this.snapshots.set(snapshot.organizer, snapshot);
  }

  /**
   * Clears all snapshots.
   */
  public static clearSnapshots(): void {
    this.snapshots.clear();
  }

  /**
   * Formats the detectedOn text required by Prompt 46.
   */
  public static formatDetectedBadge(detectedOn: string): string {
    return `Detected on the official page on ${detectedOn}`;
  }

  /**
   * Checks robots.txt for a given URL origin.
   */
  public static async isAllowedByRobots(targetUrl: string): Promise<boolean> {
    try {
      const urlObj = new URL(targetUrl);
      const origin = urlObj.origin;
      const cached = this.robotsCache.get(origin);
      if (cached && Date.now() < cached.expiresAt) {
        return cached.allowed(urlObj.pathname);
      }

      const robotsUrl = `${origin}/robots.txt`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const resp = await fetch(robotsUrl, {
        method: 'GET',
        headers: {
          'User-Agent': HONEST_USER_AGENT,
          'Accept': 'text/plain',
        },
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeout);

      if (!resp || !resp.ok) {
        // If robots.txt doesn't exist or errors (404), crawling is allowed by default
        return true;
      }

      const text = await resp.text();
      const parsed = parseRobotsTxt(text, HONEST_USER_AGENT);
      this.robotsCache.set(origin, {
        allowed: parsed.isAllowed,
        expiresAt: Date.now() + 60 * 60 * 1000, // cache for 1 hour
      });

      return parsed.isAllowed(urlObj.pathname);
    } catch {
      return true;
    }
  }

  /**
   * Extracts hackathon fields using Gemini 2.5 Flash.
   * Null is used for anything not literally stated in the text.
   */
  public static async extractWithGemini(
    pageText: string,
    organizer: string,
    url: string
  ): Promise<WatcherExtractedData> {
    const emptyResult: WatcherExtractedData = {
      name: null,
      dates: null,
      deadline: null,
      eligibility: null,
      mode: null,
      location: null,
      fee: null,
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.warn('OfficialPageWatcher', 'GEMINI_API_KEY not configured. Falling back to deterministic literal parsing.');
      return this.literalFallbackExtraction(pageText, organizer);
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a strict data extraction engine for official hackathon listing pages.
Analyze the provided official page text for organizer "${organizer}" at "${url}".

EXTRACT THE FOLLOWING FIELDS:
- name: The official event or hackathon title, or null if not stated.
- dates: The exact dates string as written on the page, or null if not stated.
- deadline: The registration/submission deadline as written, or null if not stated.
- eligibility: The eligibility rules text as written, or null if not stated.
- mode: One of "online", "in-person", "hybrid", or null if not explicitly stated.
- location: Physical city/venue if stated, or null if not stated.
- fee: Entry fee or cost text as written, or null if not stated.

CRITICAL INTEGRITY INSTRUCTIONS:
1. Use NULL for anything not literally stated in the text.
2. NEVER guess, invent, or extrapolate dates, prizes, or rules.
3. If an upcoming date is not confirmed, set dates to null.
4. Return ONLY valid JSON conforming to the schema.

PAGE TEXT (truncated to first 8000 characters):
${pageText.slice(0, 8000)}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsed = JSON.parse(responseText);

      return {
        name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : null,
        dates: typeof parsed.dates === 'string' && parsed.dates.trim() ? parsed.dates.trim() : null,
        deadline: typeof parsed.deadline === 'string' && parsed.deadline.trim() ? parsed.deadline.trim() : null,
        eligibility: typeof parsed.eligibility === 'string' && parsed.eligibility.trim() ? parsed.eligibility.trim() : null,
        mode: ['online', 'in-person', 'hybrid'].includes(parsed.mode) ? parsed.mode : null,
        location: typeof parsed.location === 'string' && parsed.location.trim() ? parsed.location.trim() : null,
        fee: typeof parsed.fee === 'string' && parsed.fee.trim() ? parsed.fee.trim() : null,
      };
    } catch (err: any) {
      logger.error('OfficialPageWatcher', `Gemini extraction failed for ${organizer}: ${err?.message}`);
      return this.literalFallbackExtraction(pageText, organizer);
    }
  }

  /**
   * Deterministic literal fallback extractor when AI is not configured or in offline test environments.
   */
  public static literalFallbackExtraction(pageText: string, organizer: string): WatcherExtractedData {
    const res: WatcherExtractedData = {
      name: null,
      dates: null,
      deadline: null,
      eligibility: null,
      mode: null,
      location: null,
      fee: null,
    };

    if (!pageText) return res;

    // Check for organizer name
    if (pageText.toLowerCase().includes(organizer.toLowerCase())) {
      res.name = organizer;
    }

    // Literal check for fee
    if (pageText.toLowerCase().includes('free entry') || pageText.toLowerCase().includes('free')) {
      res.fee = 'Free';
    }

    // Literal check for mode
    if (pageText.toLowerCase().includes('hybrid')) {
      res.mode = 'hybrid';
    } else if (pageText.toLowerCase().includes('online') || pageText.toLowerCase().includes('virtual')) {
      res.mode = 'online';
    } else if (pageText.toLowerCase().includes('in-person')) {
      res.mode = 'in-person';
    }

    return res;
  }

  /**
   * Executes a complete watcher run across the watchlist.
   * Rate limited: exactly one request per organizer per run.
   */
  public static async runWatcher(): Promise<WatcherSnapshot[]> {
    logger.info('OfficialPageWatcher', `Starting watcher cycle across ${OFFICIAL_HACKATHON_WATCHLIST.length} organizers...`);
    const requestedOrganizers = new Set<string>();
    const today = new Date().toISOString().split('T')[0];

    for (const item of OFFICIAL_HACKATHON_WATCHLIST) {
      // Rule: one request per organizer per run
      if (requestedOrganizers.has(item.organizer)) {
        continue;
      }
      requestedOrganizers.add(item.organizer);

      const previousSnapshot = this.snapshots.get(item.organizer);

      try {
        // Step 1: Validate host against strict link allowlist
        const urlObj = new URL(item.officialListingUrl);
        if (!isHostnameAllowed(urlObj.hostname)) {
          logger.warn('OfficialPageWatcher', `Watchlist URL ${item.officialListingUrl} not allowed on link allowlist`);
          continue;
        }

        // Step 2: Respect robots.txt
        const allowed = await this.isAllowedByRobots(item.officialListingUrl);
        if (!allowed) {
          logger.info('OfficialPageWatcher', `Skipping ${item.organizer} due to robots.txt Disallow rule`);
          continue;
        }

        // Step 3: Fetch with honest User-Agent
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(item.officialListingUrl, {
          method: 'GET',
          headers: {
            'User-Agent': HONEST_USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,text/plain',
          },
          signal: controller.signal,
        }).catch(() => null);

        clearTimeout(timeout);

        // Step 4: Handle fetch failure (resilience rule: keep last verified snapshot, label it stale)
        if (!response || !response.ok) {
          if (previousSnapshot && previousSnapshot.status === 'ANNOUNCED_VERIFIED') {
            this.snapshots.set(item.organizer, {
              ...previousSnapshot,
              isStale: true,
              lastCheckedOn: today,
              error: `Fetch failed with HTTP ${response?.status || 'Network Error'}`,
            });
          } else {
            this.snapshots.set(item.organizer, {
              organizer: item.organizer,
              officialListingUrl: item.officialListingUrl,
              sourceUrl: item.officialListingUrl,
              detectedOn: today,
              status: 'UNKNOWN',
              isStale: true,
              consecutiveMatches: 0,
              extracted: { name: null, dates: null, deadline: null, eligibility: null, mode: null, location: null, fee: null },
              grounded: { name: null, dates: null, deadline: null, eligibility: null, mode: null, location: null, fee: null },
              lastCheckedOn: today,
              error: 'Fetch failed',
            });
          }
          continue;
        }

        const html = await response.text();
        const readableText = extractReadableText(html);

        // Step 5: Check if page is a JavaScript shell with no readable text
        if (isJsShell(html, readableText)) {
          this.snapshots.set(item.organizer, {
            organizer: item.organizer,
            officialListingUrl: item.officialListingUrl,
            sourceUrl: item.officialListingUrl,
            detectedOn: today,
            status: 'UNKNOWN',
            isStale: false,
            isJsShell: true,
            consecutiveMatches: 0,
            extracted: { name: null, dates: null, deadline: null, eligibility: null, mode: null, location: null, fee: null },
            grounded: { name: null, dates: null, deadline: null, eligibility: null, mode: null, location: null, fee: null },
            lastCheckedOn: today,
          });
          continue;
        }

        // Step 6: Ask Gemini to extract structured fields (with null for unstated items)
        const extracted = await this.extractWithGemini(readableText, item.organizer, item.officialListingUrl);

        // Step 7: Ground every extracted value against fetched page text
        const grounded = groundExtractedData(extracted, readableText);

        // Step 8: Determine status (ANNOUNCED_UNCONFIRMED if no date grounded, ANNOUNCED_VERIFIED after two consecutive consistent extractions)
        const { status, consecutiveMatches } = determineWatcherStatus(grounded, previousSnapshot, false);

        const newSnapshot: WatcherSnapshot = {
          organizer: item.organizer,
          officialListingUrl: item.officialListingUrl,
          sourceUrl: item.officialListingUrl,
          detectedOn: today,
          status,
          isStale: false,
          consecutiveMatches,
          extracted,
          grounded,
          lastVerifiedOn: status === 'ANNOUNCED_VERIFIED' ? today : previousSnapshot?.lastVerifiedOn,
          lastCheckedOn: today,
        };

        this.snapshots.set(item.organizer, newSnapshot);
      } catch (err: any) {
        logger.error('OfficialPageWatcher', `Error watching ${item.organizer}: ${err?.message}`);
        // If a fetch fails, keep the last verified snapshot and label it stale
        if (previousSnapshot && previousSnapshot.status === 'ANNOUNCED_VERIFIED') {
          this.snapshots.set(item.organizer, {
            ...previousSnapshot,
            isStale: true,
            lastCheckedOn: today,
            error: err?.message,
          });
        }
      }
    }

    return this.getSnapshots();
  }

  /**
   * Starts the 24-hour scheduler.
   */
  public static startScheduler(intervalMs: number = 24 * 60 * 60 * 1000): void {
    if (this.schedulerIntervalId) {
      clearInterval(this.schedulerIntervalId);
    }

    logger.info('OfficialPageWatcher', `Scheduler initialized. Running every ${Math.round(intervalMs / (60 * 60 * 1000))} hours.`);

    // Run first scan in background after initial delay
    setTimeout(() => {
      this.runWatcher().catch(err => {
        logger.error('OfficialPageWatcher', 'Initial watcher run failed', err);
      });
    }, 5000);

    this.schedulerIntervalId = setInterval(() => {
      this.runWatcher().catch(err => {
        logger.error('OfficialPageWatcher', 'Scheduled 24h watcher run failed', err);
      });
    }, intervalMs);
  }

  /**
   * Stops the background scheduler.
   */
  public static stopScheduler(): void {
    if (this.schedulerIntervalId) {
      clearInterval(this.schedulerIntervalId);
      this.schedulerIntervalId = null;
    }
  }
}

/**
 * TERRASYNX: Deterministic Parsers Service (Prompt 65)
 * 
 * Strict deterministic pipeline:
 * 1. Read Schema.org JSON-LD:
 *    - JobPosting (validThrough, datePosted, employmentType, etc.)
 *    - Event (startDate, endDate, eventStatus: EventCancelled, EventPostponed,
 *             EventRescheduled, EventMovedOnline)
 *    from allowlisted official pages.
 * 2. Treat HTTP 404/410 and a redirect to the site's homepage as closure signals.
 * 3. Reuse the existing ATS listing diff (AtsClosureDetectionService).
 * 4. Only if none of these apply, fall back to the Official Page Watcher AI extraction
 *    with grounding (OfficialPageWatcherService / groundExtractedData).
 * 5. Strict integrity: NEVER infer or fabricate a date that is not explicitly in the page.
 */

import { Opportunity, OpportunityVerificationStatus, DateConfidence, HackathonMode, HackathonStatus } from '../types';
import { HONEST_USER_AGENT, validateSafeTargetUrl } from './linkAllowlistService';
import { AtsClosureDetectionService } from './atsClosureDetectionService';
import {
  OfficialPageWatcherService,
  WatcherExtractedData,
  groundExtractedData,
  extractReadableText,
} from './officialPageWatcherService';
import { logger } from '../utils/logger';

// ============================================================================
// Types & Models
// ============================================================================

export interface SchemaJobPosting {
  type: 'JobPosting';
  title?: string;
  description?: string;
  validThrough?: string; // Schema.org JobPosting validThrough date / ISO string
  datePosted?: string;
  employmentType?: string;
  hiringOrganization?: string;
  jobLocation?: string;
  raw: Record<string, any>;
}

export type SchemaEventStatus =
  | 'EventCancelled'
  | 'EventPostponed'
  | 'EventRescheduled'
  | 'EventMovedOnline'
  | 'EventScheduled'
  | string;

export interface SchemaEvent {
  type: 'Event';
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  eventStatus?: SchemaEventStatus;
  isCancelledOrPostponed: boolean;
  isMovedOnline: boolean;
  location?: string;
  organizer?: string;
  raw: Record<string, any>;
}

export interface ParsedJsonLdResult {
  jobPostings: SchemaJobPosting[];
  events: SchemaEvent[];
  rawCount: number;
}

export interface HttpClosureResult {
  isClosure: boolean;
  statusCode?: number;
  finalRedirectUrl?: string;
  closureType?: 'HTTP_404_410' | 'HOMEPAGE_REDIRECT';
  status?: OpportunityVerificationStatus;
  evidence?: string;
}

export interface AtsClosureResult {
  isClosure: boolean;
  status?: OpportunityVerificationStatus;
  possiblyClosed: boolean;
  consecutiveMissingFetches: number;
  evidence?: string;
}

export type LiveParserSource =
  | 'json-ld'
  | 'http-closure'
  | 'ats-diff'
  | 'ai-grounded-fallback'
  | 'unresolved';

export interface LiveParserResult {
  source: LiveParserSource;
  status: OpportunityVerificationStatus;
  dateConfidence: DateConfidence;
  isClosed: boolean;
  closureReason?: string;
  
  // Extracted Date Fields (strictly un-inferred)
  validThrough?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  datesText?: string | null;
  deadlineText?: string | null;

  // Extracted Event/Job Metadata
  mode?: HackathonMode | null;
  titleOrName?: string | null;
  organizerOrCompany?: string | null;

  // Evidence & Provenance
  evidence: string;
  sourceUrl: string;
  checkedAt: number;

  // Underlying artifacts
  jsonLd?: ParsedJsonLdResult;
  httpClosure?: HttpClosureResult;
  atsClosure?: AtsClosureResult;
  groundedData?: WatcherExtractedData | null;
}

export interface LiveParserInput {
  url: string;
  html?: string;
  organizer?: string;
  responseStatus?: number;
  finalRedirectUrl?: string;
  opportunity?: Partial<Opportunity>;
  currentAtsJobs?: Opportunity[];
  allowAiFallback?: boolean; // Default true, executed only if deterministic steps yield nothing
  now?: number;
}

export interface SafeFetchResponse {
  ok: boolean;
  statusCode: number;
  html?: string;
  finalUrl: string;
  error?: string;
  isRedirectToHomepage?: boolean;
}

// ============================================================================
// 1. JSON-LD Parser for JobPosting & Event
// ============================================================================

/**
 * Extracts all JSON-LD payloads from raw HTML.
 * Handles nested arrays, @graph arrays, CDATA, and whitespace.
 */
export function extractJsonLd(html: string): any[] {
  if (!html || typeof html !== 'string') return [];

  const results: any[] = [];
  const scriptRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(html)) !== null) {
    let rawContent = match[1]?.trim();
    if (!rawContent) continue;

    // Strip comments and CDATA wrappers (e.g. /*<![CDATA[*/, <!--, //<![CDATA[)
    rawContent = rawContent
      .replace(/\/\*<!\[CDATA\[\*\//gi, '')
      .replace(/\/\*\]\]>\*\//gi, '')
      .replace(/<!\[CDATA\[/gi, '')
      .replace(/\]\]>/gi, '')
      .replace(/^\s*<!--+/gm, '')
      .replace(/--+>\s*$/gm, '')
      .replace(/^\s*\/\/[^\n]*$/gm, '')
      .trim();

    try {
      const parsed = JSON.parse(rawContent);
      unrollJsonLdNodes(parsed, results);
    } catch (err) {
      // In case of slight syntax issues, attempt trailing comma sanitization
      try {
        const sanitized = rawContent.replace(/,\s*([}\]])/g, '$1');
        const parsed = JSON.parse(sanitized);
        unrollJsonLdNodes(parsed, results);
      } catch {
        // Silently skip malformed JSON-LD scripts
      }
    }
  }

  return results;
}

function unrollJsonLdNodes(item: any, out: any[]): void {
  if (!item) return;

  if (Array.isArray(item)) {
    for (const sub of item) {
      unrollJsonLdNodes(sub, out);
    }
    return;
  }

  if (typeof item === 'object') {
    if (Array.isArray(item['@graph'])) {
      for (const node of item['@graph']) {
        unrollJsonLdNodes(node, out);
      }
    } else {
      out.push(item);
    }
  }
}

/**
 * Normalizes Schema.org @type values, stripping full schema.org URLs.
 */
export function normalizeSchemaTypes(rawType: any): string[] {
  if (!rawType) return [];
  const list = Array.isArray(rawType) ? rawType : [rawType];
  return list
    .filter((t): t is string => typeof t === 'string')
    .map(t => t.trim().replace(/^https?:\/\/schema\.org\//i, '').toLowerCase());
}

/**
 * Normalizes Schema.org eventStatus into recognized states.
 */
export function normalizeEventStatus(rawStatus: any, attendanceMode?: any): {
  isCancelledOrPostponed: boolean;
  isMovedOnline: boolean;
  normalizedStatus: SchemaEventStatus;
} {
  const statusStr = typeof rawStatus === 'string'
    ? rawStatus.trim().replace(/^https?:\/\/schema\.org\//i, '')
    : '';

  const attendanceStr = typeof attendanceMode === 'string'
    ? attendanceMode.trim().replace(/^https?:\/\/schema\.org\//i, '')
    : '';

  const isCancelled = statusStr.toLowerCase() === 'eventcancelled';
  const isPostponed = statusStr.toLowerCase() === 'eventpostponed';
  const isRescheduled = statusStr.toLowerCase() === 'eventrescheduled';
  const isMovedOnline = statusStr.toLowerCase() === 'eventmovedonline' || attendanceStr.toLowerCase() === 'onlineeventattendancemode';

  return {
    isCancelledOrPostponed: isCancelled || isPostponed || isRescheduled,
    isMovedOnline,
    normalizedStatus: statusStr || 'EventScheduled',
  };
}

/**
 * Parses Schema.org JobPosting and Event definitions from HTML.
 * Never fabricates or guesses missing fields.
 */
export function parseJsonLd(html: string): ParsedJsonLdResult {
  const rawNodes = extractJsonLd(html);
  const jobPostings: SchemaJobPosting[] = [];
  const events: SchemaEvent[] = [];

  for (const node of rawNodes) {
    if (!node || typeof node !== 'object') continue;

    const types = normalizeSchemaTypes(node['@type'] || node.type);

    // 1. JobPosting detection
    if (types.includes('jobposting')) {
      const validThrough = typeof node.validThrough === 'string' && node.validThrough.trim().length > 0
        ? node.validThrough.trim()
        : undefined;

      const datePosted = typeof node.datePosted === 'string' && node.datePosted.trim().length > 0
        ? node.datePosted.trim()
        : undefined;

      const title = typeof node.title === 'string' ? node.title.trim() : undefined;
      const description = typeof node.description === 'string' ? node.description.trim() : undefined;
      const employmentType = typeof node.employmentType === 'string' ? node.employmentType.trim() : undefined;

      let hiringOrganization: string | undefined;
      if (typeof node.hiringOrganization === 'string') {
        hiringOrganization = node.hiringOrganization.trim();
      } else if (node.hiringOrganization && typeof node.hiringOrganization === 'object') {
        hiringOrganization = typeof node.hiringOrganization.name === 'string' ? node.hiringOrganization.name.trim() : undefined;
      }

      let jobLocation: string | undefined;
      if (typeof node.jobLocation === 'string') {
        jobLocation = node.jobLocation.trim();
      } else if (node.jobLocation && typeof node.jobLocation === 'object') {
        jobLocation = node.jobLocation.address?.addressLocality || node.jobLocation.name || undefined;
      }

      jobPostings.push({
        type: 'JobPosting',
        title,
        description,
        validThrough,
        datePosted,
        employmentType,
        hiringOrganization,
        jobLocation,
        raw: node,
      });
    }

    // 2. Event detection (Event or subtypes like Hackathon, EducationEvent, etc.)
    const isEvent = types.some(t =>
      t === 'event' ||
      t.endsWith('event') ||
      t === 'hackathon' ||
      t === 'competition'
    );

    if (isEvent) {
      const startDate = typeof node.startDate === 'string' && node.startDate.trim().length > 0
        ? node.startDate.trim()
        : undefined;

      const endDate = typeof node.endDate === 'string' && node.endDate.trim().length > 0
        ? node.endDate.trim()
        : undefined;

      const { isCancelledOrPostponed, isMovedOnline, normalizedStatus } = normalizeEventStatus(
        node.eventStatus,
        node.eventAttendanceMode
      );

      const name = typeof node.name === 'string' ? node.name.trim() : undefined;
      const description = typeof node.description === 'string' ? node.description.trim() : undefined;

      let organizer: string | undefined;
      if (typeof node.organizer === 'string') {
        organizer = node.organizer.trim();
      } else if (node.organizer && typeof node.organizer === 'object') {
        organizer = typeof node.organizer.name === 'string' ? node.organizer.name.trim() : undefined;
      }

      let location: string | undefined;
      if (typeof node.location === 'string') {
        location = node.location.trim();
      } else if (node.location && typeof node.location === 'object') {
        location = node.location.name || node.location.address?.addressLocality || undefined;
      }

      events.push({
        type: 'Event',
        name,
        description,
        startDate,
        endDate,
        eventStatus: normalizedStatus,
        isCancelledOrPostponed,
        isMovedOnline,
        location,
        organizer,
        raw: node,
      });
    }
  }

  return {
    jobPostings,
    events,
    rawCount: rawNodes.length,
  };
}

// ============================================================================
// 2. HTTP 404/410 and Homepage Redirect Closure Signals
// ============================================================================

/**
 * Checks whether the target URL and response indicate a portal closure:
 * (a) HTTP 404 (Not Found) or 410 (Gone) -> REMOVED_BY_PORTAL
 * (b) Redirect to domain's root homepage from a specific subpath -> CLOSED_EARLY_BY_PORTAL
 */
export function detectHttpClosureSignal(
  targetUrl: string,
  responseStatus?: number,
  finalRedirectUrl?: string
): HttpClosureResult {
  // Check HTTP 404 or 410
  if (responseStatus === 404 || responseStatus === 410) {
    return {
      isClosure: true,
      statusCode: responseStatus,
      finalRedirectUrl,
      closureType: 'HTTP_404_410',
      status: 'REMOVED_BY_PORTAL',
      evidence: `HTTP ${responseStatus} encountered; requisition was permanently removed or expired by the employer/portal.`,
    };
  }

  // Check Redirect to Homepage
  if (finalRedirectUrl && targetUrl) {
    try {
      const target = new URL(targetUrl);
      const finalU = new URL(finalRedirectUrl);

      const targetPath = target.pathname.replace(/\/+$/, '');
      const finalPath = finalU.pathname.replace(/\/+$/, '');

      // Target URL was requesting a specific subpath (e.g. /jobs/123 or /events/annual-hackathon)
      const targetIsSpecificSubpath = targetPath.length > 0 && targetPath !== '/' && targetPath !== '/index.html';

      // Final URL is the root homepage
      const finalIsHomepage = finalPath.length === 0 || finalPath === '/' || finalPath === '/index.html';

      // Check domain relationship (same origin or parent/subdomain)
      const targetHost = target.hostname.toLowerCase().replace(/^www\./, '');
      const finalHost = finalU.hostname.toLowerCase().replace(/^www\./, '');
      const isSameSite = targetHost === finalHost ||
        targetHost.endsWith(`.${finalHost}`) ||
        finalHost.endsWith(`.${targetHost}`);

      if (targetIsSpecificSubpath && finalIsHomepage && isSameSite) {
        return {
          isClosure: true,
          statusCode: responseStatus || 301,
          finalRedirectUrl,
          closureType: 'HOMEPAGE_REDIRECT',
          status: 'CLOSED_EARLY_BY_PORTAL',
          evidence: `Redirected from specific listing (${target.pathname}) to site homepage (${finalU.origin}/), signaling the listing has closed early or been unlisted.`,
        };
      }
    } catch {
      // Ignore URL parsing errors
    }
  }

  return { isClosure: false, statusCode: responseStatus, finalRedirectUrl };
}

// ============================================================================
// 3. ATS Listing Diff Reuse
// ============================================================================

/**
 * Reuses AtsClosureDetectionService to inspect ATS listings.
 * Detects whether a job has disappeared from consecutive ATS API syncs.
 */
export function detectAtsClosureSignal(
  opportunity?: Partial<Opportunity>,
  currentAtsFetchJobs?: Opportunity[]
): AtsClosureResult {
  if (!opportunity) {
    return { isClosure: false, possiblyClosed: false, consecutiveMissingFetches: 0 };
  }

  // If this opportunity is an ATS job
  const isAtsJob = AtsClosureDetectionService.isSupportedAtsJob(opportunity);
  if (!isAtsJob) {
    return { isClosure: false, possiblyClosed: false, consecutiveMissingFetches: 0 };
  }

  // 1. Direct state flags from model
  if (opportunity.possiblyClosed === true || (opportunity.consecutiveMissingFetches && opportunity.consecutiveMissingFetches >= 2)) {
    return {
      isClosure: true,
      possiblyClosed: true,
      consecutiveMissingFetches: opportunity.consecutiveMissingFetches || 2,
      status: 'POSSIBLY_CLOSED',
      evidence: `ATS listing diff: job requisition disappeared from consecutive API fetches (${opportunity.consecutiveMissingFetches || 2} missing).`,
    };
  }

  // 2. Active comparison against latest ATS fetch batch
  if (currentAtsFetchJobs && Array.isArray(currentAtsFetchJobs) && opportunity.id) {
    const oppSource = AtsClosureDetectionService.resolveSourceType(opportunity);
    const oppCompany = AtsClosureDetectionService.getCompanyKey(opportunity);

    // Check if the source company was actively part of this fetch
    const matchingSourceJobs = currentAtsFetchJobs.filter(j => {
      const src = AtsClosureDetectionService.resolveSourceType(j);
      const comp = AtsClosureDetectionService.getCompanyKey(j);
      return src === oppSource && comp === oppCompany;
    });

    if (matchingSourceJobs.length > 0) {
      const isPresentInFetch = matchingSourceJobs.some(j => j.id === opportunity.id);
      if (!isPresentInFetch) {
        const nextMissing = (opportunity.consecutiveMissingFetches || 0) + 1;
        if (nextMissing >= 2) {
          return {
            isClosure: true,
            possiblyClosed: true,
            consecutiveMissingFetches: nextMissing,
            status: 'POSSIBLY_CLOSED',
            evidence: `ATS listing diff: requisition disappeared from 2 consecutive API scans.`,
          };
        }
      }
    }
  }

  return {
    isClosure: false,
    possiblyClosed: false,
    consecutiveMissingFetches: opportunity.consecutiveMissingFetches || 0,
  };
}

// ============================================================================
// 4. Safe Network Fetcher with Link Allowlist & Honest User-Agent
// ============================================================================

/**
 * Fetches an official page securely:
 * - Checks link allowlist and rejects SSRF/private IPs
 * - Uses honest User-Agent
 * - Follows redirects up to 5 hops, detecting homepage redirections
 */
export async function fetchOfficialPageSafe(
  url: string,
  timeoutMs: number = 4000
): Promise<SafeFetchResponse> {
  const validation = await validateSafeTargetUrl(url);
  if (!validation.safe) {
    return {
      ok: false,
      statusCode: 403,
      finalUrl: url,
      error: validation.error || 'Disallowed target host or SSRF protection failure',
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let currentUrl = url;
    let redirectCount = 0;
    const MAX_REDIRECTS = 5;
    let response: Response | null = null;

    while (redirectCount <= MAX_REDIRECTS) {
      response = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'User-Agent': HONEST_USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
        redirect: 'manual',
      }).catch(() => null);

      if (!response) break;

      // Handle HTTP redirects
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) break;

        let nextUrl: URL;
        try {
          nextUrl = new URL(location, currentUrl);
        } catch {
          clearTimeout(timeout);
          return { ok: false, statusCode: response.status, finalUrl: currentUrl, error: 'Malformed redirect location' };
        }

        const nextUrlStr = nextUrl.toString();
        const check = await validateSafeTargetUrl(nextUrlStr);
        if (!check.safe) {
          clearTimeout(timeout);
          return { ok: false, statusCode: 403, finalUrl: nextUrlStr, error: `Redirect to unsafe target: ${check.error}` };
        }

        currentUrl = nextUrlStr;
        redirectCount++;
        continue;
      }

      break;
    }

    clearTimeout(timeout);

    if (!response) {
      return { ok: false, statusCode: 0, finalUrl: currentUrl, error: 'Network failure or timeout' };
    }

    const closureCheck = detectHttpClosureSignal(url, response.status, currentUrl);

    if (response.ok) {
      const html = await response.text();
      return {
        ok: true,
        statusCode: response.status,
        html,
        finalUrl: currentUrl,
        isRedirectToHomepage: closureCheck.closureType === 'HOMEPAGE_REDIRECT',
      };
    }

    return {
      ok: false,
      statusCode: response.status,
      finalUrl: currentUrl,
      error: `HTTP ${response.status}`,
    };
  } catch (err: any) {
    clearTimeout(timeout);
    return {
      ok: false,
      statusCode: 0,
      finalUrl: url,
      error: err?.message || 'Fetch execution failure',
    };
  }
}

// ============================================================================
// 5. Unified Deterministic Pipeline
// ============================================================================

/**
 * Main parser entry point executing Prompt 65 hierarchy:
 * 1. Check HTTP 404/410 and Homepage Redirect closure signals.
 * 2. Check ATS listing diff closure signals.
 * 3. Deterministic JSON-LD parsing for JobPosting (validThrough) and Event (startDate, endDate, eventStatus).
 * 4. Fallback ONLY if none of the above apply to Official Page Watcher AI extraction with grounding.
 * 5. Strictly NEVER infer a date that is not explicitly in the page.
 */
export async function parseOfficialPageDeterministic(
  input: LiveParserInput
): Promise<LiveParserResult> {
  const now = input.now || Date.now();
  const url = input.url;

  // --------------------------------------------------------------------------
  // STEP 1: Check HTTP Closure Signals (404, 410, Homepage Redirect)
  // --------------------------------------------------------------------------
  const httpClosure = detectHttpClosureSignal(
    url,
    input.responseStatus,
    input.finalRedirectUrl
  );

  if (httpClosure.isClosure) {
    return {
      source: 'http-closure',
      status: httpClosure.status || 'REMOVED_BY_PORTAL',
      dateConfidence: 'UNKNOWN',
      isClosed: true,
      closureReason: httpClosure.evidence,
      evidence: httpClosure.evidence || 'HTTP closure signal observed.',
      sourceUrl: input.finalRedirectUrl || url,
      checkedAt: now,
      httpClosure,
    };
  }

  // --------------------------------------------------------------------------
  // STEP 2: Check ATS Listing Diff
  // --------------------------------------------------------------------------
  const atsClosure = detectAtsClosureSignal(input.opportunity, input.currentAtsJobs);
  if (atsClosure.isClosure) {
    return {
      source: 'ats-diff',
      status: atsClosure.status || 'POSSIBLY_CLOSED',
      dateConfidence: 'UNKNOWN',
      isClosed: true,
      closureReason: atsClosure.evidence,
      evidence: atsClosure.evidence || 'Disappeared from consecutive ATS sync cycles.',
      sourceUrl: url,
      checkedAt: now,
      atsClosure,
    };
  }

  // --------------------------------------------------------------------------
  // STEP 3: Deterministic JSON-LD Parsing
  // --------------------------------------------------------------------------
  const html = input.html || '';
  const jsonLdResult = parseJsonLd(html);

  // 3A. Event Schema Parsing
  if (jsonLdResult.events.length > 0) {
    // Pick the most relevant event
    const event = jsonLdResult.events[0];

    // Check cancellation/postponement
    if (event.isCancelledOrPostponed) {
      return {
        source: 'json-ld',
        status: 'CANCELLED_OR_POSTPONED',
        dateConfidence: event.startDate ? 'OFFICIAL' : 'UNKNOWN',
        isClosed: true,
        closureReason: `Schema.org Event status declared: ${event.eventStatus}`,
        startDate: event.startDate || null,
        endDate: event.endDate || null,
        datesText: event.startDate && event.endDate ? `${event.startDate} – ${event.endDate}` : (event.startDate || null),
        mode: event.isMovedOnline ? 'online' : null,
        titleOrName: event.name || null,
        organizerOrCompany: event.organizer || input.organizer || null,
        evidence: `Schema.org Event JSON-LD explicitly announced status: ${event.eventStatus}.`,
        sourceUrl: url,
        checkedAt: now,
        jsonLd: jsonLdResult,
      };
    }

    // Has dates?
    const hasDates = Boolean(event.startDate || event.endDate);
    const datesText = event.startDate && event.endDate
      ? `${event.startDate} – ${event.endDate}`
      : (event.startDate || event.endDate || null);

    return {
      source: 'json-ld',
      status: 'OPEN_VERIFIED',
      dateConfidence: hasDates ? 'OFFICIAL' : 'UNKNOWN',
      isClosed: false,
      startDate: event.startDate || null,
      endDate: event.endDate || null,
      datesText,
      mode: event.isMovedOnline ? 'online' : null,
      titleOrName: event.name || null,
      organizerOrCompany: event.organizer || input.organizer || null,
      evidence: `Deterministic Schema.org Event parsed from JSON-LD on official page.`,
      sourceUrl: url,
      checkedAt: now,
      jsonLd: jsonLdResult,
    };
  }

  // 3B. JobPosting Schema Parsing
  if (jsonLdResult.jobPostings.length > 0) {
    const job = jsonLdResult.jobPostings[0];
    let isExpired = false;
    let validThroughEpoch: number | null = null;

    if (job.validThrough) {
      const parsedEpoch = Date.parse(job.validThrough);
      if (!isNaN(parsedEpoch)) {
        validThroughEpoch = parsedEpoch;
        if (now >= parsedEpoch) {
          isExpired = true;
        }
      }
    }

    if (isExpired) {
      return {
        source: 'json-ld',
        status: 'DEADLINE_PASSED',
        dateConfidence: 'OFFICIAL',
        isClosed: true,
        closureReason: `Schema.org JobPosting validThrough deadline (${job.validThrough}) has passed.`,
        validThrough: job.validThrough,
        deadlineText: job.validThrough,
        titleOrName: job.title || null,
        organizerOrCompany: job.hiringOrganization || input.organizer || null,
        evidence: `Schema.org JobPosting validThrough expired on ${job.validThrough}.`,
        sourceUrl: url,
        checkedAt: now,
        jsonLd: jsonLdResult,
      };
    }

    return {
      source: 'json-ld',
      status: 'OPEN_VERIFIED',
      dateConfidence: job.validThrough ? 'OFFICIAL' : 'UNKNOWN',
      isClosed: false,
      validThrough: job.validThrough || null,
      deadlineText: job.validThrough || null,
      titleOrName: job.title || null,
      organizerOrCompany: job.hiringOrganization || input.organizer || null,
      evidence: `Deterministic Schema.org JobPosting verified from JSON-LD on official portal.`,
      sourceUrl: url,
      checkedAt: now,
      jsonLd: jsonLdResult,
    };
  }

  // --------------------------------------------------------------------------
  // STEP 4: Fallback to Official Page Watcher AI Extraction with Grounding
  // --------------------------------------------------------------------------
  // "Only if none of these apply, fall back to the Official Page Watcher AI extraction with grounding.
  // Never infer a date that is not in the page."
  if (input.allowAiFallback !== false && html && html.trim().length > 0) {
    const pageText = extractReadableText(html);
    const org = input.organizer || 'Official Organizer';

    let extracted: WatcherExtractedData;
    try {
      extracted = await OfficialPageWatcherService.extractWithGemini(pageText, org, url);
    } catch {
      extracted = OfficialPageWatcherService.literalFallbackExtraction(pageText, org);
    }

    // Literal check for dates/deadline in case of offline/fallback mode
    if (!extracted.dates) {
      const datesMatch = pageText.match(/(?:dates?|schedule):\s*([A-Za-z]+ \d{1,2}(?:\s*[-–]\s*\d{1,2})?,? \d{4})/i) ||
                         pageText.match(/(?:dates?|schedule):\s*([a-zA-Z0-9\s,\-–]+?)(?=\s*(?:mode|registration|entry|eligibility|location|deadline|\.|\n|<|$))/i);
      if (datesMatch && datesMatch[1]?.trim().length > 3) {
        extracted.dates = datesMatch[1].trim();
      }
    }
    if (!extracted.deadline) {
      const deadlineMatch = pageText.match(/(?:deadline|register by|apply by):\s*([A-Za-z]+ \d{1,2},? \d{4})/i) ||
                            pageText.match(/(?:deadline|register by|apply by):\s*([a-zA-Z0-9\s,\-–]+?)(?=\s*(?:dates|mode|entry|eligibility|location|\.|\n|<|$))/i);
      if (deadlineMatch && deadlineMatch[1]?.trim().length > 3) {
        extracted.deadline = deadlineMatch[1].trim();
      }
    }

    // Ground every extracted value: must exist verbatim in page text
    const grounded = groundExtractedData(extracted, pageText);

    // Strict integrity: Never infer a date that is not in the page!
    const groundedDates = grounded.dates && grounded.dates.trim().length > 0 ? grounded.dates.trim() : null;
    const groundedDeadline = grounded.deadline && grounded.deadline.trim().length > 0 ? grounded.deadline.trim() : null;

    const hasGroundedDate = Boolean(groundedDates || groundedDeadline);

    return {
      source: 'ai-grounded-fallback',
      status: hasGroundedDate ? 'OPEN_VERIFIED' : 'UNKNOWN',
      dateConfidence: hasGroundedDate ? 'REPORTED' : 'UNKNOWN',
      isClosed: false,
      datesText: groundedDates,
      deadlineText: groundedDeadline,
      mode: grounded.mode,
      titleOrName: grounded.name,
      organizerOrCompany: org,
      evidence: hasGroundedDate
        ? `Grounded page extraction verified: date found verbatim in official page text.`
        : `Page scanned with zero hallucination: no explicit date detected in page text.`,
      sourceUrl: url,
      checkedAt: now,
      groundedData: grounded,
      jsonLd: jsonLdResult,
    };
  }

  // --------------------------------------------------------------------------
  // STEP 5: Unresolved
  // --------------------------------------------------------------------------
  return {
    source: 'unresolved',
    status: 'UNKNOWN',
    dateConfidence: 'UNKNOWN',
    isClosed: false,
    evidence: 'No deterministic signals or readable content detected on page.',
    sourceUrl: url,
    checkedAt: now,
    jsonLd: jsonLdResult,
  };
}

// Export singleton helper
export const LiveParsersService = {
  extractJsonLd,
  parseJsonLd,
  normalizeSchemaTypes,
  normalizeEventStatus,
  detectHttpClosureSignal,
  detectAtsClosureSignal,
  fetchOfficialPageSafe,
  parseOfficialPageDeterministic,
};

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  extractJsonLd,
  parseJsonLd,
  detectHttpClosureSignal,
  detectAtsClosureSignal,
  parseOfficialPageDeterministic,
  LiveParsersService,
} from '../services/liveParsers';
import { Opportunity } from '../types';
import { OfficialPageWatcherService } from '../services/officialPageWatcherService';

describe('Prompt 65: Deterministic Parsers Service (liveParsers.ts)', () => {
  const FIXED_NOW = new Date('2026-10-25T12:00:00Z').getTime();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(OfficialPageWatcherService, 'extractWithGemini').mockImplementation(async (text, org) => {
      return OfficialPageWatcherService.literalFallbackExtraction(text, org);
    });
  });

  // ==========================================================================
  // 1. JSON-LD JobPosting & Event Parsing
  // ==========================================================================
  describe('1. JSON-LD Extraction and Schema.org Parsing', () => {
    it('extracts JobPosting with validThrough, employmentType, and hiringOrganization', () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": "Software Engineer Intern (Systems)",
            "description": "Join our distributed infrastructure team.",
            "datePosted": "2026-09-01T08:00:00Z",
            "validThrough": "2026-11-15T23:59:59Z",
            "employmentType": "FULL_TIME",
            "hiringOrganization": {
              "@type": "Organization",
              "name": "Acme Corp"
            },
            "jobLocation": {
              "@type": "Place",
              "address": {
                "addressLocality": "San Francisco"
              }
            }
          }
          </script>
        </head>
        <body>Job Body</body>
        </html>
      `;

      const result = parseJsonLd(html);
      expect(result.jobPostings.length).toBe(1);
      const job = result.jobPostings[0];
      expect(job.title).toBe('Software Engineer Intern (Systems)');
      expect(job.validThrough).toBe('2026-11-15T23:59:59Z');
      expect(job.employmentType).toBe('FULL_TIME');
      expect(job.hiringOrganization).toBe('Acme Corp');
    });

    it('extracts Event with startDate, endDate, and eventStatus', () => {
      const html = `
        <html>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Event",
          "name": "Global AI Hackathon 2026",
          "startDate": "2026-11-20T09:00:00Z",
          "endDate": "2026-11-22T18:00:00Z",
          "eventStatus": "https://schema.org/EventScheduled",
          "location": {
            "name": "Moscone Center"
          }
        }
        </script>
        </html>
      `;

      const result = parseJsonLd(html);
      expect(result.events.length).toBe(1);
      const ev = result.events[0];
      expect(ev.name).toBe('Global AI Hackathon 2026');
      expect(ev.startDate).toBe('2026-11-20T09:00:00Z');
      expect(ev.endDate).toBe('2026-11-22T18:00:00Z');
      expect(ev.eventStatus).toBe('EventScheduled');
      expect(ev.isCancelledOrPostponed).toBe(false);
    });

    it('handles @graph unrolling and CDATA blocks', () => {
      const html = `
        <html>
        <script type="application/ld+json">
        /*<![CDATA[*/
        {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "url": "https://example.com"
            },
            {
              "@type": "JobPosting",
              "title": "Frontier AI Fellow",
              "validThrough": "2026-12-31T23:59:59Z"
            }
          ]
        }
        /*]]>*/
        </script>
        </html>
      `;

      const result = parseJsonLd(html);
      expect(result.jobPostings.length).toBe(1);
      expect(result.jobPostings[0].title).toBe('Frontier AI Fellow');
      expect(result.jobPostings[0].validThrough).toBe('2026-12-31T23:59:59Z');
    });

    it('correctly maps EventCancelled, EventPostponed, and EventRescheduled to CANCELLED_OR_POSTPONED', async () => {
      const cancelledHtml = `
        <script type="application/ld+json">
        {
          "@type": "Event",
          "name": "DevCon Spring",
          "eventStatus": "https://schema.org/EventCancelled",
          "startDate": "2026-11-01"
        }
        </script>
      `;

      const decision = await parseOfficialPageDeterministic({
        url: 'https://developers.google.com/devcon',
        html: cancelledHtml,
        now: FIXED_NOW,
      });

      expect(decision.source).toBe('json-ld');
      expect(decision.status).toBe('CANCELLED_OR_POSTPONED');
      expect(decision.isClosed).toBe(true);
      expect(decision.closureReason).toContain('EventCancelled');

      // Test EventPostponed
      const postponedHtml = `
        <script type="application/ld+json">
        {
          "@type": "Event",
          "name": "Annual Summit",
          "eventStatus": "EventPostponed"
        }
        </script>
      `;

      const postponedDecision = await parseOfficialPageDeterministic({
        url: 'https://ethglobal.com/events',
        html: postponedHtml,
        now: FIXED_NOW,
      });
      expect(postponedDecision.status).toBe('CANCELLED_OR_POSTPONED');
      expect(postponedDecision.isClosed).toBe(true);
    });

    it('correctly maps EventMovedOnline to mode "online"', async () => {
      const onlineHtml = `
        <script type="application/ld+json">
        {
          "@type": "Event",
          "name": "Virtual Spring Sprint",
          "eventStatus": "https://schema.org/EventMovedOnline",
          "startDate": "2026-11-05",
          "endDate": "2026-11-07"
        }
        </script>
      `;

      const decision = await parseOfficialPageDeterministic({
        url: 'https://hackmit.org',
        html: onlineHtml,
        now: FIXED_NOW,
      });

      expect(decision.source).toBe('json-ld');
      expect(decision.status).toBe('OPEN_VERIFIED');
      expect(decision.isClosed).toBe(false);
      expect(decision.mode).toBe('online');
      expect(decision.startDate).toBe('2026-11-05');
      expect(decision.endDate).toBe('2026-11-07');
    });

    it('identifies expired JobPosting when validThrough has passed', async () => {
      const expiredHtml = `
        <script type="application/ld+json">
        {
          "@type": "JobPosting",
          "title": "Summer 2026 Intern",
          "validThrough": "2026-10-01T00:00:00Z"
        }
        </script>
      `;

      const decision = await parseOfficialPageDeterministic({
        url: 'https://boards.greenhouse.io/openai/jobs/12345',
        html: expiredHtml,
        now: FIXED_NOW, // 2026-10-25
      });

      expect(decision.source).toBe('json-ld');
      expect(decision.status).toBe('DEADLINE_PASSED');
      expect(decision.isClosed).toBe(true);
      expect(decision.validThrough).toBe('2026-10-01T00:00:00Z');
      expect(decision.closureReason).toContain('validThrough deadline');
    });

    it('never infers a date when JobPosting has no validThrough date in JSON-LD', async () => {
      const noDateHtml = `
        <script type="application/ld+json">
        {
          "@type": "JobPosting",
          "title": "Open Ended Intern",
          "employmentType": "INTERN"
        }
        </script>
      `;

      const decision = await parseOfficialPageDeterministic({
        url: 'https://jobs.lever.co/company/abc',
        html: noDateHtml,
        now: FIXED_NOW,
      });

      expect(decision.source).toBe('json-ld');
      expect(decision.status).toBe('OPEN_VERIFIED');
      expect(decision.validThrough).toBeNull();
      expect(decision.deadlineText).toBeNull();
      expect(decision.dateConfidence).toBe('UNKNOWN');
    });
  });

  // ==========================================================================
  // 2. HTTP 404/410 and Homepage Redirect Closure Signals
  // ==========================================================================
  describe('2. HTTP Closure Signals', () => {
    it('detects HTTP 404 as REMOVED_BY_PORTAL closure signal', () => {
      const signal = detectHttpClosureSignal('https://jobs.lever.co/stripe/job-999', 404);
      expect(signal.isClosure).toBe(true);
      expect(signal.status).toBe('REMOVED_BY_PORTAL');
      expect(signal.closureType).toBe('HTTP_404_410');
      expect(signal.evidence).toContain('HTTP 404');
    });

    it('detects HTTP 410 (Gone) as REMOVED_BY_PORTAL closure signal', () => {
      const signal = detectHttpClosureSignal('https://boards.greenhouse.io/figma/jobs/555', 410);
      expect(signal.isClosure).toBe(true);
      expect(signal.status).toBe('REMOVED_BY_PORTAL');
      expect(signal.closureType).toBe('HTTP_404_410');
      expect(signal.evidence).toContain('HTTP 410');
    });

    it('detects redirect to domain homepage from a specific job subpath as CLOSED_EARLY_BY_PORTAL', () => {
      const targetUrl = 'https://jobs.smartrecruiters.com/Acme/12345-swe-intern';
      const redirectUrl = 'https://jobs.smartrecruiters.com/';

      const signal = detectHttpClosureSignal(targetUrl, 302, redirectUrl);
      expect(signal.isClosure).toBe(true);
      expect(signal.status).toBe('CLOSED_EARLY_BY_PORTAL');
      expect(signal.closureType).toBe('HOMEPAGE_REDIRECT');
      expect(signal.evidence).toContain('to site homepage');
    });

    it('does not trigger homepage closure if original target was already the homepage', () => {
      const targetUrl = 'https://hackthenorth.com/';
      const redirectUrl = 'https://hackthenorth.com/';

      const signal = detectHttpClosureSignal(targetUrl, 200, redirectUrl);
      expect(signal.isClosure).toBe(false);
    });

    it('does not trigger homepage closure if redirected to a new job slug path', () => {
      const targetUrl = 'https://jobs.lever.co/company/old-id';
      const redirectUrl = 'https://jobs.lever.co/company/new-id-canonical';

      const signal = detectHttpClosureSignal(targetUrl, 301, redirectUrl);
      expect(signal.isClosure).toBe(false);
    });
  });

  // ==========================================================================
  // 3. ATS Listing Diff Reuse
  // ==========================================================================
  describe('3. ATS Listing Diff Reuse', () => {
    it('detects closure when opportunity has possiblyClosed flag or consecutiveMissingFetches >= 2', () => {
      const opp: Partial<Opportunity> = {
        id: 'live_gh_stripe_123',
        verification: {
          sourceType: 'greenhouse',
          verified: true,
          rootDomain: 'stripe.com',
          endpointUrl: 'https://boards.greenhouse.io/stripe/jobs/123',
          lastCheckedTimestamp: Date.now(),
          sslStatus: 'VALID',
          noFeeGuarantee: true,
          requisitionId: '123',
        },
        possiblyClosed: true,
        consecutiveMissingFetches: 2,
      };

      const atsSignal = detectAtsClosureSignal(opp);
      expect(atsSignal.isClosure).toBe(true);
      expect(atsSignal.status).toBe('POSSIBLY_CLOSED');
      expect(atsSignal.evidence).toContain('consecutive API fetches');
    });

    it('detects closure when diffing against active ATS batch missing the job', () => {
      const opp: Partial<Opportunity> = {
        id: 'live_gh_stripe_123',
        companyDomain: 'stripe.com',
        verification: {
          sourceType: 'greenhouse',
          verified: true,
          rootDomain: 'stripe.com',
          endpointUrl: 'https://boards.greenhouse.io/stripe/jobs/123',
          lastCheckedTimestamp: Date.now(),
          sslStatus: 'VALID',
          noFeeGuarantee: true,
          requisitionId: '123',
        },
        consecutiveMissingFetches: 1, // 1 previous missing fetch
      };

      // Batch from same company with different job
      const currentBatch: Opportunity[] = [
        {
          id: 'live_gh_stripe_999',
          companyDomain: 'stripe.com',
          verification: {
            sourceType: 'greenhouse',
            verified: true,
            rootDomain: 'stripe.com',
            endpointUrl: 'https://boards.greenhouse.io/stripe/jobs/999',
            lastCheckedTimestamp: Date.now(),
            sslStatus: 'VALID',
            noFeeGuarantee: true,
            requisitionId: '999',
          },
        } as Opportunity,
      ];

      const atsSignal = detectAtsClosureSignal(opp, currentBatch);
      expect(atsSignal.isClosure).toBe(true);
      expect(atsSignal.possiblyClosed).toBe(true);
      expect(atsSignal.status).toBe('POSSIBLY_CLOSED');
    });
  });

  // ==========================================================================
  // 4. Fallback to Official Page Watcher AI Extraction with Grounding
  // ==========================================================================
  describe('4. Grounded AI Watcher Fallback & Strict Zero-Date Hallucination', () => {
    it('falls back to grounded watcher extraction only when no deterministic signals apply', async () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <body>
          <h1>Stanford TreeHacks 2026</h1>
          <p>Registration deadline: February 14, 2026</p>
          <p>Dates: February 20-22, 2026</p>
          <p>Mode: in-person on Stanford campus</p>
          <p>Entry is free for all university students.</p>
        </body>
        </html>
      `;

      const decision = await parseOfficialPageDeterministic({
        url: 'https://treehacks.com',
        html,
        organizer: 'TreeHacks',
        now: FIXED_NOW,
      });

      expect(decision.source).toBe('ai-grounded-fallback');
      expect(decision.status).toBe('OPEN_VERIFIED');
      expect(decision.datesText).toBeDefined();
      expect(decision.evidence).toContain('Grounded page extraction verified');
    });

    it('strictly drops any date not verbatim in the page and sets dateConfidence to UNKNOWN', async () => {
      const htmlWithoutDates = `
        <!DOCTYPE html>
        <html>
        <body>
          <h1>Upcoming Hackathon Series</h1>
          <p>We are excited to welcome builders for the next cycle.</p>
          <p>Schedule and dates will be officially announced soon.</p>
          <p>Stay tuned on our official portal!</p>
        </body>
        </html>
      `;

      const decision = await parseOfficialPageDeterministic({
        url: 'https://pennapps.com',
        html: htmlWithoutDates,
        organizer: 'PennApps',
        now: FIXED_NOW,
      });

      expect(decision.source).toBe('ai-grounded-fallback');
      // Must not fabricate any dates
      expect(decision.datesText).toBeNull();
      expect(decision.deadlineText).toBeNull();
      expect(decision.dateConfidence).toBe('UNKNOWN');
      expect(decision.evidence).toContain('zero hallucination');
    });

    it('does NOT invoke AI fallback when deterministic JSON-LD is available', async () => {
      const htmlWithJsonLd = `
        <html>
        <script type="application/ld+json">
        {
          "@type": "JobPosting",
          "title": "Systems Intern",
          "validThrough": "2026-12-01T00:00:00Z"
        }
        </script>
        <body>
          <p>Some body text with other unverified dates like January 1, 2030</p>
        </body>
        </html>
      `;

      const decision = await parseOfficialPageDeterministic({
        url: 'https://boards.greenhouse.io/anthropic/jobs/456',
        html: htmlWithJsonLd,
        now: FIXED_NOW,
      });

      expect(decision.source).toBe('json-ld');
      expect(decision.validThrough).toBe('2026-12-01T00:00:00Z');
      expect(decision.groundedData).toBeUndefined(); // AI fallback was bypassed
    });

    it('does NOT invoke AI fallback when HTTP 404 closure is present', async () => {
      const decision = await parseOfficialPageDeterministic({
        url: 'https://jobs.lever.co/stripe/old-job',
        responseStatus: 404,
        html: '<html><body>404 Not Found</body></html>',
        now: FIXED_NOW,
      });

      expect(decision.source).toBe('http-closure');
      expect(decision.status).toBe('REMOVED_BY_PORTAL');
      expect(decision.isClosed).toBe(true);
      expect(decision.groundedData).toBeUndefined();
    });
  });
});

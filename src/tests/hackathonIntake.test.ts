import { describe, it, expect, beforeEach } from 'vitest';
import { HackathonIntakeService, ALLOWED_HACKATHON_PLATFORMS } from '../services/hackathonIntakeService';
import { HackathonSubmission } from '../types';

// In-memory mock for localStorage in headless test runner
const memoryStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => memoryStorage[key] ?? null,
  setItem: (key: string, value: string) => {
    memoryStorage[key] = String(value);
  },
  removeItem: (key: string) => {
    delete memoryStorage[key];
  },
  clear: () => {
    for (const key of Object.keys(memoryStorage)) {
      delete memoryStorage[key];
    }
  },
};
(globalThis as any).localStorage = mockLocalStorage;

describe('Prompt 68: Hackathon Intake & Verification Engine', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    HackathonIntakeService.clearQueue();
  });

  describe('Allowlist URL validation', () => {
    it('accepts allowlisted hackathon platforms', () => {
      const allowedUrls = [
        'https://devpost.com/software/hackathon-2026',
        'https://ethglobal.com/events/cannes2026',
        'https://mlh.io/seasons/2026/events',
        'https://hackmit.org',
        'https://sih.gov.in',
        'https://chain.link/hackathon',
        'https://devfolio.co/hackathons',
        'https://unstop.com/hackathons/smart-innovator-2026',
      ];

      for (const url of allowedUrls) {
        const res = HackathonIntakeService.validateAllowlistUrl(url);
        expect(res.allowed, `Expected ${url} to be allowed`).toBe(true);
      }
    });

    it('accepts accredited university domains (.edu, .ac.in, .ac.uk)', () => {
      const universityUrls = [
        'https://hack.stanford.edu/2026',
        'https://hackathon.mit.edu',
        'https://techfest.iitb.ac.in/hackathon',
        'https://hack.cam.ac.uk',
      ];

      for (const url of universityUrls) {
        const res = HackathonIntakeService.validateAllowlistUrl(url);
        expect(res.allowed, `Expected ${url} to be allowed`).toBe(true);
      }
    });

    it('rejects forbidden URL shorteners and redirectors', () => {
      const shortenerUrls = [
        'https://bit.ly/hackathon-2026',
        'https://tinyurl.com/fast-hack',
        'https://t.co/hacklink',
      ];

      for (const url of shortenerUrls) {
        const res = HackathonIntakeService.validateAllowlistUrl(url);
        expect(res.allowed).toBe(false);
        expect(res.reason).toContain('URL shorteners are forbidden');
      }
    });

    it('rejects localhost, loopback, and private IP addresses', () => {
      const ssrfUrls = [
        'http://localhost:3000/hackathon',
        'http://127.0.0.1:8080/event',
        'http://169.254.169.254/latest/meta-data',
        'http://192.168.1.1/router',
        'http://10.0.0.1/admin',
      ];

      for (const url of ssrfUrls) {
        const res = HackathonIntakeService.validateAllowlistUrl(url);
        expect(res.allowed).toBe(false);
        expect(res.reason).toContain('Security violation');
      }
    });

    it('rejects non-allowlisted untrusted random domains', () => {
      const untrustedUrls = [
        'https://random-scam-crypto-giveaway.xyz/hackathon',
        'https://untrusted-phishing-portal.site/event',
      ];

      for (const url of untrustedUrls) {
        const res = HackathonIntakeService.validateAllowlistUrl(url);
        expect(res.allowed).toBe(false);
        expect(res.reason).toContain('not on the official hackathon allowlist');
      }
    });
  });

  describe('Reading dates from official page', () => {
    it('extracts Schema.org JSON-LD Event dates deterministically', () => {
      const sampleHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "ETHGlobal Cannes 2026",
            "startDate": "2026-11-14T09:00:00Z",
            "endDate": "2026-11-16T18:00:00Z",
            "eventStatus": "EventScheduled"
          }
          </script>
        </head>
        <body><h1>ETHGlobal Cannes</h1></body>
        </html>
      `;

      const dates = HackathonIntakeService.extractDatesFromPageContent(sampleHtml);
      expect(dates.hasDates).toBe(true);
      expect(dates.startDate).toBe('2026-11-14');
      expect(dates.endDate).toBe('2026-11-16');
      expect(dates.extractedFrom).toBe('json-ld');
    });

    it('extracts OpenGraph meta dates from HTML headers', () => {
      const sampleHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta property="og:start_time" content="2026-12-05T10:00:00Z" />
          <meta property="og:end_time" content="2026-12-07T18:00:00Z" />
        </head>
        <body>Hackathon</body>
        </html>
      `;

      const dates = HackathonIntakeService.extractDatesFromPageContent(sampleHtml);
      expect(dates.hasDates).toBe(true);
      expect(dates.startDate).toBe('2026-12-05');
      expect(dates.endDate).toBe('2026-12-07');
      expect(dates.extractedFrom).toBe('meta');
    });

    it('extracts literal date ranges from page text without inferring', () => {
      const sampleText = `
        Join us for HackMIT 2026!
        Hacking runs from October 24 - 26, 2026 on MIT campus.
      `;

      const dates = HackathonIntakeService.extractDatesFromPageContent(sampleText);
      expect(dates.hasDates).toBe(true);
      expect(dates.datesText).toContain('October 24 - 26, 2026');
    });

    it('returns hasDates: false when no dates appear on the page (zero inference)', () => {
      const noDateContent = `
        <html>
        <body>
          <h1>Upcoming Hackathon</h1>
          <p>Dates to be announced soon! Check back later.</p>
        </body>
        </html>
      `;

      const dates = HackathonIntakeService.extractDatesFromPageContent(noDateContent);
      expect(dates.hasDates).toBe(false);
      expect(dates.startDate).toBeUndefined();
    });
  });

  describe('Submission queue & verification lifecycle', () => {
    it('submits a hackathon to the queue in pending state', async () => {
      const submission = await HackathonIntakeService.submitHackathon({
        name: 'ETHGlobal Cannes 2026',
        officialUrl: 'https://ethglobal.com/events/cannes2026',
        organizer: 'ETHGlobal',
        mode: 'in-person',
        country: 'France',
      });

      expect(submission.id).toBeDefined();
      expect(submission.name).toBe('ETHGlobal Cannes 2026');
      expect(submission.officialUrl).toBe('https://ethglobal.com/events/cannes2026');

      const queue = HackathonIntakeService.getQueue();
      expect(queue.some(s => s.id === submission.id)).toBe(true);
    });

    it('verifies an allowlisted submission with verified dates and publishes it', async () => {
      const submission: HackathonSubmission = {
        id: 'sub_test_001',
        name: 'HackMIT 2026',
        officialUrl: 'https://hackmit.org',
        organizer: 'MIT TechX',
        submittedAt: Date.now(),
        status: 'pending',
      };

      const mockHtml = `
        <script type="application/ld+json">
        {
          "@type": "Event",
          "name": "HackMIT 2026",
          "startDate": "2026-10-24",
          "endDate": "2026-10-25"
        }
        </script>
      `;

      const processed = await HackathonIntakeService.processSubmissionVerification(submission, mockHtml);

      expect(processed.status).toBe('verified');
      expect(processed.verificationResult?.isAllowedUrl).toBe(true);
      expect(processed.verificationResult?.datesDetected?.startDate).toBe('2026-10-24');
      expect(processed.verifiedHackathon).toBeDefined();
      expect(processed.verifiedHackathon?.name).toBe('HackMIT 2026');
      expect(processed.verifiedHackathon?.source).toBe('community-submission');
    });

    it('rejects a submission if the URL is not on the allowlist', async () => {
      const submission: HackathonSubmission = {
        id: 'sub_test_002',
        name: 'Suspicious Hackathon',
        officialUrl: 'https://unverified-spamsite.xyz/event',
        organizer: 'Unknown Corp',
        submittedAt: Date.now(),
        status: 'pending',
      };

      const processed = await HackathonIntakeService.processSubmissionVerification(submission);

      expect(processed.status).toBe('rejected');
      expect(processed.verificationResult?.isAllowedUrl).toBe(false);
      expect(processed.verifiedHackathon).toBeUndefined();
    });

    it('rejects a submission if no dates are found on the official page', async () => {
      const submission: HackathonSubmission = {
        id: 'sub_test_003',
        name: 'ETHGlobal Mystery',
        officialUrl: 'https://ethglobal.com/events/mystery',
        organizer: 'ETHGlobal',
        submittedAt: Date.now(),
        status: 'pending',
      };

      const mockHtmlWithoutDates = `<html><body>Welcome to mystery hackathon</body></html>`;
      const processed = await HackathonIntakeService.processSubmissionVerification(submission, mockHtmlWithoutDates);

      expect(processed.status).toBe('rejected');
      expect(processed.verificationResult?.isAllowedUrl).toBe(true);
      expect(processed.verificationResult?.message).toContain('No verifiable start, end, or registration dates were found');
      expect(processed.verifiedHackathon).toBeUndefined();
    });
  });

  describe('Strict rule: only verified items are shown', () => {
    it('returns ONLY verified hackathons in getVerifiedSubmissions()', async () => {
      // 1. Submit verified item
      const subVerified: HackathonSubmission = {
        id: 'sub_verified_101',
        name: 'Hack The North 2026',
        officialUrl: 'https://hackthenorth.com',
        organizer: 'Tech North',
        submittedAt: Date.now(),
        status: 'pending',
      };
      await HackathonIntakeService.processSubmissionVerification(
        subVerified,
        `<script type="application/ld+json">{"@type":"Event","name":"HTN","startDate":"2026-09-18"}</script>`
      );

      // 2. Submit rejected item
      const subRejected: HackathonSubmission = {
        id: 'sub_rejected_102',
        name: 'Fake Hackathon',
        officialUrl: 'https://bit.ly/scam-hack',
        organizer: 'Scam Org',
        submittedAt: Date.now(),
        status: 'pending',
      };
      await HackathonIntakeService.processSubmissionVerification(subRejected);

      // 3. Inspect public directory
      const verifiedList = HackathonIntakeService.getVerifiedSubmissions();
      expect(verifiedList.length).toBe(1);
      expect(verifiedList[0].name).toBe('Hack The North 2026');
      expect(verifiedList.some(h => h.name === 'Fake Hackathon')).toBe(false);
    });
  });

  describe('Coverage line: "Tracking N sources, last run <time>"', () => {
    it('provides accurate coverage line metrics', () => {
      const coverage = HackathonIntakeService.getCoverageInfo();
      expect(coverage.trackingSourcesCount).toBeGreaterThanOrEqual(19);
      expect(coverage.lastRun).toBeDefined();
      expect(typeof coverage.lastRun).toBe('string');
      expect(coverage.lastRunEpoch).toBeGreaterThan(0);
    });

    it('formats time ago correctly', () => {
      const now = Date.now();
      expect(HackathonIntakeService.formatTimeAgo(now - 10000)).toBe('just now');
      expect(HackathonIntakeService.formatTimeAgo(now - 5 * 60 * 1000)).toBe('5m ago');
      expect(HackathonIntakeService.formatTimeAgo(now - 3 * 3600 * 1000)).toBe('3h ago');
      expect(HackathonIntakeService.formatTimeAgo(now - 2 * 86400 * 1000)).toBe('2d ago');
    });
  });
});

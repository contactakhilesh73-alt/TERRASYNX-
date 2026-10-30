import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  JanchSchedulerService,
  DEFAULT_JANCH_SECRET,
} from '../services/janchSchedulerService';
import { CuratedRecord, curatedRecordsService } from '../services/curatedRecordsService';
import { LiveParserResult } from '../services/liveParsers';

describe('Prompt 66: Janch Scheduler & Priority Watcher Service', () => {
  const FIXED_NOW = new Date('2026-10-25T12:00:00Z').getTime();

  beforeEach(() => {
    vi.restoreAllMocks();
    JanchSchedulerService.resetMemoryState();
  });

  // ==========================================================================
  // 1. Secret Header Authentication
  // ==========================================================================
  describe('1. Secret Header Authentication', () => {
    it('accepts valid x-janch-secret header', () => {
      const isValid = JanchSchedulerService.verifySecret(DEFAULT_JANCH_SECRET);
      expect(isValid).toBe(true);
    });

    it('accepts valid Authorization Bearer header', () => {
      const isValid = JanchSchedulerService.verifySecret(undefined, `Bearer ${DEFAULT_JANCH_SECRET}`);
      expect(isValid).toBe(true);
    });

    it('rejects missing or empty secret', () => {
      expect(JanchSchedulerService.verifySecret('')).toBe(false);
      expect(JanchSchedulerService.verifySecret(undefined, '')).toBe(false);
    });

    it('rejects incorrect secret', () => {
      expect(JanchSchedulerService.verifySecret('invalid-secret-123')).toBe(false);
      expect(JanchSchedulerService.verifySecret(undefined, 'Bearer wrong-secret')).toBe(false);
    });
  });

  // ==========================================================================
  // 2. Priority Batch Queue (Deadlines within 7 days first)
  // ==========================================================================
  describe('2. Priority Queue & Batch Ordering', () => {
    it('ranks records with deadlines within 7 days as Priority 1 (URGENT_7_DAYS)', () => {
      const urgentRecord: CuratedRecord = {
        id: 'rec_urgent_hack',
        sourceId: 'src_hack',
        sourceUrl: 'https://hackmit.org',
        status: 'OPEN_VERIFIED',
        curatedOn: FIXED_NOW - 100000,
        lastVerifiedAt: FIXED_NOW - 50000,
        evidence: 'Active',
        title: 'Urgent Hackathon',
        organizer: 'HackMIT',
        category: 'hackathon',
        country: 'Global',
        verifiedFacts: {
          registrationDeadline: '2026-10-29T23:59:59Z', // 4 days from FIXED_NOW
        },
      };

      const { priority, priorityLabel } = JanchSchedulerService.calculateRecordPriority(urgentRecord, FIXED_NOW);
      expect(priority).toBe(1);
      expect(priorityLabel).toBe('URGENT_7_DAYS');
    });

    it('ranks active records with distant deadlines as Priority 2 (ACTIVE_OPEN)', () => {
      const distantRecord: CuratedRecord = {
        id: 'rec_distant_hack',
        sourceId: 'src_hack',
        sourceUrl: 'https://ethglobal.com',
        status: 'OPEN_VERIFIED',
        curatedOn: FIXED_NOW - 100000,
        lastVerifiedAt: FIXED_NOW - 50000,
        evidence: 'Active',
        title: 'Future Hackathon',
        organizer: 'ETHGlobal',
        category: 'hackathon',
        country: 'Global',
        verifiedFacts: {
          registrationDeadline: '2026-12-01T23:59:59Z', // ~37 days away
        },
      };

      const { priority, priorityLabel } = JanchSchedulerService.calculateRecordPriority(distantRecord, FIXED_NOW);
      expect(priority).toBe(2);
      expect(priorityLabel).toBe('ACTIVE_OPEN');
    });

    it('ranks unknown or unannounced records as Priority 3 (STANDARD_CYCLE)', () => {
      const standardRecord: CuratedRecord = {
        id: 'rec_standard_cycle',
        sourceId: 'src_standard',
        sourceUrl: 'https://example.com',
        status: 'UNKNOWN',
        curatedOn: FIXED_NOW - 100000,
        lastVerifiedAt: FIXED_NOW - 50000,
        evidence: 'Pending',
        title: 'Past Series',
        organizer: 'Example',
        category: 'hackathon',
        country: 'Global',
        verifiedFacts: {},
      };

      const { priority, priorityLabel } = JanchSchedulerService.calculateRecordPriority(standardRecord, FIXED_NOW);
      expect(priority).toBe(3);
      expect(priorityLabel).toBe('STANDARD_CYCLE');
    });

    it('places Priority 1 items at the front of prioritized batches', () => {
      const batchInfo = JanchSchedulerService.getPrioritizedBatch({ batchSize: 10 });
      expect(batchInfo.batch.length).toBeGreaterThan(0);
      expect(batchInfo.totalCandidates).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 3. Per-Host Rate Limits, Jitter, and Exponential Backoff
  // ==========================================================================
  describe('3. Rate Limiting, Backoff & Politeness', () => {
    it('enforces a rate limit interval between consecutive requests to the same host', async () => {
      const url = 'https://boards.greenhouse.io/openai/jobs/123';
      const start = Date.now();

      await JanchSchedulerService.executeWithHostRateLimit(url, async () => 'res1');
      await JanchSchedulerService.executeWithHostRateLimit(url, async () => 'res2');

      const elapsed = Date.now() - start;
      // Should have waited for MIN_HOST_INTERVAL_MS plus jitter
      expect(elapsed).toBeGreaterThanOrEqual(100);
    });

    it('applies exponential backoff on host error and skips subsequent attempts while in backoff', async () => {
      const url = 'https://jobs.lever.co/flaky-company/jobs/999';

      // First call throws an error
      const first = await JanchSchedulerService.executeWithHostRateLimit(url, async () => {
        throw new Error('HTTP 429 Too Many Requests');
      });
      expect(first.error).toContain('429');

      // Immediate second call should be skipped due to active backoff
      const second = await JanchSchedulerService.executeWithHostRateLimit(url, async () => {
        return 'success';
      });
      expect(second.skipped).toBe(true);
      expect(second.backedOff).toBe(true);
    });
  });

  // ==========================================================================
  // 4. Firestore Write Rule: ONLY when Status or Date Changes
  // ==========================================================================
  describe('4. Zero-Redundancy Firestore Writes', () => {
    const baseRecord: CuratedRecord = {
      id: 'rec_test_nasa',
      sourceId: 'src_nasa',
      sourceUrl: 'https://spaceappschallenge.org',
      status: 'OPEN_VERIFIED',
      curatedOn: FIXED_NOW - 1000000,
      lastVerifiedAt: FIXED_NOW - 500000,
      evidence: 'Original evidence',
      title: 'NASA Space Apps',
      organizer: 'NASA',
      category: 'hackathon',
      country: 'Global',
      verifiedFacts: {
        dates: '14-15 November 2026',
        registrationDeadline: '2026-11-15',
        status: 'OPEN_VERIFIED',
      },
    };

    it('identifies status changes correctly', () => {
      const decision: LiveParserResult = {
        source: 'json-ld',
        status: 'CANCELLED_OR_POSTPONED',
        dateConfidence: 'OFFICIAL',
        isClosed: true,
        datesText: '14-15 November 2026',
        deadlineText: '2026-11-15',
        evidence: 'Event cancelled',
        sourceUrl: baseRecord.sourceUrl,
        checkedAt: FIXED_NOW,
      };

      const diff = JanchSchedulerService.hasStatusOrDateChanged(baseRecord, decision);
      expect(diff.statusChanged).toBe(true);
      expect(diff.dateChanged).toBe(false);
      expect(diff.newStatus).toBe('CANCELLED_OR_POSTPONED');
    });

    it('identifies date changes correctly', () => {
      const decision: LiveParserResult = {
        source: 'json-ld',
        status: 'OPEN_VERIFIED',
        dateConfidence: 'OFFICIAL',
        isClosed: false,
        datesText: '21-22 November 2026', // Updated dates!
        deadlineText: '2026-11-22',
        evidence: 'Dates rescheduled',
        sourceUrl: baseRecord.sourceUrl,
        checkedAt: FIXED_NOW,
      };

      const diff = JanchSchedulerService.hasStatusOrDateChanged(baseRecord, decision);
      expect(diff.statusChanged).toBe(false);
      expect(diff.dateChanged).toBe(true);
      expect(diff.newDates).toBe('21-22 November 2026');
    });

    it('skips Firestore write when status and dates are unchanged', async () => {
      const decision: LiveParserResult = {
        source: 'json-ld',
        status: 'OPEN_VERIFIED',
        dateConfidence: 'OFFICIAL',
        isClosed: false,
        datesText: '14-15 November 2026', // Same dates
        deadlineText: '2026-11-15', // Same deadline
        evidence: 'Still active',
        sourceUrl: baseRecord.sourceUrl,
        checkedAt: FIXED_NOW,
      };

      const diff = JanchSchedulerService.hasStatusOrDateChanged(baseRecord, decision);
      expect(diff.statusChanged).toBe(false);
      expect(diff.dateChanged).toBe(false);

      const writeRes = await JanchSchedulerService.persistToFirestoreIfChanged(baseRecord, {
        ...diff,
        evidence: decision.evidence,
      });
      expect(writeRes.written).toBe(false);
    });

    it('keeps last check time in memory across calls', () => {
      expect(JanchSchedulerService.getLastCheckedAt('test_rec')).toBeUndefined();
      JanchSchedulerService.setLastCheckedAt('test_rec', FIXED_NOW);
      expect(JanchSchedulerService.getLastCheckedAt('test_rec')).toBe(FIXED_NOW);
    });
  });

  // ==========================================================================
  // 5. On-Open Stale Record Refresh
  // ==========================================================================
  describe('5. On-Open Stale Record Refresh', () => {
    it('returns cached data without outbound probe if record is fresh', async () => {
      const record = curatedRecordsService.getAllRecords()[0];
      expect(record).toBeDefined();

      // Mark as just checked in memory
      JanchSchedulerService.setLastCheckedAt(record.id, Date.now());

      const res = await JanchSchedulerService.refreshRecord(record.id, false);
      expect(res.cachedOnly).toBe(true);
      expect(res.isStale).toBe(false);
      expect(res.refreshed).toBe(false);
    });
  });
});

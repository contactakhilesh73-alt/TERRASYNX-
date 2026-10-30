/**
 * Test Suite for Prompt 62: Time bar, Server-synced UTC time, Clock Drift Warning, and Dual-Timezone Deadlines
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  fetchServerTime, 
  getSyncedDate, 
  formatOfficialTime, 
  formatLocalTime, 
  formatDualDeadline, 
  formatDriftDescription,
  MAX_ALLOWED_DRIFT_MS,
  OFFICIAL_TIMEZONE,
  OFFICIAL_TIMEZONE_LABEL
} from '../utils/timeService';

describe('Prompt 62: Time Sync & Dual-Timezone Deadline System', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Server Time Fetch & Drift Calculation', () => {
    it('fetches server UTC time from /api/time and computes latency and offset', async () => {
      const mockServerTime = {
        utcTime: '2026-10-24T21:00:00.000Z',
        epochMs: 1792875600000,
        serverTimezone: 'UTC',
        officialTimezone: 'Asia/Kolkata',
        officialTimezoneLabel: 'IST (UTC+05:30)',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockServerTime,
      } as Response);

      const syncResult = await fetchServerTime();
      expect(syncResult.isSynced).toBe(true);
      expect(syncResult.serverUtcIso).toBe('2026-10-24T21:00:00.000Z');
      expect(typeof syncResult.offsetMs).toBe('number');
      expect(typeof syncResult.latencyMs).toBe('number');
    });

    it('identifies clock drift exceeding 2 minutes (> 120,000ms) as significant', () => {
      expect(MAX_ALLOWED_DRIFT_MS).toBe(120000);

      // 3 minutes ahead (180,000 ms)
      const driftAheadDesc = formatDriftDescription(-180000);
      expect(driftAheadDesc).toContain('3m 0s ahead of server time');

      // 2 minutes 30 seconds behind (150,000 ms)
      const driftBehindDesc = formatDriftDescription(150000);
      expect(driftBehindDesc).toContain('2m 30s behind server time');
    });

    it('identifies normal clock drift within 2 minutes as acceptable', () => {
      const offsetMs = 1500; // 1.5 seconds drift
      const isSignificant = Math.abs(offsetMs) > MAX_ALLOWED_DRIFT_MS;
      expect(isSignificant).toBe(false);
      expect(formatDriftDescription(offsetMs)).toBe('1s behind server time');
    });
  });

  describe('Official Time & Dual Deadlines', () => {
    it('formats dates in the official platform timezone (IST / Asia/Kolkata)', () => {
      // 2026-10-24T12:00:00.000Z in UTC is 17:30:00 in IST (+05:30)
      const testDate = new Date('2026-10-24T12:00:00.000Z');
      const formatted = formatOfficialTime(testDate);
      expect(formatted).toContain(OFFICIAL_TIMEZONE_LABEL);
      expect(formatted).toContain('17:30');
      expect(formatted).toContain('2026');
    });

    it('formats local time representation cleanly', () => {
      const testDate = new Date('2026-10-24T12:00:00.000Z');
      const formatted = formatLocalTime(testDate);
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(5);
    });

    it('computes dual deadlines showing both official and local times with urgency flagging', () => {
      const now = new Date('2026-10-24T10:00:00.000Z').getTime();
      const deadlineIn24h = now + (24 * 60 * 60 * 1000);

      const dual = formatDualDeadline(deadlineIn24h, now);
      expect(dual.isPassed).toBe(false);
      expect(dual.isUrgent).toBe(true); // < 72 hours
      expect(dual.officialText).toContain(OFFICIAL_TIMEZONE_LABEL);
      expect(dual.localText).toBeDefined();
      expect(dual.timeLeftStr).toContain('24h');
    });

    it('marks passed deadlines accurately', () => {
      const now = new Date('2026-10-24T10:00:00.000Z').getTime();
      const passedDeadline = now - (3600 * 1000); // 1 hour ago

      const dual = formatDualDeadline(passedDeadline, now);
      expect(dual.isPassed).toBe(true);
      expect(dual.timeLeftStr).toBe('Closed');
    });
  });
});

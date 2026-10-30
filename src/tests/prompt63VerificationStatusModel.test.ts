/**
 * Test Suite for Prompt 63: Status Model & Verification Lifecycle Engine
 */

import { describe, it, expect } from 'vitest';
import { 
  resolveVerificationStatus, 
  getFreshnessWindowMs, 
  formatTimeAgo, 
  isClosedStatus, 
  isWithinGracePeriod, 
  getGracePeriodRemainingMs, 
  formatGracePeriodRemaining, 
  getStatusBadgeConfig,
  CLOSED_GRACE_PERIOD_MS,
  DEFAULT_FRESHNESS_WINDOW_MS
} from '../services/verificationStatusService';
import { Opportunity } from '../types';

const createMockOpportunity = (overrides: Partial<Opportunity> = {}): Opportunity => ({
  id: 'opp_test_123',
  companyName: 'OpenAI',
  companyLogo: 'https://logo.clearbit.com/openai.com',
  companyDomain: 'openai.com',
  title: 'Research Engineer Intern - Systems',
  type: 'internship',
  workMode: 'hybrid',
  location: 'San Francisco, CA',
  department: 'Systems Research',
  officialApplyUrl: 'https://boards.greenhouse.io/openai/jobs/12345',
  releasedAt: Date.now() - (2 * 3600 * 1000), // 2 hours ago
  deadlineAt: Date.now() + (10 * 24 * 3600 * 1000), // 10 days in future
  verification: {
    verified: true,
    sourceType: 'greenhouse',
    rootDomain: 'openai.com',
    endpointUrl: 'https://api.greenhouse.io/v1/boards/openai/jobs/12345',
    lastCheckedTimestamp: Date.now() - (2 * 3600 * 1000), // 2 hours ago
    sslStatus: 'A+',
    noFeeGuarantee: true,
    requisitionId: 'REQ-12345',
  },
  eligibility: {
    allowedGraduationYears: [2026, 2027],
    degrees: ['B.Tech', 'BS', 'MS'],
    undergradOnly: false,
    sponsorshipAvailable: true,
    locationsAllowed: ['US'],
  },
  compensation: {
    isPaid: true,
    range: '$65 - $80 / hr',
    currency: 'USD',
    period: 'hourly',
    transparentBenchmark: 'Tier-1 AI Lab benchmark',
  },
  fitment: {
    overallScore: 92,
    overallGrade: 'A',
    matchedSkills: ['Python', 'Distributed Systems'],
    missingSkills: [],
    dimensions: {} as any,
    strategicVerdict: 'High-conviction Tier-1 match',
  },
  assessmentIntel: {} as any,
  stage: 'discovered',
  ...overrides,
});

describe('Prompt 63: Verification Status Model & Lifecycle Engine', () => {
  describe('Source Freshness Windows', () => {
    it('returns 6 hours for Greenhouse and Lever endpoints', () => {
      expect(getFreshnessWindowMs('greenhouse')).toBe(6 * 3600 * 1000);
      expect(getFreshnessWindowMs('lever')).toBe(6 * 3600 * 1000);
    });

    it('returns 24 hours for government portals and aggregators', () => {
      expect(getFreshnessWindowMs('singapore_gov')).toBe(24 * 3600 * 1000);
      expect(getFreshnessWindowMs('hacker_news')).toBe(24 * 3600 * 1000);
      expect(getFreshnessWindowMs('builtin')).toBe(24 * 3600 * 1000);
    });

    it('falls back to default 12 hours for unknown or standard corporate portals', () => {
      expect(getFreshnessWindowMs('direct_careers_domain')).toBe(12 * 3600 * 1000);
      expect(getFreshnessWindowMs('unknown_portal')).toBe(DEFAULT_FRESHNESS_WINDOW_MS);
    });
  });

  describe('Freshness-Dependent Status Resolution', () => {
    it('resolves OPEN_VERIFIED if lastVerifiedAt is within source freshness window', () => {
      const now = Date.now();
      // Greenhouse has 6h freshness window. Last verified 2h ago.
      const opp = createMockOpportunity({
        verification: {
          verified: true,
          sourceType: 'greenhouse',
          rootDomain: 'openai.com',
          endpointUrl: 'https://api.greenhouse.io/v1/boards/openai/jobs/12345',
          lastCheckedTimestamp: now - (2 * 3600 * 1000), // 2h ago (fresh)
          sslStatus: 'A+',
          noFeeGuarantee: true,
          requisitionId: 'REQ-12345',
        },
      });

      const model = resolveVerificationStatus(opp, now);
      expect(model.status).toBe('OPEN_VERIFIED');
      expect(model.evidence).toContain('GREENHOUSE');
      expect(model.sourceUrl).toBe('https://api.greenhouse.io/v1/boards/openai/jobs/12345');
    });

    it('resolves OPEN_NOT_RECENTLY_VERIFIED if lastVerifiedAt exceeds source freshness window', () => {
      const now = Date.now();
      // Greenhouse has 6h freshness window. Last verified 10h ago.
      const opp = createMockOpportunity({
        verification: {
          verified: true,
          sourceType: 'greenhouse',
          rootDomain: 'openai.com',
          endpointUrl: 'https://api.greenhouse.io/v1/boards/openai/jobs/12345',
          lastCheckedTimestamp: now - (10 * 3600 * 1000), // 10h ago (stale)
          sslStatus: 'A+',
          noFeeGuarantee: true,
          requisitionId: 'REQ-12345',
        },
      });

      const model = resolveVerificationStatus(opp, now);
      expect(model.status).toBe('OPEN_NOT_RECENTLY_VERIFIED');
      expect(model.evidence).toContain('Awaiting next scheduled crawler pulse');
    });

    it('resolves CLOSING_SOON if remaining application window is < 24 hours', () => {
      const now = Date.now();
      const opp = createMockOpportunity({
        deadlineAt: now + (18 * 3600 * 1000), // 18 hours remaining (< 24h)
      });

      const model = resolveVerificationStatus(opp, now);
      expect(model.status).toBe('CLOSING_SOON');
      expect(model.evidence).toContain('final 24-hour application window');
    });

    it('resolves POSSIBLY_CLOSED if opportunity has consecutive missing API pulses', () => {
      const now = Date.now();
      const opp = createMockOpportunity({
        possiblyClosed: true,
        consecutiveMissingFetches: 2,
      });

      const model = resolveVerificationStatus(opp, now);
      expect(model.status).toBe('POSSIBLY_CLOSED');
      expect(model.evidence).toContain('recent crawler pulses');
    });

    it('resolves CLOSED_EARLY_BY_PORTAL if 3 or more consecutive fetches missed', () => {
      const now = Date.now();
      const opp = createMockOpportunity({
        consecutiveMissingFetches: 3,
      });

      const model = resolveVerificationStatus(opp, now);
      expect(model.status).toBe('CLOSED_EARLY_BY_PORTAL');
      expect(isClosedStatus(model.status)).toBe(true);
    });

    it('resolves DEADLINE_PASSED once the deadline has elapsed', () => {
      const now = Date.now();
      const opp = createMockOpportunity({
        deadlineAt: now - (2 * 3600 * 1000), // 2 hours ago
      });

      const model = resolveVerificationStatus(opp, now);
      expect(model.status).toBe('DEADLINE_PASSED');
      expect(isClosedStatus(model.status)).toBe(true);
    });
  });

  describe('Relative Time-Ago Formatter', () => {
    it('formats time ago with high precision', () => {
      const now = 1000000000;
      expect(formatTimeAgo(now - 10000, now)).toBe('just now');
      expect(formatTimeAgo(now - 15 * 60 * 1000, now)).toBe('15m ago');
      expect(formatTimeAgo(now - 3 * 3600 * 1000, now)).toBe('3h ago');
      expect(formatTimeAgo(now - 48 * 3600 * 1000, now)).toBe('2d ago');
    });
  });

  describe('Closed Grace Period & Archiving Rules', () => {
    it('allows closed items to stay visible during the 6-hour grace period', () => {
      const now = Date.now();
      const opp = createMockOpportunity({
        deadlineAt: now - (2 * 3600 * 1000), // Closed 2h ago
        closedAt: now - (2 * 3600 * 1000),
      });

      expect(isWithinGracePeriod(opp, now)).toBe(true);
      const remainingMs = getGracePeriodRemainingMs(opp, now);
      expect(remainingMs).toBeGreaterThan(0);
      expect(formatGracePeriodRemaining(remainingMs)).toContain('4h');
    });

    it('marks item as archived when grace period expires (> 6 hours)', () => {
      const now = Date.now();
      const opp = createMockOpportunity({
        deadlineAt: now - (8 * 3600 * 1000), // Closed 8h ago (exceeds 6h)
        closedAt: now - (8 * 3600 * 1000),
      });

      expect(isWithinGracePeriod(opp, now)).toBe(false);
      const model = resolveVerificationStatus(opp, now);
      expect(model.isArchived).toBe(true);
    });
  });

  describe('Badge UI Configurations', () => {
    it('returns distinct styling and labels for all 9 verification statuses', () => {
      const statuses = [
        'OPEN_VERIFIED',
        'OPEN_NOT_RECENTLY_VERIFIED',
        'CLOSING_SOON',
        'POSSIBLY_CLOSED',
        'CLOSED_EARLY_BY_PORTAL',
        'DEADLINE_PASSED',
        'REMOVED_BY_PORTAL',
        'CANCELLED_OR_POSTPONED',
        'UNKNOWN'
      ] as const;

      for (const st of statuses) {
        const config = getStatusBadgeConfig(st);
        expect(config.label).toBeDefined();
        expect(config.badgeClass).toBeDefined();
        expect(config.description).toBeDefined();
      }
    });
  });
});

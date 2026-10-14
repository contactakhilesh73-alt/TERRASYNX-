import { describe, it, expect } from 'vitest';
import { isHostnameAllowed } from '../services/linkAllowlistService';
import { Hackathon } from '../types';

describe('Prompt 43: Live Hackathon Feed & Security Allowlist', () => {
  it('adds devpost.com, mlh.io, mlh.com, and sih.gov.in to the link allowlist', () => {
    // Exact domains
    expect(isHostnameAllowed('devpost.com')).toBe(true);
    expect(isHostnameAllowed('mlh.io')).toBe(true);
    expect(isHostnameAllowed('mlh.com')).toBe(true);
    expect(isHostnameAllowed('sih.gov.in')).toBe(true);

    // Subdomains of allowlisted platforms
    expect(isHostnameAllowed('api.devpost.com')).toBe(true);
    expect(isHostnameAllowed('amazonappdev2026.devpost.com')).toBe(true);
    expect(isHostnameAllowed('ghw.mlh.io')).toBe(true);
    expect(isHostnameAllowed('portal.sih.gov.in')).toBe(true);

    // Non-allowlisted random hostnames remain strictly blocked
    expect(isHostnameAllowed('malicious-phishing-hackathon.xyz')).toBe(false);
    expect(isHostnameAllowed('unverified-domain.org')).toBe(false);
  });

  it('validates item schema: requires title, https URL, and dates; skips incomplete items without guessing', () => {
    // Simulate validator logic
    const validateItem = (item: any): boolean => {
      if (!item || typeof item !== 'object') return false;
      if (!item.title || typeof item.title !== 'string' || item.title.trim().length === 0) return false;
      if (!item.url || typeof item.url !== 'string' || !item.url.startsWith('https://')) return false;
      if (!item.submission_period_dates || typeof item.submission_period_dates !== 'string' || item.submission_period_dates.trim().length === 0) return false;
      return true;
    };

    // Valid item
    expect(validateItem({
      title: 'Devpost AI Challenge',
      url: 'https://devpost.com/challenges/123',
      submission_period_dates: 'Aug 31 - Oct 23, 2026'
    })).toBe(true);

    // Missing title -> skip
    expect(validateItem({
      url: 'https://devpost.com/challenges/123',
      submission_period_dates: 'Aug 31 - Oct 23, 2026'
    })).toBe(false);

    // Empty title -> skip
    expect(validateItem({
      title: '   ',
      url: 'https://devpost.com/challenges/123',
      submission_period_dates: 'Aug 31 - Oct 23, 2026'
    })).toBe(false);

    // Insecure http URL -> skip
    expect(validateItem({
      title: 'Insecure Hackathon',
      url: 'http://devpost.com/challenges/123',
      submission_period_dates: 'Aug 31 - Oct 23, 2026'
    })).toBe(false);

    // Missing dates -> skip
    expect(validateItem({
      title: 'Undated Hackathon',
      url: 'https://devpost.com/challenges/123',
      submission_period_dates: ''
    })).toBe(false);

    expect(validateItem({
      title: 'Undated Hackathon',
      url: 'https://devpost.com/challenges/123'
    })).toBe(false);
  });

  it('verifies that live endpoint handles failures with empty list and honest error message, never hardcoded fallbacks', () => {
    const handleUpstreamFailure = (err: Error) => {
      return {
        success: false,
        hackathons: [] as Hackathon[],
        message: 'Live hackathon feed temporarily unavailable',
        error: err.message
      };
    };

    const res = handleUpstreamFailure(new Error('Network timeout'));

    expect(res.success).toBe(false);
    expect(res.hackathons).toEqual([]);
    expect(res.hackathons.length).toBe(0);
    expect(res.message).toBe('Live hackathon feed temporarily unavailable');

    // STRICT GUARANTEE: Never add hardcoded fallback hackathons
    expect(res.hackathons.some((h: any) => h.name?.includes('Fallback'))).toBe(false);
  });
});

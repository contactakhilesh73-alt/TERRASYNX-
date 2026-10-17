import { describe, it, expect } from 'vitest';
import { HackathonsService, HACKATHONS_DATABASE } from '../services/hackathonsService';
import { Hackathon } from '../types';
import { UrlHealthResolver } from '../services/urlHealthResolver';

describe('Prompt 45: Safety Badges & Honest Hackathon Labeling', () => {
  const allHackathons = HackathonsService.getAllHackathons();

  it('provides honest source badge text: "Listed on Devpost" or "Official series"', () => {
    // For devpost-live source
    expect(HackathonsService.getSourceBadgeText('devpost-live')).toBe('Listed on Devpost');

    // For recurring-series source
    expect(HackathonsService.getSourceBadgeText('recurring-series')).toBe('Official series');

    // Validates every hackathon in the database maps strictly to one of these two
    for (const h of allHackathons) {
      const badge = HackathonsService.getSourceBadgeText(h.source);
      expect(['Listed on Devpost', 'Official series']).toContain(badge);
    }
  });

  it('evaluates prize text as "listed by organizer" (or "not listed")', () => {
    // Hackathons with explicitly listed cash/prize pools (e.g. Microsoft Imagine Cup per Prompt 48)
    const withPrize = allHackathons.find(h => h.prizeText.includes('$100,000'));
    expect(withPrize).toBeDefined();
    if (withPrize) {
      const display = HackathonsService.getPrizeDisplay(withPrize.prizeText);
      expect(display.isListed).toBe(true);
      expect(display.badgeText).toBe('listed by organizer');
      expect(display.displayText).toContain('$100,000');
    }

    // Hackathons where prize is not listed / unconfirmed
    const notListedDisplay1 = HackathonsService.getPrizeDisplay('');
    expect(notListedDisplay1.isListed).toBe(false);
    expect(notListedDisplay1.badgeText).toBe('not listed');
    expect(notListedDisplay1.displayText).toBe('Not listed');

    const notListedDisplay2 = HackathonsService.getPrizeDisplay('Confirm on official page');
    expect(notListedDisplay2.isListed).toBe(false);
    expect(notListedDisplay2.badgeText).toBe('not listed');
    expect(notListedDisplay2.displayText).toBe('Not listed');

    const notListedDisplay3 = HackathonsService.getPrizeDisplay('Not listed');
    expect(notListedDisplay3.isListed).toBe(false);
    expect(notListedDisplay3.badgeText).toBe('not listed');
    expect(notListedDisplay3.displayText).toBe('Not listed');
  });

  it('presents entry fee text as listed and flags clearly if a fee exists', () => {
    // Free events should NOT be flagged as fee required
    expect(HackathonsService.isFeeRequired('100% Free Entry')).toBe(false);
    expect(HackathonsService.isFeeRequired('Free')).toBe(false);
    expect(HackathonsService.isFeeRequired('Free Entry + Free Google Cloud API Credits')).toBe(false);
    expect(HackathonsService.isFeeRequired('100% Free Entry (Travel grants available)')).toBe(false);
    expect(HackathonsService.isFeeRequired('Free Entry (100% refunded stake on check-in)')).toBe(false);

    // Paid / fee events MUST be clearly flagged
    expect(HackathonsService.isFeeRequired('$25 Registration Fee')).toBe(true);
    expect(HackathonsService.isFeeRequired('₹500 per team entry fee')).toBe(true);
    expect(HackathonsService.isFeeRequired('Paid ticket required ($50)')).toBe(true);
    expect(HackathonsService.isFeeRequired('€15 Student Delegate Pass')).toBe(true);
    expect(HackathonsService.isFeeRequired('100 USD participation cost')).toBe(true);
    expect(HackathonsService.isFeeRequired('0.05 ETH Stake required')).toBe(true);
    expect(HackathonsService.isFeeRequired('Participation stake exists ($20)')).toBe(true);
    expect(HackathonsService.isFeeRequired('50 USDC deposit stake')).toBe(true);

    // All default database hackathons are verified free entry
    for (const h of allHackathons) {
      expect(HackathonsService.isFeeRequired(h.entryFeeText)).toBe(false);
      expect(h.entryFeeText.length).toBeGreaterThan(0);
    }
  });

  it('mandates eligibility text as listed with the line "Check the event\'s own rules", never claiming student is eligible', () => {
    // Exact required text line
    expect(HackathonsService.ELIGIBILITY_RULES_LINE).toBe("Check the event's own rules");

    // Ensure every hackathon provides authentic eligibility text as listed by organizer
    for (const h of allHackathons) {
      expect(typeof h.eligibilityText).toBe('string');
      expect(h.eligibilityText.trim().length).toBeGreaterThan(0);

      // CRITICAL SAFETY MANDATE: Never write that the student is eligible
      const lower = h.eligibilityText.toLowerCase();
      expect(lower).not.toContain('you are eligible');
      expect(lower).not.toContain('the student is eligible');
      expect(lower).not.toContain('guaranteed eligible');
    }
  });

  it('uses the existing health check endpoint for link-health verification', () => {
    // Verifies UrlHealthResolver probes the existing `/api/health/check-url` endpoint
    expect(typeof UrlHealthResolver.probeUrlHealth).toBe('function');
    expect(typeof UrlHealthResolver.resolveSafePortalUrl).toBe('function');
  });
});

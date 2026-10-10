import { describe, it, expect } from 'vitest';
import { UpcomingInternshipsService } from '../services/upcomingInternshipsService';

describe('Prompt 40: ETH Zurich Student Summer Research Fellowship (SSRF)', () => {
  const allCycles = UpcomingInternshipsService.getAllUpcomingCycles();

  it('contains ETH Zurich Student Summer Research Fellowship with all Prompt 40 specifications', () => {
    const ethSsrf = allCycles.find(c => c.id === 'cycle_eth_zurich_ssrf');
    expect(ethSsrf, 'ETH Zurich SSRF cycle should exist').toBeDefined();

    // Company & Program
    expect(ethSsrf!.companyName).toBe('ETH Zurich');
    expect(ethSsrf!.programTitle).toContain('ETH Zurich Student Summer Research Fellowship');
    expect(ethSsrf!.programTitle).toContain('Computer Science');

    // Country
    expect(ethSsrf!.country).toBe('Switzerland');

    // Duration (2 months: July-August)
    expect(ethSsrf!.coverageBreakdown?.toLowerCase()).toContain('2 months');
    expect(ethSsrf!.coverageBreakdown?.toLowerCase()).toContain('july-august');
    expect(ethSsrf!.annualRecurrencePattern?.toLowerCase()).toContain('2-month');
    expect(ethSsrf!.annualRecurrencePattern?.toLowerCase()).toContain('july and august');

    // Stipend (CHF 4,000 total stipend)
    expect(ethSsrf!.historicalCompensation).toContain('CHF 4,000');
    expect(ethSsrf!.historicalCompensation?.toLowerCase()).toContain('total stipend');
    expect(ethSsrf!.fundingAmountText).toContain('CHF 4,000');

    // Travel and visa reimbursed
    expect(ethSsrf!.historicalCompensation?.toLowerCase()).toContain('travel & visa reimbursed');
    expect(ethSsrf!.coverageBreakdown?.toLowerCase()).toContain('travel and visa');

    // Housing assistance (not free housing)
    expect(ethSsrf!.historicalCompensation?.toLowerCase()).toContain('housing assistance');
    expect(ethSsrf!.coverageBreakdown?.toLowerCase()).toContain('housing assistance');
    expect(ethSsrf!.coverageBreakdown?.toLowerCase()).toContain('not free housing');
    expect(ethSsrf!.disclaimerNotice?.toLowerCase()).toContain('housing assistance');
    expect(ethSsrf!.disclaimerNotice?.toLowerCase()).toContain('not free housing');

    // Requires at least 2 years of study completed
    expect(ethSsrf!.eligibility?.toLowerCase()).toContain('at least 2 years of study completed');
    expect(ethSsrf!.eligibilityCriteria?.toLowerCase()).toContain('at least two years of university study');

    // Applications typically close mid-December
    expect(ethSsrf!.exactWindowText?.toLowerCase()).toContain('mid-december');
    expect(ethSsrf!.expectedWindowDuration?.toLowerCase()).toContain('mid-december');
    expect(ethSsrf!.disclaimerNotice?.toLowerCase()).toContain('mid-december');

    // Official ETH link only
    expect(ethSsrf!.companyDomain).toBe('inf.ethz.ch');
    expect(ethSsrf!.officialCareersUrl).toMatch(/^https:\/\/(www\.)?([a-z0-9-]+\.)?ethz\.ch/);

    // Belonging to Research Portal
    expect(UpcomingInternshipsService.isCycleInPortal(ethSsrf!, 'research')).toBe(true);
  });
});

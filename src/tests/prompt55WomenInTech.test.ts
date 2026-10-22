import { describe, it, expect } from 'vitest';
import { UpcomingInternshipsService } from '../services/upcomingInternshipsService';
import { isHostnameAllowed } from '../services/linkAllowlistService';

describe('Prompt 55: Women in Tech Scholarships', () => {
  const allCycles = UpcomingInternshipsService.getAllUpcomingCycles(new Date(2026, 9, 20)); // Oct 20, 2026

  it('1. Generation Google Scholarship APAC meets all requirements', () => {
    const googleApac = allCycles.find(c => c.id === 'cycle_generation_google_scholarship_apac');
    expect(googleApac).toBeDefined();
    if (!googleApac) return;

    // Title & Company
    expect(googleApac.programTitle).toBe('Generation Google Scholarship APAC');
    expect(googleApac.companyName).toBe('Google');

    // rateType: MARKET_ESTIMATED
    expect(googleApac.rateType).toBe('MARKET_ESTIMATED');

    // Replaces old Women Techmakers name
    const combinedText = [
      googleApac.eligibilityCriteria,
      googleApac.actionTip,
      googleApac.disclaimerNotice,
      googleApac.annualRecurrencePattern,
      googleApac.coverageBreakdown
    ].join(' ').toLowerCase();
    expect(combinedText).toContain('women techmakers');
    expect(combinedText).toContain('replaces the old women techmakers name');

    // One-time award reported at USD 2,500
    expect(combinedText).toContain('usd 2,500');
    expect(combinedText).toContain('one-time award');

    // 2nd/3rd-year undergraduates
    expect(googleApac.eligibility?.toLowerCase()).toContain('2nd/3rd-year undergraduates');
    expect(combinedText).toContain('2nd/3rd-year undergraduates');
    expect(googleApac.targetBatches).toContain(2027);
    expect(googleApac.targetBatches).toContain(2028);

    // 2026 deadline reported 31 August 2026, passed
    expect(combinedText).toContain('31 august 2026');
    expect(combinedText).toContain('passed');
    expect(googleApac.currentStatus).toBe('PASSED_THIS_CYCLE');

    // Income/marks conditions: confirm on the official page
    expect(combinedText).toContain('income/marks conditions: confirm on the official page');

    // Month-only windows (no day numbers in announcement/window text)
    expect(googleApac.expectedAnnouncementMonth).toBe('July - August');
    expect(googleApac.exactWindowText).toContain('July – August');
    expect(googleApac.exactWindowText).not.toMatch(/\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i);

    // Official link
    const url = new URL(googleApac.officialCareersUrl);
    expect(isHostnameAllowed(url.hostname)).toBe(true);
    expect(url.hostname).toContain('google.com');
  });

  it('2. AnitaB.org Advancing Inclusion Student Scholarship meets all requirements', () => {
    const advancingInclusion = allCycles.find(c => c.id === 'cycle_anitab_advancing_inclusion');
    expect(advancingInclusion).toBeDefined();
    if (!advancingInclusion) return;

    expect(advancingInclusion.programTitle).toBe('AnitaB.org Advancing Inclusion Student Scholarship');
    expect(advancingInclusion.companyName).toBe('AnitaB.org');

    // coverageType non-cash: free GHC registration and membership
    expect(advancingInclusion.coverageType).toBe('NON_CASH');
    const combinedText = [
      advancingInclusion.eligibilityCriteria,
      advancingInclusion.actionTip,
      advancingInclusion.disclaimerNotice,
      advancingInclusion.historicalCompensation,
      advancingInclusion.coverageBreakdown
    ].join(' ').toLowerCase();
    expect(combinedText).toContain('free ghc registration and membership');

    // GPA 2.5+
    expect(advancingInclusion.eligibility).toContain('GPA 2.5+');
    expect(combinedText).toContain('gpa 2.5+');

    // rateType: MARKET_ESTIMATED
    expect(advancingInclusion.rateType).toBe('MARKET_ESTIMATED');

    // Month-only windows
    expect(advancingInclusion.expectedAnnouncementMonth).toBe('May - June');
    expect(advancingInclusion.exactWindowText).toContain('May – June');
    expect(advancingInclusion.exactWindowText).not.toMatch(/\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i);

    // Official link
    const url = new URL(advancingInclusion.officialCareersUrl);
    expect(isHostnameAllowed(url.hostname)).toBe(true);
    expect(url.hostname).toContain('anitab.org');
  });

  it('3. AnitaB.org Kamala Scholars meets all requirements', () => {
    const kamala = allCycles.find(c => c.id === 'cycle_anitab_kamala_scholars');
    expect(kamala).toBeDefined();
    if (!kamala) return;

    expect(kamala.programTitle).toBe('AnitaB.org Kamala Scholars');
    expect(kamala.companyName).toBe('AnitaB.org');

    // 3rd/4th-year undergraduates
    expect(kamala.eligibility).toBe('3rd/4th-year undergraduates');
    expect(kamala.targetBatches).toContain(2026);
    expect(kamala.targetBatches).toContain(2027);

    // Travel funded for GHC
    expect(kamala.coverageType).toBe('TRAVEL_ONLY');
    const combinedText = [
      kamala.eligibilityCriteria,
      kamala.actionTip,
      kamala.disclaimerNotice,
      kamala.historicalCompensation,
      kamala.coverageBreakdown
    ].join(' ').toLowerCase();
    expect(combinedText).toContain('travel funded for ghc');

    // 2026 deadline 8 September passed
    expect(combinedText).toContain('8 september passed');
    expect(kamala.currentStatus).toBe('PASSED_THIS_CYCLE');

    // Eligibility: confirm
    expect(combinedText).toContain('eligibility: confirm');

    // rateType: MARKET_ESTIMATED
    expect(kamala.rateType).toBe('MARKET_ESTIMATED');

    // Month-only windows
    expect(kamala.expectedAnnouncementMonth).toBe('August - September');
    expect(kamala.exactWindowText).toContain('August – September');
    expect(kamala.exactWindowText).not.toMatch(/\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i);

    // Official link
    const url = new URL(kamala.officialCareersUrl);
    expect(isHostnameAllowed(url.hostname)).toBe(true);
    expect(url.hostname).toContain('anitab.org');
  });

  it('4. GHC India scholarship meets all requirements', () => {
    const ghcIndia = allCycles.find(c => c.id === 'cycle_ghc_india_scholarship');
    expect(ghcIndia).toBeDefined();
    if (!ghcIndia) return;

    expect(ghcIndia.programTitle).toBe('GHC India scholarship');
    expect(ghcIndia.country).toBe('India');

    // 2025 value reported as Rs 25,000; 2026 not confirmed
    const combinedText = [
      ghcIndia.eligibilityCriteria,
      ghcIndia.actionTip,
      ghcIndia.disclaimerNotice,
      ghcIndia.historicalCompensation,
      ghcIndia.coverageBreakdown
    ].join(' ').toLowerCase();
    expect(combinedText).toContain('2025 value reported as rs 25,000');
    expect(combinedText).toContain('2026 not confirmed');

    // rateType: MARKET_ESTIMATED
    expect(ghcIndia.rateType).toBe('MARKET_ESTIMATED');

    // Month-only windows
    expect(ghcIndia.expectedAnnouncementMonth).toBe('August - September');
    expect(ghcIndia.exactWindowText).toContain('August – September');
    expect(ghcIndia.exactWindowText).not.toMatch(/\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i);

    // Official link
    const url = new URL(ghcIndia.officialCareersUrl);
    expect(isHostnameAllowed(url.hostname)).toBe(true);
    expect(url.hostname).toContain('anitab.org');
  });

  it('5. Verifies all 4 programs appear in the Scholarships portal dataset', () => {
    const scholarships = UpcomingInternshipsService.filterUpcomingCycles({
      portal: 'scholarships',
      status: 'all'
    });

    const ids = scholarships.map(c => c.id);
    expect(ids).toContain('cycle_generation_google_scholarship_apac');
    expect(ids).toContain('cycle_anitab_advancing_inclusion');
    expect(ids).toContain('cycle_anitab_kamala_scholars');
    expect(ids).toContain('cycle_ghc_india_scholarship');
  });
});

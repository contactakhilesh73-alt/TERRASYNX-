import { describe, it, expect } from 'vitest';
import { UpcomingInternshipsService } from '../services/upcomingInternshipsService';
import { getCoverageTypeBadgeConfig } from '../utils/scholarshipBadges';

describe('Prompt 39: Undergrad Merit Batch (Sirf Verified)', () => {
  const allCycles = UpcomingInternshipsService.getAllUpcomingCycles();

  it('contains Cornelius Vanderbilt Scholarship with coverageType FULL_TUITION plus one-time summer stipend', () => {
    const vanderbilt = allCycles.find(c => c.id === 'cycle_cornelius_vanderbilt_scholarship');
    expect(vanderbilt, 'Cornelius Vanderbilt scholarship should exist').toBeDefined();

    expect(vanderbilt!.companyName).toBe('Vanderbilt University');
    expect(vanderbilt!.programTitle).toContain('Cornelius Vanderbilt');
    expect(vanderbilt!.studyLevel).toBe('class12_ug');
    expect(vanderbilt!.coverageType).toBe('FULL_TUITION');

    // Must never be labeled as Full Ride
    expect(vanderbilt!.coverageType).not.toBe('FULL_RIDE');
    const badge = getCoverageTypeBadgeConfig(vanderbilt!.coverageType);
    expect(badge.label).toBe('Full Tuition');
    expect(badge.label.toLowerCase()).not.toContain('full ride');

    // Plus a one-time summer stipend
    expect(vanderbilt!.fundingAmountText?.toLowerCase()).toContain('summer');
    expect(vanderbilt!.fundingAmountText?.toLowerCase()).toContain('stipend');
    expect(vanderbilt!.coverageBreakdown?.toLowerCase()).toContain('summer');
    expect(vanderbilt!.coverageBreakdown?.toLowerCase()).toContain('stipend');

    // Official domain
    expect(vanderbilt!.companyDomain).toBe('vanderbilt.edu');
    expect(vanderbilt!.officialCareersUrl).toContain('vanderbilt.edu');
  });

  it('contains USC Trustee / Mork Scholarship with coverageType FULL_TUITION', () => {
    const usc = allCycles.find(c => c.id === 'cycle_usc_trustee_mork_scholarship');
    expect(usc, 'USC Trustee / Mork scholarship should exist').toBeDefined();

    expect(usc!.companyName).toContain('Southern California');
    expect(usc!.programTitle).toContain('USC Trustee');
    expect(usc!.programTitle).toContain('Mork');
    expect(usc!.studyLevel).toBe('class12_ug');
    expect(usc!.coverageType).toBe('FULL_TUITION');

    // Must never be labeled as Full Ride
    expect(usc!.coverageType).not.toBe('FULL_RIDE');
    const badge = getCoverageTypeBadgeConfig(usc!.coverageType);
    expect(badge.label).toBe('Full Tuition');
    expect(badge.label.toLowerCase()).not.toContain('full ride');

    // Official domain
    expect(usc!.companyDomain).toBe('usc.edu');
    expect(usc!.officialCareersUrl).toContain('usc.edu');
  });

  it('STRICT NEGATIVE CONSTRAINT: Does NOT add Emory Woodruff, BU Trustee, or NYU Shanghai', () => {
    // International eligibility is not yet verified for these; must NOT exist
    const unverifiedKeywords = [
      'emory',
      'woodruff',
      'bu trustee',
      'boston university trustee',
      'nyu shanghai',
    ];

    unverifiedKeywords.forEach(keyword => {
      const found = allCycles.find(c =>
        c.companyName.toLowerCase().includes(keyword) ||
        c.programTitle.toLowerCase().includes(keyword) ||
        c.id.toLowerCase().includes(keyword)
      );
      expect(found, `Unverified scholarship matching "${keyword}" should NOT be present`).toBeUndefined();
    });
  });

  it('ensures both verified undergrad scholarships appear in the scholarships portal', () => {
    const CORPORATE_TIERS = new Set(['tech_giant', 'quant_hft', 'frontier_ai', 'early_undergrad_exclusive']);
    const scholarshipCycles = allCycles.filter(cycle => {
      const isScholarship = Boolean(
        cycle.isGlobalFullRide ||
        cycle.isPreUniversityFullRide ||
        cycle.tierCategory === 'pre_university_full_ride' ||
        cycle.tierCategory === 'global_full_ride' ||
        cycle.tierCategory === 'scholarship' ||
        cycle.programCategory === 'pre_university_full_ride' ||
        cycle.programCategory === 'global_full_ride' ||
        cycle.programCategory === 'scholarship' ||
        cycle.programCategory === 'early_career_12th' ||
        cycle.hiringCycleType === 'scholarship' ||
        cycle.hiringCycleType === 'global_full_ride' ||
        cycle.hiringCycleType === 'pre_university_full_ride' ||
        cycle.hiringCycleType === 'early_career_12th'
      );
      const isCorporate = cycle.tierCategory && CORPORATE_TIERS.has(cycle.tierCategory);
      const isResearch = cycle.tierCategory === 'scientific_lab' || cycle.tierCategory === 'academic_fellowship' || cycle.programCategory === 'scientific_lab' || cycle.programCategory === 'academic_fellowship';
      const isOpenSource = cycle.tierCategory === 'open_source_grant' || cycle.programCategory === 'open_source_grant';
      return isScholarship && !isCorporate && !isResearch && !isOpenSource;
    });

    const vanderbilt = scholarshipCycles.find(c => c.id === 'cycle_cornelius_vanderbilt_scholarship');
    expect(vanderbilt).toBeDefined();

    const usc = scholarshipCycles.find(c => c.id === 'cycle_usc_trustee_mork_scholarship');
    expect(usc).toBeDefined();

    // Both are Class 12 / UG
    const ugScholarships = scholarshipCycles.filter(c => c.studyLevel === 'class12_ug');
    expect(ugScholarships).toContain(vanderbilt);
    expect(ugScholarships).toContain(usc);
  });
});

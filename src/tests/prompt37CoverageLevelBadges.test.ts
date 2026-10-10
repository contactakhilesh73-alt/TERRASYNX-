import { describe, it, expect } from 'vitest';
import { UpcomingInternshipsService } from '../services/upcomingInternshipsService';
import { StudyLevel, CoverageType, UpcomingInternshipCycle } from '../types';
import { getStudyLevelBadgeConfig, getCoverageTypeBadgeConfig } from '../utils/scholarshipBadges';

describe('Prompt 37: Coverage and Level Badges & Scholarships Level Filter', () => {
  const allCycles = UpcomingInternshipsService.getAllUpcomingCycles();

  it('verifies all 123 cycles have valid studyLevel and coverageType backfilled', () => {
    expect(allCycles.length).toBeGreaterThan(0);

    const validStudyLevels: StudyLevel[] = ['class12_ug', 'postgraduate', 'summer_research', 'internship'];
    const validCoverageTypes: CoverageType[] = ['FULL_RIDE', 'FULL_TUITION', 'STIPEND_ONLY', 'TRAVEL_ONLY'];

    allCycles.forEach(cycle => {
      expect(cycle.studyLevel, `Missing studyLevel in ${cycle.id}`).toBeDefined();
      expect(validStudyLevels).toContain(cycle.studyLevel);

      expect(cycle.coverageType, `Missing coverageType in ${cycle.id}`).toBeDefined();
      expect(validCoverageTypes).toContain(cycle.coverageType);
    });
  });

  it('accurately distinguishes true FULL_RIDE from FULL_TUITION and STIPEND_ONLY', () => {
    // 1. Prestigious Ivy+ Need-Blind and Named Full-Rides
    const harvard = allCycles.find(c => c.id === 'cycle_harvard_need_blind_full_ride');
    expect(harvard?.studyLevel).toBe('class12_ug');
    expect(harvard?.coverageType).toBe('FULL_RIDE');

    const mit = allCycles.find(c => c.id === 'cycle_mit_need_blind_full_ride');
    expect(mit?.studyLevel).toBe('class12_ug');
    expect(mit?.coverageType).toBe('FULL_RIDE');

    const tataCornell = allCycles.find(c => c.id === 'cycle_tata_cornell_scholarship');
    expect(tataCornell?.studyLevel).toBe('class12_ug');
    expect(tataCornell?.coverageType).toBe('FULL_RIDE');

    // 2. Postgraduate Government Full-Ride Schemes
    const nos = allCycles.find(c => c.id === 'cycle_national_overseas_scholarship_nos');
    expect(nos?.studyLevel).toBe('postgraduate');
    expect(nos?.coverageType).toBe('FULL_RIDE');

    const marangGomke = allCycles.find(c => c.id === 'cycle_marang_gomke_jharkhand_scholarship');
    expect(marangGomke?.studyLevel).toBe('postgraduate');
    expect(marangGomke?.coverageType).toBe('FULL_RIDE');

    // 3. Conservative grant/stipend programs (NOT FULL_RIDE)
    const ambedkar = allCycles.find(c => c.id === 'cycle_ambedkar_overseas_vidya_nidhi');
    expect(ambedkar?.studyLevel).toBe('postgraduate');
    expect(ambedkar?.coverageType).toBe('STIPEND_ONLY'); // Capped financial grant

    const thiel = allCycles.find(c => c.id === 'cycle_thiel_fellowship_class12');
    expect(thiel?.studyLevel).toBe('class12_ug');
    expect(thiel?.coverageType).toBe('STIPEND_ONLY'); // Cash grant to drop out, not full-ride college

    const afe = allCycles.find(c => c.id === 'cycle_amazon_future_engineer_scholarship');
    expect(afe?.studyLevel).toBe('class12_ug');
    expect(afe?.coverageType).toBe('STIPEND_ONLY');

    const genGoogle = allCycles.find(c => c.id === 'cycle_generation_google_scholarship');
    expect(genGoogle?.studyLevel).toBe('class12_ug');
    expect(genGoogle?.coverageType).toBe('STIPEND_ONLY');

    // 4. Tuition-only degree sponsorship
    const wiproWilp = allCycles.find(c => c.id === 'cycle_wipro_wilp_program');
    expect(wiproWilp?.studyLevel).toBe('class12_ug');
    expect(wiproWilp?.coverageType).toBe('FULL_TUITION');

    // 5. Travel Only
    const metiJapan = allCycles.find(c => c.id === 'cycle_meti_japan_government_internship');
    expect(metiJapan?.studyLevel).toBe('summer_research');
    expect(metiJapan?.coverageType).toBe('TRAVEL_ONLY');
  });

  it('CRITICAL RULE: Never label a tuition-only award as "Full Ride"', () => {
    // Check badge resolver output
    const tuitionBadge = getCoverageTypeBadgeConfig('FULL_TUITION');
    expect(tuitionBadge.label).toBe('Full Tuition');
    expect(tuitionBadge.label.toLowerCase()).not.toContain('full ride');

    // Check all cycles marked FULL_TUITION
    const tuitionOnlyCycles = allCycles.filter(c => c.coverageType === 'FULL_TUITION');
    expect(tuitionOnlyCycles.length).toBeGreaterThan(0);
    tuitionOnlyCycles.forEach(cycle => {
      const badge = getCoverageTypeBadgeConfig(cycle.coverageType);
      expect(badge.label).not.toBe('Full Ride');
      expect(badge.label).toBe('Full Tuition');
    });
  });

  it('verifies badge resolver generates valid badge configurations for all study levels and coverage types', () => {
    const studyLevels: StudyLevel[] = ['class12_ug', 'postgraduate', 'summer_research', 'internship'];
    studyLevels.forEach(lvl => {
      const badge = getStudyLevelBadgeConfig(lvl);
      expect(badge.label.length).toBeGreaterThan(0);
      expect(badge.icon).toBeDefined();
      expect(badge.className).toContain('border');
    });

    const coverageTypes: CoverageType[] = ['FULL_RIDE', 'FULL_TUITION', 'STIPEND_ONLY', 'TRAVEL_ONLY'];
    coverageTypes.forEach(cov => {
      const badge = getCoverageTypeBadgeConfig(cov);
      expect(badge.label.length).toBeGreaterThan(0);
      expect(badge.icon).toBeDefined();
      expect(badge.className).toContain('border');
    });

    expect(getCoverageTypeBadgeConfig('FULL_RIDE').label).toBe('Full Ride');
    expect(getCoverageTypeBadgeConfig('FULL_TUITION').label).toBe('Full Tuition');
    expect(getCoverageTypeBadgeConfig('STIPEND_ONLY').label).toBe('Stipend Only');
    expect(getCoverageTypeBadgeConfig('TRAVEL_ONLY').label).toBe('Travel Only');
  });

  it('tests study level filtering on the Scholarships dataset', () => {
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

    expect(scholarshipCycles.length).toBe(46);

    // Filter by 'postgraduate'
    const pgScholarships = scholarshipCycles.filter(c => c.studyLevel === 'postgraduate');
    expect(pgScholarships.length).toBe(13);
    const pgIds = pgScholarships.map(c => c.id);
    expect(pgIds).toContain('cycle_national_overseas_scholarship_nos');
    expect(pgIds).toContain('cycle_marang_gomke_jharkhand_scholarship');
    expect(pgIds).toContain('cycle_rajarshi_shahu_maharashtra_scholarship');
    expect(pgIds).toContain('cycle_ambedkar_overseas_vidya_nidhi');

    // Filter by 'class12_ug'
    const ugScholarships = scholarshipCycles.filter(c => c.studyLevel === 'class12_ug');
    expect(ugScholarships.length).toBe(33);

    // Sum matches total
    expect(pgScholarships.length + ugScholarships.length).toBe(46);
  });
});

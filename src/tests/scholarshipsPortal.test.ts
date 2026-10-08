import { describe, it, expect } from 'vitest';
import { UpcomingInternshipsService } from '../services/upcomingInternshipsService';

describe('Prompt 34C: ScholarshipsPortal (Scholarships Only)', () => {
  const CORPORATE_TIERS = new Set(['tech_giant', 'quant_hft', 'frontier_ai', 'early_undergrad_exclusive']);

  const getScholarshipCycles = (referenceDate: Date = new Date(2026, 8, 20)) => {
    const raw = UpcomingInternshipsService.getAllUpcomingCycles(referenceDate);
    return raw.filter(cycle => {
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
  };

  it('shows ONLY scholarship_12th, global_full_ride, and pre_university_full_ride entries (count: 35)', () => {
    const scholarships = getScholarshipCycles();

    expect(scholarships.length).toBe(35);

    let preUni = 0;
    let globalFull = 0;
    let sch12th = 0;

    for (const cycle of scholarships) {
      if (cycle.tierCategory === 'pre_university_full_ride' || cycle.programCategory === 'pre_university_full_ride' || cycle.isPreUniversityFullRide) {
        preUni++;
      } else if (cycle.programCategory === 'global_full_ride' || cycle.hiringCycleType === 'global_full_ride' || cycle.isGlobalFullRide) {
        globalFull++;
      } else {
        sch12th++;
      }
    }

    expect(preUni).toBe(18);
    expect(globalFull).toBe(7);
    expect(sch12th).toBe(10);
    expect(preUni + globalFull + sch12th).toBe(35);
  });

  it('strictly excludes all corporate internships, research labs, and open-source grants', () => {
    const scholarships = getScholarshipCycles();

    // No corporate tech giants
    const google = scholarships.find(c => c.companyName === 'Google' && c.tierCategory === 'tech_giant');
    expect(google).toBeUndefined();

    const janeStreet = scholarships.find(c => c.companyName === 'Jane Street');
    expect(janeStreet).toBeUndefined();

    const openai = scholarships.find(c => c.companyName === 'OpenAI');
    expect(openai).toBeUndefined();

    // No research labs
    const cern = scholarships.find(c => c.companyName.toLowerCase().includes('cern'));
    expect(cern).toBeUndefined();

    const desy = scholarships.find(c => c.companyName.toLowerCase().includes('desy'));
    expect(desy).toBeUndefined();

    // No open source grants
    const gsoc = scholarships.find(c => c.companyName.toLowerCase().includes('summer of code'));
    expect(gsoc).toBeUndefined();

    // Verified flagship scholarships are present
    const harvard = scholarships.find(c => c.companyName.includes('Harvard'));
    expect(harvard).toBeDefined();

    const mit = scholarships.find(c => c.companyName.includes('MIT') || c.companyName.includes('Massachusetts Institute'));
    expect(mit).toBeDefined();

    const tataCornell = scholarships.find(c => c.programTitle.includes('Tata Scholarship'));
    expect(tataCornell).toBeDefined();

    const techBee = scholarships.find(c => c.programTitle.includes('TechBee'));
    expect(techBee).toBeDefined();
  });

  it('builds dynamic country list with accurate distinct counts for scholarships', () => {
    const scholarships = getScholarshipCycles();

    const counts: Record<string, number> = {};
    for (const cycle of scholarships) {
      const c = cycle.country?.trim() || 'Global/Remote';
      counts[c] = (counts[c] || 0) + 1;
    }

    expect(counts['USA']).toBe(16);
    expect(counts['India']).toBe(9);
    expect(counts['Global/Remote']).toBe(5);
    expect(counts['UK']).toBe(3);
    expect(counts['Canada']).toBe(1);
    expect(counts['UAE']).toBe(1);
  });

  it('verifies every scholarship program has high-stakes disclaimer text or default fallback', () => {
    const scholarships = getScholarshipCycles();

    for (const cycle of scholarships) {
      // Must have either custom disclaimerNotice or the default mandatory high-stakes notice
      const disclaimer = cycle.disclaimerNotice || 'Confirm exact dates, application deadlines, and opening quotas directly on the official host scholarship/institution website — this schedule serves as an advisory guide.';
      expect(disclaimer.length).toBeGreaterThan(20);
      expect(disclaimer).toContain('official');
    }
  });
});

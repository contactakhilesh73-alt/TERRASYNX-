import { describe, it, expect } from 'vitest';
import { UpcomingInternshipsService } from '../services/upcomingInternshipsService';

describe('Prompt 34B: InternshipsPortal (Corporate Internships Only)', () => {
  const CORPORATE_TIERS = new Set(['tech_giant', 'quant_hft', 'frontier_ai', 'early_undergrad_exclusive']);

  it('filters ONLY corporate internships (tech_giant, quant_hft, frontier_ai, early_undergrad_exclusive)', () => {
    const raw = UpcomingInternshipsService.getAllUpcomingCycles(new Date(2026, 8, 20));
    
    const corporateCycles = raw.filter(cycle => {
      const isCorporateTier = cycle.tierCategory && CORPORATE_TIERS.has(cycle.tierCategory);
      const isScholarship = cycle.isGlobalFullRide || cycle.isPreUniversityFullRide || cycle.programCategory === 'scholarship' || cycle.programCategory === 'early_career_12th';
      const isResearch = cycle.tierCategory === 'scientific_lab' || cycle.tierCategory === 'academic_fellowship' || cycle.programCategory === 'scientific_lab' || cycle.programCategory === 'academic_fellowship';
      const isOpenSource = cycle.tierCategory === 'open_source_grant' || cycle.programCategory === 'open_source_grant';

      return isCorporateTier && !isScholarship && !isResearch && !isOpenSource;
    });

    expect(corporateCycles.length).toBeGreaterThan(0);
    expect(corporateCycles.length).toBe(63);

    // Verify every single item has corporate tier category
    for (const cycle of corporateCycles) {
      expect(CORPORATE_TIERS.has(cycle.tierCategory || '')).toBe(true);
      expect(cycle.isGlobalFullRide).toBeFalsy();
      expect(cycle.isPreUniversityFullRide).toBeFalsy();
      expect(cycle.tierCategory).not.toBe('scientific_lab');
      expect(cycle.tierCategory).not.toBe('academic_fellowship');
      expect(cycle.tierCategory).not.toBe('open_source_grant');
    }
  });

  it('strictly excludes all scholarships, research fellowships, and open source programs', () => {
    const raw = UpcomingInternshipsService.getAllUpcomingCycles(new Date(2026, 8, 20));
    
    const corporateCycles = raw.filter(cycle => {
      const isCorporateTier = cycle.tierCategory && CORPORATE_TIERS.has(cycle.tierCategory);
      const isScholarship = cycle.isGlobalFullRide || cycle.isPreUniversityFullRide || cycle.programCategory === 'scholarship' || cycle.programCategory === 'early_career_12th';
      const isResearch = cycle.tierCategory === 'scientific_lab' || cycle.tierCategory === 'academic_fellowship' || cycle.programCategory === 'scientific_lab' || cycle.programCategory === 'academic_fellowship';
      const isOpenSource = cycle.tierCategory === 'open_source_grant' || cycle.programCategory === 'open_source_grant';

      return isCorporateTier && !isScholarship && !isResearch && !isOpenSource;
    });

    // Check specific known programs outside corporate tier
    const cern = corporateCycles.find(c => c.companyName.toLowerCase().includes('cern'));
    expect(cern).toBeUndefined();

    const gsoc = corporateCycles.find(c => c.companyName.toLowerCase().includes('google summer of code'));
    expect(gsoc).toBeUndefined();

    const rhodes = corporateCycles.find(c => c.companyName.toLowerCase().includes('rhodes'));
    expect(rhodes).toBeUndefined();

    // Check corporate giants are present
    const google = corporateCycles.find(c => c.companyName === 'Google');
    expect(google).toBeDefined();

    const janeStreet = corporateCycles.find(c => c.companyName === 'Jane Street');
    expect(janeStreet).toBeDefined();

    const openAi = corporateCycles.find(c => c.companyName === 'OpenAI');
    expect(openAi).toBeDefined();
  });

  it('builds dynamic country list with accurate opportunity counts for corporate internships', () => {
    const raw = UpcomingInternshipsService.getAllUpcomingCycles(new Date(2026, 8, 20));
    const corporateCycles = raw.filter(cycle => {
      const isCorporateTier = cycle.tierCategory && CORPORATE_TIERS.has(cycle.tierCategory);
      const isScholarship = cycle.isGlobalFullRide || cycle.isPreUniversityFullRide || cycle.programCategory === 'scholarship' || cycle.programCategory === 'early_career_12th';
      const isResearch = cycle.tierCategory === 'scientific_lab' || cycle.tierCategory === 'academic_fellowship' || cycle.programCategory === 'scientific_lab' || cycle.programCategory === 'academic_fellowship';
      const isOpenSource = cycle.tierCategory === 'open_source_grant' || cycle.programCategory === 'open_source_grant';

      return isCorporateTier && !isScholarship && !isResearch && !isOpenSource;
    });

    const counts: Record<string, number> = {};
    for (const cycle of corporateCycles) {
      const c = cycle.country?.trim() || 'Global/Remote';
      counts[c] = (counts[c] || 0) + 1;
    }

    expect(Object.keys(counts).length).toBeGreaterThan(1);
    expect(counts['USA']).toBeGreaterThan(0);
    expect(counts['India']).toBeGreaterThan(0);
    expect(counts['Global/Remote']).toBeGreaterThan(0);
  });
});

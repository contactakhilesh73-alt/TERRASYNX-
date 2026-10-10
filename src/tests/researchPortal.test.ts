import { describe, it, expect } from 'vitest';
import { UpcomingInternshipsService } from '../services/upcomingInternshipsService';

describe('Prompt 34D: ResearchPortal (Scientific Labs & Fellowships Only)', () => {
  const CORPORATE_TIERS = new Set(['tech_giant', 'quant_hft', 'frontier_ai', 'early_undergrad_exclusive']);

  const getResearchCycles = (referenceDate: Date = new Date(2026, 8, 20)) => {
    const raw = UpcomingInternshipsService.getAllUpcomingCycles(referenceDate);
    return raw.filter(cycle => {
      const isResearch = (
        cycle.tierCategory === 'scientific_lab' ||
        cycle.tierCategory === 'academic_fellowship' ||
        cycle.programCategory === 'scientific_lab' ||
        cycle.programCategory === 'academic_fellowship' ||
        cycle.hiringCycleType === 'scientific_lab' ||
        cycle.hiringCycleType === 'academic_fellowship'
      );

      const isScholarship = Boolean(
        cycle.isGlobalFullRide ||
        cycle.isPreUniversityFullRide ||
        cycle.programCategory === 'scholarship' ||
        cycle.programCategory === 'early_career_12th' ||
        cycle.tierCategory === 'pre_university_full_ride'
      );

      const isCorporate = cycle.tierCategory && CORPORATE_TIERS.has(cycle.tierCategory);
      const isOpenSource = cycle.tierCategory === 'open_source_grant' || cycle.programCategory === 'open_source_grant';

      return isResearch && !isScholarship && !isCorporate && !isOpenSource;
    });
  };

  it('shows ONLY scientific_lab and academic_fellowship entries (count: 21 with ETH Zurich SSRF)', () => {
    const research = getResearchCycles();

    expect(research.length).toBe(21);

    const scientificLabs = research.filter(c => c.tierCategory === 'scientific_lab');
    const academicFellowships = research.filter(c => c.tierCategory === 'academic_fellowship');

    expect(scientificLabs.length).toBe(13);
    expect(academicFellowships.length).toBe(8);
    expect(scientificLabs.length + academicFellowships.length).toBe(21);
  });

  it('contains premier scientific institutes: CERN, RIKEN, OIST, Max Planck, MITACS, DAAD, and similar', () => {
    const research = getResearchCycles();

    const cern = research.find(c => c.companyName === 'CERN');
    expect(cern).toBeDefined();
    expect(cern?.country).toBe('Switzerland');

    const riken = research.find(c => c.companyName === 'RIKEN');
    expect(riken).toBeDefined();
    expect(riken?.country).toBe('Japan');

    const oist = research.find(c => c.companyName === 'OIST');
    expect(oist).toBeDefined();
    expect(oist?.country).toBe('Japan');

    const maxPlanck = research.find(c => c.companyName.includes('Max Planck'));
    expect(maxPlanck).toBeDefined();
    expect(maxPlanck?.country).toBe('Germany');

    const mitacs = research.find(c => c.companyName.includes('Mitacs'));
    expect(mitacs).toBeDefined();
    expect(mitacs?.country).toBe('Canada');

    const daad = research.find(c => c.companyName.includes('DAAD'));
    expect(daad).toBeDefined();
    expect(daad?.country).toBe('Germany');

    const weizmann = research.find(c => c.companyName.includes('Weizmann'));
    expect(weizmann).toBeDefined();
    expect(weizmann?.country).toBe('Israel');

    const fermilab = research.find(c => c.companyName === 'Fermilab');
    expect(fermilab).toBeDefined();
    expect(fermilab?.country).toBe('USA');
  });

  it('strictly excludes corporate tech internships, scholarships, and open source grants', () => {
    const research = getResearchCycles();

    // No corporate roles
    const google = research.find(c => c.companyName === 'Google');
    expect(google).toBeUndefined();

    const janeStreet = research.find(c => c.companyName === 'Jane Street');
    expect(janeStreet).toBeUndefined();

    // No scholarships
    const harvard = research.find(c => c.companyName === 'Harvard University');
    expect(harvard).toBeUndefined();

    const techBee = research.find(c => c.programTitle.includes('TechBee'));
    expect(techBee).toBeUndefined();

    // No open source grants
    const gsoc = research.find(c => c.companyName.toLowerCase().includes('summer of code'));
    expect(gsoc).toBeUndefined();
  });

  it('builds strong country-based filter containing all 11 scientific research jurisdictions', () => {
    const research = getResearchCycles();

    const countryCounts: Record<string, number> = {};
    for (const c of research) {
      const country = c.country?.trim() || 'Global/Remote';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    }

    expect(countryCounts['Germany']).toBe(4);
    expect(countryCounts['Japan']).toBe(3);
    expect(countryCounts['Singapore']).toBe(3);
    expect(countryCounts['India']).toBe(3);
    expect(countryCounts['Switzerland']).toBe(2);
    expect(countryCounts['Israel']).toBe(1);
    expect(countryCounts['USA']).toBe(1);
    expect(countryCounts['Canada']).toBe(1);
    expect(countryCounts['South Korea']).toBe(1);
    expect(countryCounts['France']).toBe(1);
    expect(countryCounts['Taiwan']).toBe(1);
  });
});

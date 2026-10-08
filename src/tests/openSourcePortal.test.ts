import { describe, it, expect } from 'vitest';
import { UpcomingInternshipsService } from '../services/upcomingInternshipsService';

describe('Prompt 34E: OpenSourcePortal (Open Source Programs Only)', () => {
  const CORPORATE_TIERS = new Set(['tech_giant', 'quant_hft', 'frontier_ai', 'early_undergrad_exclusive']);

  const getOpenSourceCycles = (referenceDate: Date = new Date(2026, 8, 20)) => {
    const raw = UpcomingInternshipsService.getAllUpcomingCycles(referenceDate);
    return raw.filter(cycle => {
      const isOpenSource = (
        cycle.tierCategory === 'open_source_grant' ||
        cycle.programCategory === 'open_source_grant' ||
        cycle.hiringCycleType === 'open_source_grant'
      );

      const isScholarship = Boolean(
        cycle.isGlobalFullRide ||
        cycle.isPreUniversityFullRide ||
        cycle.programCategory === 'scholarship' ||
        cycle.programCategory === 'early_career_12th' ||
        cycle.tierCategory === 'pre_university_full_ride'
      );

      const isCorporate = cycle.tierCategory && CORPORATE_TIERS.has(cycle.tierCategory);

      const isResearch = (
        cycle.tierCategory === 'scientific_lab' ||
        cycle.tierCategory === 'academic_fellowship' ||
        cycle.programCategory === 'scientific_lab' ||
        cycle.programCategory === 'academic_fellowship'
      );

      return isOpenSource && !isScholarship && !isCorporate && !isResearch;
    });
  };

  it('shows ONLY open_source_grant entries (count: 5)', () => {
    const os = getOpenSourceCycles();

    expect(os.length).toBe(5);

    for (const c of os) {
      expect(c.tierCategory === 'open_source_grant' || c.programCategory === 'open_source_grant').toBe(true);
      expect(c.country).toBe('Global/Remote');
    }
  });

  it('contains the 5 premier open source programs: Outreachy, GSoC, LFX, MLH, Season of Docs', () => {
    const os = getOpenSourceCycles();

    const outreachy = os.find(c => c.companyName.toLowerCase().includes('outreachy'));
    expect(outreachy).toBeDefined();
    expect(outreachy?.programTitle).toContain('Outreachy');

    const gsoc = os.find(c => c.companyName.toLowerCase().includes('summer of code'));
    expect(gsoc).toBeDefined();
    expect(gsoc?.programTitle).toContain('GSoC');

    const lfx = os.find(c => c.companyName.toLowerCase().includes('linux foundation') || c.companyName.toLowerCase().includes('lfx'));
    expect(lfx).toBeDefined();
    expect(lfx?.programTitle).toContain('LFX');

    const mlh = os.find(c => c.companyName.toLowerCase().includes('major league hacking') || c.companyName.toLowerCase().includes('mlh'));
    expect(mlh).toBeDefined();
    expect(mlh?.programTitle).toContain('MLH');

    const gsod = os.find(c => c.companyName.toLowerCase().includes('season of docs'));
    expect(gsod).toBeDefined();
    expect(gsod?.programTitle).toContain('GSoD');
  });

  it('strictly excludes all corporate internships, scholarships, and research labs', () => {
    const os = getOpenSourceCycles();

    // No corporate tech giants
    const googleTech = os.find(c => c.companyName === 'Google' && c.tierCategory === 'tech_giant');
    expect(googleTech).toBeUndefined();

    const janeStreet = os.find(c => c.companyName === 'Jane Street');
    expect(janeStreet).toBeUndefined();

    // No scholarships
    const harvard = os.find(c => c.companyName === 'Harvard University');
    expect(harvard).toBeUndefined();

    const techBee = os.find(c => c.programTitle.includes('TechBee'));
    expect(techBee).toBeUndefined();

    // No research labs
    const cern = os.find(c => c.companyName === 'CERN');
    expect(cern).toBeUndefined();

    const daad = os.find(c => c.companyName.includes('DAAD'));
    expect(daad).toBeUndefined();
  });

  it('verifies all 5 open source programs offer generous stipends / contributor grants', () => {
    const os = getOpenSourceCycles();

    for (const c of os) {
      expect(c.historicalCompensation).toBeDefined();
      expect(c.historicalCompensation?.length).toBeGreaterThan(10);
      expect(c.historicalCompensation).toMatch(/\$|USD/);
    }
  });
});

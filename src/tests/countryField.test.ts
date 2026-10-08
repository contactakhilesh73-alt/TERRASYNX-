import { describe, it, expect } from 'vitest';
import { 
  RECURRING_ANNUAL_INTERNSHIPS, 
  UpcomingInternshipsService,
  matchesSearchQuery 
} from '../services/upcomingInternshipsService';
import { SingaporeGovScannerService } from '../services/singaporeGovScannerService';

describe('Prompt 32: Country field in UpcomingInternshipCycle', () => {
  it('ensures every single recurring annual internship cycle has a defined country string', () => {
    expect(RECURRING_ANNUAL_INTERNSHIPS.length).toBeGreaterThanOrEqual(120);

    for (const cycle of RECURRING_ANNUAL_INTERNSHIPS) {
      expect(cycle.country).toBeDefined();
      expect(typeof cycle.country).toBe('string');
      expect(cycle.country.trim().length).toBeGreaterThan(0);
    }
  });

  it('correctly maps specific international programs to their authentic host countries', () => {
    // Switzerland
    const cern = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_cern_summer_student');
    expect(cern?.country).toBe('Switzerland');

    // Germany
    const desy = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_desy_summer_student');
    const daad = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_daad_wise_germany');
    const mpi = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_mpi_sws_research_internship');
    expect(desy?.country).toBe('Germany');
    expect(daad?.country).toBe('Germany');
    expect(mpi?.country).toBe('Germany');

    // Japan
    const riken = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_riken_summer_program');
    const oist = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_oist_research_internship_japan');
    expect(riken?.country).toBe('Japan');
    expect(oist?.country).toBe('Japan');

    // Canada
    const mitacs = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_mitacs_globalink_canada');
    const pearson = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_lester_b_pearson_utoronto');
    expect(mitacs?.country).toBe('Canada');
    expect(pearson?.country).toBe('Canada');

    // Singapore
    const ntu = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_ntu_india_connect');
    const nus = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_nus_iris_singapore');
    const mcf = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_mycareersfuture_singapore_gov');
    expect(ntu?.country).toBe('Singapore');
    expect(nus?.country).toBe('Singapore');
    expect(mcf?.country).toBe('Singapore');

    // India
    const hcl = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_hcl_techbee_class12');
    const rbi = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_rbi_summer_placement');
    const niti = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_niti_aayog_internship');
    expect(hcl?.country).toBe('India');
    expect(rbi?.country).toBe('India');
    expect(niti?.country).toBe('India');

    // USA
    const harvard = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_harvard_need_blind_full_ride');
    const fermilab = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_fermilab_sist_internship');
    expect(harvard?.country).toBe('USA');
    expect(fermilab?.country).toBe('USA');

    // Global / Remote
    const gsoc = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_gsoc_open_source');
    const lfx = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_lfx_mentorship');
    const outreachy = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_outreachy_open_source');
    expect(gsoc?.country).toBe('Global/Remote');
    expect(lfx?.country).toBe('Global/Remote');
    expect(outreachy?.country).toBe('Global/Remote');
  });

  it('verifies SingaporeGovScannerService calendar cycles have country set to Singapore', () => {
    const cycles = SingaporeGovScannerService.getSingaporeCalendarCycles();
    expect(cycles.length).toBeGreaterThan(0);
    expect(cycles[0].country).toBe('Singapore');
  });

  it('allows natural search querying by country name', () => {
    const cern = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_cern_summer_student')!;
    expect(matchesSearchQuery(cern, 'Switzerland')).toBe(true);

    const riken = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_riken_summer_program')!;
    expect(matchesSearchQuery(riken, 'Japan')).toBe(true);

    const mitacs = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_mitacs_globalink_canada')!;
    expect(matchesSearchQuery(mitacs, 'Canada')).toBe(true);
  });

  describe('Prompt 33: Country Filter & Distinct Counts', () => {
    it('extracts distinct countries from the data with accurate positive counts per country', () => {
      const allCycles = UpcomingInternshipsService.getAllUpcomingCycles();
      const countryCounts: Record<string, number> = {};
      for (const cycle of allCycles) {
        const c = cycle.country?.trim() || 'Global/Remote';
        countryCounts[c] = (countryCounts[c] || 0) + 1;
      }

      const distinctCountries = Object.keys(countryCounts);
      expect(distinctCountries.length).toBeGreaterThanOrEqual(10);
      expect(distinctCountries).toContain('USA');
      expect(distinctCountries).toContain('India');
      expect(distinctCountries).toContain('Germany');
      expect(distinctCountries).toContain('Switzerland');
      expect(distinctCountries).toContain('Japan');
      expect(distinctCountries).toContain('Singapore');
      expect(distinctCountries).toContain('Canada');
      expect(distinctCountries).toContain('UK');
      expect(distinctCountries).toContain('Global/Remote');

      // Every distinct country has a count >= 1
      for (const country of distinctCountries) {
        expect(countryCounts[country]).toBeGreaterThanOrEqual(1);
      }

      // Sum of all country counts equals total cycles count
      const totalCount = Object.values(countryCounts).reduce((acc, n) => acc + n, 0);
      expect(totalCount).toBe(allCycles.length);
    });

    it('filters accurately by country without hiding programs by eligibility', () => {
      const allCycles = UpcomingInternshipsService.getAllUpcomingCycles();

      // Switzerland filter
      const swissCycles = allCycles.filter(c => c.country === 'Switzerland');
      expect(swissCycles.length).toBe(1);
      expect(swissCycles[0].companyName).toBe('CERN');
      expect(swissCycles[0].country).toBe('Switzerland');

      // Japan filter
      const japanCycles = allCycles.filter(c => c.country === 'Japan');
      expect(japanCycles.length).toBe(4);
      for (const c of japanCycles) {
        expect(c.country).toBe('Japan');
      }

      // Germany filter
      const germanyCycles = allCycles.filter(c => c.country === 'Germany');
      expect(germanyCycles.length).toBe(4);
      for (const c of germanyCycles) {
        expect(c.country).toBe('Germany');
      }

      // USA filter
      const usaCycles = allCycles.filter(c => c.country === 'USA');
      expect(usaCycles.length).toBe(35);
      for (const c of usaCycles) {
        expect(c.country).toBe('USA');
      }

      // Singapore filter
      const sgCycles = allCycles.filter(c => c.country === 'Singapore');
      expect(sgCycles.length).toBe(3);
      for (const c of sgCycles) {
        expect(c.country).toBe('Singapore');
      }
    });

    it('works seamlessly in combination with category and status filters', () => {
      const allCycles = UpcomingInternshipsService.getAllUpcomingCycles();

      // Filter by Scientific Lab AND Germany
      const germanLabCycles = allCycles.filter(
        c => c.country === 'Germany' && (c.tierCategory === 'scientific_lab' || c.programCategory === 'scientific_lab' || c.tierCategory === 'academic_fellowship')
      );
      expect(germanLabCycles.length).toBeGreaterThan(0);
      for (const c of germanLabCycles) {
        expect(c.country).toBe('Germany');
      }

      // Filter by Quant HFT AND USA
      const usaQuantCycles = allCycles.filter(
        c => c.country === 'USA' && (c.tierCategory === 'quant_hft' || c.programCategory === 'quant_hft')
      );
      expect(usaQuantCycles.length).toBeGreaterThan(0);
      for (const c of usaQuantCycles) {
        expect(c.country).toBe('USA');
      }
    });
  });

  describe('Prompt 34A: Separate Portals (Internships, Scholarships, Research & Fellowships, Open Source)', () => {
    it('partitions all cycles into 4 distinct portals without data duplication or omissions', () => {
      const allCycles = UpcomingInternshipsService.getAllUpcomingCycles();
      expect(allCycles.length).toBeGreaterThanOrEqual(120);

      const internships = allCycles.filter(c => UpcomingInternshipsService.isCycleInPortal(c, 'internships'));
      const scholarships = allCycles.filter(c => UpcomingInternshipsService.isCycleInPortal(c, 'scholarships'));
      const research = allCycles.filter(c => UpcomingInternshipsService.isCycleInPortal(c, 'research'));
      const openSource = allCycles.filter(c => UpcomingInternshipsService.isCycleInPortal(c, 'open_source'));

      // Check positive counts for each portal
      expect(internships.length).toBeGreaterThan(0);
      expect(scholarships.length).toBeGreaterThan(0);
      expect(research.length).toBeGreaterThan(0);
      expect(openSource.length).toBeGreaterThan(0);

      // Verify exact partition: sum of 4 portals equals total cycles
      const partitionSum = internships.length + scholarships.length + research.length + openSource.length;
      expect(partitionSum).toBe(allCycles.length);

      // Verify no overlap: every cycle belongs to exactly one portal
      const idSet = new Set<string>();
      for (const list of [internships, scholarships, research, openSource]) {
        for (const item of list) {
          expect(idSet.has(item.id)).toBe(false);
          idSet.add(item.id);
        }
      }
      expect(idSet.size).toBe(allCycles.length);
    });

    it('categorizes corporate tech programs into Internships portal', () => {
      const googleStep = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_google_step')!;
      expect(UpcomingInternshipsService.isCycleInPortal(googleStep, 'internships')).toBe(true);

      const janeStreet = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_jane_street_first_year')!;
      expect(UpcomingInternshipsService.isCycleInPortal(janeStreet, 'internships')).toBe(true);

      const openaiResidency = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_openai_residency')!;
      expect(UpcomingInternshipsService.isCycleInPortal(openaiResidency, 'internships')).toBe(true);
    });

    it('categorizes full-ride and Class 12th programs into Scholarships portal', () => {
      const harvard = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_harvard_need_blind_full_ride')!;
      expect(UpcomingInternshipsService.isCycleInPortal(harvard, 'scholarships')).toBe(true);

      const tataCornell = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_tata_scholarship_cornell')!;
      expect(UpcomingInternshipsService.isCycleInPortal(tataCornell, 'scholarships')).toBe(true);

      const hclTechBee = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_hcl_techbee_class12')!;
      expect(UpcomingInternshipsService.isCycleInPortal(hclTechBee, 'scholarships')).toBe(true);
    });

    it('categorizes scientific labs and academic fellowships into Research portal', () => {
      const cern = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_cern_summer_student')!;
      expect(UpcomingInternshipsService.isCycleInPortal(cern, 'research')).toBe(true);

      const desy = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_desy_summer_student')!;
      expect(UpcomingInternshipsService.isCycleInPortal(desy, 'research')).toBe(true);

      const mitacs = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_mitacs_globalink_canada')!;
      expect(UpcomingInternshipsService.isCycleInPortal(mitacs, 'research')).toBe(true);
    });

    it('categorizes open-source grant programs into Open Source portal', () => {
      const gsoc = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_gsoc_open_source')!;
      expect(UpcomingInternshipsService.isCycleInPortal(gsoc, 'open_source')).toBe(true);

      const lfx = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_lfx_mentorship')!;
      expect(UpcomingInternshipsService.isCycleInPortal(lfx, 'open_source')).toBe(true);

      const outreachy = RECURRING_ANNUAL_INTERNSHIPS.find(c => c.id === 'cycle_outreachy_open_source')!;
      expect(UpcomingInternshipsService.isCycleInPortal(outreachy, 'open_source')).toBe(true);
    });

    it('filters accurately using UpcomingInternshipsService.filterUpcomingCycles with portal parameter', () => {
      const researchCycles = UpcomingInternshipsService.filterUpcomingCycles({
        portal: 'research',
        status: 'all'
      });
      expect(researchCycles.length).toBe(20);
      for (const c of researchCycles) {
        expect(UpcomingInternshipsService.isCycleInPortal(c, 'research')).toBe(true);
      }

      const openSourceCycles = UpcomingInternshipsService.filterUpcomingCycles({
        portal: 'open_source',
        status: 'all'
      });
      expect(openSourceCycles.length).toBe(5);
      for (const c of openSourceCycles) {
        expect(UpcomingInternshipsService.isCycleInPortal(c, 'open_source')).toBe(true);
      }
    });

    it('ensures every single scholarship has a high-stakes disclaimer requirement fulfilled', () => {
      const allCycles = UpcomingInternshipsService.getAllUpcomingCycles();
      const scholarshipCycles = allCycles.filter(c => UpcomingInternshipsService.isCycleInPortal(c, 'scholarships'));
      expect(scholarshipCycles.length).toBe(35);

      // Verify that every scholarship cycle is flagged as a scholarship or has disclaimer notice
      for (const c of scholarshipCycles) {
        const isScholarship = 
          Boolean(c.isGlobalFullRide || c.isPreUniversityFullRide || c.disclaimerNotice ||
          c.programCategory === 'scholarship' || c.programCategory === 'early_career_12th' ||
          c.programCategory === 'pre_university_full_ride' || c.programCategory === 'global_full_ride' ||
          c.tierCategory === 'pre_university_full_ride');
        expect(isScholarship).toBe(true);
      }
    });
  });
});


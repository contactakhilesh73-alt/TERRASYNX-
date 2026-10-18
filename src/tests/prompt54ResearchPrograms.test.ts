import { describe, it, expect } from 'vitest';
import { UpcomingInternshipsService } from '../services/upcomingInternshipsService';
import { isHostnameAllowed } from '../services/linkAllowlistService';

describe('Prompt 54: Premier Research Programs (EPFL Switzerland & Stanford SURF Reference Card)', () => {
  const allCycles = UpcomingInternshipsService.getAllUpcomingCycles(new Date(2026, 9, 18)); // Oct 18, 2026

  it('1. EPFL Life Sciences Summer Research Program meets all specifications', () => {
    const epflLifeSciences = allCycles.find(c => 
      c.id === 'cycle_epfl_life_sciences' || 
      c.programTitle.toLowerCase().includes('epfl life sciences')
    );

    expect(epflLifeSciences).toBeDefined();
    if (!epflLifeSciences) return;

    // Study level: summer_research
    expect(epflLifeSciences.studyLevel).toBe('summer_research');

    // Country: Switzerland
    expect(epflLifeSciences.country).toBe('Switzerland');

    // rateType: MARKET_ESTIMATED
    expect(epflLifeSciences.rateType).toBe('MARKET_ESTIMATED');

    // Official epfl.ch links only
    const url = new URL(epflLifeSciences.officialCareersUrl);
    expect(url.hostname.endsWith('epfl.ch')).toBe(true);
    expect(isHostnameAllowed(url.hostname)).toBe(true);
    expect(epflLifeSciences.companyDomain).toBe('epfl.ch');

    // "confirm on the official page"
    const allText = `${epflLifeSciences.eligibilityCriteria} ${epflLifeSciences.actionTip} ${epflLifeSciences.disclaimerNotice} ${epflLifeSciences.historicalCompensation}`;
    expect(allText.toLowerCase()).toContain('confirm on the official page');

    // "dates reported by aggregators"
    expect(allText.toLowerCase()).toContain('dates reported by aggregators');

    // Deadline reported 15 Nov 2026
    expect(allText.toLowerCase()).toContain('15 nov 2026');
    expect(epflLifeSciences.exactWindowText).toContain('15 Nov 2026');
    expect(epflLifeSciences.endMonth).toBe(11);
    expect(epflLifeSciences.endDay).toBe(15);

    // Stipend reported CHF 3,600 plus airfare support
    expect(allText).toContain('CHF 3,600');
    expect(allText.toLowerCase()).toContain('airfare support');
  });

  it('2. EPFL Excellence in Engineering Internship meets all specifications', () => {
    const epflEee = allCycles.find(c => 
      c.id === 'cycle_epfl_excellence_engineering' || 
      c.programTitle.toLowerCase().includes('excellence in engineering')
    );

    expect(epflEee).toBeDefined();
    if (!epflEee) return;

    // Study level: summer_research
    expect(epflEee.studyLevel).toBe('summer_research');

    // Country: Switzerland
    expect(epflEee.country).toBe('Switzerland');

    // rateType: MARKET_ESTIMATED
    expect(epflEee.rateType).toBe('MARKET_ESTIMATED');

    // Official epfl.ch links only
    const url = new URL(epflEee.officialCareersUrl);
    expect(url.hostname.endsWith('epfl.ch')).toBe(true);
    expect(isHostnameAllowed(url.hostname)).toBe(true);

    // "confirm on the official page"
    const allText = `${epflEee.eligibilityCriteria} ${epflEee.actionTip} ${epflEee.disclaimerNotice} ${epflEee.historicalCompensation}`;
    expect(allText.toLowerCase()).toContain('confirm on the official page');

    // "dates reported by aggregators"
    expect(allText.toLowerCase()).toContain('dates reported by aggregators');

    // Deadline reported 1 Nov 2026
    expect(allText.toLowerCase()).toContain('1 nov 2026');
    expect(epflEee.exactWindowText).toContain('1 Nov 2026');
    expect(epflEee.endMonth).toBe(11);
    expect(epflEee.endDay).toBe(1);
  });

  it('3. Summer@EPFL Computer and Communication Sciences meets all specifications', () => {
    const epflCs = allCycles.find(c => 
      c.id === 'cycle_epfl_summer_ic' || 
      c.programTitle.toLowerCase().includes('summer@epfl')
    );

    expect(epflCs).toBeDefined();
    if (!epflCs) return;

    // Study level: summer_research
    expect(epflCs.studyLevel).toBe('summer_research');

    // Country: Switzerland
    expect(epflCs.country).toBe('Switzerland');

    // rateType: MARKET_ESTIMATED
    expect(epflCs.rateType).toBe('MARKET_ESTIMATED');

    // Official epfl.ch links only
    const url = new URL(epflCs.officialCareersUrl);
    expect(url.hostname.endsWith('epfl.ch')).toBe(true);
    expect(isHostnameAllowed(url.hostname)).toBe(true);

    // "confirm on the official page"
    const allText = `${epflCs.eligibilityCriteria} ${epflCs.actionTip} ${epflCs.disclaimerNotice} ${epflCs.historicalCompensation}`;
    expect(allText.toLowerCase()).toContain('confirm on the official page');

    // "dates reported by aggregators"
    expect(allText.toLowerCase()).toContain('dates reported by aggregators');

    // Deadline reported 29 Nov 2026
    expect(allText.toLowerCase()).toContain('29 nov 2026');
    expect(epflCs.exactWindowText).toContain('29 Nov 2026');
    expect(epflCs.endMonth).toBe(11);
    expect(epflCs.endDay).toBe(29);
  });

  it('4. Stanford SURF Bay Area is added as a reference card and never hidden', () => {
    const stanfordSurf = allCycles.find(c => 
      c.id === 'cycle_stanford_surf_bay_area' || 
      c.programTitle.toLowerCase().includes('stanford surf')
    );

    expect(stanfordSurf).toBeDefined();
    if (!stanfordSurf) return;

    // Country: USA
    expect(stanfordSurf.country).toBe('USA');

    // Reference card & neverHide
    expect(stanfordSurf.isReferenceCard).toBe(true);
    expect(stanfordSurf.neverHide).toBe(true);

    // Verbatim requirement: "US-enrolled undergraduates only; international applicants are not eligible for 2026; stipend $6,000"
    const verbatimText = "US-enrolled undergraduates only; international applicants are not eligible for 2026; stipend $6,000";
    expect(stanfordSurf.eligibility).toContain(verbatimText);
    expect(stanfordSurf.eligibilityCriteria).toContain(verbatimText);
    expect(stanfordSurf.historicalCompensation).toContain(verbatimText);

    // Official stanford.edu domain
    const url = new URL(stanfordSurf.officialCareersUrl);
    expect(url.hostname.endsWith('stanford.edu')).toBe(true);
    expect(isHostnameAllowed(url.hostname)).toBe(true);
  });

  it('5. Verifies all 4 programs are accessible in ResearchPortal and filterable by Switzerland/USA', () => {
    const researchCycles = UpcomingInternshipsService.filterUpcomingCycles({
      portal: 'research',
      status: 'all'
    });

    // EPFL programs in Switzerland
    const swissResearch = researchCycles.filter(c => c.country === 'Switzerland');
    expect(swissResearch.length).toBeGreaterThanOrEqual(3);
    expect(swissResearch.some(c => c.programTitle.includes('Life Sciences'))).toBe(true);
    expect(swissResearch.some(c => c.programTitle.includes('Excellence in Engineering'))).toBe(true);
    expect(swissResearch.some(c => c.programTitle.includes('Summer@EPFL'))).toBe(true);

    // Stanford SURF in USA
    const usaResearch = researchCycles.filter(c => c.country === 'USA');
    expect(usaResearch.some(c => c.id === 'cycle_stanford_surf_bay_area')).toBe(true);
  });
});

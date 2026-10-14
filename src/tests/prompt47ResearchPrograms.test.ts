import { describe, it, expect } from 'vitest';
import { UpcomingInternshipsService } from '../services/upcomingInternshipsService';
import { isHostnameAllowed } from '../services/linkAllowlistService';

describe('Prompt 47: Research Programs (Caltech SURF & S.N. Bose Scholars Program)', () => {
  const allCycles = UpcomingInternshipsService.getAllUpcomingCycles(new Date(2026, 8, 20));

  it('includes Caltech SURF with all required specifications and official domain', () => {
    const surf = allCycles.find(c => 
      c.id === 'cycle_caltech_surf' || 
      c.programTitle.toLowerCase().includes('caltech surf') ||
      c.companyName.toLowerCase() === 'caltech'
    );

    expect(surf).toBeDefined();
    if (!surf) return;

    // 1. Country: USA
    expect(surf.country).toBe('USA');

    // 2. Study level: summer research
    expect(surf.studyLevel).toBe('summer_research');

    // 3. Duration: 10 weeks mid-June to August
    expect(surf.expectedWindowDuration.toLowerCase()).toContain('10 weeks');
    expect(surf.annualRecurrencePattern.toLowerCase()).toContain('mid-june to august');

    // 4. Stipend: $8,110 for the 2026 cycle
    expect(surf.historicalCompensation).toContain('$8,110');
    expect(surf.historicalCompensation).toContain('2026 cycle');

    // 5. rateType: MARKET_ESTIMATED
    expect(surf.rateType).toBe('MARKET_ESTIMATED');

    // 6. Deadline: typically late February
    expect(surf.exactWindowText?.toLowerCase()).toContain('late february');
    expect(surf.endMonth).toBe(2);

    // 7. Student must find a Caltech mentor
    expect(surf.eligibilityCriteria.toLowerCase()).toContain('caltech mentor');

    // 8. International funding depends on the mentor: "confirm on the official page"
    expect(surf.eligibilityCriteria).toContain('confirm on the official page');
    expect(surf.historicalCompensation).toContain('confirm on the official page');
    expect(surf.actionTip).toContain('confirm on the official page');

    // 9. Official domains only
    const officialUrl = new URL(surf.officialCareersUrl);
    expect(officialUrl.hostname.endsWith('caltech.edu')).toBe(true);
    expect(isHostnameAllowed(officialUrl.hostname)).toBe(true);
    expect(surf.companyDomain).toBe('caltech.edu');
  });

  it('includes S.N. Bose Scholars Program with all required specifications and official domain', () => {
    const snBose = allCycles.find(c => 
      c.id === 'cycle_sn_bose_scholars' || 
      c.programTitle.toLowerCase().includes('s.n. bose') ||
      c.companyName.toLowerCase().includes('s.n. bose')
    );

    expect(snBose).toBeDefined();
    if (!snBose) return;

    // 1. Country: India to USA
    expect(snBose.country).toBe('India to USA');

    // 2. Study level / Eligibility: UG/PG, summer research
    expect(snBose.studyLevel).toBe('summer_research');
    expect(snBose.eligibility?.toLowerCase()).toContain('ug/pg');
    expect(snBose.eligibilityCriteria.toLowerCase()).toContain('bachelor or master');

    // 3. Duration: 10-12 weeks
    expect(snBose.expectedWindowDuration).toContain('10-12 weeks');

    // 4. Compensation: stipend + insurance + airfare, no amount shown
    expect(snBose.historicalCompensation.toLowerCase()).toContain('stipend');
    expect(snBose.historicalCompensation.toLowerCase()).toContain('insurance');
    expect(snBose.historicalCompensation.toLowerCase()).toContain('airfare');
    expect(snBose.historicalCompensation.toLowerCase()).toContain('no amount shown');

    // 5. Institute nomination plus IUSSTF portal
    expect(snBose.eligibilityCriteria.toLowerCase()).toContain('institute nomination plus');
    expect(snBose.eligibilityCriteria.toLowerCase()).toContain('iusstf portal');
    expect(snBose.actionTip.toLowerCase()).toContain('institute nomination plus iusstf portal');

    // 6. Window: typically September-October: "check iusstf.org.in now"
    expect(snBose.startMonth).toBe(9); // September
    expect(snBose.endMonth).toBe(10);  // October
    expect(snBose.eligibilityCriteria).toContain('check iusstf.org.in now');
    expect(snBose.exactWindowText).toContain('check iusstf.org.in now');
    expect(snBose.actionTip).toContain('check iusstf.org.in now');

    // 7. Official domains only
    const officialUrl = new URL(snBose.officialCareersUrl);
    expect(officialUrl.hostname.endsWith('iusstf.org.in') || officialUrl.hostname.endsWith('iusstf.org')).toBe(true);
    expect(isHostnameAllowed(officialUrl.hostname)).toBe(true);
    expect(snBose.companyDomain).toBe('iusstf.org.in');
  });

  it('verifies both programs are accessible in the Research Portal filter', () => {
    const research = allCycles.filter(cycle => (
      cycle.tierCategory === 'scientific_lab' ||
      cycle.tierCategory === 'academic_fellowship' ||
      cycle.programCategory === 'scientific_lab' ||
      cycle.programCategory === 'academic_fellowship'
    ));

    const caltech = research.find(c => c.companyName === 'Caltech');
    const snBose = research.find(c => c.companyName.includes('S.N. Bose'));

    expect(caltech).toBeDefined();
    expect(snBose).toBeDefined();
  });
});

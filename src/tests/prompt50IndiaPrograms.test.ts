import { describe, it, expect } from 'vitest';
import { UpcomingInternshipsService } from '../services/upcomingInternshipsService';
import { isHostnameAllowed } from '../services/linkAllowlistService';

describe('Prompt 50: India ke Programs (TIFR VSRP, DRDO Paid Internship, ISRO Internships)', () => {
  const allCycles = UpcomingInternshipsService.getAllUpcomingCycles(new Date(2026, 8, 20));

  it('includes TIFR VSRP with all Prompt 50 specifications', () => {
    const tifr = allCycles.find(c => 
      c.id === 'cycle_tifr_vsrp' || 
      c.programTitle.toLowerCase().includes('tifr vsrp') ||
      c.companyName === 'TIFR'
    );

    expect(tifr).toBeDefined();
    if (!tifr) return;

    // Recurring entry
    expect(tifr.id).toBe('cycle_tifr_vsrp');

    // studyLevel: 'summer_research'
    expect(tifr.studyLevel).toBe('summer_research');

    // country: 'India'
    expect(tifr.country).toBe('India');

    // rateType: MARKET_ESTIMATED
    expect(tifr.rateType).toBe('MARKET_ESTIMATED');

    // month-only windows (no day numbers in announcement/window text)
    expect(tifr.expectedAnnouncementMonth).toBe('January - February');
    expect(tifr.exactWindowText).toContain('January – February');
    expect(tifr.exactWindowText).not.toMatch(/\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i);

    // Official links only
    const officialUrl = new URL(tifr.officialCareersUrl);
    expect(officialUrl.hostname.endsWith('tifr.res.in')).toBe(true);
    expect(isHostnameAllowed(officialUrl.hostname)).toBe(true);
    expect(tifr.companyDomain).toBe('tifr.res.in');

    // Note that each centre runs its own program and window (Hyderabad, NCRA Pune, School of Mathematics Mumbai)
    const combinedText = [
      tifr.eligibility,
      tifr.eligibilityCriteria,
      tifr.historicalCompensation,
      tifr.coverageBreakdown,
      tifr.actionTip,
      tifr.disclaimerNotice,
      tifr.annualRecurrencePattern
    ].join(' ').toLowerCase();

    expect(combinedText).toContain('hyderabad');
    expect(combinedText).toContain('ncra');
    expect(combinedText).toContain('pune');
    expect(combinedText).toContain('school of mathematics mumbai');
    expect(combinedText).toContain('each centre runs its own program and window');

    // Stipend about Rs 9,000 per month where listed
    expect(combinedText).toContain('rs 9,000');

    // "confirm on each centre's official page"
    expect(combinedText).toContain("confirm on each centre's official page");
  });

  it('includes DRDO Paid Internship Scheme with all Prompt 50 specifications', () => {
    const drdo = allCycles.find(c => 
      c.id === 'cycle_drdo_internship_scheme' || 
      c.programTitle.toLowerCase().includes('drdo paid internship') ||
      c.companyName === 'DRDO'
    );

    expect(drdo).toBeDefined();
    if (!drdo) return;

    // Recurring entry
    expect(drdo.id).toBe('cycle_drdo_internship_scheme');

    // studyLevel: 'summer_research'
    expect(drdo.studyLevel).toBe('summer_research');

    // country: 'India'
    expect(drdo.country).toBe('India');

    // rateType: MARKET_ESTIMATED
    expect(drdo.rateType).toBe('MARKET_ESTIMATED');

    // month-only windows
    expect(drdo.expectedAnnouncementMonth).toBe('March - April');
    expect(drdo.exactWindowText).toContain('March – April');
    expect(drdo.exactWindowText).not.toMatch(/\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i);

    // Official links only
    const officialUrl = new URL(drdo.officialCareersUrl);
    expect(officialUrl.hostname.endsWith('drdo.gov.in')).toBe(true);
    expect(isHostnameAllowed(officialUrl.hostname)).toBe(true);
    expect(drdo.companyDomain).toBe('drdo.gov.in');

    const combinedText = [
      drdo.eligibility,
      drdo.eligibilityCriteria,
      drdo.historicalCompensation,
      drdo.coverageBreakdown,
      drdo.actionTip,
      drdo.disclaimerNotice
    ].join(' ').toLowerCase();

    // Indian nationals
    expect(combinedText).toContain('indian nationals');

    // Each lab publishes its own advertisement on drdo.gov.in
    expect(combinedText).toContain('each lab publishes its own advertisement on drdo.gov.in');

    // Stipend as listed in the lab advertisement (some lab ads list Rs 5,000 per month; do not state a single figure)
    expect(combinedText).toContain('stipend as listed in the lab advertisement');
    expect(combinedText).toContain('some lab ads list rs 5,000 per month');
    expect(combinedText).toContain('do not state a single figure');
  });

  it('includes ISRO Internships (VSSC, IIRS) with all Prompt 50 specifications', () => {
    const isro = allCycles.find(c => 
      c.id === 'cycle_isro_internships' || 
      c.programTitle.toLowerCase().includes('isro internships') ||
      c.companyName === 'ISRO'
    );

    expect(isro).toBeDefined();
    if (!isro) return;

    // Recurring entry
    expect(isro.id).toBe('cycle_isro_internships');

    // studyLevel: 'summer_research'
    expect(isro.studyLevel).toBe('summer_research');

    // country: 'India'
    expect(isro.country).toBe('India');

    // rateType: MARKET_ESTIMATED
    expect(isro.rateType).toBe('MARKET_ESTIMATED');

    // month-only windows
    expect(isro.expectedAnnouncementMonth).toContain('April - May');
    expect(isro.exactWindowText).toContain('April – May');
    expect(isro.exactWindowText).not.toMatch(/\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i);

    // Official links only
    const officialUrl = new URL(isro.officialCareersUrl);
    expect(officialUrl.hostname.endsWith('isro.gov.in')).toBe(true);
    expect(isHostnameAllowed(officialUrl.hostname)).toBe(true);
    expect(isro.companyDomain).toBe('isro.gov.in');

    const combinedText = [
      isro.eligibility,
      isro.eligibilityCriteria,
      isro.historicalCompensation,
      isro.coverageBreakdown,
      isro.actionTip,
      isro.disclaimerNotice
    ].join(' ').toLowerCase();

    // Indian nationals
    expect(combinedText).toContain('indian nationals');

    // No stipend
    expect(combinedText).toContain('no stipend');

    // Per-centre windows
    expect(combinedText).toContain('per-centre windows');

    // VSSC minimum 60 percent or 6.32 CGPA as listed
    expect(combinedText).toContain('vssc minimum 60 percent or 6.32 cgpa as listed');
  });

  it('ensures all three programs are filtered accurately under summer_research studyLevel', () => {
    const summerResearchCycles = allCycles.filter(c => c.studyLevel === 'summer_research');

    const tifr = summerResearchCycles.find(c => c.id === 'cycle_tifr_vsrp');
    const drdo = summerResearchCycles.find(c => c.id === 'cycle_drdo_internship_scheme');
    const isro = summerResearchCycles.find(c => c.id === 'cycle_isro_internships');

    expect(tifr).toBeDefined();
    expect(drdo).toBeDefined();
    expect(isro).toBeDefined();

    expect(tifr?.country).toBe('India');
    expect(drdo?.country).toBe('India');
    expect(isro?.country).toBe('India');
  });
});

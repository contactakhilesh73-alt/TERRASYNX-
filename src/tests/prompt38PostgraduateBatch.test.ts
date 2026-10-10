import { describe, it, expect } from 'vitest';
import { UpcomingInternshipsService } from '../services/upcomingInternshipsService';

describe('Prompt 38: Postgraduate Scholarships Batch', () => {
  const allCycles = UpcomingInternshipsService.getAllUpcomingCycles();

  const POSTGRADUATE_TARGETS = [
    {
      id: 'cycle_rhodes_scholarship_india',
      nameMatch: 'Rhodes',
      domain: 'rhodeshouse.ox.ac.uk',
      expectedCoverage: 'FULL_RIDE',
    },
    {
      id: 'cycle_gates_cambridge_scholarship',
      nameMatch: 'Gates Cambridge',
      domain: 'gatescambridge.org',
      expectedCoverage: 'FULL_RIDE',
    },
    {
      id: 'cycle_knight_hennessy_scholars',
      nameMatch: 'Knight-Hennessy',
      domain: 'knight-hennessy.stanford.edu',
      expectedCoverage: 'FULL_RIDE',
    },
    {
      id: 'cycle_schwarzman_scholars',
      nameMatch: 'Schwarzman',
      domain: 'schwarzmanscholars.org',
      expectedCoverage: 'FULL_RIDE',
    },
    {
      id: 'cycle_fulbright_nehru_fellowships',
      nameMatch: 'Fulbright',
      domain: 'usief.org.in',
      expectedCoverage: 'FULL_RIDE',
    },
    {
      id: 'cycle_commonwealth_scholarship_uk',
      nameMatch: 'Commonwealth',
      domain: 'cscuk.fcdo.gov.uk',
      expectedCoverage: 'FULL_RIDE',
    },
    {
      id: 'cycle_inlaks_scholarships',
      nameMatch: 'Inlaks',
      domain: 'inlaksfoundation.org',
      expectedCoverage: 'FULL_TUITION',
    },
    {
      id: 'cycle_erasmus_mundus_joint_masters',
      nameMatch: 'Erasmus Mundus',
      domain: 'erasmus-plus.ec.europa.eu',
      expectedCoverage: 'FULL_RIDE',
    },
    {
      id: 'cycle_mext_postgraduate_scholarship',
      nameMatch: 'MEXT',
      domain: 'studyinjapan.go.jp',
      expectedCoverage: 'FULL_RIDE',
    },
  ];

  it('contains all 9 specified postgraduate scholarships', () => {
    POSTGRADUATE_TARGETS.forEach(target => {
      const found = allCycles.find(c => c.id === target.id);
      expect(found, `Scholarship ${target.id} should exist`).toBeDefined();
      expect(
        found!.programTitle.toLowerCase() + ' ' + found!.companyName.toLowerCase(),
      ).toContain(target.nameMatch.toLowerCase());
    });
  });

  it('assigns studyLevel "postgraduate" to all 9 scholarships', () => {
    POSTGRADUATE_TARGETS.forEach(target => {
      const found = allCycles.find(c => c.id === target.id)!;
      expect(found.studyLevel).toBe('postgraduate');
    });
  });

  it('enforces rateType MARKET_ESTIMATED with ranges and no exact figures', () => {
    POSTGRADUATE_TARGETS.forEach(target => {
      const found = allCycles.find(c => c.id === target.id)!;
      expect(found.rateType).toBe('MARKET_ESTIMATED');

      // Must have fundingAmountText and historicalCompensation with range indicators
      expect(found.fundingAmountText).toBeDefined();
      expect(found.historicalCompensation).toBeDefined();

      const combinedComp = `${found.fundingAmountText} ${found.historicalCompensation}`;
      // Should have range indicators like '-' or '–' or 'to' or 'Up to'
      const hasRange = /[-–—]|up to|\bto\b/i.test(combinedComp);
      expect(hasRange, `Expected range for ${found.id}, got: ${combinedComp}`).toBe(true);

      // Must explicitly describe market estimate / total value
      expect(
        found.fundingAmountText!.toLowerCase(),
      ).toMatch(/estimated|max|range/i);
    });
  });

  it('enforces deadlines formatted as month only (no specific day numbers in deadlines)', () => {
    POSTGRADUATE_TARGETS.forEach(target => {
      const found = allCycles.find(c => c.id === target.id)!;

      // Announcement month should be month only
      expect(found.expectedAnnouncementMonth).toBeDefined();
      expect(found.expectedAnnouncementMonth).not.toMatch(/\b\d{1,2}(st|nd|rd|th)?\b/);

      // exactWindowText should state deadline as month only
      expect(found.exactWindowText).toBeDefined();
      expect(found.exactWindowText).toMatch(/Deadline:\s+[A-Za-z]+/);
      expect(found.exactWindowText).not.toMatch(/\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);

      // timelinePhases should only reference months
      expect(found.timelinePhases?.announcementMonth).not.toMatch(/\b\d{1,2}(st|nd|rd|th)?\b/);
      expect(found.timelinePhases?.assessmentMonth).toMatch(/(January|February|March|April|May|June|July|August|September|October|November|December)/i);
    });
  });

  it('enforces official-domain links only for all 9 scholarships', () => {
    POSTGRADUATE_TARGETS.forEach(target => {
      const found = allCycles.find(c => c.id === target.id)!;

      expect(found.officialCareersUrl).toBeDefined();
      expect(found.officialCareersUrl.startsWith('https://')).toBe(true);

      const url = new URL(found.officialCareersUrl);
      const hostname = url.hostname.toLowerCase();

      expect(hostname.endsWith(target.domain) || hostname.includes(target.domain.split('.')[0])).toBe(true);
      expect(found.companyDomain).toBe(target.domain);
    });
  });

  it('enforces prominent high-stakes disclaimer on every card', () => {
    POSTGRADUATE_TARGETS.forEach(target => {
      const found = allCycles.find(c => c.id === target.id)!;

      expect(found.disclaimerNotice).toBeDefined();
      expect(found.disclaimerNotice!.length).toBeGreaterThan(40);
      expect(found.disclaimerNotice!.toLowerCase()).toContain('high-stakes');
      expect(found.disclaimerNotice!.toLowerCase()).toContain('official');
      expect(found.disclaimerNotice!.toLowerCase()).toContain('advisory');
    });
  });

  it('guarantees accurate coverageType and conservative classification', () => {
    POSTGRADUATE_TARGETS.forEach(target => {
      const found = allCycles.find(c => c.id === target.id)!;
      expect(found.coverageType).toBe(target.expectedCoverage);
    });

    // Inlaks is conservatively capped, must NOT be mislabeled as FULL_RIDE
    const inlaks = allCycles.find(c => c.id === 'cycle_inlaks_scholarships')!;
    expect(inlaks.coverageType).toBe('FULL_TUITION');
    expect(inlaks.coverageType).not.toBe('FULL_RIDE');
  });

  it('allows postgraduate filtering in the scholarships portal dataset', () => {
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

    // Total scholarships is at least 44 (46 with Prompt 39 undergrad merit batch)
    expect(scholarshipCycles.length).toBe(46);

    // Postgraduate subset contains all 9 new scholarships plus 4 pre-existing schemes
    const pgScholarships = scholarshipCycles.filter(c => c.studyLevel === 'postgraduate');
    expect(pgScholarships.length).toBe(13);

    POSTGRADUATE_TARGETS.forEach(target => {
      const foundInPg = pgScholarships.find(c => c.id === target.id);
      expect(foundInPg, `Target ${target.id} should appear in postgraduate filter`).toBeDefined();
    });
  });
});

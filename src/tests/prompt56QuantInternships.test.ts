import { describe, it, expect } from 'vitest';
import { UpcomingInternshipsService } from '../services/upcomingInternshipsService';
import { isHostnameAllowed } from '../services/linkAllowlistService';

describe('Prompt 56: Premier Quant Internships', () => {
  const allCycles = UpcomingInternshipsService.getAllUpcomingCycles(new Date(2026, 8, 20)); // Sept 20, 2026
  const requiredDisclaimer = 'Base pay as shown in job ads checked September 2026; varies by office; visa and eligibility not verified; highly selective';

  it('1. Hudson River Trading (HRT) meets all specifications', () => {
    const hrt = allCycles.find(c => c.id === 'cycle_hrt_quant_intern');
    expect(hrt).toBeDefined();
    if (!hrt) return;

    expect(hrt.companyName).toBe('Hudson River Trading');
    expect(hrt.tierCategory).toBe('quant_hft');
    expect(hrt.rateType).toBe('MARKET_ESTIMATED');

    const text = `${hrt.eligibilityCriteria} ${hrt.historicalCompensation} ${hrt.disclaimerNotice} ${hrt.actionTip} ${hrt.coverageBreakdown}`;
    expect(text).toContain(requiredDisclaimer);
    expect(text).toContain('New York $5,800 per week, Singapore SGD 7,650 per week, London GBP 4,350 per week');

    // Do not convert to hourly figures
    expect(hrt.historicalCompensation).not.toMatch(/\$\d+(\.\d+)?\/hr/i);
    expect(hrt.historicalCompensation).not.toMatch(/\$\d+(\.\d+)?\s+per\s+hour/i);

    // Official domain
    const url = new URL(hrt.officialCareersUrl);
    expect(url.hostname).toContain('hudsonrivertrading.com');
    expect(isHostnameAllowed(url.hostname)).toBe(true);
  });

  it('2. Jane Street Quant Research meets all specifications', () => {
    const js = allCycles.find(c => c.id === 'cycle_jane_street_quant_research_intern');
    expect(js).toBeDefined();
    if (!js) return;

    expect(js.companyName).toBe('Jane Street');
    expect(js.tierCategory).toBe('quant_hft');
    expect(js.rateType).toBe('MARKET_ESTIMATED');

    const text = `${js.eligibilityCriteria} ${js.historicalCompensation} ${js.disclaimerNotice} ${js.actionTip} ${js.coverageBreakdown}`;
    expect(text).toContain(requiredDisclaimer);
    expect(text).toContain('New York quant research $300,000 yearly base');

    // Do not convert to hourly figures
    expect(js.historicalCompensation).not.toMatch(/\$\d+(\.\d+)?\/hr/i);
    expect(js.historicalCompensation).not.toMatch(/\$\d+(\.\d+)?\s+per\s+hour/i);

    // Official domain
    const url = new URL(js.officialCareersUrl);
    expect(url.hostname).toContain('janestreet.com');
    expect(isHostnameAllowed(url.hostname)).toBe(true);
  });

  it('3. IMC meets all specifications', () => {
    const imc = allCycles.find(c => c.id === 'cycle_imc_quant_research_intern');
    expect(imc).toBeDefined();
    if (!imc) return;

    expect(imc.companyName).toBe('IMC');
    expect(imc.tierCategory).toBe('quant_hft');
    expect(imc.rateType).toBe('MARKET_ESTIMATED');

    const text = `${imc.eligibilityCriteria} ${imc.historicalCompensation} ${imc.disclaimerNotice} ${imc.actionTip} ${imc.coverageBreakdown}`;
    expect(text).toContain(requiredDisclaimer);
    expect(text).toContain('Chicago quant research (BS/MS) $250,000 stated base');

    // Do not convert to hourly figures
    expect(imc.historicalCompensation).not.toMatch(/\$\d+(\.\d+)?\/hr/i);
    expect(imc.historicalCompensation).not.toMatch(/\$\d+(\.\d+)?\s+per\s+hour/i);

    // Official domain
    const url = new URL(imc.officialCareersUrl);
    expect(url.hostname).toContain('imc.com');
    expect(isHostnameAllowed(url.hostname)).toBe(true);
  });

  it('4. Optiver meets all specifications', () => {
    const optiver = allCycles.find(c => c.id === 'cycle_optiver_quant_intern');
    expect(optiver).toBeDefined();
    if (!optiver) return;

    expect(optiver.companyName).toBe('Optiver');
    expect(optiver.tierCategory).toBe('quant_hft');
    expect(optiver.rateType).toBe('MARKET_ESTIMATED');

    const text = `${optiver.eligibilityCriteria} ${optiver.historicalCompensation} ${optiver.disclaimerNotice} ${optiver.actionTip} ${optiver.coverageBreakdown}`;
    expect(text).toContain(requiredDisclaimer);
    expect(text).toContain('Chicago $70,000-$88,000 base');

    // Do not convert to hourly figures
    expect(optiver.historicalCompensation).not.toMatch(/\$\d+(\.\d+)?\/hr/i);
    expect(optiver.historicalCompensation).not.toMatch(/\$\d+(\.\d+)?\s+per\s+hour/i);

    // Official domain
    const url = new URL(optiver.officialCareersUrl);
    expect(url.hostname).toContain('optiver.com');
    expect(isHostnameAllowed(url.hostname)).toBe(true);
  });

  it('5. Jump meets all specifications', () => {
    const jump = allCycles.find(c => c.id === 'cycle_jump_quant_intern');
    expect(jump).toBeDefined();
    if (!jump) return;

    expect(jump.companyName).toBe('Jump');
    expect(jump.tierCategory).toBe('quant_hft');
    expect(jump.rateType).toBe('MARKET_ESTIMATED');

    const text = `${jump.eligibilityCriteria} ${jump.historicalCompensation} ${jump.disclaimerNotice} ${jump.actionTip} ${jump.coverageBreakdown}`;
    expect(text).toContain(requiredDisclaimer);
    expect(text).toContain('$300,000 yearly base');

    // Do not convert to hourly figures
    expect(jump.historicalCompensation).not.toMatch(/\$\d+(\.\d+)?\/hr/i);
    expect(jump.historicalCompensation).not.toMatch(/\$\d+(\.\d+)?\s+per\s+hour/i);

    // Official domain
    const url = new URL(jump.officialCareersUrl);
    expect(url.hostname).toContain('jumptrading.com');
    expect(isHostnameAllowed(url.hostname)).toBe(true);
  });

  it('6. Tower Research and Five Rings meet all specifications with "pay not verified"', () => {
    const tower = allCycles.find(c => c.id === 'cycle_tower_research_quant_intern');
    expect(tower).toBeDefined();
    if (!tower) return;

    expect(tower.companyName).toBe('Tower Research');
    expect(tower.tierCategory).toBe('quant_hft');
    expect(tower.rateType).toBe('MARKET_ESTIMATED');

    const towerText = `${tower.eligibilityCriteria} ${tower.historicalCompensation} ${tower.disclaimerNotice} ${tower.actionTip} ${tower.coverageBreakdown}`.toLowerCase();
    expect(towerText).toContain(requiredDisclaimer.toLowerCase());
    expect(towerText).toContain('pay not verified');

    const fiveRings = allCycles.find(c => c.id === 'cycle_five_rings_quant_intern');
    expect(fiveRings).toBeDefined();
    if (!fiveRings) return;

    expect(fiveRings.companyName).toBe('Five Rings');
    expect(fiveRings.tierCategory).toBe('quant_hft');
    expect(fiveRings.rateType).toBe('MARKET_ESTIMATED');

    const fiveRingsText = `${fiveRings.eligibilityCriteria} ${fiveRings.historicalCompensation} ${fiveRings.disclaimerNotice} ${fiveRings.actionTip} ${fiveRings.coverageBreakdown}`.toLowerCase();
    expect(fiveRingsText).toContain(requiredDisclaimer.toLowerCase());
    expect(fiveRingsText).toContain('pay not verified');

    // Do not convert to hourly figures
    expect(tower.historicalCompensation).not.toMatch(/\$\d+(\.\d+)?\/hr/i);
    expect(fiveRings.historicalCompensation).not.toMatch(/\$\d+(\.\d+)?\/hr/i);

    // Official domains
    expect(isHostnameAllowed(new URL(tower.officialCareersUrl).hostname)).toBe(true);
    expect(isHostnameAllowed(new URL(fiveRings.officialCareersUrl).hostname)).toBe(true);
  });

  it('7. Verifies all 7 quant internships appear in the quant_hft category filter', () => {
    const quantCycles = UpcomingInternshipsService.filterUpcomingCycles({
      category: 'quant_hft',
      status: 'all'
    });

    const ids = quantCycles.map(c => c.id);
    expect(ids).toContain('cycle_hrt_quant_intern');
    expect(ids).toContain('cycle_jane_street_quant_research_intern');
    expect(ids).toContain('cycle_imc_quant_research_intern');
    expect(ids).toContain('cycle_optiver_quant_intern');
    expect(ids).toContain('cycle_jump_quant_intern');
    expect(ids).toContain('cycle_tower_research_quant_intern');
    expect(ids).toContain('cycle_five_rings_quant_intern');

    // All belong to corporate internships portal
    for (const id of [
      'cycle_hrt_quant_intern',
      'cycle_jane_street_quant_research_intern',
      'cycle_imc_quant_research_intern',
      'cycle_optiver_quant_intern',
      'cycle_jump_quant_intern',
      'cycle_tower_research_quant_intern',
      'cycle_five_rings_quant_intern',
    ]) {
      const cycle = allCycles.find(c => c.id === id);
      expect(cycle).toBeDefined();
      if (cycle) {
        expect(UpcomingInternshipsService.isCycleInPortal(cycle, 'internships')).toBe(true);
      }
    }
  });
});

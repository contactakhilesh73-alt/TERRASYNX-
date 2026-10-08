import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FundedCompanyDiscoveryService } from '../services/fundedCompanyDiscoveryService';
import { BuiltInScannerService } from '../services/builtInScannerService';
import { SingaporeGovScannerService } from '../services/singaporeGovScannerService';

describe('Prompt 35: Zero Hardcoded/Fabricated Fallback Anchors', () => {
  const originalFetch = globalThis.fetch;
  const storageMock: Record<string, string> = {};

  beforeEach(() => {
    Object.keys(storageMock).forEach(k => delete storageMock[k]);
    globalThis.localStorage = {
      getItem: (key: string) => storageMock[key] || null,
      setItem: (key: string, val: string) => { storageMock[key] = String(val); },
      removeItem: (key: string) => { delete storageMock[key]; },
      clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); },
      key: () => null,
      length: 0,
    } as any;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('strictly ensures KNOWN_FUNDED_ANCHORS is deleted from FundedCompanyDiscoveryService', () => {
    expect((FundedCompanyDiscoveryService as any).KNOWN_FUNDED_ANCHORS).toBeUndefined();
  });

  it('strictly ensures VERIFIED_BUILTIN_ANCHORS is deleted from BuiltInScannerService', () => {
    expect((BuiltInScannerService as any).VERIFIED_BUILTIN_ANCHORS).toBeUndefined();
  });

  it('strictly ensures VERIFIED_SINGAPORE_ANCHORS is deleted from SingaporeGovScannerService', () => {
    expect((SingaporeGovScannerService as any).VERIFIED_SINGAPORE_ANCHORS).toBeUndefined();
  });

  it('FundedCompanyDiscoveryService returns empty list when live source fails or is offline', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Live feed offline'));

    const candidates = await FundedCompanyDiscoveryService.fetchRecentFundingNews();
    expect(candidates).toEqual([]);
    expect(candidates.length).toBe(0);

    const opps = await FundedCompanyDiscoveryService.discoverFundedOpportunities(true);
    expect(opps).toEqual([]);
    expect(opps.length).toBe(0);
  });

  it('BuiltInScannerService returns empty list when live source fails or is offline', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Live feed offline'));

    const raw = await BuiltInScannerService.fetchHubListings('Remote', 'internship');
    expect(raw).toEqual([]);
    expect(raw.length).toBe(0);

    const opps = await BuiltInScannerService.scanBuiltInRoles(true, 'Remote', 'internship');
    expect(opps).toEqual([]);
    expect(opps.length).toBe(0);
  });

  it('SingaporeGovScannerService returns empty list when live source fails or is offline', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Live feed offline'));

    const raw = await SingaporeGovScannerService.fetchSingaporeJobs('all');
    expect(raw).toEqual([]);
    expect(raw.length).toBe(0);

    const opps = await SingaporeGovScannerService.scanSingaporeRoles(true, 'all');
    expect(opps).toEqual([]);
    expect(opps.length).toBe(0);
  });
});

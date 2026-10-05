/**
 * TERRASYNX: Auto-Discover (Company Name → ATS Board) [PROMPT 28]
 * Automatically resolves a company name to its verified public ATS board
 * across Greenhouse, Lever, SmartRecruiters, and Workable without Playwright.
 */

import { ATSCompanyTarget, AtsProvider } from '../data/atsTargets';
import { logger } from '../utils/logger';

export interface AtsDiscoveryResult {
  companyName: string;
  found: boolean;
  provider?: AtsProvider;
  slug?: string;
  domain?: string;
  logo?: string;
  boardUrl?: string;
  jobCount?: number;
  sampleRoles?: string[];
  testedSlugs?: string[];
  message?: string;
  alreadyTracked?: boolean;
}

export class AtsDiscoveryService {
  /**
   * Generates intelligent slug candidates from a company name
   */
  public static generateCandidateSlugs(name: string): string[] {
    const raw = (name || '').trim().toLowerCase();
    if (!raw) return [];

    const clean = raw.replace(/[^a-z0-9]/g, '');
    const hyphenated = raw.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const underscored = raw.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

    const candidates = new Set<string>();

    if (clean) candidates.add(clean);
    if (hyphenated && hyphenated !== clean) candidates.add(hyphenated);
    if (underscored && underscored !== clean && underscored !== hyphenated) candidates.add(underscored);

    // Common corporate suffixes stripped
    const stripped = raw
      .replace(/\b(inc|llc|ltd|corp|corporation|technologies|technology|labs|hq|group|software|co)\b/gi, '')
      .trim()
      .replace(/[^a-z0-9]/g, '');
    if (stripped && stripped.length >= 2) {
      candidates.add(stripped);
    }

    // High probability ATS slug additions
    if (clean.length >= 3) {
      candidates.add(`${clean}ai`);
      candidates.add(`${clean}tech`);
      candidates.add(`${clean}hq`);
      candidates.add(`${clean}labs`);
      candidates.add(`${clean}group`);
    }

    return Array.from(candidates);
  }

  /**
   * Helper fetch with strict abort timeout
   */
  private static async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 3000): Promise<Response | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      try {
        controller.abort();
      } catch {
        // no-op
      }
    }, timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch {
      clearTimeout(timeoutId);
      return null;
    }
  }

  /**
   * Probes Greenhouse for a candidate slug
   */
  private static async probeGreenhouse(slug: string): Promise<{ jobCount: number; sampleRoles: string[]; boardUrl: string } | null> {
    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`;
      const res = await this.fetchWithTimeout(url, { headers: { 'Accept': 'application/json' } }, 2500);
      if (!res || !res.ok) return null;
      const data = await res.json();
      if (data && Array.isArray(data.jobs) && data.jobs.length > 0) {
        return {
          jobCount: data.jobs.length,
          sampleRoles: data.jobs.slice(0, 4).map((j: any) => j.title || 'Role'),
          boardUrl: `https://job-boards.greenhouse.io/${slug}`,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Probes Lever for a candidate slug
   */
  private static async probeLever(slug: string): Promise<{ jobCount: number; sampleRoles: string[]; boardUrl: string } | null> {
    try {
      const url = `https://api.lever.co/v0/postings/${slug}?mode=json`;
      const res = await this.fetchWithTimeout(url, { headers: { 'Accept': 'application/json' } }, 2500);
      if (!res || !res.ok) return null;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return {
          jobCount: data.length,
          sampleRoles: data.slice(0, 4).map((j: any) => j.text || 'Role'),
          boardUrl: `https://jobs.lever.co/${slug}`,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Probes SmartRecruiters for a candidate slug
   */
  private static async probeSmartRecruiters(slug: string): Promise<{ jobCount: number; sampleRoles: string[]; boardUrl: string } | null> {
    try {
      let url = `https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=10`;
      let res = await this.fetchWithTimeout(url, { headers: { 'Accept': 'application/json' } }, 2500);
      if (!res || !res.ok) return null;
      let data = await res.json();

      // If empty content, attempt query with software
      if ((!data.content || data.content.length === 0)) {
        url = `https://api.smartrecruiters.com/v1/companies/${slug}/postings?q=software&limit=10`;
        res = await this.fetchWithTimeout(url, { headers: { 'Accept': 'application/json' } }, 2500);
        if (res && res.ok) {
          data = await res.json();
        }
      }

      if (data && Array.isArray(data.content) && data.content.length > 0) {
        return {
          jobCount: data.totalFound || data.content.length,
          sampleRoles: data.content.slice(0, 4).map((j: any) => j.name || 'Role'),
          boardUrl: `https://jobs.smartrecruiters.com/${slug}`,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Probes Workable for a candidate slug
   */
  private static async probeWorkable(slug: string): Promise<{ jobCount: number; sampleRoles: string[]; boardUrl: string } | null> {
    try {
      const url = `https://apply.workable.com/api/v3/accounts/${slug}/jobs`;
      const res = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({}),
      }, 2500);
      if (!res || !res.ok) return null;
      const data = await res.json();
      if (data && Array.isArray(data.results) && data.results.length > 0) {
        return {
          jobCount: data.results.length,
          sampleRoles: data.results.slice(0, 4).map((j: any) => j.title || 'Role'),
          boardUrl: `https://apply.workable.com/${slug}`,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Primary entry point requested in PROMPT 28:
   * companyNameToAtsBoard(companyName: string)
   * Tries standard URL patterns across Greenhouse, Lever, SmartRecruiters, Workable
   * and uses whichever one returns a successful response first.
   */
  public static async companyNameToAtsBoard(companyName: string): Promise<AtsDiscoveryResult> {
    const trimmed = (companyName || '').trim();
    if (!trimmed) {
      return {
        companyName: '',
        found: false,
        message: 'Please provide a valid company name.',
      };
    }

    // 1. Try server-side discovery proxy first (to avoid client CORS restrictions)
    try {
      const serverRes = await this.fetchWithTimeout('/api/ats/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: trimmed }),
      }, 4500);

      if (serverRes && serverRes.ok) {
        const result: AtsDiscoveryResult = await serverRes.json();
        if (result && result.found) {
          return result;
        }
      }
    } catch (e) {
      logger.warn('AtsDiscoveryService', 'Server discovery proxy unavailable, running client probes', e);
    }

    // 2. Client-side probe fallback
    const candidateSlugs = this.generateCandidateSlugs(trimmed);
    const testedSlugs: string[] = [];

    for (const slug of candidateSlugs) {
      testedSlugs.push(slug);

      // Probe Greenhouse
      const gh = await this.probeGreenhouse(slug);
      if (gh) {
        const domain = `${slug}.com`;
        return {
          companyName: trimmed,
          found: true,
          provider: 'greenhouse',
          slug,
          domain,
          logo: `https://logo.clearbit.com/${domain}`,
          boardUrl: gh.boardUrl,
          jobCount: gh.jobCount,
          sampleRoles: gh.sampleRoles,
          testedSlugs,
          message: `Found live Greenhouse board with ${gh.jobCount} active roles!`,
        };
      }

      // Probe Lever
      const lev = await this.probeLever(slug);
      if (lev) {
        const domain = `${slug}.com`;
        return {
          companyName: trimmed,
          found: true,
          provider: 'lever',
          slug,
          domain,
          logo: `https://logo.clearbit.com/${domain}`,
          boardUrl: lev.boardUrl,
          jobCount: lev.jobCount,
          sampleRoles: lev.sampleRoles,
          testedSlugs,
          message: `Found live Lever board with ${lev.jobCount} active roles!`,
        };
      }

      // Probe SmartRecruiters
      const sr = await this.probeSmartRecruiters(slug);
      if (sr) {
        const domain = `${slug}.com`;
        return {
          companyName: trimmed,
          found: true,
          provider: 'smartrecruiters',
          slug,
          domain,
          logo: `https://logo.clearbit.com/${domain}`,
          boardUrl: sr.boardUrl,
          jobCount: sr.jobCount,
          sampleRoles: sr.sampleRoles,
          testedSlugs,
          message: `Found live SmartRecruiters board with ${sr.jobCount} active roles!`,
        };
      }

      // Probe Workable
      const wk = await this.probeWorkable(slug);
      if (wk) {
        const domain = `${slug}.com`;
        return {
          companyName: trimmed,
          found: true,
          provider: 'workable',
          slug,
          domain,
          logo: `https://logo.clearbit.com/${domain}`,
          boardUrl: wk.boardUrl,
          jobCount: wk.jobCount,
          sampleRoles: wk.sampleRoles,
          testedSlugs,
          message: `Found live Workable board with ${wk.jobCount} active roles!`,
        };
      }
    }

    return {
      companyName: trimmed,
      found: false,
      testedSlugs,
      message: `No public Greenhouse, Lever, SmartRecruiters, or Workable board found for "${trimmed}".`,
    };
  }

  /**
   * One-click save to atsTargets (via server endpoint + client fallback)
   */
  public static async addDiscoveredTarget(target: ATSCompanyTarget): Promise<{ success: boolean; message: string; target: ATSCompanyTarget }> {
    try {
      const res = await fetch('/api/ats/add-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          message: data.message || `Successfully added ${target.name} to atsTargets.ts!`,
          target,
        };
      }
    } catch (e) {
      logger.warn('AtsDiscoveryService', 'Server add-target failed, falling back to local registry', e);
    }

    // Local client-side fallback
    const KEY = 'terrasynx_custom_ats_targets_v1';
    try {
      const stored = localStorage.getItem(KEY);
      const list: ATSCompanyTarget[] = stored ? JSON.parse(stored) : [];
      if (!list.some(t => t.slug === target.slug && t.provider === target.provider)) {
        list.push(target);
        localStorage.setItem(KEY, JSON.stringify(list));
      }
      return {
        success: true,
        message: `Saved ${target.name} to active target radar!`,
        target,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to save ATS target',
        target,
      };
    }
  }
}

// Top-level exported function conforming exactly to PROMPT 28 specification
export const companyNameToAtsBoard = AtsDiscoveryService.companyNameToAtsBoard.bind(AtsDiscoveryService);

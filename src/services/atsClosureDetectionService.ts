/**
 * TERRASYNX: ATS Job API-Based Closure Detection Sentinel (Prompt 41B)
 * 
 * Rules:
 * 1. Applicable to jobs originating from:
 *    - Greenhouse ('greenhouse')
 *    - Lever ('lever')
 *    - SmartRecruiters ('smartrecruiters')
 *    - Workable ('workable')
 * 2. Closure Detection Rule:
 *    When a job disappears from TWO consecutive fetches of its source API:
 *    - Mark the job as "Possibly closed" (possiblyClosed = true, closureStatus = 'POSSIBLY_CLOSED')
 *    - Display with badge: "Possibly closed, verify on official page" for candidate review
 * 3. Crucial Invariant:
 *    - DO NOT delete the job automatically! Retain it in the candidate's radar/feed for inspection.
 * 4. Recovery Rule:
 *    If the job reappears in a subsequent fetch, reset consecutiveMissingFetches to 0 and remove the closure badge.
 */

import { Opportunity } from '../types';
import { logger } from '../utils/logger';

export const ATS_CLOSURE_BADGE_TEXT = 'Possibly closed, verify on official page';

export type SupportedAtsSource = 'greenhouse' | 'lever' | 'smartrecruiters' | 'workable';

export const SUPPORTED_ATS_SOURCES: ReadonlySet<string> = new Set([
  'greenhouse',
  'lever',
  'smartrecruiters',
  'workable',
]);

const STORAGE_KEY = 'terrasynx_ats_closure_tracking_v1';

export interface AtsJobTrackingState {
  consecutiveMissingFetches: number;
  possiblyClosed: boolean;
  lastSeenAt: number;
  lastCheckedAt: number;
  sourceType: SupportedAtsSource;
  companyKey: string;
}

export class AtsClosureDetectionService {
  private static trackingMap: Map<string, AtsJobTrackingState> = new Map();
  private static initialized = false;

  private static ensureInitialized(): void {
    if (this.initialized) return;
    this.initialized = true;
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            for (const [k, v] of Object.entries(parsed)) {
              if (v && typeof v === 'object') {
                this.trackingMap.set(k, v as AtsJobTrackingState);
              }
            }
          }
        }
      }
    } catch {
      // Safe fallback
    }
  }

  private static persistTracking(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const obj: Record<string, AtsJobTrackingState> = {};
        for (const [k, v] of this.trackingMap.entries()) {
          obj[k] = v;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
      }
    } catch {
      // Safe fallback
    }
  }

  /**
   * Identifies whether an opportunity originates from one of the 4 supported enterprise ATS engines.
   */
  public static isSupportedAtsJob(opp: Partial<Opportunity>): boolean {
    if (!opp) return false;
    const sourceType = (opp.verification?.sourceType || '').toLowerCase().trim();
    if (SUPPORTED_ATS_SOURCES.has(sourceType)) {
      return true;
    }
    const id = (opp.id || '').toLowerCase().trim();
    return (
      id.startsWith('live_gh_') ||
      id.startsWith('live_lever_') ||
      id.startsWith('live_sr_') ||
      id.startsWith('live_wk_')
    );
  }

  /**
   * Resolves the canonical ATS source type for an opportunity.
   */
  public static resolveSourceType(opp: Partial<Opportunity>): SupportedAtsSource | null {
    const raw = (opp.verification?.sourceType || '').toLowerCase().trim();
    if (SUPPORTED_ATS_SOURCES.has(raw)) {
      return raw as SupportedAtsSource;
    }
    const id = (opp.id || '').toLowerCase().trim();
    if (id.startsWith('live_gh_')) return 'greenhouse';
    if (id.startsWith('live_lever_')) return 'lever';
    if (id.startsWith('live_sr_')) return 'smartrecruiters';
    if (id.startsWith('live_wk_')) return 'workable';
    return null;
  }

  /**
   * Normalizes company identifier for grouping jobs from the same source API board.
   */
  public static getCompanyKey(opp: Partial<Opportunity>): string {
    const domain = (opp.companyDomain || '').toLowerCase().trim();
    const name = (opp.companyName || '').toLowerCase().trim();
    return domain || name || 'unknown_target';
  }

  /**
   * Core closure detection processor:
   * Compares previously existing opportunities against newly fetched jobs from ATS endpoints.
   * - Jobs present in the fetch: reset missing count to 0, possiblyClosed = false.
   * - Jobs missing from the fetch: increment missing count. If missing >= 2, mark possiblyClosed = true.
   * - Critical rule: NEVER delete disappearing jobs automatically!
   * 
   * @param existingOpportunities All current opportunities in store
   * @param fetchedJobs The newly returned jobs from the latest API fetch
   * @param targetsQueried Optional list of company keys or source types that were actively fetched in this cycle
   */
  public static processFetchCycle(
    existingOpportunities: Opportunity[],
    fetchedJobs: Opportunity[],
    targetsQueried?: { companyKeys?: string[]; sourceTypes?: SupportedAtsSource[] }
  ): {
    mergedOpportunities: Opportunity[];
    possiblyClosedCount: number;
    activeCount: number;
  } {
    this.ensureInitialized();
    const now = Date.now();

    const fetchedJobMap = new Map<string, Opportunity>();
    const fetchedCompanies = new Set<string>(targetsQueried?.companyKeys?.map(k => k.toLowerCase()) || []);
    const fetchedSourceTypes = new Set<string>(targetsQueried?.sourceTypes || ['greenhouse', 'lever', 'smartrecruiters', 'workable']);

    for (const job of fetchedJobs) {
      if (job && job.id) {
        fetchedJobMap.set(job.id, job);
        const compKey = this.getCompanyKey(job);
        if (compKey) fetchedCompanies.add(compKey);
        const src = this.resolveSourceType(job);
        if (src) fetchedSourceTypes.add(src);
      }
    }

    const resultMap = new Map<string, Opportunity>();

    // 1. Process all newly fetched jobs (Active / Reappeared)
    for (const freshJob of fetchedJobs) {
      const srcType = this.resolveSourceType(freshJob);
      const isAts = this.isSupportedAtsJob(freshJob);

      let consecutiveMissing = 0;
      let possiblyClosed = false;

      if (isAts && srcType) {
        // Reset tracking state: job was seen in this fetch
        this.trackingMap.set(freshJob.id, {
          consecutiveMissingFetches: 0,
          possiblyClosed: false,
          lastSeenAt: now,
          lastCheckedAt: now,
          sourceType: srcType,
          companyKey: this.getCompanyKey(freshJob),
        });
      }

      resultMap.set(freshJob.id, {
        ...freshJob,
        possiblyClosed: false,
        closureStatus: 'ACTIVE',
        consecutiveMissingFetches: 0,
        lastSeenInApiAt: now,
      });
    }

    // 2. Inspect existing opportunities for missing ATS jobs
    for (const existingJob of existingOpportunities) {
      if (!existingJob || !existingJob.id) continue;

      // If already added from fresh fetch, skip
      if (resultMap.has(existingJob.id)) continue;

      const isAts = this.isSupportedAtsJob(existingJob);
      const srcType = this.resolveSourceType(existingJob);
      const compKey = this.getCompanyKey(existingJob);

      // Only evaluate closure for Greenhouse, Lever, SmartRecruiters, and Workable
      // AND only if its company or source type was actively queried in this fetch
      const wasSourceQueried =
        isAts &&
        srcType &&
        (fetchedCompanies.has(compKey) || (fetchedCompanies.size === 0 && fetchedSourceTypes.has(srcType)));

      if (wasSourceQueried && srcType) {
        const prevRecord = this.trackingMap.get(existingJob.id);
        const previousMissing = prevRecord?.consecutiveMissingFetches ?? existingJob.consecutiveMissingFetches ?? 0;
        const newMissing = previousMissing + 1;
        const isNowPossiblyClosed = newMissing >= 2;

        this.trackingMap.set(existingJob.id, {
          consecutiveMissingFetches: newMissing,
          possiblyClosed: isNowPossiblyClosed,
          lastSeenAt: prevRecord?.lastSeenAt ?? existingJob.lastSeenInApiAt ?? existingJob.releasedAt ?? now,
          lastCheckedAt: now,
          sourceType: srcType,
          companyKey: compKey,
        });

        // Prompt 41B: Retain job for candidate review with advisory badge; DO NOT delete it!
        resultMap.set(existingJob.id, {
          ...existingJob,
          possiblyClosed: isNowPossiblyClosed,
          closureStatus: isNowPossiblyClosed ? 'POSSIBLY_CLOSED' : (existingJob.closureStatus || 'ACTIVE'),
          consecutiveMissingFetches: newMissing,
        });
      } else {
        // Retain non-ATS or non-queried jobs untouched
        resultMap.set(existingJob.id, existingJob);
      }
    }

    this.persistTracking();

    const merged = Array.from(resultMap.values());
    const possiblyClosedCount = merged.filter(j => j.possiblyClosed).length;
    const activeCount = merged.length - possiblyClosedCount;

    return {
      mergedOpportunities: merged,
      possiblyClosedCount,
      activeCount,
    };
  }

  /**
   * Helper to retrieve tracking state for a specific job.
   */
  public static getTrackingState(jobId: string): AtsJobTrackingState | undefined {
    this.ensureInitialized();
    return this.trackingMap.get(jobId);
  }

  /**
   * Resets all tracking state (used in testing and factory reset).
   */
  public static resetTracking(): void {
    this.trackingMap.clear();
    this.initialized = true;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Safe fallback
    }
  }
}

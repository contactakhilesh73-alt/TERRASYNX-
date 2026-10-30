/**
 * TERRASYNX: Janch Scheduler & Priority Ingestion Engine (Prompt 66)
 * 
 * Production Scheduler & Priority Watcher:
 * 1. POST /api/janch/run protected by secret header (JANCH_SECRET from .env).
 * 2. Checks sources in batches by priority:
 *    - Priority 1: Records with deadlines within 7 days (URGENT_CLOSING_SOON)
 *    - Priority 2: Active / open records (ACTIVE_MONITORING)
 *    - Priority 3: Other / passed / unknown records (STANDARD_CYCLE)
 * 3. Enforces:
 *    - Per-host rate limits (minimum interval between requests to same hostname)
 *    - Randomized jitter between requests to avoid spike bursts
 *    - Exponential backoff upon 429/503/errors per host
 *    - robots.txt compliance
 *    - Honest User-Agent: 'TerrasynxLinkChecker/1.0'
 * 4. Write to Firestore ONLY when a record's status or date changes!
 *    - Keeps the last check time in memory to minimize database write churn.
 * 5. On-Demand Stale Record Refresh:
 *    - Refreshes a stale record when a user opens it.
 */

import crypto from 'crypto';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CuratedRecord, curatedRecordsService } from './curatedRecordsService';
import {
  LiveParsersService,
  LiveParserResult,
  fetchOfficialPageSafe,
  parseOfficialPageDeterministic,
} from './liveParsers';
import { HONEST_USER_AGENT, validateSafeTargetUrl } from './linkAllowlistService';
import { OfficialPageWatcherService } from './officialPageWatcherService';
import { getFreshnessWindowMs } from './verificationStatusService';
import { ClosureAlertService } from './closureAlertService';
import { logger } from '../utils/logger';

export const DEFAULT_JANCH_SECRET = 'terrasynx_janch_secret_prod_change_me';

export interface JanchCheckItemResult {
  recordId: string;
  sourceUrl: string;
  organizer: string;
  priority: 1 | 2 | 3;
  priorityLabel: 'URGENT_7_DAYS' | 'ACTIVE_OPEN' | 'STANDARD_CYCLE';
  statusChanged: boolean;
  dateChanged: boolean;
  firestoreWritten: boolean;
  previousStatus: string;
  newStatus: string;
  previousDates?: string;
  newDates?: string;
  previousDeadline?: string;
  newDeadline?: string;
  checkedAt: number;
  error?: string;
  skippedRobots?: boolean;
  backedOff?: boolean;
}

export interface JanchRunSummary {
  success: boolean;
  timestamp: number;
  totalCandidates: number;
  batchSize: number;
  processedCount: number;
  firestoreWritesCommitted: number;
  firestoreWritesSkipped: number;
  prioritiesChecked: {
    urgent7Days: number;
    activeOpen: number;
    standardCycle: number;
  };
  results: JanchCheckItemResult[];
}

export interface JanchRunOptions {
  batchSize?: number;
  maxHostRequestsPerBatch?: number;
  forceAll?: boolean;
  targetCategory?: string;
}

export interface RecordRefreshResult {
  recordId: string;
  sourceUrl: string;
  isStale: boolean;
  refreshed: boolean;
  statusChanged: boolean;
  dateChanged: boolean;
  firestoreWritten: boolean;
  status: string;
  datesText?: string | null;
  deadlineText?: string | null;
  lastCheckedAt: number;
  evidence: string;
  cachedOnly?: boolean;
  error?: string;
}

export class JanchSchedulerService {
  // In-memory state tracking to eliminate redundant Firestore writes
  private static lastCheckTimeByRecordId: Map<string, number> = new Map();
  private static lastRequestTimeByHost: Map<string, number> = new Map();
  private static hostBackoffUntil: Map<string, number> = new Map();
  private static hostConsecutiveErrors: Map<string, number> = new Map();

  // Configurable per-host rate limit: minimum gap in ms between requests to the same host
  public static MIN_HOST_INTERVAL_MS = 1200;
  // Maximum backoff duration: 5 minutes
  public static MAX_BACKOFF_MS = 5 * 60 * 1000;

  /**
   * Validates the incoming Janch secret against process.env.JANCH_SECRET
   */
  public static verifySecret(headerSecret?: string, authHeader?: string): boolean {
    const configuredSecret = process.env.JANCH_SECRET || DEFAULT_JANCH_SECRET;

    let candidate = headerSecret;
    if (!candidate && authHeader && authHeader.startsWith('Bearer ')) {
      candidate = authHeader.substring(7).trim();
    }

    if (!candidate || typeof candidate !== 'string') {
      return false;
    }

    // Timing-safe comparison to prevent timing side-channels
    try {
      const bufA = Buffer.from(candidate);
      const bufB = Buffer.from(configuredSecret);
      if (bufA.length !== bufB.length) return false;
      return crypto.timingSafeEqual(bufA, bufB);
    } catch {
      return candidate === configuredSecret;
    }
  }

  /**
   * Returns the in-memory last checked timestamp for a given record.
   */
  public static getLastCheckedAt(recordId: string): number | undefined {
    return this.lastCheckTimeByRecordId.get(recordId);
  }

  /**
   * Sets in-memory last checked timestamp (useful for testing or cache synchronization).
   */
  public static setLastCheckedAt(recordId: string, timestamp: number): void {
    this.lastCheckTimeByRecordId.set(recordId, timestamp);
  }

  /**
   * Clears in-memory check timestamps and backoff maps.
   */
  public static resetMemoryState(): void {
    this.lastCheckTimeByRecordId.clear();
    this.lastRequestTimeByHost.clear();
    this.hostBackoffUntil.clear();
    this.hostConsecutiveErrors.clear();
  }

  /**
   * Extracts deadline or end timestamp from a record's verifiedFacts.
   */
  public static extractDeadlineEpoch(record: CuratedRecord): number | null {
    const facts = record.verifiedFacts || {};
    const candidate = facts.registrationDeadline || facts.endDate || facts.deadline || facts.validThrough;
    if (!candidate || typeof candidate !== 'string') return null;

    const parsed = Date.parse(candidate);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Computes priority for a record:
   * Priority 1: Deadline is in the future AND within 7 days (URGENT_CLOSING_SOON)
   * Priority 2: Active or open verified record
   * Priority 3: Other records (passed, unknown, or unverified)
   */
  public static calculateRecordPriority(record: CuratedRecord, now: number = Date.now()): {
    priority: 1 | 2 | 3;
    priorityLabel: 'URGENT_7_DAYS' | 'ACTIVE_OPEN' | 'STANDARD_CYCLE';
    deadlineEpoch: number | null;
  } {
    const deadlineEpoch = this.extractDeadlineEpoch(record);
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    if (deadlineEpoch !== null && deadlineEpoch > now && (deadlineEpoch - now) <= SEVEN_DAYS_MS) {
      return { priority: 1, priorityLabel: 'URGENT_7_DAYS', deadlineEpoch };
    }

    const st = (record.status || '').toUpperCase();
    if (st.includes('OPEN') || st.includes('VERIFIED') || st === 'ANNOUNCED_VERIFIED' || st === 'UNVERIFIED_CURATED') {
      return { priority: 2, priorityLabel: 'ACTIVE_OPEN', deadlineEpoch };
    }

    return { priority: 3, priorityLabel: 'STANDARD_CYCLE', deadlineEpoch };
  }

  /**
   * Retrieves and ranks records into a prioritized batch:
   * 1. Priority 1 (Deadline <= 7 days) first
   * 2. Priority 2 (Active/Open) second
   * 3. Priority 3 (Standard cycle) last
   * Within each priority tier, sorted by oldest in-memory check time.
   */
  public static getPrioritizedBatch(options: JanchRunOptions = {}): {
    batch: CuratedRecord[];
    totalCandidates: number;
    priorityCounts: { urgent7Days: number; activeOpen: number; standardCycle: number };
  } {
    const now = Date.now();
    const batchSize = Math.max(1, Math.min(options.batchSize || 15, 100));

    let allRecords = curatedRecordsService.getAllRecords();
    if (options.targetCategory) {
      allRecords = allRecords.filter(r => r.category === options.targetCategory);
    }

    // Filter only records that have a valid URL
    const validRecords = allRecords.filter(r => {
      const u = (r.sourceUrl || '').trim();
      return u.startsWith('http://') || u.startsWith('https://');
    });

    // Score and rank each record
    const scored = validRecords.map(rec => {
      const { priority, priorityLabel, deadlineEpoch } = this.calculateRecordPriority(rec, now);
      const lastChecked = this.lastCheckTimeByRecordId.get(rec.id) || rec.lastVerifiedAt || 0;
      return {
        rec,
        priority,
        priorityLabel,
        deadlineEpoch,
        lastChecked,
      };
    });

    // Sort: Priority ascending (1 -> 2 -> 3), then lastChecked ascending (oldest checked first)
    scored.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.lastChecked - b.lastChecked;
    });

    const urgent7Days = scored.filter(s => s.priority === 1).length;
    const activeOpen = scored.filter(s => s.priority === 2).length;
    const standardCycle = scored.filter(s => s.priority === 3).length;

    const batch = scored.slice(0, batchSize).map(s => s.rec);

    return {
      batch,
      totalCandidates: validRecords.length,
      priorityCounts: { urgent7Days, activeOpen, standardCycle },
    };
  }

  /**
   * Executes rate-limiting with jitter and exponential backoff per host.
   */
  public static async executeWithHostRateLimit<T>(
    rawUrl: string,
    action: () => Promise<T>
  ): Promise<{ skipped?: boolean; backedOff?: boolean; result?: T; error?: string }> {
    let hostname: string;
    try {
      hostname = new URL(rawUrl).hostname.toLowerCase();
    } catch {
      return { error: 'Invalid URL format' };
    }

    const now = Date.now();

    // Check if host is currently backed off due to prior 429/503 errors
    const backoffUntil = this.hostBackoffUntil.get(hostname) || 0;
    if (now < backoffUntil) {
      logger.info('JanchScheduler', `Skipping ${rawUrl} - host ${hostname} is in backoff until ${new Date(backoffUntil).toISOString()}`);
      return { skipped: true, backedOff: true, error: `Host in exponential backoff until ${new Date(backoffUntil).toISOString()}` };
    }

    // Per-host rate limit gap
    const lastRequest = this.lastRequestTimeByHost.get(hostname) || 0;
    const elapsed = now - lastRequest;
    if (elapsed < this.MIN_HOST_INTERVAL_MS) {
      const waitMs = this.MIN_HOST_INTERVAL_MS - elapsed;
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }

    // Randomized jitter (100ms - 400ms)
    const jitterMs = Math.floor(Math.random() * 300) + 100;
    await new Promise(resolve => setTimeout(resolve, jitterMs));

    this.lastRequestTimeByHost.set(hostname, Date.now());

    try {
      const res = await action();
      // On success, reset consecutive error count for this host
      this.hostConsecutiveErrors.set(hostname, 0);
      return { result: res };
    } catch (err: any) {
      const errorCount = (this.hostConsecutiveErrors.get(hostname) || 0) + 1;
      this.hostConsecutiveErrors.set(hostname, errorCount);

      // Calculate exponential backoff on error
      const backoffDuration = Math.min(this.MAX_BACKOFF_MS, 2000 * Math.pow(2, errorCount));
      this.hostBackoffUntil.set(hostname, Date.now() + backoffDuration);

      logger.warn('JanchScheduler', `Error contacting ${hostname} (${errorCount} consecutive errors). Applied backoff for ${backoffDuration}ms.`);
      return { error: err?.message || String(err) };
    }
  }

  /**
   * Checks whether a record has changed in status or date compared to live parser output.
   */
  public static hasStatusOrDateChanged(
    record: CuratedRecord,
    decision: LiveParserResult
  ): {
    statusChanged: boolean;
    dateChanged: boolean;
    newStatus: string;
    newDates?: string;
    newDeadline?: string;
    newStartDate?: string;
    newEndDate?: string;
  } {
    const existingStatus = record.status;
    const newStatus = decision.status || (decision.isClosed ? 'CLOSED_EARLY_BY_PORTAL' : existingStatus);
    const statusChanged = Boolean(newStatus && newStatus !== existingStatus && newStatus !== 'UNKNOWN');

    const facts = record.verifiedFacts || {};
    const existingDates = facts.dates;
    const existingDeadline = facts.registrationDeadline || facts.deadline || facts.validThrough;
    const existingStartDate = facts.startDate;
    const existingEndDate = facts.endDate;

    const newDates = decision.datesText || undefined;
    const newDeadline = decision.deadlineText || decision.validThrough || undefined;
    const newStartDate = decision.startDate || undefined;
    const newEndDate = decision.endDate || undefined;

    let dateChanged = false;

    if (newDates && newDates !== existingDates) {
      dateChanged = true;
    }
    if (newDeadline && newDeadline !== existingDeadline) {
      dateChanged = true;
    }
    if (newStartDate && newStartDate !== existingStartDate) {
      dateChanged = true;
    }
    if (newEndDate && newEndDate !== existingEndDate) {
      dateChanged = true;
    }

    return {
      statusChanged,
      dateChanged,
      newStatus,
      newDates,
      newDeadline,
      newStartDate,
      newEndDate,
    };
  }

  /**
   * Persists changes to Firestore ONLY when status or date changed.
   * If unchanged, skips write entirely to prevent database churn.
   */
  public static async persistToFirestoreIfChanged(
    record: CuratedRecord,
    changeDetails: {
      statusChanged: boolean;
      dateChanged: boolean;
      newStatus: string;
      newDates?: string;
      newDeadline?: string;
      newStartDate?: string;
      newEndDate?: string;
      evidence: string;
    }
  ): Promise<{ written: boolean; error?: string }> {
    const now = Date.now();

    // STRICT INVARIANT: Write to Firestore ONLY when status or date changes!
    if (!changeDetails.statusChanged && !changeDetails.dateChanged) {
      return { written: false };
    }

    try {
      const recordRef = doc(db, 'records', record.id);
      const updatedFacts = {
        ...(record.verifiedFacts || {}),
        status: changeDetails.newStatus,
        ...(changeDetails.newDates ? { dates: changeDetails.newDates } : {}),
        ...(changeDetails.newDeadline ? { registrationDeadline: changeDetails.newDeadline } : {}),
        ...(changeDetails.newStartDate ? { startDate: changeDetails.newStartDate } : {}),
        ...(changeDetails.newEndDate ? { endDate: changeDetails.newEndDate } : {}),
      };

      await setDoc(recordRef, {
        status: changeDetails.newStatus,
        lastVerifiedAt: now,
        evidence: changeDetails.evidence || record.evidence,
        verifiedFacts: updatedFacts,
      }, { merge: true });

      const prevStatus = record.status;
      // Update in-memory curated record as well
      record.status = changeDetails.newStatus;
      record.lastVerifiedAt = now;
      record.evidence = changeDetails.evidence || record.evidence;
      record.verifiedFacts = updatedFacts;

      // Prompt 67: When a tracked opportunity changes to POSSIBLY_CLOSED, CLOSED_EARLY_BY_PORTAL,
      // REMOVED_BY_PORTAL or CANCELLED_OR_POSTPONED, add an Alert Relay message for users tracking it.
      if (changeDetails.statusChanged) {
        ClosureAlertService.dispatchClosureAlertIfTracked({
          opportunity: {
            id: record.id,
            title: record.title,
            companyName: record.organizer,
            officialApplyUrl: record.sourceUrl,
          },
          previousStatus: prevStatus,
          newStatus: changeDetails.newStatus,
          evidence: changeDetails.evidence,
          detectedAt: now,
        });
      }

      logger.info('JanchScheduler', `Firestore record updated [${record.id}]: statusChanged=${changeDetails.statusChanged}, dateChanged=${changeDetails.dateChanged}`);
      return { written: true };
    } catch (err: any) {
      // In dev or offline environments where Firestore permissions or network fails, log gracefully
      logger.warn('JanchScheduler', `Firestore write skipped or failed for [${record.id}]: ${err?.message || err}`);
      // Still update memory so local state is consistent
      record.status = changeDetails.newStatus;
      record.lastVerifiedAt = now;
      if (record.verifiedFacts) {
        record.verifiedFacts.status = changeDetails.newStatus;
        if (changeDetails.newDates) record.verifiedFacts.dates = changeDetails.newDates;
        if (changeDetails.newDeadline) record.verifiedFacts.registrationDeadline = changeDetails.newDeadline;
      }
      return { written: false, error: err?.message };
    }
  }

  /**
   * Refreshes a stale record when opened by a user.
   * If fresh (within source freshness window), returns immediately from memory.
   * If stale, performs live check, updating Firestore only if status or date changed.
   */
  public static async refreshRecord(
    recordId: string,
    force: boolean = false
  ): Promise<RecordRefreshResult> {
    const now = Date.now();
    const record = curatedRecordsService.getRecordById(recordId);

    if (!record) {
      return {
        recordId,
        sourceUrl: '',
        isStale: false,
        refreshed: false,
        statusChanged: false,
        dateChanged: false,
        firestoreWritten: false,
        status: 'UNKNOWN',
        lastCheckedAt: now,
        evidence: 'Record not found in registry',
        error: `Record ${recordId} not found`,
      };
    }

    const lastChecked = this.lastCheckTimeByRecordId.get(record.id) || record.lastVerifiedAt || 0;
    const sourceType = record.category || 'direct_careers_domain';
    const freshnessWindowMs = getFreshnessWindowMs(sourceType);
    const isStale = (now - lastChecked) > freshnessWindowMs;

    // If record is fresh and not forced, return cached status without making outbound HTTP calls
    if (!isStale && !force) {
      return {
        recordId: record.id,
        sourceUrl: record.sourceUrl,
        isStale: false,
        refreshed: false,
        cachedOnly: true,
        statusChanged: false,
        dateChanged: false,
        firestoreWritten: false,
        status: record.status,
        datesText: record.verifiedFacts?.dates || null,
        deadlineText: record.verifiedFacts?.registrationDeadline || null,
        lastCheckedAt: lastChecked,
        evidence: record.evidence || 'Loaded from fresh memory cache',
      };
    }

    // Record is stale or refresh is forced: inspect live source
    this.lastCheckTimeByRecordId.set(record.id, now);

    try {
      // 1. Robots.txt check
      const robotsAllowed = await OfficialPageWatcherService.isAllowedByRobots(record.sourceUrl);
      if (!robotsAllowed) {
        return {
          recordId: record.id,
          sourceUrl: record.sourceUrl,
          isStale: true,
          refreshed: false,
          statusChanged: false,
          dateChanged: false,
          firestoreWritten: false,
          status: record.status,
          lastCheckedAt: now,
          evidence: 'Inspection skipped: robots.txt disallows automated crawler',
        };
      }

      // 2. Outbound safe fetch & deterministic parser execution with rate limit
      const rateLimitRes = await this.executeWithHostRateLimit(record.sourceUrl, async () => {
        return await fetchOfficialPageSafe(record.sourceUrl);
      });

      if (rateLimitRes.error || !rateLimitRes.result) {
        return {
          recordId: record.id,
          sourceUrl: record.sourceUrl,
          isStale: true,
          refreshed: false,
          statusChanged: false,
          dateChanged: false,
          firestoreWritten: false,
          status: record.status,
          lastCheckedAt: now,
          evidence: `Probing failed or host backed off: ${rateLimitRes.error || 'unknown failure'}`,
          error: rateLimitRes.error,
        };
      }

      const fetchResult = rateLimitRes.result;
      const decision = await parseOfficialPageDeterministic({
        url: record.sourceUrl,
        html: fetchResult.html,
        responseStatus: fetchResult.statusCode,
        finalRedirectUrl: fetchResult.finalUrl,
        organizer: record.organizer,
        allowAiFallback: true,
        now,
      });

      // 3. Diff evaluation: did status or dates change?
      const change = this.hasStatusOrDateChanged(record, decision);
      let firestoreWritten = false;

      if (change.statusChanged || change.dateChanged) {
        const persistResult = await this.persistToFirestoreIfChanged(record, {
          ...change,
          evidence: decision.evidence,
        });
        firestoreWritten = persistResult.written;
      }

      return {
        recordId: record.id,
        sourceUrl: record.sourceUrl,
        isStale: true,
        refreshed: true,
        statusChanged: change.statusChanged,
        dateChanged: change.dateChanged,
        firestoreWritten,
        status: change.newStatus,
        datesText: change.newDates || null,
        deadlineText: change.newDeadline || null,
        lastCheckedAt: now,
        evidence: decision.evidence,
      };
    } catch (err: any) {
      logger.error('JanchScheduler', `Error refreshing stale record ${record.id}`, err);
      return {
        recordId: record.id,
        sourceUrl: record.sourceUrl,
        isStale: true,
        refreshed: false,
        statusChanged: false,
        dateChanged: false,
        firestoreWritten: false,
        status: record.status,
        lastCheckedAt: now,
        evidence: `Inspection exception: ${err?.message || 'unknown error'}`,
        error: err?.message,
      };
    }
  }

  /**
   * Main Janch Cycle Runner:
   * Selects prioritized batch (deadline within 7 days first), inspects sources,
   * writes to Firestore ONLY on status or date change, keeping last check time in memory.
   */
  public static async runJanchCycle(options: JanchRunOptions = {}): Promise<JanchRunSummary> {
    const now = Date.now();
    const { batch, totalCandidates, priorityCounts } = this.getPrioritizedBatch(options);
    const results: JanchCheckItemResult[] = [];

    let writesCommitted = 0;
    let writesSkipped = 0;

    logger.info('JanchScheduler', `Starting Janch cycle for batch of ${batch.length} records (${priorityCounts.urgent7Days} urgent <=7 days, ${priorityCounts.activeOpen} active, ${priorityCounts.standardCycle} standard)...`);

    for (const record of batch) {
      const { priority, priorityLabel } = this.calculateRecordPriority(record, now);
      const prevStatus = record.status;
      const facts = record.verifiedFacts || {};
      const prevDates = facts.dates;
      const prevDeadline = facts.registrationDeadline || facts.deadline || facts.validThrough;

      // Update in-memory last checked time
      this.lastCheckTimeByRecordId.set(record.id, now);

      // Check robots.txt
      const robotsAllowed = await OfficialPageWatcherService.isAllowedByRobots(record.sourceUrl);
      if (!robotsAllowed) {
        results.push({
          recordId: record.id,
          sourceUrl: record.sourceUrl,
          organizer: record.organizer,
          priority,
          priorityLabel,
          statusChanged: false,
          dateChanged: false,
          firestoreWritten: false,
          previousStatus: prevStatus,
          newStatus: prevStatus,
          previousDates: prevDates,
          previousDeadline: prevDeadline,
          checkedAt: now,
          skippedRobots: true,
        });
        continue;
      }

      // Execute safe fetch with per-host rate limit and jitter
      const rateLimitRes = await this.executeWithHostRateLimit(record.sourceUrl, async () => {
        return await fetchOfficialPageSafe(record.sourceUrl);
      });

      if (rateLimitRes.backedOff || rateLimitRes.error || !rateLimitRes.result) {
        results.push({
          recordId: record.id,
          sourceUrl: record.sourceUrl,
          organizer: record.organizer,
          priority,
          priorityLabel,
          statusChanged: false,
          dateChanged: false,
          firestoreWritten: false,
          previousStatus: prevStatus,
          newStatus: prevStatus,
          previousDates: prevDates,
          previousDeadline: prevDeadline,
          checkedAt: now,
          backedOff: Boolean(rateLimitRes.backedOff),
          error: rateLimitRes.error || 'Outbound request failed',
        });
        continue;
      }

      const fetchResult = rateLimitRes.result;
      const decision = await parseOfficialPageDeterministic({
        url: record.sourceUrl,
        html: fetchResult.html,
        responseStatus: fetchResult.statusCode,
        finalRedirectUrl: fetchResult.finalUrl,
        organizer: record.organizer,
        allowAiFallback: true,
        now,
      });

      const change = this.hasStatusOrDateChanged(record, decision);
      let firestoreWritten = false;

      // STRICT INVARIANT: Write to Firestore ONLY when status or date changed!
      if (change.statusChanged || change.dateChanged) {
        const persistResult = await this.persistToFirestoreIfChanged(record, {
          ...change,
          evidence: decision.evidence,
        });
        firestoreWritten = persistResult.written;
        writesCommitted++;
      } else {
        writesSkipped++;
      }

      results.push({
        recordId: record.id,
        sourceUrl: record.sourceUrl,
        organizer: record.organizer,
        priority,
        priorityLabel,
        statusChanged: change.statusChanged,
        dateChanged: change.dateChanged,
        firestoreWritten,
        previousStatus: prevStatus,
        newStatus: change.newStatus,
        previousDates: prevDates,
        newDates: change.newDates,
        previousDeadline: prevDeadline,
        newDeadline: change.newDeadline,
        checkedAt: now,
      });
    }

    return {
      success: true,
      timestamp: now,
      totalCandidates,
      batchSize: batch.length,
      processedCount: results.length,
      firestoreWritesCommitted: writesCommitted,
      firestoreWritesSkipped: writesSkipped,
      prioritiesChecked: priorityCounts,
      results,
    };
  }
}

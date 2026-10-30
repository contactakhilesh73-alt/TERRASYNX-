/**
 * TERRASYNX Time Synchronization & Dual-Timezone Engine (Prompt 62)
 * Synchronizes client state with authoritative server UTC time,
 * monitors client-server clock drift with strict >2-minute alerting,
 * and formats all platform deadlines in both Official (IST) and User Local timezones.
 */

export const OFFICIAL_TIMEZONE = 'Asia/Kolkata';
export const OFFICIAL_TIMEZONE_LABEL = 'IST (UTC+05:30)';
export const MAX_ALLOWED_DRIFT_MS = 2 * 60 * 1000; // 2 minutes (Prompt 62 rule)

export interface ServerTimeResponse {
  utcTime: string;
  epochMs: number;
  serverTimezone: string;
  officialTimezone: string;
  officialTimezoneLabel: string;
}

export interface ClockSyncState {
  isSynced: boolean;
  offsetMs: number; // serverTime - clientTime
  absDriftMs: number;
  hasSignificantDrift: boolean; // > 2 minutes
  lastSyncedAt: number;
  latencyMs: number;
  serverUtcIso: string;
  error?: string;
}

// Global cached sync state for application-wide consistency
let currentSyncState: ClockSyncState = {
  isSynced: false,
  offsetMs: 0,
  absDriftMs: 0,
  hasSignificantDrift: false,
  lastSyncedAt: 0,
  latencyMs: 0,
  serverUtcIso: new Date().toISOString(),
};

/**
 * Fetches server UTC time from GET /api/time and calculates clock drift accounting for network latency.
 */
export async function fetchServerTime(): Promise<ClockSyncState> {
  const requestStart = Date.now();
  try {
    const res = await fetch('/api/time', {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });

    const requestEnd = Date.now();
    const latency = Math.max(0, requestEnd - requestStart);

    if (!res.ok) {
      throw new Error(`Server time response failed: ${res.status}`);
    }

    const data: ServerTimeResponse = await res.json();
    const serverEpoch = data.epochMs || new Date(data.utcTime).getTime();

    // Adjust server time by estimated one-way latency (half round-trip)
    const estimatedServerNow = serverEpoch + latency / 2;
    const offsetMs = estimatedServerNow - requestEnd;
    const absDriftMs = Math.abs(offsetMs);
    const hasSignificantDrift = absDriftMs > MAX_ALLOWED_DRIFT_MS;

    currentSyncState = {
      isSynced: true,
      offsetMs,
      absDriftMs,
      hasSignificantDrift,
      lastSyncedAt: requestEnd,
      latencyMs: latency,
      serverUtcIso: data.utcTime,
    };

    return currentSyncState;
  } catch (err: any) {
    // Graceful fallback to client clock with un-synced status
    currentSyncState = {
      ...currentSyncState,
      isSynced: false,
      error: err?.message || 'Failed to sync with server time',
    };
    return currentSyncState;
  }
}

/**
 * Gets the current synchronized server Date instance.
 */
export function getSyncedDate(offsetMs: number = currentSyncState.offsetMs): Date {
  return new Date(Date.now() + offsetMs);
}

/**
 * Formats a given date/timestamp in the platform's official timezone (IST / Asia/Kolkata).
 */
export function formatOfficialTime(
  dateInput: Date | number | string,
  options?: { includeSeconds?: boolean; includeDate?: boolean }
): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid Date';

  const includeSeconds = options?.includeSeconds ?? true;
  const includeDate = options?.includeDate ?? true;

  try {
    const formatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: OFFICIAL_TIMEZONE,
      day: includeDate ? '2-digit' : undefined,
      month: includeDate ? 'short' : undefined,
      year: includeDate ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
      hour12: false,
    });

    const formatted = formatter.format(date);
    return `${formatted} ${OFFICIAL_TIMEZONE_LABEL}`;
  } catch {
    // Fallback if Intl fails
    return `${date.toUTCString()} (UTC)`;
  }
}

/**
 * Formats a given date/timestamp in the candidate's device local timezone.
 */
export function formatLocalTime(
  dateInput: Date | number | string,
  options?: { includeSeconds?: boolean; includeDate?: boolean }
): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid Date';

  const includeSeconds = options?.includeSeconds ?? true;
  const includeDate = options?.includeDate ?? true;

  try {
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    const formatter = new Intl.DateTimeFormat(undefined, {
      day: includeDate ? '2-digit' : undefined,
      month: includeDate ? 'short' : undefined,
      year: includeDate ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
      hour12: true,
    });

    const formatted = formatter.format(date);
    return `${formatted} (${localTz})`;
  } catch {
    return date.toLocaleString();
  }
}

/**
 * Dual Deadline Formatter (Prompt 62 Requirement):
 * Deadlines elsewhere must be shown in the official timezone and the user's local time.
 */
export function formatDualDeadline(
  deadlineInput: Date | number | string,
  currentNowMs: number = Date.now()
): {
  officialText: string;
  localText: string;
  timeLeftStr: string;
  isUrgent: boolean;
  isPassed: boolean;
  remainingMs: number;
} {
  const deadlineDate = deadlineInput instanceof Date ? deadlineInput : new Date(deadlineInput);
  const deadlineMs = deadlineDate.getTime();
  const remainingMs = deadlineMs - currentNowMs;
  const isPassed = remainingMs <= 0;

  let timeLeftStr = 'Closed';
  let isUrgent = false;

  if (!isPassed) {
    const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((remainingMs % (1000 * 60)) / 1000);

    isUrgent = totalHours < 72;

    if (totalHours > 48) {
      const days = Math.floor(totalHours / 24);
      const remHours = totalHours % 24;
      timeLeftStr = `${days}d ${remHours}h ${mins}m left`;
    } else {
      timeLeftStr = `${totalHours}h ${mins}m ${secs}s left`;
    }
  }

  const officialText = formatOfficialTime(deadlineDate, { includeSeconds: false, includeDate: true });
  const localText = formatLocalTime(deadlineDate, { includeSeconds: false, includeDate: true });

  return {
    officialText,
    localText,
    timeLeftStr,
    isUrgent,
    isPassed,
    remainingMs,
  };
}

/**
 * Generates a human-friendly clock drift summary string.
 */
export function formatDriftDescription(offsetMs: number): string {
  const abs = Math.abs(offsetMs);
  const minutes = Math.floor(abs / 60000);
  const seconds = Math.floor((abs % 60000) / 1000);

  const direction = offsetMs < 0 ? 'ahead of' : 'behind';
  if (minutes > 0) {
    return `${minutes}m ${seconds}s ${direction} server time`;
  }
  return `${seconds}s ${direction} server time`;
}

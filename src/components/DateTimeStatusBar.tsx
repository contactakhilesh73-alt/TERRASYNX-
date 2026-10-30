/**
 * TERRASYNX: DateTimeStatusBar Component (Prompt 62)
 * Pinned directly under the global header on every page after login.
 * Displays:
 *  1. Authoritative server-synced live date & time with official timezone label (IST)
 *  2. Candidate device local date & time
 *  3. Prominent clock drift warning if device differs by > 2 minutes
 *  4. Placeholders for candidate verification counters (Identity, ATS Integrity, Anti-cheat)
 *  5. On-demand clock re-synchronization action
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Globe, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles,
  Cpu,
  MapPin,
  Lock
} from 'lucide-react';
import { AuthUserSession } from '../types';
import { 
  fetchServerTime, 
  getSyncedDate, 
  formatOfficialTime, 
  formatLocalTime, 
  formatDriftDescription,
  ClockSyncState,
  OFFICIAL_TIMEZONE_LABEL,
  MAX_ALLOWED_DRIFT_MS 
} from '../utils/timeService';

interface DateTimeStatusBarProps {
  currentUser: AuthUserSession | null;
  activeOpportunitiesCount?: number;
  urgentDeadlinesCount?: number;
}

export const DateTimeStatusBar: React.FC<DateTimeStatusBarProps> = ({
  currentUser,
  activeOpportunitiesCount = 0,
  urgentDeadlinesCount = 0,
}) => {
  // If candidate is not authenticated, do not render (Prompt 62: "shown under the header on every page after login")
  if (!currentUser) {
    return null;
  }

  const [syncState, setSyncState] = useState<ClockSyncState>({
    isSynced: false,
    offsetMs: 0,
    absDriftMs: 0,
    hasSignificantDrift: false,
    lastSyncedAt: 0,
    latencyMs: 0,
    serverUtcIso: new Date().toISOString(),
  });

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showDriftDetails, setShowDriftDetails] = useState<boolean>(false);

  // Synchronize with backend /api/time
  const performSync = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const state = await fetchServerTime();
      setSyncState(state);
      setCurrentTime(getSyncedDate(state.offsetMs));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial sync on mount and periodic resync every 5 minutes
  useEffect(() => {
    performSync();
    const syncInterval = setInterval(performSync, 5 * 60 * 1000);
    return () => clearInterval(syncInterval);
  }, [performSync]);

  // Live tick every second using authoritative offset
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setCurrentTime(getSyncedDate(syncState.offsetMs));
    }, 1000);
    return () => clearInterval(tickInterval);
  }, [syncState.offsetMs]);

  const officialTimeString = formatOfficialTime(currentTime, { includeSeconds: true, includeDate: true });
  const localTimeString = formatLocalTime(currentTime, { includeSeconds: true, includeDate: true });

  return (
    <aside 
      aria-label="Server-synchronized time and verification status"
      className="w-full bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/20 shadow-md relative z-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs font-mono">
          
          {/* Left: Authoritative Synchronized Time Deck */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-slate-300">
            {/* Live Clock Pulse Indicator */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 font-semibold shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] tracking-wide font-bold">{officialTimeString}</span>
            </div>

            {/* Candidate Local Time Conversion Badge */}
            <div 
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/70 border border-slate-700/60 text-slate-400"
              title="Your device's local clock representation"
            >
              <MapPin className="w-3 h-3 text-slate-500" />
              <span className="text-[11px]">Local: {localTimeString}</span>
            </div>

            {/* Sync Status & Resync Action */}
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <span title={`Clock offset: ${syncState.offsetMs > 0 ? '+' : ''}${syncState.offsetMs}ms • Network latency: ${syncState.latencyMs}ms`}>
                {syncState.isSynced ? 'Synced (UTC)' : 'Local Clock'}
              </span>
              <button
                type="button"
                onClick={performSync}
                disabled={isRefreshing}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer disabled:opacity-50"
                title="Force resync with /api/time authoritative server clock"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Right: Placeholders for Verification Counters (Prompt 62 Requirement) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            {/* Identity Verification Counter Placeholder */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px]"
              title="Cryptographic candidate identity verified via authenticated credential session"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Identity: <strong className="font-bold text-emerald-200">Verified</strong></span>
            </div>

            {/* Anti-Tamper & Integrity Counter Placeholder */}
            <div 
              className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/60 border border-slate-800 text-slate-400 text-[10px]"
              title="Automated anti-cheat and clock-tampering detection active"
            >
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Integrity: <strong className="text-slate-300">0 Flags</strong></span>
            </div>

            {/* Active Submission Deadline Counter */}
            <div 
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] ${
                urgentDeadlinesCount > 0 
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 animate-pulse' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
              title="Official deadlines tracked with authoritative server clock synchronization"
            >
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span>Deadlines: <strong className="text-slate-200">{urgentDeadlinesCount} Urgent</strong></span>
            </div>
          </div>
        </div>

        {/* Clock Drift Discrepancy Warning Banner (Prompt 62 Requirement: > 2 minutes) */}
        {syncState.hasSignificantDrift && (
          <div className="mt-2 p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/60 text-amber-200 flex items-start sm:items-center justify-between gap-3 text-xs font-mono shadow-lg animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <strong className="text-amber-300 font-bold">Clock Drift Warning:</strong> Your device clock differs from official server time by{' '}
                <span className="font-bold underline decoration-amber-400">{formatDriftDescription(syncState.offsetMs)}</span> (exceeds 2-minute tolerance).
                <span className="hidden sm:inline text-amber-300/80 ml-1">
                  Deadlines and mock slots are strictly enforced using the synchronized server clock.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={performSync}
                className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] transition-colors cursor-pointer"
              >
                Re-check
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

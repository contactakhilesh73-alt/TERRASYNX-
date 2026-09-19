/**
 * TERRASYNX: Autonomous Pulse Cockpit & Cron Monitor (Phase 5 Point 4)
 * Real-time reactive cockpit displaying autonomous heartbeat countdown,
 * cadence configuration (30s/1m/5m/15m/manual), instant sync trigger, and telemetry audit drawer.
 */

import React, { useState, useEffect } from 'react';
import { HeartbeatScheduler } from '../services/heartbeatScheduler';
import { PulseCadence, HeartbeatTelemetryLog } from '../types';
import { 
  Activity, 
  RefreshCw, 
  Clock, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck,
  Zap,
  Trash2,
  ExternalLink
} from 'lucide-react';

interface AutonomousPulseBarProps {
  onPulseComplete?: (newCount: number) => void;
}

export const AutonomousPulseBar: React.FC<AutonomousPulseBarProps> = ({
  onPulseComplete,
}) => {
  const [cadence, setCadence] = useState<PulseCadence>(HeartbeatScheduler.getCadence());
  const [secondsRemaining, setSecondsRemaining] = useState<number>(HeartbeatScheduler.getSecondsRemaining());
  const [isSyncing, setIsSyncing] = useState<boolean>(HeartbeatScheduler.isPulseSyncing());
  const [lastPulseTs, setLastPulseTs] = useState<number>(HeartbeatScheduler.getLastPulseTimestamp());
  const [logs, setLogs] = useState<HeartbeatTelemetryLog[]>(HeartbeatScheduler.getTelemetryLogs());
  const [audioEnabled, setAudioEnabled] = useState<boolean>(HeartbeatScheduler.isAudioEnabled());
  const [showLogsDrawer, setShowLogsDrawer] = useState<boolean>(false);
  const [recentNotification, setRecentNotification] = useState<string | null>(null);

  useEffect(() => {
    HeartbeatScheduler.init();

    const unsubscribe = HeartbeatScheduler.subscribe(() => {
      setCadence(HeartbeatScheduler.getCadence());
      setSecondsRemaining(HeartbeatScheduler.getSecondsRemaining());
      setIsSyncing(HeartbeatScheduler.isPulseSyncing());
      setLastPulseTs(HeartbeatScheduler.getLastPulseTimestamp());
      setLogs(HeartbeatScheduler.getTelemetryLogs());
      setAudioEnabled(HeartbeatScheduler.isAudioEnabled());
    });

    return unsubscribe;
  }, []);

  // Format seconds into MM:SS
  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate elapsed since last pulse
  const getElapsedText = (): string => {
    const elapsedSec = Math.floor((Date.now() - lastPulseTs) / 1000);
    if (elapsedSec < 5) return 'Just now';
    if (elapsedSec < 60) return `${elapsedSec}s ago`;
    const elapsedMin = Math.floor(elapsedSec / 60);
    return `${elapsedMin}m ago`;
  };

  const handleCadenceChange = (newCadence: PulseCadence) => {
    HeartbeatScheduler.setCadence(newCadence);
  };

  const handleInstantPulse = async () => {
    if (isSyncing) return;
    const log = await HeartbeatScheduler.triggerInstantPulse('manual');
    if (log.newRequisitionsFound > 0) {
      setRecentNotification(`+${log.newRequisitionsFound} fresh requisitions ingested!`);
      setTimeout(() => setRecentNotification(null), 4000);
      if (onPulseComplete) onPulseComplete(log.newRequisitionsFound);
    } else {
      setRecentNotification('All active requisitions certified fresh (0 new).');
      setTimeout(() => setRecentNotification(null), 3000);
    }
  };

  const handleToggleAudio = () => {
    HeartbeatScheduler.toggleAudio();
  };

  const handleClearLogs = () => {
    HeartbeatScheduler.clearTelemetryLogs();
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/95 shadow-xl overflow-hidden transition-all duration-300">
      {/* Top Banner & Control Ribbon */}
      <div className="p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-800/80">
        {/* Left: Active Beacon & Next Pulse Countdown */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex items-center justify-center">
            {cadence !== 'manual' ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSyncing ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isSyncing ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                </span>
              </>
            ) : (
              <span className="inline-flex rounded-full h-3 w-3 bg-slate-600" />
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Autonomous Opportunity Radar Heartbeat</span>
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                isSyncing 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' 
                  : cadence === 'manual'
                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {isSyncing ? 'SYNCING LIVE BOARDS...' : cadence === 'manual' ? 'MANUAL STANDBY' : 'LIVE PULSE ACTIVE'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Last pulse: <strong className="text-slate-300">{getElapsedText()}</strong></span>
              </span>
              <span>·</span>
              <span>
                Next automated pulse in:{' '}
                <strong className={`font-bold ${isSyncing ? 'text-amber-400 animate-pulse' : 'text-emerald-300'}`}>
                  {cadence === 'manual' ? 'PAUSED' : isSyncing ? 'Executing...' : formatTime(secondsRemaining)}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Cadence Segmented Pills */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start lg:self-auto overflow-x-auto max-w-full">
          {(['30s', '1m', '5m', '15m', 'manual'] as PulseCadence[]).map((c) => (
            <button
              key={c}
              onClick={() => handleCadenceChange(c)}
              className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                cadence === c
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {c === '30s' ? '30s Ultra' : c === '1m' ? '1m Rapid' : c === '5m' ? '5m Balanced' : c === '15m' ? '15m Eco' : 'Manual'}
            </button>
          ))}
        </div>

        {/* Right: Actions (Instant Pulse, Audio Toggle, Logs Inspector) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Audio Chime Button */}
          <button
            onClick={handleToggleAudio}
            title={audioEnabled ? 'New discovery audio chime ON' : 'New discovery audio chime OFF'}
            className={`p-2 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
              audioEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Instant Manual Pulse Button */}
          <button
            onClick={handleInstantPulse}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              isSyncing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Ingesting...' : 'Pulse Now'}</span>
          </button>

          {/* Telemetry Logs Drawer Toggle */}
          <button
            onClick={() => setShowLogsDrawer(!showLogsDrawer)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 text-xs font-mono transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Logs ({logs.length})</span>
            {showLogsDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Real-time Ingestion Flash Notification */}
      {recentNotification && (
        <div className="bg-emerald-950/60 border-b border-emerald-500/30 px-4 py-2 text-xs font-mono text-emerald-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{recentNotification}</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 uppercase tracking-wider">Tab Visibility Catch-up Enabled</span>
        </div>
      )}

      {/* Expanded Pulse Telemetry History Drawer */}
      {showLogsDrawer && (
        <div className="bg-slate-950/90 p-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
                Autonomous Heartbeat Telemetry & Execution Audit
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                (Last 15 Cycles · Non-Blocking Micro-Tasks)
              </span>
            </div>

            {logs.length > 0 && (
              <button
                onClick={handleClearLogs}
                className="flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono py-2">No execution logs recorded yet.</p>
          ) : (
            <div className="overflow-x-auto max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl border border-slate-800/90 bg-slate-900/70 hover:bg-slate-900 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    {log.status === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}

                    <span className="text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>

                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      {log.trigger.replace('_', ' ')}
                    </span>

                    <span className="text-slate-300 font-medium text-[11px]">
                      {log.notes}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0 pl-6 sm:pl-0">
                    <span>
                      Latency: <strong className="text-cyan-400">{log.durationMs}ms</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Cadence: <strong className="text-slate-300">{log.cadence}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Active: <strong className="text-emerald-400">{log.totalActiveRequisitions}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Enterprise Public Boards Monitored: Cloudflare, GitLab, Palantir, Scale AI, Automattic</span>
            <span className="text-slate-400">Strict Rule #3: Zero-Refresh Reactive Pulse</span>
          </div>
        </div>
      )}
    </div>
  );
};

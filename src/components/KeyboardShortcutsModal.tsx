/**
 * TERRASYNX: Tactical Keyboard Shortcuts & Command Cheat-Sheet (Phase 4 Point 3)
 * Provides rapid system navigation and instant productivity across all 10 intelligence modules.
 */

import React from 'react';
import { 
  Keyboard, 
  X, 
  Command, 
  Compass, 
  Kanban, 
  Cpu, 
  Sparkles, 
  FileText, 
  Bell, 
  Users, 
  Sliders, 
  BarChart3, 
  Calendar,
  ShieldCheck,
  Mic,
  DollarSign,
  Award,
  Network,
  Target,
  GitPullRequest
} from 'lucide-react';
import { NavigationMode } from '../types';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (mode: NavigationMode) => void;
  onOpenAudit: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAudit,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '1', label: 'Opportunity Radar', mode: 'radar' as NavigationMode, icon: Compass, color: 'text-cyan-400' },
    { key: '2', label: 'Kanban Pipeline', mode: 'pipeline' as NavigationMode, icon: Kanban, color: 'text-blue-400' },
    { key: '3', label: '10-D Fitment Studio', mode: 'evaluator' as NavigationMode, icon: Cpu, color: 'text-indigo-400' },
    { key: '4', label: 'Resume Tailor', mode: 'resume' as NavigationMode, icon: FileText, color: 'text-emerald-400' },
    { key: '5', label: 'Alert Relay Inbox', mode: 'alerts' as NavigationMode, icon: Bell, color: 'text-rose-400' },
    { key: '6', label: 'Alumni & Referrals', mode: 'insider' as NavigationMode, icon: Users, color: 'text-pink-400' },
    { key: '7', label: 'Candidate Profile Studio', mode: 'profile' as NavigationMode, icon: Sliders, color: 'text-purple-400' },
    { key: '8', label: 'Telemetry & Yield', mode: 'analytics' as NavigationMode, icon: BarChart3, color: 'text-cyan-300' },
    { key: '9', label: 'OA & Interview Calendar', mode: 'calendar' as NavigationMode, icon: Calendar, color: 'text-teal-400' },
    { key: '0 / M', label: 'Mock Interview Studio', mode: 'mock_interview' as NavigationMode, icon: Mic, color: 'text-indigo-400' },
    { key: 'O', label: 'Offer Evaluator Studio', mode: 'offer_evaluator' as NavigationMode, icon: DollarSign, color: 'text-purple-400' },
    { key: 'L', label: 'Career Launchpad & Onboarding', mode: 'career_launchpad' as NavigationMode, icon: Award, color: 'text-emerald-400' },
    { key: 'N', label: 'Alumni Referral Network Graph', mode: 'network_graph' as NavigationMode, icon: Network, color: 'text-cyan-400' },
    { key: 'R', label: 'Recruiter Intelligence Radar', mode: 'recruiter_radar' as NavigationMode, icon: Target, color: 'text-purple-400' },
    { key: 'T', label: 'Referral Lifecycle Tracker', mode: 'referral_tracker' as NavigationMode, icon: GitPullRequest, color: 'text-emerald-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>Tactical Keyboard Command Deck</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Global Hotkeys
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Press numeric keys anywhere to toggle intelligence views instantly.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Navigation Hotkeys Grid */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
              Direct Module Switchers
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {shortcuts.map(s => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.key}
                    onClick={() => {
                      onNavigate(s.mode);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${s.color}`} />
                      <span className="text-xs text-slate-200 group-hover:text-white font-medium">{s.label}</span>
                    </div>
                    <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 shadow-inner">
                      {s.key}
                    </kbd>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System & Global Controls */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
              System Operations
            </span>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 text-slate-300">
                <span>Toggle Shortcuts Palette</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-300">?</kbd>
                  <span className="text-slate-500">or</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-300">⌘K</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 text-slate-300">
                <span>Close Active Modal / Drawer</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-300">Esc</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 text-slate-300">
                <span>Open Production Audit &amp; Certification</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAudit();
                    }}
                    className="text-[11px] text-teal-400 hover:text-teal-300 underline cursor-pointer"
                  >
                    Open Suite
                  </button>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-300">Shift + C</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Conflict Hotkey Router</span>
          </span>
          <span className="text-[10px] text-slate-500">Press ESC anytime to exit</span>
        </div>
      </div>
    </div>
  );
};

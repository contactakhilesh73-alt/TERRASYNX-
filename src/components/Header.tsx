/**
 * TERRASYNX: Top Global Command Deck & Navigation Bar
 * Conforming strictly to SYSTEM_SPEC (Rules #1-#5, Req #1-#22)
 */

import React, { useState, useEffect } from 'react';
import { OperationalMode } from '../types';
import { InsigniaModal } from './InsigniaModal';
import { 
  Radar, 
  KanbanSquare, 
  Cpu, 
  FileText, 
  BellRing, 
  Users, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  Sliders,
  BarChart3,
  Calendar,
  Keyboard,
  Award,
  FolderArchive,
  Mic,
  DollarSign,
  Network,
  Target,
  GitPullRequest,
  Compass,
  Phone,
  Mail,
  UserPlus,
  LogIn
} from 'lucide-react';

interface HeaderProps {
  currentMode: OperationalMode;
  onModeChange: (mode: OperationalMode) => void;
  totalActiveCount: number;
  urgentCount: number;
  appliedCount: number;
  studentBatch: string;
  onResetFactory: () => void;
  onOpenCopilot: () => void;
  onOpenShortcuts?: () => void;
  onOpenAudit?: () => void;
  onOpenDossierVault?: () => void;
  currentUser?: any;
  onOpenAuth?: () => void;
  onSignInWithGoogle?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  totalActiveCount,
  urgentCount,
  appliedCount,
  studentBatch,
  onResetFactory,
  onOpenCopilot,
  onOpenShortcuts,
  onOpenAudit,
  onOpenDossierVault,
  currentUser,
  onOpenAuth,
  onSignInWithGoogle,
  onSignOut,
}) => {
  const [showInsigniaModal, setShowInsigniaModal] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    return localStorage.getItem('terrasynx_custom_logo_url') || '/assets/terrasynx-original.png';
  });

  useEffect(() => {
    const handleLogoUpdate = () => {
      const updated = localStorage.getItem('terrasynx_custom_logo_url') || '/assets/terrasynx-original.png';
      setLogoUrl(updated);
    };

    window.addEventListener('terrasynx_logo_updated', handleLogoUpdate);
    window.addEventListener('storage', handleLogoUpdate);
    return () => {
      window.removeEventListener('terrasynx_logo_updated', handleLogoUpdate);
      window.removeEventListener('storage', handleLogoUpdate);
    };
  }, []);

  return (
    <header id="terrasynx-header" className="sticky top-0 z-50 border-b border-cyan-900/40 bg-slate-950/90 backdrop-blur-md">
      {/* Topmost Tactical Pulse Banner */}
      <div className="flex items-center justify-between px-4 py-1.5 text-[11px] font-mono border-b border-cyan-950/60 bg-slate-900/40 text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-semibold tracking-wider">RADAR PULSE ACTIVE</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% CRYPTOGRAPHIC DOMAIN VERIFIED</span>
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="hidden md:inline text-slate-400">
            TARGET ELIGIBILITY: <span className="text-cyan-300 font-semibold">{studentBatch}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer text-[10px]"
              title="View Keyboard Shortcuts & Command Deck"
            >
              <Keyboard className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline font-mono">Hotkeys</span>
              <kbd className="hidden sm:inline px-1 py-0.2 rounded bg-slate-800 text-[9px] text-cyan-300 border border-slate-700 font-mono">
                ⌘K
              </kbd>
            </button>
          )}
          {onOpenAudit && (
            <>
              <span className="text-slate-700">|</span>
              <button
                onClick={onOpenAudit}
                className="flex items-center gap-1.5 text-teal-400 hover:text-teal-300 transition-colors cursor-pointer text-[10px]"
                title="Open Production Certification & Audit Suite"
              >
                <Award className="w-3.5 h-3.5" />
                <span className="font-mono font-semibold">Audit Suite</span>
              </button>
            </>
          )}
          {onOpenDossierVault && (
            <>
              <span className="text-slate-700">|</span>
              <button
                onClick={onOpenDossierVault}
                className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer text-[10px]"
                title="Permanent Applied Dossier Archive & Workspace Vault (Req #8 & #12)"
              >
                <FolderArchive className="w-3.5 h-3.5" />
                <span className="font-mono font-semibold">Dossier Vault</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold">
                  {appliedCount}
                </span>
              </button>
            </>
          )}
          <span className="text-slate-700">|</span>
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Ask in-app companion"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span className="hidden sm:inline">Copilot Guide</span>
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={onResetFactory}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors text-[10px]"
            title="Restore default verified data state"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Sync Fresh</span>
          </button>

          {/* Student Authentication Deck (Phone OTP, Gmail OTP, Google) */}
          <span className="text-slate-700">|</span>
          {currentUser ? (
            <div className="flex items-center gap-2 pl-0.5">
              {currentUser.channel === 'phone' ? (
                <div className="w-5 h-5 rounded-md bg-cyan-950 border border-cyan-600/70 text-cyan-300 flex items-center justify-center">
                  <Phone className="w-3 h-3" />
                </div>
              ) : currentUser.channel === 'email' ? (
                <div className="w-5 h-5 rounded-md bg-cyan-950 border border-cyan-600/70 text-cyan-300 flex items-center justify-center">
                  <Mail className="w-3 h-3" />
                </div>
              ) : currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || 'User'} 
                  className="w-5 h-5 rounded-full border border-emerald-500/60 object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 text-[10px] font-bold flex items-center justify-center font-mono">
                  {(currentUser.displayName || currentUser.identifier || 'S').charAt(0).toUpperCase()}
                </div>
              )}

              <span className="text-slate-200 font-medium text-[11px] max-w-[130px] truncate hidden md:inline font-mono">
                {currentUser.displayName || currentUser.identifier}
              </span>

              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono hidden lg:inline">
                {currentUser.channel === 'phone' ? 'Phone Verified' : currentUser.channel === 'email' ? 'Gmail Verified' : 'Google Verified'}
              </span>

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="text-[10px] font-mono text-slate-400 hover:text-rose-300 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Sign out of student account"
                >
                  Sign Out
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (onOpenAuth) onOpenAuth();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 text-[11px] font-mono font-bold transition-all cursor-pointer shadow-sm shadow-cyan-950/50"
                title="Create a new student account (Sign Up)"
              >
                <UserPlus className="w-3.5 h-3.5 text-slate-950" />
                <span>Sign Up</span>
              </button>
              <button
                onClick={() => {
                  if (onOpenAuth) onOpenAuth();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-700/70 text-[11px] font-mono font-medium transition-all cursor-pointer"
                title="Sign in with verified mobile or email"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Branding & Operational Modes Deck */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setShowInsigniaModal(true)}
              className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/25 to-blue-600/15 border border-cyan-500/50 flex items-center justify-center shadow-lg shadow-cyan-950/60 overflow-hidden hover:border-cyan-400 hover:scale-105 transition-all cursor-pointer group"
              title="Inspect Full-Resolution System Insignia & Radar Vector"
            >
              <img 
                src={logoUrl} 
                alt="TerraSynx Emblem" 
                className="w-full h-full object-contain p-0.5 drop-shadow-[0_0_10px_rgba(56,189,248,0.85)] group-hover:drop-shadow-[0_0_14px_rgba(103,232,249,1)] transition-all" 
                referrerPolicy="no-referrer"
                onError={() => {
                  if (logoUrl !== '/assets/terrasynx-crest.svg') {
                    setLogoUrl('/assets/terrasynx-crest.svg');
                  }
                }}
              />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
                  TERRASYNX
                </h1>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  GLOBAL OS
                </span>
                <button
                  onClick={() => setShowInsigniaModal(true)}
                  className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 hover:text-cyan-100 border border-cyan-600/60 flex items-center gap-1 transition-all cursor-pointer shadow-sm shadow-cyan-950"
                  title="View full-size Ultra-HD Master Radar graphic (Zero Pixelation Vector)"
                >
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                  <span>HD RADAR</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                Autonomous Early-Career Intelligence &amp; Urgency Radar
              </p>
            </div>
          </div>

          {/* Tactical Metric Quick-Indicators */}
          <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
              <span className="text-slate-400">Active Roles:</span>
              <span className="font-bold text-slate-100">{totalActiveCount}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-900/40 text-red-300 shadow-inner">
              <Clock className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span className="text-red-400 font-medium">&lt;72h Window:</span>
              <span className="font-bold text-red-200">{urgentCount}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-emerald-300 shadow-inner">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Applied:</span>
              <span className="font-bold text-emerald-200">{appliedCount}</span>
            </div>
          </div>
        </div>

        {/* 6 Core Operational Mode Switcher (Req #17) */}
        <nav id="operational-modes-nav" className="mt-3.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-900/80 pt-2.5">
          <button
            onClick={() => onModeChange('radar')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentMode === 'radar'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-sm shadow-cyan-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <Radar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Opportunity Radar</span>
          </button>

          <button
            onClick={() => onModeChange('pipeline')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentMode === 'pipeline'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-sm shadow-cyan-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <KanbanSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Kanban Pipeline</span>
            {appliedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800">
                {appliedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onModeChange('internship_calendar')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentMode === 'internship_calendar'
                ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/50 shadow-sm shadow-indigo-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Seasonal Internships</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800">
              Ongoing &amp; Upcoming
            </span>
          </button>

          <button
            onClick={() => onModeChange('evaluator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentMode === 'evaluator'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-sm shadow-cyan-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>10-D Fitment Studio</span>
          </button>

          <button
            onClick={() => onModeChange('resume')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentMode === 'resume'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-sm shadow-cyan-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>ATS Resume Crafter</span>
          </button>

          <button
            onClick={() => onModeChange('alerts')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentMode === 'alerts'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-sm shadow-cyan-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <BellRing className="w-3.5 h-3.5 text-rose-400" />
            <span>Email & Alert Relay</span>
          </button>

          <button
            onClick={() => onModeChange('insider')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentMode === 'insider'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-sm shadow-cyan-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Alumni & Insider Bridge</span>
          </button>

          <button
            onClick={() => onModeChange('profile')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentMode === 'profile'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-sm shadow-cyan-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>Profile & Context Studio</span>
          </button>

          <button
            onClick={() => onModeChange('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentMode === 'analytics'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-sm shadow-cyan-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Telemetry &amp; Funnel Yield</span>
          </button>

          <button
            onClick={() => onModeChange('calendar')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentMode === 'calendar'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-sm shadow-cyan-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <span>OA &amp; Interview Calendar</span>
          </button>

          <button
            onClick={() => onModeChange('mock_interview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentMode === 'mock_interview'
                ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/50 shadow-sm shadow-indigo-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-indigo-400" />
            <span>Mock Interview Studio</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 font-mono">
              P7.1
            </span>
          </button>

          <button
            onClick={() => onModeChange('offer_evaluator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentMode === 'offer_evaluator'
                ? 'bg-purple-500/20 text-purple-200 border border-purple-500/50 shadow-sm shadow-purple-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-purple-400" />
            <span>Offer Evaluator</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-purple-950/80 text-purple-300 border border-purple-700/60 font-mono">
              P7.2
            </span>
          </button>

          <button
            onClick={() => onModeChange('career_launchpad')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentMode === 'career_launchpad'
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/50 shadow-sm shadow-emerald-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Career Launchpad</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-mono">
              P7.3
            </span>
          </button>

          <button
            onClick={() => onModeChange('network_graph')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentMode === 'network_graph'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-sm shadow-cyan-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span>Network Graph</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 font-mono">
              P8.1
            </span>
          </button>

          <button
            onClick={() => onModeChange('recruiter_radar')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentMode === 'recruiter_radar'
                ? 'bg-purple-500/20 text-purple-200 border border-purple-500/50 shadow-sm shadow-purple-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-purple-400" />
            <span>Recruiter Radar</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-purple-950/80 text-purple-300 border border-purple-700/60 font-mono">
              P8.2
            </span>
          </button>

          <button
            onClick={() => onModeChange('referral_tracker')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentMode === 'referral_tracker'
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/50 shadow-sm shadow-emerald-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5 text-emerald-400" />
            <span>Referral Tracker</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-mono">
              P8.3
            </span>
          </button>
        </nav>
      </div>

      <InsigniaModal 
        isOpen={showInsigniaModal} 
        onClose={() => setShowInsigniaModal(false)} 
      />
    </header>
  );
};

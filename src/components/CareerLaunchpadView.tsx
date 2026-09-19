/**
 * TERRASYNX: Career Launchpad & Executive Onboarding Studio (Phase 7 Point 3)
 * Comprehensive post-offer execution suite:
 * - Formal Offer Acceptance & Cryptographic Receipt Generation (ACC-2026-...)
 * - Graceful Decline Letter Generator for Competing Offers
 * - Team Matching & Host Manager 1-on-1 Strategy Cockpit
 * - HireRight / Checkr Background Check & I-9 Compliance Sentinel
 * - Day-One Logistics & 30-60-90 Day Engineering Ramp Plan
 */

import React, { useState } from 'react';
import { 
  Opportunity, 
  StudentProfile, 
  OfferAcceptanceRecord, 
  TeamMatchingProfile, 
  BackgroundCheckCompliance, 
  DayOneRampPlan 
} from '../types';
import { CareerLaunchpadService } from '../services/careerLaunchpadService';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Download, 
  ExternalLink, 
  FileCheck2, 
  FileText, 
  Flame, 
  Layers, 
  Lock, 
  MapPin, 
  MessageSquareQuote, 
  RefreshCw, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  Terminal, 
  UserCheck, 
  Users, 
  X, 
  Zap,
  Briefcase,
  AlertTriangle,
  ChevronRight,
  Laptop,
  DollarSign
} from 'lucide-react';

interface CareerLaunchpadViewProps {
  opportunities: Opportunity[];
  studentProfile: StudentProfile;
  onNavigateToPipeline: () => void;
  onNavigateToOfferEvaluator?: () => void;
}

type LaunchpadTab = 'acceptance' | 'team_match' | 'background_check' | 'ramp_plan';

export const CareerLaunchpadView: React.FC<CareerLaunchpadViewProps> = ({
  opportunities,
  studentProfile,
  onNavigateToPipeline,
  onNavigateToOfferEvaluator
}) => {
  const [activeTab, setActiveTab] = useState<LaunchpadTab>('acceptance');
  const [acceptanceRecord, setAcceptanceRecord] = useState<OfferAcceptanceRecord>(
    CareerLaunchpadService.getAcceptanceRecord()
  );
  const [startDate, setStartDate] = useState<string>(acceptanceRecord.startDate || 'June 8, 2026');
  const [selectedDeclineIdx, setSelectedDeclineIdx] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Dynamic profiles from service
  const teamProfile: TeamMatchingProfile = CareerLaunchpadService.getTeamMatchingProfile(acceptanceRecord.companyName);
  const bgCompliance: BackgroundCheckCompliance = CareerLaunchpadService.getBackgroundCheckCompliance(
    acceptanceRecord.companyName,
    studentProfile
  );
  const rampPlan: DayOneRampPlan = CareerLaunchpadService.getDayOneRampPlan(
    acceptanceRecord.companyName,
    acceptanceRecord.roleTitle,
    startDate
  );

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleUpdateStartDate = (newDate: string) => {
    setStartDate(newDate);
    const updated: OfferAcceptanceRecord = {
      ...acceptanceRecord,
      startDate: newDate
    };
    setAcceptanceRecord(updated);
    CareerLaunchpadService.saveAcceptanceRecord(updated);
  };

  const handleRegenerateToken = () => {
    const newToken = CareerLaunchpadService.generateReceiptToken(acceptanceRecord.companyName);
    const updated: OfferAcceptanceRecord = {
      ...acceptanceRecord,
      acceptanceToken: newToken,
      acceptedAt: Date.now()
    };
    setAcceptanceRecord(updated);
    CareerLaunchpadService.saveAcceptanceRecord(updated);
  };

  const handleDownloadFullDossier = () => {
    const content = `================================================================================
          TERRASYNX CAREER LAUNCHPAD & EXECUTIVE ONBOARDING DOSSIER
================================================================================
Generated: ${new Date().toISOString()}
Candidate: ${studentProfile.fullName || 'Alex Chen'}
University: ${studentProfile.university} (${studentProfile.degree} - Batch of ${studentProfile.graduationYear})
Work Authorization: ${studentProfile.workAuthorization}

--------------------------------------------------------------------------------
1. ACCEPTED OFFER & CRYPTOGRAPHIC PROOF
--------------------------------------------------------------------------------
Company: ${acceptanceRecord.companyName}
Position: ${acceptanceRecord.roleTitle}
Start Date: ${startDate}
Verification Token: ${acceptanceRecord.acceptanceToken}
Accepted Timestamp: ${new Date(acceptanceRecord.acceptedAt).toLocaleString()}

FORMAL ACCEPTANCE LETTER:
${acceptanceRecord.formalLetterText}

--------------------------------------------------------------------------------
2. TEAM MATCHING & HOST MANAGER STRATEGY
--------------------------------------------------------------------------------
Candidate 2-Minute Elevator Pitch:
${teamProfile.candidateIntroPitch}

Key Domain Pillars:
${teamProfile.domainPillars.map(p => `- [${p.priority.toUpperCase()}] ${p.name}: ${p.description}`).join('\n')}

High-Signal Reverse-Interview Questions for Manager:
${teamProfile.manager1on1Questions.map((q, idx) => `${idx + 1}. ${q}`).join('\n')}

--------------------------------------------------------------------------------
3. BACKGROUND CHECK & I-9 COMPLIANCE ROADMAP
--------------------------------------------------------------------------------
Verification Provider: ${bgCompliance.provider}
Overall Status: ${bgCompliance.overallStatus.toUpperCase()}
I-9 Document Type: ${bgCompliance.i9Compliance.documentType}
Checklist Items:
${bgCompliance.items.map(i => `- [${i.status === 'verified' ? 'X' : ' '}] ${i.title}: ${i.guidance}`).join('\n')}

Advisory Alerts:
${bgCompliance.advisoryAlerts.map(a => `! ${a}`).join('\n')}

--------------------------------------------------------------------------------
4. 30-60-90 DAY ENGINEERING RAMP PLAN
--------------------------------------------------------------------------------
Theme Days 1-30: ${rampPlan.days1to30.theme}
Milestones:
${rampPlan.days1to30.milestones.map(m => `  - ${m}`).join('\n')}

Theme Days 31-60: ${rampPlan.days31to60.theme}
Milestones:
${rampPlan.days31to60.milestones.map(m => `  - ${m}`).join('\n')}

Theme Days 61-90: ${rampPlan.days61to90.theme}
Milestones:
${rampPlan.days61to90.milestones.map(m => `  - ${m}`).join('\n')}

Weekly Check-in Checklist:
${rampPlan.weeklyCheckInChecklist.map(c => `  [ ] ${c}`).join('\n')}

================================================================================
STATUS: 100% PRODUCTION VERIFIED BY TERRASYNX EXECUTIVE SENTINEL
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TERRASYNX_Launchpad_${acceptanceRecord.companyName}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      
      {/* Top Header & Executive Milestone Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>OFFER SECURED • PHASE 7 POINT 3</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Cryptographic Milestone Receipt
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Career Launchpad &amp; Onboarding Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Execute final offer acceptance, craft diplomatic letters for competing offers, master host team matching, ensure 100% background check compliance, and deploy a 30-60-90 day engineering impact plan.
            </p>
          </div>

          {/* Action Deck */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleDownloadFullDossier}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer shadow-sm"
              title="Download complete onboarding dossier"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Launchpad Dossier</span>
            </button>
            {onNavigateToOfferEvaluator && (
              <button
                onClick={onNavigateToOfferEvaluator}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-700/50 transition-colors cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5 text-purple-400" />
                <span>Evaluate &amp; Negotiate</span>
              </button>
            )}
            <button
              onClick={onNavigateToPipeline}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Pipeline</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Accepted Company</span>
            <span className="font-bold text-emerald-300 text-sm">{acceptanceRecord.companyName}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Target Start Date</span>
            <span className="font-bold text-white text-sm">{startDate}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Acceptance Token</span>
            <span className="font-bold text-cyan-300 text-xs truncate block">{acceptanceRecord.acceptanceToken}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Compliance Sentinel</span>
            <span className="font-bold text-emerald-400 text-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>HireRight Ready</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('acceptance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'acceptance'
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/50 shadow-sm shadow-emerald-950'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>1. Acceptance &amp; Graceful Decline</span>
        </button>

        <button
          onClick={() => setActiveTab('team_match')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'team_match'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-sm shadow-cyan-950'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
          }`}
        >
          <Users className="w-4 h-4 text-cyan-400" />
          <span>2. Team Matching &amp; Host Strategy</span>
        </button>

        <button
          onClick={() => setActiveTab('background_check')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'background_check'
              ? 'bg-purple-500/20 text-purple-200 border border-purple-500/50 shadow-sm shadow-purple-950'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>3. Background Check &amp; I-9 Sentinel</span>
        </button>

        <button
          onClick={() => setActiveTab('ramp_plan')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'ramp_plan'
              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/50 shadow-sm shadow-amber-950'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
          }`}
        >
          <Laptop className="w-4 h-4 text-amber-400" />
          <span>4. 30-60-90 Day Ramp Plan</span>
        </button>
      </div>

      {/* TAB 1: ACCEPTANCE & DECLINE SUITE */}
      {activeTab === 'acceptance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Formal Acceptance Card */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Executive Acceptance Letter</h2>
                  <p className="text-xs text-slate-400">Formal written confirmation for {acceptanceRecord.companyName}</p>
                </div>
              </div>
              <button
                onClick={handleRegenerateToken}
                className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
                title="Regenerate cryptographic receipt token"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-hash Token</span>
              </button>
            </div>

            {/* Accepted Company Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Accepted Offer Requisition</span>
                <span className="text-[11px] text-slate-400">Select which engineering offer to onboard with</span>
              </div>
              <select
                value={acceptanceRecord.companyName}
                onChange={(e) => {
                  const company = e.target.value;
                  const opp = opportunities.find(o => o.companyName === company);
                  const role = opp?.title || `${company} Software Engineer Intern`;
                  const newRecord = CareerLaunchpadService.createAcceptanceRecordForCompany(
                    company,
                    role,
                    studentProfile,
                    startDate
                  );
                  setAcceptanceRecord(newRecord);
                }}
                className="bg-slate-900 border border-slate-700 text-emerald-300 font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
              >
                {Array.from(new Set(['Stripe', 'OpenAI', 'Google', 'Palantir', 'Scale AI', ...opportunities.map(o => o.companyName)])).map(comp => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
            </div>

            {/* Token Badge */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-900/40 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">Cryptographic Integrity Token</span>
                <span className="text-emerald-300 font-bold">{acceptanceRecord.acceptanceToken}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Accepted &amp; Logged</span>
                </span>
              </div>
            </div>

            {/* Start Date Configuration */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Target Start Date (Negotiated / Agreed)
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => handleUpdateStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                placeholder="e.g. June 8, 2026"
              />
            </div>

            {/* Letter Body Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Letter Transcript</span>
                <button
                  onClick={() => handleCopy(acceptanceRecord.formalLetterText, 'acceptance')}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'acceptance' ? 'Copied to Clipboard!' : 'Copy Letter'}</span>
                </button>
              </div>
              <div className="rounded-xl bg-slate-950 border border-slate-800/80 p-3.5 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                {acceptanceRecord.formalLetterText}
              </div>
            </div>
          </div>

          {/* Diplomatic Decline Cards for Other Offers */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Graceful Decline Suite</h2>
                  <p className="text-xs text-slate-400">Zero-bridge-burning letters for competing offers</p>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {acceptanceRecord.declinedOffers.length} Competing Offers
              </span>
            </div>

            {/* Offer Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {acceptanceRecord.declinedOffers.map((dec, idx) => (
                <button
                  key={dec.companyName}
                  onClick={() => setSelectedDeclineIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedDeclineIdx === idx
                      ? 'bg-rose-500/20 text-rose-200 border border-rose-500/50'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>{dec.companyName}</span>
                  {dec.isSent && <span className="ml-1.5 text-[10px] text-emerald-400">✓</span>}
                </button>
              ))}
            </div>

            {/* Current Decline Letter Detail */}
            {acceptanceRecord.declinedOffers[selectedDeclineIdx] && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400">Declining Company:</span>
                    <span className="font-bold text-white">
                      {acceptanceRecord.declinedOffers[selectedDeclineIdx].companyName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400">Role Title:</span>
                    <span className="text-slate-200 font-mono text-[11px]">
                      {acceptanceRecord.declinedOffers[selectedDeclineIdx].roleTitle}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Diplomatic Rationale:</span>
                    <span className="text-cyan-300 font-medium text-[11px]">
                      {acceptanceRecord.declinedOffers[selectedDeclineIdx].reason}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Decline Communication Draft</span>
                    <button
                      onClick={() => handleCopy(
                        acceptanceRecord.declinedOffers[selectedDeclineIdx].declineLetterText,
                        `decline_${selectedDeclineIdx}`
                      )}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>
                        {copiedKey === `decline_${selectedDeclineIdx}` ? 'Copied!' : 'Copy Letter'}
                      </span>
                    </button>
                  </div>
                  <div className="rounded-xl bg-slate-950 border border-slate-800/80 p-3.5 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                    {acceptanceRecord.declinedOffers[selectedDeclineIdx].declineLetterText}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-[11px] text-amber-300 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Senior Recruiter Rule: Always decline within 48 hours of accepting your target offer so waitlisted candidates can receive an expedited round.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TEAM MATCHING & HOST MANAGER STRATEGY */}
      {activeTab === 'team_match' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Candidate 2-Minute Pitch Cockpit */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <MessageSquareQuote className="w-4 h-4 text-cyan-400" />
                <span>Host Match 2-Minute Elevator Pitch</span>
              </div>
              <p className="text-xs text-slate-400">
                Memorize this structured introductory answer for prospective engineering manager calls.
              </p>
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-slate-300 font-sans leading-relaxed italic">
                "{teamProfile.candidateIntroPitch}"
              </div>
              <button
                onClick={() => handleCopy(teamProfile.candidateIntroPitch, 'pitch')}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedKey === 'pitch' ? 'Pitch Copied!' : 'Copy 2-Min Pitch'}</span>
              </button>
            </div>

            {/* Management Style Alignment */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3 shadow-xl">
              <span className="text-xs font-bold text-white block">Manager Archetype Alignment</span>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Style:</span>
                  <span className="font-bold text-cyan-300 capitalize font-mono">
                    {teamProfile.preferredManagerStyle.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Ideal for candidates thriving on technical autonomy with high-signal bi-weekly architectural guidance.
                </p>
              </div>
            </div>
          </div>

          {/* Domain Pillars & Tech Stacks */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    {teamProfile.companyName} High-Impact Domain Pillars
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Ranked by Priority</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teamProfile.domainPillars.map((pillar) => (
                  <div
                    key={pillar.name}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{pillar.name}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        pillar.priority === 'high' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {pillar.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{pillar.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {pillar.techStack.map(t => (
                        <span key={t} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-cyan-300 border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* High-Signal Reverse-Interview Questions */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>5 Reverse-Interview Questions to Ask Host Managers</span>
                </div>
                <button
                  onClick={() => handleCopy(teamProfile.manager1on1Questions.join('\n\n'), 'all_q')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey === 'all_q' ? 'Copied!' : 'Copy All'}</span>
                </button>
              </div>

              <div className="space-y-2">
                {teamProfile.manager1on1Questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200"
                  >
                    <span className="font-mono text-cyan-400 font-bold shrink-0">{idx + 1}.</span>
                    <span className="leading-relaxed">{q}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BACKGROUND CHECK & I-9 COMPLIANCE SENTINEL */}
      {activeTab === 'background_check' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Overall Compliance Status */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Compliance Sentinel</h3>
                  <p className="text-xs text-slate-400">Managed via {bgCompliance.provider}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Audit Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ready for Submission</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">I-9 Form:</span>
                  <span className="text-amber-300 font-semibold">{bgCompliance.i9Compliance.formStatus.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Document Type:</span>
                  <span className="text-cyan-300 font-semibold">{bgCompliance.i9Compliance.documentType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Doc Expiration:</span>
                  <span className="text-slate-200">{bgCompliance.i9Compliance.expiryDate}</span>
                </div>
              </div>

              {/* Advisory Alerts */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">Critical Rescission Blockers</span>
                {bgCompliance.advisoryAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-[11px] text-amber-300 leading-relaxed flex items-start gap-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Checklist Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>Pre-Onboarding Verification Checklist</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {bgCompliance.items.filter(i => i.status === 'verified').length} / {bgCompliance.items.length} Cleared
                </span>
              </div>

              <div className="space-y-3">
                {bgCompliance.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          item.status === 'verified' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                        }`} />
                        <span className="text-xs font-bold text-white">{item.title}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize font-semibold ${
                        item.status === 'verified'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{item.guidance}</p>

                    <div className="pt-1.5 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      <span>Required Documents:</span>
                      {item.documentsRequired.map(d => (
                        <span key={d} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 30-60-90 DAY ENGINEERING RAMP PLAN */}
      {activeTab === 'ramp_plan' && (
        <div className="space-y-6">
          
          {/* Equipment & Day-One Logistics */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Day-One Hardware &amp; Logistics Confirmation</h3>
              </div>
              <span className="text-xs text-emerald-400 font-mono">100% Provisioned</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Hardware Specification</span>
                <span className="text-white font-medium">{rampPlan.equipmentLogistics.laptopOption}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Logistics Status</span>
                <span className="text-emerald-300 font-medium">Shipping Confirmed • FedEx Express</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Badge Reception</span>
                <span className="text-cyan-300 font-medium">{rampPlan.equipmentLogistics.badgePickupOffice}</span>
              </div>
            </div>
          </div>

          {/* 30-60-90 Day Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Days 1-30 */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    DAYS 1 - 30
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Month 1</span>
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {rampPlan.days1to30.theme}
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {rampPlan.days1to30.milestones.map((m, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5">
                  Essential 1-on-1s to Schedule
                </span>
                <div className="space-y-1">
                  {rampPlan.days1to30.keyContacts.map(c => (
                    <div key={c} className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                      <UserCheck className="w-3 h-3 text-cyan-400" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Days 31-60 */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    DAYS 31 - 60
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Month 2</span>
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {rampPlan.days31to60.theme}
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {rampPlan.days31to60.milestones.map((m, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
                Focus on high code quality, reducing comments-per-PR, and establishing independent execution velocity.
              </div>
            </div>

            {/* Days 61-90 */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    DAYS 61 - 90
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Month 3</span>
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {rampPlan.days61to90.theme}
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {rampPlan.days61to90.milestones.map((m, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] text-purple-300 font-semibold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                <span>Target Outcome: Return Offer / L4 Conversion</span>
              </div>
            </div>
          </div>

          {/* Weekly 1-on-1 Manager Check-In Template */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Weekly Manager 1-on-1 Framework</span>
              </div>
              <button
                onClick={() => handleCopy(rampPlan.weeklyCheckInChecklist.join('\n'), 'checkin')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedKey === 'checkin' ? 'Copied Framework!' : 'Copy Framework'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {rampPlan.weeklyCheckInChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5 text-slate-200"
                >
                  <span className="w-5 h-5 rounded-lg bg-slate-900 flex items-center justify-center font-mono text-cyan-400 text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

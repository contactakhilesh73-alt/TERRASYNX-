/**
 * TERRASYNX: Referral Lifecycle Tracker & Back-Channel Status Reconciler (Phase 8 Point 3)
 * Interactive dashboard for monitoring employee internal portal submissions, referee endorsement sync,
 * back-channel hiring squad telemetry, fast-track status indicators, and thank-you note drafters.
 */

import React, { useState, useMemo } from 'react';
import { 
  Opportunity, 
  StudentProfile, 
  ReferralLifecycleRecord, 
  ReferralSubmissionStage 
} from '../types';
import { ReferralLifecycleService } from '../services/referralLifecycleService';
import { CompanyLogo } from './CompanyLogo';
import { 
  GitPullRequest, 
  CheckCircle2, 
  Clock, 
  Building2, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Send, 
  Copy, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Users, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  Award, 
  RefreshCw,
  Plus,
  Mail
} from 'lucide-react';

interface ReferralTrackerViewProps {
  opportunities: Opportunity[];
  studentProfile: StudentProfile;
  onNavigateToPipeline?: () => void;
  onOpenOpportunity?: (opp: Opportunity) => void;
  onOpenEmailDraft?: (opportunity: Opportunity) => void;
}

const STAGE_CONFIG: Record<ReferralSubmissionStage, { label: string; color: string; bg: string; border: string }> = {
  requested: {
    label: '1. Referral Requested',
    color: 'text-slate-300',
    bg: 'bg-slate-900',
    border: 'border-slate-700'
  },
  endorsed_by_referee: {
    label: '2. Internal Portal Endorsed',
    color: 'text-indigo-400',
    bg: 'bg-indigo-950/40',
    border: 'border-indigo-800'
  },
  ats_linked: {
    label: '3. ATS Requisition Linked',
    color: 'text-cyan-400',
    bg: 'bg-cyan-950/40',
    border: 'border-cyan-800'
  },
  hiring_loop_priority: {
    label: '4. Fast-Track Priority Loop',
    color: 'text-purple-400',
    bg: 'bg-purple-950/40',
    border: 'border-purple-800'
  },
  converted_to_interview: {
    label: '5. Converted to Interview',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-800'
  },
  referral_bonus_locked: {
    label: '6. Offer Accepted & Bonus Locked',
    color: 'text-amber-400',
    bg: 'bg-amber-950/40',
    border: 'border-amber-800'
  }
};

export const ReferralTrackerView: React.FC<ReferralTrackerViewProps> = ({
  opportunities,
  studentProfile,
  onNavigateToPipeline,
  onOpenOpportunity,
  onOpenEmailDraft,
}) => {
  const [records, setRecords] = useState<ReferralLifecycleRecord[]>(() => 
    ReferralLifecycleService.getRecords()
  );
  const [selectedRecordId, setSelectedRecordId] = useState<string>(records[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'tracker' | 'telemetry' | 'gratitude_drafter'>('tracker');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);

  // New Referral form state
  const [newOppId, setNewOppId] = useState<string>(opportunities[0]?.id || '');
  const [newRefereeName, setNewRefereeName] = useState<string>('');
  const [newRefereeRole, setNewRefereeRole] = useState<string>('');
  const [newRefereeEmail, setNewRefereeEmail] = useState<string>('');
  const [newEndorsementNote, setNewEndorsementNote] = useState<string>('');

  const stats = useMemo(() => ReferralLifecycleService.getStats(), [records]);

  const activeRecord = useMemo(() => {
    return records.find(r => r.id === selectedRecordId) || records[0];
  }, [records, selectedRecordId]);

  const handleStageChange = (recordId: string, nextStage: ReferralSubmissionStage) => {
    const updated = ReferralLifecycleService.updateStage(recordId, nextStage);
    setRecords(updated);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    const targetOpp = opportunities.find(o => o.id === newOppId) || opportunities[0];
    if (!targetOpp || !newRefereeName.trim()) return;

    const created = ReferralLifecycleService.createRecord(
      targetOpp,
      newRefereeName.trim(),
      newRefereeRole.trim() || 'Software Engineer',
      newRefereeEmail.trim() || `${newRefereeName.toLowerCase().replace(/\s+/g, '.')}@${targetOpp.verification.rootDomain}`,
      newEndorsementNote.trim()
    );

    const latest = ReferralLifecycleService.getRecords();
    setRecords(latest);
    setSelectedRecordId(created.id);
    setIsNewModalOpen(false);

    // Reset inputs
    setNewRefereeName('');
    setNewRefereeRole('');
    setNewRefereeEmail('');
    setNewEndorsementNote('');
  };

  const currentStageInfo = activeRecord ? STAGE_CONFIG[activeRecord.stage] : STAGE_CONFIG.requested;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
      
      {/* Header Deck: Referral Lifecycle Tracker & Reconciler */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <GitPullRequest className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white font-mono tracking-tight">
                Referral Lifecycle Tracker &amp; Back-Channel Reconciler
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                Phase 8 Point 3   Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Internal employee referral submission tracking, ATS back-channel status reconciler, and interview conversion accelerator
            </p>
          </div>
        </div>

        {/* Global Key Metrics */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="p-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Tracked Referrals</div>
            <div className="text-base font-bold font-mono text-white">{stats.totalTrackedReferrals} Active</div>
          </div>
          <div className="p-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Interview Conversions</div>
            <div className="text-base font-bold font-mono text-emerald-400">{stats.interviewConvertedCount} Scheduled</div>
          </div>
          <div className="p-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Speed to Interview</div>
            <div className="text-base font-bold font-mono text-cyan-300">{stats.averageSpeedToFirstInterviewDays} Days</div>
          </div>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition-all cursor-pointer shadow-lg shadow-emerald-950/50"
          >
            <Plus className="w-4 h-4" />
            <span>Log Referral</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'tracker'
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <GitPullRequest className="w-4 h-4" />
          <span>1. Referral Lifecycle Board</span>
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'telemetry'
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>2. Back-Channel Telemetry &amp; Squad Assignment</span>
        </button>
        <button
          onClick={() => setActiveTab('gratitude_drafter')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'gratitude_drafter'
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>3. Referee Milestone &amp; Gratitude Drafter</span>
        </button>
      </div>

      {/* TAB 1: REFERRAL LIFECYCLE BOARD */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Referral Records List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>Active Tracked Submissions ({records.length})</span>
                <span>Speed Multiplier</span>
              </div>

              <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                {records.map(rec => {
                  const isSelected = rec.id === activeRecord?.id;
                  const stageMeta = STAGE_CONFIG[rec.stage];

                  return (
                    <div
                      key={rec.id}
                      onClick={() => setSelectedRecordId(rec.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <CompanyLogo
                            domain={rec.companyDomain}
                            name={rec.companyName}
                            size="md"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{rec.companyName}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                                {rec.portalSubmissionId}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 font-medium line-clamp-1 mt-0.5">{rec.roleTitle}</p>
                            <p className="text-[11px] text-emerald-300 font-mono mt-1 flex items-center gap-1">
                              <Users className="w-3 h-3 text-emerald-400" />
                              <span>Referee: {rec.refereeName}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                            {rec.priorityMultiplier}x Speed
                          </span>
                        </div>
                      </div>

                      {/* Current Stage Badge */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${stageMeta.bg} ${stageMeta.color} border ${stageMeta.border}`}>
                          {stageMeta.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Updated {Math.round((Date.now() - rec.backChannelTelemetry.lastActivityTimestamp) / 3600000)}h ago
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Detailed Tracking Cockpit (7 cols) */}
            {activeRecord && (
              <div className="lg:col-span-7 space-y-4">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
                  
                  {/* Top Requisition Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <CompanyLogo
                        domain={activeRecord.companyDomain}
                        name={activeRecord.companyName}
                        size="lg"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-white">{activeRecord.companyName}</h2>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {activeRecord.portalSubmissionId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium mt-0.5">
                          {activeRecord.roleTitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onOpenEmailDraft && (
                        <button
                          onClick={() => {
                            const opp = opportunities.find(o => o.id === activeRecord.opportunityId) || opportunities[0];
                            if (opp) onOpenEmailDraft(opp);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 text-xs font-mono font-medium border border-indigo-800/60 transition-colors cursor-pointer"
                          title="Draft Referral Outreach Email with Gemini AI"
                        >
                          <Mail className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Draft Outreach Email</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleCopy(activeRecord.portalSubmissionId, 'sub_id')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium border border-slate-700 cursor-pointer"
                      >
                        {copiedKey === 'sub_id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'sub_id' ? 'Copied ID' : 'Copy ID'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 6-Stage Progress Stepper */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>Referral Progression Pipeline:</span>
                      <span className="text-emerald-400 font-bold">{currentStageInfo.label}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.keys(STAGE_CONFIG) as ReferralSubmissionStage[]).map((stgKey) => {
                        const isCurrent = activeRecord.stage === stgKey;
                        const meta = STAGE_CONFIG[stgKey];

                        return (
                          <button
                            key={stgKey}
                            onClick={() => handleStageChange(activeRecord.id, stgKey)}
                            className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all cursor-pointer ${
                              isCurrent
                                ? `${meta.bg} ${meta.border} ${meta.color} font-bold ring-1 ring-emerald-500/40 shadow-sm`
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-950 hover:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{meta.label.split('. ')[1]}</span>
                              {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Referee Endorsement Note */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-bold uppercase text-emerald-400">Internal Referee Endorsement</span>
                      <span>{activeRecord.refereeEmail}</span>
                    </div>
                    <p className="text-slate-200 italic leading-relaxed">
                      "{activeRecord.internalEndorsementNote}"
                    </p>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-850 flex items-center justify-between">
                      <span>Referee: <strong>{activeRecord.refereeName}</strong> ({activeRecord.refereeRole})</span>
                    </div>
                  </div>

                  {/* Actionable Next Step Sentinel */}
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex items-start gap-3 text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-300 font-mono">Actionable System Next Step:</strong>
                      <p className="text-slate-300 mt-0.5 leading-relaxed font-mono">
                        {activeRecord.actionableNextStep}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB 2: BACK-CHANNEL TELEMETRY & SQUAD ASSIGNMENT */}
      {activeTab === 'telemetry' && activeRecord && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Internal Portal Back-Channel Telemetry &amp; Review Loop</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time synchronization with {activeRecord.companyName}'s internal ATS referral queues
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Internal Portal Status</div>
                <div className="text-sm font-bold text-emerald-400 font-mono">
                  {activeRecord.backChannelTelemetry.internalPortalStatus}
                </div>
                <div className="text-[11px] text-slate-400">Reconciled via ATS response webhook</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Assigned Hiring Lead</div>
                <div className="text-sm font-bold text-white font-mono">
                  {activeRecord.backChannelTelemetry.hiringManagerAssigned || 'University Staffing Pool'}
                </div>
                <div className="text-[11px] text-slate-400">Reviewing portfolio artifacts</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Fast-Track Status</div>
                <div className="text-sm font-bold text-cyan-300 font-mono">
                  {activeRecord.backChannelTelemetry.interviewFastTrackUnlocked ? 'UNLOCKED (Priority Queue)' : 'Queued for Scan'}
                </div>
                <div className="text-[11px] text-slate-400">Bypasses automated cold keyword drop</div>
              </div>
            </div>

            {/* Back-Channel Event Log */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono text-slate-300 font-bold uppercase">
                Synchronized Referral Audit Trail
              </h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-white">Internal referral token generated ({activeRecord.portalSubmissionId})</span>
                  </div>
                  <span className="text-slate-400">Registered</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-white">Referee {activeRecord.refereeName} confirmed endorsement</span>
                  </div>
                  <span className="text-emerald-400 font-bold">Confirmed</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span className="text-white">Candidate portfolio linked to Requisition ({activeRecord.requisitionId})</span>
                  </div>
                  <span className="text-cyan-300">Synchronized</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: REFEREE MILESTONE & GRATITUDE DRAFTER */}
      {activeTab === 'gratitude_drafter' && activeRecord && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>Referee Milestone &amp; Gratitude Note Drafter</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Strengthen your professional relationship with {activeRecord.refereeName} with timely milestone updates
              </p>
            </div>

            {/* Gratitude Template Box */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-850 pb-3">
                <span>Update Message for {activeRecord.refereeName}:</span>
                <button
                  onClick={() => handleCopy(`Hi ${activeRecord.refereeName.split(' ')[0]},\n\nJust wanted to share a quick update: thanks to your employee referral (${activeRecord.portalSubmissionId}), the recruitment team at ${activeRecord.companyName} reached out to schedule my interview round for "${activeRecord.roleTitle}".\n\nI really appreciate you vouching for my engineering work and campus background. I am actively preparing my systems and coding fundamentals to represent our college and your recommendation well!\n\nThank you once again for your mentorship and support.\n\nBest regards,\n${studentProfile.fullName || 'Alex Chen'}\n${studentProfile.email}`, 'gratitude_note')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  {copiedKey === 'gratitude_note' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'gratitude_note' ? 'Copied Note!' : 'Copy Thank-You Note'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-line leading-relaxed">
{`Hi ${activeRecord.refereeName.split(' ')[0]},

Just wanted to share a quick update: thanks to your employee referral (${activeRecord.portalSubmissionId}), the recruitment team at ${activeRecord.companyName} reached out to schedule my interview round for "${activeRecord.roleTitle}".

I really appreciate you vouching for my engineering work and campus background. I am actively preparing my systems and coding fundamentals to represent our college and your recommendation well!

Thank you once again for your mentorship and support.

Best regards,
${studentProfile.fullName || 'Alex Chen'}
${studentProfile.email}`}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Log New Referral Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Log New Employee Referral</span>
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-300">Target Opportunity:</label>
                <select
                  value={newOppId}
                  onChange={(e) => setNewOppId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  {opportunities.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.companyName} - {o.title.slice(0, 35)}...
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Referee Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Joshi"
                  value={newRefereeName}
                  onChange={(e) => setNewRefereeName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300">Referee Role / Team:</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior SWE"
                    value={newRefereeRole}
                    onChange={(e) => setNewRefereeRole(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">Referee Email:</label>
                  <input
                    type="email"
                    placeholder="e.g. vikram@company.com"
                    value={newRefereeEmail}
                    onChange={(e) => setNewRefereeEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Endorsement Note / Pitch Used:</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Strong campus background in distributed systems and top 1% GPA."
                  value={newEndorsementNote}
                  onChange={(e) => setNewEndorsementNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                >
                  Save &amp; Track Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

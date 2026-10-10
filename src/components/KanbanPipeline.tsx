/**
 * TERRASYNX: Tactical Execution Kanban Pipeline
 * Conforming strictly to SYSTEM_SPEC (Rules #1-#5, Req #1-#22)
 */

import React, { useState, useEffect } from 'react';
import { Opportunity, ApplicationStage } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { AppliedDossierService } from '../services/appliedDossierService';
import { FollowUpCadenceService } from '../services/followUpCadenceService';
import { resolveCanonicalApplyUrl } from '../utils/portalUrlResolver';
import { 
  KanbanSquare, 
  ArrowRight, 
  ArrowLeft, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  AlertCircle, 
  FileEdit, 
  Save, 
  ExternalLink,
  ChevronRight,
  Send,
  Zap,
  FolderArchive,
  Mic,
  DollarSign,
  Mail,
  ShieldCheck,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { EmailDraftType } from '../services/emailDraftService';
import { PipelineIntegrityService, PipelineHealthReport } from '../services/pipelineIntegrityService';

interface KanbanPipelineProps {
  opportunities: Opportunity[];
  onUpdateStage: (jobId: string, nextStage: ApplicationStage, notes?: string) => void;
  onOpenDetails: (opportunity: Opportunity) => void;
  onFastApply?: (opportunity: Opportunity) => void;
  onOpenDossierVault?: () => void;
  onOpenMockInterview?: (opportunity: Opportunity) => void;
  onOpenOfferEvaluator?: (opportunity: Opportunity) => void;
  onOpenCareerLaunchpad?: () => void;
  onOpenEmailDraft?: (opportunity: Opportunity, type?: EmailDraftType) => void;
}

interface ColumnConfig {
  id: ApplicationStage;
  title: string;
  badgeColor: string;
  borderColor: string;
  accentBg: string;
  description: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'discovered',
    title: 'Radar Discovered',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    borderColor: 'border-cyan-900/40',
    accentBg: 'bg-cyan-950/10',
    description: 'Active openings from verified ATS feeds',
  },
  {
    id: 'applied',
    title: 'Applied on Portal',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    borderColor: 'border-indigo-900/40',
    accentBg: 'bg-indigo-950/10',
    description: 'Submitted; apply alerts muted (Req #7)',
  },
  {
    id: 'assessment',
    title: 'Assessment / OA',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    borderColor: 'border-amber-900/40',
    accentBg: 'bg-amber-950/10',
    description: 'CodeSignal, HackerRank, Take-home',
  },
  {
    id: 'interview',
    title: 'Interview Rounds',
    badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    borderColor: 'border-purple-900/40',
    accentBg: 'bg-purple-950/10',
    description: 'Live technical & hiring manager rounds',
  },
  {
    id: 'offer',
    title: 'Offer Secured',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    borderColor: 'border-emerald-900/40',
    accentBg: 'bg-emerald-950/10',
    description: 'Official selection & compensation review',
  },
];

export const KanbanPipeline: React.FC<KanbanPipelineProps> = ({
  opportunities,
  onUpdateStage,
  onOpenDetails,
  onFastApply,
  onOpenDossierVault,
  onOpenMockInterview,
  onOpenOfferEvaluator,
  onOpenCareerLaunchpad,
  onOpenEmailDraft,
}) => {
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  // PROMPT 23: Pipeline Integrity Automated Suite State
  const [healthReport, setHealthReport] = useState<PipelineHealthReport>(() => 
    PipelineIntegrityService.runHealthCheck(opportunities)
  );
  const [isFixing, setIsFixing] = useState<boolean>(false);
  const [showIssueDetails, setShowIssueDetails] = useState<boolean>(false);
  const [fixSuccessToast, setFixSuccessToast] = useState<string | null>(null);

  // Sync health report whenever opportunities list updates
  useEffect(() => {
    setHealthReport(PipelineIntegrityService.runHealthCheck(opportunities));
  }, [opportunities]);

  const handleRunHealthCheck = () => {
    const report = PipelineIntegrityService.runHealthCheck(opportunities);
    setHealthReport(report);
    if (report.isHealthy) {
      setFixSuccessToast('Pipeline is 100% healthy: 0 duplicates, 0 inconsistencies.');
      setTimeout(() => setFixSuccessToast(null), 3000);
    }
  };

  const handleFixAll = () => {
    setIsFixing(true);
    try {
      const { fixedCount, report } = PipelineIntegrityService.fixAll(opportunities);
      setHealthReport(report);
      setFixSuccessToast(`Fixed ${fixedCount} issue${fixedCount === 1 ? '' : 's'} successfully: duplicates merged & statuses normalized.`);
      setTimeout(() => setFixSuccessToast(null), 4000);
    } catch {
      // safe fallback
    } finally {
      setIsFixing(false);
    }
  };

  const handleStartEditNotes = (opp: Opportunity) => {
    setEditingNotesId(opp.id);
    setTempNotes(opp.customNotes || '');
  };

  const handleSaveNotes = (opp: Opportunity) => {
    onUpdateStage(opp.id, opp.stage, tempNotes);
    setEditingNotesId(null);
  };

  // Helper for stage navigation
  const getNextStage = (current: ApplicationStage): ApplicationStage | null => {
    switch (current) {
      case 'discovered': return 'applied';
      case 'applied': return 'assessment';
      case 'assessment': return 'interview';
      case 'interview': return 'offer';
      default: return null;
    }
  };

  const getPrevStage = (current: ApplicationStage): ApplicationStage | null => {
    switch (current) {
      case 'applied': return 'discovered';
      case 'assessment': return 'applied';
      case 'interview': return 'assessment';
      case 'offer': return 'interview';
      default: return null;
    }
  };

  return (
    <div id="kanban-pipeline-container" className="space-y-6">
      
      {/* Kanban Header & Momentum Tracker */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
            <KanbanSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>Execution Pipeline</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                Momentum Dashboard
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Drag-free, tactile stage progression with 7-day follow-up reminders and isolated notes.
            </p>
          </div>
        </div>

        {/* Pipeline Summary Counters */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          {onOpenDossierVault && (
            <button
              onClick={onOpenDossierVault}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold transition-colors cursor-pointer"
              title="Open Permanent Applied Dossier Archive & Workspace Vault (Req #8 & #12)"
            >
              <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
              <span>Applied Dossier Vault</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold text-[10px]">
                {opportunities.filter(o => o.stage === 'applied' || o.stage === 'assessment' || o.stage === 'interview' || o.stage === 'offer').length}
              </span>
            </button>
          )}
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            <span className="text-slate-500">In Pipeline:</span>{' '}
            <span className="font-bold text-indigo-400">
              {opportunities.filter(o => o.stage !== 'discovered' && o.stage !== 'archived').length}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-900/50 text-emerald-300">
            <span className="text-emerald-500">Offers:</span>{' '}
            <span className="font-bold text-emerald-300">
              {opportunities.filter(o => o.stage === 'offer').length}
            </span>
          </div>
        </div>
      </div>

      {/* PROMPT 23: Pipeline Health & Automated Integrity Sentinel Card */}
      <div 
        id="pipeline-health-card"
        className={`p-3.5 rounded-2xl border transition-all ${
          healthReport.isHealthy 
            ? 'bg-slate-900/60 border-slate-800' 
            : 'bg-amber-950/30 border-amber-800/80 shadow-md shadow-amber-950/20'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              healthReport.isHealthy
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                : 'bg-amber-950 text-amber-300 border border-amber-800/80'
            }`}>
              {healthReport.isHealthy ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold font-mono text-slate-200">
                  Pipeline Health:
                </span>
                <span className={`text-xs font-mono font-bold ${
                  healthReport.isHealthy ? 'text-emerald-400' : 'text-amber-300'
                }`}>
                  {healthReport.isHealthy 
                    ? '✅ 0 duplicates, 0 inconsistencies'
                    : `⚠️ ${healthReport.totalIssuesCount} anomal${healthReport.totalIssuesCount === 1 ? 'y' : 'ies'} detected (${healthReport.duplicateCount} dups, ${healthReport.statusInconsistencyCount} status, ${healthReport.orphanDataCount} corrupt)`
                  }
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  ({healthReport.totalChecked} roles checked)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                {healthReport.summaryMessage}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap">
            {fixSuccessToast && (
              <span className="text-[11px] font-mono text-emerald-400 font-semibold animate-pulse mr-1">
                {fixSuccessToast}
              </span>
            )}

            {!healthReport.isHealthy && (
              <button
                onClick={handleFixAll}
                disabled={isFixing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-mono font-bold shadow-md shadow-amber-950/50 transition-all cursor-pointer"
                title="1-Click Auto-Heal: Merges duplicates, normalizes stages to canonical forms, and cleans corrupt data"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>{isFixing ? 'Fixing...' : 'Fix All'}</span>
              </button>
            )}

            <button
              onClick={handleRunHealthCheck}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer border border-slate-700"
              title="Run Automated Data Integrity Check"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Run Health Check</span>
            </button>

            {healthReport.issues.length > 0 && (
              <button
                onClick={() => setShowIssueDetails(!showIssueDetails)}
                className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer"
              >
                {showIssueDetails ? 'Hide Details' : 'View Details'}
              </button>
            )}
          </div>
        </div>

        {/* Expandable Issue Details List */}
        {showIssueDetails && healthReport.issues.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Integrity Issues Detected:
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {healthReport.issues.map(iss => (
                <div key={iss.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold shrink-0 ${
                      iss.type === 'duplicate' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      iss.type === 'inconsistent_status' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                      'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {iss.type.replace('_', ' ')}
                    </span>
                    <span className="text-slate-200 font-bold truncate">{iss.companyName}</span>
                    <span className="text-slate-400 truncate">— {iss.description}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 hidden sm:inline">{iss.suggestedFix}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5 Kanban Stage Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const colOpportunities = opportunities.filter(o => o.stage === col.id);

          return (
            <div
              key={col.id}
              id={`kanban-col-${col.id}`}
              className={`flex flex-col rounded-xl border ${col.borderColor} ${col.accentBg} backdrop-blur-sm min-w-[260px] p-3.5 shadow-sm`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-200 tracking-wider font-mono">
                    {col.title.toUpperCase()}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                    {col.description}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${col.badgeColor}`}>
                  {colOpportunities.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1 scrollbar-thin">
                {colOpportunities.length === 0 ? (
                  <div className="h-32 rounded-lg border border-dashed border-slate-800/80 flex flex-col items-center justify-center text-center p-3">
                    <p className="text-[11px] text-slate-500">No active applications</p>
                    {col.id === 'applied' && (
                      <span className="text-[10px] text-cyan-400/80 mt-1">
                        Apply from Radar to populate
                      </span>
                    )}
                  </div>
                ) : (
                  colOpportunities.map(opp => {
                    const next = getNextStage(opp.stage);
                    const prev = getPrevStage(opp.stage);

                    // Check if 7 days follow up reached (Prompt 21 & Req #3)
                    const daysElapsed = opp.stage === 'applied' ? FollowUpCadenceService.getDaysElapsed(opp) : 0;
                    const isFollowUpDue = opp.stage === 'applied' && daysElapsed >= 7;
                    const appliedRecord = AppliedDossierService.getRecordByOpportunityId(opp.id);

                    return (
                      <div
                        key={opp.id}
                        id={`kanban-card-${opp.id}`}
                        className="rounded-lg border border-slate-800 bg-slate-900/90 p-3 shadow-md hover:border-slate-700 transition-all text-xs"
                      >
                        {/* Company & Logo */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <CompanyLogo
                              domain={opp.companyDomain}
                              name={opp.companyName}
                              size="sm"
                            />
                            <div>
                              <span className="font-semibold text-slate-200">
                                {opp.companyName}
                              </span>
                              <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                                {opp.department}
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            {opp.fitment.overallScore}%
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="mt-2 font-bold text-slate-100 line-clamp-2">
                          {opp.title}
                        </h4>

                        {/* Compensation Badge */}
                        <div className="mt-2 text-[11px] font-mono text-emerald-400 truncate">
                          {opp.compensation.range}
                        </div>

                        {/* Prompt 41B: ATS Closure Detection Badge */}
                        {opp.possiblyClosed && (
                          <div
                            className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40"
                            title="Possibly closed, verify on official page"
                          >
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            <span>Possibly closed, verify on official page</span>
                          </div>
                        )}

                        {/* Submission Provenance Route Tag */}
                        {appliedRecord && (
                          <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono gap-1">
                            <span className={`px-1.5 py-0.5 rounded font-bold ${
                              appliedRecord.submissionRoute === 'direct_official_ats'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            }`}>
                              {appliedRecord.submissionRoute === 'direct_official_ats' ? '🏢 Official ATS' : '⚡ System Assist'}
                            </span>
                            {appliedRecord.applicantEmail && (
                              <span className="text-slate-400 truncate max-w-[120px]" title={`Logged via ${appliedRecord.applicantEmail}`}>
                                {appliedRecord.applicantEmail}
                              </span>
                            )}
                          </div>
                        )}

                        {/* 7-Day Follow-Up Alert Banner (Prompt 21 & Req #3) */}
                        {isFollowUpDue && (
                          <div className="mt-2 p-2 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-200 text-[10px] font-mono space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                <span>Follow-Up Due ({daysElapsed}d)</span>
                              </div>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-300 border border-amber-700">
                                7+ Days
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-300 font-sans leading-snug">
                              Aapne {opp.companyName} ko {daysElapsed} din pehle apply kiya tha — polite follow-up email bhejne ka samay hai!
                            </p>
                            {onOpenEmailDraft && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenEmailDraft(opp, 'follow-up');
                                }}
                                className="w-full mt-1 py-1 px-2 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-mono text-[10px] flex items-center justify-center gap-1.5 cursor-pointer shadow transition-colors"
                                title="Open EmailDraftModal with tailored 7-day follow-up email"
                              >
                                <Mail className="w-3 h-3" />
                                <span>Draft Follow-Up Email</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Custom Student Notes Section (Req #12) */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                          {editingNotesId === opp.id ? (
                            <div className="space-y-1.5">
                              <textarea
                                value={tempNotes}
                                onChange={(e) => setTempNotes(e.target.value)}
                                placeholder="Add notes (e.g. referral name, interview round date)..."
                                className="w-full p-1.5 text-[11px] rounded bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                                rows={2}
                              />
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setEditingNotesId(null)}
                                  className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-slate-200"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveNotes(opp)}
                                  className="flex items-center gap-1 px-2 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 rounded font-semibold"
                                >
                                  <Save className="w-3 h-3" />
                                  <span>Save</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="truncate max-w-[170px] italic">
                                {opp.customNotes || 'No notes added'}
                              </span>
                              <button
                                onClick={() => handleStartEditNotes(opp)}
                                className="text-slate-500 hover:text-cyan-300"
                                title="Edit notes"
                              >
                                <FileEdit className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Stage Progression Action Buttons */}
                        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                          {prev ? (
                            <button
                              onClick={() => onUpdateStage(opp.id, prev)}
                              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 px-1.5 py-1 rounded bg-slate-800/60 hover:bg-slate-800"
                              title={`Move back to ${prev}`}
                            >
                              <ArrowLeft className="w-3 h-3" />
                              <span className="capitalize">{prev}</span>
                            </button>
                          ) : (
                            <div />
                          )}

                          <button
                            onClick={() => onOpenDetails(opp)}
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold"
                          >
                            Intel
                          </button>

                          <a
                            href={resolveCanonicalApplyUrl(opp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-cyan-300 px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 font-mono transition-colors"
                            title="Open exact single-role official application form"
                          >
                            <span>Portal</span>
                            <ExternalLink className="w-2.5 h-2.5 text-cyan-400" />
                          </a>

                          {onOpenMockInterview && (
                            <button
                              onClick={() => onOpenMockInterview(opp)}
                              className="flex items-center gap-0.5 text-[10px] text-indigo-300 hover:text-indigo-200 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/60 font-medium"
                              title="Simulate Mock Interview for this opportunity"
                            >
                              <Mic className="w-2.5 h-2.5 text-indigo-400" />
                              <span>Mock</span>
                            </button>
                          )}

                          {onOpenOfferEvaluator && (opp.stage === 'offer' || opp.stage === 'interview') && (
                            <button
                              onClick={() => onOpenOfferEvaluator(opp)}
                              className="flex items-center gap-0.5 text-[10px] text-purple-300 hover:text-purple-200 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/60 font-medium"
                              title="Evaluate offer package and negotiate compensation"
                            >
                              <DollarSign className="w-2.5 h-2.5 text-purple-400" />
                              <span>Offer</span>
                            </button>
                          )}

                          {onOpenCareerLaunchpad && opp.stage === 'offer' && (
                            <button
                              onClick={() => onOpenCareerLaunchpad()}
                              className="flex items-center gap-0.5 text-[10px] text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60 font-medium"
                              title="Open Career Launchpad & Onboarding Studio"
                            >
                              <Award className="w-2.5 h-2.5 text-emerald-400" />
                              <span>Launchpad</span>
                            </button>
                          )}

                          {opp.stage === 'discovered' && onFastApply ? (
                            <button
                              onClick={() => onFastApply(opp)}
                              className="flex items-center gap-1 text-[10px] font-bold text-slate-950 px-2 py-1 rounded bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 font-mono shadow-sm"
                              title="Smart Auto-Fill Assistant: Form fields pre-filled for your manual review and submission"
                            >
                              <Zap className="w-3 h-3 fill-slate-950 text-slate-950" />
                              <span>Fast Apply</span>
                            </button>
                          ) : next ? (
                            <button
                              onClick={() => onUpdateStage(opp.id, next)}
                              className="flex items-center gap-1 text-[10px] font-bold text-slate-950 px-2 py-1 rounded bg-cyan-400 hover:bg-cyan-300"
                              title={`Move to ${next}`}
                            >
                              <span className="capitalize">{next}</span>
                              <ArrowRight className="w-3 h-3 text-slate-950" />
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              <span>Secured</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

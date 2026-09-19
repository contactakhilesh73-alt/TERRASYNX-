/**
 * TERRASYNX: Tactical Execution Kanban Pipeline
 * Conforming strictly to SYSTEM_SPEC (Rules #1-#5, Req #1-#22)
 */

import React, { useState } from 'react';
import { Opportunity, ApplicationStage } from '../types';
import { CompanyLogo } from './CompanyLogo';
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
  DollarSign
} from 'lucide-react';

interface KanbanPipelineProps {
  opportunities: Opportunity[];
  onUpdateStage: (jobId: string, nextStage: ApplicationStage, notes?: string) => void;
  onOpenDetails: (opportunity: Opportunity) => void;
  onFastApply?: (opportunity: Opportunity) => void;
  onOpenDossierVault?: () => void;
  onOpenMockInterview?: (opportunity: Opportunity) => void;
  onOpenOfferEvaluator?: (opportunity: Opportunity) => void;
  onOpenCareerLaunchpad?: () => void;
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
}) => {
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

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

                    // Check if 7 days follow up reached (Req #3)
                    const isFollowUpDue = opp.followUpDeadlineAt && Date.now() >= opp.followUpDeadlineAt && opp.stage === 'applied';

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

                        {/* 7-Day Follow-Up Alert Banner (Req #3) */}
                        {isFollowUpDue && (
                          <div className="mt-2 p-1.5 rounded bg-amber-950/60 border border-amber-800/80 text-amber-300 text-[10px] font-mono flex items-center gap-1.5 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            <span>7-Day Follow-Up Due! Email recruiter</span>
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
                              title="Smart Auto-Fill Assistant: Form fields pre-filled, review karke khud submit karein"
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

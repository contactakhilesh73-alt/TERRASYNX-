/**
 * TERRASYNX: Tactical Opportunity Detail & Intel Modal
 * Conforming strictly to SYSTEM_SPEC (Rules #1-#5, Req #1-#22)
 */

import React from 'react';
import { Opportunity } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { 
  X, 
  ShieldCheck, 
  Clock, 
  ExternalLink, 
  DollarSign, 
  GraduationCap, 
  MapPin, 
  Users, 
  BrainCircuit, 
  CheckCircle2,
  AlertTriangle,
  Code2,
  Award,
  Zap,
  Calendar,
  Layers,
  Mic,
  Network,
  Target,
  FileEdit,
  Mail
} from 'lucide-react';

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
  onMarkApplied: (jobId: string) => void;
  onOpenAssessmentVault?: (opportunity: Opportunity) => void;
  onOpenInsiderBridge?: (opportunity: Opportunity) => void;
  onOpenCalendar?: (opportunity: Opportunity) => void;
  onFastApply?: (opportunity: Opportunity) => void;
  onOpenDossier?: (opportunity: Opportunity) => void;
  onOpenMockInterview?: (opportunity: Opportunity) => void;
  onOpenOfferEvaluator?: (opportunity: Opportunity) => void;
  onOpenCareerLaunchpad?: () => void;
  onOpenNetworkGraph?: (opportunity: Opportunity) => void;
  onOpenRecruiterRadar?: (opportunity: Opportunity) => void;
  onOpenCoverLetter?: (opportunity: Opportunity) => void;
  onOpenEmailDraft?: (opportunity: Opportunity) => void;
  isApplied: boolean;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  onClose,
  onMarkApplied,
  onOpenAssessmentVault,
  onOpenInsiderBridge,
  onOpenCalendar,
  onFastApply,
  onOpenDossier,
  onOpenMockInterview,
  onOpenOfferEvaluator,
  onOpenCareerLaunchpad,
  onOpenNetworkGraph,
  onOpenRecruiterRadar,
  onOpenCoverLetter,
  onOpenEmailDraft,
  isApplied,
}) => {
  if (!opportunity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-cyan-500/40 bg-slate-900 p-6 shadow-2xl shadow-cyan-950/50 scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 pr-8">
          <CompanyLogo
            domain={opportunity.companyDomain}
            name={opportunity.companyName}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-100">{opportunity.companyName}</h2>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified ATS: {opportunity.verification.sourceType.toUpperCase()}</span>
              </div>
            </div>
            <h1 className="text-xl font-black text-cyan-300 mt-1">
              {opportunity.title}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Requisition ID: {opportunity.verification.requisitionId} • Root Domain: {opportunity.verification.rootDomain}
            </p>
          </div>
        </div>

        {/* Grid Stats */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 block">Compensation</span>
                <span className="text-[10px] text-amber-400/90 font-mono">Market Estimate</span>
              </div>
              <span className="font-bold text-emerald-400 text-sm block mt-0.5">{opportunity.compensation.range}</span>
            </div>
            <span className="text-[10px] text-slate-500 block truncate mt-1" title={opportunity.compensation.transparentBenchmark}>
              {opportunity.compensation.transparentBenchmark || 'Community/Market estimate'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block">Target Batches</span>
            <span className="font-bold text-indigo-300 text-sm">
              Batch {opportunity.eligibility.allowedGraduationYears.join(', ')}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block">Work Location</span>
            <span className="font-bold text-slate-200 text-xs truncate block">{opportunity.location}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block">Fitment Grade</span>
            <span className="font-bold text-cyan-400 text-sm">
              {opportunity.fitment.overallScore}% ({opportunity.fitment.overallGrade})
            </span>
          </div>
        </div>

        {/* 10-D Fitment Dimension Breakdown (Req #17) */}
        <div className="mt-6 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2 mb-3">
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            <span>10-Dimensional Fitment Assessment</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {Object.entries(opportunity.fitment.dimensions).map(([key, val]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-mono font-bold text-cyan-300">{val}%</span>
                </div>
                <div className="w-full h-1 rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-cyan-400" style={{ width: `${val}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
            <span className="font-bold text-amber-300">Strategic Verdict: </span>
            {opportunity.fitment.strategicVerdict}
          </div>
        </div>

        {/* Assessment Intelligence (Req #16) */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2 mb-2">
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>Assessment & Test Intelligence</span>
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500">Platform: </span>
              <span className="text-slate-200 font-bold">{opportunity.assessmentIntel.platform}</span>
            </div>
            <div>
              <span className="text-slate-500">Duration: </span>
              <span className="text-slate-200 font-bold">{opportunity.assessmentIntel.durationMinutes} mins</span>
            </div>
            <div>
              <span className="text-slate-500">Difficulty: </span>
              <span className="text-amber-300 font-bold">{opportunity.assessmentIntel.difficulty}</span>
            </div>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-500">Tested Topics: </span>
              <span className="text-slate-300 font-mono">{opportunity.assessmentIntel.frequentTopics.join(' • ')}</span>
            </div>
            {onOpenAssessmentVault && (
              <button
                type="button"
                onClick={() => onOpenAssessmentVault(opportunity)}
                className="px-3 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 font-mono text-[11px] font-bold transition-colors cursor-pointer"
              >
                Open Full OA Practice Vault ➔
              </button>
            )}
          </div>
        </div>

        {/* Alumni & Insider Referral Signal (Req #15) */}
        <div className="mt-4 p-4 rounded-xl bg-sky-950/20 border border-sky-900/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-sky-400" />
            <div>
              <span className="text-xs font-bold text-slate-200 block">
                {typeof opportunity.alumniPresenceCount === 'number'
                  ? `${opportunity.alumniPresenceCount} Campus Alumni Identified at ${opportunity.companyName}`
                  : `Campus Alumni Presence: Data not available at ${opportunity.companyName}`}
              </span>
              <span className="text-[11px] text-slate-400">
                {typeof opportunity.alumniPresenceCount === 'number'
                  ? '1-click cold outreach & internal referral templates configured for your graduation batch.'
                  : 'Outreach studio active. Connect directly with hiring teams once verified directory links are populated.'}
              </span>
            </div>
          </div>
          {onOpenInsiderBridge && (
            <button
              onClick={() => {
                onClose();
                onOpenInsiderBridge(opportunity);
              }}
              className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-mono font-semibold whitespace-nowrap transition-colors cursor-pointer"
            >
              Outreach Studio ➔
            </button>
          )}
        </div>

        {/* Action Buttons (Req #4, #7, #17) */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onMarkApplied(opportunity.id)}
            disabled={isApplied}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
              isApplied
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isApplied ? 'Application Registered' : 'Quick Mark Applied'}</span>
          </button>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onOpenDossier && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDossier(opportunity);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/60 border border-amber-800/60 transition-colors cursor-pointer font-mono"
                title="Inspect Santiago 8-Block (A to H) Evaluation Dossier"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>8-Block Dossier</span>
              </button>
            )}

            {onOpenCalendar && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCalendar(opportunity);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-teal-300 hover:text-teal-200 bg-teal-950/60 border border-teal-800/60 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Sync to Calendar</span>
              </button>
            )}

            {onOpenMockInterview && (
              <button
                onClick={() => {
                  onClose();
                  onOpenMockInterview(opportunity);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:text-indigo-200 bg-indigo-950/60 border border-indigo-800/60 transition-colors cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mock Interview</span>
              </button>
            )}

            {onOpenOfferEvaluator && (
              <button
                onClick={() => {
                  onClose();
                  onOpenOfferEvaluator(opportunity);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-300 hover:text-purple-200 bg-purple-950/60 border border-purple-800/60 transition-colors cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5 text-purple-400" />
                <span>Evaluate Offer</span>
              </button>
            )}

            {onOpenCareerLaunchpad && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCareerLaunchpad();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 border border-emerald-800/60 transition-colors cursor-pointer"
              >
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Career Launchpad</span>
              </button>
            )}

            {onOpenNetworkGraph && (
              <button
                onClick={() => {
                  onClose();
                  onOpenNetworkGraph(opportunity);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-950/60 border border-cyan-800/60 transition-colors cursor-pointer"
              >
                <Network className="w-3.5 h-3.5 text-cyan-400" />
                <span>Alumni Network</span>
              </button>
            )}

            {onOpenRecruiterRadar && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRecruiterRadar(opportunity);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-300 hover:text-purple-200 bg-purple-950/60 border border-purple-800/60 transition-colors cursor-pointer font-mono"
              >
                <Target className="w-3.5 h-3.5 text-purple-400" />
                <span>Recruiter Radar</span>
              </button>
            )}

            {onOpenCoverLetter && (
              <button
                id="modal-cover-letter-btn"
                onClick={() => {
                  onOpenCoverLetter(opportunity);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-cyan-300 hover:text-cyan-100 bg-cyan-950/60 border border-cyan-800/60 transition-colors cursor-pointer"
                title="Generate personalized cover letter draft with Gemini AI"
              >
                <FileEdit className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cover Letter Draft</span>
              </button>
            )}

            {onOpenEmailDraft && (
              <button
                id="modal-email-draft-btn"
                onClick={() => {
                  onOpenEmailDraft(opportunity);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:text-indigo-100 bg-indigo-950/60 border border-indigo-800/60 transition-colors cursor-pointer"
                title="Draft cold outreach or referral request email (Draft only)"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Email Draft</span>
              </button>
            )}

            <a
              href={opportunity.officialApplyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800"
            >
              <span>Official Apply Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <a
              href={opportunity.officialStatusTrackerUrl || `https://${opportunity.companyDomain}/careers`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 border border-cyan-800/60 hover:bg-cyan-900/40"
              title="View Candidate Status on Official Career Portal"
            >
              <span>Career Portal Tracker</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>

            {!isApplied && onFastApply && (
              <button
                onClick={() => {
                  onClose();
                  onFastApply(opportunity);
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-mono shadow-lg shadow-cyan-950 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>Smart Auto-Fill & Prepare</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

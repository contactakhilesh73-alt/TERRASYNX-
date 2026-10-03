/**
 * TERRASYNX: Tactical Opportunity Detail & Intel Modal
 * Conforming strictly to SYSTEM_SPEC (Rules #1-#5, Req #1-#22)
 */

import React, { useMemo } from 'react';
import { Opportunity } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { resolveCanonicalApplyUrl } from '../utils/portalUrlResolver';
import { AppliedDossierService } from '../services/appliedDossierService';
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
  Mail,
  Compass
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
  onOpenCompanyResearch?: (opportunity: Opportunity) => void;
  onOpenCompanyRedFlags?: (opportunity: Opportunity) => void;
  allOpportunities?: Opportunity[];
  onSelectOpportunity?: (opportunity: Opportunity) => void;
  onSelfReportApplied?: (opportunity: Opportunity) => void;
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
  onOpenCompanyResearch,
  onOpenCompanyRedFlags,
  allOpportunities,
  onSelectOpportunity,
  onSelfReportApplied,
  isApplied,
}) => {
  if (!opportunity) return null;

  const otherCompanyRoles = useMemo(() => {
    if (!opportunity || !allOpportunities) return [];
    const cName = (opportunity.companyName || '').toLowerCase().trim();
    return allOpportunities.filter(o => 
      (o.companyName || '').toLowerCase().trim() === cName && o.id !== opportunity.id
    );
  }, [opportunity, allOpportunities]);

  const appliedRecord = isApplied ? AppliedDossierService.getRecordByOpportunityId(opportunity.id) : undefined;

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

        {/* Applied Provenance Status Panel (Gmail Identity & Submission Route) */}
        {isApplied && (
          <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-slate-900 border border-emerald-800/80 shadow-md">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-sm text-emerald-300">
                  Application Logged & Verified
                </span>
                {appliedRecord?.applicantEmail && (
                  <span className="text-xs font-mono text-emerald-400/90 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Logged with: {appliedRecord.applicantEmail}
                  </span>
                )}
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                appliedRecord?.submissionRoute === 'direct_official_ats'
                  ? 'bg-blue-950 text-blue-300 border border-blue-800'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              }`}>
                {appliedRecord?.submissionRoute === 'direct_official_ats' ? '🏢 Submitted on Official ATS' : '⚡ Submitted via TERRASYNX Assistant'}
              </span>
            </div>

            {appliedRecord?.confirmationId && (
              <div className="mt-2 text-xs font-mono text-slate-400 flex items-center gap-3 flex-wrap">
                <span>Confirmation ID: <strong className="text-slate-200">{appliedRecord.confirmationId}</strong></span>
                <span>•</span>
                <span>Applied: {new Date(appliedRecord.appliedTimestamp).toLocaleDateString()}</span>
                {appliedRecord.sha256Proof && (
                  <>
                    <span>•</span>
                    <span className="text-[11px] text-slate-500 truncate" title={appliedRecord.sha256Proof}>
                      Proof: {appliedRecord.sha256Proof.slice(0, 14)}...
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

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

        {/* Other Open Opportunities at This Exact Employer (Phase 5 Single-Role Isolation) */}
        {otherCompanyRoles.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CompanyLogo
                  domain={opportunity.companyDomain}
                  name={opportunity.companyName}
                  size="sm"
                />
                <h4 className="text-sm font-bold text-slate-200">
                  Other Active Openings at {opportunity.companyName}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {otherCompanyRoles.length} more
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                Each button opens its own exact role form
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {otherCompanyRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <h5 className="text-xs font-bold text-slate-200 truncate">
                      {role.title}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                      <span>{role.location}</span>
                      <span>•</span>
                      <span className="capitalize">{role.workMode}</span>
                      {role.fitment && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-mono font-semibold">
                            {role.fitment.compositeScore}% fit
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {onSelectOpportunity && (
                      <button
                        onClick={() => onSelectOpportunity(role)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                        title="View details for this role"
                      >
                        Inspect
                      </button>
                    )}
                    <a
                      href={resolveCanonicalApplyUrl(role)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 text-xs font-bold font-mono rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors"
                      title="Apply directly to this single specific role in new tab"
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-3 h-3 text-cyan-400" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons (Req #4, #7, #17) */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {!isApplied ? (
            <button
              onClick={() => {
                if (onSelfReportApplied) {
                  onSelfReportApplied(opportunity);
                } else {
                  onMarkApplied(opportunity.id);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800 transition-colors cursor-pointer font-mono"
              title="Log that you applied on the official ATS portal using your Gmail"
            >
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>I Applied on ATS Portal</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Application Registered</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 flex-wrap">
            {onOpenDossier && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDossier(opportunity);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/60 border border-amber-800/60 transition-colors cursor-pointer font-mono"
                title="Inspect TERRASYNX 8-Block (A to H) Evaluation Dossier"
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

            {onOpenCompanyResearch && (
              <button
                id="modal-company-research-btn"
                onClick={() => {
                  onOpenCompanyResearch(opportunity);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:text-emerald-100 bg-emerald-950/60 border border-emerald-800/60 transition-colors cursor-pointer font-medium"
                title="Run 6-Axis Company Intelligence & Strategic Interview Research"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Research This Company</span>
              </button>
            )}

            {onOpenCompanyRedFlags && (
              <button
                id="modal-company-redflags-btn"
                onClick={() => {
                  onOpenCompanyRedFlags(opportunity);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-950/60 border border-rose-800/60 transition-colors cursor-pointer font-medium"
                title="Check workplace culture, attrition history, overtime, and leadership controversy before interviews"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Check Red Flags</span>
              </button>
            )}

            <a
              href={resolveCanonicalApplyUrl(opportunity)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-md shadow-cyan-950/50 transition-all font-mono"
              title="Open Official Direct Application Form (Single Role Only)"
            >
              <span>Apply to This Role (Single Portal)</span>
              <ExternalLink className="w-4 h-4 text-slate-950" />
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

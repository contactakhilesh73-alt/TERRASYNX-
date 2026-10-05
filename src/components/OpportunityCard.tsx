/**
 * TERRASYNX: High-Performance Tactical Opportunity Card
 * Conforming strictly to SYSTEM_SPEC (Rules #1-#5, Req #1-#22)
 */

import React, { useState, useEffect } from 'react';
import { Opportunity } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { resolveCanonicalApplyUrl } from '../utils/portalUrlResolver';
import { AppliedDossierService } from '../services/appliedDossierService';
import { 
  ShieldCheck, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  DollarSign, 
  MapPin, 
  GraduationCap, 
  ChevronRight,
  Briefcase,
  Layers,
  Sparkles,
  Info,
  Zap,
  FileEdit,
  Mail
} from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onMarkApplied: (jobId: string) => void;
  onOpenDetails: (opportunity: Opportunity) => void;
  onInspectVerification?: (opportunity: Opportunity) => void;
  onFastApply?: (opportunity: Opportunity) => void;
  onOpenDossier?: (opportunity: Opportunity) => void;
  onOpenCoverLetter?: (opportunity: Opportunity) => void;
  onOpenEmailDraft?: (opportunity: Opportunity) => void;
  onFilterByCompany?: (companyName: string) => void;
  onSelfReportApplied?: (opportunity: Opportunity) => void;
  isAlertMuted: boolean;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onMarkApplied,
  onOpenDetails,
  onInspectVerification,
  onFastApply,
  onOpenDossier,
  onOpenCoverLetter,
  onOpenEmailDraft,
  onFilterByCompany,
  onSelfReportApplied,
  isAlertMuted,
}) => {
  // Real-time ticking countdown calculation (Zero-Lag, Rule #3)
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);

  useEffect(() => {
    const updateCountdown = () => {
      const remainingMs = opportunity.deadlineAt - Date.now();
      if (remainingMs <= 0) {
        setTimeLeftStr('Application Window Closed');
        setIsUrgent(false);
        return;
      }

      const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
      const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((remainingMs % (1000 * 60)) / 1000);

      setIsUrgent(totalHours < 72);

      if (totalHours > 48) {
        const days = Math.floor(totalHours / 24);
        const remHours = totalHours % 24;
        setTimeLeftStr(`${days}d ${remHours}h ${mins}m left`);
      } else {
        setTimeLeftStr(`${totalHours}h ${mins}m ${secs}s left`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [opportunity.deadlineAt]);

  const isApplied = opportunity.stage === 'applied' || opportunity.stage === 'assessment' || opportunity.stage === 'interview' || opportunity.stage === 'offer';
  const appliedRecord = isApplied ? AppliedDossierService.getRecordByOpportunityId(opportunity.id) : undefined;

  return (
    <div 
      id={`job-card-${opportunity.id}`}
      className={`group relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 bg-slate-900/70 hover:bg-slate-900/90 ${
        isUrgent 
          ? 'border-red-500/40 hover:border-red-400/70 shadow-lg shadow-red-950/20' 
          : 'border-slate-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-950/20'
      }`}
    >
      {/* Top Header: Company Identity, Verification Shield & Countdown */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <CompanyLogo
              domain={opportunity.companyDomain}
              name={opportunity.companyName}
              size="md"
            />

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {onFilterByCompany ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFilterByCompany(opportunity.companyName);
                    }}
                    className="font-semibold text-sm text-slate-200 hover:text-cyan-400 tracking-wide transition-colors cursor-pointer text-left"
                    title={`Click to filter opportunities at ${opportunity.companyName}`}
                  >
                    {opportunity.companyName}
                  </button>
                ) : (
                  <span className="font-semibold text-sm text-slate-200 tracking-wide">
                    {opportunity.companyName}
                  </span>
                )}

                {isAlertMuted && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-400 border border-slate-700" title="Future apply alert muted (Req #7)">
                    Alert Muted
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {opportunity.department}
              </p>
            </div>
          </div>

          {/* Live Dynamic Urgency Countdown Badge (Req #1 & Rule #3) */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold flex-shrink-0 ${
            isUrgent 
              ? 'bg-red-950/70 text-red-300 border border-red-800/80 animate-pulse' 
              : 'bg-slate-800/80 text-slate-300 border border-slate-700'
          }`}>
            <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-red-400' : 'text-slate-400'}`} />
            <span>{timeLeftStr}</span>
          </div>
        </div>

        {/* Role Title */}
        <h3 className="mt-3.5 text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
          {opportunity.title}
        </h3>

        {/* Prompt 27: Newly Funded Badge */}
        {opportunity.isNewlyFunded && (
          <div 
            className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold shadow-sm"
            title={opportunity.fundingRoundDetails 
              ? `Recently funded ${opportunity.companyName}: ${opportunity.fundingRoundDetails.amountRaised} in ${opportunity.fundingRoundDetails.roundName} capital. Actively hiring engineering talent!` 
              : 'Recently funded startup with active public ATS hiring pipeline.'
            }
          >
            <span className="text-xs">🔥</span>
            <span>Newly Funded — Actively Hiring</span>
            {opportunity.fundingRoundDetails?.amountRaised && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 border border-amber-400/30 font-extrabold">
                {opportunity.fundingRoundDetails.amountRaised}
              </span>
            )}
          </div>
        )}

        {/* Tactical Badges & Compensation Matrix */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {/* Compensation */}
          <div 
            className="flex items-center gap-1 px-2 py-0.8 rounded bg-slate-950/80 text-emerald-300 border border-emerald-900/40 font-mono"
            title={`Market/Community Estimate: ${opportunity.compensation.range} — ${opportunity.compensation.transparentBenchmark || 'Not officially confirmed by employer'}`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>{opportunity.compensation.range}</span>
          </div>

          {/* Location & Mode */}
          <div className="flex items-center gap-1 px-2 py-0.8 rounded bg-slate-950/60 text-slate-300 border border-slate-800 font-mono text-[11px]">
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span>{opportunity.location.split('(')[0].trim()}</span>
            <span className="text-slate-500">•</span>
            <span className="uppercase text-[10px] text-cyan-400 font-bold">{opportunity.workMode}</span>
          </div>

          {/* Eligibility Batch Tag */}
          <div className="flex items-center gap-1 px-2 py-0.8 rounded bg-indigo-950/50 text-indigo-300 border border-indigo-900/40 font-mono text-[11px]">
            <GraduationCap className="w-3 h-3 text-indigo-400" />
            <span>Batch {opportunity.eligibility.allowedGraduationYears.join('/')}</span>
            {opportunity.eligibility.undergradOnly && (
              <span className="px-1 py-0.2 rounded bg-amber-950 text-amber-300 text-[9px] font-bold border border-amber-800">
                UG ONLY
              </span>
            )}
          </div>
        </div>

        {/* Fitment Score Bar & Missing Skills Snapshot (Req #13 & #17) */}
        <div className="mt-3.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Career Fitment:</span>
            </span>
            <span className="font-mono font-bold text-cyan-300">
              {opportunity.fitment.overallScore}% ({opportunity.fitment.overallGrade})
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
              style={{ width: `${opportunity.fitment.overallScore}%` }}
            ></div>
          </div>

          {/* Missing Skills Warning if any */}
          {opportunity.fitment.missingSkills.length > 0 && (
            <div className="mt-2 text-[11px] text-amber-300/90 font-mono flex items-center gap-1.5 truncate">
              <Info className="w-3 h-3 text-amber-400 flex-shrink-0" />
              <span className="text-slate-400">ATS Gap:</span>
              <span className="text-amber-200 truncate">{opportunity.fitment.missingSkills.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Applied Provenance Status Banner (Gmail Identity & Route Tracking) */}
      {isApplied && (
        <div className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-850 flex items-center justify-between text-[11px] font-mono gap-2">
          <div className="flex items-center gap-1.5 text-emerald-300 min-w-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-bold shrink-0">Applied</span>
            {appliedRecord?.applicantEmail && (
              <span className="text-emerald-400/80 truncate" title={`Applied with Gmail: ${appliedRecord.applicantEmail}`}>
                ({appliedRecord.applicantEmail})
              </span>
            )}
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
            appliedRecord?.submissionRoute === 'direct_official_ats' 
              ? 'bg-blue-950 text-blue-300 border border-blue-800' 
              : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
          }`}>
            {appliedRecord?.submissionRoute === 'direct_official_ats' ? '🏢 Official ATS Portal' : '⚡ TERRASYNX Assistant'}
          </span>
        </div>
      )}

      {/* Card Action Buttons (Req #1, #4, #7, #17) */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpenDetails(opportunity)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-300 transition-colors font-medium px-1.5 py-1 cursor-pointer"
          >
            <span>Intel & OA</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* 8-Block TERRASYNX Evaluation Dossier Trigger */}
          <button
            onClick={() => onOpenDossier ? onOpenDossier(opportunity) : onOpenDetails(opportunity)}
            className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors font-mono font-bold px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer"
            title="Inspect TERRASYNX 8-Block (A to H) Evaluation Dossier"
          >
            <Layers className="w-3 h-3" />
            <span>8-Block Dossier</span>
          </button>

          {/* AI Cover Letter Draft Trigger */}
          <button
            id={`generate-cover-letter-card-btn-${opportunity.id}`}
            onClick={() => onOpenCoverLetter ? onOpenCoverLetter(opportunity) : onOpenDetails(opportunity)}
            className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors font-medium px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 cursor-pointer"
            title="Generate Personalized Cover Letter Draft with Gemini AI"
          >
            <FileEdit className="w-3 h-3 text-cyan-400" />
            <span>Cover Letter</span>
          </button>

          {/* AI Cold Outreach & Referral Email Draft Trigger */}
          <button
            id={`generate-email-draft-card-btn-${opportunity.id}`}
            onClick={() => onOpenEmailDraft ? onOpenEmailDraft(opportunity) : onOpenDetails(opportunity)}
            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors font-medium px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 cursor-pointer"
            title="Draft Outreach & Referral Email with Gemini AI (Draft only)"
          >
            <Mail className="w-3 h-3 text-indigo-400" />
            <span>Email Draft</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Apply on Official ATS Portal (Req: apply link directly on every opportunity) */}
          <a
            href={resolveCanonicalApplyUrl(opportunity)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-cyan-300 hover:text-white bg-slate-900 border border-cyan-800/70 hover:bg-cyan-950/60 shadow-sm transition-all"
            title="Open Official Direct Employer Application Form (Single Role)"
          >
            <span>{isApplied ? 'Portal' : 'Apply Direct'}</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </a>

          {/* Smart Auto-Fill Assistant or Details State */}
          {!isApplied ? (
            <>
              <button
                onClick={() => onFastApply ? onFastApply(opportunity) : onOpenDetails(opportunity)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-md shadow-cyan-950/50 hover:shadow-cyan-500/20 transition-all font-mono cursor-pointer"
                title="Smart Auto-Fill Assistant: Form fields pre-filled for your manual review and submission"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span>Fast Apply</span>
              </button>

              {/* Direct ATS Self-Report Submission */}
              <button
                onClick={() => onSelfReportApplied ? onSelfReportApplied(opportunity) : onMarkApplied(opportunity.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-300 hover:text-white bg-slate-900 hover:bg-blue-950/70 border border-blue-900/70 transition-colors cursor-pointer font-mono"
                title="Log that you applied directly on the official employer ATS portal using your Gmail"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>I Applied (ATS)</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => onOpenDetails(opportunity)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/60 transition-colors cursor-pointer"
              title="View submission details and dossier"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Details</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

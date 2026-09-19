/**
 * TERRASYNX: High-Performance Tactical Opportunity Card
 * Conforming strictly to SYSTEM_SPEC (Rules #1-#5, Req #1-#22)
 */

import React, { useState, useEffect } from 'react';
import { Opportunity } from '../types';
import { CompanyLogo } from './CompanyLogo';
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
  Zap
} from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onMarkApplied: (jobId: string) => void;
  onOpenDetails: (opportunity: Opportunity) => void;
  onInspectVerification?: (opportunity: Opportunity) => void;
  onFastApply?: (opportunity: Opportunity) => void;
  onOpenDossier?: (opportunity: Opportunity) => void;
  isAlertMuted: boolean;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onMarkApplied,
  onOpenDetails,
  onInspectVerification,
  onFastApply,
  onOpenDossier,
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
                <span className="font-semibold text-sm text-slate-200 tracking-wide">
                  {opportunity.companyName}
                </span>

                {/* Cryptographic Verification Proof Pill (Strict Rule #2) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onInspectVerification) onInspectVerification(opportunity);
                  }}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors cursor-pointer"
                  title="Click to view Cryptographic Authenticity Dossier (Strict Rule #2)"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified ATS</span>
                </button>

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

        {/* Tactical Badges & Compensation Matrix */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {/* Compensation */}
          <div className="flex items-center gap-1 px-2 py-0.8 rounded bg-slate-950/80 text-emerald-300 border border-emerald-900/40 font-mono">
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

          {/* 8-Block Santiago Evaluation Dossier Trigger */}
          <button
            onClick={() => onOpenDossier ? onOpenDossier(opportunity) : onOpenDetails(opportunity)}
            className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors font-mono font-bold px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer"
            title="Inspect Santiago 8-Block (A to H) Evaluation Dossier"
          >
            <Layers className="w-3 h-3" />
            <span>8-Block Dossier</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Mark as Applied (Quick Manual Toggle) */}
          <button
            onClick={() => onMarkApplied(opportunity.id)}
            disabled={isApplied}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isApplied
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 cursor-default'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
            }`}
            title={isApplied ? 'Application registered' : 'Mark as applied to mute future alerts (Req #7)'}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isApplied ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{isApplied ? 'Applied' : 'Marked'}</span>
          </button>

          {/* Smart Auto-Fill Assistant or Applied State */}
          {!isApplied ? (
            <button
              onClick={() => onFastApply ? onFastApply(opportunity) : onOpenDetails(opportunity)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-md shadow-cyan-950/50 hover:shadow-cyan-500/20 transition-all font-mono cursor-pointer"
              title="Smart Auto-Fill Assistant: Form fields pre-filled, review karke khud submit karein"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>Fast Apply</span>
            </button>
          ) : (
            <a
              href={opportunity.officialApplyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-800"
              title="Open Official External Application Page"
            >
              <span>Portal</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

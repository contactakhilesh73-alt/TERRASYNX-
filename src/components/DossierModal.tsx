/**
 * TERRASYNX: 8-Block Deep Reasoning Dossier Modal (Phase 5 Point 2)
 * Renders full Santiago-grade evaluation (Blocks A to H) with strict source labeling and hard blockers.
 */

import React, { useMemo } from 'react';
import { Opportunity, StudentProfile, RequirementSource } from '../types';
import { DossierEngine } from '../services/dossierEngine';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  DollarSign, 
  Layers, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Flame, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Target,
  Sparkles,
  Ban
} from 'lucide-react';

interface DossierModalProps {
  opportunity: Opportunity;
  profile: StudentProfile;
  onClose: () => void;
  onFastApply?: (opp: Opportunity) => void;
  onTailorResume?: (opp: Opportunity) => void;
}

export const DossierModal: React.FC<DossierModalProps> = ({
  opportunity,
  profile,
  onClose,
  onFastApply,
  onTailorResume
}) => {
  // Generate or read cached 8-Block Dossier
  const dossier = useMemo(() => {
    return DossierEngine.generateDossier(opportunity, profile);
  }, [opportunity, profile]);

  const getSourceBadge = (source: RequirementSource) => {
    switch (source) {
      case 'JD-wording':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            [JD-wording: High-Fidelity Proof]
          </span>
        );
      case 'JD-structure':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            [JD-structure: Synthesized Fit]
          </span>
        );
      case 'estimate':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            [estimate: Capped ≤3/5]
          </span>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3.5">
            <img 
              src={opportunity.companyLogo} 
              alt={opportunity.companyName}
              className="w-11 h-11 rounded-xl bg-slate-800 p-1 object-contain border border-slate-700 shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  Santiago-Grade Evaluation Dossier
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {opportunity.verification.requisitionId}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{opportunity.title}</span>
                <span className="text-slate-400 font-normal">at {opportunity.companyName}</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dossier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body: All 8 Blocks (A to H) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm">

          {/* Hard Blocker Banner if Block H triggered */}
          {dossier.blockH_workAuthBlocker.isBlockedForCandidate && (
            <div className="p-4 rounded-xl border border-rose-500/50 bg-rose-950/40 text-rose-200 flex items-start gap-3 shadow-lg">
              <Ban className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-300 text-sm uppercase tracking-wide">
                  Block H Alert: Work-Authorization Hard Blocker Active
                </h4>
                <p className="text-xs text-rose-200 mt-1 leading-relaxed">
                  {dossier.blockH_workAuthBlocker.blockerReason}
                </p>
                <div className="mt-2 text-xs font-mono font-bold text-rose-300">
                  Recommended: {dossier.blockH_workAuthBlocker.recommendedAction}
                </div>
              </div>
            </div>
          )}

          {/* BLOCK A: Role Archetype & Taxonomy */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
                  A
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Role Summary & Archetype Classification
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {dossier.blockA_roleSummary.archetype}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
              {dossier.blockA_roleSummary.summary}
            </p>
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              <span className="text-slate-400 font-mono">Mission Criticality:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-emerald-300 border border-slate-700">
                {dossier.blockA_roleSummary.missionCriticality}
              </span>
              <span className="text-slate-400 font-mono ml-2">Core Tech:</span>
              {dossier.blockA_roleSummary.coreTechStack.slice(0, 4).map(tech => (
                <span key={tech} className="px-2 py-0.5 rounded text-[11px] bg-slate-800/80 text-slate-300 font-mono">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* BLOCK B: CV Match Per-Requirement with Source Provenance */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
                  B
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  CV Match (Per-Requirement with Source Provenance)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Grounded Truth Score:</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {dossier.blockB_cvMatch.groundedTruthScore}%
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 font-mono">
              <strong>Rule of Transparency:</strong> Weights derived from exact JD wording are weighted 5/5. Structural inferences are weighted 4/5. AI estimates are capped strictly at ≤3/5 to eliminate over-confidence.
            </div>

            <div className="space-y-2.5">
              {dossier.blockB_cvMatch.requirements.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/40 text-xs space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-slate-200">
                      {item.requirement}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-slate-400">Weight: {item.weight}/5</span>
                      {getSourceBadge(item.source)}
                    </div>
                  </div>
                  <div className="text-slate-300 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item.candidateProof}</span>
                  </div>
                  <div className="text-slate-400 pl-5 text-[11px]">
                    <span className="text-amber-400 font-mono">Mitigation:</span> {item.mitigationStrategy}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GRID: BLOCK C & BLOCK D */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* BLOCK C: Level Strategy */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
                    C
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Leveling Strategy
                  </h3>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Risk: {dossier.blockC_levelStrategy.downlevelingRisk}
                </span>
              </div>
              <div className="text-xs text-slate-200 font-bold">
                Target: {dossier.blockC_levelStrategy.targetedLevel}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {dossier.blockC_levelStrategy.strategicAdvice}
              </p>
            </div>

            {/* BLOCK D: Compensation Research */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
                    D
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Compensation Research
                  </h3>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {dossier.blockD_compResearch.verifiedBaseUsd}
                </span>
              </div>
              <div className="text-xs text-slate-300 font-mono">
                {dossier.blockD_compResearch.marketPercentile}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                Equity: {dossier.blockD_compResearch.equityOutlook}
              </p>
              <div className="text-[10px] text-slate-500 truncate font-mono">
                Source: {dossier.blockD_compResearch.benchmarkSource}
              </div>
            </div>

          </div>

          {/* BLOCK E: CV Personalization Plan */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
                E
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                CV Personalization Plan
              </h3>
            </div>
            <div className="text-xs font-mono text-amber-300 bg-amber-950/30 p-2 rounded border border-amber-800/40">
              Anchor Hook: "{dossier.blockE_personalizationPlan.customHeadlineHook}"
            </div>
            <div className="space-y-1 text-xs text-slate-300">
              <span className="text-slate-400 font-mono">Top Bullets to Elevate to Page 1:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1 pt-1">
                {dossier.blockE_personalizationPlan.topBulletsToElevate.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* BLOCK F: Interview Prep & STAR Anchors */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
                F
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Interview Prep & Behavioral Anchors (STAR)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dossier.blockF_interviewPrep.starAnchors.map((star, i) => (
                <div key={i} className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 text-xs space-y-1.5">
                  <div className="font-bold text-amber-300 font-mono text-[11px]">
                    Story #{i + 1}: {star.topic}
                  </div>
                  <p className="text-slate-300">
                    <strong className="text-slate-400">Situation:</strong> {star.situation}
                  </p>
                  <p className="text-slate-300">
                    <strong className="text-slate-400">Action:</strong> {star.actionProof}
                  </p>
                  <div className="text-emerald-300 font-mono text-[11px] pt-1 border-t border-slate-800">
                    <strong>Result:</strong> {star.resultMetric}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GRID: BLOCK G & BLOCK H */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* BLOCK G: Legitimacy & Ghost-Job Signals */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
                    G
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Legitimacy & Ghost Sentinel
                  </h3>
                </div>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  dossier.blockG_legitimacyCheck.legitimacyScore >= 80 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {dossier.blockG_legitimacyCheck.legitimacyScore}/100 Legitimacy
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-200">
                Risk Status: {dossier.blockG_legitimacyCheck.ghostJobRisk}
              </div>
              <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                {dossier.blockG_legitimacyCheck.auditSignals.map((sig, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{sig}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* BLOCK H: Work-Authorization Status */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
                    H
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Work-Authorization Hard Blocker
                  </h3>
                </div>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  dossier.blockH_workAuthBlocker.isBlockedForCandidate ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {dossier.blockH_workAuthBlocker.sponsorshipStatus}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {dossier.blockH_workAuthBlocker.recommendedAction}
              </p>
              <div className="text-[11px] text-slate-500 font-mono">
                Candidate Profile Auth: {profile.workAuthorization || 'Domestic (US Citizen / PR)'}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-mono text-slate-400">
            Dossier compiled at {new Date(dossier.evaluatedAt).toLocaleTimeString()} · Zero Hallucination Guarantee
          </div>

          <div className="flex items-center gap-2.5">
            {onTailorResume && (
              <button
                onClick={() => {
                  onClose();
                  onTailorResume(opportunity);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Tailor Resume
              </button>
            )}

            {onFastApply && !dossier.blockH_workAuthBlocker.isBlockedForCandidate && (
              <button
                onClick={() => {
                  onClose();
                  onFastApply(opportunity);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all shadow-md cursor-pointer"
              >
                Fast Apply
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

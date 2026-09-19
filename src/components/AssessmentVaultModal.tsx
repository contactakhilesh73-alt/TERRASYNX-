/**
 * TERRASYNX: Tactical Online Assessment (OA) Intelligence & Warm-up Modal
 * Conforming strictly to SYSTEM_SPEC (Req #16 & Strict Rule #1)
 */

import React from 'react';
import { Opportunity } from '../types';
import { AssessmentVaultService, AssessmentDossier } from '../services/assessmentVaultService';
import { CompanyLogo } from './CompanyLogo';
import { 
  X, 
  Code2, 
  Target, 
  Clock, 
  ShieldAlert, 
  ExternalLink, 
  CheckCircle2, 
  BookOpen,
  Award
} from 'lucide-react';

interface AssessmentVaultModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
}

export const AssessmentVaultModal: React.FC<AssessmentVaultModalProps> = ({
  opportunity,
  onClose,
}) => {
  if (!opportunity) return null;

  const oaIntel: AssessmentDossier = AssessmentVaultService.getDossierForDomain(opportunity.companyDomain);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 text-slate-100 text-xs">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-cyan-500/50 bg-slate-900 p-6 shadow-2xl shadow-cyan-950/60 scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <CompanyLogo
            domain={opportunity.companyDomain}
            name={opportunity.companyName}
            size="md"
          />
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{oaIntel.companyName} OA Intelligence Dossier</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                Live Pattern
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Target Role: {opportunity.title} (Req #{opportunity.verification.requisitionId})
            </p>
          </div>
        </div>

        {/* Tactical Parameters Strip */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Testing Platform</span>
            <span className="font-bold text-slate-200 text-[11px] truncate block">{oaIntel.testingPlatform}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Duration Window</span>
            <span className="font-bold text-cyan-400 text-xs">{oaIntel.durationMinutes} Minutes</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Benchmark Target</span>
            <span className="font-bold text-emerald-400 text-[11px] truncate block">{oaIntel.passingScoreTarget}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Proctoring Mode</span>
            <span className="font-bold text-amber-300 text-[10px] truncate block">{oaIntel.proctoringStyle}</span>
          </div>
        </div>

        {/* Frequently Tested Algorithmic Patterns */}
        <div className="mt-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <h3 className="text-slate-300 font-bold font-mono text-[11px] flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>High-Frequency Tested Topics & Data Structures</span>
          </h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {oaIntel.frequentlyTestedPatterns.map((pat, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-200 border border-slate-700/80 font-mono text-[11px]">
                {pat}
              </span>
            ))}
          </div>
        </div>

        {/* Targeted Warmup Coding Problems */}
        <div className="mt-5 space-y-3">
          <h3 className="text-slate-300 font-bold font-mono text-[11px] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Pre-Assessment 45-Minute Warmup Problems</span>
          </h3>

          <div className="space-y-2">
            {oaIntel.warmupPracticeQuestions.map((q, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{q.title}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                      q.difficulty === 'Hard' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Topic: {q.topic}</span>
                </div>

                <a
                  href={q.directPracticeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400/40 font-mono text-[11px] font-semibold whitespace-nowrap transition-colors"
                >
                  <span>Practice Problem</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Recruiter Insider Tip */}
        <div className="mt-5 p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-300 space-y-1">
          <span className="font-bold block text-[11px] flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Strategic Performance Verdict:</span>
          </span>
          <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
            {oaIntel.strategicAdvice}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold font-mono"
          >
            Acknowledge & Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};

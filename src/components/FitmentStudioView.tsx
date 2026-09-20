/**
 * TERRASYNX: Interactive 10-Dimensional Fitment Studio & ATS Gap Optimizer
 * Santiago's oferta-inspired comparative evaluation with customizable weights
 * Conforming strictly to SYSTEM_SPEC (Req #17 & Rules #1-#5)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Opportunity, StudentProfile, FitmentEvaluation } from '../types';
import { 
  FitmentEvaluator, 
  DimensionWeightConfig, 
  DEFAULT_FITMENT_WEIGHTS 
} from '../services/fitmentEvaluator';
import { CompanyLogo } from './CompanyLogo';
import { 
  Cpu, 
  Sliders, 
  Sparkles, 
  Award, 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw,
  Zap,
  GraduationCap,
  TrendingUp,
  DollarSign,
  Building2,
  X,
  Loader2
} from 'lucide-react';

interface FitmentStudioViewProps {
  opportunities: Opportunity[];
  studentProfile: StudentProfile;
  onOpenDetails: (opportunity: Opportunity) => void;
  onMarkApplied: (jobId: string) => void;
}

export const FitmentStudioView: React.FC<FitmentStudioViewProps> = ({
  opportunities,
  studentProfile,
  onOpenDetails,
  onMarkApplied,
}) => {
  const [weights, setWeights] = useState<DimensionWeightConfig>(DEFAULT_FITMENT_WEIGHTS);
  const [showWeightSliders, setShowWeightSliders] = useState<boolean>(false);
  const [activeSkillModal, setActiveSkillModal] = useState<{ skill: string; oppTitle: string; company: string } | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<'balanced' | 'prestige' | 'skills' | 'compensation'>('balanced');
  const [evaluatedOpportunities, setEvaluatedOpportunities] = useState<(Opportunity & { dynamicFitment: FitmentEvaluation })[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(true);

  // Preset Configurations for student preference
  const applyPreset = (preset: 'balanced' | 'prestige' | 'skills' | 'compensation') => {
    setSelectedPreset(preset);
    switch (preset) {
      case 'balanced':
        setWeights(DEFAULT_FITMENT_WEIGHTS);
        break;
      case 'prestige':
        setWeights({ roleFit: 20, skillsAlignment: 20, batchEligibility: 15, companyPrestige: 30, learningTrajectory: 10, compensationFairness: 5 });
        break;
      case 'skills':
        setWeights({ roleFit: 25, skillsAlignment: 45, batchEligibility: 15, companyPrestige: 5, learningTrajectory: 5, compensationFairness: 5 });
        break;
      case 'compensation':
        setWeights({ roleFit: 15, skillsAlignment: 20, batchEligibility: 15, companyPrestige: 10, learningTrajectory: 10, compensationFairness: 30 });
        break;
    }
  };

  // Run AI evaluation using FitmentEvaluator.evaluateWithAi() for all active opportunities via Gemini endpoint
  useEffect(() => {
    let isMounted = true;
    const fetchAiEvaluations = async () => {
      if (opportunities.length === 0) {
        setEvaluatedOpportunities([]);
        setIsLoadingAi(false);
        return;
      }
      setIsLoadingAi(true);
      try {
        const results = await Promise.all(
          opportunities.map(async (opp) => {
            const dynamicFitment = await FitmentEvaluator.evaluateWithAi(opp, studentProfile);
            return {
              ...opp,
              dynamicFitment,
            };
          })
        );
        if (isMounted) {
          setEvaluatedOpportunities(results);
        }
      } catch (err) {
        console.error('Fitment AI evaluation failed:', err);
      } finally {
        if (isMounted) {
          setIsLoadingAi(false);
        }
      }
    };

    fetchAiEvaluations();
    return () => {
      isMounted = false;
    };
  }, [opportunities, studentProfile]);

  // Dynamically blend AI evaluations with interactive user weights
  const displayedOpportunities = useMemo(() => {
    if (evaluatedOpportunities.length === 0) return [];
    const totalWeights = (Object.values(weights) as number[]).reduce((a, b) => a + b, 0) || 100;

    return evaluatedOpportunities.map(opp => {
      const d = opp.dynamicFitment.dimensions;
      const weightedTotal = 
        (d.roleFit * weights.roleFit) +
        (d.skillsAlignment * weights.skillsAlignment) +
        (d.batchEligibility * weights.batchEligibility) +
        (d.companyPrestige * weights.companyPrestige) +
        (d.learningTrajectory * weights.learningTrajectory) +
        (d.compensationFairness * weights.compensationFairness);
      const reweightedScore = Math.round(weightedTotal / totalWeights);

      let grade: FitmentEvaluation['overallGrade'] = opp.dynamicFitment.overallGrade;
      if (reweightedScore >= 93) grade = 'A+';
      else if (reweightedScore >= 87) grade = 'A';
      else if (reweightedScore >= 80) grade = 'B';
      else if (reweightedScore >= 70) grade = 'C';
      else if (reweightedScore >= 60) grade = 'D';
      else grade = 'F';

      return {
        ...opp,
        dynamicFitment: {
          ...opp.dynamicFitment,
          overallScore: reweightedScore,
          overallGrade: grade,
        },
      };
    }).sort((a, b) => b.dynamicFitment.overallScore - a.dynamicFitment.overallScore);
  }, [evaluatedOpportunities, weights]);

  return (
    <div id="fitment-studio-view" className="space-y-6">
      
      {/* Top Banner & Control Deck */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-950 to-slate-900/90 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">
                  10-Dimensional Fitment Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  Santiago oferta-grade
                </span>
                {isLoadingAi ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Gemini AI Evaluating...</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>AI Enhanced</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Dynamic multi-factor calibration matching {studentProfile.fullName} ({studentProfile.degree}, Batch {studentProfile.graduationYear}).
              </p>
            </div>
          </div>

          {/* Quick Presets & Customize Weights Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-950 border border-slate-800 p-1 text-xs">
              <button
                onClick={() => applyPreset('balanced')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  selectedPreset === 'balanced' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Balanced
              </button>
              <button
                onClick={() => applyPreset('prestige')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  selectedPreset === 'prestige' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Prestige AI
              </button>
              <button
                onClick={() => applyPreset('skills')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  selectedPreset === 'skills' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Skill Match
              </button>
              <button
                onClick={() => applyPreset('compensation')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  selectedPreset === 'compensation' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                High Comp
              </button>
            </div>

            <button
              onClick={() => setShowWeightSliders(!showWeightSliders)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>{showWeightSliders ? 'Hide Sliders' : 'Fine-Tune Weights'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Sliders for Custom Fine-Tuning */}
        {showWeightSliders && (
          <div className="mt-5 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-mono animate-in fade-in">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Role Fit:</span>
                <span className="text-amber-300 font-bold">{weights.roleFit}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.roleFit}
                onChange={(e) => setWeights({ ...weights, roleFit: Number(e.target.value) })}
                className="w-full accent-amber-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Skills Alignment:</span>
                <span className="text-amber-300 font-bold">{weights.skillsAlignment}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.skillsAlignment}
                onChange={(e) => setWeights({ ...weights, skillsAlignment: Number(e.target.value) })}
                className="w-full accent-amber-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Batch Year:</span>
                <span className="text-amber-300 font-bold">{weights.batchEligibility}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={weights.batchEligibility}
                onChange={(e) => setWeights({ ...weights, batchEligibility: Number(e.target.value) })}
                className="w-full accent-amber-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Prestige:</span>
                <span className="text-amber-300 font-bold">{weights.companyPrestige}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={weights.companyPrestige}
                onChange={(e) => setWeights({ ...weights, companyPrestige: Number(e.target.value) })}
                className="w-full accent-amber-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Learning Curve:</span>
                <span className="text-amber-300 font-bold">{weights.learningTrajectory}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={weights.learningTrajectory}
                onChange={(e) => setWeights({ ...weights, learningTrajectory: Number(e.target.value) })}
                className="w-full accent-amber-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Compensation:</span>
                <span className="text-amber-300 font-bold">{weights.compensationFairness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={weights.compensationFairness}
                onChange={(e) => setWeights({ ...weights, compensationFairness: Number(e.target.value) })}
                className="w-full accent-amber-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Fitment Grid & AI Loading State */}
      {isLoadingAi ? (
        <div className="rounded-2xl border border-cyan-900/50 bg-slate-900/90 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-bold text-slate-100 font-mono flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Evaluating Fitment with Gemini AI...</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Calling real server endpoint <span className="text-cyan-300 font-semibold">/api/ai/evaluate-fitment</span> to analyze 10-dimensional fitment, ATS skill gaps, and strategic verdict.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedOpportunities.map(opp => {
            const fit = opp.dynamicFitment;
            const gradeColor = 
              fit.overallGrade === 'A+' ? 'text-emerald-300 bg-emerald-950 border-emerald-700' :
              fit.overallGrade === 'A' ? 'text-cyan-300 bg-cyan-950 border-cyan-800' :
              fit.overallGrade === 'B' ? 'text-indigo-300 bg-indigo-950 border-indigo-800' :
              'text-amber-300 bg-amber-950 border-amber-800';

          return (
            <div
              key={`fit-card-${opp.id}`}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all text-xs"
            >
              <div>
                {/* Header with Company and Dynamic Grade */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <CompanyLogo
                      domain={opp.companyDomain}
                      name={opp.companyName}
                      size="sm"
                    />
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{opp.companyName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{opp.department}</p>
                    </div>
                  </div>

                  <div className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black border ${gradeColor} shadow-sm`}>
                    Grade {fit.overallGrade} ({fit.overallScore}%)
                  </div>
                </div>

                {/* Role Title */}
                <h3 className="mt-3 font-bold text-slate-100 text-sm line-clamp-1">
                  {opp.title}
                </h3>

                {/* Pay & Location */}
                <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-400 font-bold">{opp.compensation.range}</span>
                  <span className="text-slate-400">{opp.workMode.toUpperCase()}</span>
                </div>

                {/* 6 Dimension Visual Progress Bars */}
                <div className="mt-4 space-y-2 pt-3 border-t border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Role & Scope Fit</span>
                      <span className="font-mono text-cyan-300 font-bold">{fit.dimensions.roleFit}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-950 rounded-full">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${fit.dimensions.roleFit}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Skills Alignment</span>
                      <span className="font-mono text-amber-300 font-bold">{fit.dimensions.skillsAlignment}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-950 rounded-full">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${fit.dimensions.skillsAlignment}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Company Prestige</span>
                      <span className="font-mono text-purple-300 font-bold">{fit.dimensions.companyPrestige}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-950 rounded-full">
                      <div className="h-full bg-purple-400 rounded-full" style={{ width: `${fit.dimensions.companyPrestige}%` }} />
                    </div>
                  </div>
                </div>

                {/* 1-Click Actionable ATS Gap Optimizer (Req #17) */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1.5">
                    ATS Skill Gap (Click to view 2-Day Prep Plan):
                  </span>
                  
                  {fit.missingSkills.length === 0 ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Zero gap! 100% keyword coverage</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {fit.missingSkills.map(skill => (
                        <button
                          key={skill}
                          onClick={() => setActiveSkillModal({ skill, oppTitle: opp.title, company: opp.companyName })}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-800/80 text-amber-300 text-[10px] font-mono font-medium transition-colors cursor-pointer"
                          title="Click to open Actionable Sprint Preparation Guide"
                        >
                          <BookOpen className="w-3 h-3 text-amber-400" />
                          <span>{skill}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Strategic Verdict Quote */}
                <div className="mt-3 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-300 italic">
                  "{fit.strategicVerdict}"
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenDetails(opp)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Full Dossier
                </button>

                <button
                  onClick={() => onMarkApplied(opp.id)}
                  disabled={opp.stage !== 'discovered' && opp.stage !== 'archived'}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors ${
                    opp.stage !== 'discovered' && opp.stage !== 'archived'
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  }`}
                >
                  {opp.stage !== 'discovered' && opp.stage !== 'archived' ? 'Applied' : 'Apply Now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Actionable Skill Preparation Guide Modal */}
      {activeSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/50 bg-slate-900 p-6 shadow-2xl shadow-amber-950/50 text-slate-100">
            <button
              onClick={() => setActiveSkillModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {(() => {
              const plan = FitmentEvaluator.getSkillActionPlan(activeSkillModal.skill);
              return (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-100 text-sm">{plan.label}</h3>
                        <span className="px-2 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-mono text-[10px]">
                          {plan.prepTime}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Targeting {activeSkillModal.company} ({activeSkillModal.oppTitle})
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-slate-400 font-semibold block">Core Syllabus & Mental Model:</span>
                    <p className="text-slate-300 font-mono leading-relaxed">
                      {plan.summary}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/40 text-amber-300 text-[11px]">
                    Tip: Spend 45 minutes on this before submitting your application to effortlessly pass the initial recruiter screen.
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setActiveSkillModal(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      Close Guide
                    </button>

                    <a
                      href={plan.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-mono"
                    >
                      <span>Open Verified Cheatsheet</span>
                      <ExternalLink className="w-4 h-4 text-slate-950" />
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
};

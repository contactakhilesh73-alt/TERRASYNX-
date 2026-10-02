/**
 * TERRASYNX: 6-Axis Deep Company Research Modal (Prompt 18)
 * 
 * Provides an exhaustive strategic breakdown of any target company:
 * - AI & Tech Strategy
 * - Recent News & Developments
 * - Culture & Work Environment
 * - Strategic Challenges & Bottlenecks
 * - Competitors & Market Landscape
 * - Candidate Value Angle (Tailored project pitches, interview talking points, questions to ask)
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Cpu, 
  Newspaper, 
  Users, 
  AlertTriangle, 
  Shield, 
  UserCheck, 
  Copy, 
  Check, 
  Download, 
  Mic, 
  RefreshCw,
  ExternalLink,
  Target
} from 'lucide-react';
import { CompanyResearchDossier, Opportunity, StudentProfile } from '../types';
import { CompanyResearchService } from '../services/companyResearchService';
import { CompanyLogo } from './CompanyLogo';

interface CompanyResearchModalProps {
  isOpen: boolean;
  opportunity: Opportunity | null;
  profile: StudentProfile;
  onClose: () => void;
  onNavigateToMockInterview?: (opportunityId?: string, questionPrompt?: string) => void;
}

export const CompanyResearchModal: React.FC<CompanyResearchModalProps> = ({
  isOpen,
  opportunity,
  profile,
  onClose,
  onNavigateToMockInterview,
}) => {
  const [dossier, setDossier] = useState<CompanyResearchDossier | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeAxis, setActiveAxis] = useState<number>(0);
  const [copiedTalkingPoints, setCopiedTalkingPoints] = useState<boolean>(false);
  const [copiedQuestions, setCopiedQuestions] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && opportunity) {
      loadResearch(false);
    }
  }, [isOpen, opportunity?.id]);

  const loadResearch = async (forceRefresh = false) => {
    if (!opportunity) return;
    setIsLoading(true);
    try {
      const data = await CompanyResearchService.getResearch(
        opportunity.companyName,
        opportunity.companyDomain,
        opportunity.title,
        profile,
        opportunity,
        forceRefresh
      );
      setDossier(data);
    } catch (err) {
      console.error('Failed to load company research', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !opportunity) return null;

  const handleCopyTalkingPoints = async () => {
    if (!dossier) return;
    const ok = await CompanyResearchService.copyTalkingPoints(dossier);
    if (ok) {
      setCopiedTalkingPoints(true);
      setTimeout(() => setCopiedTalkingPoints(false), 2000);
    }
  };

  const handleCopyQuestions = async () => {
    if (!dossier) return;
    const text = dossier.candidateAngle.questionsToAskInterviewer
      .map((q, i) => `${i + 1}. "${q}"`)
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedQuestions(true);
      setTimeout(() => setCopiedQuestions(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleDownloadMarkdown = () => {
    if (!dossier) return;
    const md = CompanyResearchService.exportDossierMarkdown(dossier);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dossier.companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_6axis_intelligence.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const axesNav = [
    { title: 'Tech Strategy', icon: Cpu, count: dossier?.techStrategy.coreStack.length || 6 },
    { title: 'Recent News', icon: Newspaper, count: dossier?.recentNews.keyMilestones.length || 3 },
    { title: 'Culture', icon: Users, count: dossier?.culture.coreValues.length || 4 },
    { title: 'Challenges', icon: AlertTriangle, count: dossier?.challenges.technicalBottlenecks.length || 3 },
    { title: 'Competitors & Moat', icon: Shield, count: dossier?.competitors.directRivals.length || 4 },
    { title: 'Candidate Value', icon: UserCheck, count: dossier?.candidateAngle.interviewTalkingPoints.length || 3, highlight: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-950/40 overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <CompanyLogo
              domain={opportunity.companyDomain}
              name={opportunity.companyName}
              size="md"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-100">{opportunity.companyName}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800/80 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>6-Axis Intelligence Dossier</span>
                </span>
                {dossier?.source === 'gemini-3.8-flash' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                    Gemini 3.8 Flash Grounded
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    Algorithmic Knowledge Synthesis
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Target Role: <strong className="text-slate-200">{opportunity.title}</strong></span>
                <span>•</span>
                <a 
                  href={`https://${opportunity.companyDomain}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                >
                  <span>{opportunity.companyDomain}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {dossier && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">Interview Advantage:</span>
                <span className="text-emerald-400 font-bold">{dossier.interviewAdvantageScore}%</span>
              </div>
            )}

            <button
              onClick={() => loadResearch(true)}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              title="Refresh and regenerate analysis"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 6-Axis Nav Tabs */}
        <div className="px-3 sm:px-5 pt-3 pb-2 border-b border-slate-800 bg-slate-900/60 overflow-x-auto scrollbar-none flex items-center gap-1.5 sm:gap-2">
          {axesNav.map((axis, idx) => {
            const Icon = axis.icon;
            const isSelected = activeAxis === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveAxis(idx)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? axis.highlight
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-950 font-bold'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-600/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? (axis.highlight ? 'text-slate-950' : 'text-emerald-400') : 'text-slate-400'}`} />
                <span>{axis.title}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
                <Sparkles className="w-5 h-5 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-slate-200">
                  Synthesizing 6-Axis Company Intelligence...
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  Grounding tech strategy, culture metrics, and candidate value angles for {opportunity.companyName}
                </p>
              </div>
            </div>
          ) : !dossier ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Unable to generate research dossier. Click Refresh to retry.
            </div>
          ) : (
            <>
              {/* Executive Summary Verdict Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                      Strategic Executive Verdict
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      Score: {dossier.interviewAdvantageScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {dossier.summaryVerdict}
                  </p>
                </div>
              </div>

              {/* Axis 0: Tech Strategy */}
              {activeAxis === 0 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-2.5 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4" />
                      <span>Production Technology Stack</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {dossier.techStrategy.coreStack.map((tech, i) => (
                        <span 
                          key={i} 
                          className="px-3 py-1 rounded-lg text-xs font-mono bg-slate-950 text-cyan-300 border border-cyan-800/60 shadow-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <h4 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>AI &amp; Machine Learning Roadmap</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {dossier.techStrategy.aiRoadmap}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                      <h4 className="text-xs font-bold text-slate-200 font-mono">
                        Architectural Priorities
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {dossier.techStrategy.architecturePriorities.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-cyan-400 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                      <h4 className="text-xs font-bold text-slate-200 font-mono">
                        Engineering Principles
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {dossier.techStrategy.engineeringPrinciples.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Axis 1: Recent News */}
              {activeAxis === 1 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="p-4.5 rounded-xl bg-slate-950/80 border border-indigo-900/50 space-y-2.5">
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase">
                      <Newspaper className="w-4 h-4" />
                      <span>Lead Industry Headline</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100">
                      {dossier.recentNews.headline}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {dossier.recentNews.summary}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1.5">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                      Impact on Engineering Headcount &amp; Hiring
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {dossier.recentNews.impactOnHiring}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-200 font-mono">
                      Key Technical &amp; Corporate Milestones
                    </h4>
                    <div className="space-y-2">
                      {dossier.recentNews.keyMilestones.map((m, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-indigo-300 shrink-0 mt-0.5">
                            #{i + 1}
                          </span>
                          <span className="leading-relaxed">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Axis 2: Culture */}
              {activeAxis === 2 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-2.5">
                      Core Values &amp; Mindset
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {dossier.culture.coreValues.map((v, i) => (
                        <span 
                          key={i}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/60"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                        Engineering Cadence &amp; Releases
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {dossier.culture.engineeringCadence}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                        Expectations for Interns &amp; New Grads
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {dossier.culture.internAndJuniorExpectations}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                      Workstyle &amp; Day-to-Day Dynamic
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {dossier.culture.workLifeStyle}
                    </p>
                  </div>
                </div>
              )}

              {/* Axis 3: Challenges */}
              {activeAxis === 3 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/50 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-rose-400 text-xs font-mono font-bold uppercase">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Technical Bottlenecks</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {dossier.challenges.technicalBottlenecks.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-rose-400 mt-1">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/50 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-bold uppercase">
                      <Shield className="w-4 h-4" />
                      <span>Market &amp; Competitive Headwinds</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {dossier.challenges.marketThreats.map((t, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-400 mt-1">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2.5">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                      Open Problems Candidates Can Help Solve (Your Interview Hook)
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {dossier.challenges.openProblemsCandidatesCanSolve.map((p, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold font-mono">[{i + 1}]</span>
                          <span className="leading-relaxed">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Axis 4: Competitors & Moat */}
              {activeAxis === 4 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                      Direct Competitors &amp; Alternatives
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {dossier.competitors.directRivals.map((rival, i) => (
                        <span 
                          key={i} 
                          className="px-3 py-1.5 rounded-xl text-xs font-mono bg-slate-950 text-slate-300 border border-slate-800"
                        >
                          {rival}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/50 space-y-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                      Defensible Moat
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {dossier.competitors.marketMoat}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                        Product Differentiation
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {dossier.competitors.differentiation}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                        Industry Standing &amp; Reputation
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {dossier.competitors.industryStanding}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Axis 5: Candidate Value Angle */}
              {activeAxis === 5 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Immediate Value Pitch */}
                  <div className="p-4.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-teal-950/40 border border-emerald-500/40 space-y-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                      Your Immediate Value Pitch (Use in "Tell Me About Yourself" &amp; Why Us)
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      "{dossier.candidateAngle.immediateValuePitch}"
                    </p>
                  </div>

                  {/* Project Ideas to Pitch */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                      Tailored High-Impact Project Ideas to Pitch
                    </span>
                    <div className="space-y-2.5">
                      {dossier.candidateAngle.highImpactProjectIdeas.map((idea, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0 mt-0.5">
                            Idea {i + 1}
                          </span>
                          <span className="leading-relaxed">{idea}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interview Talking Points */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                        Interview Talking Points
                      </span>
                      <button
                        onClick={handleCopyTalkingPoints}
                        className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-amber-300 cursor-pointer"
                      >
                        {copiedTalkingPoints ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy All</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {dossier.candidateAngle.interviewTalkingPoints.map((tp, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                          {tp}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Questions to Ask Interviewer */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                        High-Conviction Questions to Ask the Interviewer
                      </span>
                      <button
                        onClick={handleCopyQuestions}
                        className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-indigo-300 cursor-pointer"
                      >
                        {copiedQuestions ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Questions</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {dossier.candidateAngle.questionsToAskInterviewer.map((q, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <span className="text-indigo-400 font-mono font-bold">Q{i + 1}:</span>
                          <span className="leading-relaxed italic text-slate-200">"{q}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyTalkingPoints}
              disabled={!dossier || isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {copiedTalkingPoints ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Talking Points Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Talking Points</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadMarkdown}
              disabled={!dossier || isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Dossier (.md)</span>
            </button>

            {onNavigateToMockInterview && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToMockInterview(
                    opportunity.id,
                    `Tell me why you want to join ${opportunity.companyName}, how you would help us solve our key technical challenges, and what specific projects you would build.`
                  );
                }}
                disabled={!dossier || isLoading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-cyan-300 hover:text-cyan-100 bg-cyan-950/80 border border-cyan-800/80 transition-colors cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rehearse in Mock Studio</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer shadow-md shadow-emerald-950 font-mono"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

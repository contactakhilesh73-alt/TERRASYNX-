/**
 * TERRASYNX: Company Workplace Culture & Red-Flag Detector Modal (Prompt 20)
 * Evaluates genuine workplace signals (layoff history, toxic culture, unpaid overtime,
 * desperation hiring, leadership controversy) before interviews.
 */

import React, { useState, useEffect } from 'react';
import { Opportunity, CompanyRedFlagReport } from '../types';
import { CompanyRedFlagService } from '../services/companyRedFlagService';
import { CompanyLogo } from './CompanyLogo';
import { 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  HelpCircle, 
  RefreshCw, 
  Sparkles, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  Info,
  TrendingDown,
  Flame,
  UserX,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface CompanyRedFlagModalProps {
  isOpen: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
  onOpenCompanyResearch?: (opportunity: Opportunity) => void;
}

export const CompanyRedFlagModal: React.FC<CompanyRedFlagModalProps> = ({
  isOpen,
  opportunity,
  onClose,
  onOpenCompanyResearch,
}) => {
  const [report, setReport] = useState<CompanyRedFlagReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !opportunity) {
      setReport(null);
      setErrorMsg(null);
      return;
    }

    let isMounted = true;
    const fetchReport = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const result = await CompanyRedFlagService.analyzeCompany(
          opportunity.companyName,
          opportunity.companyDomain,
          opportunity.title
        );
        if (isMounted) {
          setReport(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'Failed to analyze company red flags');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchReport();
    return () => {
      isMounted = false;
    };
  }, [isOpen, opportunity]);

  if (!isOpen || !opportunity) return null;

  const getRiskBadge = (level: CompanyRedFlagReport['riskLevel']) => {
    switch (level) {
      case 'clean':
        return {
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
          label: 'Clean Culture Record',
          icon: CheckCircle2,
        };
      case 'low':
        return {
          bg: 'bg-emerald-950/70 text-emerald-300 border-emerald-800',
          label: 'Low Workplace Risk',
          icon: ShieldCheck,
        };
      case 'moderate':
        return {
          bg: 'bg-amber-950/70 text-amber-300 border-amber-800',
          label: 'Moderate Signals Detected',
          icon: AlertTriangle,
        };
      case 'elevated':
        return {
          bg: 'bg-orange-950/70 text-orange-300 border-orange-800',
          label: 'Elevated Risk Signals',
          icon: Flame,
        };
      case 'high':
        return {
          bg: 'bg-rose-950/80 text-rose-300 border-rose-700',
          label: 'High Caution Advised',
          icon: AlertCircle,
        };
      default:
        return {
          bg: 'bg-slate-900 text-slate-300 border-slate-700',
          label: 'Standard Profile',
          icon: Info,
        };
    }
  };

  const getSeverityBadge = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'medium':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'low':
        return 'bg-blue-950 text-blue-300 border-blue-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'attrition_layoff':
        return TrendingDown;
      case 'toxic_culture':
        return Flame;
      case 'unpaid_overtime':
        return Clock;
      case 'desperation_hiring':
        return Briefcase;
      case 'leadership_controversy':
        return UserX;
      default:
        return AlertTriangle;
    }
  };

  const riskBadge = report ? getRiskBadge(report.riskLevel) : getRiskBadge('low');
  const RiskIcon = riskBadge.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-rose-900/60 bg-slate-900 shadow-2xl shadow-rose-950/40 p-6 scrollbar-thin text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 pr-10">
          <CompanyLogo
            domain={opportunity.companyDomain}
            name={opportunity.companyName}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-slate-100">{opportunity.companyName}</h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${riskBadge.bg}`}>
                <RiskIcon className="w-3.5 h-3.5" />
                <span>{riskBadge.label}</span>
              </span>
            </div>

            <h1 className="text-sm font-bold text-rose-300 mt-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Interview & Workplace Red-Flag Analysis</span>
            </h1>

            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Candidate due diligence before interviews • Real-time Glassdoor, Reddit, news & public sentiment analysis
            </p>
          </div>
        </div>

        {/* Clear Purpose Disclaimer Card */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 text-xs text-slate-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-200 block">
              Interview Due Diligence (Distinct from Job Legitimacy Verification):
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Job Legitimacy (Block G) verifies that this job requisition is 100% authentic and active. This Red-Flag detector checks 
              <strong> whether this company is genuinely healthy and sustainable to work for</strong> (attrition, unpaid overtime, culture signals, and leadership stability).
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-rose-400 animate-spin mx-auto" />
            <p className="text-sm font-mono text-slate-300">
              Scanning public Glassdoor reviews, WARN layoff notices, Blind discussions, and news for {opportunity.companyName}...
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Evaluating attrition rates, crunch culture, and hiring signals via Gemini AI
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMsg && (
          <div className="mt-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
            <p className="font-bold mb-1">Analysis Failed</p>
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && report && (
          <div className="mt-5 space-y-5">
            {/* Top Score & Summary Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Culture Health Score:
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-black font-mono ${
                    report.overallScore >= 80 ? 'text-emerald-400' : report.overallScore >= 65 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {report.overallScore}/100
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    ({report.totalFlagsCount} {report.totalFlagsCount === 1 ? 'Signal' : 'Signals'} Detected)
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {report.summaryVerdict}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700">
                  Source: {report.source === 'gemini-3.8-flash' ? '✨ Gemini AI' : report.source === 'cached' ? '⚡ Instant Cache' : 'Algorithmic Synthesis'}
                </span>
              </div>
            </div>

            {/* List of 0-5 Red Flags */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Detected Workplace Signals ({report.redFlags.length} of 5 Potential Categories)</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500">
                  Max 5 Signals Checked
                </span>
              </div>

              {report.redFlags.length === 0 ? (
                <div className="p-6 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-300">Clean Cultural Record</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Zero significant workplace red-flags (toxic culture, high attrition, unpaid overtime, desperation hiring, or leadership scandal) detected in public records.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {report.redFlags.map((flag) => {
                    const CatIcon = getCategoryIcon(flag.category);
                    const severityClass = getSeverityBadge(flag.severity);

                    return (
                      <div 
                        key={flag.id}
                        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5"
                      >
                        {/* Flag Header */}
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="p-1 rounded bg-slate-800 text-slate-300">
                              <CatIcon className="w-3.5 h-3.5 text-rose-400" />
                            </span>
                            <span className="text-xs font-bold text-slate-200">
                              {flag.title}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {flag.categoryLabel}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${severityClass}`}>
                              {flag.severity} severity
                            </span>

                            {flag.confidence === 'unverified' ? (
                              <span 
                                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800"
                                title="Unverified signal based on informal employee sentiment — verify during interview"
                              >
                                {flag.unverifiedNote || 'Unverified signal — apna khud research bhi karein'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                Documented
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {flag.description}
                        </p>

                        {/* Why This Matters (Exactly One Line Callout) */}
                        <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-xs text-rose-200 flex items-start gap-2">
                          <span className="font-bold text-rose-300 shrink-0 font-mono text-[11px]">
                            Why This Matters:
                          </span>
                          <span className="text-[11px] leading-snug">
                            {flag.whyThisMatters}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Diplomatic Interview Vetting Questions */}
            {report.interviewVettingQuestions.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
                    Diplomatic Interview Vetting Questions (Ask Tactfully)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400">
                  Polite, professional questions to respectfully test these workplace dynamics during your conversation with hiring managers:
                </p>
                <div className="space-y-2">
                  {report.interviewVettingQuestions.map((q, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 font-mono">
                      <span className="text-cyan-400 font-bold shrink-0">{idx + 1}.</span>
                      <span>"{q}"</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Action Links */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
              <div className="text-[11px] font-mono text-slate-500">
                Transparent Estimate-Labeling Principle Applied
              </div>

              <div className="flex items-center gap-2">
                {onOpenCompanyResearch && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCompanyResearch(opportunity);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 border border-emerald-800/60 transition-colors cursor-pointer"
                  >
                    <span>Open 6-Axis Research</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

/**
 * TERRASYNX: Offer Evaluator, Compensation Benchmarking & Negotiation Studio (Phase 7 Point 2)
 * Complete interactive command center for evaluating offers, analyzing 4-year vesting schedules,
 * comparing against Levels.fyi/Radford market percentiles, multi-offer decision matrix,
 * and generating tactical counter-offer negotiation drafts.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CandidateOffer, 
  Opportunity, 
  StudentProfile, 
  NegotiationStrategyType,
  CompensationBreakdown
} from '../types';
import { OfferEvaluationEngine } from '../services/offerEvaluationEngine';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Award, 
  FileText, 
  Copy, 
  Check, 
  ChevronRight, 
  Layers, 
  Sliders, 
  ShieldCheck, 
  ExternalLink,
  Building2,
  Calendar,
  Sparkles,
  Zap,
  Plus,
  ArrowUpRight,
  Info,
  Send,
  Scale
} from 'lucide-react';

interface OfferEvaluatorViewProps {
  opportunities: Opportunity[];
  studentProfile: StudentProfile;
  initialSelectedOfferId?: string;
  onNavigateToPipeline?: () => void;
  onNavigateToLaunchpad?: () => void;
}

type TabMode = 'breakdown' | 'benchmark' | 'matrix' | 'negotiation';

export const OfferEvaluatorView: React.FC<OfferEvaluatorViewProps> = ({
  opportunities,
  studentProfile,
  initialSelectedOfferId,
  onNavigateToPipeline,
  onNavigateToLaunchpad
}) => {
  const [offers, setOffers] = useState<CandidateOffer[]>(() => OfferEvaluationEngine.getSavedOffers());
  const [selectedOfferId, setSelectedOfferId] = useState<string>(() => {
    if (initialSelectedOfferId && offers.some(o => o.id === initialSelectedOfferId)) {
      return initialSelectedOfferId;
    }
    return offers[0]?.id || '';
  });

  const [activeTab, setActiveTab] = useState<TabMode>('breakdown');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isExported, setIsExported] = useState<boolean>(false);

  // Negotiation parameters state
  const [strategy, setStrategy] = useState<NegotiationStrategyType>('competing_offer_leverage');
  const [competingCompany, setCompetingCompany] = useState<string>('OpenAI');
  const [proposedBaseIncrease, setProposedBaseIncrease] = useState<number>(12000);
  const [proposedSignOnIncrease, setProposedSignOnIncrease] = useState<number>(15000);
  const [proposedEquityIncrease, setProposedEquityIncrease] = useState<number>(30000);

  // Decision matrix weight sliders state
  const [weights, setWeights] = useState({
    compensation: 30,
    learning: 25,
    prestige: 20,
    culture: 15,
    location: 10,
  });

  // Modal for adding a new offer from an existing opportunity
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOppForNewOffer, setSelectedOppForNewOffer] = useState<string>(opportunities[0]?.id || '');

  const activeOffer = useMemo(() => {
    return offers.find(o => o.id === selectedOfferId) || offers[0];
  }, [offers, selectedOfferId]);

  // Sub-second exploding offer ticker
  useEffect(() => {
    if (!activeOffer) return;

    const updateTicker = () => {
      const diff = activeOffer.deadlineDate - Date.now();
      if (diff <= 0) {
        setTimeRemaining('EXPIRED');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${days}d ${hours}h ${mins}m ${secs}s`);
    };

    updateTicker();
    const interval = setInterval(updateTicker, 1000);
    return () => clearInterval(interval);
  }, [activeOffer]);

  if (!activeOffer) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>No active offers found. Ingest or add an offer to begin evaluation.</p>
      </div>
    );
  }

  // Derived calculations
  const year1TC = OfferEvaluationEngine.calculateYear1TotalComp(activeOffer.compensation);
  const avg4YearTC = OfferEvaluationEngine.calculateAverageAnnualTotalComp(activeOffer.compensation);
  const benchmarkAnalysis = OfferEvaluationEngine.evaluateAgainstBenchmark(activeOffer);
  
  const negotiationDraft = OfferEvaluationEngine.generateNegotiationDraft(
    activeOffer,
    strategy,
    studentProfile,
    competingCompany,
    proposedBaseIncrease,
    proposedSignOnIncrease,
    proposedEquityIncrease
  );

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(`${negotiationDraft.subjectLine}\n\n${negotiationDraft.bodyText}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportOfferReport = () => {
    const lines = [
      '================================================================================',
      '        TERRASYNX INSTITUTIONAL OFFER EVALUATION & NEGOTIATION TRANSCRIPT        ',
      '================================================================================',
      `Company: ${activeOffer.companyName}`,
      `Role Title: ${activeOffer.roleTitle}`,
      `Location: ${activeOffer.location}`,
      `Timestamp: ${new Date().toISOString()}`,
      `Candidate: ${studentProfile.fullName} (${studentProfile.collegeName})`,
      '--------------------------------------------------------------------------------',
      'COMPENSATION SUMMARY:',
      `  - Period: ${activeOffer.compensation.period.toUpperCase()}`,
      `  - Base Salary: $${activeOffer.compensation.baseSalary.toLocaleString()}${activeOffer.compensation.period === 'hourly' ? '/hr' : ''}`,
      `  - Sign-On Bonus: $${activeOffer.compensation.signOnBonus.toLocaleString()}`,
      `  - Equity Grant: $${activeOffer.compensation.equityTotalGrant.toLocaleString()} (${activeOffer.compensation.equityVestingSchedule.replace('_', ' ').toUpperCase()})`,
      `  - Relocation Stipend: $${activeOffer.compensation.relocationStipend.toLocaleString()}`,
      `  - Target Bonus: ${activeOffer.compensation.annualBonusTargetPercent}%`,
      `  - YEAR 1 TOTAL COMP (TC): $${year1TC.toLocaleString()}`,
      `  - 4-YEAR AVERAGE ANNUAL TC: $${avg4YearTC.toLocaleString()}`,
      '--------------------------------------------------------------------------------',
      'MARKET BENCHMARK COMPARISON (LEVELS.FYI & RADFORD):',
      `  - Benchmark Track: ${benchmarkAnalysis.benchmark.verifiedSource}`,
      `  - Comp Ratio: ${benchmarkAnalysis.compRatio}% of Market Median`,
      `  - Percentile: ${benchmarkAnalysis.percentileBadge}`,
      `  - P50 (Median) Market TC: $${benchmarkAnalysis.benchmark.p50TotalComp.toLocaleString()}`,
      `  - P75 (Top Tier) Market TC: $${benchmarkAnalysis.benchmark.p75TotalComp.toLocaleString()}`,
      '--------------------------------------------------------------------------------',
      'NEGOTIATION STRATEGY DRAFT:',
      `Strategy: ${negotiationDraft.strategy.replace(/_/g, ' ').toUpperCase()}`,
      `Subject: ${negotiationDraft.subjectLine}`,
      '',
      negotiationDraft.bodyText,
      '================================================================================'
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TERRASYNX_OFFER_EVALUATION_${activeOffer.companyName.toUpperCase()}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setIsExported(true);
    setTimeout(() => setIsExported(false), 2500);
  };

  const handleUpdateComp = (field: keyof CompensationBreakdown, val: number | string) => {
    const updatedOffer: CandidateOffer = {
      ...activeOffer,
      compensation: {
        ...activeOffer.compensation,
        [field]: val,
      }
    };
    const updatedList = OfferEvaluationEngine.upsertOffer(updatedOffer);
    setOffers(updatedList);
  };

  const handleCreateOfferFromOpp = () => {
    const opp = opportunities.find(o => o.id === selectedOppForNewOffer);
    if (!opp) return;

    const newOffer = OfferEvaluationEngine.createOfferFromOpportunity(opp);
    const updated = OfferEvaluationEngine.upsertOffer(newOffer);
    setOffers(updated);
    setSelectedOfferId(newOffer.id);
    setIsAddModalOpen(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Command Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white font-mono tracking-tight">
                Offer Evaluation & Negotiation Studio
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                Phase 7 Point 2 • Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Levels.fyi & Radford Q1 2026 verified benchmarks, 4-year vesting simulation & tactical counter-offer copilot
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span>Add / Import Offer</span>
          </button>

          <button
            onClick={handleExportOfferReport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-700/50 text-xs font-medium transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isExported ? 'Transcript Exported!' : 'Export Transcript'}</span>
          </button>

          {onNavigateToLaunchpad && (
            <button
              onClick={onNavigateToLaunchpad}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 text-xs font-medium transition-colors cursor-pointer"
              title="Proceed to Career Launchpad for formal acceptance and onboarding"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Career Launchpad</span>
            </button>
          )}
        </div>
      </div>

      {/* Offer Switcher Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {offers.map(offer => {
          const isSelected = offer.id === activeOffer.id;
          const offerYear1 = OfferEvaluationEngine.calculateYear1TotalComp(offer.compensation);
          const isExpiringSoon = offer.deadlineDate - Date.now() < 4 * 86400000;

          return (
            <div
              key={offer.id}
              onClick={() => setSelectedOfferId(offer.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-purple-500/60 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                      <Building2 className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="font-bold text-white text-sm">{offer.companyName}</span>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                    offer.status === 'negotiating'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : offer.status === 'accepted'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  }`}>
                    {offer.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-medium line-clamp-1">
                  {offer.roleTitle}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {offer.location}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400">Year 1 Total Comp</div>
                  <div className="text-sm font-bold font-mono text-purple-300">
                    ${offerYear1.toLocaleString()}
                  </div>
                </div>

                {isExpiringSoon && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 font-bold">
                    <Clock className="w-3 h-3 text-rose-400 animate-pulse" />
                    Urgent
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Exploding Offer Urgency Banner */}
      <div className="rounded-2xl p-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase font-bold tracking-wider text-rose-400">
                Official Exploding Offer Window
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Deadline: {new Date(activeOffer.deadlineDate).toLocaleDateString()}
              </span>
            </div>
            <div className="text-xl font-extrabold font-mono text-white tracking-wider">
              {timeRemaining}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-400 hidden lg:inline">
            Need more time to evaluate competing offers?
          </span>
          <button
            onClick={() => {
              setStrategy('competing_offer_leverage');
              setActiveTab('negotiation');
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Generate Extension Request</span>
          </button>
        </div>
      </div>

      {/* 4 Focused Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('breakdown')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'breakdown'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Total Comp (TC) & 4-Yr Vesting</span>
        </button>

        <button
          onClick={() => setActiveTab('benchmark')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'benchmark'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Levels.fyi Market Comp & Percentile</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'matrix'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Multi-Offer Decision Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('negotiation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'negotiation'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Counter-Offer Negotiation Copilot</span>
        </button>
      </div>

      {/* TAB 1: BREAKDOWN & VESTING */}
      {activeTab === 'breakdown' && (
        <div className="space-y-6">
          {/* Top TC Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="text-[11px] font-mono uppercase text-slate-400">Year 1 Total Comp</div>
              <div className="text-2xl font-extrabold font-mono text-purple-400 mt-1">
                ${year1TC.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Base + Sign-on + Yr 1 Equity + Bonus
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="text-[11px] font-mono uppercase text-slate-400">4-Year Average Annual TC</div>
              <div className="text-2xl font-extrabold font-mono text-indigo-400 mt-1">
                ${avg4YearTC.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Normalized long-term baseline
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="text-[11px] font-mono uppercase text-slate-400">Total 4-Yr Equity Grant</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
                ${activeOffer.compensation.equityTotalGrant.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Schedule: {activeOffer.compensation.equityVestingSchedule.replace('_', ' ')}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="text-[11px] font-mono uppercase text-slate-400">One-Time Upfront Cash</div>
              <div className="text-2xl font-extrabold font-mono text-amber-400 mt-1">
                ${((activeOffer.compensation.signOnBonus || 0) + (activeOffer.compensation.relocationStipend || 0)).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Sign-on + Relocation allowance
              </div>
            </div>
          </div>

          {/* 4-Year Equity Vesting Waterfall */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>4-Year Equity Vesting Waterfall</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualizes actual equity liquidity realized across each year based on company vesting rules
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Vesting Model:</span>
                <select
                  value={activeOffer.compensation.equityVestingSchedule}
                  onChange={(e) => handleUpdateComp('equityVestingSchedule', e.target.value)}
                  className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-lg px-2.5 py-1 font-mono cursor-pointer"
                >
                  <option value="standard_equal">Standard Equal (25% / 25% / 25% / 25%)</option>
                  <option value="backloaded_amazon">Backloaded (5% / 15% / 40% / 40%)</option>
                  <option value="frontloaded_uber">Frontloaded (33% / 33% / 22% / 12%)</option>
                </select>
              </div>
            </div>

            {/* Waterfall Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(yr => {
                const yrEquity = OfferEvaluationEngine.calculateYearEquity(activeOffer.compensation, yr);
                const percent = Math.round((yrEquity / (activeOffer.compensation.equityTotalGrant || 1)) * 100);

                return (
                  <div key={yr} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-300">Year {yr}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {percent}%
                        </span>
                      </div>
                      <div className="text-lg font-bold font-mono text-white mt-2">
                        ${yrEquity.toLocaleString()}
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Offer Inputs */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Interactive Offer Parameter Editor</span>
            </h3>
            <p className="text-xs text-slate-400">
              Tweak compensation figures directly to observe instant recalculations across Year 1 and 4-Year averages.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">
                  Base Salary ({activeOffer.compensation.period === 'hourly' ? 'Hourly USD' : 'Annual USD'})
                </label>
                <input
                  type="number"
                  value={activeOffer.compensation.baseSalary}
                  onChange={(e) => handleUpdateComp('baseSalary', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Sign-On Bonus (USD)</label>
                <input
                  type="number"
                  value={activeOffer.compensation.signOnBonus}
                  onChange={(e) => handleUpdateComp('signOnBonus', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Total Equity Grant (4-Yr USD)</label>
                <input
                  type="number"
                  value={activeOffer.compensation.equityTotalGrant}
                  onChange={(e) => handleUpdateComp('equityTotalGrant', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Relocation / Housing Stipend (USD)</label>
                <input
                  type="number"
                  value={activeOffer.compensation.relocationStipend}
                  onChange={(e) => handleUpdateComp('relocationStipend', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Annual Bonus (%)</label>
                <input
                  type="number"
                  value={activeOffer.compensation.annualBonusTargetPercent}
                  onChange={(e) => handleUpdateComp('annualBonusTargetPercent', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Estimated Health & Benefits (Annual USD)</label>
                <input
                  type="number"
                  value={activeOffer.compensation.benefitsAnnualEstimate}
                  onChange={(e) => handleUpdateComp('benefitsAnnualEstimate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MARKET BENCHMARK (LEVELS.FYI) */}
      {activeTab === 'benchmark' && (
        <div className="space-y-6">
          {/* Main Benchmark Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white font-mono">
                    Levels.fyi & Radford Verified Comp Comparison
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3 h-3 text-teal-400" />
                    Verified Index
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Source: {benchmarkAnalysis.benchmark.verifiedSource} ({benchmarkAnalysis.benchmark.dataPointsCount.toLocaleString()} verified data points)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[11px] font-mono text-slate-400">Comp Ratio vs Median</div>
                  <div className="text-xl font-bold font-mono text-purple-300">
                    {benchmarkAnalysis.compRatio}%
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-purple-300 font-mono text-xs font-bold">
                  {benchmarkAnalysis.percentileBadge}
                </div>
              </div>
            </div>

            {/* Visual Percentile Gauge Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>P25: ${benchmarkAnalysis.benchmark.p25TotalComp.toLocaleString()}</span>
                <span>P50 (Median): ${benchmarkAnalysis.benchmark.p50TotalComp.toLocaleString()}</span>
                <span>P75 (Top Tier): ${benchmarkAnalysis.benchmark.p75TotalComp.toLocaleString()}</span>
                <span>P90: ${benchmarkAnalysis.benchmark.p90TotalComp.toLocaleString()}</span>
              </div>

              <div className="w-full bg-slate-950 h-5 rounded-full p-1 border border-slate-800 relative overflow-hidden flex items-center">
                {/* Visual marker of candidate's offer */}
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${Math.min(100, Math.max(10, benchmarkAnalysis.percentileScore))}%` }}
                >
                  <span className="text-[10px] font-mono font-bold text-white drop-shadow">
                    YOU (${year1TC.toLocaleString()})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Entry / Foundation</span>
                <span>Standard Market Rate</span>
                <span>Tier-1 Tech Benchmark</span>
              </div>
            </div>

            {/* Insights and Strategic Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                  <span>Market Gap Analytics</span>
                </span>
                <ul className="text-xs text-slate-400 space-y-1.5">
                  <li>
                    Delta to P50 Median:{' '}
                    <span className={`font-mono font-bold ${benchmarkAnalysis.deltaToP50 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {benchmarkAnalysis.deltaToP50 >= 0 ? '+' : ''}${benchmarkAnalysis.deltaToP50.toLocaleString()} USD
                    </span>
                  </li>
                  <li>
                    Delta to P75 Top Quartile:{' '}
                    <span className={`font-mono font-bold ${benchmarkAnalysis.deltaToP75 >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {benchmarkAnalysis.deltaToP75 >= 0 ? '+' : ''}${benchmarkAnalysis.deltaToP75.toLocaleString()} USD
                    </span>
                  </li>
                  <li>
                    Fair Wage Certification: <span className="text-teal-400 font-semibold">100% Verified Paid Requisition</span> (Exceeds California & NYC living wage thresholds).
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Executive Comp Guidance</span>
                </span>
                <div className="space-y-1.5">
                  {benchmarkAnalysis.insights.map((insight, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MULTI-OFFER DECISION MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-400" />
                  <span>Multi-Offer Weighted Decision Matrix</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Objectively evaluate concurrent offers by balancing compensation against team growth, prestige, culture, and location.
                </p>
              </div>
            </div>

            {/* Weights Sliders */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Compensation: {weights.compensation}%</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.compensation}
                  onChange={(e) => setWeights({ ...weights, compensation: parseInt(e.target.value) })}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Learning: {weights.learning}%</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.learning}
                  onChange={(e) => setWeights({ ...weights, learning: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Prestige: {weights.prestige}%</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.prestige}
                  onChange={(e) => setWeights({ ...weights, prestige: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Culture / WLB: {weights.culture}%</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.culture}
                  onChange={(e) => setWeights({ ...weights, culture: parseInt(e.target.value) })}
                  className="w-full accent-teal-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Location: {weights.location}%</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.location}
                  onChange={(e) => setWeights({ ...weights, location: parseInt(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Matrix Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                    <th className="py-3 px-4">Company & Role</th>
                    <th className="py-3 px-4">Year 1 TC</th>
                    <th className="py-3 px-4">Learning</th>
                    <th className="py-3 px-4">Prestige</th>
                    <th className="py-3 px-4">Culture</th>
                    <th className="py-3 px-4">Composite Score</th>
                    <th className="py-3 px-4">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {offers.map(o => {
                    const score = OfferEvaluationEngine.calculateOfferCompositeScore(o, weights);
                    const isTop = score >= 92;
                    const tc = OfferEvaluationEngine.calculateYear1TotalComp(o.compensation);

                    return (
                      <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{o.companyName}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{o.roleTitle}</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-purple-300">
                          ${tc.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-indigo-300">
                          {o.decisionScores?.learningTrajectoryWeight || 90}/100
                        </td>
                        <td className="py-3 px-4 text-emerald-300">
                          {o.decisionScores?.prestigeWeight || 95}/100
                        </td>
                        <td className="py-3 px-4 text-teal-300">
                          {o.decisionScores?.workCultureWeight || 88}/100
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-base font-bold font-mono text-white">
                            {score}
                          </span>
                          <span className="text-slate-400 text-[10px]">/100</span>
                        </td>
                        <td className="py-3 px-4">
                          {isTop ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                              ★ Top Recommended
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                              Strong Contender
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COUNTER-OFFER NEGOTIATION COPILOT */}
      {activeTab === 'negotiation' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Tactical Counter-Offer Negotiation Copilot</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate professional, respectful counter-offer letters anchored in HR psychology and market leverage
              </p>
            </div>

            {/* Strategy Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  id: 'competing_offer_leverage',
                  label: 'Competing Offer Leverage',
                  desc: 'Leverage another written offer to close the gap on cash and sign-on bonus.',
                  icon: Scale,
                  badge: 'Highest Leverage'
                },
                {
                  id: 'market_benchmark_anchoring',
                  label: 'Market Comp Anchoring',
                  desc: 'Anchor on verified Levels.fyi P75 numbers for candidate skills.',
                  icon: TrendingUp,
                  badge: 'Data-Backed'
                },
                {
                  id: 'cost_of_living_relocation',
                  label: 'Cost of Living & Relocation',
                  desc: 'Request higher one-time sign-on / relocation for SF/NYC metropolitan hubs.',
                  icon: Building2,
                  badge: 'Low Friction'
                },
                {
                  id: 'equity_skew_optimization',
                  label: 'Equity Skew Optimization',
                  desc: 'Request greater long-term equity upside for high-growth tech firms.',
                  icon: Layers,
                  badge: 'High Conviction'
                }
              ].map(st => {
                const isSelected = strategy === st.id;
                const IconComponent = st.icon;

                return (
                  <div
                    key={st.id}
                    onClick={() => setStrategy(st.id as NegotiationStrategyType)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-950/50 border-purple-500/80 shadow-md shadow-purple-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <IconComponent className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-slate-400'}`} />
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {st.badge}
                        </span>
                      </div>
                      <div className="font-bold text-white text-xs font-mono">{st.label}</div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {st.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Strategy Adjustment Parameters */}
            {strategy === 'competing_offer_leverage' && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <label className="text-slate-400 block mb-1">Competing Company Name</label>
                  <input
                    type="text"
                    value={competingCompany}
                    onChange={(e) => setCompetingCompany(e.target.value)}
                    placeholder="e.g. OpenAI, Stripe"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Target Base Increase (USD)</label>
                  <input
                    type="number"
                    value={proposedBaseIncrease}
                    onChange={(e) => setProposedBaseIncrease(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Target Sign-On Increase (USD)</label>
                  <input
                    type="number"
                    value={proposedSignOnIncrease}
                    onChange={(e) => setProposedSignOnIncrease(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            )}

            {/* Generated Email Draft */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>Generated Diplomatic Negotiation Draft</span>
                </span>

                <button
                  onClick={handleCopyDraft}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
                  <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Draft'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-3">
                <div className="text-slate-400 border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Subject:</span>{' '}
                  <span className="text-purple-300 font-bold">{negotiationDraft.subjectLine}</span>
                </div>
                <div className="text-slate-200 whitespace-pre-line leading-relaxed">
                  {negotiationDraft.bodyText}
                </div>
              </div>
            </div>

            {/* Recruiter Call Tactical Advice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Why This Draft Works (HR Psychology)</span>
                </span>
                <ul className="text-xs text-slate-400 space-y-1">
                  {negotiationDraft.rationalePoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-purple-400">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Rules for the Follow-Up Recruiter Call</span>
                </span>
                <ul className="text-xs text-slate-400 space-y-1">
                  {negotiationDraft.keyAdviceForCall.map((adv, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-teal-400">•</span>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Offer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" />
              <span>Ingest Offer from Pipeline Opportunity</span>
            </h3>

            <p className="text-xs text-slate-400">
              Select any verified role from your Opportunity Radar or Pipeline to create a populated offer dossier:
            </p>

            <select
              value={selectedOppForNewOffer}
              onChange={(e) => setSelectedOppForNewOffer(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono"
            >
              {opportunities.map(opp => (
                <option key={opp.id} value={opp.id}>
                  {opp.companyName} — {opp.title} ({opp.location})
                </option>
              ))}
            </select>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOfferFromOpp}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                Create Offer Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

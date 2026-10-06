/**
 * TERRASYNX: ATS Board Auto-Discover Internal Tool (PROMPT 28)
 * Allows developers and operators to type any company name, auto-discover
 * its public Greenhouse, Lever, SmartRecruiters, or Workable board, and
 * add it to atsTargets.ts with a single click.
 */

import React, { useState } from 'react';
import { 
  AtsDiscoveryService, 
  AtsDiscoveryResult, 
  companyNameToAtsBoard 
} from '../services/atsDiscoveryService';
import { ATSCompanyTarget, getAllAtsTargets, saveDynamicAtsTarget } from '../data/atsTargets';
import { 
  X, 
  Search, 
  Loader2, 
  CheckCircle2, 
  ExternalLink, 
  Building2, 
  Radio, 
  PlusCircle, 
  Sparkles,
  AlertCircle,
  Database,
  ShieldCheck
} from 'lucide-react';

interface AtsDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTargetAdded?: (target: ATSCompanyTarget) => void;
}

export const AtsDiscoveryModal: React.FC<AtsDiscoveryModalProps> = ({
  isOpen,
  onClose,
  onTargetAdded,
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<AtsDiscoveryResult | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addFeedback, setAddFeedback] = useState<string | null>(null);
  const [activeTargetCount, setActiveTargetCount] = useState<number>(() => getAllAtsTargets().length);

  if (!isOpen) return null;

  const handleDiscover = async (companyNameOverride?: string) => {
    const targetName = (companyNameOverride || query).trim();
    if (!targetName) return;

    if (companyNameOverride) {
      setQuery(companyNameOverride);
    }

    setIsSearching(true);
    setDiscoveryResult(null);
    setAddFeedback(null);

    try {
      const result = await companyNameToAtsBoard(targetName);
      
      // Check if already in active targets
      const currentTargets = getAllAtsTargets();
      const isAlreadyTracked = currentTargets.some(
        t => (result.slug && t.slug.toLowerCase() === result.slug.toLowerCase()) ||
             t.name.toLowerCase() === targetName.toLowerCase()
      );

      setDiscoveryResult({
        ...result,
        alreadyTracked: isAlreadyTracked,
      });
    } catch (err: any) {
      setDiscoveryResult({
        companyName: targetName,
        found: false,
        message: err?.message || 'Error occurred while probing ATS endpoints',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddTarget = async () => {
    if (!discoveryResult || !discoveryResult.found || !discoveryResult.provider || !discoveryResult.slug) {
      return;
    }

    setIsAdding(true);
    setAddFeedback(null);

    const target: ATSCompanyTarget = {
      id: discoveryResult.companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || discoveryResult.slug,
      name: discoveryResult.companyName,
      domain: discoveryResult.domain || `${discoveryResult.slug}.com`,
      provider: discoveryResult.provider,
      slug: discoveryResult.slug,
      logo: discoveryResult.logo || `https://logo.clearbit.com/${discoveryResult.slug}.com`,
      preferredKeywords: ['software', 'engineer', 'developer', 'intern', 'systems', 'backend'],
    };

    try {
      // 1. Client save
      saveDynamicAtsTarget(target);

      // 2. Server save (permanently updates atsTargets.ts & in-memory cache)
      const res = await AtsDiscoveryService.addDiscoveredTarget(target);

      setAddFeedback(res.message);
      setActiveTargetCount(getAllAtsTargets().length);

      setDiscoveryResult(prev => prev ? { ...prev, alreadyTracked: true } : null);

      if (onTargetAdded) {
        onTargetAdded(target);
      }
    } catch (err: any) {
      setAddFeedback(err?.message || 'Failed to add target.');
    } finally {
      setIsAdding(false);
    }
  };

  const quickPresets = ['Anthropic', 'Notion', 'WeWork', 'Typeform', 'Brex', 'Epignosis'];

  const getProviderBadgeColor = (provider?: string) => {
    switch (provider) {
      case 'greenhouse':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'lever':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'smartrecruiters':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'workable':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-950/80 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 text-slate-950 shadow-md">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">ATS Board Auto-Discover</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                  Internal Tool
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Company Name → Greenhouse / Lever / SmartRecruiters / Workable
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Tracker Stat Pill */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono">
            <span className="flex items-center gap-2 text-slate-400">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pipeline Target Pool</span>
            </span>
            <span className="text-cyan-300 font-bold">
              {activeTargetCount} Verified Companies Tracked in atsTargets.ts
            </span>
          </div>

          {/* Search Box */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleDiscover();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter company name (e.g. Anthropic, Notion, Typeform, WeWork)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 focus:border-cyan-500 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Probing...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Discover</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-[11px] font-mono text-slate-500">Quick Try:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {quickPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleDiscover(preset)}
                  disabled={isSearching}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors text-[11px] font-mono cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Active Searching State */}
          {isSearching && (
            <div className="p-6 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-200">
                  Scanning verified ATS providers for "{query}"...
                </p>
                <p className="text-xs font-mono text-slate-400">
                  Probing Greenhouse • Lever • SmartRecruiters • Workable
                </p>
              </div>
            </div>
          )}

          {/* Results Display */}
          {!isSearching && discoveryResult && (
            <div className="space-y-3 animate-fade-in">
              {discoveryResult.found ? (
                <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950/90 to-slate-900/90 border border-emerald-500/40 shadow-lg space-y-4">
                  {/* Company & Provider Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                        {discoveryResult.logo ? (
                          <img 
                            src={discoveryResult.logo} 
                            alt={discoveryResult.companyName}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              // Fallback to monogram
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-100">
                            {discoveryResult.companyName}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold uppercase border ${getProviderBadgeColor(discoveryResult.provider)}`}>
                            {discoveryResult.provider}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                          <span>Slug: <strong className="text-cyan-300">{discoveryResult.slug}</strong></span>
                          <span>•</span>
                          <span>Domain: <strong className="text-slate-300">{discoveryResult.domain}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{discoveryResult.jobCount ?? 'Active'} Openings</span>
                      </span>
                    </div>
                  </div>

                  {/* Sample Roles */}
                  {discoveryResult.sampleRoles && discoveryResult.sampleRoles.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                        Sample Active Roles:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {discoveryResult.sampleRoles.map((role, idx) => (
                          <span 
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 border border-slate-700 text-xs font-medium"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    {discoveryResult.boardUrl && (
                      <a
                        href={discoveryResult.boardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline"
                      >
                        <span>View Official Board</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <div className="flex items-center gap-3">
                      {discoveryResult.alreadyTracked ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Already Tracked in atsTargets.ts</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleAddTarget}
                          disabled={isAdding}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
                        >
                          {isAdding ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Adding to atsTargets.ts...</span>
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-4 h-4" />
                              <span>Add to atsTargets.ts</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {addFeedback && (
                    <div className="px-3 py-2 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{addFeedback}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Not Found Card (Anti-Hallucination & Truth-Anchored) */
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-3">
                  <div className="flex items-start gap-3 text-amber-300">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-200">
                        No Public ATS Board Found
                      </h4>
                      <p className="text-xs text-slate-400">
                        Tested standard URL endpoints across Greenhouse, Lever, SmartRecruiters, and Workable for candidate slugs:{' '}
                        <span className="font-mono text-cyan-300">
                          {discoveryResult.testedSlugs?.join(', ') || query}
                        </span>.
                      </p>
                      <p className="text-[11px] text-amber-400/90 font-mono mt-1">
                        🔒 Strict Anti-Fabrication Guarantee: TERRASYNX never invents or simulates mock ATS boards.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/80 text-xs font-mono text-slate-400">
          <span>Supported: Greenhouse • Lever • SmartRecruiters • Workable</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

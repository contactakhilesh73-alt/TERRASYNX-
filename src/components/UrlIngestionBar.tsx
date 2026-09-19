/**
 * TERRASYNX: Single-Action Job URL Ingestion Bar (Phase 5 Point 3)
 * Lets users paste any ATS or Careers URL (Greenhouse, Lever, Ashby, direct domain)
 * to instantly ingest, verify, and generate a Santiago 8-Block Dossier.
 */

import React, { useState } from 'react';
import { UrlIngestionService } from '../services/urlIngestionService';
import { Opportunity } from '../types';
import { 
  Link2, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ArrowRight,
  Clock
} from 'lucide-react';

interface UrlIngestionBarProps {
  onOpportunityIngested?: (opp: Opportunity) => void;
  onOpenDossier?: (opp: Opportunity) => void;
}

export const UrlIngestionBar: React.FC<UrlIngestionBarProps> = ({
  onOpportunityIngested,
  onOpenDossier,
}) => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'duplicate';
    text: string;
    opp?: Opportunity;
  } | null>(null);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) return;

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const result = await UrlIngestionService.ingestFromUrl(cleanUrl);

      if (result.success && result.opportunity) {
        setStatusMessage({
          type: 'success',
          text: `Successfully ingested "${result.opportunity.title}" at ${result.opportunity.companyName}! 8-Block Dossier compiled.`,
          opp: result.opportunity,
        });
        setUrlInput('');
        if (onOpportunityIngested) {
          onOpportunityIngested(result.opportunity);
        }
      } else if (result.isDuplicate && result.opportunity) {
        setStatusMessage({
          type: 'duplicate',
          text: result.error || 'This job requisition is already active in your Radar.',
          opp: result.opportunity,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: result.error || 'Failed to ingest URL. Ensure it is a valid career page or ATS link.',
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Network or parsing error encountered during URL ingestion.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-4 shadow-md space-y-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
            <Link2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Single-Action Job URL Ingestion Pipeline
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
            Greenhouse · Lever · Ashby · Direct Domain
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>Auto-Pulse Active · Background Dedup Guard</span>
        </div>
      </div>

      <form onSubmit={handleIngest} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste any job posting URL (e.g., boards.greenhouse.io/... or jobs.lever.co/...)"
            disabled={isProcessing}
            className="w-full pl-3.5 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors font-mono disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isProcessing || !urlInput.trim()}
          className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all shrink-0 cursor-pointer ${
            isProcessing || !urlInput.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : 'bg-amber-400 text-slate-950 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95'
          }`}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Ingesting & Auditing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ingest & Evaluate</span>
            </>
          )}
        </button>
      </form>

      {/* Real-Time Feedback Strip */}
      {statusMessage && (
        <div
          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : statusMessage.type === 'duplicate'
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : statusMessage.type === 'duplicate' ? (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-mono">{statusMessage.text}</span>
          </div>

          {statusMessage.opp && onOpenDossier && (
            <button
              onClick={() => onOpenDossier(statusMessage.opp!)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-amber-300 hover:text-amber-200 text-xs font-mono font-bold shrink-0 cursor-pointer"
            >
              <Layers className="w-3 h-3" />
              <span>Open 8-Block Dossier</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

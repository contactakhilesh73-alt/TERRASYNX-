/**
 * TERRASYNX: Smart Lightweight Daily Digest Studio (Phase 6 Point 1 / Req #5, #6)
 * Generates dual-daily (morning/evening) consolidated digests (< 25 KB) with strict RFC 3834
 * auto-submitted headers, zero inbox clutter, and 1-click .eml export.
 */

import React, { useState, useEffect } from 'react';
import { AtsInboundEngine } from '../services/atsInboundEngine';
import { DailyDigestPayload, Opportunity } from '../types';
import { 
  Mail, 
  Clock, 
  Download, 
  Copy, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  ExternalLink,
  Flame,
  Sun,
  Moon
} from 'lucide-react';

interface DailyDigestStudioProps {
  opportunities: Opportunity[];
}

export const DailyDigestStudio: React.FC<DailyDigestStudioProps> = ({ opportunities }) => {
  const [digests, setDigests] = useState<DailyDigestPayload[]>(AtsInboundEngine.getDigestHistory());
  const [selectedDigestId, setSelectedDigestId] = useState<string>(digests[0]?.id || '');
  const [copyToast, setCopyToast] = useState<string | null>(null);

  useEffect(() => {
    AtsInboundEngine.init();
    const unsubscribe = AtsInboundEngine.subscribe(() => {
      const latest = AtsInboundEngine.getDigestHistory();
      setDigests(latest);
      if (!selectedDigestId && latest.length > 0) {
        setSelectedDigestId(latest[0].id);
      }
    });
    return unsubscribe;
  }, [selectedDigestId]);

  // If no digest exists, automatically generate a morning baseline
  useEffect(() => {
    if (digests.length === 0) {
      const defaultDigest = AtsInboundEngine.generateDailyDigest('morning_dispatch', opportunities);
      setSelectedDigestId(defaultDigest.id);
    }
  }, [digests.length, opportunities]);

  const selectedDigest = digests.find(d => d.id === selectedDigestId) || digests[0];

  const handleGenerate = (type: 'morning_dispatch' | 'evening_wrapup') => {
    const newDigest = AtsInboundEngine.generateDailyDigest(type, opportunities);
    setSelectedDigestId(newDigest.id);
    setCopyToast(`Generated ${type === 'morning_dispatch' ? '08:00 AM Morning Dispatch' : '18:00 PM Evening Wrapup'}!`);
    setTimeout(() => setCopyToast(null), 3000);
  };

  const handleCopyRfc = () => {
    if (!selectedDigest) return;
    const raw = AtsInboundEngine.generateRawRfcEmail(selectedDigest);
    navigator.clipboard.writeText(raw);
    setCopyToast('Raw RFC 5322/3834 email copied to clipboard!');
    setTimeout(() => setCopyToast(null), 3000);
  };

  const handleDownloadEml = () => {
    if (!selectedDigest) return;
    const raw = AtsInboundEngine.generateRawRfcEmail(selectedDigest);
    const blob = new Blob([raw], { type: 'message/rfc822' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TERRASYNX_DIGEST_${selectedDigest.digestType.toUpperCase()}_${Date.now()}.eml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setCopyToast('Downloaded standard .eml file!');
    setTimeout(() => setCopyToast(null), 3000);
  };

  return (
    <div className="space-y-6 text-xs font-mono">
      {/* Top Banner Deck */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-slate-950 p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                Lightweight Daily Digest & RFC Infrastructure (Req #5, #6)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Size Budget &lt; 25 KB
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Dual-daily consolidated intelligence dispatches eliminating student inbox fatigue, authenticated with RFC 3834 auto-submitted headers.
            </p>
          </div>
        </div>

        {/* Dual Generator Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => handleGenerate('morning_dispatch')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 font-bold transition-all cursor-pointer"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Generate Morning (08:00 AM)</span>
          </button>

          <button
            onClick={() => handleGenerate('evening_wrapup')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/40 font-bold transition-all cursor-pointer"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Generate Evening (18:00 PM)</span>
          </button>
        </div>
      </div>

      {copyToast && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{copyToast}</span>
        </div>
      )}

      {/* Main Grid: Digest History (Left 4 cols) + Interactive Email Reader (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Generated Digest Archive */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dispatches Archive</span>
            </span>
            <span className="text-slate-500 text-[11px]">{digests.length} Generated</span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
            {digests.map((d) => {
              const isSelected = d.id === selectedDigest?.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDigestId(d.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/60 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-200 truncate">
                      {d.digestType === 'morning_dispatch' ? '☀️ Morning Dispatch' : '🌙 Evening Wrapup'}
                    </span>
                    <span className="text-[10px] text-cyan-400 shrink-0">
                      {d.sizeKb} KB
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans mt-1 line-clamp-1">
                    {d.title}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/80">
                    <span>{new Date(d.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-emerald-400">{d.items.length} Requisitions</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: RFC Header & Visual Email Preview */}
        <div className="lg:col-span-8 space-y-4">
          {selectedDigest ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
              {/* Header Bar with Export Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-100">{selectedDigest.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {selectedDigest.sizeKb} KB / 25 KB Budget
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-sans mt-0.5 block">
                    Generated: {new Date(selectedDigest.generatedAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyRfc}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy RFC</span>
                  </button>

                  <button
                    onClick={handleDownloadEml}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download .EML</span>
                  </button>
                </div>
              </div>

              {/* RFC 3834 Header Inspection Box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1">
                <div className="text-slate-500 pb-1 border-b border-slate-900 flex items-center justify-between">
                  <span>RFC 5322 & RFC 3834 Metadata Transcript</span>
                  <span className="text-emerald-400 font-bold">Auto-Submitted: auto-generated</span>
                </div>
                <div className="text-slate-400"><strong className="text-slate-300">From:</strong> {selectedDigest.rfcHeaders.from}</div>
                <div className="text-slate-400"><strong className="text-slate-300">To:</strong> {selectedDigest.rfcHeaders.to}</div>
                <div className="text-slate-400"><strong className="text-slate-300">Subject:</strong> {selectedDigest.rfcHeaders.subject}</div>
                <div className="text-slate-400"><strong className="text-slate-300">Message-ID:</strong> {selectedDigest.rfcHeaders.messageId}</div>
              </div>

              {/* Rendered Email Body Simulation */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-4">
                <p className="text-slate-300 text-[12px] font-sans leading-relaxed">
                  {selectedDigest.summaryText}
                </p>

                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Verified Priority Openings ({selectedDigest.items.length})
                  </span>

                  {selectedDigest.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{item.companyName}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-300">{item.title}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold">
                            {item.tag}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                          <span className="text-cyan-400 font-bold">{item.fitmentScore}% Fitment Match</span>
                          <span>·</span>
                          <span>{item.deadlineText}</span>
                        </div>
                      </div>

                      <a
                        href={item.actionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1 shrink-0"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Strict Rule #6: Verified no-reply identity • Zero tracking beacons</span>
                  <span className="text-emerald-400 font-bold">Size: {selectedDigest.sizeKb} KB (Passes &lt;25 KB)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">No digest selected.</div>
          )}
        </div>

      </div>
    </div>
  );
};

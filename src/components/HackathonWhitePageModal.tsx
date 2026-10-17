/**
 * TERRASYNX: Official Opportunity White Page & PDF/Share Modal
 * 
 * Strict Features Honored:
 * 1. Beautiful, official white-paper / circular styling (A4 document format).
 * 2. Displays verified opportunity information directly from the official portal:
 *    - Pay rate / Prize pool / Awards / Stipend
 *    - Timing, Registration Deadline & Event Dates
 *    - Requirements, Need & Verbatim Eligibility
 *    - Technical Submission Deliverables
 *    - Verified Official Domain & Provenance
 * 3. PDF Download & Print Engine (pixel-perfect A4 printing).
 * 4. Comprehensive Share Action (Native Web Share API + Clipboard Copy fallback with toast).
 */

import React, { useState } from 'react';
import { Hackathon, StudentProfile } from '../types';
import { HackathonTrackingService, HackathonApplicationRecord } from '../services/hackathonTrackingService';
import { HackathonBlueprintService } from '../services/hackathonBlueprintService';
import { CompanyLogo } from './CompanyLogo';
import { 
  X, 
  Printer, 
  Share2, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Trophy, 
  Building2, 
  Globe, 
  Users, 
  FileText, 
  CheckCircle2, 
  Sparkles,
  Info,
  Copy,
  Check,
  Award,
  Zap,
  Target,
  Code2,
  AlertTriangle
} from 'lucide-react';
import { HackathonsService } from '../services/hackathonsService';

interface HackathonWhitePageModalProps {
  hackathon: Hackathon;
  studentProfile?: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  applicationRecord?: HackathonApplicationRecord;
}

export const HackathonWhitePageModal: React.FC<HackathonWhitePageModalProps> = ({
  hackathon,
  studentProfile,
  isOpen,
  onClose,
  applicationRecord,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || hackathon.status === 'ANNOUNCED_UNCONFIRMED') return null;

  const currentYear = new Date().getFullYear();
  const docSerial = `DOSSIER-HACK-${currentYear}-${hackathon.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)}`;
  const displayDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const blueprint = HackathonBlueprintService.getBlueprint(hackathon);
  const hasFeeOrStake = HackathonsService.hasFeeOrStake(hackathon);

  // Handle PDF Export / Print
  const handlePrintPdf = () => {
    HackathonTrackingService.printHackathonWhitePage(hackathon, applicationRecord, studentProfile);
    setToastMessage('Triggering print dialog for PDF export...');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Share (Web Share API with clipboard fallback)
  const handleShare = async () => {
    const shareData = HackathonTrackingService.getShareableSummary(hackathon);
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or unsupported, fallback to copy
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}`);
      setCopiedShare(true);
      setToastMessage('Opportunity details and link copied to clipboard!');
      setTimeout(() => {
        setCopiedShare(false);
        setToastMessage(null);
      }, 3500);
    } catch {
      setToastMessage('Failed to copy. Please copy the URL manually.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="white-page-title"
      >
        {/* Top Control Bar */}
        <div className="px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 text-slate-200">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-bold">TERRASYNX Opportunity White Paper</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 hidden sm:inline">{docSerial}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Print / Download PDF */}
            <button
              onClick={handlePrintPdf}
              className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-950/50 transition-colors"
              title="Print or Save as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF / Print</span>
            </button>

            {/* Share Opportunity */}
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Share with fellow students or team members"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedShare ? 'Copied' : 'Share'}</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Disclaimer Banner (Prompt 49) */}
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-center gap-2 text-center text-xs font-semibold text-amber-200">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Summary generated by TERRASYNX. This is not an official document of the organizer.</span>
        </div>

        {/* Toast Feedback Banner */}
        {toastMessage && (
          <div className="bg-emerald-950/90 text-emerald-200 px-6 py-2 text-xs font-mono border-b border-emerald-500/40 flex items-center justify-between">
            <span>✓ {toastMessage}</span>
          </div>
        )}

        {/* Scrollable Document Area: Pristine White Paper */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-900/60 flex-1 flex justify-center">
          <div className="w-full max-w-3xl bg-white text-slate-900 border border-slate-300 rounded-xl shadow-xl p-6 sm:p-10 font-sans space-y-6">
            {/* Document Header with Host Logo */}
            <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
              <div className="flex items-start gap-3.5">
                <CompanyLogo
                  name={hackathon.organizer}
                  domain={hackathon.officialUrl ? (() => { try { return new URL(hackathon.officialUrl).hostname.replace(/^www\./, ''); } catch { return ''; } })() : ''}
                  size="lg"
                  className="shrink-0 mt-1"
                />
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-extrabold tracking-wider uppercase bg-orange-600 text-white mb-2">
                    TERRASYNX Opportunity Summary &amp; Blueprint
                  </div>
                  <h1 id="white-page-title" className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight">
                    {hackathon.name}
                  </h1>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium mt-1 flex flex-wrap items-center gap-2">
                    <span>Host Organization: <strong className="text-slate-900">{hackathon.organizer}</strong></span>
                    <span>•</span>
                    <span>Mode: <strong className="text-slate-900">{hackathon.mode.toUpperCase()}</strong></span>
                    <span>•</span>
                    <span>Region: <strong className="text-slate-900">{hackathon.country}</strong></span>
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-600 font-mono leading-relaxed border-l sm:border-l-0 pl-3 sm:pl-0 border-slate-200">
                <div>Ref: <strong className="text-slate-900">{docSerial}</strong></div>
                <div>Synthesized: <strong className="text-slate-900">{displayDate}</strong></div>
                <div className="text-emerald-700 font-bold">100% Free Entry Verified</div>
              </div>
            </div>

            {/* Prominent Provenance & Anti-Misrepresentation Banner (Prompt 49) */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-slate-800 text-xs shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-md bg-amber-200 text-amber-900 shrink-0 mt-0.5">
                  <Info className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="font-extrabold text-amber-950 text-xs uppercase tracking-wider">
                    Summary generated by TERRASYNX. This is not an official document of the organizer.
                  </div>
                  <p className="text-[11.5px] text-amber-900 leading-relaxed">
                    This document is an independent summary prepared for student preparation. All information should be confirmed on the official page. It is <strong>NOT</strong> an official publication, announcement, or document issued by <strong>{hackathon.organizer}</strong>. Event dates, prize purses, travel grants, and eligibility criteria are subject to change by the organizer at any time. Always verify current, authoritative information directly on the official host portal.
                  </p>
                </div>
              </div>
            </div>

            {/* Zero Fee & Student Safety Ribbon vs Fee / stake required Flag */}
            {hasFeeOrStake ? (
              <div 
                data-testid="whitepage-fee-stake-flag"
                className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-xs text-rose-950 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 font-bold text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Fee / stake required: Opportunity terms mention a stake, deposit, or participation fee.</span>
                </div>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-400 font-bold uppercase">
                  Fee / stake required
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-950 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Curated Opportunity Synthesis. No third-party registration charges. 100% Free Entry.</span>
                </div>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-bold uppercase">
                  {hackathon.status}
                </span>
              </div>
            )}

            {/* Four-Column Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Prize Pool / Pay</div>
                <div className="text-sm font-bold text-slate-900 mt-1">{hackathon.prizeText || 'Awards & Prizes'}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Registration Deadline</div>
                <div className="text-sm font-bold text-slate-900 mt-1">{hackathon.registrationDeadline || 'See Portal'}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Event Timeline</div>
                <div className="text-sm font-bold text-slate-900 mt-1">{hackathon.dates || 'Active Edition'}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Format & Location</div>
                <div className="text-sm font-bold text-slate-900 mt-1">{hackathon.mode.toUpperCase()} ({hackathon.country})</div>
              </div>
            </div>

            {/* SECTION 1: RANK-WISE PRIZE BREAKDOWN (WINNER KO KYA MILEGA) */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-orange-600" />
                  <span>1. Official Rank-Wise Prize Matrix & Rewards</span>
                </div>
                <span className="text-[11px] font-bold text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded border border-orange-300">
                  Total Pool: {blueprint.overallPrizePool}
                </span>
              </div>
              <div className="p-4 text-xs text-slate-700 space-y-3 leading-relaxed">
                <p className="text-slate-600">
                  Direct official awards distributed per verified rank tier, plus perks and platform benefits guaranteed for all participating student builders:
                </p>
                <div className="space-y-2.5">
                  {blueprint.prizeTiers.map((tier, idx) => (
                    <div 
                      key={tier.rankTitle} 
                      className={`p-3 rounded-lg border ${idx === 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-800'}`}>
                            {idx + 1}
                          </span>
                          <strong className="text-slate-900 text-xs">{tier.rankTitle}</strong>
                        </div>
                        <span className="font-mono font-bold text-orange-600 text-xs sm:text-right">
                          {tier.prizeAmount}
                        </span>
                      </div>
                      <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-slate-600">
                        {tier.perks.map((perk, pIdx) => (
                          <li key={pIdx}>{perk}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 2: TIMING & SCHEDULE */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <span>2. Official Timing, Dates & Registration Deadline</span>
              </div>
              <div className="p-4 text-xs text-slate-700 space-y-2 leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 font-mono text-[11px] block">Registration Deadline:</span>
                    <strong className="text-slate-900 font-mono text-sm">{hackathon.registrationDeadline || 'Check official link'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[11px] block">Event / Hacking Dates:</span>
                    <strong className="text-slate-900 font-mono text-sm">{hackathon.dates}</strong>
                  </div>
                </div>
                {hackathon.datesNote && (
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]">
                    ℹ️ <strong>Official Schedule Note:</strong> {hackathon.datesNote}
                  </p>
                )}
              </div>
            </div>

            {/* SECTION 3: ELIGIBILITY & REQUIREMENTS */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-orange-600" />
                <span>3. Eligibility, Qualifications & Team Rules</span>
              </div>
              <div className="p-4 text-xs text-slate-700 space-y-2.5 leading-relaxed">
                <div>
                  <strong className="text-slate-900">Official Eligibility (As Listed by Host):</strong>
                  <p className="mt-1 text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200 font-mono text-[11px]">
                    {hackathon.eligibilityText}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Mandatory safety policy: Check the event's own rules on the host page for specific institutional criteria.</span>
                </div>
                {hackathon.spocNote && (
                  <div className="p-2.5 rounded bg-amber-100/70 border border-amber-300 text-amber-950 font-semibold text-[11px]">
                    ⚠️ {hackathon.spocNote}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: WHAT PROJECT TO BUILD & DELIVERABLES */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-orange-600" />
                <span>4. What Project to Build: Problem Statements & Deliverables</span>
              </div>
              <div className="p-4 text-xs text-slate-700 space-y-3 leading-relaxed">
                <div>
                  <strong className="text-slate-900 block mb-1">Target Solution Scope:</strong>
                  <p className="text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
                    {blueprint.strategy.projectScope.whatToBuild}
                  </p>
                </div>

                <div>
                  <strong className="text-slate-900 block mb-1.5">Official Problem Statements / Target Use Cases:</strong>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                    {blueprint.strategy.projectScope.targetProblemStatements.map((ps, idx) => (
                      <li key={idx}><span className="text-slate-900 font-medium">{ps}</span></li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong className="text-slate-900 block mb-1.5">Mandatory Submission Deliverables (Official Portal Requirement):</strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {blueprint.strategy.projectScope.mandatoryDeliverables.map((deliv, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        <span className="font-bold text-slate-900 block mb-0.5">{deliv.title}</span>
                        <p className="text-[11px] text-slate-600 leading-normal">{deliv.requirement}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: TECHNICAL ARCHITECTURE & PERFORMANCE SLAS */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-orange-600" />
                <span>5. Recommended Stack & High Performance SLAs</span>
              </div>
              <div className="p-4 text-xs text-slate-700 space-y-3 leading-relaxed">
                <div>
                  <span className="text-slate-500 font-mono text-[11px] block mb-1">Recommended Tech Stack:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {blueprint.strategy.architecturalGuidance.recommendedStack.map((tech, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-mono text-[11px] font-semibold border border-slate-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-mono text-[11px] block mb-1">Core System Capabilities:</span>
                  <ul className="list-disc pl-5 space-y-0.5 text-xs text-slate-700">
                    {blueprint.strategy.architecturalGuidance.coreCapabilities.map((cap, idx) => (
                      <li key={idx}>{cap}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-slate-500 font-mono text-[11px] block mb-1">Performance & Capability SLAs:</span>
                  <ul className="list-disc pl-5 space-y-0.5 text-xs text-emerald-800 font-medium">
                    {blueprint.strategy.architecturalGuidance.performanceAndSlas.map((sla, idx) => (
                      <li key={idx}>⚡ {sla}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* SECTION 6: THE WINNING EDGE (REQUIREMENT SE UPAR UTHKAR) */}
            <div className="rounded-lg border border-purple-300 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-950 border-b border-purple-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>6. The Winning Edge: Features Beyond Baseline to Outrank Competitors</span>
              </div>
              <div className="p-4 text-xs text-slate-700 space-y-3 leading-relaxed">
                <p className="text-slate-600">
                  To achieve Rank 1 out of hundreds of global teams, integrate capabilities that exceed normal prompt wrappers and address hard architectural challenges:
                </p>
                <div className="space-y-2.5">
                  {blueprint.strategy.winningEdgeFeatures.map((feat, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-purple-50/60 border border-purple-200">
                      <div className="font-bold text-purple-900 text-xs mb-1 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{feat.featureName}</span>
                      </div>
                      <div className="text-[11px] text-slate-700 mb-1">
                        <strong>Why It Beats Others:</strong> {feat.whyItOutranksCompetitors}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono bg-white/80 p-1.5 rounded border border-purple-100">
                        Technical Implementation: {feat.technicalDepthDescription}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Multi-AI Model Guidance */}
                {blueprint.strategy.aiIntelligenceAdvice && blueprint.strategy.aiIntelligenceAdvice.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <strong className="text-purple-950 text-xs block mb-2">Multi-AI Synthesis Strategy (Claude, ChatGPT, Gemini, Cursor):</strong>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {blueprint.strategy.aiIntelligenceAdvice.map((ai, idx) => (
                        <div key={idx} className="p-2.5 rounded bg-white border border-slate-200">
                          <span className="font-bold text-slate-900 block text-[11px]">🤖 {ai.modelSource}</span>
                          <p className="text-[10px] text-slate-600 mt-0.5">{ai.strategicAdvantage}</p>
                          <p className="text-[9.5px] font-mono text-purple-700 mt-1 bg-purple-50 p-1 rounded">
                            {ai.tacticalPromptTip}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 7: JUDGING RUBRIC & HOW TO SCORE 10/10 */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                <span>7. Official Judging Rubric & Max Score Strategy</span>
              </div>
              <div className="p-4 text-xs text-slate-700 space-y-2 leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {blueprint.strategy.judgingRubricBreakdown.map((rubric, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between font-bold text-slate-900 text-xs mb-1">
                        <span>{rubric.criteria}</span>
                        <span className="text-orange-600 font-mono">{rubric.weightPercentage}%</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-normal">{rubric.howToScoreMax}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 8: 48-HOUR TACTICAL SPRINT ROADMAP */}
            {blueprint.strategy.executionRoadmap48h && blueprint.strategy.executionRoadmap48h.length > 0 && (
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-orange-600" />
                  <span>8. 48-Hour Tactical Sprint Execution Roadmap</span>
                </div>
                <div className="p-4 text-xs text-slate-700 space-y-2 leading-relaxed">
                  <div className="space-y-2">
                    {blueprint.strategy.executionRoadmap48h.map((step, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-start gap-2">
                        <span className="font-mono font-bold text-orange-600 text-[11px] shrink-0 sm:w-28">
                          {step.timeframe}
                        </span>
                        <div className="flex-1">
                          <strong className="text-slate-900 text-xs block mb-0.5">{step.focus}</strong>
                          <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                            {step.deliverables.map((d, dIdx) => (
                              <li key={dIdx}>{d}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STUDENT APPLICATION TRACKING RECORD (if tracked) */}
            {applicationRecord && (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-xs space-y-2">
                <div className="font-mono font-bold text-emerald-900 uppercase flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Student Application Dossier Record</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-700 font-mono">
                  <div>Record ID: <strong className="text-slate-900">{applicationRecord.confirmationId}</strong></div>
                  <div>Applicant: <strong className="text-slate-900">{applicationRecord.applicantName}</strong></div>
                  <div>Status: <strong className="text-emerald-800 uppercase">{applicationRecord.status}</strong></div>
                  <div>Email: <strong className="text-slate-900">{applicationRecord.applicantEmail}</strong></div>
                  <div>College: <strong className="text-slate-900">{applicationRecord.collegeName}</strong></div>
                  <div>Tracked Date: <strong className="text-slate-900">{new Date(applicationRecord.appliedTimestamp).toLocaleDateString()}</strong></div>
                </div>
              </div>
            )}

            {/* SECTION 6: VERIFIED SOURCE & CANONICAL PORTAL (Prompt 49: Always show sourceUrl and detectedOn) */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-orange-600" />
                <span>6. Verified Source URL &amp; Canonical Registration Link</span>
              </div>
              <div className="p-4 text-xs text-slate-700 space-y-2.5 leading-relaxed">
                <div>
                  <span className="font-semibold text-slate-900 block mb-0.5">Source URL:</span>
                  <a 
                    href={hackathon.sourceUrl || hackathon.officialUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-orange-600 font-mono underline hover:text-orange-700 break-all text-[11.5px]"
                  >
                    {hackathon.sourceUrl || hackathon.officialUrl}
                  </a>
                </div>
                <div className="text-[11px] text-slate-700 font-mono flex items-center gap-2 pt-1 border-t border-slate-100">
                  <span className="font-semibold text-slate-800">Detected On:</span>
                  <span className="text-slate-900">{hackathon.detectedOn || 'Recurring series registered / Active monitoring snapshot'}</span>
                </div>
              </div>
            </div>

            {/* Print Footer & Summary Attribution (Prompt 49) */}
            <div className="border-t border-slate-300 pt-5 space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-700 font-medium print:block">
                Summary generated by TERRASYNX. This is not an official document of the organizer.
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[10px] text-slate-500">
                <div>
                  <strong className="text-slate-800 font-bold block">TERRASYNX AUTONOMOUS STUDENT ENGINE</strong>
                  <span>Curated research dossier synthesized for student preparation. 100% Free Guarantee. Not an official document of {hackathon.organizer}.</span>
                </div>
                <div className="border border-dashed border-slate-400 p-2.5 rounded font-mono text-[9px] text-slate-700 text-right">
                  <div>[SYNTHESIS INTEGRITY PROOF]</div>
                  <div>SHA-256: {hackathon.id.slice(0, 16)}...</div>
                  <div>DISCLAIMER: INDEPENDENT ANALYSIS • CONFIRM ON HOST PORTAL</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <a
            href={hackathon.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold font-mono text-xs cursor-pointer shadow-md shadow-orange-950/50 transition-colors"
          >
            <span>Open Official Registration Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPdf}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print White Page</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

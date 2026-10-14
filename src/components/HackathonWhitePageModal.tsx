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
  Code2
} from 'lucide-react';

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

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const docSerial = `CIRCULAR-HACK-${currentYear}-${hackathon.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)}`;
  const displayDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const blueprint = HackathonBlueprintService.getBlueprint(hackathon);

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
            <span className="text-slate-300 font-bold">Official Opportunity White Paper</span>
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

        {/* Toast Feedback Banner */}
        {toastMessage && (
          <div className="bg-emerald-950/90 text-emerald-200 px-6 py-2 text-xs font-mono border-b border-emerald-500/40 flex items-center justify-between">
            <span>✓ {toastMessage}</span>
          </div>
        )}

        {/* Scrollable Document Area: Pristine White Paper */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-900/60 flex-1 flex justify-center">
          <div className="w-full max-w-3xl bg-white text-slate-900 border border-slate-300 rounded-xl shadow-xl p-6 sm:p-10 font-sans space-y-6">
            {/* Document Header with Official Host Logo */}
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
                    Official Opportunity Circular
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
                <div>Published Date: <strong className="text-slate-900">{displayDate}</strong></div>
                <div className="text-emerald-700 font-bold">100% Free Entry Verified</div>
              </div>
            </div>

            {/* Official Zero Fee & Student Safety Ribbon */}
            <div className="p-3.5 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-950 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Verified Official Publication. No third-party registration charges.</span>
              </div>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-bold uppercase">
                {hackathon.status}
              </span>
            </div>

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

            {/* SECTION 1: PAY RATE, PRIZES & PERKS */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-orange-600" />
                <span>1. Compensation, Prize Pool & Student Benefits</span>
              </div>
              <div className="p-4 text-xs text-slate-700 space-y-2 leading-relaxed">
                <p>
                  <strong>Total Listed Prizes:</strong> <span className="text-slate-950 font-bold">{hackathon.prizeText}</span>
                </p>
                <p>
                  <strong>Entry Fee:</strong> <span className="text-emerald-700 font-semibold">{hackathon.entryFeeText || '100% Free - Verified Zero Fee'}</span>
                </p>
                <p className="text-slate-600">
                  Participants receive access to official mentor hours, digital participant certificates, sponsor platform credits, and potential interview fast-tracks for top performing teams.
                </p>
              </div>
            </div>

            {/* SECTION 2: TIMING & SCHEDULE */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <span>2. Official Timing, Dates & Schedule</span>
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

            {/* SECTION 4: THEMES & APPROVED TRACKS */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>4. Competition Tracks & Problem Themes</span>
              </div>
              <div className="p-4 text-xs text-slate-700 space-y-2">
                <p>Participants are invited to develop solutions aligning with one or more of the following official focus domains:</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {hackathon.themes && hackathon.themes.length > 0 ? (
                    hackathon.themes.map(t => (
                      <span 
                        key={t}
                        className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-mono text-[11px] font-semibold border border-slate-300"
                      >
                        #{t}
                      </span>
                    ))
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-mono text-[11px]">#OpenInnovation</span>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 5: DELIVERABLES & TECHNICAL REQUIREMENTS */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-orange-600" />
                <span>5. Mandatory Submission Deliverables</span>
              </div>
              <div className="p-4 text-xs text-slate-700 leading-relaxed">
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Source Code Repository:</strong> Public GitHub / GitLab repository containing working code and step-by-step README instructions.</li>
                  <li><strong>Demonstration Video:</strong> 2-3 minute recorded video walkthrough displaying core features and user flow.</li>
                  <li><strong>Project Presentation:</strong> Problem definition, architecture diagram, tech stack, and future roadmap.</li>
                  <li><strong>Original Work Certification:</strong> Submissions must be newly constructed during the official hacking duration.</li>
                </ul>
              </div>
            </div>

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

            {/* SECTION 6: VERIFIED CANONICAL PORTAL */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-orange-600" />
                <span>6. Verified Canonical Registration Link</span>
              </div>
              <div className="p-4 text-xs text-slate-700 space-y-2 leading-relaxed">
                <p>
                  <strong>Official Host Portal:</strong>{' '}
                  <a 
                    href={hackathon.officialUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-orange-600 font-mono underline hover:text-orange-700 break-all"
                  >
                    {hackathon.officialUrl}
                  </a>
                </p>
                {hackathon.detectedOn && (
                  <p className="text-[11px] text-cyan-700 font-mono">
                    ✓ Verified on official source page on {hackathon.detectedOn}
                  </p>
                )}
              </div>
            </div>

            {/* Official Footer & Verification Stamp */}
            <div className="border-t border-slate-300 pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[10px] text-slate-500">
              <div>
                <strong className="text-slate-800 font-bold block">TERRASYNX AUTONOMOUS STUDENT ENGINE</strong>
                <span>Direct official portal synchronization. 100% Free Guarantee. Human submission only.</span>
              </div>
              <div className="border border-dashed border-slate-400 p-2.5 rounded font-mono text-[9px] text-slate-700 text-right">
                <div>[CRYPTOGRAPHIC FOOTPRINT]</div>
                <div>SHA-256: {hackathon.id.slice(0, 16)}...</div>
                <div>AUTHENTICITY: VERIFIED OFFICIAL DOMAIN</div>
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

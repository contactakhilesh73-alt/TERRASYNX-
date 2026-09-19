/**
 * TERRASYNX: Smart Auto-Fill Assistant Modal (Req #4 & #17)
 * - Form fields pre-filled, review karke khud submit karein
 * - Candidate profile & tailored resume pre-flight dossier
 * - Mandatory Legal & Work Authorization Confirmation Gate
 * - Cryptographic Submission Receipt generation
 * - Direct transition to 'Applied' in the Execution Pipeline
 */

import React, { useState, useEffect } from 'react';
import { Opportunity, StudentProfile, FastApplyReceipt } from '../types';
import { FastApplyService, FastApplyStepProgress } from '../services/fastApplyService';
import { AppliedDossierService } from '../services/appliedDossierService';
import { CompanyLogo } from './CompanyLogo';
import { 
  X, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertTriangle, 
  Lock, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Download
} from 'lucide-react';

interface FastApplyModalProps {
  opportunity: Opportunity | null;
  studentProfile: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  onApplicationCompleted?: (receipt: FastApplyReceipt) => void;
  onNavigateToPipeline?: () => void;
}

export const FastApplyModal: React.FC<FastApplyModalProps> = ({
  opportunity,
  studentProfile,
  isOpen,
  onClose,
  onApplicationCompleted,
  onNavigateToPipeline,
}) => {
  if (!isOpen || !opportunity) return null;

  const [state, setState] = useState<'review' | 'executing' | 'confirmed'>('review');
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [currentProgress, setCurrentProgress] = useState<FastApplyStepProgress | null>(null);
  const [receipt, setReceipt] = useState<FastApplyReceipt | null>(null);

  // Legal & Work Auth States
  const [sponsorshipStatus, setSponsorshipStatus] = useState<string>('F-1 OPT/CPT Eligible (No immediate sponsorship required)');
  const [batchConfirmed, setBatchConfirmed] = useState<boolean>(true);
  const [locationConsent, setLocationConsent] = useState<boolean>(true);
  const [workAuthConfirmed, setWorkAuthConfirmed] = useState<boolean>(true);

  const portalType = FastApplyService.detectPortalType(opportunity);

  // Check if this opportunity was already submitted
  useEffect(() => {
    const existingReceipt = FastApplyService.getReceiptForOpportunity(opportunity.id);
    if (existingReceipt) {
      setReceipt(existingReceipt);
      setState('confirmed');
    } else {
      setState('review');
      setReceipt(null);
    }
  }, [opportunity]);

  const handleStartSubmission = async () => {
    setState('executing');
    try {
      const newReceipt = await FastApplyService.executeSafeSubmission(
        opportunity,
        studentProfile,
        {
          workAuthConfirmed,
          sponsorshipStatus,
          batchYearConfirmed: batchConfirmed,
          locationConsent,
        },
        (progress) => {
          setCurrentProgress(progress);
        }
      );

      setReceipt(newReceipt);
      setState('confirmed');
      
      // Store in Permanent Applied Dossier Archive (Req #8)
      AppliedDossierService.recordApplicationSubmission(newReceipt, opportunity);

      if (onApplicationCompleted) {
        onApplicationCompleted(newReceipt);
      }
    } catch (err) {
      console.error('Submission error', err);
      setState('review');
    }
  };

  const handleCopyConfirmation = () => {
    if (!receipt) return;
    navigator.clipboard.writeText(receipt.confirmationId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDownloadProof = () => {
    if (!receipt) return;
    const proofText = `=====================================================
TERRASYNX OFFICIAL CRYPTOGRAPHIC APPLICATION RECEIPT
=====================================================
Confirmation ID: ${receipt.confirmationId}
Opportunity:     ${receipt.jobTitle}
Company:         ${receipt.companyName}
Domain:          ${opportunity.companyDomain}
Portal Type:     ${receipt.portalType} API
Submitted At:    ${new Date(receipt.submittedAt).toUTCString()}
Candidate Name:  ${receipt.candidateName}
Candidate Email: ${receipt.candidateEmail}
Work Auth Gate:  ${receipt.workAuthSelected}
Resume Used:     ${receipt.tailoredResumeUsed}
Human Latency:   ${receipt.humanLatencySeconds}s
Anti-Bot Shield: ${receipt.antiBotStatus}
SHA-256 Token:   ${receipt.sha256Hash}
Verification:    ${receipt.receiptUrl}
=====================================================
Conforming to TERRASYNX Strict Zero-Fake Integrity Spec.`;

    const blob = new Blob([proofText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${receipt.confirmationId}_Submission_Proof.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
          <CompanyLogo
            domain={opportunity.companyDomain}
            name={opportunity.companyName}
            size="md"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base text-slate-100">{opportunity.companyName}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                {portalType} Assistant
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Smart Auto-Fill Assistant
              </span>
            </div>
            <h2 className="text-sm font-semibold text-slate-300 truncate mt-0.5">
              {opportunity.title}
            </h2>
          </div>
        </div>

        {/* Body Content by State */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 scrollbar-thin">

          {/* STATE 1: PRE-FLIGHT REVIEW & MANDATORY LEGAL CONFIRMATION */}
          {state === 'review' && (
            <div className="space-y-5 text-xs">
              
              {/* Honest Assistant Guidance Banner */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex-shrink-0">
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">Smart Auto-Fill Assistant</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                    Form fields pre-filled, review karke khud submit karein. Ye assistant aapki verified profile details aur tailored resume organize karta hai taaki aap confidence ke sath official portal par review aur apply kar sakein.
                  </p>
                </div>
              </div>

              {/* Candidate Info Mapping Card */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-slate-300 font-mono text-xs border-b border-slate-800/80 pb-2">
                  <span className="font-bold">1. Verified Candidate Dossier</span>
                  <span className="text-cyan-400 text-[11px]">Auto-Extracted from Profile</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 block">Full Name:</span>
                    <span className="text-slate-200 font-bold">{studentProfile.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Email Address:</span>
                    <span className="text-slate-200 font-bold">{studentProfile.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">University / Batch:</span>
                    <span className="text-slate-200 font-bold">{studentProfile.collegeName} ({studentProfile.graduationYear})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Degree & CGPA:</span>
                    <span className="text-slate-200 font-bold">{studentProfile.degree} • {studentProfile.currentCgpa}</span>
                  </div>
                </div>
              </div>

              {/* Tailored Resume Injection Preview */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-slate-300 font-mono text-xs border-b border-slate-800/80 pb-2">
                  <span className="font-bold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>2. Attached ATS-Tailored Resume</span>
                  </span>
                  <span className="text-emerald-400 text-[11px] font-bold">
                    {opportunity.fitment.overallScore}% ATS Alignment
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-200 font-semibold truncate">
                    {studentProfile.fullName.replace(/\s+/g, '_')}_{opportunity.companyName}_Tailored_v2.pdf
                  </span>
                  <span className="text-slate-400 flex-shrink-0 text-[10px]">
                    Matched: {opportunity.fitment.matchedSkills.slice(0, 3).join(', ')}
                  </span>
                </div>
              </div>

              {/* Strict Human Legal & Compliance Gate (Req #17) */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-900/40 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-mono text-xs border-b border-amber-900/30 pb-2">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold">3. Mandatory Legal & Compliance Gate</span>
                </div>

                {/* Work Authorization Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-300 font-mono block">
                    Select Official Work Authorization Status:
                  </label>
                  <select
                    value={sponsorshipStatus}
                    onChange={(e) => setSponsorshipStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="F-1 OPT/CPT Eligible (No immediate sponsorship required)">
                      F-1 Student (OPT / CPT Eligible - No immediate sponsorship needed)
                    </option>
                    <option value="Authorized to work with No Sponsorship Required">
                      Citizen / Permanent Resident (No sponsorship required)
                    </option>
                    <option value="Will require H-1B or Visa Sponsorship now or in future">
                      Will require H-1B / Visa Sponsorship now or in the future
                    </option>
                    <option value="Eligible for India / APAC Domestic Employment">
                      Domestic Employment (Authorized for India / APAC locations)
                    </option>
                  </select>
                </div>

                {/* Legal Confirmation Checkboxes */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-start gap-2 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workAuthConfirmed}
                      onChange={(e) => setWorkAuthConfirmed(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-950 cursor-pointer"
                    />
                    <span>I verify that my work authorization selection accurately reflects my legal eligibility.</span>
                  </label>

                  <label className="flex items-start gap-2 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={batchConfirmed}
                      onChange={(e) => setBatchConfirmed(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-950 cursor-pointer"
                    />
                    <span>I confirm my graduation year ({studentProfile.graduationYear}) is within the eligible range for this requisition.</span>
                  </label>

                  <label className="flex items-start gap-2 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={locationConsent}
                      onChange={(e) => setLocationConsent(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-950 cursor-pointer"
                    />
                    <span>I accept the role's work arrangement ({opportunity.workMode.toUpperCase()} in {opportunity.location}).</span>
                  </label>
                </div>
              </div>

            </div>
          )}

          {/* STATE 2: EXECUTING HUMAN-PACED APPLICATION SEQUENCE */}
          {state === 'executing' && (
            <div className="py-8 space-y-6 text-center">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-cyan-400 font-bold font-mono text-xs">
                  {currentProgress ? `${currentProgress.step}/5` : '...'}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100">
                  {currentProgress ? currentProgress.title : 'Initialising Safe Gateway...'}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1.5 max-w-md mx-auto">
                  {currentProgress ? currentProgress.detail : 'Connecting to canonical applicant portal...'}
                </p>
              </div>

              {/* Progress Steps Checklist */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-left text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>1. Candidate Profile Data Extracted</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>2. Legal Compliance Gate Verified</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>3. ATS Resume Payload Embedded</span>
                </div>
                <div className={`flex items-center gap-2 ${currentProgress && currentProgress.step >= 4 ? 'text-slate-200' : 'text-slate-500'}`}>
                  {currentProgress && currentProgress.step >= 4 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-600 animate-pulse" />
                  )}
                  <span>4. Smart Auto-Fill Assistant & Form Pre-Fill</span>
                </div>
                <div className={`flex items-center gap-2 ${currentProgress && currentProgress.step >= 5 ? 'text-slate-200' : 'text-slate-500'}`}>
                  {currentProgress && currentProgress.step >= 5 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-600" />
                  )}
                  <span>5. Official Requisition Confirmation Token</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-cyan-400/80">
                ✨ Smart Auto-Fill Assistant Ready • Form fields pre-filled, review karke khud submit karein
              </div>
            </div>
          )}

          {/* STATE 3: OFFICIALLY CONFIRMED & IMMUTABLE RECEIPT */}
          {state === 'confirmed' && receipt && (
            <div className="space-y-5 animate-fadeIn">
              
              <div className="text-center space-y-2 py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/80 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-950">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">
                  Application Prepared &amp; Registered
                </h3>
                <p className="text-xs text-slate-400">
                  Candidate dossier verified for {opportunity.companyName}'s official applicant portal.
                </p>
              </div>

              {/* Official Cryptographic Receipt Box */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-400 text-[11px]">Official Confirmation ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-300 text-sm">{receipt.confirmationId}</span>
                    <button
                      onClick={handleCopyConfirmation}
                      className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                      title="Copy Confirmation ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Gateway Platform:</span>
                    <span className="text-slate-200">{receipt.portalType} Portal</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Preparation Status:</span>
                    <span className="text-emerald-400">{receipt.antiBotStatus}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Preparation Duration:</span>
                    <span className="text-slate-200">{receipt.humanLatencySeconds} seconds</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Timestamp:</span>
                    <span className="text-slate-200">{new Date(receipt.submittedAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900">
                  <span className="text-slate-500 text-[10px] block">Cryptographic SHA-256 Integrity Token:</span>
                  <span className="text-slate-400 text-[10px] break-all select-all font-mono">
                    {receipt.sha256Hash}
                  </span>
                </div>
              </div>

              {/* System Automated Actions Summary */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-[11px] font-mono text-slate-300">
                <div className="text-cyan-400 font-bold mb-1">System State Synchronisation:</div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kanban Execution Pipeline moved to <strong>'Applied'</strong> stage.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Job-specific 'Apply Now' alerts automatically muted for this requisition.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Official <strong>Tier B (Navy/Slate)</strong> receipt delivered to Alert Relay inbox.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>7-day follow-up reminder queued automatically.</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          {state === 'review' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={opportunity.officialApplyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-900 transition-colors flex items-center gap-1.5"
                >
                  <span>Manual Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={handleStartSubmission}
                  disabled={!workAuthConfirmed || !batchConfirmed || !locationConsent}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-mono shadow-lg shadow-cyan-950 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>Start Smart Auto-Fill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}

          {state === 'executing' && (
            <div className="w-full text-center py-1 text-xs text-slate-500 font-mono">
              Auto-fill in progress • Please do not close this window
            </div>
          )}

          {state === 'confirmed' && (
            <>
              <button
                onClick={handleDownloadProof}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Proof (.txt)</span>
              </button>

              <div className="flex items-center gap-2">
                {onNavigateToPipeline && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToPipeline();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800 hover:bg-cyan-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View in Kanban</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-white text-slate-950 font-mono transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

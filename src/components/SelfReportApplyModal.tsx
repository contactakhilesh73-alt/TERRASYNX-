import React, { useState } from 'react';
import { Opportunity, AuthUserSession } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { resolveCanonicalApplyUrl } from '../utils/portalUrlResolver';
import { 
  X, 
  CheckCircle2, 
  ExternalLink, 
  Mail, 
  ShieldCheck, 
  FileCheck2, 
  Building2,
  Lock,
  ArrowRight
} from 'lucide-react';

interface SelfReportApplyModalProps {
  opportunity: Opportunity | null;
  currentUser: AuthUserSession | null;
  defaultEmail: string;
  onClose: () => void;
  onConfirm: (opportunity: Opportunity, applicantEmail: string, notes?: string) => void;
  onOpenGoogleSignIn?: () => void;
}

export const SelfReportApplyModal: React.FC<SelfReportApplyModalProps> = ({
  opportunity,
  currentUser,
  defaultEmail,
  onClose,
  onConfirm,
  onOpenGoogleSignIn,
}) => {
  const [emailInput, setEmailInput] = useState<string>(() => {
    return currentUser?.email || defaultEmail || '';
  });
  const [confirmationNumber, setConfirmationNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!opportunity) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please provide a valid Gmail/email address that you used on the company portal.');
      return;
    }

    const fullNotes = confirmationNumber.trim()
      ? `ATS Requisition Confirmation: ${confirmationNumber.trim()}${notes.trim() ? ` — ${notes.trim()}` : ''}`
      : notes.trim() || undefined;

    onConfirm(opportunity, cleanEmail, fullNotes);
    onClose();
  };

  const canonicalUrl = resolveCanonicalApplyUrl(opportunity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg rounded-2xl border border-blue-500/40 bg-slate-900 p-6 shadow-2xl shadow-blue-950/50 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-950/90 border border-blue-700/80 text-blue-400 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Log Direct Official ATS Submission</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                Self-Filed
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Track applications submitted directly on the employer portal
            </p>
          </div>
        </div>

        {/* Target Requisition Snapshot */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
          <CompanyLogo
            domain={opportunity.companyDomain}
            name={opportunity.companyName}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm text-slate-200">{opportunity.companyName}</span>
              <span className="text-[10px] font-mono text-cyan-400">Req #{opportunity.verification.requisitionId}</span>
            </div>
            <h3 className="text-xs text-slate-300 font-semibold line-clamp-1 mt-0.5">
              {opportunity.title}
            </h3>
            <a
              href={canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
            >
              <span>Verify official portal link</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </a>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Submission Route Provenance Banner */}
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 text-xs text-blue-200 font-mono flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-blue-300">Tracked Provenance Route:</span>
              <p className="text-[11px] text-blue-200/80 leading-relaxed">
                This application will be distinctly marked as <strong className="text-white">🏢 Official ATS Portal (Self-Filed)</strong>, separating it from assistant-guided submissions.
              </p>
            </div>
          </div>

          {/* Candidate Gmail ID Input */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Gmail ID Used on Portal:</span>
              </span>
              {currentUser?.email && (
                <span className="text-[10px] text-emerald-400 font-normal">
                  ✓ Active Login: {currentUser.email}
                </span>
              )}
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. kakhileshsingh310@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 transition-colors"
              required
            />
            <p className="mt-1 text-[11px] text-slate-400 font-mono">
              When you log into TERRASYNX with this Gmail ID, this application will automatically appear as <strong className="text-emerald-400">Applied</strong>.
            </p>
          </div>

          {/* Optional Confirmation Number */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
              <span>ATS Confirmation Number (Optional):</span>
            </label>
            <input
              type="text"
              value={confirmationNumber}
              onChange={(e) => setConfirmationNumber(e.target.value)}
              placeholder="e.g. GH-194021, APP-2026-X8"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-slate-600 transition-colors"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-slate-950 font-mono shadow-lg shadow-blue-950 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>Record as Applied with this Gmail</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

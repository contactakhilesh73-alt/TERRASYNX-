/**
 * TERRASYNX: Autonomous Cover Letter Studio Modal
 * Personalizes cover letters using real Job Description context and authentic student profile.
 * 
 * Strict Principle: NEVER auto-sends. Outputs an editable draft in complete student control.
 */

import React, { useState, useEffect } from 'react';
import { Opportunity, StudentProfile } from '../types';
import { CoverLetterService, CoverLetterResult } from '../services/coverLetterService';
import { CompanyLogo } from './CompanyLogo';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  Save, 
  FileEdit,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CoverLetterModalProps {
  opportunity: Opportunity | null;
  profile: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const CoverLetterModal: React.FC<CoverLetterModalProps> = ({
  opportunity,
  profile,
  isOpen,
  onClose,
}) => {
  const [draft, setDraft] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationSource, setGenerationSource] = useState<CoverLetterResult['source']>('saved-draft');
  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [customNotes, setCustomNotes] = useState<string>('');
  const [showNotesField, setShowNotesField] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize or fetch draft when modal opens
  useEffect(() => {
    if (!isOpen || !opportunity) return;

    setCopied(false);
    setSavedSuccess(false);
    setErrorMessage(null);

    const saved = CoverLetterService.getSavedDraft(opportunity.id);
    if (saved && saved.trim().length > 0) {
      setDraft(saved);
      setGenerationSource('saved-draft');
      return;
    }

    // If no saved draft, trigger generation immediately
    handleGenerate(false);
  }, [isOpen, opportunity?.id]);

  const handleGenerate = async (forceFresh = true) => {
    if (!opportunity) return;
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const result = await CoverLetterService.generateCoverLetter(
        opportunity,
        profile,
        customNotes,
        forceFresh
      );

      if (result.success && result.coverLetter) {
        setDraft(result.coverLetter);
        setGenerationSource(result.source);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      } else {
        setErrorMessage(result.error || 'Failed to synthesize draft. Using local fallback.');
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Error occurred while contacting AI service.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setDraft(newText);
    if (opportunity) {
      CoverLetterService.saveDraft(opportunity.id, newText);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 1500);
    }
  };

  const handleCopy = async () => {
    if (!draft) return;
    const ok = await CoverLetterService.copyToClipboard(draft);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    if (!opportunity || !draft) return;
    CoverLetterService.downloadDraftAsFile(opportunity, draft);
  };

  const handleSave = () => {
    if (!opportunity || !draft) return;
    CoverLetterService.saveDraft(opportunity.id, draft);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  if (!isOpen || !opportunity) return null;

  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const charCount = draft.length;

  return (
    <div 
      id="cover-letter-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        id="cover-letter-modal-container"
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-cyan-500/40 bg-slate-900 shadow-2xl shadow-cyan-950/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3.5">
            <CompanyLogo
              domain={opportunity.companyDomain}
              name={opportunity.companyName}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-100">{opportunity.title}</h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Opportunity</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="font-semibold text-cyan-300">{opportunity.companyName}</span>
                <span>•</span>
                <span>{opportunity.location || 'Remote / Flexible'}</span>
                <span>•</span>
                <span className="capitalize">{opportunity.type}</span>
              </div>
            </div>
          </div>

          <button
            id="close-cover-letter-modal-button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Draft"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety & Guarantee Notice Banner (Never Auto-Sent) */}
        <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span className="font-medium">
              <strong>Draft Mode Only:</strong> Personalized for this real Job Description. TERRASYNX never auto-sends applications.
            </span>
          </div>
          <div className="flex items-center gap-2">
            {generationSource === 'gemini-3.8-flash' && (
              <span className="flex items-center gap-1 text-[11px] text-cyan-300 font-mono bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Gemini 3.8 Flash</span>
              </span>
            )}
            {generationSource === 'saved-draft' && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                <Save className="w-3 h-3 text-emerald-400" />
                <span>Saved Draft</span>
              </span>
            )}
            {generationSource === 'algorithmic-synthesis' && (
              <span className="flex items-center gap-1 text-[11px] text-slate-300 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                <span>Algorithmic Draft</span>
              </span>
            )}
          </div>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Custom Prompt Notes Accordion (Optional) */}
          <div className="border border-slate-800 rounded-xl bg-slate-950/40 p-3">
            <button
              onClick={() => setShowNotesField(!showNotesField)}
              className="flex items-center justify-between w-full text-xs text-slate-300 hover:text-cyan-300 font-medium cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Custom Instructions for AI (Optional focus on specific skills or projects)</span>
              </div>
              {showNotesField ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showNotesField && (
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                <input
                  id="cover-letter-custom-notes"
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. Focus on my distributed systems project, or mention my hackathon 1st place win..."
                  className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => handleGenerate(true)}
                    disabled={isGenerating}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Apply & Regenerate</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Editor Area */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <label 
                htmlFor="cover-letter-textarea" 
                className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
              >
                <FileEdit className="w-3.5 h-3.5 text-cyan-400" />
                <span>Personalized Draft (Directly Editable)</span>
              </label>

              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{charCount} chars</span>
                {savedSuccess && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Saved</span>
                  </span>
                )}
              </div>
            </div>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-80 rounded-xl border border-slate-800 bg-slate-950/60 p-6 text-center space-y-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
                  <Sparkles className="w-5 h-5 text-cyan-400 absolute" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Analyzing Job Description & Student Profile</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Gemini 3.8 Flash is synthesizing real skills, projects, and requirements into a tailored cover letter draft...
                  </p>
                </div>
              </div>
            ) : (
              <textarea
                id="cover-letter-textarea"
                value={draft}
                onChange={handleDraftChange}
                rows={16}
                placeholder="Cover letter draft will appear here..."
                className="w-full text-xs sm:text-sm font-mono leading-relaxed p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-all resize-y shadow-inner scrollbar-thin"
              />
            )}

            {errorMessage && (
              <p className="mt-2 text-xs text-amber-400 font-mono">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/80 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              id="regenerate-cover-letter-button"
              onClick={() => handleGenerate(true)}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition cursor-pointer disabled:opacity-50"
              title="Regenerate fresh draft using Gemini AI"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing...' : 'Regenerate Draft'}</span>
            </button>

            <button
              id="save-cover-letter-button"
              onClick={handleSave}
              disabled={isGenerating || !draft}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition cursor-pointer"
              title="Save current edited text to local drafts"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save Draft</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="download-cover-letter-button"
              onClick={handleDownload}
              disabled={isGenerating || !draft}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition cursor-pointer"
              title="Download cover letter as plain text file (.txt)"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>Export .txt</span>
            </button>

            <button
              id="copy-cover-letter-button"
              onClick={handleCopy}
              disabled={isGenerating || !draft}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition shadow-md cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-950/40'
              }`}
              title="Copy edited cover letter to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

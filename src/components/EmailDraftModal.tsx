import React, { useState, useEffect, useId } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  Download, 
  Mail, 
  UserCheck, 
  AlertCircle, 
  ShieldCheck, 
  Paperclip, 
  Clock, 
  ArrowRight,
  RotateCcw,
  CheckSquare,
  Square,
  Building2,
  Share2
} from 'lucide-react';
import { Opportunity, StudentProfile } from '../types';
import { 
  EmailDraftService, 
  EmailDraftType, 
  RecipientPersona, 
  EmailDraftData 
} from '../services/emailDraftService';
import { CompanyLogo } from './CompanyLogo';

interface EmailDraftModalProps {
  opportunity: Opportunity | null;
  profile: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  defaultType?: EmailDraftType;
  defaultPersona?: RecipientPersona;
}

export const EmailDraftModal: React.FC<EmailDraftModalProps> = ({
  opportunity,
  profile,
  isOpen,
  onClose,
  defaultType = 'referral-request',
  defaultPersona = 'alumni'
}) => {
  const [activeType, setActiveType] = useState<EmailDraftType>(defaultType);
  const [activePersona, setActivePersona] = useState<RecipientPersona>(defaultPersona);
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [attachmentChecklist, setAttachmentChecklist] = useState<string[]>([]);
  const [checkedAttachments, setCheckedAttachments] = useState<Record<number, boolean>>({});
  const [followUpAdvice, setFollowUpAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [source, setSource] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copiedSubject, setCopiedSubject] = useState<boolean>(false);
  const [copiedBody, setCopiedBody] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [showPromptBox, setShowPromptBox] = useState<boolean>(false);

  const subjectInputId = useId();
  const bodyTextareaId = useId();
  const customPromptId = useId();

  // Load draft when modal opens or type/persona changes
  useEffect(() => {
    if (isOpen && opportunity) {
      loadOrGenerateDraft(activeType, activePersona, false);
    }
  }, [isOpen, opportunity?.id, activeType, activePersona]);

  const loadOrGenerateDraft = async (
    type: EmailDraftType, 
    persona: RecipientPersona, 
    forceFresh: boolean = false
  ) => {
    if (!opportunity) return;
    setIsLoading(true);
    setStatusMessage('');

    try {
      const result = await EmailDraftService.generateEmailDraft(
        opportunity,
        profile,
        type,
        persona,
        customPrompt.trim() || undefined,
        forceFresh
      );

      setSubject(result.draft.subject);
      setBody(result.draft.body);
      setAttachmentChecklist(result.draft.attachmentChecklist);
      setFollowUpAdvice(result.draft.followUpAdvice);
      setSource(result.source);
      setStatusMessage(result.message || '');
    } catch (err: any) {
      setStatusMessage('Draft generated using local deterministic model.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeSwitch = (type: EmailDraftType) => {
    setActiveType(type);
    if (type === 'cold-outreach' && activePersona === 'alumni') {
      setActivePersona('recruiter');
    } else if (type === 'referral-request' && activePersona === 'recruiter') {
      setActivePersona('alumni');
    }
  };

  const handleSaveCurrentDraft = (newSubject: string, newBody: string) => {
    if (!opportunity) return;
    const draft: EmailDraftData = {
      type: activeType,
      recipientPersona: activePersona,
      subject: newSubject,
      body: newBody,
      attachmentChecklist,
      keyHooks: [],
      followUpAdvice,
      lastEditedAt: Date.now(),
      isCustomized: true
    };
    EmailDraftService.saveDraft(opportunity.id, draft);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubject(e.target.value);
    handleSaveCurrentDraft(e.target.value, body);
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    handleSaveCurrentDraft(subject, e.target.value);
  };

  const handleCopySubject = async () => {
    try {
      await navigator.clipboard.writeText(subject);
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } catch (e) {
      // ignore
    }
  };

  const handleCopyBody = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    } catch (e) {
      // ignore
    }
  };

  const handleCopyAll = async () => {
    try {
      const full = `Subject: ${subject}\n\n${body}\n\n[Attachments to include]:\n${attachmentChecklist.map(i => `• ${i}`).join('\n')}`;
      await navigator.clipboard.writeText(full);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (e) {
      // ignore
    }
  };

  const handleExportText = () => {
    if (!opportunity) return;
    const draft: EmailDraftData = {
      type: activeType,
      recipientPersona: activePersona,
      subject,
      body,
      attachmentChecklist,
      keyHooks: [],
      followUpAdvice,
      lastEditedAt: Date.now()
    };
    EmailDraftService.exportAsText(draft, opportunity);
  };

  const toggleAttachmentCheck = (index: number) => {
    setCheckedAttachments(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (!isOpen || !opportunity) return null;

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const estimatedReadSeconds = Math.ceil((wordCount / 200) * 60);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        id="email-draft-modal-dialog"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <CompanyLogo
              logo={opportunity.companyLogo}
              domain={opportunity.companyDomain}
              name={opportunity.companyName}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-400" />
                  <span>Outreach & Referral Email Studio</span>
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold">
                  AI-Assisted Craft
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="font-semibold text-cyan-300">{opportunity.companyName}</span>
                <span>•</span>
                <span className="truncate max-w-[280px]">{opportunity.title}</span>
                <span>•</span>
                <span>{opportunity.location || 'Remote'}</span>
              </div>
            </div>
          </div>

          <button
            id="close-email-draft-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Email Draft Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MANDATORY PROMINENT STUDENT AGENCY SAFETY BANNER (Strict Rule: "Draft only, kabhi bhejta nahi") */}
        <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-emerald-500/15 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-200 uppercase tracking-wide font-mono">
                🔒 Draft Only — Kabhi Bhejta Nahi
              </p>
              <p className="text-[11px] text-slate-300">
                Terrasynx strictly synthesizes drafts for your eyes only. Hum kabhi bhi aapke email se auto-send nahi karte. You retain 100% control to review, edit, and send manually.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Zero Mailbox Access
            </span>
          </div>
        </div>

        {/* Controls Toolbar: Mode Switcher & Recipient Persona Selector */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          {/* Email Type Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              id="switch-tab-referral-request"
              onClick={() => handleTypeSwitch('referral-request')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeType === 'referral-request'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Referral Request</span>
            </button>

            <button
              id="switch-tab-cold-outreach"
              onClick={() => handleTypeSwitch('cold-outreach')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeType === 'cold-outreach'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Cold Outreach Email</span>
            </button>
          </div>

          {/* Recipient Persona Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400">Target Recipient:</span>
            <div className="flex items-center gap-1">
              {[
                { id: 'alumni', label: 'College Alum', persona: 'alumni' as RecipientPersona },
                { id: 'recruiter', label: 'Recruiter', persona: 'recruiter' as RecipientPersona },
                { id: 'engineering_manager', label: 'Eng Manager', persona: 'engineering_manager' as RecipientPersona },
                { id: 'peer_engineer', label: 'Peer SWE', persona: 'peer_engineer' as RecipientPersona },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePersona(p.persona)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    activePersona === p.persona
                      ? 'bg-slate-800 text-cyan-300 border-cyan-500/40 font-medium'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Subject Line Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label 
                htmlFor={subjectInputId}
                className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
              >
                <span>Email Subject Line</span>
                <span className="text-[10px] text-slate-500 font-mono">({subject.length} characters)</span>
              </label>

              <button
                onClick={handleCopySubject}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors font-mono cursor-pointer"
                title="Copy Subject Line"
              >
                {copiedSubject ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSubject ? 'Copied' : 'Copy Subject'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                id={subjectInputId}
                type="text"
                value={subject}
                onChange={handleSubjectChange}
                placeholder="High-converting subject line..."
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 font-mono transition-colors"
              />
            </div>
          </div>

          {/* Email Body Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label 
                  htmlFor={bodyTextareaId}
                  className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
                >
                  <span>Email Body</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({wordCount} words • ~{estimatedReadSeconds}s read time)
                  </span>
                </label>
                {source && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-cyan-400 border border-slate-700">
                    Source: {source}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyBody}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors font-mono cursor-pointer"
                  title="Copy Email Body"
                >
                  {copiedBody ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedBody ? 'Body Copied' : 'Copy Body'}</span>
                </button>
              </div>
            </div>

            <div className="relative">
              {isLoading ? (
                <div className="w-full h-64 bg-slate-950/60 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
                  <p className="text-xs font-mono text-slate-300">
                    Gemini AI analyzing {opportunity.companyName} JD & your verified projects...
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Crafting low-friction, high-converting outreach message
                  </p>
                </div>
              ) : (
                <textarea
                  id={bodyTextareaId}
                  rows={10}
                  value={body}
                  onChange={handleBodyChange}
                  placeholder="Personalized outreach email body..."
                  className="w-full p-4 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 leading-relaxed font-sans transition-colors resize-y selection:bg-indigo-500/30"
                />
              )}
            </div>
          </div>

          {/* Attachment & Link Checklist Section (Req: attachment-checklist) */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider font-mono">
                <Paperclip className="w-4 h-4 text-cyan-400" />
                <span>Mandatory Attachment & Link Checklist (Send Karne Se Pehle)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {Object.values(checkedAttachments).filter(Boolean).length} / {attachmentChecklist.length} ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {attachmentChecklist.map((item, idx) => {
                const isChecked = Boolean(checkedAttachments[idx]);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleAttachmentCheck(idx)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <span className="text-xs leading-snug break-all">{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Follow-up Strategy Advice */}
          {followUpAdvice && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200">
              <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-indigo-300">Tactical Follow-Up Rule:</p>
                <p className="text-slate-300 text-[11px] mt-0.5">{followUpAdvice}</p>
              </div>
            </div>
          )}

          {/* Custom Instruction Box (Accordion) */}
          <div className="border border-slate-800/80 rounded-xl p-3 bg-slate-950/40">
            <button
              onClick={() => setShowPromptBox(!showPromptBox)}
              className="flex items-center justify-between w-full text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Custom AI Focus Instructions (Optional)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">{showPromptBox ? 'Hide' : 'Add custom prompt'}</span>
            </button>

            {showPromptBox && (
              <div className="mt-2.5 space-y-2">
                <textarea
                  id={customPromptId}
                  rows={2}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., Emphasize my Raft consensus algorithm project, or mention I solved 400+ LeetCode problems..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                />
                <button
                  onClick={() => loadOrGenerateDraft(activeType, activePersona, true)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Regenerate with Custom Focus</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadOrGenerateDraft(activeType, activePersona, true)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              title="Regenerate fresh draft using Gemini AI"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Regenerate Draft</span>
            </button>

            <button
              onClick={handleExportText}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
              title="Download draft, subject, and checklist as .txt file"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export .txt</span>
            </button>

            <a
              id="open-in-email-client-link"
              href={EmailDraftService.generateMailtoUrl(subject, body)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/60 transition-colors"
              title="Open draft in your local email client (Draft only, you review before sending)"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Open in Mail App</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-complete-email-package-btn"
              onClick={handleCopyAll}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 hover:opacity-95 transition-all shadow-lg shadow-indigo-950 cursor-pointer"
            >
              {copiedAll ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
              <span>{copiedAll ? 'Entire Package Copied!' : 'Copy Subject + Body + Checklist'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

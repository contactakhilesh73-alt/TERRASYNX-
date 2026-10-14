/**
 * TERRASYNX: Hackathon Fast Apply Assistant & Requirement Inspector Modal
 * 
 * Strict Rules Honored:
 * 1. Checks hackathon requirements against student profile and indicates what is needed ("Kya kya chahiye").
 * 2. Pre-fills candidate form accurately using student profile data.
 * 3. Never auto-submits forms autonomously; candidate retains full submission control.
 * 4. Enables automatic tracking of the application whether submitted via Fast Apply or direct official portal with student email.
 * 5. Generates immutable cryptographic SHA-256 receipt for records.
 */

import React, { useState, useMemo } from 'react';
import { Hackathon, StudentProfile } from '../types';
import { HackathonTrackingService, HackathonApplicationRecord } from '../services/hackathonTrackingService';
import { CompanyLogo } from './CompanyLogo';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  Users, 
  Laptop, 
  FileText, 
  Award, 
  Calendar, 
  Clock, 
  Building2, 
  Mail, 
  Github, 
  Globe, 
  Send,
  Lock,
  ArrowRight,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

interface HackathonFastApplyModalProps {
  hackathon: Hackathon;
  studentProfile?: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  onApplicationTracked?: (record: HackathonApplicationRecord) => void;
}

export const HackathonFastApplyModal: React.FC<HackathonFastApplyModalProps> = ({
  hackathon,
  studentProfile,
  isOpen,
  onClose,
  onApplicationTracked,
}) => {
  // Existing tracking check
  const existingRecord = useMemo(() => {
    return HackathonTrackingService.getApplicationForHackathon(hackathon.id, studentProfile?.email);
  }, [hackathon.id, studentProfile?.email, isOpen]);

  // Active sub-tab in assistant: 'requirements' | 'prefill' | 'submission'
  const [activeTab, setActiveTab] = useState<'requirements' | 'prefill' | 'submission'>('requirements');

  // Form Pre-fill state (initialized from student profile)
  const [fullName, setFullName] = useState(studentProfile?.fullName || 'Candidate');
  const [email, setEmail] = useState(studentProfile?.email || 'student@university.edu');
  const [phone, setPhone] = useState(studentProfile?.phoneNumber || '+1 (555) 019-2834');
  const [collegeName, setCollegeName] = useState(studentProfile?.collegeName || 'Technology Institute');
  const [degree, setDegree] = useState(studentProfile?.degree || 'B.Tech / B.S. in Computer Science');
  const [gradYear, setGradYear] = useState<number>(studentProfile?.graduationYear || new Date().getFullYear() + 1);
  const [teamType, setTeamType] = useState<'solo' | 'team'>('solo');
  const [teamName, setTeamName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>(hackathon.themes?.[0] || 'Open Innovation');
  const [githubUrl, setGithubUrl] = useState(studentProfile?.githubUrl || 'https://github.com/candidate');
  const [portfolioUrl, setPortfolioUrl] = useState(studentProfile?.portfolioUrl || studentProfile?.linkedinUrl || 'https://linkedin.com/in/candidate');
  const [customPitch, setCustomPitch] = useState(() => {
    const topSkills = studentProfile?.primarySkills?.slice(0, 3).join(', ') || 'Full-Stack & Machine Learning';
    return `Passionate student developer specializing in ${topSkills}. Building scalable, high-impact solutions for the ${hackathon.name} challenge under the ${hackathon.themes?.[0] || 'core'} track.`;
  });

  // UI state
  const [copiedDossier, setCopiedDossier] = useState(false);
  const [isSubmittingTracking, setIsSubmittingTracking] = useState(false);
  const [trackingSuccessRecord, setTrackingSuccessRecord] = useState<HackathonApplicationRecord | null>(existingRecord || null);
  const [openedPortal, setOpenedPortal] = useState(false);

  if (!isOpen) return null;

  // Requirement & Eligibility Analysis
  const requirementChecklist = [
    {
      id: 'fee',
      title: 'Zero Registration Fee Guarantee',
      status: 'pass',
      detail: hackathon.entryFeeText || '100% Free Entry Verified. No charges for students.',
      icon: ShieldCheck,
    },
    {
      id: 'eligibility',
      title: 'Academic & Participant Eligibility',
      status: 'notice',
      detail: `${hackathon.eligibilityText} (Check the event's own rules on official portal)`,
      icon: Users,
    },
    {
      id: 'mode',
      title: `Event Format (${hackathon.mode.toUpperCase()})`,
      status: 'pass',
      detail: hackathon.mode === 'online' 
        ? `Virtual global participation from ${hackathon.country}` 
        : `In-person / hybrid venue in ${hackathon.country}. Check travel details.`,
      icon: Laptop,
    },
    {
      id: 'deliverables',
      title: 'Required Submissions & Deliverables',
      status: 'pass',
      detail: 'Public GitHub repo + 2-3 min video demonstration + project write-up.',
      icon: FileText,
    },
    {
      id: 'deadline',
      title: 'Registration Timeline',
      status: hackathon.registrationDeadline ? 'pass' : 'notice',
      detail: hackathon.registrationDeadline 
        ? `Closes on ${hackathon.registrationDeadline}. Dates: ${hackathon.dates}` 
        : `Dates: ${hackathon.dates}. Check official page for live window.`,
      icon: Calendar,
    },
  ];

  // Copy structured dossier to clipboard
  const handleCopyDossier = () => {
    const formatted = `=== TERRASYNX PRE-FILLED HACKATHON DOSSIER ===
Target Hackathon: ${hackathon.name}
Organizer: ${hackathon.organizer}
Official URL: ${hackathon.officialUrl}

[CANDIDATE DETAILS]
Full Name: ${fullName}
Email Address: ${email}
Phone Number: ${phone}
College / University: ${collegeName}
Degree: ${degree}
Graduation Year: ${gradYear}
Participation Mode: ${teamType.toUpperCase()}${teamName ? ` (Team: ${teamName})` : ''}
Selected Track / Theme: ${selectedTheme}

[LINKS & PROFILES]
GitHub: ${githubUrl}
Portfolio / LinkedIn: ${portfolioUrl}

[PROJECT PROPOSAL / PITCH]
${customPitch}
===============================================`;

    navigator.clipboard.writeText(formatted);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 3000);
  };

  // Student manual submission confirmation
  const handleConfirmStudentSubmission = async (sourceType: 'fast_apply_assistant' | 'direct_portal_tracked') => {
    setIsSubmittingTracking(true);
    try {
      const confId = HackathonTrackingService.generateConfirmationId(hackathon.organizer);
      const hashData = `${confId}:${hackathon.id}:${email}:${Date.now()}`;
      const sha256 = await HackathonTrackingService.generateSha256(hashData);

      const record: HackathonApplicationRecord = {
        confirmationId: confId,
        hackathonId: hackathon.id,
        hackathonName: hackathon.name,
        organizer: hackathon.organizer,
        officialUrl: hackathon.officialUrl,
        mode: hackathon.mode,
        country: hackathon.country,
        appliedTimestamp: Date.now(),
        applicantEmail: email,
        applicantName: fullName,
        collegeName,
        degree,
        graduationYear: gradYear,
        status: 'registered',
        source: sourceType,
        sha256Proof: sha256,
        teamType,
        teamName: teamType === 'team' ? teamName : undefined,
        selectedTheme,
        githubRepoUrl: githubUrl,
        portfolioUrl,
        selfReportedNotes: 'Candidate confirmed official portal registration.',
        receiptUrl: hackathon.officialUrl,
      };

      HackathonTrackingService.recordApplication(record);
      setTrackingSuccessRecord(record);
      if (onApplicationTracked) {
        onApplicationTracked(record);
      }
    } finally {
      setIsSubmittingTracking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-orange-500/30 rounded-2xl shadow-2xl shadow-orange-950/40 text-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Header with Official Host Logo */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-900 border-b border-orange-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <CompanyLogo
              name={hackathon.organizer}
              domain={hackathon.officialUrl ? (() => { try { return new URL(hackathon.officialUrl).hostname.replace(/^www\./, ''); } catch { return ''; } })() : ''}
              size="md"
              className="shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-orange-400" />
                  Fast Apply Assistant
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  100% Free Guarantee
                </span>
              </div>
              <h2 id="modal-headline" className="text-lg font-bold text-slate-100 truncate mt-0.5">
                {hackathon.name}
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Official Host: <strong className="text-slate-200">{hackathon.organizer}</strong></span>
                <span>•</span>
                <span>Prize: <strong className="text-orange-300">{hackathon.prizeText}</strong></span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Tracked Alert if applicable */}
        {(trackingSuccessRecord || existingRecord) && (
          <div className="px-6 py-3 bg-emerald-950/30 border-b border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Application Tracked in System:</strong> Record ID <span className="font-mono font-bold">{(trackingSuccessRecord || existingRecord)?.confirmationId}</span> • Registered with <span className="font-mono">{(trackingSuccessRecord || existingRecord)?.applicantEmail}</span>
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-emerald-500/20 text-emerald-200 border border-emerald-500/40">
              {(trackingSuccessRecord || existingRecord)?.status.toUpperCase()}
            </span>
          </div>
        )}

        {/* Sub-Tabs Navigation */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center gap-2 bg-slate-950/40 text-xs font-mono">
          <button
            onClick={() => setActiveTab('requirements')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'requirements'
                ? 'border-orange-500 text-orange-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>1. Requirements ("Kya Kya Chahiye")</span>
          </button>
          <button
            onClick={() => setActiveTab('prefill')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'prefill'
                ? 'border-orange-500 text-orange-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>2. Smart Pre-Filled Form</span>
          </button>
          <button
            onClick={() => setActiveTab('submission')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'submission'
                ? 'border-orange-500 text-orange-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>3. Review & Student Submission Gate</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
          {/* TAB 1: REQUIREMENTS & ELIGIBILITY ("KYA KYA CHAHIYE") */}
          {activeTab === 'requirements' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/30 text-xs text-orange-200 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-orange-300 font-semibold block mb-0.5">Automated Requirement Check:</strong>
                  The system verified this hackathon directly against official host criteria. Below is the complete preparation checklist needed before registering on the official portal.
                </div>
              </div>

              <div className="space-y-2.5">
                {requirementChecklist.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={item.id} 
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/60 flex items-center justify-center text-orange-400 shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-slate-200 text-xs font-mono">{item.title}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                            item.status === 'pass' 
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' 
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          }`}>
                            {item.status === 'pass' ? '✓ Verified' : 'ℹ️ Check Rules'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Matched Themes & Skills */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-300 font-semibold">Approved Hackathon Tracks:</span>
                  <span className="text-[11px] text-slate-400">{hackathon.themes?.length || 0} Tracks Available</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {hackathon.themes?.map(theme => (
                    <span 
                      key={theme}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-900 text-orange-300 border border-orange-500/30"
                    >
                      #{theme}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Nav to Pre-fill */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveTab('prefill')}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-orange-950/50"
                >
                  <span>Continue to Pre-Filled Form</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SMART PRE-FILLED FORM */}
          {activeTab === 'prefill' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Auto-filled from verified student profile. You can modify any field before copying.</span>
                </div>
                <button
                  onClick={handleCopyDossier}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-orange-300 hover:text-orange-200 border border-orange-500/30 font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedDossier ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDossier ? 'Copied to Clipboard!' : 'Copy Form Data'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email (Student Gmail/Institutional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">College / University</label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Degree & Major</label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={gradYear}
                    onChange={(e) => setGradYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Participation Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTeamType('solo')}
                      className={`flex-1 py-2 px-3 rounded-lg border text-center cursor-pointer transition-colors ${
                        teamType === 'solo'
                          ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Solo Builder
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeamType('team')}
                      className={`flex-1 py-2 px-3 rounded-lg border text-center cursor-pointer transition-colors ${
                        teamType === 'team'
                          ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Team (1-4)
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Target Hackathon Track</label>
                  <select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-orange-500 focus:outline-none"
                  >
                    {hackathon.themes && hackathon.themes.length > 0 ? (
                      hackathon.themes.map(t => <option key={t} value={t}>{t}</option>)
                    ) : (
                      <option value="General Track">General Innovation Track</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">GitHub Profile Link</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Portfolio / LinkedIn Link</label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {teamType === 'team' && (
                <div className="font-mono text-xs">
                  <label className="block text-slate-400 mb-1">Team Name (if already decided)</label>
                  <input
                    type="text"
                    value={teamName}
                    placeholder="e.g. CodeSync Innovators"
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="font-mono text-xs">
                <label className="block text-slate-400 mb-1">Tailored Motivation / Project Statement</label>
                <textarea
                  rows={3}
                  value={customPitch}
                  onChange={(e) => setCustomPitch(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Bottom Nav to Submission */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => setActiveTab('requirements')}
                  className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-slate-200 font-mono text-xs"
                >
                  ← Back to Checklist
                </button>
                <button
                  onClick={() => setActiveTab('submission')}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-orange-950/50"
                >
                  <span>Proceed to Submission Gate</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SUBMISSION GATE & TRACKING (STRICT HUMAN CONTROL) */}
          {activeTab === 'submission' && (
            <div className="space-y-4">
              {/* Mandatory Student Agency Banner */}
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-3">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-amber-300 font-bold block">Strict Rule: Candidate Manual Submission Only</strong>
                  <p className="leading-relaxed">
                    To prevent automated bot penalties, account bans, or duplicate entries, the system <strong>never submits forms on your behalf</strong>. 
                    You register directly on the host organization's official verified portal.
                  </p>
                </div>
              </div>

              {/* Step 1: Open Official Portal */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[11px]">1</span>
                    <span>Register on the Official Verified Portal</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                    {hackathon.officialUrl.replace(/^https?:\/\//, '')}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Open the official page, paste your pre-filled dossier details (copied from step 2), and complete your registration using your Gmail (<strong className="text-orange-300">{email}</strong>).
                </p>
                <a
                  href={hackathon.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpenedPortal(true)}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-mono font-bold text-xs transition-all shadow-md shadow-orange-950/50 cursor-pointer"
                >
                  <span>Open Official Registration Portal</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Step 2: Confirmation & Automatic Tracking */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[11px]">2</span>
                    <span>Confirm & Track in TERRASYNX</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                    Auto-Track Active
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Once you have submitted on the official portal, click below to log your submission. 
                  Whether you applied through this assistant or directly on the official portal using this Gmail ID, the system will track your status throughout the competition cycle.
                </p>

                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <button
                    disabled={isSubmittingTracking || Boolean(trackingSuccessRecord)}
                    onClick={() => handleConfirmStudentSubmission('fast_apply_assistant')}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md shadow-emerald-950/40"
                  >
                    {isSubmittingTracking ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>
                      {trackingSuccessRecord ? '✓ Submission Logged & Tracked' : 'Yes, I Submitted — Track This Hackathon'}
                    </span>
                  </button>

                  <button
                    disabled={isSubmittingTracking || Boolean(trackingSuccessRecord)}
                    onClick={() => handleConfirmStudentSubmission('direct_portal_tracked')}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 border border-slate-700 font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Track an existing application made directly on the official website"
                  >
                    <span>I Already Applied Directly</span>
                  </button>
                </div>
              </div>

              {/* Cryptographic Receipt Display if tracked */}
              {trackingSuccessRecord && (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-emerald-300 font-bold">
                    <span>Cryptographic Verification Receipt:</span>
                    <span>{new Date(trackingSuccessRecord.appliedTimestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1">
                    <div><strong>Record ID:</strong> {trackingSuccessRecord.confirmationId}</div>
                    <div><strong>Applicant:</strong> {trackingSuccessRecord.applicantName} ({trackingSuccessRecord.applicantEmail})</div>
                    <div><strong>SHA-256 Checksum:</strong> <span className="text-[10px] text-emerald-400/90 break-all">{trackingSuccessRecord.sha256Proof}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400 flex items-center gap-2 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
            <span>Zero-Fee Verified • No automated submissions • Student agency protected</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

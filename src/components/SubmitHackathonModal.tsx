/**
 * TERRASYNX: Submit a Hackathon Modal (Prompt 68)
 * 
 * Submits hackathons to the verification queue.
 * The live engine verifies the URL against allowlist rules and reads dates from official page.
 * Only verified items are shown in the main hackathons directory.
 */

import React, { useState } from 'react';
import {
  Trophy,
  X,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Building2,
  Calendar,
  ExternalLink,
  RefreshCw,
  Clock,
  ListFilter,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  HackathonSubmission,
  HackathonMode,
} from '../types';
import { HackathonIntakeService } from '../services/hackathonIntakeService';

interface SubmitHackathonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHackathonVerified?: () => void;
}

export const SubmitHackathonModal: React.FC<SubmitHackathonModalProps> = ({
  isOpen,
  onClose,
  onHackathonVerified,
}) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'queue'>('submit');

  // Form fields
  const [name, setName] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [mode, setMode] = useState<HackathonMode>('online');
  const [country, setCountry] = useState('Online/Global');

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSubmission, setLastSubmission] = useState<HackathonSubmission | null>(null);
  const [queue, setQueue] = useState<HackathonSubmission[]>(() => HackathonIntakeService.getQueue());

  if (!isOpen) return null;

  const refreshQueue = () => {
    setQueue(HackathonIntakeService.getQueue());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim()) {
      setSubmitError('Hackathon name is required.');
      return;
    }
    if (!officialUrl.trim()) {
      setSubmitError('Official URL is required.');
      return;
    }
    if (!organizer.trim()) {
      setSubmitError('Organizer name is required.');
      return;
    }

    // Validate URL protocol
    if (!officialUrl.trim().startsWith('http://') && !officialUrl.trim().startsWith('https://')) {
      setSubmitError('Official URL must begin with http:// or https://');
      return;
    }

    setIsSubmitting(true);
    try {
      const submission = await HackathonIntakeService.submitHackathon({
        name: name.trim(),
        officialUrl: officialUrl.trim(),
        organizer: organizer.trim(),
        mode,
        country: mode === 'online' ? 'Online/Global' : country.trim(),
      });

      setLastSubmission(submission);
      refreshQueue();

      if (submission.status === 'verified' && onHackathonVerified) {
        onHackathonVerified();
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit hackathon for live verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setName('');
    setOfficialUrl('');
    setOrganizer('');
    setMode('online');
    setCountry('Online/Global');
    setLastSubmission(null);
    setSubmitError(null);
  };

  const verifiedCount = queue.filter(q => q.status === 'verified').length;
  const pendingCount = queue.filter(q => q.status === 'pending').length;
  const rejectedCount = queue.filter(q => q.status === 'rejected').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-orange-500/40 bg-slate-900 shadow-2xl shadow-orange-950/40 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-orange-950/20 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Submit a Hackathon</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 uppercase">
                  Prompt 68 Intake
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Submissions go to the queue. Live engine verifies URLs against allowlist rules and reads dates.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 bg-slate-950/40 text-xs font-mono">
          <button
            onClick={() => setActiveTab('submit')}
            className={`pb-2.5 px-3 border-b-2 font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'submit'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Submit New</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('queue');
              refreshQueue();
            }}
            className={`pb-2.5 px-3 border-b-2 font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Intake Queue ({queue.length})</span>
            {verifiedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                {verifiedCount} verified
              </span>
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'submit' ? (
            <>
              {/* Policy Banner */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono">
                <div className="flex items-center gap-2 text-orange-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Strict Integrity Policy</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Only authentic hackathons with allowlisted organizer/platform URLs and verified dates directly on the official page are published. Unverified or date-less submissions are rejected.
                </p>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {lastSubmission ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Latest Submission Result</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        lastSubmission.status === 'verified'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : 'bg-rose-950 text-rose-300 border-rose-700'
                      }`}
                    >
                      {lastSubmission.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-white text-sm font-sans">{lastSubmission.name}</div>
                    <div className="text-slate-400 text-xs font-sans">
                      Organizer: <strong className="text-slate-200">{lastSubmission.organizer}</strong>
                    </div>
                    <div className="text-slate-500 text-[11px] truncate">
                      {lastSubmission.officialUrl}
                    </div>
                  </div>

                  {lastSubmission.verificationResult && (
                    <div className={`p-3 rounded-lg border text-[11px] space-y-1.5 ${
                      lastSubmission.status === 'verified'
                        ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                        : 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold">
                        {lastSubmission.status === 'verified' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span>{lastSubmission.verificationResult.message}</span>
                      </div>

                      {lastSubmission.verificationResult.datesDetected?.datesText && (
                        <div className="text-slate-300 text-[10px] pt-1 border-t border-slate-800">
                          Confirmed Dates: <strong className="text-orange-300">{lastSubmission.verificationResult.datesDetected.datesText}</strong>
                        </div>
                      )}

                      {lastSubmission.status === 'verified' && (
                        <div className="text-emerald-400 text-[10px] font-bold">
                          ✓ This hackathon is verified and now visible in the main Hackathons directory!
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold font-mono text-xs transition-colors cursor-pointer"
                    >
                      Submit Another Hackathon
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('queue')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors cursor-pointer"
                    >
                      View Intake Queue
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                      Hackathon Name <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. ETHGlobal Cannes 2026, HackMIT 2026"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                      Official Page URL <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="url"
                      value={officialUrl}
                      onChange={e => setOfficialUrl(e.target.value)}
                      placeholder="https://ethglobal.com/events/cannes2026 or https://hackmit.org"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500 font-mono"
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Must be from an allowlisted hackathon platform, university domain, or registered organizer site.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                      Organizer <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={organizer}
                      onChange={e => setOrganizer(e.target.value)}
                      placeholder="e.g. ETHGlobal, MIT TechX, Smart India Hackathon"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        Format Mode
                      </label>
                      <select
                        value={mode}
                        onChange={e => setMode(e.target.value as HackathonMode)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-orange-500 font-mono cursor-pointer"
                      >
                        <option value="online">Online / Virtual</option>
                        <option value="in-person">In-Person</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        Country / Venue
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        placeholder="Online/Global or e.g. USA, India"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex items-center gap-2 px-5 py-2 rounded-xl font-mono font-bold text-xs shadow-lg transition-all ${
                        isSubmitting
                          ? 'bg-orange-600/50 text-slate-950 cursor-wait'
                          : 'bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-orange-950/40 cursor-pointer'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying with Live Engine...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Submit for Live Verification</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            /* Queue Review Tab */
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                <span>Intake Pipeline Queue ({queue.length} total)</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">{verifiedCount} Verified</span>
                  <span>•</span>
                  <span className="text-amber-400">{pendingCount} Pending</span>
                  <span>•</span>
                  <span className="text-rose-400">{rejectedCount} Rejected</span>
                </div>
              </div>

              {queue.length === 0 ? (
                <div className="p-8 text-center text-slate-500 rounded-xl bg-slate-950 border border-slate-800">
                  No submissions in the queue yet. Submit a hackathon using the form!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto">
                  {queue.map(item => {
                    const isVerified = item.status === 'verified';
                    const isRejected = item.status === 'rejected';

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isVerified
                            ? 'bg-emerald-950/15 border-emerald-800/60'
                            : isRejected
                            ? 'bg-rose-950/15 border-rose-800/60'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-white text-sm font-sans flex items-center gap-2">
                              <span>{item.name}</span>
                              {isVerified && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700">
                                  <Check className="w-2.5 h-2.5" />
                                  Live in Directory
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[11px] font-sans mt-0.5">
                              Organizer: <strong className="text-slate-200">{item.organizer}</strong> • {item.mode}
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border shrink-0 ${
                              isVerified
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                : isRejected
                                ? 'bg-rose-950 text-rose-300 border-rose-700'
                                : 'bg-amber-950 text-amber-300 border-amber-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between gap-2 border-t border-slate-800/60 pt-2">
                          <a
                            href={item.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:underline flex items-center gap-1 truncate max-w-[70%]"
                          >
                            <span>{item.officialUrl}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                          <span className="text-[10px] text-slate-500">
                            {new Date(item.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        {item.verificationResult && (
                          <div className={`mt-2 p-2 rounded text-[10px] ${
                            isVerified
                              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-900/50'
                              : 'bg-rose-950/40 text-rose-300 border border-rose-900/50'
                          }`}>
                            <div><strong>Live Engine:</strong> {item.verificationResult.message}</div>
                            {item.verificationResult.datesDetected?.datesText && (
                              <div className="text-orange-300 mt-0.5 font-bold">
                                Extracted Dates: {item.verificationResult.datesDetected.datesText}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

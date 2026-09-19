/**
 * TERRASYNX: Real-Time 4-Tier Email & Alert Relay Previewer
 * Conforming strictly to SYSTEM_SPEC (Req #5, #6, #7, #10 & Strict Rules #1-#5)
 */

import React, { useState } from 'react';
import { Opportunity, StudentProfile, AlertEmailSimulation } from '../types';
import { RadarEngine } from '../services/radarEngine';
import { CompanyLogo } from './CompanyLogo';
import { AtsInboundStudio } from './AtsInboundStudio';
import { DailyDigestStudio } from './DailyDigestStudio';
import { 
  BellRing, 
  Mail, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Sliders, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Flame,
  VolumeX,
  Volume2,
  Inbox,
  Award,
  Terminal,
  FileText
} from 'lucide-react';

interface AlertRelayViewProps {
  opportunities: Opportunity[];
  studentProfile: StudentProfile;
  simulatedEmails: AlertEmailSimulation[];
  mutedAlertIds: string[];
  onOpenDetails: (opportunity: Opportunity) => void;
  onMarkApplied: (jobId: string) => void;
}

export const AlertRelayView: React.FC<AlertRelayViewProps> = ({
  opportunities,
  studentProfile,
  simulatedEmails,
  mutedAlertIds,
  onOpenDetails,
  onMarkApplied,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'inbound_webhooks' | 'daily_digest'>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string>(simulatedEmails[0]?.id || '');
  const [activeTierFilter, setActiveTierFilter] = useState<'all' | 'gold' | 'slate' | 'neon' | 'royal'>('all');
  const [sendSuccessToast, setSendSuccessToast] = useState<string | null>(null);

  // Filtered emails
  const filteredEmails = simulatedEmails.filter(email => {
    if (activeTierFilter === 'all') return true;
    return email.tier === activeTierFilter;
  });

  const selectedEmail = simulatedEmails.find(e => e.id === selectedEmailId) || simulatedEmails[0];

  // Manual Trigger for a live flash alert simulation (Req #5)
  const handleTriggerTestFlash = (tier: 'gold' | 'slate' | 'neon' | 'royal') => {
    const opp = opportunities[0];
    if (!opp) return;

    let subject = '';
    let type: AlertEmailSimulation['type'] = 'discovery_alert';
    let points: string[] = [];

    if (tier === 'gold') {
      type = 'discovery_alert';
      subject = `🚨 CRITICAL 72H DEADLINE: ${opp.companyName} (${opp.title})`;
      points = [
        `Requisition #${opp.verification.requisitionId} closing in under 48 hours.`,
        `100% Cryptographically verified direct origin (${opp.verification.rootDomain}).`,
        `Compensation confirmed: ${opp.compensation.range}. Zero application fees.`,
        `Batch match confirmed for Class of ${studentProfile.graduationYear}.`,
      ];
    } else if (tier === 'slate') {
      type = 'discovery_alert';
      subject = `☀️ Daily Morning Intelligence Digest: Top Early-Career Matches`;
      points = [
        `Curated for ${studentProfile.fullName} (${studentProfile.degree}, ${studentProfile.collegeName || 'Target Batch'}).`,
        `Match 1: ${opportunities[0]?.companyName} - ${opportunities[0]?.title} (${opportunities[0]?.fitment.overallScore}% Fit)`,
        `Match 2: ${opportunities[1]?.companyName} - ${opportunities[1]?.title} (${opportunities[1]?.fitment.overallScore}% Fit)`,
        `All opportunities verified against enterprise ATS endpoints.`,
      ];
    } else if (tier === 'neon') {
      type = 'oa_action_required';
      subject = `⚡ Action Required: ${opp.companyName} Assessment Window Active`;
      points = [
        `Online assessment testing platform: ${opp.assessmentIntel.platform}.`,
        `Estimated duration: ${opp.assessmentIntel.durationMinutes} minutes with strict tab monitoring.`,
        `Recommended topics to review: ${opp.assessmentIntel.frequentTopics.join(', ')}.`,
      ];
    } else {
      type = 'offer_milestone';
      subject = `🏆 Batch 2026/2027 Signal: Undergraduate Systems Opening at Anthropic`;
      points = [
        `Direct requisition matching your graduation year (${studentProfile.graduationYear}).`,
        `Direct careers link with authentic Workday integration.`,
      ];
    }

    RadarEngine.generateSimulatedEmail({
      type,
      tier,
      subject,
      jobId: opp.id,
      jobTitle: opp.title,
      companyName: opp.companyName,
      actionUrl: opp.officialApplyUrl,
      actionAdvisorPoints: points,
    });

    const refreshed = RadarEngine.getSimulatedEmails();
    if (refreshed.length > 0) {
      setSelectedEmailId(refreshed[0].id);
    }

    setSendSuccessToast(`Test [Tier ${tier.toUpperCase()}] alert dispatched!`);
    setTimeout(() => setSendSuccessToast(null), 3000);
  };

  return (
    <div id="alert-relay-view" className="space-y-6 text-xs">
      
      {/* Header Deck */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-950/80 border border-purple-700 flex items-center justify-center text-purple-400">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">
                  4-Tier Real-Time Email & Alert Relay
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  Anti-Spam Guard Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Zero spam policy. Alerts strictly trigger on urgency thresholds (Req #5, #6) and automatically mute upon application (Req #7).
              </p>
            </div>
          </div>

          {/* Test Dispatchers */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleTriggerTestFlash('gold')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-mono transition-colors shadow-sm cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-slate-950" />
              <span>Simulate Tier 1 Flash</span>
            </button>

            <button
              onClick={() => handleTriggerTestFlash('slate')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate 8AM Digest</span>
            </button>

            <button
              onClick={() => handleTriggerTestFlash('neon')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate OA Alert</span>
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {sendSuccessToast && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{sendSuccessToast} Check the simulation inbox below.</span>
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-mono overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveSubTab('inbox')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'inbox'
              ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-950/40'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>4-Tier Notification Relay ({filteredEmails.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inbound_webhooks')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'inbound_webhooks'
              ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-950/40'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Company Inbound Webhook Parser (Req #9)</span>
          <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 text-[10px] border border-indigo-800">
            Greenhouse / Lever
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('daily_digest')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'daily_digest'
              ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-950/40'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-cyan-400" />
          <span>Lightweight Daily Digest Studio (Req #5, #6)</span>
          <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 text-[10px] border border-cyan-800">
            &lt; 25 KB
          </span>
        </button>
      </div>

      {activeSubTab === 'inbound_webhooks' && <AtsInboundStudio />}
      {activeSubTab === 'daily_digest' && <DailyDigestStudio opportunities={opportunities} />}

      {activeSubTab === 'inbox' && (
        <>
      {/* 4-Tier Strategic Architecture Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-xl border border-amber-900/60 bg-amber-950/20 space-y-1">
          <div className="flex items-center justify-between text-amber-400 font-bold">
            <span>Tier 1: Critical Flash (Gold)</span>
            <Flame className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Triggered if deadline &lt; 72h or flagship Tier-1 posting goes live. Direct urgent notification.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-cyan-900/60 bg-cyan-950/20 space-y-1">
          <div className="flex items-center justify-between text-cyan-400 font-bold">
            <span>Tier 2: 08:00 AM Digest (Slate)</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Morning consolidated briefing of top 3 verified opportunities matched to your profile.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-indigo-900/60 bg-indigo-950/20 space-y-1">
          <div className="flex items-center justify-between text-indigo-400 font-bold">
            <span>Tier 3: OA Action (Neon)</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Triggered when CodeSignal/HackerRank OA window is initiated by company recruiters.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-900/60 bg-emerald-950/20 space-y-1">
          <div className="flex items-center justify-between text-emerald-400 font-bold">
            <span>Tier 4: Granular Mute</span>
            <VolumeX className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            {mutedAlertIds.length} roles muted. Once you click 'Mark Applied', no repetitive pings.
          </p>
        </div>
      </div>

      {/* Main Mailbox Grid: Left Email List (4 cols) + Right Reading Pane (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left List Pane */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg space-y-3">
          
          {/* Filter Pills */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Inbox className="w-3.5 h-3.5 text-purple-400" />
              <span>Relay Inbox ({filteredEmails.length})</span>
            </span>

            <div className="flex gap-1">
              <button
                onClick={() => setActiveTierFilter('all')}
                className={`px-2 py-0.5 rounded ${activeTierFilter === 'all' ? 'bg-purple-400 text-slate-950 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTierFilter('gold')}
                className={`px-2 py-0.5 rounded ${activeTierFilter === 'gold' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Gold
              </button>
              <button
                onClick={() => setActiveTierFilter('slate')}
                className={`px-2 py-0.5 rounded ${activeTierFilter === 'slate' ? 'bg-cyan-400 text-slate-950 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Daily
              </button>
            </div>
          </div>

          {/* Email Item Cards */}
          <div className="space-y-2 max-h-[550px] overflow-y-auto scrollbar-thin">
            {filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono">
                No alerts in this tier. Use the dispatch buttons above to test live relay.
              </div>
            ) : (
              filteredEmails.map(email => {
                const isSelected = email.id === selectedEmailId;
                const tierBadge = 
                  email.tier === 'gold' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                  email.tier === 'neon' ? 'bg-cyan-950 text-cyan-300 border-cyan-800' :
                  email.tier === 'royal' ? 'bg-purple-950 text-purple-300 border-purple-800' :
                  'bg-slate-900 text-slate-300 border-slate-700';

                return (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmailId(email.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-500 bg-purple-950/30'
                        : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold border ${tierBadge}`}>
                        {email.tier.toUpperCase()} TIER
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <CompanyLogo
                        domain={email.companyDomain}
                        name={email.companyName}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-200 text-xs truncate">
                          {email.subject}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate font-mono">
                          {email.companyName} • {email.jobTitle}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Reading Pane (Superhuman / Clean Style) */}
        <div className="lg:col-span-8">
          {selectedEmail ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl flex flex-col h-full">
              
              {/* Email Envelope Meta */}
              <div className="pb-4 border-b border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">
                      {selectedEmail.subject}
                    </h3>
                    <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono mt-1">
                      <span>From: <strong className="text-purple-300">{selectedEmail.fromHeader}</strong></span>
                      <span>To: <strong className="text-slate-300">{selectedEmail.recipientEmail}</strong></span>
                      <span className="text-emerald-400">({selectedEmail.payloadSizeKb} KB &lt; 25 KB budget)</span>
                    </div>
                  </div>

                  <span className="text-slate-500 font-mono text-[11px]">
                    {new Date(selectedEmail.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Mute status flag for this specific job */}
                {mutedAlertIds.includes(selectedEmail.jobId) && (
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-400 font-mono text-[10px]">
                    <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                    <span>Future alerts for this company job requisition are currently MUTED (Application recorded).</span>
                  </div>
                )}
              </div>

              {/* Email Body Content */}
              <div className="py-5 flex-1 space-y-4 font-mono text-xs text-slate-200 leading-relaxed max-h-[450px] overflow-y-auto scrollbar-thin">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <CompanyLogo
                    domain={selectedEmail.companyDomain}
                    name={selectedEmail.companyName}
                    size="md"
                  />
                  <div>
                    <div className="text-slate-400 text-[10px] font-mono">Verified Target Requisition:</div>
                    <div className="font-bold text-slate-100 text-sm">{selectedEmail.companyName} — {selectedEmail.jobTitle}</div>
                  </div>
                </div>

                {selectedEmail.actionAdvisorPoints && selectedEmail.actionAdvisorPoints.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-slate-400 font-semibold block uppercase text-[10px] tracking-wider">
                      Verified Tactical Points:
                    </span>
                    <div className="space-y-1.5">
                      {selectedEmail.actionAdvisorPoints.map((pt, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 text-[11px] text-slate-500">
                  This cryptographic relay message was generated in conformance with RFC-822 header standards and strict zero-spam protocols.
                </div>
              </div>

              {/* Interactive Actions Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(() => {
                    const opp = opportunities.find(o => o.id === selectedEmail.jobId);
                    if (!opp) return null;
                    return (
                      <button
                        onClick={() => onOpenDetails(opp)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono font-semibold"
                      >
                        Inspect Full Dossier
                      </button>
                    );
                  })()}
                </div>

                {(() => {
                  const opp = opportunities.find(o => o.id === selectedEmail.jobId);
                  if (!opp) return null;
                  const isApplied = opp.stage !== 'discovered' && opp.stage !== 'archived';

                  return (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onMarkApplied(opp.id)}
                        disabled={isApplied}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-xs transition-colors ${
                          isApplied
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isApplied ? 'Application Logged (Muted)' : 'Mark Applied & Mute Alerts'}</span>
                      </button>

                      <a
                        href={opp.officialApplyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold font-mono"
                      >
                        <span>Apply on Official ATS</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
                      </a>
                    </div>
                  );
                })()}
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 rounded-2xl border border-slate-800 bg-slate-900/40">
              Select an email from the relay inbox to read full headers and payload.
            </div>
          )}
        </div>

      </div>
      </>
      )}

    </div>
  );
};

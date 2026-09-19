/**
 * TERRASYNX: Company Response Inbound Engine & Webhook Simulator (Phase 6 Point 1 / Req #9)
 * Autonomous parsing of ATS responses (Greenhouse/Lever/Workday) to detect and flag
 * online assessments (OA), interview scheduling, or selection into the candidate Kanban pipeline.
 */

import React, { useState, useEffect } from 'react';
import { AtsInboundEngine } from '../services/atsInboundEngine';
import { AtsInboundResponse } from '../types';
import { 
  Inbox, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Clock, 
  Terminal, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  Code2,
  Calendar
} from 'lucide-react';

interface AtsInboundStudioProps {
  onStageSynced?: (company: string, nextStage: string) => void;
}

const PRESET_WEBHOOKS = [
  {
    label: 'Greenhouse: Stripe OA (HackerRank)',
    json: JSON.stringify({
      event: 'candidate_stage_change',
      source: 'greenhouse_webhook_v1',
      company: 'Stripe',
      domain: 'stripe.com',
      stage: 'online_assessment',
      platform: 'HackerRank (Proctored)',
      duration_minutes: 90,
      test_url: 'https://hackerrank.com/tests/stripe-infra-2026-eval',
      expires_in_hours: 48,
      notes: '2 algorithmic problems + 1 concurrency debugging problem.'
    }, null, 2),
  },
  {
    label: 'Lever: OpenAI System Design Screen',
    json: JSON.stringify({
      event: 'interview_scheduled',
      source: 'lever_webhook_v2',
      company: 'OpenAI',
      domain: 'openai.com',
      stage: 'technical_interview',
      round: 'Round 1: Distributed Transformer Inference',
      interviewer: 'Dr. Alex Vance (Staff Systems Engineer)',
      meeting_link: 'https://meet.google.com/oai-sys-9921',
      date: 'Thursday, 2:00 PM PT',
      notes: 'Focus on KV-cache memory budgeting & tensor parallelism.'
    }, null, 2),
  },
  {
    label: 'Workday: Scale AI Offer Letter',
    json: JSON.stringify({
      event: 'candidate_offer_generated',
      source: 'workday_integration_v1',
      company: 'Scale AI',
      domain: 'scale.com',
      stage: 'offer_extended',
      role: 'Forward Deployed Engineer (FDE)',
      compensation_usd: '$165,000 + $40,000 Equity',
      start_date: 'June 2026',
      notes: 'Official offer letter attached. 14 days acceptance deadline.'
    }, null, 2),
  },
];

export const AtsInboundStudio: React.FC<AtsInboundStudioProps> = ({ onStageSynced }) => {
  const [responses, setResponses] = useState<AtsInboundResponse[]>(AtsInboundEngine.getInboundResponses());
  const [selectedResponseId, setSelectedResponseId] = useState<string>(responses[0]?.id || '');
  const [rawWebhookInput, setRawWebhookInput] = useState<string>(PRESET_WEBHOOKS[0].json);
  const [ingestionToast, setIngestionToast] = useState<string | null>(null);

  useEffect(() => {
    AtsInboundEngine.init();
    const unsubscribe = AtsInboundEngine.subscribe(() => {
      const latest = AtsInboundEngine.getInboundResponses();
      setResponses(latest);
      if (!selectedResponseId && latest.length > 0) {
        setSelectedResponseId(latest[0].id);
      }
    });
    return unsubscribe;
  }, [selectedResponseId]);

  const selectedResponse = responses.find(r => r.id === selectedResponseId) || responses[0];

  const handleIngest = () => {
    if (!rawWebhookInput.trim()) return;
    const created = AtsInboundEngine.ingestWebhookPayload(rawWebhookInput);
    setSelectedResponseId(created.id);
    setIngestionToast(`ATS Webhook ingested for ${created.companyName}!`);
    setTimeout(() => setIngestionToast(null), 3500);
  };

  const handleSyncKanban = (resp: AtsInboundResponse) => {
    AtsInboundEngine.syncResponseToKanban(resp.id);
    setIngestionToast(`Synced ${resp.companyName} to Kanban pipeline!`);
    if (onStageSynced) {
      onStageSynced(resp.companyName, resp.webhookEventType);
    }
    setTimeout(() => setIngestionToast(null), 3500);
  };

  return (
    <div className="space-y-6 text-xs font-mono">
      {/* Banner Deck */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-slate-950 p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-700 flex items-center justify-center text-indigo-400 shrink-0">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                Company Response Inbound Engine (Req #9)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Greenhouse / Lever / Workday
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Autonomous candidate status webhook parsing. Automatically detects Online Assessment links, interview invites, and offers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-slate-400">Total Inbounds:</span>
          <span className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 font-bold border border-indigo-800">
            {responses.length} Recorded
          </span>
        </div>
      </div>

      {ingestionToast && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{ingestionToast}</span>
        </div>
      )}

      {/* 2-Column Workbench: Inbound List & Parser Details (Left) + Webhook Injector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Inbound Feed (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-slate-300 font-bold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Inbound Webhook Feed</span>
            </span>
            <span className="text-slate-500 text-[11px]">Click to inspect parsed payload</span>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
            {responses.map((resp) => {
              const isSelected = resp.id === selectedResponse?.id;
              const isSynced = resp.status === 'auto_synced_kanban';

              return (
                <div
                  key={resp.id}
                  onClick={() => setSelectedResponseId(resp.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{resp.companyName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                          {resp.sourceAts}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          resp.webhookEventType === 'assessment_link'
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                            : resp.webhookEventType === 'interview_invite'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {resp.webhookEventType.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-sans mt-1 line-clamp-1">
                        {resp.subject}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-500">
                        {new Date(resp.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Footer */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      Status:{' '}
                      <strong className={isSynced ? 'text-emerald-400' : 'text-amber-400'}>
                        {isSynced ? 'Synced to Kanban' : 'Pending Kanban Sync'}
                      </strong>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSyncKanban(resp);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        isSynced
                          ? 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                      }`}
                    >
                      <span>{isSynced ? 'Re-Sync Kanban' : 'Sync to Kanban'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Response Detail Card */}
          {selectedResponse && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Parsed Inbound Intelligence Dossier</span>
                </span>
                <span className="text-slate-500 text-[11px]">Origin: {selectedResponse.companyDomain}</span>
              </div>

              {selectedResponse.parsedData.testUrl && (
                <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-slate-300 truncate">Test Link: {selectedResponse.parsedData.testUrl}</span>
                  </div>
                  <a
                    href={selectedResponse.parsedData.testUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {selectedResponse.parsedData.meetingLink && (
                <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-800/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-slate-300 truncate">Interview: {selectedResponse.parsedData.interviewDate || 'Live Meeting'}</span>
                  </div>
                  <a
                    href={selectedResponse.parsedData.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Join</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400">Action Advisor Recommendations:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] font-sans">
                  {selectedResponse.parsedData.actionAdvisorPointers.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right: Webhook Payload Injector & Testing Sandbox (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-slate-300 font-bold flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>ATS Inbound Webhook Simulator</span>
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] text-slate-400">Quick Test Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_WEBHOOKS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => setRawWebhookInput(preset.json)}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400">Raw Webhook JSON or Email Text:</label>
            <textarea
              value={rawWebhookInput}
              onChange={(e) => setRawWebhookInput(e.target.value)}
              rows={12}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-slate-200 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-indigo-500 custom-scrollbar resize-none"
            />
          </div>

          <button
            onClick={handleIngest}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-indigo-500/20 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Simulate Inbound Webhook Dispatch</span>
          </button>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-500 space-y-1">
            <span className="font-bold text-slate-400 block">Strict Rule #2 & Req #9 Specs:</span>
            <p>
              Inbound webhooks are cross-matched against candidate email & company root domains. When verified, they trigger real-time Kanban state shifts and alert relays with zero page refresh.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

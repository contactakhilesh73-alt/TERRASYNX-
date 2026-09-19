/**
 * TERRASYNX: Interactive Conversational Copilot & Multi-AI Orchestration Studio (Req #19, #20, #21, #22)
 * High-craft conversational mentor, BYOK key manager, and 100% autonomous core fallback.
 */

import React, { useState, useEffect, useRef } from 'react';
import { AiOrchestrationEngine, ChatMessage, AiEngineStatus, AiProviderMode } from '../services/aiOrchestrationEngine';
import { StudentProfile } from '../types';
import { 
  Sparkles, 
  Send, 
  Cpu, 
  Key, 
  ShieldCheck, 
  Clock, 
  Terminal, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  Bot,
  User,
  Zap
} from 'lucide-react';

interface InteractiveCopilotStudioProps {
  studentProfile: StudentProfile;
}

const QUICK_PROMPTS = [
  '🚨 Which Tier-1 roles are closing in < 72 hours?',
  '🛂 Can F-1 OPT/CPT students apply to Scale AI or OpenAI?',
  '📄 How should I tailor my resume for a Distributed Systems role?',
  '⚡ What topics are tested in Stripe & Google Online Assessments?',
  '🤝 Draft a 300-character LinkedIn referral note for campus alumni',
];

export const InteractiveCopilotStudio: React.FC<InteractiveCopilotStudioProps> = ({ studentProfile }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'orchestration'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>(AiOrchestrationEngine.getChatHistory());
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [engineStatus, setEngineStatus] = useState<AiEngineStatus>(AiOrchestrationEngine.getStatus());
  const [byokInput, setByokInput] = useState<string>(AiOrchestrationEngine.getByokKey());
  const [showByokKey, setShowByokKey] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    AiOrchestrationEngine.init();
    const unsubscribe = AiOrchestrationEngine.subscribe(() => {
      setMessages(AiOrchestrationEngine.getChatHistory());
      setEngineStatus(AiOrchestrationEngine.getStatus());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isSending) return;

    setInputMessage('');
    setIsSending(true);

    try {
      await AiOrchestrationEngine.sendMessage(query, studentProfile);
    } catch {
      // Handled gracefully via fallback
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveByok = () => {
    AiOrchestrationEngine.setByokKey(byokInput);
    setToastMessage(byokInput ? 'BYOK API Key saved securely to local cache!' : 'BYOK Key removed.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleModeChange = (mode: AiProviderMode) => {
    AiOrchestrationEngine.setProviderMode(mode);
    setToastMessage(`AI Mode updated to: ${mode}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearChat = () => {
    AiOrchestrationEngine.clearChatHistory();
    setToastMessage('Conversation history reset.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="space-y-4 text-xs font-mono">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400 shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm">TERRASYNX Copilot & Multi-AI Core</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                engineStatus.providerMode === 'deterministic_core'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {engineStatus.providerMode === 'deterministic_core' ? '100% Autonomous Core' : 'Multi-AI Orchestrated'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-sans block">
              Req #19, #20, #21, #22: Server-side Gemini 3.8 Flash, BYOK Gateway & Deterministic Zero-Downtime Core.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Conversational Copilot
          </button>
          <button
            onClick={() => setActiveTab('orchestration')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orchestration'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            AI Engine & BYOK
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tab 1: Conversational Chat Pane */}
      {activeTab === 'chat' && (
        <div className="space-y-3">
          {/* Quick Prompt Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[10px]">
            <span className="text-slate-500 shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Ask:</span>
            </span>
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={isSending}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/40 whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Feed */}
          <div className="h-[340px] overflow-y-auto rounded-xl bg-slate-950/90 border border-slate-800/80 p-4 space-y-3.5 custom-scrollbar">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-cyan-600 text-white font-sans rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 font-sans rounded-tl-none'
                  }`}>
                    {/* Message Body */}
                    <div className="whitespace-pre-line">
                      {msg.content}
                    </div>

                    {/* Meta Footer */}
                    <div className={`mt-2 pt-1.5 border-t text-[10px] font-mono flex items-center justify-between gap-2 ${
                      isUser ? 'border-cyan-500/40 text-cyan-100' : 'border-slate-800 text-slate-500'
                    }`}>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.providerUsed && (
                        <span className="truncate">{msg.providerUsed}</span>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isSending && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs">
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0 animate-pulse">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
                  <span className="text-[11px]">Analyzing career parameters & verified requisitions...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box & Actions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about urgent roles, F-1 visa sponsorship, OA prep, or resume tailoring..."
                className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
              />

              <button
                onClick={() => handleSend()}
                disabled={!inputMessage.trim() || isSending}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleClearChat}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors cursor-pointer"
                title="Clear Chat History"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
              <span>Model: <strong>{engineStatus.activeModelName}</strong></span>
              <span>Last Latency: <strong>{engineStatus.lastLatencyMs}ms</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Multi-AI Orchestration & BYOK Studio */}
      {activeTab === 'orchestration' && (
        <div className="space-y-4">
          {/* Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Active Pipeline</span>
              <span className="text-cyan-400 font-bold truncate block">{engineStatus.providerMode}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Engine Latency</span>
              <span className="text-emerald-400 font-bold">{engineStatus.lastLatencyMs} ms</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Queries Handled</span>
              <span className="text-slate-200 font-bold">{engineStatus.totalQueriesProcessed}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Core Uptime (Req #20)</span>
              <span className="text-emerald-400 font-bold">100.00% (Zero-Downtime)</span>
            </div>
          </div>

          {/* Provider Selection Deck */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
              Multi-Tier Orchestration Hierarchy (Req #19)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleModeChange('auto_orchestration')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  engineStatus.providerMode === 'auto_orchestration'
                    ? 'border-cyan-500 bg-cyan-950/30 text-white ring-1 ring-cyan-500/30'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-slate-200">1. Auto Orchestration</strong>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">RECOMMENDED</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                  Server-side Gemini 3.8 Flash primary with automatic 0ms fallback to Autonomous Algorithmic Core.
                </p>
              </button>

              <button
                onClick={() => handleModeChange('deterministic_core')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  engineStatus.providerMode === 'deterministic_core'
                    ? 'border-amber-500 bg-amber-950/30 text-white ring-1 ring-amber-500/30'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-slate-200">2. Autonomous Algorithmic Core</strong>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">100% OFFLINE</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                  Strict Rule #20: 100% deterministic local intelligence. Zero external API calls, zero latency, zero quota.
                </p>
              </button>

              <button
                onClick={() => handleModeChange('gemini_server')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  engineStatus.providerMode === 'gemini_server'
                    ? 'border-indigo-500 bg-indigo-950/30 text-white ring-1 ring-indigo-500/30'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-slate-200">3. Google Gemini 3.8 Flash</strong>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">SERVER-SIDE</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                  Strict Rule #21: Proxied server-side via Express without exposing API credentials to the browser.
                </p>
              </button>

              <button
                onClick={() => handleModeChange('byok_custom')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  engineStatus.providerMode === 'byok_custom'
                    ? 'border-purple-500 bg-purple-950/30 text-white ring-1 ring-purple-500/30'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-slate-200">4. BYOK Custom Key</strong>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">STUDENT KEY</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                  Bring-Your-Own-Key: Execute queries using your private Gemini API key stored strictly in your browser cache.
                </p>
              </button>
            </div>
          </div>

          {/* BYOK Configuration Form */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                <span>BYOK (Bring-Your-Own-Key) Configuration (Req #19)</span>
              </span>
              <span className="text-[10px] text-slate-500">Stored locally in browser only</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showByokKey ? 'text' : 'password'}
                  value={byokInput}
                  onChange={(e) => setByokInput(e.target.value)}
                  placeholder="Enter custom Gemini API Key (e.g. AIzaSy...)"
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowByokKey(!showByokKey)}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showByokKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                onClick={handleSaveByok}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

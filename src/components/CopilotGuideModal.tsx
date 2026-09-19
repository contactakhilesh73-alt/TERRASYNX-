/**
 * TERRASYNX: Friendly In-App Guide & Interactive Copilot Studio Modal (Req #19, #20, #21, #22)
 * Full interactive conversational mentor, BYOK key manager, and 5 strict rules walkthrough.
 */

import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { InteractiveCopilotStudio } from './InteractiveCopilotStudio';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  KanbanSquare, 
  BellRing, 
  Cpu, 
  BookOpen,
  MessageSquare
} from 'lucide-react';

interface CopilotGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentProfile?: StudentProfile;
}

export const CopilotGuideModal: React.FC<CopilotGuideModalProps> = ({ 
  isOpen, 
  onClose,
  studentProfile = {
    id: 'student_alex',
    fullName: 'Alex Chen',
    email: 'alex.chen@university.edu',
    phone: '+1 (555) 019-2834',
    degree: 'B.S. Computer Science',
    university: 'University of California, Berkeley',
    graduationYear: 2026,
    gpa: 3.88,
    workAuthorization: 'F-1 OPT/CPT Eligible',
    citizenshipStatus: 'International Student',
    location: 'Berkeley, CA',
    githubUrl: 'https://github.com/alexchen-dev',
    linkedinUrl: 'https://linkedin.com/in/alexchen-eng',
    portfolioUrl: 'https://alexchen.dev',
    skills: ['Go', 'TypeScript', 'Rust', 'Python', 'Kubernetes', 'Distributed Systems'],
    targetRoles: ['Systems Engineer Intern', 'Software Engineer Intern', 'Backend Intern'],
    experienceYears: 1,
    preferredLocations: ['San Francisco, CA', 'New York, NY', 'Remote'],
  }
}) => {
  const [modalTab, setModalTab] = useState<'copilot' | 'guide'>('copilot');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-cyan-500/50 bg-slate-900 p-5 sm:p-6 shadow-2xl shadow-cyan-950/80 custom-scrollbar flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Tab Navigation */}
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3 pr-10">
          <button
            onClick={() => setModalTab('copilot')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              modalTab === 'copilot'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Interactive Copilot & Multi-AI</span>
          </button>

          <button
            onClick={() => setModalTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              modalTab === 'guide'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Strict Rules & System Onboarding</span>
          </button>
        </div>

        {/* Tab 1: Interactive Copilot & Multi-AI Studio */}
        {modalTab === 'copilot' && (
          <InteractiveCopilotStudio studentProfile={studentProfile} />
        )}

        {/* Tab 2: System Onboarding & 5 Strict Rules */}
        {modalTab === 'guide' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">TERRASYNX 5 Non-Negotiable Core Rules</h2>
                <p className="text-xs text-slate-400 font-mono">Architectural Mandates Conformance (SYSTEM_SPEC)</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <h3 className="font-bold text-cyan-300 flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Rule #1: 100% Genuine, Scam-Free Guarantee</span>
              </h3>
              <p className="text-slate-400">
                Zero fake jobs, zero ghost openings, and zero unpaid exploitative scams. Every requisition is cryptographically verified against official company DNS records and primary ATS endpoints (Greenhouse, Lever, Ashby, Workday).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <h3 className="font-bold text-cyan-300 flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-red-400" />
                <span>Rule #2: Sub-Second Urgency Radar & Countdown Clocks</span>
              </h3>
              <p className="text-slate-400">
                High-demand roles (like OpenAI, Stripe, and Google internships) close within 48 to 72 hours. Live countdown clocks highlight closing windows and automatically prune expired roles.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <h3 className="font-bold text-cyan-300 flex items-center gap-2 mb-1">
                <KanbanSquare className="w-4 h-4 text-indigo-400" />
                <span>Rule #3: Autonomous Execution Pipeline & 7-Day Follow-Up Alarm</span>
              </h3>
              <p className="text-slate-400">
                Drag-and-drop Kanban state machine from Discovered to Applied, OA, Interview, and Offer. Automatically sounds audio-visual follow-up alarms if 7 days elapse without recruiter contact.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <h3 className="font-bold text-cyan-300 flex items-center gap-2 mb-1">
                <BellRing className="w-4 h-4 text-purple-400" />
                <span>Rule #4: 4-Tier Anti-Spam Email Relay & Smart Muting</span>
              </h3>
              <p className="text-slate-400">
                Critical Flash (&lt; 72h), 08:00 AM Daily Consolidated Briefing (&lt; 25 KB), and OA action relays. Instant muting of reminders upon logging an application to preserve student focus.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <h3 className="font-bold text-cyan-300 flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>Rule #5: 100% Autonomous Algorithmic Core with Zero Downtime</span>
              </h3>
              <p className="text-slate-400">
                The entire radar, countdown engine, fitment scorer, and knowledge base operate locally with zero external API dependencies. If an external AI service is offline, TERRASYNX never freezes.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-colors font-mono cursor-pointer"
              >
                Launch Tactical Workstation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

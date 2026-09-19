/**
 * TERRASYNX: Alumni & Insider Referral Bridge Studio (Req #15 & Phase 3 Point 3)
 * Full-screen strategic outreach cockpit for alumni intelligence, recruiter lookups,
 * and high-reply referral templates anchored directly to verified opportunities.
 */

import React, { useState } from 'react';
import { Opportunity, StudentProfile, InsiderContact, OutreachChannel } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { InsiderOutreachService } from '../services/insiderOutreachService';
import { 
  Users, 
  Linkedin, 
  Mail, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  GraduationCap, 
  ShieldCheck, 
  Building2,
  ChevronRight,
  MessageSquare,
  Compass
} from 'lucide-react';

interface InsiderBridgeViewProps {
  opportunities: Opportunity[];
  studentProfile: StudentProfile;
  onOpenDetails: (opp: Opportunity) => void;
  onNavigateToPipeline: () => void;
}

export const InsiderBridgeView: React.FC<InsiderBridgeViewProps> = ({
  opportunities,
  studentProfile,
  onOpenDetails,
  onNavigateToPipeline,
}) => {
  const [selectedOppId, setSelectedOppId] = useState<string>(
    opportunities[0]?.id || ''
  );
  const [selectedChannel, setSelectedChannel] = useState<OutreachChannel>('alumni_email');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedOpp = opportunities.find(o => o.id === selectedOppId) || opportunities[0];
  const contacts = selectedOpp 
    ? InsiderOutreachService.getContactsForOpportunity(selectedOpp, studentProfile)
    : [];
  const [selectedContactId, setSelectedContactId] = useState<string>(
    contacts[0]?.id || ''
  );

  const activeContact = contacts.find(c => c.id === selectedContactId) || contacts[0];

  const template = (selectedOpp && activeContact)
    ? InsiderOutreachService.generateTemplate(selectedChannel, activeContact, selectedOpp, studentProfile)
    : null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  const totalAlumniAcrossNetwork = opportunities.reduce((acc, curr) => acc + curr.alumniPresenceCount, 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Strategic Overview Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-sky-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-mono text-xs uppercase tracking-widest mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Alumni &amp; Insider Referral Bridge • Req #15</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Campus Network &amp; Recruiter Outreach Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Directly connect with verified campus alumni from <span className="text-cyan-300 font-semibold">{studentProfile.collegeName}</span> and 
            early career recruiters. Generate tailored, high-converting outreach notes tailored to each open role.
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="block text-[10px] font-mono text-slate-400">Total Campus Alumni</span>
            <span className="text-base font-bold text-cyan-300 font-mono">{totalAlumniAcrossNetwork} Active</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="block text-[10px] font-mono text-slate-400">Alumni Alma Mater</span>
            <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px] block">{studentProfile.collegeName.split(' ')[0]}</span>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target Opportunity Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Verified Requisitions ({opportunities.length})
            </span>
            <span className="text-[10px] font-mono text-cyan-400">Select target role</span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
            {opportunities.map(opp => {
              const isSelected = opp.id === selectedOppId;
              return (
                <div
                  key={opp.id}
                  onClick={() => {
                    setSelectedOppId(opp.id);
                    const newContacts = InsiderOutreachService.getContactsForOpportunity(opp, studentProfile);
                    if (newContacts.length > 0) {
                      setSelectedContactId(newContacts[0].id);
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-900/90 border-cyan-500/60 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/30' 
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <CompanyLogo domain={opp.companyDomain} name={opp.companyName} size="sm" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{opp.companyName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{opp.location}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/40">
                      {opp.alumniPresenceCount} Alumni
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-medium mt-2 line-clamp-1">{opp.title}</p>
                  
                  <div className="mt-2.5 pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>10-D Fit: <strong className="text-cyan-300">{opp.fitment.overallScore}% ({opp.fitment.overallGrade})</strong></span>
                    <span className="text-slate-500 capitalize">{opp.stage}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Requisition Outreach Workbench (8 Cols) */}
        {selectedOpp && (
          <div className="lg:col-span-8 space-y-5">
            {/* Target Requisition Context Bar */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CompanyLogo domain={selectedOpp.companyDomain} name={selectedOpp.companyName} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{selectedOpp.companyName}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                      {selectedOpp.department}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">{selectedOpp.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenDetails(selectedOpp)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors"
                >
                  View Dossier
                </button>
                <a
                  href={selectedOpp.officialApplyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-950/60 border border-cyan-800/60 transition-colors"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Identified Campus Alumni & Recruiters */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Identified Contacts &amp; Alumni ({contacts.length})</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Pick recipient to personalize template</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {contacts.map(contact => {
                  const isActive = contact.id === activeContact?.id;
                  return (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContactId(contact.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-gradient-to-br from-slate-900 to-sky-950/40 border-sky-500/70 ring-1 ring-sky-500/30 shadow-md' 
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900/40 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-100">{contact.name}</h4>
                            {contact.isAlumni && (
                              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                                Campus Alumni
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{contact.role}</p>
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] font-mono text-slate-400 space-y-1">
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Alma Mater: <strong className="text-slate-300">{contact.alumniCollege} ('{contact.gradYear})</strong></span>
                          <span className="text-sky-400">{contact.connectionDegree}</span>
                        </div>
                        <p className="text-[10px] text-slate-400/90 italic pt-1 border-t border-slate-850">
                          Angle: {contact.bestOutreachAngle}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500">{contact.directEmailHint}</span>
                        <a
                          href={contact.linkedinSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-[10px] font-mono font-semibold text-sky-400 hover:text-sky-300"
                        >
                          <Linkedin className="w-3 h-3" />
                          <span>Search on LinkedIn</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Template Generator Console */}
            {template && activeContact && (
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Outreach Formulation Engine
                    </span>
                  </div>

                  {/* Channel Switcher */}
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800">
                    <button
                      onClick={() => setSelectedChannel('linkedin_dm')}
                      className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                        selectedChannel === 'linkedin_dm'
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      LinkedIn DM (&le;300 chars)
                    </button>
                    <button
                      onClick={() => setSelectedChannel('alumni_email')}
                      className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                        selectedChannel === 'alumni_email'
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Alumni Referral Email
                    </button>
                    <button
                      onClick={() => setSelectedChannel('recruiter_inmail')}
                      className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                        selectedChannel === 'recruiter_inmail'
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Recruiter InMail
                    </button>
                  </div>
                </div>

                {/* Subject line if applicable */}
                {template.subjectLine && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Subject Line</span>
                      <button
                        onClick={() => handleCopy(template.subjectLine || '', 'subject')}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
                      >
                        {copiedKey === 'subject' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'subject' ? 'Copied' : 'Copy Subject'}</span>
                      </button>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200 font-semibold select-all">
                      {template.subjectLine}
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Generated Message ({template.charCount} chars • {template.wordCount} words)</span>
                    <button
                      onClick={() => handleCopy(template.bodyText, 'body')}
                      className="px-2.5 py-1 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
                    >
                      {copiedKey === 'body' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'body' ? 'Copied to Clipboard!' : 'Copy Entire Message'}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap select-all font-normal">
                    {template.bodyText}
                  </div>
                </div>

                {/* Tactical Best-Practice Advisory */}
                <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs space-y-1.5 font-mono">
                  <span className="text-[11px] font-bold text-sky-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Terrasynx Strategic Conversion Pointers</span>
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-400 pl-4 list-disc">
                    {template.advisorPointers.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

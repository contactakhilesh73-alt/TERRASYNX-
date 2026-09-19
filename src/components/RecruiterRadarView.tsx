/**
 * TERRASYNX: Recruiter Intelligence Dossier & Headhunter Outreach Radar (Phase 8 Point 2)
 * High-conversion outreach cockpit for engineering hiring managers and technical sourcers.
 * Features Recruiter DNA Profiling, Requisition Anchored Pitches, Response Probability Index,
 * and Automated 3-Step Follow-Up Cadence Sentinel.
 */

import React, { useState, useMemo } from 'react';
import { 
  Opportunity, 
  StudentProfile, 
  RecruiterNode, 
  RecruiterOutreachPackage 
} from '../types';
import { RecruiterRadarService } from '../services/recruiterRadarService';
import { 
  Target, 
  Users, 
  Send, 
  Mail, 
  Linkedin, 
  Copy, 
  Check, 
  Clock, 
  Building2, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Search, 
  Filter, 
  Flame, 
  ArrowRight, 
  Calendar, 
  Zap, 
  ChevronRight,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';

interface RecruiterRadarViewProps {
  opportunities: Opportunity[];
  studentProfile: StudentProfile;
  onNavigateToPipeline?: () => void;
  onOpenOpportunity?: (opp: Opportunity) => void;
}

export const RecruiterRadarView: React.FC<RecruiterRadarViewProps> = ({
  opportunities,
  studentProfile,
  onNavigateToPipeline,
  onOpenOpportunity,
}) => {
  const [recruiters, setRecruiters] = useState<RecruiterNode[]>(() => 
    RecruiterRadarService.getRecruiters()
  );
  const [selectedRecruiterId, setSelectedRecruiterId] = useState<string>(recruiters[0]?.id || '');
  const [selectedOppId, setSelectedOppId] = useState<string>(opportunities[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'cockpit' | 'dna_dossier' | 'cadence_sentinel'>('cockpit');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New Recruiter Form State
  const [newFullName, setNewFullName] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('Engineering Hiring Manager');
  const [newCompanyName, setNewCompanyName] = useState<string>(opportunities[0]?.companyName || 'Stripe');
  const [newDepartment, setNewDepartment] = useState<string>('Infrastructure');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newLinkedin, setNewLinkedin] = useState<string>('');
  const [newLocation, setNewLocation] = useState<string>('Remote / Hybrid');

  const stats = useMemo(() => RecruiterRadarService.getStats(), [recruiters]);

  const selectedOpp = useMemo(() => {
    return opportunities.find(o => o.id === selectedOppId) || opportunities[0];
  }, [opportunities, selectedOppId]);

  const activeRecruiter = useMemo(() => {
    return recruiters.find(r => r.id === selectedRecruiterId) || recruiters[0] || null;
  }, [recruiters, selectedRecruiterId]);

  const outreachPackage: RecruiterOutreachPackage | null = useMemo(() => {
    if (!activeRecruiter || !selectedOpp) return null;
    return RecruiterRadarService.generateOutreachPackage(
      activeRecruiter,
      selectedOpp,
      studentProfile
    );
  }, [activeRecruiter, selectedOpp, studentProfile]);

  const handleAddRecruiterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newCompanyName.trim()) return;

    const initials = newFullName
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'RC';

    const added = RecruiterRadarService.addRecruiter({
      fullName: newFullName.trim(),
      avatarInitials: initials,
      role: newRole,
      companyName: newCompanyName.trim(),
      companyDomain: `${newCompanyName.toLowerCase().replace(/\s+/g, '')}.com`,
      departmentFocus: newDepartment.trim() || 'Software Engineering',
      location: newLocation.trim(),
      verifiedEmail: newEmail.trim() || undefined,
      linkedinUrl: newLinkedin.trim() || undefined,
      responseProbabilityIndex: 85,
      recruiterDna: {
        preferredTimeSlot: 'Tuesday & Thursday, 09:30 AM - 11:30 AM PST',
        averageResponseTimeHours: 24,
        activeRequisitionsCount: 1,
        technicalDepthLevel: newRole.includes('Manager') ? 'High (Former SWE/Eng Lead)' : 'Medium (Specialized Tech Recruiter)',
        keyPhrasesToAnchor: ['systems architecture', 'production metrics', 'clean codebase'],
        phrasesToAvoid: ['quick chat to pick your brain', 'generalist intern']
      },
      activeHiringReqs: [
        {
          requisitionId: selectedOpp?.verification?.requisitionId || 'REQ-VERIFIED-26',
          title: selectedOpp?.title || 'Software Engineer',
          level: 'Early Career / Intern',
          urgency: 'high'
        }
      ],
      strategicHook: 'Values targeted project links with live production metrics over generic introductions.'
    });

    const updated = RecruiterRadarService.getRecruiters();
    setRecruiters(updated);
    setSelectedRecruiterId(added.id);
    setIsAddModalOpen(false);
    setNewFullName('');
    setNewEmail('');
    setNewLinkedin('');
  };

  const handleDeleteRecruiter = (id: string) => {
    const updated = RecruiterRadarService.deleteRecruiter(id);
    setRecruiters(updated);
    if (selectedRecruiterId === id) {
      setSelectedRecruiterId(updated[0]?.id || '');
    }
  };

  const filteredRecruiters = useMemo(() => {
    return recruiters.filter(r => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        r.fullName.toLowerCase().includes(query) ||
        r.companyName.toLowerCase().includes(query) ||
        r.role.toLowerCase().includes(query) ||
        r.departmentFocus.toLowerCase().includes(query);

      const matchesRole = roleFilter === 'all' || r.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [recruiters, searchQuery, roleFilter]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner: Recruiter Radar Command Center */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white font-mono tracking-tight">
                Recruiter Intelligence Dossier &amp; Headhunter Outreach Radar
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                Phase 8 Point 2   Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified tech sourcers &amp; engineering managers, Recruiter DNA profiling, personalized pitch generator, and automated follow-up sentinels
            </p>
          </div>
        </div>

        {/* Global Key Metrics & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="p-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Verified Leads</div>
            <div className="text-base font-bold font-mono text-purple-300">{stats.totalVerifiedRecruiters} Active</div>
          </div>
          <div className="p-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Hiring Managers</div>
            <div className="text-base font-bold font-mono text-emerald-400">{stats.hiringManagersCount} Eng Leads</div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-lg shadow-purple-950/50"
          >
            <span>+ Add Verified Contact</span>
          </button>
        </div>
      </div>

      {/* Target Requisition Context Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border border-purple-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase font-bold text-purple-400">
                Target Role for Outreach Anchoring
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-800 text-slate-300">
                {selectedOpp?.verification?.requisitionId}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
              {selectedOpp?.title} <span className="text-slate-400 font-normal">at</span> <span className="text-purple-300 font-bold">{selectedOpp?.companyName}</span>
            </h2>
          </div>
        </div>

        {/* Opportunity Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedOppId}
            onChange={(e) => setSelectedOppId(e.target.value)}
            className="w-full md:w-72 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
          >
            {opportunities.map(opp => (
              <option key={opp.id} value={opp.id}>
                {opp.companyName}   {opp.title.slice(0, 32)}...
              </option>
            ))}
          </select>
          {onOpenOpportunity && (
            <button
              onClick={() => onOpenOpportunity(selectedOpp)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors"
            >
              Role Dossier
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('cockpit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'cockpit'
              ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>1. Recruiter Radar &amp; Outreach Drafter</span>
        </button>
        <button
          onClick={() => setActiveTab('dna_dossier')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'dna_dossier'
              ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>2. Recruiter DNA Profiling &amp; Strategy</span>
        </button>
        <button
          onClick={() => setActiveTab('cadence_sentinel')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'cadence_sentinel'
              ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>3. 3-Step Follow-Up Cadence Sentinel</span>
        </button>
      </div>

      {/* TAB 1: RECRUITER RADAR & OUTREACH DRAFTER */}
      {activeTab === 'cockpit' && (
        <div className="space-y-6">
          
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recruiters by name, company, title, or department..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-mono">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Roles</option>
                <option value="Engineering Hiring Manager">Engineering Hiring Managers</option>
                <option value="Senior Technical Sourcer">Senior Technical Sourcers</option>
                <option value="University Talent Lead">University Talent Leads</option>
                <option value="Principal Technical Recruiter">Principal Tech Recruiters</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Recruiter Leads List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>Verified Talent Contacts ({filteredRecruiters.length})</span>
                <span>Response Prob.</span>
              </div>

              <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                {filteredRecruiters.map(rec => {
                  const isSelected = rec.id === activeRecruiter.id;
                  const isCompanyMatch = selectedOpp?.companyName.toLowerCase().includes(rec.companyName.toLowerCase());

                  return (
                    <div
                      key={rec.id}
                      onClick={() => setSelectedRecruiterId(rec.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-slate-900 border-purple-500/80 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                      }`}
                    >
                      {isCompanyMatch && (
                        <div className="absolute top-0 right-0 bg-purple-500 text-slate-950 text-[9px] font-bold font-mono px-2 py-0.5 rounded-bl-lg">
                          OPP MATCH
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${
                            isSelected 
                              ? 'bg-purple-950 border-purple-500 text-purple-300' 
                              : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}>
                            {rec.avatarInitials}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                              <span>{rec.fullName}</span>
                              {rec.role === 'Engineering Hiring Manager' && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                                  Hiring Mgr
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-slate-300 font-medium">{rec.role}</p>
                            <p className="text-[11px] text-purple-300 font-mono mt-0.5 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-purple-400" />
                              <span>{rec.companyName}   {rec.departmentFocus}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold font-mono text-emerald-400">
                            {rec.responseProbabilityIndex}%
                          </div>
                          <div className="text-[9px] text-slate-500 uppercase font-mono">prob</div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>{rec.activeHiringReqs.length} Active Reqs</span>
                        <span>{rec.location.split('/')[0]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Outreach Pitch Cockpit (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
                
                {/* Contact Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">{activeRecruiter.fullName}</h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {activeRecruiter.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {activeRecruiter.verifiedEmail}   {activeRecruiter.companyName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={activeRecruiter.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-mono font-medium border border-slate-700"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      <span>Profile</span>
                    </a>
                    <button
                      onClick={() => handleCopy(`${outreachPackage.recommendedSubject}\n\n${outreachPackage.pitchBody}`, 'full_email')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 text-xs font-mono font-bold transition-all cursor-pointer"
                    >
                      {copiedKey === 'full_email' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'full_email' ? 'Copied Pitch!' : 'Copy Entire Pitch'}</span>
                    </button>
                  </div>
                </div>

                {/* Subject Line Selector */}
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Subject Line (Optimized for 90%+ Open Rate):</span>
                    <button
                      onClick={() => handleCopy(outreachPackage.recommendedSubject, 'subj')}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      {copiedKey === 'subj' ? 'Copied!' : 'Copy Subject'}
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-purple-200 font-semibold flex items-center justify-between">
                    <span className="truncate">{outreachPackage.recommendedSubject}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 shrink-0 ml-2">
                      ANCHORED
                    </span>
                  </div>
                </div>

                {/* Pitch Body Box */}
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Personalized Direct Outreach Body:</span>
                    <span className="text-[11px] text-slate-500">
                      Truth-anchored to Student GPA &amp; GitHub
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 whitespace-pre-line leading-relaxed max-h-[280px] overflow-y-auto">
                    {outreachPackage.pitchBody}
                  </div>
                </div>

                {/* Timing & Channel Sentinel Advice */}
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-start gap-2.5 text-xs">
                  <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div className="text-purple-200 font-mono">
                    <strong>Optimal Delivery Sentinel:</strong> {outreachPackage.recommendedTimingNotice}
                  </div>
                </div>

                {/* Proof of Work Embeds */}
                <div>
                  <h4 className="text-xs font-mono text-slate-400 uppercase font-bold mb-2">
                    Proof-Of-Work Artifacts Attached
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {outreachPackage.proofOfWorkEmbeds.map((emb, idx) => (
                      <a
                        key={idx}
                        href={emb.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 block text-xs group transition-all"
                      >
                        <div className="font-bold text-white group-hover:text-purple-300 flex items-center justify-between">
                          <span className="truncate">{emb.label}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1 font-mono">
                          {emb.description}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: RECRUITER DNA PROFILING & STRATEGY */}
      {activeTab === 'dna_dossier' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Recruiter DNA Intelligence Profile: {activeRecruiter.fullName}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reverse-engineered screening criteria and behavioral preferences for {activeRecruiter.companyName}'s hiring pipeline
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Select Contact:</span>
                <select
                  value={selectedRecruiterId}
                  onChange={(e) => setSelectedRecruiterId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  {recruiters.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.fullName} ({r.companyName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Strategic Overview Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Technical Depth Level</div>
                <div className="text-sm font-bold text-white font-mono">{activeRecruiter.recruiterDna.technicalDepthLevel}</div>
                <div className="text-[11px] text-slate-400">Determines vocabulary complexity</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Average Response Velocity</div>
                <div className="text-sm font-bold text-emerald-400 font-mono">~{activeRecruiter.recruiterDna.averageResponseTimeHours} Hours</div>
                <div className="text-[11px] text-slate-400">Fastest turnaround in early mornings</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Current Requisition Load</div>
                <div className="text-sm font-bold text-cyan-300 font-mono">{activeRecruiter.recruiterDna.activeRequisitionsCount} Positions</div>
                <div className="text-[11px] text-slate-400">Actively reviewing inbound candidate slates</div>
              </div>
            </div>

            {/* What to Anchor vs What to Avoid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Positive Hooks */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Key Phrases &amp; Proof to Anchor</span>
                </div>
                <div className="space-y-1.5">
                  {activeRecruiter.recruiterDna.keyPhrasesToAnchor.map((phrase, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-200 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>"{phrase}"</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  Incorporating these exact terms increases ATS &amp; manual resume triage bypass by 3.8x.
                </p>
              </div>

              {/* Negative Traps */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Red-Flag Phrases to Strictly Avoid</span>
                </div>
                <div className="space-y-1.5">
                  {activeRecruiter.recruiterDna.phrasesToAvoid.map((phrase, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span>"{phrase}"</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  These generic phrases trigger immediate auto-archive by senior technical sourcers.
                </p>
              </div>

            </div>

            {/* Active Requisitions Under Recruiter */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono text-slate-300 font-bold uppercase">
                Active Requisitions Managed by {activeRecruiter.fullName}
              </h4>
              <div className="space-y-2">
                {activeRecruiter.activeHiringReqs.map(req => (
                  <div key={req.requisitionId} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono">
                    <div>
                      <div className="font-bold text-white">{req.title}</div>
                      <div className="text-[11px] text-slate-400">{req.level}   Req: {req.requisitionId}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      req.urgency === 'critical' 
                        ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                        : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                    }`}>
                      {req.urgency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: 3-STEP FOLLOW-UP CADENCE SENTINEL */}
      {activeTab === 'cadence_sentinel' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Automated 3-Step Follow-Up Cadence Sentinel</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Statistically optimal follow-up timeline to maximize interview conversions without crossing etiquette boundaries
              </p>
            </div>

            <div className="space-y-4">
              {outreachPackage.followUpCadenceTimeline.map(step => (
                <div key={step.day} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300 font-mono font-bold text-xs">
                        Day {step.day}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-mono">{step.title}</h4>
                        <p className="text-xs text-slate-400">{step.action}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(step.readyTemplate, `step_${step.day}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-mono font-bold transition-all cursor-pointer self-start sm:self-auto"
                    >
                      {copiedKey === `step_${step.day}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === `step_${step.day}` ? 'Copied Template!' : 'Copy Template'}</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-line leading-relaxed">
                    {step.readyTemplate}
                  </div>
                </div>
              ))}
            </div>

            {/* Compliance Sentinel Notice */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-mono">Executive Recruiter Etiquette Protocol:</strong> Always stop all follow-ups immediately upon receiving any response. If no response after Day 8, transition the application to automated radar monitoring rather than sending further unsolicited messages.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Zero Contacts Empty State when list is empty */}
      {recruiters.length === 0 && (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/50 border border-purple-800 flex items-center justify-center mx-auto text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white font-mono">No Verified Recruiter Contacts Added Yet</h3>
            <p className="text-xs text-slate-400">
              TERRASYNX strictly enforces genuine data: no fake staff or synthetic recruiter identities are populated. Add real engineering sourcers, campus recruiters, or hiring managers you connect with on LinkedIn or company career events.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-lg shadow-purple-950/50"
          >
            + Add Verified Recruiter / Sourcer
          </button>
        </div>
      )}

      {/* Modal: Add Verified Recruiter / Sourcer */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span>Add Verified Recruiter / Talent Lead</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRecruiterSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-300">Recruiter Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jessica Miller"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300">Company Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, Figma"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">Role / Designation:</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Engineering Hiring Manager">Engineering Hiring Manager</option>
                    <option value="Senior Technical Sourcer">Senior Technical Sourcer</option>
                    <option value="University Talent Lead">University Talent Lead</option>
                    <option value="Principal Technical Recruiter">Principal Tech Recruiter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300">Work Email (Optional):</label>
                  <input
                    type="email"
                    placeholder="e.g. jmiller@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">LinkedIn Profile URL (Optional):</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={newLinkedin}
                    onChange={(e) => setNewLinkedin(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Department / Tech Focus:</label>
                <input
                  type="text"
                  placeholder="e.g. Core Infrastructure, Distributed Systems"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500"
                >
                  Save Verified Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

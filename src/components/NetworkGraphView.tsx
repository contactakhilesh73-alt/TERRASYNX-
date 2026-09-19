/**
 * TERRASYNX: Enterprise Alumni Referral Network Graph & Warm Path Matrix (Phase 8 Point 1)
 * Interactive multi-hop network visualizer, warm introduction routing calculator,
 * referral capacity sentinel, and forwardable double-opt-in email generator.
 */

import React, { useState, useMemo } from 'react';
import { 
  Opportunity, 
  StudentProfile, 
  NetworkAlumniNode, 
  WarmIntroductionRoute 
} from '../types';
import { ReferralNetworkEngine } from '../services/referralNetworkEngine';
import { 
  Network, 
  Users, 
  Share2, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight, 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  ExternalLink, 
  Send, 
  Zap, 
  Search, 
  Filter, 
  CheckCircle2, 
  Award, 
  Linkedin, 
  Mail, 
  ArrowUpRight,
  TrendingUp,
  Flame,
  ChevronRight
} from 'lucide-react';

interface NetworkGraphViewProps {
  opportunities: Opportunity[];
  studentProfile: StudentProfile;
  onNavigateToPipeline?: () => void;
  onOpenOpportunity?: (opp: Opportunity) => void;
}

export const NetworkGraphView: React.FC<NetworkGraphViewProps> = ({
  opportunities,
  studentProfile,
  onNavigateToPipeline,
  onOpenOpportunity,
}) => {
  const [alumniNodes, setAlumniNodes] = useState<NetworkAlumniNode[]>(() => 
    ReferralNetworkEngine.getAlumniNodes()
  );
  const [selectedOppId, setSelectedOppId] = useState<string>(opportunities[0]?.id || '');
  const [selectedAlumniId, setSelectedAlumniId] = useState<string>(alumniNodes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'pathways' | 'forwardable_draft'>('graph');

  const stats = useMemo(() => ReferralNetworkEngine.getNetworkStats(), []);

  const selectedOpp = useMemo(() => {
    return opportunities.find(o => o.id === selectedOppId) || opportunities[0];
  }, [opportunities, selectedOppId]);

  const warmRoute: WarmIntroductionRoute = useMemo(() => {
    if (!selectedOpp) {
      return ReferralNetworkEngine.computeWarmRouteForOpportunity(opportunities[0], studentProfile);
    }
    return ReferralNetworkEngine.computeWarmRouteForOpportunity(selectedOpp, studentProfile);
  }, [selectedOpp, studentProfile, opportunities]);

  const activeAlumni = useMemo(() => {
    return alumniNodes.find(a => a.id === selectedAlumniId) || alumniNodes[0];
  }, [alumniNodes, selectedAlumniId]);

  const filteredAlumni = useMemo(() => {
    return alumniNodes.filter(a => {
      const matchesSearch = 
        a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.currentCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCompany = companyFilter === 'all' || a.currentCompany.toLowerCase() === companyFilter.toLowerCase();

      return matchesSearch && matchesCompany;
    });
  }, [alumniNodes, searchQuery, companyFilter]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const companiesList = useMemo(() => {
    return Array.from(new Set(alumniNodes.map(a => a.currentCompany)));
  }, [alumniNodes]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner: Enterprise Network Command Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white font-mono tracking-tight">
                Alumni Referral Network Graph & Warm Path Matrix
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                Phase 8 Point 1   Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified campus alumni telemetry, multi-hop warm path scoring, and forwardable double-opt-in referral routing
            </p>
          </div>
        </div>

        {/* Global Key Metrics */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="p-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Mapped Alumni</div>
            <div className="text-base font-bold font-mono text-cyan-300">{stats.totalMappedAlumni} Verified</div>
          </div>
          <div className="p-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Tier-1 Density</div>
            <div className="text-base font-bold font-mono text-emerald-400">{stats.tier1AlumniCount} Top-Tech</div>
          </div>
          <div className="p-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Avg Warmth Score</div>
            <div className="text-base font-bold font-mono text-purple-400">{stats.avgWarmPathScore}% Warm</div>
          </div>
        </div>
      </div>

      {/* Target Requisition Context Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 border border-cyan-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase font-bold text-cyan-400">
                Target Role for Warm Referral Routing
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-800 text-slate-300">
                {selectedOpp?.verification?.requisitionId}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
              {selectedOpp?.title} <span className="text-slate-400 font-normal">at</span> <span className="text-cyan-300 font-bold">{selectedOpp?.companyName}</span>
            </h2>
          </div>
        </div>

        {/* Opportunity Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedOppId}
            onChange={(e) => setSelectedOppId(e.target.value)}
            className="w-full md:w-72 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
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
          onClick={() => setActiveTab('graph')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'graph'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>1. Network Topology &amp; Alumni Nodes</span>
        </button>
        <button
          onClick={() => setActiveTab('pathways')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'pathways'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>2. Multi-Hop Warm Introduction Routes</span>
        </button>
        <button
          onClick={() => setActiveTab('forwardable_draft')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'forwardable_draft'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>3. Forwardable Double-Opt-In Generator</span>
        </button>
      </div>

      {/* TAB 1: NETWORK TOPOLOGY & ALUMNI NODES */}
      {activeTab === 'graph' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alumni by name, role, department, or company..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-mono">Company:</span>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Companies ({companiesList.length})</option>
                {companiesList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const name = window.prompt("Enter Contact/Alumni Full Name (e.g. Rahul Sharma):");
                  if (!name) return;
                  const company = window.prompt("Enter Company Name (e.g. Stripe, Google, Datadog):") || "Tech";
                  const role = window.prompt("Enter Job Title (e.g. Software Engineer):") || "Software Engineer";
                  const college = window.prompt("Enter College/Alma Mater (or press Enter for your college):") || studentProfile.collegeName;
                  const linkedin = window.prompt("Enter LinkedIn Profile URL (or press Enter to search):") || `https://linkedin.com/search/results/people/?keywords=${encodeURIComponent(name + ' ' + company)}`;

                  const newNode: NetworkAlumniNode = {
                    id: `alumni_custom_${Date.now()}`,
                    fullName: name.trim(),
                    currentCompany: company.trim(),
                    companyDomain: `${company.toLowerCase().replace(/\s+/g, '')}.com`,
                    jobTitle: role.trim(),
                    department: 'Engineering',
                    almaMater: college.trim(),
                    gradYear: studentProfile.graduationYear - 1,
                    degree: 'B.Tech / B.S. Computer Science',
                    connectionDegree: 'Campus Alumni',
                    warmIntroScore: 92,
                    location: 'Bengaluru / Hybrid',
                    mutualConnections: ['Campus Alumni Guild'],
                    referralBandwidth: 'available',
                    preferredContactChannel: 'linkedin_dm',
                    directEmailHint: `${name.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
                    linkedinUrl: linkedin.trim(),
                    verifiedReferralHistoryCount: 1,
                    strategicReferralAngle: `Direct engineering alignment with ${studentProfile.primarySkills.slice(0, 2).join(' and ')}`,
                    recommendedIntroPath: 'Direct 1-Hop Campus Connection'
                  };

                  const updated = [newNode, ...alumniNodes];
                  setAlumniNodes(updated);
                  ReferralNetworkEngine.saveAlumniNodes(updated);
                }}
                className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-mono font-bold whitespace-nowrap cursor-pointer transition-colors"
                title="Add a real senior or campus alumni you know personally"
              >
                + Add Real Contact
              </button>
            </div>
          </div>

          {/* Interactive SVG Network Topology Visualizer */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Live Network Topology &amp; Multi-Hop Constellation
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-500/40"></span>
                  <span>Candidate (Origin)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/40"></span>
                  <span>Direct Match</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 ring-2 ring-indigo-500/40"></span>
                  <span>Campus Peer</span>
                </span>
              </div>
            </div>

            {/* SVG Visualizer with smooth interactive links */}
            <div className="w-full overflow-x-auto">
              <svg viewBox="0 0 900 320" className="w-full min-w-[700px] h-64 bg-slate-900/40 rounded-xl border border-slate-850">
                <defs>
                  <linearGradient id="cyanLine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="indigoLine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.6" />
                  </linearGradient>
                </defs>

                {/* Animated Connection Lines from Candidate center (450, 160) to alumni nodes */}
                {filteredAlumni.slice(0, 8).map((node, idx) => {
                  const total = Math.min(filteredAlumni.length, 8);
                  const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
                  const radius = 110;
                  const nx = 450 + radius * 2.5 * Math.cos(angle);
                  const ny = 160 + radius * 0.95 * Math.sin(angle);
                  const isSelected = node.id === activeAlumni.id;
                  const isTargetMatch = selectedOpp?.companyName.toLowerCase().includes(node.currentCompany.toLowerCase());

                  return (
                    <g key={`link-${node.id}`}>
                      <line
                        x1="450"
                        y1="160"
                        x2={nx}
                        y2={ny}
                        stroke={isTargetMatch ? 'url(#cyanLine)' : 'url(#indigoLine)'}
                        strokeWidth={isSelected ? 3 : isTargetMatch ? 2 : 1}
                        strokeDasharray={isSelected ? 'none' : '4 3'}
                        className="transition-all duration-300"
                      />
                      {isSelected && (
                        <circle cx={(450 + nx) / 2} cy={(160 + ny) / 2} r="3" fill="#22d3ee" className="animate-ping" />
                      )}
                    </g>
                  );
                })}

                {/* Center Node: Candidate (You) */}
                <g className="cursor-pointer" transform="translate(450, 160)">
                  <circle r="36" fill="#082f49" stroke="#06b6d4" strokeWidth="2.5" className="animate-pulse" />
                  <circle r="26" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1" />
                  <text textAnchor="middle" y="4" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
                    YOU
                  </text>
                  <text textAnchor="middle" y="48" fill="#e0f2fe" fontSize="10" fontWeight="600" fontFamily="sans-serif">
                    {studentProfile.fullName ? studentProfile.fullName.split(' ')[0] : 'Candidate'}
                  </text>
                  <text textAnchor="middle" y="60" fill="#7dd3fc" fontSize="9" fontFamily="monospace">
                    Class '{studentProfile.graduationYear.toString().slice(2)}
                  </text>
                </g>

                {/* Alumni Outer Satellite Nodes */}
                {filteredAlumni.slice(0, 8).map((node, idx) => {
                  const total = Math.min(filteredAlumni.length, 8);
                  const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
                  const radius = 110;
                  const nx = 450 + radius * 2.5 * Math.cos(angle);
                  const ny = 160 + radius * 0.95 * Math.sin(angle);
                  const isSelected = node.id === activeAlumni.id;
                  const isTargetMatch = selectedOpp?.companyName.toLowerCase().includes(node.currentCompany.toLowerCase());

                  return (
                    <g
                      key={`node-${node.id}`}
                      className="cursor-pointer transition-all duration-200"
                      transform={`translate(${nx}, ${ny})`}
                      onClick={() => setSelectedAlumniId(node.id)}
                    >
                      <circle
                        r={isSelected ? 26 : 22}
                        fill={isTargetMatch ? '#064e3b' : isSelected ? '#1e1b4b' : '#0f172a'}
                        stroke={isTargetMatch ? '#10b981' : isSelected ? '#818cf8' : '#334155'}
                        strokeWidth={isSelected ? 2.5 : isTargetMatch ? 2 : 1.5}
                      />
                      <text
                        textAnchor="middle"
                        y="4"
                        fill={isTargetMatch ? '#34d399' : isSelected ? '#c7d2fe' : '#94a3b8'}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {node.currentCompany.slice(0, 7)}
                      </text>
                      <text
                        textAnchor="middle"
                        y={ny > 160 ? 34 : -28}
                        fill="#f1f5f9"
                        fontSize="10"
                        fontWeight="600"
                        fontFamily="sans-serif"
                      >
                        {node.fullName.split(' ')[0]}
                      </text>
                      <text
                        textAnchor="middle"
                        y={ny > 160 ? 46 : -17}
                        fill={isTargetMatch ? '#6ee7b7' : '#94a3b8'}
                        fontSize="8.5"
                        fontFamily="monospace"
                      >
                        {node.warmIntroScore}% Warm
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Interactive Graph Node Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAlumni.map(node => {
              const isSelected = node.id === activeAlumni.id;
              const isDirectTarget = selectedOpp?.companyName.toLowerCase().includes(node.currentCompany.toLowerCase());
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedAlumniId(node.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  {isDirectTarget && (
                    <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 text-[9px] font-bold font-mono px-2 py-0.5 rounded-bl-lg">
                      TARGET MATCH
                    </div>
                  )}

                  <div>
                    {/* Node Identity */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{node.fullName}</h3>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            '{node.gradYear.toString().slice(2)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium mt-0.5">{node.jobTitle}</p>
                        <p className="text-[11px] text-cyan-400 font-mono mt-0.5 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>{node.currentCompany}   {node.department}</span>
                        </p>
                      </div>
                    </div>

                    {/* Alma Mater & Degree */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono space-y-1 my-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Alma Mater:</span>
                        <span className="text-slate-200 font-bold truncate max-w-[170px]">{node.almaMater.split(' ')[0]}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Pathway Score:</span>
                        <span className="text-emerald-400 font-bold">{node.warmIntroScore}% Warm</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Bandwidth:</span>
                        <span className={`capitalize font-bold ${
                          node.referralBandwidth === 'available' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {node.referralBandwidth.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Strategic Hook */}
                    <div className="text-[11px] text-slate-300 italic line-clamp-2">
                      "{node.strategicReferralAngle}"
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-slate-500">
                      {node.verifiedReferralHistoryCount} verified referrals
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={node.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors"
                        title="View LinkedIn Profile"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAlumniId(node.id);
                          setActiveTab('forwardable_draft');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-[11px] font-mono font-bold cursor-pointer"
                      >
                        <span>Draft Intro</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-HOP WARM INTRODUCTION ROUTES */}
      {activeTab === 'pathways' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">
                  Multi-Hop Warm Introduction Route Calculator
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {warmRoute.overallWarmthScore}% Warmth Index
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Calculates the mathematically highest probability connection vector into {warmRoute.targetCompany}'s engineering organization
              </p>
            </div>

            {/* Visual Route Nodes Progression */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Hop 1: Candidate (You) */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 w-full md:w-auto">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center font-bold text-cyan-400 text-sm">
                  YOU
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{studentProfile.fullName || 'Alex Chen'}</div>
                  <div className="text-[11px] text-slate-400 font-mono">Class of {studentProfile.graduationYear}</div>
                  <div className="text-[10px] text-cyan-400">{studentProfile.collegeName || 'Thapar Institute'}</div>
                </div>
              </div>

              {/* Intermediary Hop if applicable */}
              {warmRoute.intermediaryNode ? (
                <>
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <span className="text-[10px] font-mono text-cyan-400">1st Hop</span>
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 border border-indigo-800/60 w-full md:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-700 flex items-center justify-center font-bold text-indigo-400 text-sm">
                      HOP 1
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{warmRoute.intermediaryNode.name}</div>
                      <div className="text-[11px] text-indigo-300 font-mono">{warmRoute.intermediaryNode.relationship}</div>
                      <div className="text-[10px] text-slate-400">Bridge Intermediary</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <span className="text-[10px] font-mono text-emerald-400">2nd Hop</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">Direct 1-Hop Campus Connection</span>
                  <ArrowRight className="w-6 h-6 text-emerald-400" />
                </div>
              )}

              {/* Final Hop: Primary Alumni Node */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 border border-emerald-800/60 w-full md:w-auto">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 flex items-center justify-center font-bold text-emerald-400 text-sm">
                  DEST
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{warmRoute.primaryAlumni.fullName}</div>
                  <div className="text-[11px] text-emerald-300 font-mono">{warmRoute.primaryAlumni.jobTitle}</div>
                  <div className="text-[10px] text-slate-400">{warmRoute.primaryAlumni.currentCompany} ({warmRoute.primaryAlumni.department})</div>
                </div>
              </div>
            </div>

            {/* Strategy & Advantage Dossier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fast-Track Pipeline Advantage</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  {warmRoute.fastTrackAdvantage}
                </p>
                <div className="text-[11px] text-emerald-400 pt-1 border-t border-slate-850 font-mono">
                   Bypasses cold automated screening resume queues directly into engineering manager inbox.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Optimal Requisition Alignment Hook</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  {warmRoute.primaryAlumni.strategicReferralAngle}
                </p>
                <div className="text-[11px] text-cyan-400 pt-1 border-t border-slate-850 font-mono">
                   Recommended Channel: <strong className="text-white uppercase">{warmRoute.primaryAlumni.preferredContactChannel}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FORWARDABLE DOUBLE-OPT-IN GENERATOR */}
      {activeTab === 'forwardable_draft' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Send className="w-4 h-4 text-cyan-400" />
                  <span>Forwardable Double-Opt-In Introduction Draft</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pre-crafted email ready to send to {warmRoute.primaryAlumni.fullName} ({warmRoute.primaryAlumni.currentCompany})
                </p>
              </div>

              <button
                onClick={() => handleCopy(`${warmRoute.draftedForwardableIntro.subject}\n\n${warmRoute.draftedForwardableIntro.body}`, 'full_intro')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                {copiedKey === 'full_intro' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'full_intro' ? 'Copied Full Note!' : 'Copy Entire Email'}</span>
              </button>
            </div>

            {/* Forwardable Blurb for Intermediary if multi-hop */}
            {warmRoute.draftedForwardableIntro.blurbForIntermediary && (
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-300 font-bold flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Quick Blurb for Intermediary ({warmRoute.intermediaryNode?.name})</span>
                  </span>
                  <button
                    onClick={() => handleCopy(warmRoute.draftedForwardableIntro.blurbForIntermediary || '', 'blurb')}
                    className="text-[11px] text-indigo-300 hover:text-white"
                  >
                    {copiedKey === 'blurb' ? 'Copied!' : 'Copy Blurb'}
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  "{warmRoute.draftedForwardableIntro.blurbForIntermediary}"
                </div>
              </div>
            )}

            {/* Email Subject & Body Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="text-slate-400 truncate">
                  <span>Subject: </span>
                  <span className="text-cyan-300 font-bold">{warmRoute.draftedForwardableIntro.subject}</span>
                </div>
                <button
                  onClick={() => handleCopy(warmRoute.draftedForwardableIntro.subject, 'subj')}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 shrink-0 ml-2"
                >
                  {copiedKey === 'subj' ? 'Copied!' : 'Copy Subject'}
                </button>
              </div>

              <div className="text-slate-200 whitespace-pre-line leading-relaxed">
                {warmRoute.draftedForwardableIntro.body}
              </div>
            </div>

            {/* Etiquette Sentinel & Best Practices */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Executive Referral Etiquette Sentinel</span>
              </span>
              <ul className="text-xs text-slate-400 space-y-1 font-sans">
                <li> <strong>Proof of Work Included:</strong> Never ask for a referral empty-handed; this template automatically embeds your GitHub repository and confirmed Requisition ID.</li>
                <li> <strong>Zero Friction for Alumni:</strong> Aligns with the 2-minute double-opt-in standard so the employee can submit the portal referral form in under 60 seconds.</li>
                <li> <strong>Follow-Up Policy:</strong> If unread after 4 business days, send a polite 1-sentence check-in referencing your shared campus alumni connection.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

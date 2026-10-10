/**
 * TERRASYNX: Corporate Internships Dedicated Portal Component (Prompt 34B)
 * 
 * Exclusively displays Corporate Internships:
 * - tier_category: tech_giant, quant_hft, frontier_ai, early_undergrad_exclusive
 * - Strictly NO scholarship, research, or open-source entries rendered.
 * - Blue accent theme & "Corporate Internships" prominent title.
 * - Dynamic country filter with distinct counts, month filter, status tabs, and 4-badge matrix.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { UpcomingInternshipCycle, InternshipCycleCurrentStatus, StudentProfile } from '../types';
import { UpcomingInternshipsService, detectNaturalSynonymHint } from '../services/upcomingInternshipsService';
import { UrlHealthResolver } from '../services/urlHealthResolver';
import { CalendarSyncService } from '../services/calendarSyncService';
import { CompanyLogo } from './CompanyLogo';
import { LinkHealthBadge } from './LinkHealthBadge';
import { getStudyLevelBadgeConfig, getCoverageTypeBadgeConfig } from '../utils/scholarshipBadges';
import { getCountryFlag, createGoogleCalendarUrl, evaluateEligibilityMatrix, MatrixBadgeType } from './UpcomingInternshipsCalendar';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Compass, 
  DollarSign,
  AlertCircle,
  CalendarClock,
  History,
  Info,
  RotateCcw,
  Briefcase,
  Cpu,
  TrendingUp,
  Building2,
  Bookmark,
  CalendarPlus,
  X,
  Star,
  Radio,
  MapPin,
  ChevronDown
} from 'lucide-react';

interface InternshipsPortalProps {
  onNavigateToCalendar?: () => void;
  studentProfile?: StudentProfile;
}

export type LiveStatusTab = 'ALL' | 'OPEN_NOW' | 'OPENING_SOON' | 'UPCOMING_SEASON' | 'PASSED_THIS_CYCLE' | 'TRACKED';

const CORPORATE_TIERS = new Set(['tech_giant', 'quant_hft', 'frontier_ai', 'early_undergrad_exclusive']);

export const InternshipsPortal: React.FC<InternshipsPortalProps> = ({
  onNavigateToCalendar,
  studentProfile,
}) => {
  // Live Date Reference State
  const [referenceDate, setReferenceDate] = useState<Date>(() => new Date());
  const [isSimulatingDate, setIsSimulatingDate] = useState<boolean>(false);

  // Auto-refresh clock every 30 seconds
  useEffect(() => {
    if (isSimulatingDate) return;
    const timer = setInterval(() => {
      setReferenceDate(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, [isSimulatingDate]);

  // Live Status Tabs
  const [activeStatusTab, setActiveStatusTab] = useState<LiveStatusTab>('OPEN_NOW');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'quant_hft' | 'tech_giant' | 'frontier_ai' | 'early_undergrad_exclusive'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  
  // Tracked Opportunities state (persisted in localStorage)
  const [trackedCycleIds, setTrackedCycleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('terrasynx_tracked_cycles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Student Active Graduation Cohort for 4-Badge Matrix Comparison
  const [studentBatch, setStudentBatch] = useState<number | 'class_12' | 'all'>(() => {
    if (studentProfile?.graduationYear) {
      return studentProfile.graduationYear;
    }
    return 2027;
  });

  const [matrixFilter, setMatrixFilter] = useState<'all' | MatrixBadgeType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reminderAddedMap, setReminderAddedMap] = useState<Record<string, boolean>>({});

  const monthsList = [
    { key: 'all', label: 'All Months' },
    { key: 'june', label: 'June' },
    { key: 'july', label: 'July' },
    { key: 'august', label: 'August' },
    { key: 'september', label: 'September' },
    { key: 'october', label: 'October' },
    { key: 'november', label: 'November' },
  ];

  // Prompt 34B: STRICT CORPORATE INTERNSHIPS BASE DATASET
  // Shows ONLY corporate internships (tier_category: tech_giant, quant_hft, frontier_ai, early_undergrad_exclusive)
  // Strictly excludes scholarships, research labs, or open-source entries.
  const corporateCycles = useMemo(() => {
    const raw = UpcomingInternshipsService.getAllUpcomingCycles(referenceDate);
    return raw.filter(cycle => {
      // Must match corporate tiers
      const isCorporateTier = cycle.tierCategory && CORPORATE_TIERS.has(cycle.tierCategory);
      // Strictly exclude any scholarship, research, or open-source flags
      const isScholarship = cycle.isGlobalFullRide || cycle.isPreUniversityFullRide || cycle.programCategory === 'scholarship' || cycle.programCategory === 'early_career_12th';
      const isResearch = cycle.tierCategory === 'scientific_lab' || cycle.tierCategory === 'academic_fellowship' || cycle.programCategory === 'scientific_lab' || cycle.programCategory === 'academic_fellowship';
      const isOpenSource = cycle.tierCategory === 'open_source_grant' || cycle.programCategory === 'open_source_grant';

      return isCorporateTier && !isScholarship && !isResearch && !isOpenSource;
    });
  }, [referenceDate]);

  // Dynamic distinct country counts from the corporate internships dataset
  const countryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cycle of corporateCycles) {
      const c = cycle.country?.trim() || 'Global/Remote';
      counts[c] = (counts[c] || 0) + 1;
    }
    return counts;
  }, [corporateCycles]);

  const distinctCountries = useMemo(() => {
    const keys = Object.keys(countryCounts);
    return keys.sort((a, b) => {
      if (a === 'Global/Remote') return -1;
      if (b === 'Global/Remote') return 1;
      return a.localeCompare(b);
    });
  }, [countryCounts]);

  // Status Strip Counts for corporate internships
  const statusStripCounts = useMemo(() => {
    let list = corporateCycles;
    if (selectedCategory !== 'all') {
      list = list.filter(c => c.tierCategory === selectedCategory);
    }
    if (selectedMonth !== 'all') {
      const m = selectedMonth.toLowerCase();
      list = list.filter(c => 
        c.expectedAnnouncementMonth.toLowerCase().includes(m) ||
        c.timelinePhases.announcementMonth.toLowerCase().includes(m)
      );
    }
    if (selectedCountry !== 'all') {
      list = list.filter(c => c.country === selectedCountry);
    }
    if (searchQuery.trim()) {
      list = list.filter(c => {
        const text = `${c.companyName} ${c.programTitle} ${c.country} ${c.tierCategory || ''}`.toLowerCase();
        return text.includes(searchQuery.toLowerCase().trim());
      });
    }

    return {
      ALL: list.length,
      OPEN_NOW: list.filter(c => c.currentStatus === 'OPEN_NOW').length,
      OPENING_SOON: list.filter(c => c.currentStatus === 'UPCOMING' && (c.daysRemaining !== undefined && c.daysRemaining <= 30)).length,
      UPCOMING_SEASON: list.filter(c => c.currentStatus === 'UPCOMING' && (c.daysRemaining === undefined || c.daysRemaining > 30)).length,
      PASSED_THIS_CYCLE: list.filter(c => c.currentStatus === 'PASSED_THIS_CYCLE').length,
      TRACKED: list.filter(c => trackedCycleIds.includes(c.id)).length,
    };
  }, [corporateCycles, selectedCategory, selectedMonth, selectedCountry, searchQuery, trackedCycleIds]);

  // Category counts for corporate focus filter chips
  const categoryCounts = useMemo(() => {
    return {
      all: corporateCycles.length,
      tech_giant: corporateCycles.filter(c => c.tierCategory === 'tech_giant').length,
      quant_hft: corporateCycles.filter(c => c.tierCategory === 'quant_hft').length,
      frontier_ai: corporateCycles.filter(c => c.tierCategory === 'frontier_ai').length,
      early_undergrad_exclusive: corporateCycles.filter(c => c.tierCategory === 'early_undergrad_exclusive').length,
    };
  }, [corporateCycles]);

  // Filtered corporate cycles
  const filteredCycles = useMemo(() => {
    let list = corporateCycles;

    if (selectedCategory !== 'all') {
      list = list.filter(c => c.tierCategory === selectedCategory);
    }

    if (selectedMonth !== 'all') {
      const m = selectedMonth.toLowerCase();
      list = list.filter(c => 
        c.expectedAnnouncementMonth.toLowerCase().includes(m) ||
        c.timelinePhases.announcementMonth.toLowerCase().includes(m)
      );
    }

    if (selectedCountry !== 'all') {
      list = list.filter(c => c.country === selectedCountry);
    }

    if (searchQuery.trim()) {
      list = list.filter(c => {
        const text = `${c.companyName} ${c.programTitle} ${c.country} ${c.tierCategory || ''} ${c.keyPreparationTopics?.join(' ') || ''}`.toLowerCase();
        return text.includes(searchQuery.toLowerCase().trim());
      });
    }

    if (activeStatusTab === 'OPEN_NOW') {
      list = list.filter(c => c.currentStatus === 'OPEN_NOW');
      list.sort((a, b) => (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0));
    } else if (activeStatusTab === 'OPENING_SOON') {
      list = list.filter(c => c.currentStatus === 'UPCOMING' && (c.daysRemaining !== undefined && c.daysRemaining <= 30));
      list.sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999));
    } else if (activeStatusTab === 'UPCOMING_SEASON') {
      list = list.filter(c => c.currentStatus === 'UPCOMING' && (c.daysRemaining === undefined || c.daysRemaining > 30));
      list.sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999));
    } else if (activeStatusTab === 'PASSED_THIS_CYCLE') {
      list = list.filter(c => c.currentStatus === 'PASSED_THIS_CYCLE');
    } else if (activeStatusTab === 'TRACKED') {
      list = list.filter(c => trackedCycleIds.includes(c.id));
    }

    if (matrixFilter !== 'all') {
      list = list.filter(cycle => {
        const evalRes = evaluateEligibilityMatrix(cycle, studentBatch, referenceDate);
        return evalRes.type === matrixFilter;
      });
    }

    return list;
  }, [corporateCycles, selectedCategory, selectedMonth, selectedCountry, searchQuery, activeStatusTab, matrixFilter, studentBatch, referenceDate, trackedCycleIds]);

  const [visibleCount, setVisibleCount] = useState<number>(16);

  useEffect(() => {
    setVisibleCount(16);
  }, [activeStatusTab, selectedMonth, selectedCategory, selectedCountry, searchQuery, matrixFilter, studentBatch]);

  const visibleCycles = useMemo(() => {
    return filteredCycles.slice(0, visibleCount);
  }, [filteredCycles, visibleCount]);

  const handleToggleTrack = (cycle: UpcomingInternshipCycle) => {
    setTrackedCycleIds(prev => {
      const isAlreadyTracked = prev.includes(cycle.id);
      const updated = isAlreadyTracked ? prev.filter(id => id !== cycle.id) : [...prev, cycle.id];
      try {
        localStorage.setItem('terrasynx_tracked_cycles', JSON.stringify(updated));
      } catch {
        // safe fallback
      }
      return updated;
    });

    const isNowTracked = !trackedCycleIds.includes(cycle.id);
    setToastMessage(
      isNowTracked
        ? `Added ${cycle.companyName} to Tracked Radar`
        : `Removed ${cycle.companyName} from Tracked Radar`
    );
  };

  const handleAddCalendarReminder = (cycle: UpcomingInternshipCycle) => {
    try {
      const now = Date.now();
      const eventTitle = `[ANNUAL WINDOW] ${cycle.companyName} ${cycle.programTitle}`;
      CalendarSyncService.addCustomEvent({
        id: `cal_rem_${cycle.id}_${now}`,
        opportunityId: cycle.id,
        companyName: cycle.companyName,
        companyDomain: cycle.companyDomain,
        jobTitle: cycle.programTitle,
        eventType: 'follow_up_deadline',
        title: eventTitle,
        description: `Expected recruitment window for ${cycle.companyName} (${cycle.exactWindowText || cycle.expectedAnnouncementMonth}). Target batches: ${cycle.targetBatches.join(', ')}. Official portal: ${cycle.officialCareersUrl}`,
        startTime: now + (cycle.prepTimeRemainingMonths * 30 * 24 * 60 * 60 * 1000),
        endTime: now + (cycle.prepTimeRemainingMonths * 30 * 24 * 60 * 60 * 1000) + 3600000,
        durationMinutes: 60,
        platform: 'Direct Careers Portal',
        meetingLink: cycle.officialCareersUrl,
        status: 'scheduled',
        preparationChecklist: [
          `Review key preparation topics: ${cycle.keyPreparationTopics?.join(', ') || 'System Design, DSA'}`,
          `Check official career portal: ${cycle.officialCareersUrl}`,
          `Update resume with latest projects and coursework`
        ],
        syncStatus: {
          googleCalendar: false,
          icsExported: false,
        }
      });
      setReminderAddedMap(prev => ({ ...prev, [cycle.id]: true }));
      setToastMessage(`Calendar reminder scheduled for ${cycle.companyName} (${cycle.programTitle})`);
    } catch {
      setToastMessage(`Calendar alert synced for ${cycle.companyName}`);
    }
  };

  const formattedReferenceDate = useMemo(() => {
    return referenceDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [referenceDate]);

  const naturalSynonymHint = useMemo(() => {
    return detectNaturalSynonymHint(searchQuery);
  }, [searchQuery]);

  const handleSetSimulatedDate = (year: number, month: number, day: number) => {
    setIsSimulatingDate(true);
    setReferenceDate(new Date(year, month - 1, day, 12, 0, 0));
  };

  const handleResetToRealTime = () => {
    setIsSimulatingDate(false);
    setReferenceDate(new Date());
  };

  const getStatusBadgeConfig = (status?: InternshipCycleCurrentStatus) => {
    switch (status) {
      case 'OPEN_NOW':
        return {
          label: 'Open Now',
          icon: Clock,
          containerClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80',
          dotColor: 'bg-emerald-400 animate-pulse',
        };
      case 'UPCOMING':
        return {
          label: 'Upcoming Cycle',
          icon: CalendarClock,
          containerClass: 'bg-blue-950/60 text-blue-300 border-blue-600/80',
          dotColor: 'bg-blue-400',
        };
      case 'PASSED_THIS_CYCLE':
        return {
          label: 'Closed This Cycle',
          icon: History,
          containerClass: 'bg-slate-900/90 text-slate-400 border-slate-700/80',
          dotColor: 'bg-slate-500',
        };
      default:
        return {
          label: 'Predictable Cycle',
          icon: Clock,
          containerClass: 'bg-slate-800 text-slate-300 border-slate-700',
          dotColor: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Prompt 34B: Strategic Runway Hero Banner with Blue Accent */}
      <div className="rounded-2xl border border-blue-500/40 bg-gradient-to-r from-blue-950/50 via-slate-900 to-slate-950 p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5 shadow-sm shadow-blue-950">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                CORPORATE RECRUITMENT CALENDAR
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1">
                <Info className="w-3 h-3 text-blue-400" />
                Predictive Historical Model (Not Live Scraped)
              </span>
            </div>
            
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-400 flex items-center gap-2">
              Corporate Internships
            </h2>
            
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Exclusively tracking high-yield recruitment waves across Big Tech giants (Google, Microsoft, Amazon, Nvidia, Apple, Uber), Quant/HFT powerhouses (Jane Street, Citadel, Jump Trading, DE Shaw), and Frontier AI labs (OpenAI, DeepMind, Meta FAIR). Calculated live with day-level precision.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-900/90 border border-blue-900/50 rounded-xl px-4 py-3 text-center shadow-lg shadow-blue-950/40">
              <span className="block text-2xl font-black font-mono text-blue-400">
                {corporateCycles.length}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Corporate Tracks
              </span>
            </div>
            {onNavigateToCalendar && (
              <button
                onClick={onNavigateToCalendar}
                className="px-3.5 py-2.5 bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-600/60 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>View My Calendar</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Date Precision & Simulator Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${isSimulatingDate ? 'bg-amber-400 animate-ping' : 'bg-blue-400 animate-pulse'}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-300">
                  Current Viewing Date:
                </span>
                <span className={`text-xs font-mono font-black px-2 py-0.5 rounded border ${
                  isSimulatingDate 
                    ? 'bg-amber-950/80 text-amber-300 border-amber-600' 
                    : 'bg-blue-950/80 text-blue-300 border-blue-700'
                }`}>
                  📅 {formattedReferenceDate}
                </span>
                {isSimulatingDate && (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800">
                    Simulation Active
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                Evaluates corporate recruitment windows down to the exact day.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 mr-1">
              Test Transitions:
            </span>
            <button
              onClick={handleResetToRealTime}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                !isSimulatingDate
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Today (Live)</span>
            </button>
            <button
              onClick={() => handleSetSimulatedDate(2026, 9, 20)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                isSimulatingDate && referenceDate.getDate() === 20 && referenceDate.getMonth() === 8
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              20 Sep (Wave Active)
            </button>
            <button
              onClick={() => handleSetSimulatedDate(2026, 9, 22)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                isSimulatingDate && referenceDate.getDate() === 22 && referenceDate.getMonth() === 8
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              22 Sep (Transition Test)
            </button>
          </div>
        </div>

        {/* Status Tabs: Open Now / Upcoming / Passed / Tracked / All */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Live Status Strip
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                Corporate Recruitment Window Watch
              </span>
            </div>
            {trackedCycleIds.length > 0 && (
              <span className="text-[11px] font-mono text-amber-300 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{trackedCycleIds.length} Roles on Radar</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {/* Strip 1: Open Now */}
            <button
              onClick={() => setActiveStatusTab('OPEN_NOW')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeStatusTab === 'OPEN_NOW'
                  ? 'bg-emerald-950/70 border-emerald-500 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-400/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className={`text-[11px] font-mono font-bold ${activeStatusTab === 'OPEN_NOW' ? 'text-emerald-300' : 'text-slate-200'}`}>
                    Open Now
                  </span>
                </div>
                <span className={`text-xs font-mono font-black px-1.5 py-0.5 rounded ${
                  activeStatusTab === 'OPEN_NOW'
                    ? 'bg-emerald-900 text-emerald-200 border border-emerald-600'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {statusStripCounts.OPEN_NOW}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-1">Currently open</span>
            </button>

            {/* Strip 2: Opening Soon (<30 Days) */}
            <button
              onClick={() => setActiveStatusTab('OPENING_SOON')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeStatusTab === 'OPENING_SOON'
                  ? 'bg-amber-950/70 border-amber-500 shadow-lg shadow-amber-950/50 ring-1 ring-amber-400/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span className={`text-[11px] font-mono font-bold ${activeStatusTab === 'OPENING_SOON' ? 'text-amber-300' : 'text-slate-200'}`}>
                    Opening Soon
                  </span>
                </div>
                <span className={`text-xs font-mono font-black px-1.5 py-0.5 rounded ${
                  activeStatusTab === 'OPENING_SOON'
                    ? 'bg-amber-900 text-amber-200 border border-amber-600'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {statusStripCounts.OPENING_SOON}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-1">Opens in &lt;30 days</span>
            </button>

            {/* Strip 3: Upcoming Season */}
            <button
              onClick={() => setActiveStatusTab('UPCOMING_SEASON')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeStatusTab === 'UPCOMING_SEASON'
                  ? 'bg-blue-950/70 border-blue-500 shadow-lg shadow-blue-950/50 ring-1 ring-blue-400/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className={`text-[11px] font-mono font-bold ${activeStatusTab === 'UPCOMING_SEASON' ? 'text-blue-300' : 'text-slate-200'}`}>
                    Upcoming Season
                  </span>
                </div>
                <span className={`text-xs font-mono font-black px-1.5 py-0.5 rounded ${
                  activeStatusTab === 'UPCOMING_SEASON'
                    ? 'bg-blue-900 text-blue-200 border border-blue-600'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {statusStripCounts.UPCOMING_SEASON}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-1">30+ days runway</span>
            </button>

            {/* Strip 4: Passed This Cycle */}
            <button
              onClick={() => setActiveStatusTab('PASSED_THIS_CYCLE')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeStatusTab === 'PASSED_THIS_CYCLE'
                  ? 'bg-slate-850 border-slate-500 shadow-lg shadow-slate-950/50 ring-1 ring-slate-400/30'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className={`text-[11px] font-mono font-bold ${activeStatusTab === 'PASSED_THIS_CYCLE' ? 'text-slate-200' : 'text-slate-300'}`}>
                    Passed This Cycle
                  </span>
                </div>
                <span className={`text-xs font-mono font-black px-1.5 py-0.5 rounded ${
                  activeStatusTab === 'PASSED_THIS_CYCLE'
                    ? 'bg-slate-800 text-slate-200 border border-slate-600'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {statusStripCounts.PASSED_THIS_CYCLE}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 line-clamp-1">Closed this cycle</span>
            </button>

            {/* Strip 5: Tracked Radar */}
            <button
              onClick={() => setActiveStatusTab('TRACKED')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeStatusTab === 'TRACKED'
                  ? 'bg-purple-950/70 border-purple-500 shadow-lg shadow-purple-950/50 ring-1 ring-purple-400/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Star className={`w-2.5 h-2.5 ${activeStatusTab === 'TRACKED' ? 'fill-amber-400 text-amber-400' : 'text-purple-400'}`} />
                  <span className={`text-[11px] font-mono font-bold ${activeStatusTab === 'TRACKED' ? 'text-purple-300' : 'text-slate-200'}`}>
                    Tracked Radar
                  </span>
                </div>
                <span className={`text-xs font-mono font-black px-1.5 py-0.5 rounded ${
                  activeStatusTab === 'TRACKED'
                    ? 'bg-purple-900 text-purple-200 border border-purple-600'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {statusStripCounts.TRACKED}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-1">Saved corporate roles</span>
            </button>

            {/* Strip 6: All Corporate Cycles */}
            <button
              onClick={() => setActiveStatusTab('ALL')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeStatusTab === 'ALL'
                  ? 'bg-blue-950/80 border-blue-500 shadow-lg shadow-blue-950/50 ring-1 ring-blue-400/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-2.5 h-2.5 text-blue-400" />
                  <span className={`text-[11px] font-mono font-bold ${activeStatusTab === 'ALL' ? 'text-blue-300' : 'text-slate-200'}`}>
                    All Corporate
                  </span>
                </div>
                <span className={`text-xs font-mono font-black px-1.5 py-0.5 rounded ${
                  activeStatusTab === 'ALL'
                    ? 'bg-blue-900 text-blue-200 border border-blue-600'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {statusStripCounts.ALL}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-1">Complete corporate track</span>
            </button>
          </div>
        </div>

        {/* 1-Click Corporate Focus Filter Chips */}
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Corporate Focus Tiers</span>
            </span>
            <div className="text-[11px] font-mono text-slate-400">
              Showing <span className="font-bold text-slate-200">{Math.min(visibleCount, filteredCycles.length)}</span> of <span className="font-bold text-slate-200">{filteredCycles.length}</span> corporate roles
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>All Corporate ({categoryCounts.all})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('tech_giant')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'tech_giant'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black shadow-md shadow-sky-500/25 ring-1 ring-sky-300'
                  : 'bg-sky-950/30 text-sky-300 hover:bg-sky-950/60 border border-sky-800/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Big Tech ({categoryCounts.tech_giant})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('quant_hft')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'quant_hft'
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/30 ring-1 ring-amber-300'
                  : 'bg-amber-950/30 text-amber-300 hover:bg-amber-950/60 border border-amber-800/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Quants &amp; HFT ({categoryCounts.quant_hft})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('frontier_ai')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'frontier_ai'
                  ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-black shadow-md shadow-violet-600/30 ring-1 ring-violet-400/50'
                  : 'bg-violet-950/30 text-violet-300 hover:bg-violet-950/60 border border-violet-800/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              <span>Frontier AI ({categoryCounts.frontier_ai})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('early_undergrad_exclusive')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'early_undergrad_exclusive'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-md shadow-cyan-500/25 ring-1 ring-cyan-300'
                  : 'bg-cyan-950/30 text-cyan-300 hover:bg-cyan-950/60 border border-cyan-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>1st/2nd Yr Freshers ({categoryCounts.early_undergrad_exclusive})</span>
            </button>
          </div>
        </div>

        {/* Prompt 34B: Country Filter (Chips + Dropdown) */}
        <div className="mt-3 pt-3 border-t border-slate-800/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-blue-400" />
                <span>Host Country &amp; Jurisdiction Filter</span>
              </span>
              {selectedCountry !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCountry('all')}
                  className="text-[10px] font-mono text-blue-400 hover:text-blue-300 bg-blue-950/60 hover:bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700/60 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Reset country filter to All"
                >
                  <span>Reset to All</span>
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] font-mono text-slate-400">Jump to Country:</span>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                aria-label="Filter by Country"
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-blue-300 focus:outline-none focus:border-blue-400 cursor-pointer shadow-sm"
              >
                <option value="all">All Corporate Countries ({corporateCycles.length})</option>
                {distinctCountries.map(country => (
                  <option key={country} value={country}>
                    {getCountryFlag(country)} {country} ({countryCounts[country] || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto scrollbar-none py-1">
            <button
              onClick={() => setSelectedCountry('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCountry === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-300'
                  : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <span>🌐 All Countries</span>
              <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                selectedCountry === 'all' ? 'bg-blue-700/80 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {corporateCycles.length}
              </span>
            </button>

            {distinctCountries.map(country => {
              const isSelected = selectedCountry === country;
              const count = countryCounts[country] || 0;
              return (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(isSelected ? 'all' : country)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-md shadow-blue-500/30 ring-1 ring-blue-300'
                      : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                  }`}
                  title={`Filter to corporate programs in ${country} (${count} opportunities)`}
                >
                  <span>{getCountryFlag(country)}</span>
                  <span>{country}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected
                      ? 'bg-blue-950 text-blue-200 border border-blue-400/50'
                      : 'bg-slate-800/90 text-slate-400 border border-slate-700/60'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Month Filter & Search Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search corporate tech companies (Google, OpenAI, Jane Street, Amazon)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/80 transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">Recruitment Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-blue-300 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {monthsList.map(m => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {naturalSynonymHint && (
          <div className="mt-2 text-[11px] font-mono text-blue-300 bg-blue-950/40 border border-blue-800/40 px-2.5 py-1 rounded-lg">
            {naturalSynonymHint}
          </div>
        )}
      </div>

      {/* 4-Badge Matrix Benchmark Panel */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Eligibility Matrix Benchmark for Batch {studentBatch}</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Strict Zero-Exclusion: cards remain visible for planning while eligibility indicators update dynamically.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Testing Cohort:</span>
            <select
              value={String(studentBatch)}
              onChange={(e) => setStudentBatch(Number(e.target.value))}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-200"
            >
              <option value="2026">2026 (Final Year)</option>
              <option value="2027">2027 (Pre-Final Year / Benchmark)</option>
              <option value="2028">2028 (Sophomore / 2nd Year)</option>
              <option value="2029">2029 (Fresher / 1st Year)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          <button
            onClick={() => setMatrixFilter(matrixFilter === 'GREEN' ? 'all' : 'GREEN')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              matrixFilter === 'GREEN'
                ? 'bg-emerald-950/70 border-emerald-500 shadow-md ring-1 ring-emerald-400'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 text-slate-300'
            }`}
          >
            <span className="text-[11px] font-mono font-bold text-emerald-400 block">🟢 Eligible Now</span>
            <span className="text-[10px] text-slate-400">Directly eligible for Batch {studentBatch}</span>
          </button>

          <button
            onClick={() => setMatrixFilter(matrixFilter === 'BLUE' ? 'all' : 'BLUE')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              matrixFilter === 'BLUE'
                ? 'bg-blue-950/70 border-blue-500 shadow-md ring-1 ring-blue-400'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 text-slate-300'
            }`}
          >
            <span className="text-[11px] font-mono font-bold text-blue-400 block">🔵 Future Runway Target</span>
            <span className="text-[10px] text-slate-400">Eligible in future cohorts</span>
          </button>

          <button
            onClick={() => setMatrixFilter(matrixFilter === 'PURPLE' ? 'all' : 'PURPLE')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              matrixFilter === 'PURPLE'
                ? 'bg-purple-950/70 border-purple-500 shadow-md ring-1 ring-purple-400'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 text-slate-300'
            }`}
          >
            <span className="text-[11px] font-mono font-bold text-purple-400 block">🟣 All Years Open</span>
            <span className="text-[10px] text-slate-400">Universal corporate tracks</span>
          </button>

          <button
            onClick={() => setMatrixFilter(matrixFilter === 'GREY' ? 'all' : 'GREY')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              matrixFilter === 'GREY'
                ? 'bg-slate-800 border-slate-500 shadow-md ring-1 ring-slate-400'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 text-slate-300'
            }`}
          >
            <span className="text-[11px] font-mono font-bold text-slate-400 block">⚪ Cohort Window Passed</span>
            <span className="text-[10px] text-slate-400">Targeted at earlier cohorts</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-blue-500 text-blue-200 text-xs font-mono font-bold shadow-2xl animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Opportunity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleCycles.map(cycle => {
          const statusBadge = getStatusBadgeConfig(cycle.currentStatus);
          const StatusIcon = statusBadge.icon;
          const matrixEvaluation = evaluateEligibilityMatrix(cycle, studentBatch, referenceDate);
          const isTracked = trackedCycleIds.includes(cycle.id);
          const calendarUrl = createGoogleCalendarUrl(cycle, referenceDate);
          const isReminderSet = reminderAddedMap[cycle.id];

          return (
            <div
              key={cycle.id}
              className={`rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between relative overflow-hidden group ${
                isTracked
                  ? 'bg-slate-900/90 border-blue-500/80 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/30'
                  : 'bg-slate-900/70 border-slate-800 hover:border-blue-500/40 hover:bg-slate-900/90 hover:shadow-md hover:shadow-blue-950/30'
              }`}
            >
              <div>
                {/* Top Company & Status Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CompanyLogo
                      name={cycle.companyName}
                      domain={cycle.companyDomain}
                      logoUrl={cycle.companyLogo}
                      size="md"
                    />
                    <div>
                      <h4 className="text-base font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
                        {cycle.companyName}
                      </h4>
                      <p className="text-xs text-slate-300 font-medium line-clamp-1">
                        {cycle.programTitle}
                      </p>
                    </div>
                  </div>

                  <div className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border shrink-0 flex items-center gap-1.5 ${statusBadge.containerClass}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
                    <StatusIcon className="w-3 h-3" />
                    <span>{statusBadge.label}</span>
                  </div>
                </div>

                {/* Country Pill, Study Level Badge, Coverage Type Badge, Tier Badge, Rate Tag */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800/90 text-blue-300 border border-blue-900/60 flex items-center gap-1 shadow-sm">
                    <MapPin className="w-2.5 h-2.5 text-blue-400" />
                    <span>{getCountryFlag(cycle.country)} {cycle.country}</span>
                  </span>

                  {/* Prompt 37: Study Level Badge */}
                  {cycle.studyLevel && (() => {
                    const levelBadge = getStudyLevelBadgeConfig(cycle.studyLevel);
                    const LevelIcon = levelBadge.icon;
                    return (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm ${levelBadge.className}`}>
                        <LevelIcon className="w-3 h-3" />
                        <span>{levelBadge.label}</span>
                      </span>
                    );
                  })()}

                  {/* Prompt 37: Coverage Type Badge */}
                  {cycle.coverageType && (() => {
                    const covBadge = getCoverageTypeBadgeConfig(cycle.coverageType);
                    const CovIcon = covBadge.icon;
                    return (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm ${covBadge.className}`}>
                        <CovIcon className="w-3 h-3" />
                        <span>{covBadge.label}</span>
                      </span>
                    );
                  })()}

                  {cycle.tierCategory === 'tech_giant' && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-sky-950/80 text-sky-300 border border-sky-800/60 flex items-center gap-1">
                      <Building2 className="w-2.5 h-2.5 text-sky-400" />
                      Big Tech
                    </span>
                  )}
                  {cycle.tierCategory === 'quant_hft' && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-amber-950/80 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5 text-amber-400" />
                      Quant / HFT
                    </span>
                  )}
                  {cycle.tierCategory === 'frontier_ai' && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-violet-950/80 text-violet-300 border border-violet-800/60 flex items-center gap-1">
                      <Cpu className="w-2.5 h-2.5 text-violet-400" />
                      Frontier AI
                    </span>
                  )}
                  {cycle.tierCategory === 'early_undergrad_exclusive' && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                      1st/2nd Yr Freshers
                    </span>
                  )}

                  {cycle.rateType === 'OFFICIAL_CONFIRMED' ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-emerald-950/90 text-emerald-300 border border-emerald-500/70 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      [OFFICIAL EXACT RATE]
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-amber-950/90 text-amber-300 border border-amber-500/70 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-400" />
                      [MARKET ESTIMATED RANGE]
                    </span>
                  )}
                </div>

                {/* 4-Badge Eligibility Matrix Banner */}
                <div className={`mt-3 p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${matrixEvaluation.containerClass}`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="shrink-0 p-1.5 rounded-lg bg-slate-950/70 border border-slate-800">
                      {matrixEvaluation.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-black ${matrixEvaluation.badgeClass}`}>
                          {matrixEvaluation.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono opacity-90 block mt-1 leading-snug">
                        {matrixEvaluation.subtext}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block pl-2 border-l border-slate-800/80">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">Target Cohort</span>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {cycle.targetBatches ? cycle.targetBatches.join(', ') : 'All'}
                    </span>
                  </div>
                </div>

                {/* Application Window & Compensation Stats */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Application Window</span>
                    <span className="text-xs font-mono font-bold text-blue-300 block mt-0.5">
                      📅 {cycle.exactWindowText || cycle.expectedAnnouncementMonth}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                      {cycle.expectedWindowDuration}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Verified Comp</span>
                    <span className="text-xs font-mono font-bold text-emerald-300 block mt-0.5">
                      💰 {cycle.historicalCompensation}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                      {cycle.historicalAssessmentPlatform}
                    </span>
                  </div>
                </div>

                {/* Preparation Topics */}
                {cycle.keyPreparationTopics && cycle.keyPreparationTopics.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Key Technical Focus
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cycle.keyPreparationTopics.map((topic, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Tip */}
                {cycle.actionTip && (
                  <div className="mt-2.5 p-2 rounded-lg bg-blue-950/20 border border-blue-900/40 text-[11px] font-mono text-blue-200 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{cycle.actionTip}</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleTrack(cycle)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isTracked
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-950'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700'
                    }`}
                    title={isTracked ? 'Remove from Tracked Radar' : 'Track on priority radar'}
                  >
                    <Star className={`w-3.5 h-3.5 ${isTracked ? 'fill-white text-white' : 'text-amber-400'}`} />
                    <span>{isTracked ? 'Tracked' : 'Track'}</span>
                  </button>

                  <a
                    href={calendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleAddCalendarReminder(cycle)}
                    className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer flex items-center justify-center ${
                      isReminderSet
                        ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                    title="Add opening/deadline alert to Google Calendar"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-blue-400" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <LinkHealthBadge url={cycle.officialCareersUrl} companyDomain={cycle.companyDomain} compact />
                  <a
                    href={UrlHealthResolver.resolveSafePortalUrl(cycle.officialCareersUrl, cycle.companyDomain, cycle.companyName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-mono font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-blue-950 group/btn"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Load More */}
      {visibleCount < filteredCycles.length && (
        <div className="pt-4 text-center">
          <button
            onClick={() => setVisibleCount(prev => prev + 16)}
            className="px-5 py-2.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-600/60 text-blue-200 text-xs font-mono font-bold transition-all cursor-pointer shadow-md shadow-blue-950"
          >
            Load More Corporate Roles ({filteredCycles.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {filteredCycles.length === 0 && (
        <div className="py-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-300 font-mono">No matching corporate roles</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Try adjusting your country filter, recruitment month, or search query.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedMonth('all');
              setSelectedCountry('all');
              setSearchQuery('');
              setActiveStatusTab('ALL');
              setMatrixFilter('all');
            }}
            className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold cursor-pointer"
          >
            Reset Corporate Filters
          </button>
        </div>
      )}
    </div>
  );
};

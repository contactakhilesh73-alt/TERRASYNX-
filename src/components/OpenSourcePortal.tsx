/**
 * TERRASYNX: Open Source Programs Dedicated Portal Component (Prompt 34E)
 * 
 * Exclusively displays Open Source Programs:
 * - Categories: open_source_grant (Outreachy, GSoC, LFX, MLH, Season of Docs)
 * - Strictly NO corporate internships, scholarships, or research entries rendered.
 * - Purple accent theme & "Open Source Programs" prominent title.
 * - Own status tabs, month filter, country filter, and 4-badge matrix.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { UpcomingInternshipCycle, InternshipCycleCurrentStatus, StudentProfile } from '../types';
import { UpcomingInternshipsService, detectNaturalSynonymHint } from '../services/upcomingInternshipsService';
import { UrlHealthResolver } from '../services/urlHealthResolver';
import { CalendarSyncService } from '../services/calendarSyncService';
import { CompanyLogo } from './CompanyLogo';
import { getCountryFlag, createGoogleCalendarUrl, evaluateEligibilityMatrix, MatrixBadgeType } from './UpcomingInternshipsCalendar';
import { 
  GitBranch, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  Search, 
  RotateCcw,
  Star,
  Radio,
  MapPin,
  CalendarPlus,
  CalendarClock,
  History,
  Info,
  X,
  Bookmark,
  Terminal,
  Code2,
  DollarSign
} from 'lucide-react';

interface OpenSourcePortalProps {
  onNavigateToCalendar?: () => void;
  studentProfile?: StudentProfile;
}

export type OpenSourceStatusTab = 'ALL' | 'OPEN_NOW' | 'OPENING_SOON' | 'UPCOMING_SEASON' | 'PASSED_THIS_CYCLE' | 'TRACKED';

export type OpenSourceProgramFilter = 'all' | 'outreachy' | 'gsoc' | 'lfx' | 'mlh' | 'gsod';

const CORPORATE_TIERS = new Set(['tech_giant', 'quant_hft', 'frontier_ai', 'early_undergrad_exclusive']);

export const OpenSourcePortal: React.FC<OpenSourcePortalProps> = ({
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
  const [activeStatusTab, setActiveStatusTab] = useState<OpenSourceStatusTab>('OPEN_NOW');
  const [selectedProgram, setSelectedProgram] = useState<OpenSourceProgramFilter>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  // Tracked Open Source programs state (persisted in localStorage)
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
    { key: 'january', label: 'January' },
    { key: 'february', label: 'February' },
    { key: 'march', label: 'March' },
    { key: 'april', label: 'April' },
    { key: 'may', label: 'May' },
    { key: 'june', label: 'June' },
    { key: 'july', label: 'July' },
    { key: 'august', label: 'August' },
    { key: 'september', label: 'September' },
    { key: 'october', label: 'October' },
    { key: 'november', label: 'November' },
    { key: 'december', label: 'December' },
  ];

  // Prompt 34E: STRICT OPEN SOURCE BASE DATASET
  // Shows ONLY open_source_grant entries (Outreachy, GSoC, LFX, MLH, Season of Docs).
  // Strictly NO corporate internships, scholarships, or research entries rendered.
  const openSourceCycles = useMemo(() => {
    const raw = UpcomingInternshipsService.getAllUpcomingCycles(referenceDate);
    return raw.filter(cycle => {
      const isOpenSource = (
        cycle.tierCategory === 'open_source_grant' ||
        cycle.programCategory === 'open_source_grant' ||
        cycle.hiringCycleType === 'open_source_grant'
      );

      // Exclude scholarships
      const isScholarship = Boolean(
        cycle.isGlobalFullRide ||
        cycle.isPreUniversityFullRide ||
        cycle.programCategory === 'scholarship' ||
        cycle.programCategory === 'early_career_12th' ||
        cycle.tierCategory === 'pre_university_full_ride'
      );

      // Exclude corporate internships
      const isCorporate = cycle.tierCategory && CORPORATE_TIERS.has(cycle.tierCategory);

      // Exclude scientific research labs
      const isResearch = (
        cycle.tierCategory === 'scientific_lab' ||
        cycle.tierCategory === 'academic_fellowship' ||
        cycle.programCategory === 'scientific_lab' ||
        cycle.programCategory === 'academic_fellowship'
      );

      return isOpenSource && !isScholarship && !isCorporate && !isResearch;
    });
  }, [referenceDate]);

  // Dynamic distinct country counts from the open source dataset
  const countryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cycle of openSourceCycles) {
      const c = cycle.country?.trim() || 'Global/Remote';
      counts[c] = (counts[c] || 0) + 1;
    }
    return counts;
  }, [openSourceCycles]);

  const distinctCountries = useMemo(() => {
    return Object.keys(countryCounts).sort();
  }, [countryCounts]);

  // Helper to determine specific program identifier
  const getProgramKey = (cycle: UpcomingInternshipCycle): OpenSourceProgramFilter => {
    const name = (cycle.companyName || '').toLowerCase();
    const title = (cycle.programTitle || '').toLowerCase();

    if (name.includes('outreachy') || title.includes('outreachy')) return 'outreachy';
    if (name.includes('summer of code') || title.includes('gsoc')) return 'gsoc';
    if (name.includes('linux foundation') || name.includes('lfx') || title.includes('lfx')) return 'lfx';
    if (name.includes('major league hacking') || name.includes('mlh') || title.includes('mlh')) return 'mlh';
    if (name.includes('season of docs') || title.includes('season of docs') || title.includes('gsod')) return 'gsod';
    return 'all';
  };

  // Program counts for chips
  const programCounts = useMemo(() => {
    let outreachy = 0;
    let gsoc = 0;
    let lfx = 0;
    let mlh = 0;
    let gsod = 0;

    for (const cycle of openSourceCycles) {
      const key = getProgramKey(cycle);
      if (key === 'outreachy') outreachy++;
      else if (key === 'gsoc') gsoc++;
      else if (key === 'lfx') lfx++;
      else if (key === 'mlh') mlh++;
      else if (key === 'gsod') gsod++;
    }

    return {
      all: openSourceCycles.length,
      outreachy,
      gsoc,
      lfx,
      mlh,
      gsod,
    };
  }, [openSourceCycles]);

  // Status Strip Counts for open source programs
  const statusStripCounts = useMemo(() => {
    let list = openSourceCycles;
    if (selectedProgram !== 'all') {
      list = list.filter(c => getProgramKey(c) === selectedProgram);
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

    return {
      ALL: list.length,
      OPEN_NOW: list.filter(c => c.currentStatus === 'OPEN_NOW').length,
      OPENING_SOON: list.filter(c => c.currentStatus === 'UPCOMING' && (c.daysRemaining !== undefined && c.daysRemaining <= 30)).length,
      UPCOMING_SEASON: list.filter(c => c.currentStatus === 'UPCOMING' && (c.daysRemaining === undefined || c.daysRemaining > 30)).length,
      PASSED_THIS_CYCLE: list.filter(c => c.currentStatus === 'PASSED_THIS_CYCLE').length,
      TRACKED: list.filter(c => trackedCycleIds.includes(c.id)).length,
    };
  }, [openSourceCycles, selectedProgram, selectedMonth, selectedCountry, searchQuery, trackedCycleIds]);

  // Filtered open source cycles
  const filteredCycles = useMemo(() => {
    let list = openSourceCycles;

    if (selectedProgram !== 'all') {
      list = list.filter(c => getProgramKey(c) === selectedProgram);
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
  }, [openSourceCycles, selectedProgram, selectedMonth, selectedCountry, searchQuery, activeStatusTab, matrixFilter, studentBatch, referenceDate, trackedCycleIds]);

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
      const eventTitle = `[OPEN SOURCE WINDOW] ${cycle.companyName} ${cycle.programTitle}`;
      CalendarSyncService.addCustomEvent({
        id: `cal_os_${cycle.id}_${now}`,
        opportunityId: cycle.id,
        companyName: cycle.companyName,
        companyDomain: cycle.companyDomain,
        jobTitle: cycle.programTitle,
        eventType: 'follow_up_deadline',
        title: eventTitle,
        description: `Open source program deadline & proposal window for ${cycle.companyName} (${cycle.exactWindowText || cycle.expectedAnnouncementMonth}). Target batches: ${cycle.targetBatches.join(', ')}. Official portal: ${cycle.officialCareersUrl}`,
        startTime: now + (cycle.prepTimeRemainingMonths * 30 * 24 * 60 * 60 * 1000),
        endTime: now + (cycle.prepTimeRemainingMonths * 30 * 24 * 60 * 60 * 1000) + 3600000,
        durationMinutes: 60,
        platform: 'Official Open-Source Portal',
        meetingLink: cycle.officialCareersUrl,
        status: 'scheduled',
        preparationChecklist: [
          `Review project repository & open issues: ${cycle.keyPreparationTopics?.join(', ') || 'Git Workflow, Pull Requests'}`,
          `Check official foundation guidelines: ${cycle.officialCareersUrl}`,
          `Draft contributor proposal and reach out to mentors`
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
          containerClass: 'bg-purple-950/60 text-purple-300 border-purple-600/80',
          dotColor: 'bg-purple-400',
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
      
      {/* Prompt 34E: Strategic Runway Hero Banner with Purple Accent Color */}
      <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-950 p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5 shadow-sm shadow-purple-950">
                <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                GLOBAL OPEN SOURCE GRANTS &amp; FELLOWSHIPS
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                <Info className="w-3 h-3 text-purple-400" />
                No Degree Barrier • Open to All Years
              </span>
            </div>
            
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-400 flex items-center gap-2">
              Open Source Programs
            </h2>
            
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Exclusively tracking premier global open-source paid contribution programs and grants: Outreachy Remote Paid Internship, Google Summer of Code (GSoC), Linux Foundation (LFX) Mentorship, Major League Hacking (MLH) Fellowship, and Google Season of Docs (GSoD). High-stipend remote contributor fellowships open across all degree levels.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-900/90 border border-purple-900/50 rounded-xl px-4 py-3 text-center shadow-lg shadow-purple-950/40">
              <span className="block text-2xl font-black font-mono text-purple-400">
                {openSourceCycles.length}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Grant Programs
              </span>
            </div>
            {onNavigateToCalendar && (
              <button
                onClick={onNavigateToCalendar}
                className="px-3.5 py-2.5 bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-600/60 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>View My Calendar</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Date Precision & Simulator Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${isSimulatingDate ? 'bg-amber-400 animate-ping' : 'bg-purple-400 animate-pulse'}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-300">
                  Current Viewing Date:
                </span>
                <span className={`text-xs font-mono font-black px-2 py-0.5 rounded border ${
                  isSimulatingDate 
                    ? 'bg-amber-950/80 text-amber-300 border-amber-600' 
                    : 'bg-purple-950/80 text-purple-300 border-purple-700'
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
                Evaluates proposal submission windows and contributor initial application deadlines.
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
                  ? 'bg-purple-600 text-white shadow-sm font-black'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Today (Live)</span>
            </button>
            <button
              onClick={() => handleSetSimulatedDate(2026, 1, 20)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                isSimulatingDate && referenceDate.getDate() === 20 && referenceDate.getMonth() === 0
                  ? 'bg-purple-600 text-white font-black shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              20 Jan (LFX &amp; Outreachy)
            </button>
            <button
              onClick={() => handleSetSimulatedDate(2026, 3, 25)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                isSimulatingDate && referenceDate.getDate() === 25 && referenceDate.getMonth() === 2
                  ? 'bg-purple-600 text-white font-black shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              25 Mar (GSoC Proposals)
            </button>
          </div>
        </div>

        {/* Status Tabs: Open Now / Upcoming / Passed / Tracked / All */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Live Status Strip
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                Open Source Proposal Window Watch
              </span>
            </div>
            {trackedCycleIds.length > 0 && (
              <span className="text-[11px] font-mono text-purple-300 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{trackedCycleIds.length} Programs on Radar</span>
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
              <span className="text-[10px] text-slate-400 line-clamp-1">Proposals active</span>
            </button>

            {/* Strip 2: Opening Soon (<30 Days) */}
            <button
              onClick={() => setActiveStatusTab('OPENING_SOON')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeStatusTab === 'OPENING_SOON'
                  ? 'bg-purple-950/70 border-purple-500 shadow-lg shadow-purple-950/50 ring-1 ring-purple-400/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                  <span className={`text-[11px] font-mono font-bold ${activeStatusTab === 'OPENING_SOON' ? 'text-purple-300' : 'text-slate-200'}`}>
                    Opening Soon
                  </span>
                </div>
                <span className={`text-xs font-mono font-black px-1.5 py-0.5 rounded ${
                  activeStatusTab === 'OPENING_SOON'
                    ? 'bg-purple-900 text-purple-200 border border-purple-600'
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
                  ? 'bg-purple-950/80 border-purple-500 shadow-lg shadow-purple-950/50 ring-1 ring-purple-400/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className={`text-[11px] font-mono font-bold ${activeStatusTab === 'UPCOMING_SEASON' ? 'text-purple-300' : 'text-slate-200'}`}>
                    Upcoming Cycle
                  </span>
                </div>
                <span className={`text-xs font-mono font-black px-1.5 py-0.5 rounded ${
                  activeStatusTab === 'UPCOMING_SEASON'
                    ? 'bg-purple-900 text-purple-200 border border-purple-600'
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
              <span className="text-[10px] text-slate-400 line-clamp-1">Saved programs</span>
            </button>

            {/* Strip 6: All Open Source */}
            <button
              onClick={() => setActiveStatusTab('ALL')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeStatusTab === 'ALL'
                  ? 'bg-purple-950/80 border-purple-500 shadow-lg shadow-purple-950/50 ring-1 ring-purple-400/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <GitBranch className="w-2.5 h-2.5 text-purple-400" />
                  <span className={`text-[11px] font-mono font-bold ${activeStatusTab === 'ALL' ? 'text-purple-300' : 'text-slate-200'}`}>
                    All Open Source
                  </span>
                </div>
                <span className={`text-xs font-mono font-black px-1.5 py-0.5 rounded ${
                  activeStatusTab === 'ALL'
                    ? 'bg-purple-900 text-purple-200 border border-purple-600'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {statusStripCounts.ALL}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-1">Complete track</span>
            </button>
          </div>
        </div>

        {/* 1-Click Program Filter Chips */}
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Flagship Programs</span>
            </span>
            <div className="text-[11px] font-mono text-slate-400">
              Showing <span className="font-bold text-slate-200">{filteredCycles.length}</span> of <span className="font-bold text-slate-200">{openSourceCycles.length}</span> programs
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedProgram('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedProgram === 'all'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>All Open Source ({programCounts.all})</span>
            </button>

            <button
              onClick={() => setSelectedProgram('outreachy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedProgram === 'outreachy'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-md shadow-purple-500/25 ring-1 ring-purple-300'
                  : 'bg-purple-950/30 text-purple-300 hover:bg-purple-950/60 border border-purple-800/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Outreachy ({programCounts.outreachy})</span>
            </button>

            <button
              onClick={() => setSelectedProgram('gsoc')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedProgram === 'gsoc'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black shadow-md shadow-indigo-500/30 ring-1 ring-indigo-300'
                  : 'bg-indigo-950/30 text-indigo-300 hover:bg-indigo-950/60 border border-indigo-800/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Google Summer of Code ({programCounts.gsoc})</span>
            </button>

            <button
              onClick={() => setSelectedProgram('lfx')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedProgram === 'lfx'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black shadow-md shadow-violet-600/25 ring-1 ring-violet-300'
                  : 'bg-violet-950/30 text-violet-300 hover:bg-violet-950/60 border border-violet-800/50'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-violet-400" />
              <span>Linux Foundation LFX ({programCounts.lfx})</span>
            </button>

            <button
              onClick={() => setSelectedProgram('mlh')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedProgram === 'mlh'
                  ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-black shadow-md shadow-fuchsia-600/25 ring-1 ring-fuchsia-300'
                  : 'bg-fuchsia-950/30 text-fuchsia-300 hover:bg-fuchsia-950/60 border border-fuchsia-800/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>MLH Fellowship ({programCounts.mlh})</span>
            </button>

            <button
              onClick={() => setSelectedProgram('gsod')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedProgram === 'gsod'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black shadow-md shadow-purple-600/25 ring-1 ring-purple-300'
                  : 'bg-pink-950/30 text-pink-300 hover:bg-pink-950/60 border border-pink-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Google Season of Docs ({programCounts.gsod})</span>
            </button>
          </div>
        </div>

        {/* Remote & Country Filter Strip */}
        <div className="mt-3 pt-3 border-t border-slate-800/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-purple-400" />
                <span>Work Location &amp; Jurisdiction</span>
              </span>
              {selectedCountry !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCountry('all')}
                  className="text-[10px] font-mono text-purple-400 hover:text-purple-300 bg-purple-950/60 hover:bg-purple-900/60 px-2 py-0.5 rounded border border-purple-700/60 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Reset country filter to All"
                >
                  <span>Reset to All</span>
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] font-mono text-slate-400">Location:</span>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                aria-label="Filter by Location"
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-purple-300 focus:outline-none focus:border-purple-400 cursor-pointer shadow-sm"
              >
                <option value="all">All Locations ({openSourceCycles.length})</option>
                {distinctCountries.map(country => (
                  <option key={country} value={country}>
                    {getCountryFlag(country)} {country} ({countryCounts[country] || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 py-1">
            <button
              onClick={() => setSelectedCountry('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCountry === 'all'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25 ring-1 ring-purple-300'
                  : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <span>🌐 All Locations</span>
              <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                selectedCountry === 'all' ? 'bg-purple-700/80 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {openSourceCycles.length}
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
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-500/30 ring-1 ring-purple-300'
                      : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                  }`}
                  title={`Filter to programs in ${country} (${count} programs)`}
                >
                  <span>{getCountryFlag(country)}</span>
                  <span>{country}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected
                      ? 'bg-purple-950 text-purple-200 border border-purple-400/50'
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
              placeholder="Search open-source programs (Outreachy, GSoC, LFX, MLH, Python, Rust, Cloud Native)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/80 transition-all font-mono"
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
            <span className="text-[11px] font-mono text-slate-400">Proposal Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-purple-300 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {monthsList.map(m => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {naturalSynonymHint && (
          <div className="mt-2 text-[11px] font-mono text-purple-300 bg-purple-950/40 border border-purple-800/40 px-2.5 py-1 rounded-lg">
            {naturalSynonymHint}
          </div>
        )}
      </div>

      {/* 4-Badge Matrix Filter Strip */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block">
                Open Source Universal Eligibility Evaluator
              </span>
              <span className="text-[10px] text-slate-400">
                Most open-source programs have no strict university degree requirements.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">My Cohort:</span>
            <select
              value={studentBatch}
              onChange={(e) => {
                const val = e.target.value;
                setStudentBatch(val === 'all' || val === 'class_12' ? val : Number(val));
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-purple-300 focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              <option value="all">All Cohorts (Universal View)</option>
              <option value="class_12">Class 12th / Pre-University</option>
              <option value="2027">2027 (Pre-Final Year / Benchmark)</option>
              <option value="2028">2028 (Sophomore / 2nd Year)</option>
              <option value="2029">2029 (Fresher / 1st Year)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          <button
            onClick={() => setMatrixFilter(matrixFilter === 'PURPLE' ? 'all' : 'PURPLE')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              matrixFilter === 'PURPLE'
                ? 'bg-purple-950/70 border-purple-500 shadow-md ring-1 ring-purple-400'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 text-slate-300'
            }`}
          >
            <span className="text-[11px] font-mono font-bold text-purple-400 block">🟣 Universal / All Cohorts</span>
            <span className="text-[10px] text-slate-400">No rigid university restrictions</span>
          </button>

          <button
            onClick={() => setMatrixFilter(matrixFilter === 'GREEN' ? 'all' : 'GREEN')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              matrixFilter === 'GREEN'
                ? 'bg-emerald-950/70 border-emerald-500 shadow-md ring-1 ring-emerald-400'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 text-slate-300'
            }`}
          >
            <span className="text-[11px] font-mono font-bold text-emerald-400 block">🟢 Eligible Now</span>
            <span className="text-[10px] text-slate-400">Directly eligible for current batch</span>
          </button>

          <button
            onClick={() => setMatrixFilter(matrixFilter === 'BLUE' ? 'all' : 'BLUE')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              matrixFilter === 'BLUE'
                ? 'bg-blue-950/70 border-blue-500 shadow-md ring-1 ring-blue-400'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 text-slate-300'
            }`}
          >
            <span className="text-[11px] font-mono font-bold text-blue-400 block">🔵 Future Target</span>
            <span className="text-[10px] text-slate-400">Future runway targets</span>
          </button>

          <button
            onClick={() => setMatrixFilter(matrixFilter === 'GREY' ? 'all' : 'GREY')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              matrixFilter === 'GREY'
                ? 'bg-slate-800 border-slate-500 shadow-md ring-1 ring-slate-400'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 text-slate-300'
            }`}
          >
            <span className="text-[11px] font-mono font-bold text-slate-400 block">⚪ Window Passed</span>
            <span className="text-[10px] text-slate-400">Proposal cycle closed</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-purple-500 text-purple-200 text-xs font-mono font-bold shadow-2xl animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Opportunity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCycles.map(cycle => {
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
                  ? 'bg-slate-900/90 border-purple-500/80 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/30'
                  : 'bg-slate-900/70 border-slate-800 hover:border-purple-500/40 hover:bg-slate-900/90 hover:shadow-md hover:shadow-purple-950/30'
              }`}
            >
              <div>
                {/* Top Foundation & Status Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CompanyLogo
                      name={cycle.companyName}
                      domain={cycle.companyDomain}
                      logoUrl={cycle.companyLogo}
                      size="md"
                    />
                    <div>
                      <h4 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
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

                {/* Remote Pill, Tier Badge, Stipend Tag */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800/90 text-purple-300 border border-purple-900/60 flex items-center gap-1 shadow-sm">
                    <MapPin className="w-2.5 h-2.5 text-purple-400" />
                    <span>{getCountryFlag(cycle.country)} {cycle.country}</span>
                  </span>

                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-purple-950/80 text-purple-300 border border-purple-800/60 flex items-center gap-1">
                    <GitBranch className="w-3 h-3 text-purple-400" />
                    <span>Open-Source Grant</span>
                  </span>

                  {cycle.historicalCompensation && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-emerald-300 border border-emerald-900/40">
                      💰 {cycle.historicalCompensation}
                    </span>
                  )}
                </div>

                {/* Announcement Timeline & Target Batches */}
                <div className="mt-3 space-y-1.5 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>Application / Proposal Window:</span>
                    </span>
                    <span className="text-slate-200 font-bold text-right">
                      {cycle.exactWindowText || cycle.expectedAnnouncementMonth}
                    </span>
                  </div>

                  {cycle.daysRemaining !== undefined && cycle.currentStatus === 'UPCOMING' && (
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        <span>Countdown:</span>
                      </span>
                      <span className="text-purple-400 font-bold">
                        Opens in ~{cycle.daysRemaining} days
                      </span>
                    </div>
                  )}

                  {cycle.targetBatches && cycle.targetBatches.length > 0 && (
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Target Cohorts:</span>
                      <span className="text-slate-300">
                        {cycle.targetBatches.map(b => b === 12 ? 'Class 12th' : `Batch ${b}`).join(', ')}
                      </span>
                    </div>
                  )}

                  {cycle.eligibilityCriteria && (
                    <div className="text-[11px] text-slate-300 font-mono pt-1 border-t border-slate-800/60">
                      <span className="text-purple-400 font-bold">Eligibility: </span>
                      <span>{cycle.eligibilityCriteria}</span>
                    </div>
                  )}
                </div>

                {/* Key Preparation Topics */}
                {cycle.keyPreparationTopics && cycle.keyPreparationTopics.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">
                      Key Technical Focus &amp; Workflow:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cycle.keyPreparationTopics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700/60"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4-Badge Matrix Cohort Comparison */}
                <div className="mt-3">
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${matrixEvaluation.containerClass}`}>
                    <div className="flex items-center gap-2">
                      {matrixEvaluation.icon}
                      <div>
                        <span className="text-xs font-mono font-bold block">
                          {matrixEvaluation.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {matrixEvaluation.subtext}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 ${matrixEvaluation.badgeClass}`}>
                      {matrixEvaluation.badgeShort}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleTrack(cycle)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isTracked
                        ? 'bg-purple-950/80 text-purple-300 border-purple-600 shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                    }`}
                    title={isTracked ? 'Remove from Tracked Radar' : 'Track in My Radar'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isTracked ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                    <span>{isTracked ? 'Tracked' : 'Track'}</span>
                  </button>

                  <button
                    onClick={() => handleAddCalendarReminder(cycle)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                      isReminderSet
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                    title="Add reminder to in-app calendar"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-purple-400" />
                    <span>{isReminderSet ? 'Synced' : 'Remind'}</span>
                  </button>

                  <a
                    href={calendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Add opening/deadline alert to Google Calendar"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-purple-400" />
                  </a>
                </div>

                <a
                  href={UrlHealthResolver.resolveSafePortalUrl(cycle.officialCareersUrl, cycle.companyDomain, cycle.companyName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-purple-950 group/btn"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

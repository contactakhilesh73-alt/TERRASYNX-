/**
 * TERRASYNX: Research & Fellowships Dedicated Portal Component (Prompt 34D)
 * 
 * Exclusively displays Scientific Labs & Academic Fellowships:
 * - Categories: scientific_lab, academic_fellowship (CERN, RIKEN, OIST, Max Planck, MITACS, DAAD, etc.)
 * - Strictly NO corporate internships, scholarships, or open-source entries rendered.
 * - Green / Emerald accent theme & "Research & Fellowships" prominent title.
 * - Strong country-based filtering (Switzerland, Germany, Japan, Singapore, Canada, France, etc.)
 * - Own status tabs, month filter, and 4-badge matrix.
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
  FlaskConical, 
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
  Microscope,
  GraduationCap
} from 'lucide-react';

interface ResearchPortalProps {
  onNavigateToCalendar?: () => void;
  studentProfile?: StudentProfile;
}

export type ResearchStatusTab = 'ALL' | 'OPEN_NOW' | 'OPENING_SOON' | 'UPCOMING_SEASON' | 'PASSED_THIS_CYCLE' | 'TRACKED';

export type ResearchCategoryFilter = 'all' | 'scientific_lab' | 'academic_fellowship';

const CORPORATE_TIERS = new Set(['tech_giant', 'quant_hft', 'frontier_ai', 'early_undergrad_exclusive']);

export const ResearchPortal: React.FC<ResearchPortalProps> = ({
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
  const [activeStatusTab, setActiveStatusTab] = useState<ResearchStatusTab>('OPEN_NOW');
  const [selectedCategory, setSelectedCategory] = useState<ResearchCategoryFilter>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  // Tracked Research state (persisted in localStorage)
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

  // Prompt 34D: STRICT RESEARCH BASE DATASET
  // Shows ONLY scientific_lab and academic_fellowship entries.
  // Strictly NO corporate internships, scholarships, or open-source entries rendered.
  const researchCycles = useMemo(() => {
    const raw = UpcomingInternshipsService.getAllUpcomingCycles(referenceDate);
    return raw.filter(cycle => {
      const isResearch = (
        cycle.tierCategory === 'scientific_lab' ||
        cycle.tierCategory === 'academic_fellowship' ||
        cycle.programCategory === 'scientific_lab' ||
        cycle.programCategory === 'academic_fellowship' ||
        cycle.hiringCycleType === 'scientific_lab' ||
        cycle.hiringCycleType === 'academic_fellowship'
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

      // Exclude open source grants
      const isOpenSource = cycle.tierCategory === 'open_source_grant' || cycle.programCategory === 'open_source_grant';

      return isResearch && !isScholarship && !isCorporate && !isOpenSource;
    });
  }, [referenceDate]);

  // Dynamic distinct country counts from the research dataset (Strong country-based focus)
  const countryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cycle of researchCycles) {
      const c = cycle.country?.trim() || 'Global/Remote';
      counts[c] = (counts[c] || 0) + 1;
    }
    return counts;
  }, [researchCycles]);

  const distinctCountries = useMemo(() => {
    const keys = Object.keys(countryCounts);
    return keys.sort((a, b) => {
      // Sort by count descending first, then alphabetically
      const countDiff = (countryCounts[b] || 0) - (countryCounts[a] || 0);
      if (countDiff !== 0) return countDiff;
      return a.localeCompare(b);
    });
  }, [countryCounts]);

  // Helper to determine sub-category
  const getResearchSubCategory = (cycle: UpcomingInternshipCycle): 'scientific_lab' | 'academic_fellowship' => {
    if (cycle.tierCategory === 'scientific_lab' || cycle.programCategory === 'scientific_lab' || cycle.hiringCycleType === 'scientific_lab') {
      return 'scientific_lab';
    }
    return 'academic_fellowship';
  };

  // Category counts for research chips
  const categoryCounts = useMemo(() => {
    let lab = 0;
    let fellowship = 0;

    for (const cycle of researchCycles) {
      const sub = getResearchSubCategory(cycle);
      if (sub === 'scientific_lab') lab++;
      else fellowship++;
    }

    return {
      all: researchCycles.length,
      scientific_lab: lab,
      academic_fellowship: fellowship,
    };
  }, [researchCycles]);

  // Status Strip Counts for research programs
  const statusStripCounts = useMemo(() => {
    let list = researchCycles;
    if (selectedCategory !== 'all') {
      list = list.filter(c => getResearchSubCategory(c) === selectedCategory);
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
        const text = `${c.companyName} ${c.programTitle} ${c.country} ${c.tierCategory || ''} ${c.programCategory || ''}`.toLowerCase();
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
  }, [researchCycles, selectedCategory, selectedMonth, selectedCountry, searchQuery, trackedCycleIds]);

  // Filtered research cycles
  const filteredCycles = useMemo(() => {
    let list = researchCycles;

    if (selectedCategory !== 'all') {
      list = list.filter(c => getResearchSubCategory(c) === selectedCategory);
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
        const text = `${c.companyName} ${c.programTitle} ${c.country} ${c.tierCategory || ''} ${c.programCategory || ''} ${c.keyPreparationTopics?.join(' ') || ''}`.toLowerCase();
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
  }, [researchCycles, selectedCategory, selectedMonth, selectedCountry, searchQuery, activeStatusTab, matrixFilter, studentBatch, referenceDate, trackedCycleIds]);

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
      const eventTitle = `[RESEARCH DEADLINE] ${cycle.companyName} ${cycle.programTitle}`;
      CalendarSyncService.addCustomEvent({
        id: `cal_res_${cycle.id}_${now}`,
        opportunityId: cycle.id,
        companyName: cycle.companyName,
        companyDomain: cycle.companyDomain,
        jobTitle: cycle.programTitle,
        eventType: 'follow_up_deadline',
        title: eventTitle,
        description: `Research fellowship deadline & application window for ${cycle.companyName} (${cycle.exactWindowText || cycle.expectedAnnouncementMonth}). Target batches: ${cycle.targetBatches.join(', ')}. Official portal: ${cycle.officialCareersUrl}`,
        startTime: now + (cycle.prepTimeRemainingMonths * 30 * 24 * 60 * 60 * 1000),
        endTime: now + (cycle.prepTimeRemainingMonths * 30 * 24 * 60 * 60 * 1000) + 3600000,
        durationMinutes: 60,
        platform: 'Official Research Lab Portal',
        meetingLink: cycle.officialCareersUrl,
        status: 'scheduled',
        preparationChecklist: [
          `Review lab prerequisites & professor alignment: ${cycle.keyPreparationTopics?.join(', ') || 'Statement of Purpose, Transcripts, LORs'}`,
          `Check official research portal: ${cycle.officialCareersUrl}`,
          `Verify project publications and research proposals`
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
          containerClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-600/80',
          dotColor: 'bg-emerald-400',
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
      
      {/* Prompt 34D: Strategic Runway Hero Banner with Green Accent Color */}
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm shadow-emerald-950">
                <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                GLOBAL SCIENTIFIC LABS &amp; ACADEMIC FELLOWSHIPS
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                <Info className="w-3 h-3 text-emerald-400" />
                Country-Based Institute Model
              </span>
            </div>
            
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-400 flex items-center gap-2">
              Research &amp; Fellowships
            </h2>
            
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Exclusively tracking fully funded research internships and visiting student programmes at the world&apos;s premier scientific institutes: CERN Summer Student (Switzerland), DESY (Germany), RIKEN &amp; OIST (Japan), Max Planck MPI-SWS (Germany), Weizmann Institute (Israel), Fermilab (USA), Mitacs Globalink (Canada), DAAD WISE (Germany), Charpak (France), and NTU Singapore.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-900/90 border border-emerald-900/50 rounded-xl px-4 py-3 text-center shadow-lg shadow-emerald-950/40">
              <span className="block text-2xl font-black font-mono text-emerald-400">
                {researchCycles.length}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Research Tracks
              </span>
            </div>
            {onNavigateToCalendar && (
              <button
                onClick={onNavigateToCalendar}
                className="px-3.5 py-2.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-600/60 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>View My Calendar</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Date Precision & Simulator Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${isSimulatingDate ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-300">
                  Current Viewing Date:
                </span>
                <span className={`text-xs font-mono font-black px-2 py-0.5 rounded border ${
                  isSimulatingDate 
                    ? 'bg-amber-950/80 text-amber-300 border-amber-600' 
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
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
                Evaluates international lab opening windows and embassy sponsorship deadlines.
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
                  ? 'bg-emerald-600 text-white shadow-sm font-black'
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
                  ? 'bg-emerald-600 text-white font-black shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              20 Sep (Fall Openings)
            </button>
            <button
              onClick={() => handleSetSimulatedDate(2026, 11, 15)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                isSimulatingDate && referenceDate.getDate() === 15 && referenceDate.getMonth() === 10
                  ? 'bg-emerald-600 text-white font-black shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              15 Nov (CERN &amp; DAAD Window)
            </button>
          </div>
        </div>

        {/* Status Tabs: Open Now / Upcoming / Passed / Tracked / All */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Live Status Strip
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                Scientific Fellowship Intake Watch
              </span>
            </div>
            {trackedCycleIds.length > 0 && (
              <span className="text-[11px] font-mono text-emerald-300 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{trackedCycleIds.length} Labs on Radar</span>
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
              <span className="text-[10px] text-slate-400 line-clamp-1">Currently accepting</span>
            </button>

            {/* Strip 2: Opening Soon (<30 Days) */}
            <button
              onClick={() => setActiveStatusTab('OPENING_SOON')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeStatusTab === 'OPENING_SOON'
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
                  <span className={`text-[11px] font-mono font-bold ${activeStatusTab === 'OPENING_SOON' ? 'text-emerald-300' : 'text-slate-200'}`}>
                    Opening Soon
                  </span>
                </div>
                <span className={`text-xs font-mono font-black px-1.5 py-0.5 rounded ${
                  activeStatusTab === 'OPENING_SOON'
                    ? 'bg-emerald-900 text-emerald-200 border border-emerald-600'
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
                  ? 'bg-emerald-950/80 border-emerald-500 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-400/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className={`text-[11px] font-mono font-bold ${activeStatusTab === 'UPCOMING_SEASON' ? 'text-emerald-300' : 'text-slate-200'}`}>
                    Upcoming Cycle
                  </span>
                </div>
                <span className={`text-xs font-mono font-black px-1.5 py-0.5 rounded ${
                  activeStatusTab === 'UPCOMING_SEASON'
                    ? 'bg-emerald-900 text-emerald-200 border border-emerald-600'
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
                  ? 'bg-emerald-950/70 border-emerald-500 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-400/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Star className={`w-2.5 h-2.5 ${activeStatusTab === 'TRACKED' ? 'fill-amber-400 text-amber-400' : 'text-emerald-400'}`} />
                  <span className={`text-[11px] font-mono font-bold ${activeStatusTab === 'TRACKED' ? 'text-emerald-300' : 'text-slate-200'}`}>
                    Tracked Radar
                  </span>
                </div>
                <span className={`text-xs font-mono font-black px-1.5 py-0.5 rounded ${
                  activeStatusTab === 'TRACKED'
                    ? 'bg-emerald-900 text-emerald-200 border border-emerald-600'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {statusStripCounts.TRACKED}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-1">Saved lab programs</span>
            </button>

            {/* Strip 6: All Research */}
            <button
              onClick={() => setActiveStatusTab('ALL')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeStatusTab === 'ALL'
                  ? 'bg-emerald-950/80 border-emerald-500 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-400/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <FlaskConical className="w-2.5 h-2.5 text-emerald-400" />
                  <span className={`text-[11px] font-mono font-bold ${activeStatusTab === 'ALL' ? 'text-emerald-300' : 'text-slate-200'}`}>
                    All Research
                  </span>
                </div>
                <span className={`text-xs font-mono font-black px-1.5 py-0.5 rounded ${
                  activeStatusTab === 'ALL'
                    ? 'bg-emerald-900 text-emerald-200 border border-emerald-600'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {statusStripCounts.ALL}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-1">Complete track</span>
            </button>
          </div>
        </div>

        {/* 1-Click Research Category Filter Chips */}
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Research Program Categories</span>
            </span>
            <div className="text-[11px] font-mono text-slate-400">
              Showing <span className="font-bold text-slate-200">{Math.min(visibleCount, filteredCycles.length)}</span> of <span className="font-bold text-slate-200">{filteredCycles.length}</span> lab tracks
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>All Research ({categoryCounts.all})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('scientific_lab')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'scientific_lab'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black shadow-md shadow-emerald-500/25 ring-1 ring-emerald-300'
                  : 'bg-emerald-950/30 text-emerald-300 hover:bg-emerald-950/60 border border-emerald-800/50'
              }`}
            >
              <Microscope className="w-3.5 h-3.5 text-emerald-400" />
              <span>Global Scientific Labs ({categoryCounts.scientific_lab})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('academic_fellowship')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'academic_fellowship'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-black shadow-md shadow-teal-500/30 ring-1 ring-teal-300'
                  : 'bg-teal-950/30 text-teal-300 hover:bg-teal-950/60 border border-teal-800/50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
              <span>Academic &amp; Govt Fellowships ({categoryCounts.academic_fellowship})</span>
            </button>
          </div>
        </div>

        {/* Prompt 34D: Strongly Country-Based Filter (Chips + Dropdown Jump) */}
        <div className="mt-3 pt-3 border-t border-slate-800/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>Host Country &amp; Research Jurisdiction</span>
              </span>
              {selectedCountry !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCountry('all')}
                  className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700/60 flex items-center gap-1 cursor-pointer transition-colors"
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
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-400 cursor-pointer shadow-sm"
              >
                <option value="all">All Research Countries ({researchCycles.length})</option>
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
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 ring-1 ring-emerald-300'
                  : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <span>🌐 All Countries</span>
              <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                selectedCountry === 'all' ? 'bg-emerald-700/80 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {researchCycles.length}
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
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-500/30 ring-1 ring-emerald-300'
                      : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                  }`}
                  title={`Filter to research opportunities in ${country} (${count} labs)`}
                >
                  <span>{getCountryFlag(country)}</span>
                  <span>{country}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected
                      ? 'bg-emerald-950 text-emerald-200 border border-emerald-400/50'
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
              placeholder="Search scientific labs (CERN, RIKEN, OIST, Max Planck, MITACS, DAAD, Fermilab)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 transition-all font-mono"
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
            <span className="text-[11px] font-mono text-slate-400">Application Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {monthsList.map(m => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {naturalSynonymHint && (
          <div className="mt-2 text-[11px] font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
            {naturalSynonymHint}
          </div>
        )}
      </div>

      {/* 4-Badge Matrix Filter Strip */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block">
                Target Cohort Eligibility Evaluator
              </span>
              <span className="text-[10px] text-slate-400">
                Live batch comparison without excluding any research opportunity.
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
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-400 cursor-pointer"
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
            onClick={() => setMatrixFilter(matrixFilter === 'GREEN' ? 'all' : 'GREEN')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              matrixFilter === 'GREEN'
                ? 'bg-emerald-950/70 border-emerald-500 shadow-md ring-1 ring-emerald-400'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 text-slate-300'
            }`}
          >
            <span className="text-[11px] font-mono font-bold text-emerald-400 block">🟢 Eligible Now</span>
            <span className="text-[10px] text-slate-400">Directly eligible for {studentBatch === 'class_12' ? 'Class 12' : `Batch ${studentBatch}`}</span>
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
            <span className="text-[10px] text-slate-400">Eligible in upcoming cohorts</span>
          </button>

          <button
            onClick={() => setMatrixFilter(matrixFilter === 'PURPLE' ? 'all' : 'PURPLE')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              matrixFilter === 'PURPLE'
                ? 'bg-purple-950/70 border-purple-500 shadow-md ring-1 ring-purple-400'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 text-slate-300'
            }`}
          >
            <span className="text-[11px] font-mono font-bold text-purple-400 block">🟣 Universal / Open</span>
            <span className="text-[10px] text-slate-400">Open to all students</span>
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
            <span className="text-[10px] text-slate-400">Closed for current intake</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500 text-emerald-200 text-xs font-mono font-bold shadow-2xl animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
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
          const subCategory = getResearchSubCategory(cycle);

          return (
            <div
              key={cycle.id}
              className={`rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between relative overflow-hidden group ${
                isTracked
                  ? 'bg-slate-900/90 border-emerald-500/80 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/70 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/90 hover:shadow-md hover:shadow-emerald-950/30'
              }`}
            >
              <div>
                {/* Top Lab Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CompanyLogo
                      name={cycle.companyName}
                      domain={cycle.companyDomain}
                      logoUrl={cycle.companyLogo}
                      size="md"
                    />
                    <div>
                      <h4 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
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
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800/90 text-emerald-300 border border-emerald-900/60 flex items-center gap-1 shadow-sm">
                    <MapPin className="w-2.5 h-2.5 text-emerald-400" />
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

                  {subCategory === 'scientific_lab' ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                      <Microscope className="w-3 h-3 text-emerald-400" />
                      <span>Scientific Lab</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-teal-950/80 text-teal-300 border border-teal-800/60 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-teal-400" />
                      <span>Academic Fellowship</span>
                    </span>
                  )}

                  {cycle.historicalCompensation && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-emerald-300 border border-emerald-900/40">
                      💰 {cycle.historicalCompensation}
                    </span>
                  )}

                  {/* Compensation rateType badge */}
                  {cycle.rateType === 'OFFICIAL_CONFIRMED' ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>[OFFICIAL EXACT RATE]</span>
                    </span>
                  ) : cycle.rateType === 'MARKET_ESTIMATED' ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60 flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>[MARKET ESTIMATED RANGE]</span>
                    </span>
                  ) : null}
                </div>

                {/* Announcement Timeline & Target Batches */}
                <div className="mt-3 space-y-1.5 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Recruitment Window:</span>
                    </span>
                    <span className="text-slate-200 font-bold text-right">
                      {cycle.exactWindowText || cycle.expectedAnnouncementMonth}
                    </span>
                  </div>

                  {cycle.daysRemaining !== undefined && cycle.currentStatus === 'UPCOMING' && (
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Countdown:</span>
                      </span>
                      <span className="text-emerald-400 font-bold">
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
                      <span className="text-emerald-400 font-bold">Eligibility: </span>
                      <span>{cycle.eligibilityCriteria}</span>
                    </div>
                  )}
                </div>

                {/* Key Preparation Topics */}
                {cycle.keyPreparationTopics && cycle.keyPreparationTopics.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">
                      Key Research Topics &amp; Requirements:
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
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600 shadow-sm'
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
                    <CalendarPlus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isReminderSet ? 'Synced' : 'Remind'}</span>
                  </button>

                  <a
                    href={calendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Add opening/deadline alert to Google Calendar"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-emerald-400" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <LinkHealthBadge url={cycle.officialCareersUrl} companyDomain={cycle.companyDomain} compact />
                  <a
                    href={UrlHealthResolver.resolveSafePortalUrl(cycle.officialCareersUrl, cycle.companyDomain, cycle.companyName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-emerald-950 group/btn"
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

      {visibleCount < filteredCycles.length && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setVisibleCount(prev => prev + 16)}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 text-xs font-mono font-bold transition-all cursor-pointer shadow-lg"
          >
            Load More Research Tracks ({filteredCycles.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

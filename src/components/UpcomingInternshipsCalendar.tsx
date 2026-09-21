/**
 * TERRASYNX: Upcoming Predictable Annual Internship Recruitment Calendar Component
 * 
 * Truth-Anchored Seasonal Tracking with Day-Level Live Precision:
 * - Real-time dynamic evaluation against the exact day the student is viewing the application.
 * - 3 Primary Status Tabs:
 *   1. "Chal Rahi Hai (Open Now)": Currently active within the exact day window (e.g. 15 Aug – 21 Sep).
 *   2. "Aage Aane Wali (Upcoming)": Window has not yet opened for this cycle.
 *   3. "Is Saal Nikal Gayi (Passed)": Current day has passed the deadline (e.g. as soon as it is 22 Sep,
 *      opportunities ending on 21 Sep automatically move here from Open Now!).
 * - Interactive Date Simulator for student testing (e.g. Test 20 Sep vs 22 Sep live transition).
 * - Month-wise & urgency-sorted listings.
 * - Authenticity labels clearly distinct from live-scraped cryptographic verified badges.
 * - Prominent Official Careers Portal link on every card.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { UpcomingInternshipCycle, InternshipCycleCurrentStatus, StudentProfile } from '../types';
import { UpcomingInternshipsService, RECURRING_ANNUAL_INTERNSHIPS, detectNaturalSynonymHint } from '../services/upcomingInternshipsService';
import { CalendarSyncService } from '../services/calendarSyncService';
import { CompanyLogo } from './CompanyLogo';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Compass, 
  BookOpen, 
  Bell, 
  DollarSign,
  AlertCircle,
  CalendarCheck,
  CalendarClock,
  History,
  Info,
  RotateCcw,
  Flame,
  GraduationCap,
  Award,
  Briefcase,
  Crown,
  Globe,
  FlaskConical,
  GitBranch,
  Cpu,
  TrendingUp,
  Building2,
  Target,
  Bookmark,
  CalendarPlus,
  X,
  Star,
  Radio,
  AlertTriangle
} from 'lucide-react';

interface UpcomingInternshipsCalendarProps {
  onNavigateToCalendar?: () => void;
  onBookmarkReminder?: (cycle: UpcomingInternshipCycle) => void;
  studentProfile?: StudentProfile;
}

export type LiveStatusTab = 'ALL' | 'OPEN_NOW' | 'OPENING_SOON' | 'UPCOMING_SEASON' | 'PASSED_THIS_CYCLE' | 'TRACKED';

/**
 * Generates an instant Google Calendar event link for internship opening/deadline alerts.
 */
export function createGoogleCalendarUrl(cycle: UpcomingInternshipCycle, referenceDate: Date): string {
  const currentYear = referenceDate.getFullYear();
  const startDay = cycle.startDay ?? 1;
  const startMonth = cycle.startMonth;
  const endDay = cycle.endDay ?? 28;
  const endMonth = cycle.endMonth;

  const pad = (n: number) => String(n).padStart(2, '0');
  const startDateStr = `${currentYear}${pad(startMonth)}${pad(startDay)}`;
  const endDateStr = `${currentYear}${pad(endMonth)}${pad(endDay)}`;

  const title = encodeURIComponent(`[Internship Alert] ${cycle.companyName} - ${cycle.programTitle}`);
  const details = encodeURIComponent(
    `Official Recruitment Track: ${cycle.companyName}\n` +
    `Program: ${cycle.programTitle}\n` +
    `Application Window: ${cycle.exactWindowText || cycle.expectedAnnouncementMonth}\n` +
    `Compensation: ${cycle.historicalCompensation} (${cycle.rateType === 'OFFICIAL_CONFIRMED' ? 'Official Exact Rate' : 'Market Estimated Range'})\n` +
    `Official Careers Portal: ${cycle.officialCareersUrl}\n\n` +
    `Key Preparation Topics: ${cycle.keyPreparationTopics.join(', ')}\n` +
    `Preparation Strategy: ${cycle.actionTip}\n\n` +
    `Tracked via Terrasynx Seasonal Recruitment Calendar`
  );
  const location = encodeURIComponent(`${cycle.companyName} Careers Portal`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateStr}/${endDateStr}&details=${details}&location=${location}`;
}

export type MatrixBadgeType = 'GREEN' | 'BLUE' | 'PURPLE' | 'GREY';

export interface MatrixEvaluation {
  type: MatrixBadgeType;
  label: string;
  badgeShort: string;
  subtext: string;
  containerClass: string;
  badgeClass: string;
  icon: React.ReactNode;
}

/**
 * 4-Badge Eligibility Matrix Evaluator:
 * Compares an internship cycle against the student's active graduation batch/year.
 * 
 * Strict Zero-Exclusion Rule:
 * Never hides an opportunity — only dynamically alters the eligibility classification:
 * 1. Green  — "Eligible for Your Batch (Apply/Prepare Now)"
 * 2. Blue   — "Future Runway Target (Eligible in Year X — Start Skill Roadmap)"
 * 3. Purple — "Open to All Years & Backgrounds (No Degree Barrier)"
 * 4. Grey   — "Cohort Window Passed (Reference for Juniors)"
 */
export function evaluateEligibilityMatrix(
  cycle: UpcomingInternshipCycle,
  studentBatch: number | 'class_12' | 'all',
  currentDate: Date = new Date()
): MatrixEvaluation {
  const eligLower = (cycle.eligibility || '').toLowerCase();
  const critLower = (cycle.selectionCriteria || '').toLowerCase();

  // 1. Purple: Open to All Years & Backgrounds (No Degree Barrier)
  const isOpenToAll = 
    eligLower.includes('no degree') ||
    eligLower.includes('all years') ||
    eligLower.includes('any year') ||
    eligLower.includes('open to all') ||
    eligLower.includes('anyone') ||
    critLower.includes('no degree barrier') ||
    cycle.tierCategory === 'open_source_grant' ||
    cycle.programCategory === 'open_source_grant' ||
    cycle.targetBatches.length >= 5;

  if (isOpenToAll) {
    return {
      type: 'PURPLE',
      label: 'Open to All Years & Backgrounds (No Degree Barrier)',
      badgeShort: '🟣 Open to All Years',
      subtext: 'No rigid degree or branch restriction • Any year & background can participate',
      containerClass: 'bg-purple-950/40 border-purple-500/50 text-purple-200',
      badgeClass: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-sm shadow-purple-500/30 border border-purple-300/40',
      icon: <Globe className="w-4 h-4 text-purple-400 shrink-0" />
    };
  }

  // 2. Overview mode when 'all' is selected
  if (studentBatch === 'all') {
    if (cycle.currentStatus === 'PASSED_THIS_CYCLE') {
      return {
        type: 'GREY',
        label: 'Cohort Window Passed (Reference for Juniors)',
        badgeShort: '⚪ Window Passed',
        subtext: 'This annual application window has closed • Saved as reference for future cohorts',
        containerClass: 'bg-slate-900/80 border-slate-700/60 text-slate-400',
        badgeClass: 'bg-slate-800 text-slate-300 border border-slate-600 font-bold',
        icon: <History className="w-4 h-4 text-slate-400 shrink-0" />
      };
    }
    return {
      type: 'GREEN',
      label: 'Eligible for Your Batch (Apply/Prepare Now)',
      badgeShort: '🟢 Eligible Cohorts',
      subtext: `Targeting: ${cycle.targetBatches.map(b => b === 12 ? 'Class 12' : `Batch ${b}`).join(', ')}`,
      containerClass: 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200',
      badgeClass: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-sm shadow-emerald-500/25 border border-emerald-300/60',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
    };
  }

  // 3. Class 12th Student Handling
  if (studentBatch === 'class_12') {
    if (cycle.isClass12Eligible || cycle.targetBatches.includes(12)) {
      if (cycle.currentStatus === 'PASSED_THIS_CYCLE') {
        return {
          type: 'GREY',
          label: 'Cohort Window Passed (Reference for Juniors)',
          badgeShort: '⚪ Window Passed',
          subtext: 'Window closed for this annual cycle • Bookmark to prepare for next cycle',
          containerClass: 'bg-slate-900/80 border-slate-700/60 text-slate-400',
          badgeClass: 'bg-slate-800 text-slate-300 border border-slate-600 font-bold',
          icon: <History className="w-4 h-4 text-slate-400 shrink-0" />
        };
      }
      return {
        type: 'GREEN',
        label: 'Eligible for Your Batch (Apply/Prepare Now)',
        badgeShort: '🟢 Apply / Prepare Now',
        subtext: 'Directly tailored for Class 12th pass & early talent candidates',
        containerClass: 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200',
        badgeClass: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-sm shadow-emerald-500/25 border border-emerald-300/60',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      };
    } else {
      return {
        type: 'BLUE',
        label: 'Future Runway Target (Eligible in College Year 2/3 — Start Skill Roadmap)',
        badgeShort: '🔵 Future Runway Target',
        subtext: 'Requires undergraduate enrolment • Build foundational CS & coding portfolio now',
        containerClass: 'bg-sky-950/40 border-sky-500/50 text-sky-200',
        badgeClass: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black shadow-sm shadow-sky-500/25 border border-sky-300/60',
        icon: <Compass className="w-4 h-4 text-sky-400 shrink-0" />
      };
    }
  }

  // 4. College Graduation Batch Evaluation
  const studentYear = Number(studentBatch);
  const numericBatches = cycle.targetBatches.filter(b => typeof b === 'number' && b !== 12) as number[];
  const minBatch = numericBatches.length > 0 ? Math.min(...numericBatches) : studentYear;
  const maxBatch = numericBatches.length > 0 ? Math.max(...numericBatches) : studentYear;

  // Check if window already closed for current cycle
  if (cycle.currentStatus === 'PASSED_THIS_CYCLE') {
    return {
      type: 'GREY',
      label: 'Cohort Window Passed (Reference for Juniors)',
      badgeShort: '⚪ Window Passed',
      subtext: 'Application deadline passed for this season • Bookmark for advance runway next year',
      containerClass: 'bg-slate-900/80 border-slate-700/60 text-slate-400',
      badgeClass: 'bg-slate-800 text-slate-300 border border-slate-600 font-bold',
      icon: <History className="w-4 h-4 text-slate-400 shrink-0" />
    };
  }

  // Check if student is too senior (e.g. 1st/2nd year exclusive program, but student is 3rd/4th year)
  const isEarlyUndergradOnly = 
    cycle.tierCategory === 'early_undergrad_exclusive' || 
    cycle.programCategory === 'early_career_12th' ||
    (maxBatch >= 2028 && minBatch >= 2028 && studentYear <= 2027);

  if (isEarlyUndergradOnly && studentYear <= 2027 && !cycle.targetBatches.includes(studentYear)) {
    return {
      type: 'GREY',
      label: 'Cohort Window Passed (Reference for Juniors)',
      badgeShort: '⚪ Cohort Window Passed',
      subtext: 'Exclusively intended for 1st/2nd year cohorts • Retain as guidance for junior peers',
      containerClass: 'bg-slate-900/80 border-slate-700/60 text-slate-400',
      badgeClass: 'bg-slate-800 text-slate-300 border border-slate-600 font-bold',
      icon: <History className="w-4 h-4 text-slate-400 shrink-0" />
    };
  }

  // Check if student graduated or passed targeted years
  if (studentYear < minBatch && !cycle.targetBatches.includes(studentYear)) {
    return {
      type: 'GREY',
      label: 'Cohort Window Passed (Reference for Juniors)',
      badgeShort: '⚪ Cohort Window Passed',
      subtext: `Targeted at earlier cohorts (${numericBatches.join(', ')}) • Use as benchmark for mentees`,
      containerClass: 'bg-slate-900/80 border-slate-700/60 text-slate-400',
      badgeClass: 'bg-slate-800 text-slate-300 border border-slate-600 font-bold',
      icon: <History className="w-4 h-4 text-slate-400 shrink-0" />
    };
  }

  // Check if student batch is actively eligible right now
  if (cycle.targetBatches.includes(studentYear)) {
    return {
      type: 'GREEN',
      label: 'Eligible for Your Batch (Apply/Prepare Now)',
      badgeShort: '🟢 Eligible for Batch',
      subtext: `Batch ${studentYear} directly eligible • Prepare required OA topics & polish resume`,
      containerClass: 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200',
      badgeClass: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-sm shadow-emerald-500/25 border border-emerald-300/60',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
    };
  }

  // Blue Check: Future Runway Target (Eligible in Year X — Start Skill Roadmap)
  // Student is currently junior to the required batch (studentYear > maxBatch)
  const currentYear = currentDate.getFullYear();
  const yearDiff = studentYear - maxBatch;
  const eligibleYear = currentYear + Math.max(1, yearDiff);

  let academicYearName = 'Pre-Final / Final Year';
  if (studentYear === 2028) academicYearName = '3rd Year';
  else if (studentYear === 2029) academicYearName = '2nd / 3rd Year';
  else if (studentYear >= 2030) academicYearName = 'Pre-Final Year';

  return {
    type: 'BLUE',
    label: `Future Runway Target (Eligible in ${academicYearName} — Start Skill Roadmap)`,
    badgeShort: '🔵 Future Runway Target',
    subtext: `Your window opens in ~${eligibleYear} • Build DSA, low-latency/system projects in advance`,
    containerClass: 'bg-sky-950/40 border-sky-500/50 text-sky-200',
    badgeClass: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black shadow-sm shadow-sky-500/25 border border-sky-300/60',
    icon: <Compass className="w-4 h-4 text-sky-400 shrink-0" />
  };
}

export const UpcomingInternshipsCalendar: React.FC<UpcomingInternshipsCalendarProps> = ({
  onNavigateToCalendar,
  studentProfile,
}) => {
  // Live Date Reference State: defaults to new Date() and auto-updates
  const [referenceDate, setReferenceDate] = useState<Date>(() => new Date());
  const [isSimulatingDate, setIsSimulatingDate] = useState<boolean>(false);

  // Auto-refresh clock every 30 seconds to maintain live accuracy
  useEffect(() => {
    if (isSimulatingDate) return;
    const timer = setInterval(() => {
      setReferenceDate(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, [isSimulatingDate]);

  // Live Status Tabs (Open Now, Opening Soon, Upcoming Season, Passed, Tracked, All)
  const [activeStatusTab, setActiveStatusTab] = useState<LiveStatusTab>('OPEN_NOW');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'quant_hft' | 'tech_giant' | 'frontier_ai' | 'early_undergrad_exclusive' | 'internship' | 'scientific_lab' | 'open_source_grant' | 'academic_fellowship' | 'scholarship_12th' | 'global_full_ride_3cr' | 'pre_university_full_ride'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  
  // Tracked Opportunities state (persisted in localStorage)
  const [trackedCycleIds, setTrackedCycleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('terrasynx_tracked_cycles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Transient Toast Notification for Bookmark & Alert actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Student Active Graduation Cohort for 4-Badge Matrix Comparison
  // Defaults to user's graduation year from profile (e.g. 2027 for pre-final 3rd year)
  const [studentBatch, setStudentBatch] = useState<number | 'class_12' | 'all'>(() => {
    if (studentProfile?.graduationYear) {
      return studentProfile.graduationYear;
    }
    return 2027; // Default standard pre-final year benchmark
  });

  // Optional highlight/filter for the 4 eligibility badges ('all' by default to strictly keep ALL opportunities visible)
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

  // Base dataset dynamically computed for the current referenceDate
  const allCycles = useMemo(() => {
    return UpcomingInternshipsService.getAllUpcomingCycles(referenceDate);
  }, [referenceDate]);

  // Live Status Strip Counts (Open Now, Opening Soon (<30d), Upcoming Season (>30d), Passed, Tracked, All)
  const statusStripCounts = useMemo(() => {
    const list = selectedCategory === 'all' 
      ? allCycles 
      : UpcomingInternshipsService.filterUpcomingCycles({
          status: 'all',
          month: selectedMonth,
          targetBatch: 'all',
          category: selectedCategory,
          query: searchQuery,
          currentDate: referenceDate,
        });

    return {
      ALL: list.length,
      OPEN_NOW: list.filter(c => c.currentStatus === 'OPEN_NOW').length,
      OPENING_SOON: list.filter(c => c.currentStatus === 'UPCOMING' && (c.daysRemaining !== undefined && c.daysRemaining <= 30)).length,
      UPCOMING_SEASON: list.filter(c => c.currentStatus === 'UPCOMING' && (c.daysRemaining === undefined || c.daysRemaining > 30)).length,
      PASSED_THIS_CYCLE: list.filter(c => c.currentStatus === 'PASSED_THIS_CYCLE').length,
      TRACKED: list.filter(c => trackedCycleIds.includes(c.id)).length,
    };
  }, [allCycles, selectedCategory, selectedMonth, searchQuery, referenceDate, trackedCycleIds]);

  // Dynamic counts for each 1-click filter category chip
  const categoryCounts = useMemo(() => {
    return {
      all: allCycles.length,
      quant_hft: allCycles.filter(c => c.tierCategory === 'quant_hft' || c.programCategory === 'quant_hft').length,
      tech_giant: allCycles.filter(c => c.tierCategory === 'tech_giant' || c.programCategory === 'tech_giant').length,
      frontier_ai: allCycles.filter(c => c.tierCategory === 'frontier_ai' || c.programCategory === 'frontier_ai').length,
      early_undergrad_exclusive: allCycles.filter(c => c.tierCategory === 'early_undergrad_exclusive' || c.programCategory === 'early_undergrad_exclusive').length,
      scientific_lab: allCycles.filter(c => 
        c.tierCategory === 'scientific_lab' || 
        c.programCategory === 'scientific_lab' || 
        c.tierCategory === 'academic_fellowship' || 
        c.programCategory === 'academic_fellowship'
      ).length,
      open_source_grant: allCycles.filter(c => c.tierCategory === 'open_source_grant' || c.programCategory === 'open_source_grant').length,
      academic_fellowship: allCycles.filter(c => c.tierCategory === 'academic_fellowship' || c.programCategory === 'academic_fellowship').length,
      internship: allCycles.filter(c => !c.isClass12Eligible && c.programCategory !== 'scholarship' && c.programCategory !== 'early_career_12th' && c.programCategory !== 'global_full_ride' && c.tierCategory !== 'scientific_lab' && c.tierCategory !== 'open_source_grant' && c.tierCategory !== 'academic_fellowship' && c.tierCategory !== 'frontier_ai' && c.tierCategory !== 'early_undergrad_exclusive' && c.tierCategory !== 'quant_hft' && c.tierCategory !== 'tech_giant').length,
      scholarship_12th: allCycles.filter(c => (c.isClass12Eligible || c.programCategory === 'scholarship' || c.programCategory === 'early_career_12th') && !c.isGlobalFullRide && !c.isPreUniversityFullRide).length,
      global_full_ride_3cr: allCycles.filter(c => c.isGlobalFullRide || c.programCategory === 'global_full_ride' || (c.fundingAmountText && c.fundingAmountText.toLowerCase().includes('crore'))).length,
      pre_university_full_ride: allCycles.filter(c => c.tierCategory === 'pre_university_full_ride' || c.isPreUniversityFullRide || c.programCategory === 'pre_university_full_ride').length,
    };
  }, [allCycles]);

  // Filtered and day-level sorted cycles
  // STRICT ZERO-EXCLUSION MANDATE:
  // "Kisi bhi opportunity ko kisi bhi student se kabhi hide mat karo — sirf badge badalta hai, card hamesha dikhti hai."
  const filteredCycles = useMemo(() => {
    let baseList = UpcomingInternshipsService.filterUpcomingCycles({
      status: 'all',
      month: selectedMonth,
      targetBatch: 'all',
      category: selectedCategory,
      query: searchQuery,
      currentDate: referenceDate,
    });

    if (activeStatusTab === 'OPEN_NOW') {
      baseList = baseList.filter(c => c.currentStatus === 'OPEN_NOW');
      baseList.sort((a, b) => (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0));
    } else if (activeStatusTab === 'OPENING_SOON') {
      baseList = baseList.filter(c => c.currentStatus === 'UPCOMING' && (c.daysRemaining !== undefined && c.daysRemaining <= 30));
      baseList.sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999));
    } else if (activeStatusTab === 'UPCOMING_SEASON') {
      baseList = baseList.filter(c => c.currentStatus === 'UPCOMING' && (c.daysRemaining === undefined || c.daysRemaining > 30));
      baseList.sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999));
    } else if (activeStatusTab === 'PASSED_THIS_CYCLE') {
      baseList = baseList.filter(c => c.currentStatus === 'PASSED_THIS_CYCLE');
    } else if (activeStatusTab === 'TRACKED') {
      baseList = baseList.filter(c => trackedCycleIds.includes(c.id));
    }

    // If student explicitly clicks one of the 4 matrix badge filter pills, filter; otherwise keep all visible
    if (matrixFilter !== 'all') {
      baseList = baseList.filter(cycle => {
        const evalRes = evaluateEligibilityMatrix(cycle, studentBatch, referenceDate);
        return evalRes.type === matrixFilter;
      });
    }

    return baseList;
  }, [activeStatusTab, selectedMonth, selectedCategory, searchQuery, referenceDate, matrixFilter, studentBatch, trackedCycleIds]);

  // 1-Click Track Opportunity & Toggle Bookmark + Alerts
  const handleToggleTrack = (cycle: UpcomingInternshipCycle) => {
    setTrackedCycleIds(prev => {
      const isAlreadyTracked = prev.includes(cycle.id);
      const updated = isAlreadyTracked ? prev.filter(id => id !== cycle.id) : [...prev, cycle.id];
      try {
        localStorage.setItem('terrasynx_tracked_cycles', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save tracked cycle:', err);
      }
      if (!isAlreadyTracked) {
        setToastMessage(`✓ Tracked ${cycle.companyName} (${cycle.programTitle})! Added to your Tracked Radar with calendar alert.`);
        handleAddCalendarReminder(cycle);
      } else {
        setToastMessage(`Untracked: ${cycle.companyName} removed from radar.`);
      }
      return updated;
    });
  };

  // Dynamic 4-Badge Matrix counts for active tab
  const matrixCounts = useMemo(() => {
    let baseList = UpcomingInternshipsService.filterUpcomingCycles({
      status: 'all',
      month: selectedMonth,
      targetBatch: 'all',
      category: selectedCategory,
      query: searchQuery,
      currentDate: referenceDate,
    });

    if (activeStatusTab === 'OPEN_NOW') {
      baseList = baseList.filter(c => c.currentStatus === 'OPEN_NOW');
    } else if (activeStatusTab === 'OPENING_SOON') {
      baseList = baseList.filter(c => c.currentStatus === 'UPCOMING' && (c.daysRemaining !== undefined && c.daysRemaining <= 30));
    } else if (activeStatusTab === 'UPCOMING_SEASON') {
      baseList = baseList.filter(c => c.currentStatus === 'UPCOMING' && (c.daysRemaining === undefined || c.daysRemaining > 30));
    } else if (activeStatusTab === 'PASSED_THIS_CYCLE') {
      baseList = baseList.filter(c => c.currentStatus === 'PASSED_THIS_CYCLE');
    } else if (activeStatusTab === 'TRACKED') {
      baseList = baseList.filter(c => trackedCycleIds.includes(c.id));
    }

    const counts = {
      all: baseList.length,
      GREEN: 0,
      BLUE: 0,
      PURPLE: 0,
      GREY: 0,
    };

    baseList.forEach(c => {
      const res = evaluateEligibilityMatrix(c, studentBatch, referenceDate);
      counts[res.type]++;
    });

    return counts;
  }, [activeStatusTab, selectedMonth, selectedCategory, searchQuery, referenceDate, studentBatch, trackedCycleIds]);

  // Date simulation handlers for testing the dynamic live transition
  const handleSetSimulatedDate = (year: number, month: number, day: number) => {
    setIsSimulatingDate(true);
    setReferenceDate(new Date(year, month - 1, day, 12, 0, 0));
  };

  const handleResetToRealTime = () => {
    setIsSimulatingDate(false);
    setReferenceDate(new Date());
  };

  const formattedReferenceDate = useMemo(() => {
    return referenceDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [referenceDate]);

  const handleAddCalendarReminder = (cycle: UpcomingInternshipCycle) => {
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
        `Review key preparation topics: ${cycle.keyPreparationTopics.join(', ')}`,
        `Check official career portal: ${cycle.officialCareersUrl}`,
        `Update resume with latest projects and coursework`
      ],
      syncStatus: {
        googleCalendar: false,
        icsExported: false,
      }
    });

    setReminderAddedMap(prev => ({ ...prev, [cycle.id]: true }));
    setTimeout(() => {
      setReminderAddedMap(prev => ({ ...prev, [cycle.id]: false }));
    }, 4000);
  };

  // Helper for authenticity badge styling (Never looks like live scraped green verified)
  const getAuthenticityBadge = (status: UpcomingInternshipCycle['authenticityStatus']) => {
    switch (status) {
      case 'HISTORICALLY_CONFIRMED':
        return {
          label: '🏛️ Historically Confirmed Pattern',
          subtext: 'Multi-year consistent recruitment cycle',
          containerClass: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/80',
        };
      case 'OFFICIALLY_SCHEDULED':
        return {
          label: '🗓️ Annually Recurring Schedule',
          subtext: 'Standard institutional hiring timeline',
          containerClass: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80',
        };
      case 'CALENDAR_PREDICTABLE':
      default:
        return {
          label: '📅 Annual Calendar Model',
          subtext: 'Calculated from historical announcement patterns',
          containerClass: 'bg-purple-950/60 text-purple-300 border-purple-800/80',
        };
    }
  };

  // Status visual representation
  const getStatusBadge = (status?: InternshipCycleCurrentStatus) => {
    switch (status) {
      case 'OPEN_NOW':
        return {
          label: 'Chal Rahi Hai (Open Now)',
          icon: CalendarCheck,
          containerClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-600/80',
          dotColor: 'bg-emerald-400 animate-pulse',
        };
      case 'UPCOMING':
        return {
          label: 'Aage Aane Wali (Upcoming)',
          icon: CalendarClock,
          containerClass: 'bg-sky-950/60 text-sky-300 border-sky-600/80',
          dotColor: 'bg-sky-400',
        };
      case 'PASSED_THIS_CYCLE':
        return {
          label: 'Is Saal Nikal Gayi (Passed)',
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
      
      {/* Strategic Runway Banner */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                ANNUAL RECURRING RECRUITMENT CALENDAR
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                <Info className="w-3 h-3 text-purple-400" />
                Predictive Historical Model (Not Live Scraped)
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Annual Internship Announcement Tracker
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Top technology firms (Google, Microsoft, Amazon, Nvidia, Netflix, Apple, Uber, Oracle) follow cyclical recruitment waves. 
              Calculated live against your current viewing day with day-level precision.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-center">
              <span className="block text-2xl font-black font-mono text-indigo-400">
                {RECURRING_ANNUAL_INTERNSHIPS.length}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Tracked Programs
              </span>
            </div>
            {onNavigateToCalendar && (
              <button
                onClick={onNavigateToCalendar}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>View My Calendar</span>
              </button>
            )}
          </div>
        </div>

        {/* LIVE DATE PRECISION & TESTING BAR */}
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
                    : 'bg-indigo-950/80 text-indigo-300 border-indigo-700'
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
                Every opportunity calculates &apos;Chal Rahi Hai&apos; vs &apos;Is Saal Nikal Gayi&apos; down to the exact day.
              </span>
            </div>
          </div>

          {/* Quick Date Testing Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 mr-1">
              Test Transitions:
            </span>
            <button
              onClick={handleResetToRealTime}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                !isSimulatingDate
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
              title="Reset to real-time system clock"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Today (Live)</span>
            </button>
            <button
              onClick={() => handleSetSimulatedDate(2026, 9, 20)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                isSimulatingDate && referenceDate.getDate() === 20 && referenceDate.getMonth() === 8
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
              title="Adobe ends Sep 21: Shows in Open Now with 1 day remaining"
            >
              20 Sep (Adobe Open)
            </button>
            <button
              onClick={() => handleSetSimulatedDate(2026, 9, 22)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                isSimulatingDate && referenceDate.getDate() === 22 && referenceDate.getMonth() === 8
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
              title="Adobe ended Sep 21: Automatically removed from Open Now and moved to Passed!"
            >
              22 Sep (Adobe Passed)
            </button>
          </div>
        </div>

        {/* LIVE STATUS STRIP (Open Now / Opening Soon / Upcoming Season / Passed / Tracked / All) */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Live Status Strip
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                Real-Time Application Window Watch
              </span>
            </div>
            {trackedCycleIds.length > 0 && (
              <span className="text-[11px] font-mono text-amber-300 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{trackedCycleIds.length} Opportunities on Radar</span>
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
              <span className="text-[10px] text-slate-400 line-clamp-1">
                Window active abhi
              </span>
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
              <span className="text-[10px] text-slate-400 line-clamp-1">
                &lt;30 din me khul rahi
              </span>
            </button>

            {/* Strip 3: Upcoming Season (30+ Days) */}
            <button
              onClick={() => setActiveStatusTab('UPCOMING_SEASON')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeStatusTab === 'UPCOMING_SEASON'
                  ? 'bg-sky-950/70 border-sky-500 shadow-lg shadow-sky-950/50 ring-1 ring-sky-400/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-sky-400" />
                  <span className={`text-[11px] font-mono font-bold ${activeStatusTab === 'UPCOMING_SEASON' ? 'text-sky-300' : 'text-slate-200'}`}>
                    Upcoming Season
                  </span>
                </div>
                <span className={`text-xs font-mono font-black px-1.5 py-0.5 rounded ${
                  activeStatusTab === 'UPCOMING_SEASON'
                    ? 'bg-sky-900 text-sky-200 border border-sky-600'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {statusStripCounts.UPCOMING_SEASON}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                30+ din baad runway
              </span>
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
              <span className="text-[10px] text-slate-500 line-clamp-1">
                Window band ho chuki
              </span>
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
              <span className="text-[10px] text-slate-400 line-clamp-1">
                Saved alerts & radar
              </span>
            </button>

            {/* Strip 6: All Cycles */}
            <button
              onClick={() => setActiveStatusTab('ALL')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeStatusTab === 'ALL'
                  ? 'bg-indigo-950/70 border-indigo-500 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-400/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-2.5 h-2.5 text-indigo-400" />
                  <span className={`text-[11px] font-mono font-bold ${activeStatusTab === 'ALL' ? 'text-indigo-300' : 'text-slate-200'}`}>
                    All Tracks
                  </span>
                </div>
                <span className={`text-xs font-mono font-black px-1.5 py-0.5 rounded ${
                  activeStatusTab === 'ALL'
                    ? 'bg-indigo-900 text-indigo-200 border border-indigo-600'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {statusStripCounts.ALL}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                Puri calendar list
              </span>
            </button>
          </div>
        </div>

        {/* 1-CLICK FOCUS FILTER CHIPS */}
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>1-Click Focus Filter Chips</span>
            </span>
            <div className="text-[11px] font-mono text-slate-400">
              Showing <span className="font-bold text-slate-200">{filteredCycles.length}</span> verified tracks
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Chip: All */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>All Opportunities ({categoryCounts.all})</span>
            </button>

            {/* Chip 1: 1st/2nd Year Freshers */}
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

            {/* Chip 2: Open-Source Grants */}
            <button
              onClick={() => setSelectedCategory('open_source_grant')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'open_source_grant'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-md shadow-emerald-500/25'
                  : 'bg-emerald-950/30 text-emerald-300 hover:bg-emerald-950/60 border border-emerald-800/50'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              <span>Open-Source ({categoryCounts.open_source_grant})</span>
            </button>

            {/* Chip 3: Global Research Labs */}
            <button
              onClick={() => setSelectedCategory('scientific_lab')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'scientific_lab'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black shadow-md shadow-blue-500/25'
                  : 'bg-blue-950/30 text-blue-300 hover:bg-blue-950/60 border border-blue-800/50'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-blue-400" />
              <span>Global Research Labs ({categoryCounts.scientific_lab})</span>
            </button>

            {/* Chip 4: Frontier AI */}
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

            {/* Chip 5: Quants & HFT */}
            <button
              onClick={() => setSelectedCategory('quant_hft')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'quant_hft'
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/30 ring-1 ring-amber-300'
                  : 'bg-amber-950/30 text-amber-300 hover:bg-amber-950/60 border border-amber-800/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Quants & HFT ({categoryCounts.quant_hft})</span>
            </button>

            {/* Chip 6: Big Tech Giants */}
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

            {/* Chip 7: ₹3-4 Cr Full-Rides */}
            <button
              onClick={() => setSelectedCategory('global_full_ride_3cr')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'global_full_ride_3cr'
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-300'
                  : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/70 border border-emerald-800/60'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>₹3-4 Cr Full-Rides ({categoryCounts.global_full_ride_3cr})</span>
            </button>

            {/* Chip 8: Class 12 & Scholarships */}
            <button
              onClick={() => setSelectedCategory('scholarship_12th')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'scholarship_12th'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/25'
                  : 'bg-amber-950/30 text-amber-300 hover:bg-amber-950/60 border border-amber-800/50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>Class 12th ({categoryCounts.scholarship_12th})</span>
            </button>

            {/* Chip 9: Early Runway: Pre-University Full-Rides */}
            <button
              onClick={() => setSelectedCategory('pre_university_full_ride')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'pre_university_full_ride'
                  ? 'bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 text-white font-black shadow-lg shadow-rose-500/30 ring-2 ring-rose-400'
                  : 'bg-rose-950/40 text-rose-300 hover:bg-rose-950/70 border border-rose-800/60'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-rose-400" />
              <span>Early Runway: Pre-Univ Full-Rides ({categoryCounts.pre_university_full_ride})</span>
            </button>
          </div>
        </div>

        {/* SEARCH BAR & NATURAL SYNONYMS BAR */}
        <div className="mt-3 pt-3 border-t border-slate-800/40 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Month Sub-Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              {monthsList.map(m => (
                <button
                  key={m.key}
                  onClick={() => setSelectedMonth(m.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    selectedMonth === m.key
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Enhanced Search Input with Clear Button */}
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search or try: 'switzerland', 'canada', 'remote'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Natural Search Synonym Feedback Banner & 1-Click Quick Synonym Search Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono">
            <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
              <span className="text-slate-500">Quick Synonyms:</span>
              <button
                type="button"
                onClick={() => setSearchQuery('switzerland')}
                className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                  searchQuery.toLowerCase() === 'switzerland'
                    ? 'bg-rose-950/80 text-rose-200 border-rose-600 font-bold'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                }`}
              >
                🇨🇭 Switzerland / Geneva (CERN)
              </button>
              <button
                type="button"
                onClick={() => setSearchQuery('canada')}
                className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                  searchQuery.toLowerCase() === 'canada'
                    ? 'bg-red-950/80 text-red-200 border-red-600 font-bold'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                }`}
              >
                🇨🇦 Canada (Mitacs)
              </button>
              <button
                type="button"
                onClick={() => setSearchQuery('remote')}
                className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                  searchQuery.toLowerCase() === 'remote'
                    ? 'bg-emerald-950/80 text-emerald-200 border-emerald-600 font-bold'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                }`}
              >
                🌐 Remote / GitHub (GSoC, Outreachy)
              </button>
              <button
                type="button"
                onClick={() => setSearchQuery('quant')}
                className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                  searchQuery.toLowerCase() === 'quant'
                    ? 'bg-amber-950/80 text-amber-200 border-amber-600 font-bold'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                }`}
              >
                📈 Quant (Jane Street, Citadel)
              </button>
              <button
                type="button"
                onClick={() => setSearchQuery('frontier ai')}
                className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                  searchQuery.toLowerCase() === 'frontier ai'
                    ? 'bg-violet-950/80 text-violet-200 border-violet-600 font-bold'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                }`}
              >
                🤖 Frontier AI (OpenAI, DeepMind)
              </button>
              <button
                type="button"
                onClick={() => setSearchQuery('1st year')}
                className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                  searchQuery.toLowerCase() === '1st year'
                    ? 'bg-cyan-950/80 text-cyan-200 border-cyan-600 font-bold'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                }`}
              >
                ⚡ 1st/2nd Yr (STEP, Explore)
              </button>
              <button
                type="button"
                onClick={() => setSearchQuery('germany')}
                className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                  searchQuery.toLowerCase() === 'germany'
                    ? 'bg-yellow-950/80 text-yellow-200 border-yellow-600 font-bold'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                }`}
              >
                🇩🇪 Germany (DESY, DAAD)
              </button>
            </div>

            {/* Dynamic Natural Synonym Hint Message */}
            {searchQuery && detectNaturalSynonymHint(searchQuery) && (
              <div className="flex items-center gap-1.5 text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-800/60">
                <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>
                  Synonym Resolved: <span className="font-bold text-white">{searchQuery}</span> → {detectNaturalSynonymHint(searchQuery)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 4-BADGE ELIGIBILITY MATRIX BENCHMARK PANEL */}
        <div className="mt-3 pt-3 border-t border-slate-800/60 bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 space-y-2.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    Student Eligibility Matrix
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60 font-semibold">
                    Zero-Exclusion Active: All Cards Visible
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Every card is dynamically evaluated against your batch. Opportunities are never hidden so you can prepare future skill roadmaps.
                </p>
              </div>
            </div>

            {/* Batch Comparison Selector */}
            <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
              <span className="text-xs font-mono text-slate-400">My Cohort:</span>
              <select
                value={studentBatch}
                onChange={(e) => setStudentBatch(e.target.value === 'all' ? 'all' : e.target.value === 'class_12' ? 'class_12' : Number(e.target.value))}
                aria-label="My Academic Batch or Eligibility Year"
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-indigo-500/60 text-xs font-mono font-bold text-indigo-300 focus:outline-none focus:border-indigo-400 cursor-pointer shadow-sm"
              >
                <option value={2027}>Batch 2027 (Pre-Final / 3rd Year)</option>
                <option value={2026}>Batch 2026 (Final Year / Graduating)</option>
                <option value={2028}>Batch 2028 (Sophomore / 2nd Year)</option>
                <option value={2029}>Batch 2029 (Freshman / 1st Year)</option>
                <option value="class_12">Class 12th Pass / Early Talent</option>
                <option value="all">All Cohorts (General Overview)</option>
              </select>
            </div>
          </div>

          {/* 4-Badge Matrix Live Counter & Optional Quick-Focus Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
            <button
              onClick={() => setMatrixFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                matrixFilter === 'all'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>All Opportunities ({matrixCounts.all})</span>
            </button>

            <button
              onClick={() => setMatrixFilter(matrixFilter === 'GREEN' ? 'all' : 'GREEN')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                matrixFilter === 'GREEN'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/25 ring-1 ring-emerald-300'
                  : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/70 border border-emerald-800/60'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1. Eligible for Your Batch ({matrixCounts.GREEN})</span>
            </button>

            <button
              onClick={() => setMatrixFilter(matrixFilter === 'BLUE' ? 'all' : 'BLUE')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                matrixFilter === 'BLUE'
                  ? 'bg-sky-500 text-white font-black shadow-md shadow-sky-500/25 ring-1 ring-sky-300'
                  : 'bg-sky-950/40 text-sky-300 hover:bg-sky-950/70 border border-sky-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>2. Future Runway Target ({matrixCounts.BLUE})</span>
            </button>

            <button
              onClick={() => setMatrixFilter(matrixFilter === 'PURPLE' ? 'all' : 'PURPLE')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                matrixFilter === 'PURPLE'
                  ? 'bg-purple-500 text-white font-black shadow-md shadow-purple-500/25 ring-1 ring-purple-300'
                  : 'bg-purple-950/40 text-purple-300 hover:bg-purple-950/70 border border-purple-800/60'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>3. Open to All Years ({matrixCounts.PURPLE})</span>
            </button>

            <button
              onClick={() => setMatrixFilter(matrixFilter === 'GREY' ? 'all' : 'GREY')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                matrixFilter === 'GREY'
                  ? 'bg-slate-600 text-white font-black shadow-md shadow-slate-600/25 ring-1 ring-slate-400'
                  : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-700/80'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>4. Cohort Window Passed ({matrixCounts.GREY})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Disclaimer Banner: Explicit Prediction Notice */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-400 text-xs leading-relaxed font-mono">
        <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-purple-300">Predictive Historical Model Notice: </strong>
          Yeh listing live-scraped feeds nahi hain, balki pichle kai saalo ke documented recruitment patterns par aadharit calculation hai. 
          Har card par diye gaye <span className="text-indigo-300 font-bold">Official Careers Portal ↗</span> link par click karke candidate khud company ki website par live status re-confirm karein.
        </div>
      </div>

      {/* Month-Wise Sorted Grid of Internship Cycles */}
      {filteredCycles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/60">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-400">
            {activeStatusTab === 'OPEN_NOW' && 'Is filter me filhal koi open window nahi mila'}
            {activeStatusTab === 'UPCOMING' && 'Is filter me koi upcoming cycle nahi mila'}
            {activeStatusTab === 'PASSED_THIS_CYCLE' && 'Is filter me koi passed cycle nahi mila'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Try switching to &quot;All Months&quot; or resetting the date filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCycles.map(cycle => {
            const isReminderSet = reminderAddedMap[cycle.id];
            const authenticity = getAuthenticityBadge(cycle.authenticityStatus);
            const statusBadge = getStatusBadge(cycle.currentStatus);
            const StatusIcon = statusBadge.icon;
            const daysLeft = cycle.daysRemaining ?? 0;
            const matrixEvaluation = evaluateEligibilityMatrix(cycle, studentBatch, referenceDate);

            return (
              <div
                key={cycle.id}
                className={`rounded-2xl p-5 transition-all flex flex-col justify-between shadow-lg group ${
                  cycle.isPreUniversityFullRide || cycle.tierCategory === 'pre_university_full_ride'
                    ? 'border-2 border-red-500/80 bg-gradient-to-b from-red-950/25 via-slate-900/80 to-slate-900/90 shadow-red-950/30 hover:border-red-400'
                    : 'border border-slate-800/90 hover:border-indigo-500/40 bg-slate-900/60 hover:bg-slate-900/90 hover:shadow-indigo-500/5'
                }`}
              >
                <div>
                  {/* Top Meta Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CompanyLogo
                        domain={cycle.companyDomain}
                        name={cycle.companyName}
                        size="md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                            {cycle.companyName}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                            {cycle.companyDomain}
                          </span>
                        </div>
                        <span className="text-xs text-indigo-400 font-mono font-semibold block mt-0.5">
                          {cycle.programTitle}
                        </span>

                        {/* Domain Category Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {cycle.tierCategory === 'quant_hft' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm shadow-amber-500/10">
                              <TrendingUp className="w-3 h-3 text-amber-400" />
                              Tier 6: Top Quants & HFT
                            </span>
                          )}
                          {cycle.tierCategory === 'tech_giant' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1 shadow-sm shadow-sky-500/10">
                              <Building2 className="w-3 h-3 text-sky-400" />
                              Tier 7: Global Tech & SaaS Giant
                            </span>
                          )}
                          {cycle.tierCategory === 'frontier_ai' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1 shadow-sm shadow-violet-500/10">
                              <Cpu className="w-3 h-3 text-violet-400" />
                              Tier 4: Frontier AI & Deep Tech
                            </span>
                          )}
                          {cycle.tierCategory === 'early_undergrad_exclusive' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 shadow-sm shadow-cyan-500/10">
                              <Sparkles className="w-3 h-3 text-cyan-400" />
                              Tier 5: 1st/2nd Yr Exclusive
                            </span>
                          )}
                          {cycle.tierCategory === 'scientific_lab' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1 shadow-sm shadow-blue-500/10">
                              <FlaskConical className="w-3 h-3 text-blue-400" />
                              Tier 1: Global Scientific Lab
                            </span>
                          )}
                          {cycle.tierCategory === 'open_source_grant' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm shadow-emerald-500/10">
                              <GitBranch className="w-3 h-3 text-emerald-400" />
                              Tier 2: Open-Source Grant
                            </span>
                          )}
                          {cycle.tierCategory === 'academic_fellowship' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 shadow-sm shadow-purple-500/10">
                              <GraduationCap className="w-3 h-3 text-purple-400" />
                              Tier 3: Academic Fellowship
                            </span>
                          )}
                          {/* Compensation rateType badge: [OFFICIAL EXACT RATE] (green) vs [MARKET ESTIMATED RANGE] (amber) */}
                          {cycle.rateType === 'OFFICIAL_CONFIRMED' ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-emerald-950/90 text-emerald-300 border border-emerald-500/70 flex items-center gap-1 shadow-sm shadow-emerald-500/10">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              [OFFICIAL EXACT RATE]
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-amber-950/90 text-amber-300 border border-amber-500/70 flex items-center gap-1 shadow-sm shadow-amber-500/10">
                              <AlertCircle className="w-3 h-3 text-amber-400" />
                              [MARKET ESTIMATED RANGE]
                            </span>
                          )}
                          {cycle.isGlobalFullRide && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold bg-gradient-to-r from-emerald-500/25 via-teal-500/25 to-cyan-500/25 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm shadow-emerald-500/10">
                              <Crown className="w-3 h-3 text-amber-400" />
                              ₹3-4 Cr Global Full-Ride
                            </span>
                          )}
                          {cycle.isClass12Eligible && !cycle.isGlobalFullRide && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <GraduationCap className="w-3 h-3 text-amber-400" />
                              Class 12th / Early Talent
                            </span>
                          )}
                          {cycle.programCategory === 'scholarship' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <Award className="w-3 h-3 text-emerald-400" />
                              Scholarship & Grant
                            </span>
                          )}
                          {cycle.programCategory === 'early_career_12th' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-cyan-400" />
                              Early IT Career + Degree
                            </span>
                          )}
                          {(cycle.tierCategory === 'pre_university_full_ride' || cycle.isPreUniversityFullRide) && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 shadow-sm shadow-rose-500/10">
                              <Award className="w-3 h-3 text-rose-400" />
                              Early Runway: Pre-Univ Full-Ride
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cycle Status Pill (Open Now / Upcoming / Passed) */}
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border shrink-0 flex items-center gap-1.5 ${statusBadge.containerClass}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
                      <StatusIcon className="w-3 h-3" />
                      <span>{statusBadge.label}</span>
                    </div>
                  </div>

                  {/* EXTRA PROMINENT (Normal se zyada bold / red-bordered) MANDATORY DISCLAIMER FOR PRE-UNIVERSITY FULL-RIDE TIER */}
                  {(cycle.isPreUniversityFullRide || cycle.tierCategory === 'pre_university_full_ride' || cycle.disclaimerNotice) && (
                    <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-red-950/90 via-red-900/50 to-slate-950 border-2 border-red-500 shadow-lg shadow-red-950/60 flex items-start gap-2.5 animate-pulse-slow">
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div className="space-y-1 w-full">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-red-600 text-white shadow-sm">
                            ⚠️ OFFICIAL CONFIRMATION MANDATE
                          </span>
                          {cycle.seatQuotaInfo && (
                            <span className="text-[10px] font-mono font-bold text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                              Seats Quota: {cycle.seatQuotaInfo}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono font-black text-red-100 leading-snug tracking-tight">
                          &ldquo;{cycle.disclaimerNotice || 'Exact dates aur seats officially university/scheme ki apni website par confirm karein — ye information guide ke roop me hai, final source nahi.'}&rdquo;
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 4-Badge Eligibility Matrix Banner for Active Student Batch */}
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
                      <span className="text-[11px] font-mono font-bold text-slate-200">
                        {cycle.targetBatches.map(b => b === 12 ? 'Class 12' : `Batch ${b}`).join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Authenticity Status (Strictly Distinguished from Live Scraped Verified Badge) */}
                  <div className="mt-2.5 flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${authenticity.containerClass}`}>
                        {authenticity.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 text-right truncate">
                      {authenticity.subtext}
                    </span>
                  </div>

                  {/* Announcement & Schedule Badges with Exact Day Window */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                    
                    {/* Exact Date Range Window with Live Countdown */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <span className="text-slate-400 font-mono flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        Exact Window Dates:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                          {cycle.exactWindowText || cycle.expectedAnnouncementMonth}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Day-Level Urgency Indicator */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                      <span className="text-slate-400 font-mono flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Window Timeline Status:
                      </span>

                      {cycle.currentStatus === 'OPEN_NOW' && (
                        daysLeft <= 1 ? (
                          <span className="font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/80 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-400 animate-bounce" />
                            {daysLeft === 0 ? 'Closes Today!' : 'Closes Tomorrow (1 day left!)'}
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-emerald-300 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-700/60 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {daysLeft} days remaining to apply
                          </span>
                        )
                      )}

                      {cycle.currentStatus === 'UPCOMING' && (
                        <span className="font-mono font-bold text-sky-300 bg-sky-950/50 px-2 py-0.5 rounded border border-sky-700/60 flex items-center gap-1">
                          <CalendarClock className="w-3 h-3 text-sky-400" />
                          Opens in {daysLeft} days
                        </span>
                      )}

                      {cycle.currentStatus === 'PASSED_THIS_CYCLE' && (
                        <span className="font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                          <History className="w-3 h-3 text-slate-500" />
                          Closed for this annual cycle
                        </span>
                      )}
                    </div>

                    {/* Explicit Eligibility Level & Detailed Criteria */}
                    {cycle.eligibility && (
                      <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-slate-900">
                        <span className="text-slate-400 font-mono flex items-center gap-1.5 shrink-0">
                          <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                          Eligibility Level:
                        </span>
                        <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                          cycle.eligibility.toLowerCase().includes('no degree')
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/80'
                            : 'bg-slate-900 text-amber-300 border-slate-700'
                        }`}>
                          {cycle.eligibility}
                        </span>
                      </div>
                    )}

                    {cycle.eligibilityCriteria && (
                      <div className="flex items-start justify-between gap-2 text-xs pt-1 border-t border-slate-900">
                        <span className="text-slate-400 font-mono flex items-center gap-1.5 shrink-0 mt-0.5">
                          <Info className="w-3.5 h-3.5 text-amber-400" />
                          Eligibility Details:
                        </span>
                        <span className="font-mono text-amber-300/90 text-[11px] text-right font-medium">
                          {cycle.eligibilityCriteria}
                        </span>
                      </div>
                    )}

                    {cycle.selectionCriteria && (
                      <div className="flex items-start justify-between gap-2 text-xs pt-1 border-t border-slate-900">
                        <span className="text-slate-400 font-mono flex items-center gap-1.5 shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                          Selection Criteria:
                        </span>
                        <span className="font-mono text-slate-300 text-[11px] text-right font-normal max-w-[70%] leading-relaxed">
                          {cycle.selectionCriteria}
                        </span>
                      </div>
                    )}

                    {cycle.seatQuotaInfo && (
                      <div className="flex items-start justify-between gap-2 text-xs pt-1 border-t border-slate-900">
                        <span className="text-slate-400 font-mono flex items-center gap-1.5 shrink-0 mt-0.5">
                          <Target className="w-3.5 h-3.5 text-red-400" />
                          Seats Quota Notice:
                        </span>
                        <span className="font-mono text-red-300 font-bold text-[11px] text-right">
                          {cycle.seatQuotaInfo}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2 text-xs">
                      <span className="text-slate-400 font-mono flex items-center gap-1.5 shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        Target Audience:
                      </span>
                      <span className="font-mono font-bold text-cyan-300 text-[11px] text-right">
                        {cycle.targetAudienceText || cycle.targetBatches.map(b => b === 12 ? 'Class 12th' : `Batch ${b}`).join(', ')}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs pt-1 border-t border-slate-900">
                      <span className="text-slate-400 font-mono flex items-center gap-1.5 shrink-0">
                        <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                        {cycle.programCategory === 'scholarship' || cycle.isGlobalFullRide ? 'Scholarship Grant / Value:' : 'Historical Compensation:'}
                      </span>
                      <div className="flex items-center gap-2 justify-end flex-wrap">
                        <span className="font-mono font-bold text-slate-200 text-[11px] text-right">
                          {cycle.historicalCompensation}
                        </span>
                        {cycle.rateType === 'OFFICIAL_CONFIRMED' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-emerald-950/90 text-emerald-300 border border-emerald-500/70 shrink-0 flex items-center gap-1 shadow-sm shadow-emerald-500/10">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            [OFFICIAL EXACT RATE]
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-amber-950/90 text-amber-300 border border-amber-500/70 shrink-0 flex items-center gap-1 shadow-sm shadow-amber-500/10">
                            <AlertCircle className="w-2.5 h-2.5 text-amber-400" />
                            [MARKET ESTIMATED RANGE]
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ₹3 - 4 Crore Global Full-Ride Spotlight Box */}
                    {cycle.fundingAmountText && (
                      <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/70 via-teal-950/40 to-slate-950 border border-emerald-500/40 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="text-[11px] font-mono font-black text-emerald-300">
                              {cycle.fundingAmountText}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                            Zero-Debt 4-Yr Degree
                          </span>
                        </div>
                        {cycle.coverageBreakdown && (
                          <div className="flex items-start gap-1 text-[10px] font-mono text-emerald-400/90 pt-1 border-t border-emerald-900/40">
                            <span className="font-bold text-emerald-300 shrink-0">Coverage:</span>
                            <span className="text-slate-300">{cycle.coverageBreakdown}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 4-Phase Hiring Cycle Roadmap */}
                  <div className="mt-3.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                      Predictable Hiring Cycle Roadmap:
                    </span>
                    <div className="grid grid-cols-4 gap-1 text-center font-mono">
                      <div className="p-1.5 rounded-lg bg-indigo-950/30 border border-indigo-900/50">
                        <span className="text-[9px] text-indigo-400 block font-bold">1. Announcement</span>
                        <span className="text-[10px] text-slate-200 block truncate">{cycle.timelinePhases.announcementMonth}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-cyan-950/30 border border-cyan-900/50">
                        <span className="text-[9px] text-cyan-400 block font-bold">2. OA Round</span>
                        <span className="text-[10px] text-slate-200 block truncate">{cycle.timelinePhases.assessmentMonth}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-emerald-950/30 border border-emerald-900/50">
                        <span className="text-[9px] text-emerald-400 block font-bold">3. Interviews</span>
                        <span className="text-[10px] text-slate-200 block truncate">{cycle.timelinePhases.interviewMonth}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-purple-950/30 border border-purple-900/50">
                        <span className="text-[9px] text-purple-400 block font-bold">4. Join Date</span>
                        <span className="text-[10px] text-slate-200 block truncate">{cycle.timelinePhases.internshipStartMonth}</span>
                      </div>
                    </div>
                  </div>

                  {/* Advance Preparation Topics Checklist */}
                  <div className="mt-3.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-indigo-400" />
                      Key Topics to Master In Advance:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cycle.keyPreparationTopics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700/80"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Strategic Action Tip */}
                  <div className="mt-3.5 p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-900/30 text-xs text-indigo-200/90 leading-relaxed font-sans">
                    <span className="font-bold text-indigo-300 font-mono text-[11px] block mb-0.5">
                      💡 Preparation Strategy:
                    </span>
                    {cycle.actionTip}
                  </div>
                </div>

                {/* Footer Action Buttons: Prominent Official Careers Link + 1-Click Track Opportunity (Bookmark & Alert) */}
                <div className="mt-5 pt-3.5 border-t border-slate-800/80 space-y-2.5">
                  {/* Primary Link: Official Careers Portal (Prominent) */}
                  <a
                    href={cycle.officialCareersUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-indigo-950 cursor-pointer"
                  >
                    <span>Official Careers Portal ↗ (Confirm on {cycle.companyName})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* 1-Click "Track This Opportunity" Bookmark + Alert Button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    {trackedCycleIds.includes(cycle.id) ? (
                      <div className="flex-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleTrack(cycle)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-black transition-all cursor-pointer bg-emerald-950/90 text-emerald-200 border border-emerald-500/80 shadow-md shadow-emerald-500/20 hover:bg-emerald-900/80"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <Bell className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                          <span>✓ Tracked & Alerts Active</span>
                        </button>

                        <a
                          href={createGoogleCalendarUrl(cycle, referenceDate)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 shadow-sm shrink-0"
                          title="Add opening and closing dates to your Google Calendar"
                        >
                          <CalendarPlus className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="hidden sm:inline">Google Cal</span>
                        </a>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleTrack(cycle)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-indigo-500/80 hover:shadow-md hover:shadow-indigo-500/10 group"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                        <Bell className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                        <span>Track This Opportunity</span>
                      </button>
                    )}

                    <div className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-850 flex items-center justify-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>~{cycle.prepTimeRemainingMonths} Mo Runway</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 border border-indigo-500/80 text-white text-xs font-mono shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1 text-slate-200">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-1 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

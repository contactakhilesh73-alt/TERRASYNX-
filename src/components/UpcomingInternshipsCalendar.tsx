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
import { UpcomingInternshipCycle, InternshipCycleCurrentStatus } from '../types';
import { UpcomingInternshipsService, RECURRING_ANNUAL_INTERNSHIPS } from '../services/upcomingInternshipsService';
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
  Flame
} from 'lucide-react';

interface UpcomingInternshipsCalendarProps {
  onNavigateToCalendar?: () => void;
  onBookmarkReminder?: (cycle: UpcomingInternshipCycle) => void;
}

type StatusTab = InternshipCycleCurrentStatus;

export const UpcomingInternshipsCalendar: React.FC<UpcomingInternshipsCalendarProps> = ({
  onNavigateToCalendar,
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

  // 3 Primary Status Tabs
  const [activeStatusTab, setActiveStatusTab] = useState<StatusTab>('OPEN_NOW');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<number | 'all'>('all');
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

  // Dynamic counts for each tab
  const tabCounts = useMemo(() => {
    return {
      OPEN_NOW: allCycles.filter(c => c.currentStatus === 'OPEN_NOW').length,
      UPCOMING: allCycles.filter(c => c.currentStatus === 'UPCOMING').length,
      PASSED_THIS_CYCLE: allCycles.filter(c => c.currentStatus === 'PASSED_THIS_CYCLE').length,
    };
  }, [allCycles]);

  // Filtered and day-level sorted cycles
  const filteredCycles = useMemo(() => {
    return UpcomingInternshipsService.filterUpcomingCycles({
      status: activeStatusTab,
      month: selectedMonth,
      targetBatch: selectedBatch === 'all' ? undefined : selectedBatch,
      query: searchQuery,
      currentDate: referenceDate,
    });
  }, [activeStatusTab, selectedMonth, selectedBatch, searchQuery, referenceDate]);

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

        {/* 3 Main Status Tabs: Chal Rahi Hai, Aage Aane Wali, Is Saal Nikal Gayi */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            
            {/* Tab 1: Chal Rahi Hai (Open Now) */}
            <button
              onClick={() => setActiveStatusTab('OPEN_NOW')}
              className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                activeStatusTab === 'OPEN_NOW'
                  ? 'bg-emerald-950/50 border-emerald-500/80 shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${activeStatusTab === 'OPEN_NOW' ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500/60'}`} />
                <div>
                  <span className={`text-xs font-bold block ${activeStatusTab === 'OPEN_NOW' ? 'text-emerald-300 font-mono' : 'text-slate-200'}`}>
                    Chal Rahi Hai (Open Now)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    Application window abhi active hai
                  </span>
                </div>
              </div>
              <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-md border ${
                activeStatusTab === 'OPEN_NOW'
                  ? 'bg-emerald-900/60 text-emerald-200 border-emerald-700'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {tabCounts.OPEN_NOW}
              </span>
            </button>

            {/* Tab 2: Aage Aane Wali (Upcoming) */}
            <button
              onClick={() => setActiveStatusTab('UPCOMING')}
              className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                activeStatusTab === 'UPCOMING'
                  ? 'bg-sky-950/50 border-sky-500/80 shadow-lg shadow-sky-950/40'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${activeStatusTab === 'UPCOMING' ? 'bg-sky-400' : 'bg-sky-500/60'}`} />
                <div>
                  <span className={`text-xs font-bold block ${activeStatusTab === 'UPCOMING' ? 'text-sky-300 font-mono' : 'text-slate-200'}`}>
                    Aage Aane Wali (Upcoming)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    Window aane wale mahino me khulegi
                  </span>
                </div>
              </div>
              <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-md border ${
                activeStatusTab === 'UPCOMING'
                  ? 'bg-sky-900/60 text-sky-200 border-sky-700'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {tabCounts.UPCOMING}
              </span>
            </button>

            {/* Tab 3: Is Saal Nikal Gayi (Passed) */}
            <button
              onClick={() => setActiveStatusTab('PASSED_THIS_CYCLE')}
              className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                activeStatusTab === 'PASSED_THIS_CYCLE'
                  ? 'bg-slate-850 border-slate-600 shadow-lg shadow-slate-950/40'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <div>
                  <span className={`text-xs font-bold block ${activeStatusTab === 'PASSED_THIS_CYCLE' ? 'text-slate-200 font-mono' : 'text-slate-300'}`}>
                    Is Saal Nikal Gayi (Passed)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                    Is saal ka window band ho chuka hai
                  </span>
                </div>
              </div>
              <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-md border ${
                activeStatusTab === 'PASSED_THIS_CYCLE'
                  ? 'bg-slate-800 text-slate-200 border-slate-600'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {tabCounts.PASSED_THIS_CYCLE}
              </span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Controls (Month & Batch & Search) */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

          {/* Batch Selector & Search */}
          <div className="flex items-center gap-2">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              aria-label="Filter by Graduation Batch"
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Batches</option>
              <option value={2026}>Batch 2026</option>
              <option value={2027}>Batch 2027</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search company or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-36 sm:w-48"
              />
            </div>
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

            return (
              <div
                key={cycle.id}
                className="rounded-2xl border border-slate-800/90 hover:border-indigo-500/40 bg-slate-900/60 hover:bg-slate-900/90 p-5 transition-all flex flex-col justify-between shadow-lg hover:shadow-indigo-500/5 group"
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
                      </div>
                    </div>

                    {/* Cycle Status Pill (Open Now / Upcoming / Passed) */}
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border shrink-0 flex items-center gap-1.5 ${statusBadge.containerClass}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
                      <StatusIcon className="w-3 h-3" />
                      <span>{statusBadge.label}</span>
                    </div>
                  </div>

                  {/* Authenticity Status (Strictly Distinguished from Live Scraped Verified Badge) */}
                  <div className="mt-3 flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/70 border border-slate-800">
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

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        Target Batches:
                      </span>
                      <span className="font-mono font-bold text-cyan-300">
                        {cycle.targetBatches.map(b => `Batch ${b}`).join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                        Historical Compensation:
                      </span>
                      <span className="font-mono text-slate-300 text-[11px]">
                        {cycle.historicalCompensation}
                      </span>
                    </div>
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

                {/* Footer Action Buttons: Prominent Official Careers Link + Calendar Reminder */}
                <div className="mt-5 pt-3.5 border-t border-slate-800/80 space-y-2">
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

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddCalendarReminder(cycle)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        isReminderSet
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white'
                      }`}
                    >
                      {isReminderSet ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Reminder Added!</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Add to Prep Calendar</span>
                        </>
                      )}
                    </button>

                    <div className="px-2 py-1 rounded-lg text-[10px] font-mono text-slate-500 bg-slate-950 border border-slate-850 flex items-center gap-1 shrink-0">
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
    </div>
  );
};

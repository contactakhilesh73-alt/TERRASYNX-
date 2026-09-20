/**
 * TERRASYNX: Upcoming Predictable Annual Internship Recruitment Calendar Component
 * Displays authentic recurring recruitment windows, expected announcement months,
 * timeline phases, and advance preparation roadmaps for top tier companies.
 */

import React, { useState, useMemo } from 'react';
import { UpcomingInternshipCycle } from '../types';
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
  Award, 
  Compass, 
  BookOpen, 
  Bell, 
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';

interface UpcomingInternshipsCalendarProps {
  onNavigateToCalendar?: () => void;
  onBookmarkReminder?: (cycle: UpcomingInternshipCycle) => void;
}

export const UpcomingInternshipsCalendar: React.FC<UpcomingInternshipsCalendarProps> = ({
  onNavigateToCalendar,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reminderAddedMap, setReminderAddedMap] = useState<Record<string, boolean>>({});

  const monthsList = [
    { key: 'all', label: 'All Windows' },
    { key: 'june', label: 'June' },
    { key: 'july', label: 'July' },
    { key: 'august', label: 'August' },
    { key: 'september', label: 'September' },
    { key: 'october', label: 'October' },
  ];

  const filteredCycles = useMemo(() => {
    return UpcomingInternshipsService.filterUpcomingCycles({
      month: selectedMonth,
      targetBatch: selectedBatch === 'all' ? undefined : selectedBatch,
      query: searchQuery,
    });
  }, [selectedMonth, selectedBatch, searchQuery]);

  const handleAddCalendarReminder = (cycle: UpcomingInternshipCycle) => {
    const now = Date.now();
    // Schedule announcement alert in calendar
    const eventTitle = `[ANNOUNCEMENT WINDOW] ${cycle.companyName} ${cycle.programTitle}`;
    CalendarSyncService.addCustomEvent({
      id: `cal_rem_${cycle.id}_${now}`,
      opportunityId: cycle.id,
      companyName: cycle.companyName,
      companyDomain: cycle.companyDomain,
      jobTitle: cycle.programTitle,
      eventType: 'follow_up_deadline',
      title: eventTitle,
      description: `Expected announcement window opens for ${cycle.companyName}. Target batches: ${cycle.targetBatches.join(', ')}. Official portal: ${cycle.officialCareersUrl}`,
      startTime: now + (cycle.prepTimeRemainingMonths * 30 * 24 * 60 * 60 * 1000),
      endTime: now + (cycle.prepTimeRemainingMonths * 30 * 24 * 60 * 60 * 1000) + 3600000,
      durationMinutes: 60,
      platform: 'Direct Careers Portal',
      meetingLink: cycle.officialCareersUrl,
      status: 'scheduled',
      preparationChecklist: [
        `Review key preparation topics: ${cycle.keyPreparationTopics.join(', ')}`,
        `Check official career portal: ${cycle.officialCareersUrl}`,
        `Update resume with latest university projects before applications open`
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
                PREDICTABLE RECURRING HIRING CYCLES
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                100% Truth-Anchored (Zero Mock Data)
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Upcoming Internship Announcement Calendar
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Top-tier engineering programs (Google, Microsoft, Amazon, Uber, Goldman Sachs) follow fixed annual recruitment cycles. 
              View exact expected announcement months, milestone timelines, and preparation topics to get months of strategic runway ahead of the rush.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-center">
              <span className="block text-2xl font-black font-mono text-indigo-400">
                {RECURRING_ANNUAL_INTERNSHIPS.length}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Annual Programs
              </span>
            </div>
            {onNavigateToCalendar && (
              <button
                onClick={onNavigateToCalendar}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>View Full Calendar</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Month Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {monthsList.map(m => (
              <button
                key={m.key}
                onClick={() => setSelectedMonth(m.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
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
                placeholder="Search upcoming..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-36 sm:w-48"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Upcoming Annual Internship Cycles */}
      {filteredCycles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/60">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-400">No seasonal cycles match this filter</p>
          <p className="text-xs text-slate-500 mt-1">Try switching to &quot;All Windows&quot; or clear your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCycles.map(cycle => {
            const isReminderSet = reminderAddedMap[cycle.id];

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

                    <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      ~{cycle.prepTimeRemainingMonths} Mo Runway
                    </span>
                  </div>

                  {/* Announcement & Schedule Badges */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        Announcement Month:
                      </span>
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                        {cycle.expectedAnnouncementMonth}
                      </span>
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
                        Historical Pay:
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

                {/* Footer Action Buttons */}
                <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddCalendarReminder(cycle)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
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
                        <span>Notify & Add Reminder</span>
                      </>
                    )}
                  </button>

                  <a
                    href={cycle.officialCareersUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

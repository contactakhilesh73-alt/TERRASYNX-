/**
 * TERRASYNX: Automated Assessment & Interview Calendar Studio (Phase 4 Point 2)
 * Full interactive scheduler cockpit supporting:
 * - Upcoming Assessment and Interview Timeline
 * - 1-Click Google Calendar direct sync
 * - RFC 5545 .ics Apple/Outlook Calendar export
 * - Add/Schedule custom interviews from active requisitions
 * - Preparation checklist and platform details
 */

import React, { useState, useEffect } from 'react';
import { CalendarEvent, Opportunity, StudentProfile, CalendarEventType } from '../types';
import { CalendarSyncService } from '../services/calendarSyncService';
import { CompanyLogo } from './CompanyLogo';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Download, 
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Code2, 
  Users, 
  FileText, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building2,
  ListTodo
} from 'lucide-react';

interface CalendarSyncViewProps {
  opportunities: Opportunity[];
  studentProfile: StudentProfile;
  onOpenOpportunity: (opp: Opportunity) => void;
  onNavigateToPipeline: () => void;
}

export const CalendarSyncView: React.FC<CalendarSyncViewProps> = ({
  opportunities,
  studentProfile,
  onOpenOpportunity,
  onNavigateToPipeline,
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>(() => 
    CalendarSyncService.getInitialEvents(opportunities)
  );
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [filterType, setFilterType] = useState<string>('all');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);

  // Modal form state
  const [selectedOppId, setSelectedOppId] = useState<string>(opportunities[0]?.id || '');
  const [eventTypeInput, setEventTypeInput] = useState<CalendarEventType>('oa_test');
  const [dateInput, setDateInput] = useState<string>('');
  const [timeInput, setTimeInput] = useState<string>('14:00');
  const [durationInput, setDurationInput] = useState<number>(60);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    // Set default date input to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setDateInput(`${yyyy}-${mm}-${dd}`);
  }, []);

  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];

  const filteredEvents = events.filter(e => {
    if (filterType === 'all') return true;
    return e.eventType === filterType;
  }).sort((a, b) => a.startTime - b.startTime);

  const handleDownloadIcs = (event: CalendarEvent) => {
    CalendarSyncService.downloadIcs(event);
    setDownloadSuccessToast(`Downloaded .ics for ${event.companyName}!`);
    setTimeout(() => setDownloadSuccessToast(null), 3000);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const targetOpp = opportunities.find(o => o.id === selectedOppId);
    if (!targetOpp) return;

    const [year, month, day] = dateInput.split('-').map(Number);
    const [hours, minutes] = timeInput.split(':').map(Number);
    const scheduledDate = new Date(year, month - 1, day, hours, minutes);

    const newEvent = CalendarSyncService.scheduleEventFromOpportunity(
      targetOpp,
      eventTypeInput,
      scheduledDate,
      durationInput
    );

    const updated = [newEvent, ...events];
    setEvents(updated);
    CalendarSyncService.saveEvents(updated);
    setSelectedEventId(newEvent.id);
    setIsScheduleModalOpen(false);
  };

  const formatEventDate = (timestampMs: number): string => {
    const d = new Date(timestampMs);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatEventTime = (timestampMs: number): string => {
    const d = new Date(timestampMs);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventBadge = (type: CalendarEventType) => {
    switch (type) {
      case 'oa_test':
        return { label: 'Online Assessment', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'technical_interview':
        return { label: 'Technical Interview', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      case 'system_design':
        return { label: 'System Design', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'recruiter_screen':
        return { label: 'Recruiter Chat', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'follow_up_deadline':
        return { label: '7-Day Follow-Up', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
      default:
        return { label: 'Event', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-emerald-500 text-emerald-300 shadow-2xl flex items-center gap-3 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{downloadSuccessToast}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-teal-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 font-mono text-xs uppercase tracking-widest mb-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Automated Assessment &amp; Interview Scheduler • Phase 4 Point 2</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Assessment &amp; Interview Calendar Sync Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Synchronize verified online assessments (HackerRank, CodeSignal) and recruiter interviews with 
            <strong> Google Calendar</strong> and <strong>RFC 5545 .ics</strong> export. Includes curated pre-round checklists.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 font-mono shadow-md cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Event</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Event Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              filterType === 'all' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setFilterType('oa_test')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              filterType === 'oa_test' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Coding Assessments
          </button>
          <button
            onClick={() => setFilterType('technical_interview')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              filterType === 'technical_interview' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Interviews
          </button>
          <button
            onClick={() => setFilterType('recruiter_screen')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              filterType === 'recruiter_screen' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recruiter Screens
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          Sync Standard: <strong className="text-teal-300">RFC 5545 iCalendar + Google Web Intent</strong>
        </span>
      </div>

      {/* Main Studio Grid: Left List (5 cols) & Right Detail + Sync Console (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scheduled Event Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredEvents.map(evt => {
              const isSelected = evt.id === activeEvent?.id;
              const badge = getEventBadge(evt.eventType);
              const isUrgent = evt.status === 'urgent';

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900/90 border-teal-500/70 shadow-lg shadow-teal-950/40 ring-1 ring-teal-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <CompanyLogo domain={evt.companyDomain} name={evt.companyName} size="sm" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{evt.companyName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{evt.platform || 'Online'}</span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 font-medium mt-2.5 line-clamp-1">{evt.title}</p>

                  <div className="mt-3 pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <CalendarIcon className="w-3 h-3 text-teal-400" />
                      {formatEventDate(evt.startTime)}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatEventTime(evt.startTime)} ({evt.durationMinutes}m)
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredEvents.length === 0 && (
              <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-slate-500 text-xs font-mono">
                No events found for this filter.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Event Detail & 1-Click Sync Console (7 cols) */}
        {activeEvent && (
          <div className="lg:col-span-7 space-y-5">
            {/* Active Card */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <CompanyLogo domain={activeEvent.companyDomain} name={activeEvent.companyName} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{activeEvent.companyName}</h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getEventBadge(activeEvent.eventType).color}`}>
                        {getEventBadge(activeEvent.eventType).label}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-teal-300 mt-1">{activeEvent.title}</h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{activeEvent.jobTitle}</p>
                  </div>
                </div>
              </div>

              {/* Schedule Info Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Date</span>
                  <span className="font-bold text-slate-200 mt-0.5 block">{formatEventDate(activeEvent.startTime)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Time &amp; Duration</span>
                  <span className="font-bold text-teal-300 mt-0.5 block">
                    {formatEventTime(activeEvent.startTime)} ({activeEvent.durationMinutes} mins)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Testing / Meet Platform</span>
                  <span className="font-bold text-slate-200 mt-0.5 block truncate">{activeEvent.platform || 'Online Video'}</span>
                </div>
              </div>

              {/* Description */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-850 text-xs text-slate-300 leading-relaxed">
                {activeEvent.description}
              </div>

              {/* Pre-Round Preparation Checklist */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-300 uppercase tracking-wider">
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>Curated Round Preparation Checklist</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc font-sans">
                  {activeEvent.preparationChecklist.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>

              {/* 1-Click Sync Controls */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Calendar Alarm Auto-Injected (-30 mins)</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleDownloadIcs(activeEvent)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-400" />
                    <span>Download .ICS (Apple/Outlook)</span>
                  </button>

                  <a
                    href={CalendarSyncService.getGoogleCalendarUrl(activeEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 shadow-md shadow-teal-950 transition-all cursor-pointer"
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>Add to Google Calendar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Custom Event Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <CalendarIcon className="w-4 h-4 text-teal-400" />
                <span>Schedule Assessment / Interview</span>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Target Requisition</label>
                <select
                  value={selectedOppId}
                  onChange={(e) => setSelectedOppId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                >
                  {opportunities.map(opp => (
                    <option key={opp.id} value={opp.id}>
                      {opp.companyName} — {opp.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Event Category</label>
                <select
                  value={eventTypeInput}
                  onChange={(e) => setEventTypeInput(e.target.value as CalendarEventType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="oa_test">Online Coding Assessment (OA)</option>
                  <option value="technical_interview">Technical &amp; Coding Round</option>
                  <option value="system_design">System Design &amp; Architecture</option>
                  <option value="recruiter_screen">Recruiter Screen</option>
                  <option value="follow_up_deadline">7-Day Follow-Up Milestone</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  step="15"
                  value={durationInput}
                  onChange={(e) => setDurationInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold"
                >
                  Add to Sync Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

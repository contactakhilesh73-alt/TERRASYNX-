/**
 * TERRASYNX: Automated Assessment & Interview Calendar Sync Service (Phase 4 Point 2)
 * Manages calendar events, generates RFC 5545 compliant .ics files for Apple/Google/Outlook,
 * and handles direct 1-click Google Calendar web intent dispatch.
 */

import { CalendarEvent, Opportunity } from '../types';

export class CalendarSyncService {
  private static STORAGE_KEY = 'terrasynx_calendar_events_v1';
  private static PURGED_DEMO_OPP_IDS = new Set([
    'opp_stripe_infrastructure_2026',
    'opp_openai_swe_2026',
    'opp_google_step_2026',
    'opp_anthropic_swe_ai_2026',
    'opp_perplexity_ai_eng_2026',
    'opp_microsoft_swe_2026'
  ]);

  // Retrieve calendar events, purging any legacy demo entries from user storage (Strict Zero-Fake Policy)
  public static getInitialEvents(opportunities: Opportunity[]): CalendarEvent[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(e => !this.PURGED_DEMO_OPP_IDS.has(e.opportunityId));
          this.saveEvents(cleaned);
          return cleaned;
        }
      } catch (e) {
        console.warn('Failed to parse saved calendar events', e);
      }
    }

    this.saveEvents([]);
    return [];
  }

  public static saveEvents(events: CalendarEvent[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save calendar events', e);
    }
  }

  public static getEvents(): CalendarEvent[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(e => !this.PURGED_DEMO_OPP_IDS.has(e.opportunityId));
          return cleaned;
        }
      } catch (e) {
        console.warn('Failed to parse saved calendar events', e);
      }
    }
    return [];
  }

  // Adds or updates a calendar event (e.g., upcoming internship announcement alert)
  public static addCustomEvent(newEvent: CalendarEvent): void {
    const events = this.getEvents();
    const existingIndex = events.findIndex(e => e.id === newEvent.id);
    if (existingIndex >= 0) {
      events[existingIndex] = newEvent;
    } else {
      events.unshift(newEvent);
    }
    this.saveEvents(events);
  }

  // Generates RFC 5545 Standard iCalendar (.ics) string for direct download
  public static generateIcsContent(event: CalendarEvent): string {
    const formatDate = (dateMs: number): string => {
      const d = new Date(dateMs);
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const startFormatted = formatDate(event.startTime);
    const endFormatted = formatDate(event.endTime);
    const nowFormatted = formatDate(Date.now());
    const uid = `${event.id}@terrasynx.carrier-radar.app`;

    const cleanDescription = (event.description + '\n\nPreparation Checklist:\n' + event.preparationChecklist.map(c => `- ${c}`).join('\n'))
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,');

    const cleanTitle = event.title.replace(/,/g, '\\,');
    const location = (event.platform || 'Online Video Link').replace(/,/g, '\\,');

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Terrasynx//Carrier Assessment Scheduler 1.0//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowFormatted}`,
      `DTSTART:${startFormatted}`,
      `DTEND:${endFormatted}`,
      `SUMMARY:[Terrasynx] ${cleanTitle}`,
      `DESCRIPTION:${cleanDescription}`,
      `LOCATION:${location}`,
      event.meetingLink ? `URL:${event.meetingLink}` : '',
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Upcoming Assessment/Interview',
      'TRIGGER:-PT30M',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
  }

  // Generates 1-click Google Calendar web intent link
  public static getGoogleCalendarUrl(event: CalendarEvent): string {
    const formatDate = (dateMs: number): string => {
      const d = new Date(dateMs);
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const start = formatDate(event.startTime);
    const end = formatDate(event.endTime);
    const title = encodeURIComponent(`[Terrasynx] ${event.title}`);
    const details = encodeURIComponent(
      `${event.description}\n\nPlatform: ${event.platform || 'Online'}\n${event.meetingLink ? 'Link: ' + event.meetingLink : ''}\n\nPreparation Checklist:\n${event.preparationChecklist.map(c => '• ' + c).join('\n')}`
    );
    const location = encodeURIComponent(event.meetingLink || event.platform || 'Online Meeting');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  }

  // Creates and triggers download of .ics file
  public static downloadIcs(event: CalendarEvent): void {
    const icsContent = this.generateIcsContent(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.companyName.toLowerCase()}_${event.eventType}_schedule.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Quick-schedule a new assessment or interview linked to an opportunity
  public static scheduleEventFromOpportunity(
    opp: Opportunity,
    type: CalendarEvent['eventType'],
    scheduledDate: Date,
    durationMinutes: number = 60
  ): CalendarEvent {
    const titles: Record<CalendarEvent['eventType'], string> = {
      oa_test: `${opp.companyName} Online Coding Assessment (${opp.assessmentIntel.platform})`,
      technical_interview: `${opp.companyName} Technical & Coding Interview (${opp.department})`,
      system_design: `${opp.companyName} Systems Architecture & Scale Interview`,
      recruiter_screen: `${opp.companyName} Recruiter Introductory Chat`,
      follow_up_deadline: `${opp.companyName} 7-Day Application Follow-Up Check`,
    };

    const descriptions: Record<CalendarEvent['eventType'], string> = {
      oa_test: `Proctored coding assessment. Frequent topics: ${opp.assessmentIntel.frequentTopics.join(', ')}. Duration: ${opp.assessmentIntel.durationMinutes} mins.`,
      technical_interview: `Technical interview for ${opp.title}. Key skills demanded: ${opp.fitment.matchedSkills.slice(0, 3).join(', ')}.`,
      system_design: `System design and architecture interview focusing on distributed scalability and clean API contracts.`,
      recruiter_screen: `Preliminary recruiter discussion to align candidate credentials and verify work authorization.`,
      follow_up_deadline: `Follow-up milestone check for Requisition ID: ${opp.verification.requisitionId}.`,
    };

    const startTime = scheduledDate.getTime();
    const endTime = startTime + durationMinutes * 60 * 1000;

    return {
      id: `cal_custom_${Date.now()}`,
      opportunityId: opp.id,
      companyName: opp.companyName,
      companyDomain: opp.companyDomain,
      jobTitle: opp.title,
      eventType: type,
      title: titles[type],
      description: descriptions[type],
      startTime,
      endTime,
      durationMinutes,
      platform: type === 'oa_test' ? opp.assessmentIntel.platform : 'Google Meet / Zoom',
      status: 'scheduled',
      preparationChecklist: [
        `Review 10-D Fitment matching points for ${opp.companyName}`,
        `Test environment and microphone 15 minutes before scheduled start`,
        `Have resume and portfolio links readily accessible`
      ],
      syncStatus: {
        googleCalendar: false,
        icsExported: false,
      }
    };
  }
}

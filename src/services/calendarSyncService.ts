/**
 * TERRASYNX: Automated Assessment & Interview Calendar Sync Service (Phase 4 Point 2)
 * Manages calendar events, generates RFC 5545 compliant .ics files for Apple/Google/Outlook,
 * and handles direct 1-click Google Calendar web intent dispatch.
 */

import { CalendarEvent, Opportunity } from '../types';

export class CalendarSyncService {
  private static STORAGE_KEY = 'terrasynx_calendar_events_v1';

  // Seed default events derived directly from active opportunities (e.g. Stripe, OpenAI, Google)
  public static getInitialEvents(opportunities: Opportunity[]): CalendarEvent[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse saved calendar events', e);
      }
    }

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const defaultEvents: CalendarEvent[] = [
      {
        id: 'cal_stripe_oa_1',
        opportunityId: 'opp_stripe_infrastructure_2026',
        companyName: 'Stripe',
        companyDomain: 'stripe.com',
        jobTitle: 'Software Engineering Intern — Infrastructure',
        eventType: 'oa_test',
        title: 'Stripe Online Technical Assessment (HackerRank Proctored)',
        description: '90-minute timed coding assessment covering Concurrency Primitives, Idempotency, and API Design.',
        startTime: now + 1.5 * oneDay,
        endTime: now + 1.5 * oneDay + 90 * 60 * 1000,
        durationMinutes: 90,
        platform: 'HackerRank (Proctored)',
        meetingLink: 'https://hackerrank.com/tests/stripe-infra-2026-eval',
        status: 'urgent',
        preparationChecklist: [
          'Review Stripe API Idempotency pattern and retry headers',
          'Practice Mutex & Thread-safe Map implementations in Go/Java/Python',
          'Test webcam and secondary monitor restrictions in HackerRank sandbox'
        ],
        syncStatus: {
          googleCalendar: false,
          icsExported: false,
        }
      },
      {
        id: 'cal_openai_tech_1',
        opportunityId: 'opp_openai_swe_2026',
        companyName: 'OpenAI',
        companyDomain: 'openai.com',
        jobTitle: 'Member of Technical Staff Intern — Systems & Inference',
        eventType: 'technical_interview',
        title: 'OpenAI Technical Screen: High-Throughput Inference Primitives',
        description: '60-minute paired programming and live architecture session with an OpenAI Infrastructure Engineer.',
        startTime: now + 3 * oneDay,
        endTime: now + 3 * oneDay + 60 * 60 * 1000,
        durationMinutes: 60,
        platform: 'Google Meet',
        meetingLink: 'https://meet.google.com/oai-syst-inf',
        status: 'scheduled',
        preparationChecklist: [
          'Brush up on KV Cache memory quantization and GPU attention mechanics',
          'Review Python AsyncIO event loop internals vs. C++ worker pools',
          'Review project dossier on high-throughput micro-batching'
        ],
        syncStatus: {
          googleCalendar: false,
          icsExported: false,
        }
      },
      {
        id: 'cal_google_recruiter_1',
        opportunityId: 'opp_google_step_2026',
        companyName: 'Google',
        companyDomain: 'google.com',
        jobTitle: 'Software Engineer Intern — Summer 2026',
        eventType: 'recruiter_screen',
        title: 'Google University Talent Recruiter Connect (Batch 2026 Verification)',
        description: '30-minute informal check on graduation verification, team alignment, and coding assessment timeline.',
        startTime: now + 4.5 * oneDay,
        endTime: now + 4.5 * oneDay + 30 * 60 * 1000,
        durationMinutes: 30,
        platform: 'Google Meet',
        meetingLink: 'https://meet.google.com/goog-swe-int',
        status: 'scheduled',
        preparationChecklist: [
          'Have official graduation batch certificate and transcript on hand',
          'Prepare 2-minute elevator pitch highlighting distributed systems interests',
          'Inquire about team placement preferences (Cloud Spanner vs. Search Engine)'
        ],
        syncStatus: {
          googleCalendar: false,
          icsExported: false,
        }
      },
      {
        id: 'cal_anthropic_followup_1',
        opportunityId: 'opp_anthropic_swe_ai_2026',
        companyName: 'Anthropic',
        companyDomain: 'anthropic.com',
        jobTitle: 'AI Safety & Alignment Engineering Intern',
        eventType: 'follow_up_deadline',
        title: '7-Day Follow-Up Alert: Anthropic University Recruiting',
        description: 'Standard institutional follow-up window after initial portal application submission.',
        startTime: now + 6 * oneDay,
        endTime: now + 6 * oneDay + 15 * 60 * 1000,
        durationMinutes: 15,
        platform: 'Direct Email Dispatch',
        status: 'scheduled',
        preparationChecklist: [
          'Check application status on Anthropic Greenhouse careers portal',
          'Send brief polite check-in referencing CONF-2026 confirmation ID'
        ],
        syncStatus: {
          googleCalendar: false,
          icsExported: false,
        }
      }
    ];

    this.saveEvents(defaultEvents);
    return defaultEvents;
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse saved calendar events', e);
      }
    }
    return this.getInitialEvents([]);
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

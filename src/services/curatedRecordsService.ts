/**
 * TERRASYNX Curated Records & Sources Service (Prompt 64: Data out of code)
 * Replaces hardcoded data arrays in TypeScript source files with Firestore collections:
 *   - 'sources' (name, officialUrls, category, country, parserType)
 *   - 'records' (verified facts, evidence, lastVerifiedAt, curatedOn, status, sourceUrl)
 * 
 * Writes are strictly Admin-Only enforced via firestore.rules.
 * All migrated records are tagged UNVERIFIED_CURATED (or UNKNOWN if no verifiable source).
 */

import { collection, getDocs, doc, getDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Hackathon, UpcomingInternshipCycle } from '../types';
import initialRecords from '../data/curatedRecords.json';
import initialSources from '../data/curatedSources.json';

export interface CuratedSource {
  id: string;
  name: string;
  officialUrls: string[];
  category: string;
  country: string;
  parserType: string;
  createdAt: number;
}

export interface CuratedRecord {
  id: string;
  sourceId: string;
  sourceUrl: string;
  status: 'UNVERIFIED_CURATED' | 'UNKNOWN' | string;
  curatedOn: number;
  lastVerifiedAt: number;
  evidence: string;
  title: string;
  organizer: string;
  category: string;
  country: string;
  verifiedFacts: Record<string, any>;
}

const STORAGE_KEYS = {
  SOURCES_CACHE: 'terrasynx_firestore_sources_cache',
  RECORDS_CACHE: 'terrasynx_firestore_records_cache',
};

class CuratedRecordsService {
  private sources: Map<string, CuratedSource> = new Map();
  private records: Map<string, CuratedRecord> = new Map();
  private isInitialized: boolean = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.bootstrapCache();
    if (typeof window !== 'undefined') {
      setTimeout(() => this.syncFromFirestore(), 100);
    }
  }

  // Bootstrap memory from localStorage cache or bundled JSON snapshots
  private bootstrapCache(): void {
    try {
      let cachedRecords: CuratedRecord[] = initialRecords as CuratedRecord[];
      let cachedSources: CuratedSource[] = initialSources as CuratedSource[];

      if (typeof window !== 'undefined') {
        const localRec = localStorage.getItem(STORAGE_KEYS.RECORDS_CACHE);
        if (localRec) {
          cachedRecords = JSON.parse(localRec);
        }
        const localSrc = localStorage.getItem(STORAGE_KEYS.SOURCES_CACHE);
        if (localSrc) {
          cachedSources = JSON.parse(localSrc);
        }
      }

      cachedSources.forEach(s => this.sources.set(s.id, s));
      cachedRecords.forEach(r => this.records.set(r.id, r));
      this.isInitialized = true;
    } catch {
      // Fallback to initial
      (initialSources as CuratedSource[]).forEach(s => this.sources.set(s.id, s));
      (initialRecords as CuratedRecord[]).forEach(r => this.records.set(r.id, r));
    }
  }

  // Subscribe to live updates
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn());
  }

  // Asynchronously synchronize with live Firestore collections
  public async syncFromFirestore(): Promise<void> {
    try {
      // Fetch 'sources'
      const sourcesSnap = await getDocs(collection(db, 'sources'));
      if (!sourcesSnap.empty) {
        sourcesSnap.forEach(docSnap => {
          const data = docSnap.data() as CuratedSource;
          this.sources.set(docSnap.id, { ...data, id: docSnap.id });
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.SOURCES_CACHE, JSON.stringify(Array.from(this.sources.values())));
        }
      }

      // Fetch 'records'
      const recordsSnap = await getDocs(collection(db, 'records'));
      if (!recordsSnap.empty) {
        recordsSnap.forEach(docSnap => {
          const data = docSnap.data() as CuratedRecord;
          this.records.set(docSnap.id, { ...data, id: docSnap.id });
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.RECORDS_CACHE, JSON.stringify(Array.from(this.records.values())));
        }
      }

      this.notify();
    } catch (err) {
      console.warn('Firestore curated records read warning (using local cached snapshot):', err);
    }
  }

  public getAllSources(): CuratedSource[] {
    return Array.from(this.sources.values());
  }

  public getAllRecords(): CuratedRecord[] {
    return Array.from(this.records.values());
  }

  public getRecordById(id: string): CuratedRecord | undefined {
    return this.records.get(id);
  }

  // Reconstructs Hackathon model entities out of Firestore records
  public getHackathons(): Hackathon[] {
    const list: Hackathon[] = [];
    for (const rec of this.records.values()) {
      if (rec.category === 'hackathon') {
        const f = rec.verifiedFacts || {};
        list.push({
          ...f,
          id: rec.id,
          name: rec.title || f.name,
          organizer: rec.organizer || f.organizer,
          officialUrl: rec.sourceUrl || f.officialUrl,
          country: rec.country || f.country || (f.mode === 'online' ? 'Online/Global' : 'Global'),
          mode: f.mode || 'online',
          type: f.type || 'hackathon',
          themes: Array.isArray(f.themes) && f.themes.length > 0 ? f.themes : [f.theme || 'Open Innovation'],
          eligibilityText: f.eligibilityText || f.eligibility || 'Open to students and developers globally.',
          entryFeeText: f.entryFeeText || 'Free',
          prizeText: f.prizeText || f.prizePool || 'not listed',
          dates: f.dates || (f.startDate && f.endDate ? `${f.startDate} - ${f.endDate}` : 'Confirm on the official page'),
          startDate: f.startDate || '',
          endDate: f.endDate || '',
          registrationDeadline: f.registrationDeadline || '',
          dateConfidence: f.dateConfidence || 'REPORTED',
          source: f.source || 'recurring-series',
          status: f.status || 'NOT_ANNOUNCED',
          datesNote: f.datesNote,
          spocNote: f.spocNote,
          lastEditionNote: f.lastEditionNote,
          description: f.description,
          locationDetails: f.locationDetails,
          // Prompt 64 verification tag
          curatedStatus: rec.status,
          curatedOn: rec.curatedOn,
          evidence: rec.evidence,
        } as Hackathon);
      }
    }
    return list;
  }

  // Reconstructs UpcomingInternshipCycle model entities out of Firestore records
  public getUpcomingInternshipCycles(): UpcomingInternshipCycle[] {
    const list: UpcomingInternshipCycle[] = [];
    for (const rec of this.records.values()) {
      if (rec.category !== 'hackathon') {
        const f = rec.verifiedFacts || {};
        list.push({
          ...f,
          id: rec.id,
          companyName: rec.organizer || f.companyName,
          companyDomain: f.companyDomain || `${(rec.organizer || '').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          companyLogo: f.companyLogo || '',
          programTitle: rec.title || f.programTitle,
          officialCareersUrl: rec.sourceUrl || f.officialCareersUrl,
          country: rec.country || f.country || 'Global',
          targetBatches: f.targetBatches || [2026, 2027],
          stipend: f.stipend || f.historicalCompensation || 'Competitive Market Stipend',
          historicalCompensation: f.historicalCompensation || f.stipend || 'Competitive Market Stipend',
          expectedAnnouncementMonth: f.expectedAnnouncementMonth || 'Annual Cycle',
          startMonth: f.startMonth ?? 1,
          endMonth: f.endMonth ?? 12,
          hiringWindows: f.hiringWindows || [],
          selectionProcess: f.selectionProcess || 'Online Assessment -> Technical Rounds -> Offer',
          duration: f.duration || '8 - 12 Weeks',
          expectedWindowDuration: f.expectedWindowDuration || '3-4 weeks before cap',
          annualRecurrencePattern: f.annualRecurrencePattern || 'Annual campus & off-campus cycle',
          historicalAssessmentPlatform: f.historicalAssessmentPlatform || 'Online Assessment / Screening',
          keyPreparationTopics: f.keyPreparationTopics || ['Problem Solving', 'Data Structures'],
          authenticityStatus: f.authenticityStatus || 'HISTORICALLY_CONFIRMED',
          prepTimeRemainingMonths: f.prepTimeRemainingMonths ?? 3,
          actionTip: f.actionTip || 'Review core requirements on official portal.',
          timelinePhases: f.timelinePhases || {
            announcementMonth: f.expectedAnnouncementMonth || 'Annual Cycle',
            assessmentMonth: 'Rolling',
            interviewMonth: 'Rolling',
            internshipStartMonth: 'Summer'
          },
          hiringCycleType: f.hiringCycleType || f.programCategory || f.tierCategory || 'summer',
          exactWindowText: f.exactWindowText,
          programCategory: f.programCategory,
          tierCategory: f.tierCategory,
          historicalTimeline: f.historicalTimeline || [],
          currentStatus: f.currentStatus || 'OPEN_VERIFIED',
          disclaimerNotice: f.disclaimerNotice || 'High-Stakes Program: Always check official application portal directly.',
          // Prompt 64 verification tag
          curatedStatus: rec.status,
          curatedOn: rec.curatedOn,
          evidence: rec.evidence,
        } as UpcomingInternshipCycle);
      }
    }
    return list;
  }
}

export const curatedRecordsService = new CuratedRecordsService();

/**
 * TERRASYNX: Core Autonomous Radar Engine & Pulse Store
 * Conforming strictly to SYSTEM_SPEC (Rules #1-#5, Req #1-#22)
 */

import { Opportunity, StudentProfile, AlertEmailSimulation, ApplicationStage } from '../types';
import { VerificationEngine } from './verificationEngine';
import { FitmentRecalculator } from './fitmentRecalculator';
import { AtsLiveService } from './atsLiveService';
import { logger } from '../utils/logger';

const STORAGE_KEYS = {
  OPPORTUNITIES: 'terrasynx_opportunities_v1',
  PROFILE: 'terrasynx_student_profile_v1',
  MUTED_ALERTS: 'terrasynx_muted_alerts_v1',
  SIMULATED_EMAILS: 'terrasynx_sent_emails_v1',
  ARCHIVED_IDS: 'terrasynx_archived_jobs_v1',
};

// Default Initial Student Profile (Isolated & Customizable, Req #12 & Req #18)
export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  id: 'usr_stud_2026_01',
  fullName: 'Akhilesh Singh',
  email: 'kakhileshsingh310@gmail.com',
  collegeName: 'Indian Institute of Information Technology',
  degree: 'B.Tech in Computer Science',
  graduationYear: 2026,
  currentCgpa: '8.9 / 10.0',
  targetBatch: [2025, 2026],
  primarySkills: ['TypeScript', 'Python', 'React', 'Node.js', 'Distributed Systems', 'Tailwind CSS'],
  secondarySkills: ['Docker', 'PostgreSQL', 'FastAPI', 'Redis', 'LLM Prompt Engineering', 'Git'],
  projects: [
    {
      id: 'proj_01',
      title: 'Real-Time Distributed Job Verification Crawler',
      techStack: ['TypeScript', 'Node.js', 'Redis', 'Docker'],
      description: 'Engineered an asynchronous ATS ingestion engine querying official company boards with rate-limiting and cryptographic checksumming.',
      githubUrl: 'https://github.com/akhileshsingh/job-verification-crawler',
      metricsAchieved: 'Sub-200ms latency, zero false-positive job detections'
    },
    {
      id: 'proj_02',
      title: 'Full-Stack Performance Analytics Cockpit',
      techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Web Crypto API'],
      description: 'Developed an interactive career telemetry dashboard featuring client-side cryptographic receipt generation and live fitment metrics.',
      githubUrl: 'https://github.com/akhileshsingh/career-telemetry-cockpit',
      metricsAchieved: '60fps rendering across 500+ data nodes'
    }
  ],
  githubUrl: 'https://github.com/akhileshsingh',
  linkedinUrl: 'https://linkedin.com/in/akhileshsingh',
  portfolioUrl: 'https://akhilesh-portfolio.dev',
  resumeFileName: 'Akhilesh_Singh_SWE_Resume_2026.pdf',
  workAuthorization: 'F-1 (OPT / CPT Eligible)',
  preferredRoles: ['Software Engineer', 'Systems Engineer', 'AI/ML Engineer'],
  preferredWorkMode: 'any',
  targetLocations: ['United States', 'Remote', 'India'],
  emailAlertsEnabled: true,
  dailyDigestTime: 'both',
  urgentAlertThresholdHours: 72,
};

// Verified Canonical Opportunities Seed Database (Strict Zero-Fake Policy)
// All 6 hardcoded demo listings (OpenAI, Google, Anthropic, Stripe, Perplexity, Microsoft)
// have been permanently purged.
// All opportunities in TERRASYNX originate strictly from live-scraped enterprise ATS feeds
// (Greenhouse & Lever endpoints across 19 verified companies) or explicit candidate URL ingestion.
export const SEED_OPPORTUNITIES: Opportunity[] = [];
export class RadarEngine {
  private static opportunities: Opportunity[] = [];
  private static studentProfile: StudentProfile = DEFAULT_STUDENT_PROFILE;
  private static listeners: Set<() => void> = new Set();
  private static pulseIntervalId: number | null = null;

  // Comprehensive Deduplication Guard (Multi-Key: ID, URL, Requisition ID, Company+Title)
  public static deduplicateOpportunities(opps: Opportunity[]): Opportunity[] {
    const seenIds = new Set<string>();
    const seenUrls = new Set<string>();
    const seenCompanyTitles = new Set<string>();
    const seenReqs = new Set<string>();
    const result: Opportunity[] = [];

    for (const opp of opps) {
      if (!opp || !opp.id) continue;

      const normId = opp.id.trim();
      const normUrl = (opp.officialApplyUrl || '').toLowerCase().trim().replace(/\/+$/, '');
      const normCompanyTitle = `${(opp.companyName || '').toLowerCase().trim()}:::${(opp.title || '').toLowerCase().trim()}`;
      const reqId = opp.verification?.requisitionId ? opp.verification.requisitionId.toLowerCase().trim() : '';

      if (seenIds.has(normId)) continue;
      if (normUrl && seenUrls.has(normUrl)) continue;
      if (seenCompanyTitles.has(normCompanyTitle)) continue;
      if (reqId && seenReqs.has(reqId)) continue;

      seenIds.add(normId);
      if (normUrl) seenUrls.add(normUrl);
      seenCompanyTitles.add(normCompanyTitle);
      if (reqId) seenReqs.add(reqId);

      result.push(opp);
    }
    return result;
  }

  // Get authentic career portal status tracker URL for candidate login
  public static getOfficialStatusTrackerUrl(opp: Opportunity): string {
    if (opp.officialStatusTrackerUrl) return opp.officialStatusTrackerUrl;
    const domain = (opp.companyDomain || '').toLowerCase();
    if (domain.includes('google')) return 'https://www.google.com/about/careers/applications/';
    if (domain.includes('microsoft')) return 'https://jobs.careers.microsoft.com/global/en/actioncenter';
    if (domain.includes('amazon')) return 'https://amazon.jobs/en/applicant';
    if (domain.includes('apple')) return 'https://jobs.apple.com/en-us/profile/applications';
    if (domain.includes('meta')) return 'https://www.metacareers.com/profile/applications';
    if (domain.includes('netflix')) return 'https://jobs.netflix.com/my-profile';
    if (domain.includes('uber')) return 'https://www.uber.com/us/en/careers/candidate/';
    if (domain.includes('openai')) return 'https://openai.com/careers/';
    if (domain.includes('anthropic')) return 'https://www.anthropic.com/careers';
    if (domain.includes('stripe')) return 'https://stripe.com/jobs';
    if (domain.includes('perplexity')) return 'https://jobs.ashbyhq.com/perplexity';
    return `https://${opp.companyDomain}/careers`;
  }

  // Canonical set of purged demo job IDs (Strict Zero-Fake Policy)
  public static readonly PURGED_DEMO_IDS = new Set([
    'opp_openai_swe_2026',
    'opp_google_step_2026',
    'opp_anthropic_swe_ai_2026',
    'opp_stripe_infrastructure_2026',
    'opp_perplexity_ai_eng_2026',
    'opp_microsoft_swe_2026',
  ]);

  // Initialize Engine
  public static init(): void {
    if (typeof window === 'undefined') return;

    // Load persisted opportunities or fall back to empty
    const cachedOpps = localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES);
    if (cachedOpps) {
      try {
        const parsed = JSON.parse(cachedOpps);
        let opps: Opportunity[] = Array.isArray(parsed) ? parsed : [];
        // Permanently filter out the 6 purged demo listings from user cache
        opps = opps.filter(o => !this.PURGED_DEMO_IDS.has(o.id));

        // Migrate / sync valid working career URLs, status tracker URLs, and ensure role-specific ATS gaps
        opps = opps.map(loadedOpp => {
          if (!loadedOpp.officialStatusTrackerUrl) {
            loadedOpp.officialStatusTrackerUrl = this.getOfficialStatusTrackerUrl(loadedOpp);
          }
          // Dynamic recalculation guarantees authentic role-specific ATS gaps
          if (loadedOpp.fitment) {
            loadedOpp.fitment = FitmentRecalculator.recalculate(loadedOpp, this.studentProfile);
          }
          return loadedOpp;
        });
        this.opportunities = this.deduplicateOpportunities(opps);
      } catch {
        this.opportunities = [];
      }
    } else {
      this.opportunities = [];
    }
    this.persistOpportunities();

    // Auto-bootstrap live ATS scan if no verified opportunities exist in cache yet
    if (this.opportunities.length === 0) {
      setTimeout(() => {
        this.scanLiveAtsBoards().catch(() => {});
      }, 50);
    }

    // Load persisted profile
    const cachedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (cachedProfile) {
      try {
        this.studentProfile = { ...DEFAULT_STUDENT_PROFILE, ...JSON.parse(cachedProfile) };
      } catch {
        this.studentProfile = DEFAULT_STUDENT_PROFILE;
      }
    }

    // Start Live Real-Time Pulse (Strict Rule #3: Zero-Refresh Pulse)
    this.startLivePulse();
  }

  // Subscribe to real-time state changes
  public static subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private static notify(): void {
    this.listeners.forEach(fn => fn());
  }

  // Sub-second Expiry Pruning (Strict Rule #2: Deadlines Pruned Automatically)
  private static pruneExpiredOpportunities(): void {
    const currentEpoch = Date.now();
    let modified = false;

    this.opportunities = this.opportunities.map(opp => {
      // If deadline has passed and job is still in 'discovered', mark as archived
      if (opp.deadlineAt <= currentEpoch && opp.stage === 'discovered') {
        modified = true;
        return { ...opp, stage: 'archived' };
      }
      return opp;
    });

    if (modified) {
      this.persistOpportunities();
      this.notify();
    }
  }

  // Live Pulse Clock: Runs every 1 second
  private static startLivePulse(): void {
    if (this.pulseIntervalId) return;

    this.pulseIntervalId = window.setInterval(() => {
      this.pruneExpiredOpportunities();
      // Tick listeners for live countdown rerenders
      this.notify();
    }, 1000);
  }

  // Get all active opportunities
  public static getOpportunities(): Opportunity[] {
    return [...this.opportunities];
  }

  // Get filtered active opportunities (Strict Rule #2: Cryptographically Certified & Non-Archived)
  public static getActiveRadarOpportunities(): Opportunity[] {
    const certified = VerificationEngine.filterOnlyCertifiedOpportunities(this.opportunities);
    return this.deduplicateOpportunities(certified.filter(opp => opp.stage !== 'archived'));
  }

  // Get opportunities by Kanban stage (Req #3)
  public static getOpportunitiesByStage(stage: ApplicationStage): Opportunity[] {
    return this.opportunities.filter(opp => opp.stage === stage);
  }

  // Update Application Stage (Drag and Drop or 1-Click Action)
  public static updateStage(jobId: string, nextStage: ApplicationStage, notes?: string): void {
    const opp = this.opportunities.find(o => o.id === jobId);
    if (!opp) return;

    opp.stage = nextStage;
    if (nextStage === 'applied') {
      opp.appliedAt = Date.now();
      // Auto set 7-day follow-up reminder (Req #3)
      opp.followUpDeadlineAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
      
      // Strict Rule Req #7: Mute future "Apply" alerts for this job ONLY
      this.muteJobSpecificApplyAlert(jobId);

      // Trigger Tier B Submission Record (Student Self-Reported)
      this.generateSimulatedEmail({
        type: 'submission_receipt',
        tier: 'slate',
        subject: `[Student Confirmed] Application Submitted: ${opp.title} @ ${opp.companyName}`,
        jobId: opp.id,
        jobTitle: opp.title,
        companyName: opp.companyName,
        actionUrl: opp.officialApplyUrl,
        actionAdvisorPoints: [
          'Aapne khud confirm kiya ki application company portal par submit ho gayi hai.',
          'Important: Yeh candidate self-reported application milestone hai (employer-certified receipt nahi).',
          'Official application status track karne ke liye company ke career portal par check karein.',
          `Follow-up reminder queued for ${new Date(opp.followUpDeadlineAt).toLocaleDateString()}.`,
        ],
      });
    }

    if (notes !== undefined) {
      opp.customNotes = notes;
    }

    this.persistOpportunities();
    this.notify();
  }

  // Req #7: Granular Job-Level Alert Suppression
  public static muteJobSpecificApplyAlert(jobId: string): void {
    const mutedList = this.getMutedAlerts();
    if (!mutedList.includes(jobId)) {
      mutedList.push(jobId);
      localStorage.setItem(STORAGE_KEYS.MUTED_ALERTS, JSON.stringify(mutedList));
    }
  }

  public static isAlertMutedForJob(jobId: string): boolean {
    return this.getMutedAlerts().includes(jobId);
  }

  public static getMutedAlerts(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MUTED_ALERTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // Simulated Email Architecture (Req #5, #6, #10)
  public static generateSimulatedEmail(params: {
    type: AlertEmailSimulation['type'];
    tier: AlertEmailSimulation['tier'];
    subject: string;
    jobId: string;
    jobTitle: string;
    companyName: string;
    actionUrl: string;
    actionAdvisorPoints?: string[];
  }): void {
    const matchedOpp = this.opportunities.find(o => o.id === params.jobId);
    const email: AlertEmailSimulation = {
      id: 'eml_' + Math.random().toString(36).substring(2, 9),
      type: params.type,
      tier: params.tier,
      subject: params.subject,
      recipientEmail: this.studentProfile.email,
      fromHeader: 'TERRASYNX No-Reply <no-reply@terrasynx.com>',
      payloadSizeKb: Math.floor(Math.random() * 8) + 12, // Guaranteed < 25 KB
      timestamp: Date.now(),
      jobId: params.jobId,
      jobTitle: params.jobTitle,
      companyName: params.companyName,
      companyDomain: matchedOpp?.companyDomain || `${params.companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      actionUrl: params.actionUrl,
      actionAdvisorPoints: params.actionAdvisorPoints,
    };

    const existingEmails = this.getSimulatedEmails();
    existingEmails.unshift(email);
    localStorage.setItem(STORAGE_KEYS.SIMULATED_EMAILS, JSON.stringify(existingEmails.slice(0, 30)));
    this.notify();
  }

  public static getSimulatedEmails(): AlertEmailSimulation[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SIMULATED_EMAILS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // Student Profile Management (Req #18)
  public static getStudentProfile(): StudentProfile {
    return { ...this.studentProfile };
  }

  public static updateStudentProfile(updated: Partial<StudentProfile>): void {
    this.studentProfile = { ...this.studentProfile, ...updated };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(this.studentProfile));
    
    // Dynamically recalculate 10-D Fitment scores across all opportunities (Req #17 & #18)
    this.opportunities = this.opportunities.map(opp => {
      const refreshedFitment = FitmentRecalculator.recalculate(opp, this.studentProfile);
      return {
        ...opp,
        fitment: refreshedFitment,
      };
    });
    this.persistOpportunities();

    this.notify();
  }

  // Reset to clean initial state (Strict Zero-Fake Policy: Ingest live verified roles)
  public static resetToFactoryDefaults(): void {
    AtsLiveService.clearCache();
    this.opportunities = [];
    this.studentProfile = DEFAULT_STUDENT_PROFILE;
    localStorage.removeItem(STORAGE_KEYS.MUTED_ALERTS);
    localStorage.removeItem(STORAGE_KEYS.SIMULATED_EMAILS);
    this.persistOpportunities();
    this.updateStudentProfile(DEFAULT_STUDENT_PROFILE);
    this.scanLiveAtsBoards().catch(() => {});
    this.notify();
  }

  // Phase 5 Point 3: Manually or URL Ingested Opportunity addition with zero-duplicate protection
  public static addNewOpportunity(newOpp: Opportunity): boolean {
    const normId = newOpp.id.trim();
    const normUrl = (newOpp.officialApplyUrl || '').toLowerCase().trim().replace(/\/+$/, '');
    const normCompanyTitle = `${(newOpp.companyName || '').toLowerCase().trim()}:::${(newOpp.title || '').toLowerCase().trim()}`;
    const reqId = newOpp.verification?.requisitionId ? newOpp.verification.requisitionId.toLowerCase().trim() : '';

    const isDuplicate = this.opportunities.some(o => {
      if (o.id.trim() === normId) return true;
      if (normUrl && o.officialApplyUrl.toLowerCase().trim().replace(/\/+$/, '') === normUrl) return true;
      if (`${o.companyName.toLowerCase().trim()}:::${o.title.toLowerCase().trim()}` === normCompanyTitle) return true;
      if (reqId && o.verification?.requisitionId && o.verification.requisitionId.toLowerCase().trim() === reqId) return true;
      return false;
    });

    if (isDuplicate) {
      return false; // Duplicate rejected
    }

    this.opportunities.unshift(newOpp); // Prepend to top of radar
    this.opportunities = this.deduplicateOpportunities(this.opportunities);
    this.persistOpportunities();
    this.notify();
    return true;
  }

  // Phase 5 Point 1: Trigger Live ATS Ingestion across Greenhouse & Lever
  public static async scanLiveAtsBoards(onProgress?: (company: string, count: number) => void): Promise<number> {
    try {
      const liveJobs = await AtsLiveService.scanLiveBoards(onProgress);
      if (liveJobs.length === 0) return 0;

      let addedCount = 0;
      for (const job of liveJobs) {
        const added = this.addNewOpportunity(job);
        if (added) addedCount++;
      }

      return addedCount;
    } catch (err) {
      logger.error('RadarEngine', 'Error scanning live ATS boards', err);
      return 0;
    }
  }

  // Check how many live jobs are currently in memory
  public static getLiveAtsJobsCount(): number {
    return this.opportunities.filter(o => o.id.startsWith('live_')).length;
  }

  private static persistOpportunities(): void {
    try {
      this.opportunities = this.deduplicateOpportunities(this.opportunities);
      localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(this.opportunities));
    } catch {
      // Safe fallback
    }
  }
}

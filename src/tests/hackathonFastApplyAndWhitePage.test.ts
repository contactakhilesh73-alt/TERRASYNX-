import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HackathonTrackingService, HackathonApplicationRecord } from '../services/hackathonTrackingService';
import { Hackathon, StudentProfile } from '../types';

const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storage.get(key) || null,
  setItem: (key: string, value: string) => storage.set(key, String(value)),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

if (typeof window === 'undefined') {
  Object.defineProperty(globalThis, 'window', {
    value: {
      dispatchEvent: () => true,
      localStorage: localStorageMock,
    },
    writable: true,
  });
}

describe('Hackathon Fast Apply & Official White Page Engine', () => {
  const sampleHackathon: Hackathon = {
    id: 'sih_2026',
    name: 'Smart India Hackathon 2026',
    organizer: 'AICTE & MoE',
    mode: 'hybrid',
    country: 'India',
    themes: ['Smart Education', 'Disaster Management', 'Clean Energy', 'Healthcare'],
    eligibilityText: 'Indian college students (UG/PG), 6-member teams with at least 1 female member, institute SPOC nomination mandatory',
    entryFeeText: 'Free Entry',
    prizeText: '₹1,00,000 per problem statement across 100+ ministries and departments',
    dates: 'Grand Finale typically November-December, internal college round August-September',
    registrationDeadline: 'Confirm on official portal',
    officialUrl: 'https://sih.gov.in',
    source: 'recurring-series',
    status: 'NOT_ANNOUNCED',
    spocNote: 'SPOC nomination required. Check with your college nodal officer.',
    datesNote: 'Dates change every edition, confirm on the official page.',
  };

  const sampleProfile: StudentProfile = {
    id: 'student_123',
    fullName: 'Aditi Sharma',
    email: 'aditi.sharma@college.edu',
    phoneNumber: '+91 98765 43210',
    collegeName: 'National Institute of Technology',
    degree: 'B.Tech in Computer Science',
    graduationYear: 2026,
    currentCgpa: '8.9',
    targetBatch: [2026],
    primarySkills: ['React', 'Node.js', 'Python', 'AI/ML'],
    secondarySkills: ['Docker', 'PostgreSQL'],
    githubUrl: 'https://github.com/aditisharma',
    linkedinUrl: 'https://linkedin.com/in/aditisharma',
    workAuthorization: 'India / APAC Domestic Only',
    preferredRoles: ['Full Stack Engineer'],
    preferredWorkMode: 'hybrid',
    targetLocations: ['Bengaluru', 'Delhi NCR'],
    emailAlertsEnabled: true,
    dailyDigestTime: 'morning',
    urgentAlertThresholdHours: 48,
  };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('HackathonTrackingService - Application Persistence & Matching', () => {
    it('generates a transparent confirmation ID and SHA-256 integrity hash', async () => {
      const confId = HackathonTrackingService.generateConfirmationId('AICTE');
      expect(confId).toMatch(/^HACK-CONF-\d{4}-AICTE-[A-Z0-9]+$/);

      const hash = await HackathonTrackingService.generateSha256(`TEST-DATA-${confId}`);
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('records a new hackathon application and retrieves it by hackathonId and email', async () => {
      const confId = HackathonTrackingService.generateConfirmationId(sampleHackathon.organizer);
      const sha256 = await HackathonTrackingService.generateSha256(confId);

      const record: HackathonApplicationRecord = {
        confirmationId: confId,
        hackathonId: sampleHackathon.id,
        hackathonName: sampleHackathon.name,
        organizer: sampleHackathon.organizer,
        officialUrl: sampleHackathon.officialUrl,
        mode: sampleHackathon.mode,
        country: sampleHackathon.country,
        appliedTimestamp: Date.now(),
        applicantEmail: sampleProfile.email,
        applicantName: sampleProfile.fullName,
        collegeName: sampleProfile.collegeName,
        degree: sampleProfile.degree,
        graduationYear: sampleProfile.graduationYear,
        status: 'registered',
        source: 'fast_apply_assistant',
        sha256Proof: sha256,
        teamType: 'team',
        teamName: 'TechVanguard',
        selectedTheme: 'Healthcare',
        githubRepoUrl: sampleProfile.githubUrl,
        portfolioUrl: sampleProfile.linkedinUrl,
        receiptUrl: sampleHackathon.officialUrl,
      };

      HackathonTrackingService.recordApplication(record);

      // Verify retrieval by exact hackathon ID
      const retrieved = HackathonTrackingService.getApplicationForHackathon(sampleHackathon.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.confirmationId).toBe(confId);
      expect(retrieved?.applicantEmail).toBe('aditi.sharma@college.edu');
      expect(retrieved?.teamName).toBe('TechVanguard');

      // Verify email matching (case-insensitive)
      const emailFiltered = HackathonTrackingService.getApplicationForHackathon(
        sampleHackathon.id,
        'ADITI.SHARMA@COLLEGE.EDU'
      );
      expect(emailFiltered).toBeDefined();
      expect(emailFiltered?.confirmationId).toBe(confId);

      // Verify check for tracked state
      expect(HackathonTrackingService.isHackathonTracked(sampleHackathon.id, sampleProfile.email)).toBe(true);
      expect(HackathonTrackingService.isHackathonTracked('other_id', sampleProfile.email)).toBe(false);
    });

    it('updates application status from registered to submitted or shortlisted', () => {
      const confId = 'HACK-CONF-2026-AICTE-12345';
      const record: HackathonApplicationRecord = {
        confirmationId: confId,
        hackathonId: sampleHackathon.id,
        hackathonName: sampleHackathon.name,
        organizer: sampleHackathon.organizer,
        officialUrl: sampleHackathon.officialUrl,
        mode: sampleHackathon.mode,
        country: sampleHackathon.country,
        appliedTimestamp: Date.now(),
        applicantEmail: sampleProfile.email,
        applicantName: sampleProfile.fullName,
        collegeName: sampleProfile.collegeName,
        status: 'registered',
        source: 'direct_portal_tracked',
        sha256Proof: 'abcdef123456',
        teamType: 'solo',
        receiptUrl: sampleHackathon.officialUrl,
      };

      HackathonTrackingService.recordApplication(record);

      // Update status
      HackathonTrackingService.updateApplicationStatus(confId, 'shortlisted', 'Selected for Grand Finale round');

      const updated = HackathonTrackingService.getApplicationForHackathon(sampleHackathon.id);
      expect(updated?.status).toBe('shortlisted');
      expect(updated?.selfReportedNotes).toBe('Selected for Grand Finale round');
    });
  });

  describe('Official White Page HTML & Share Summary Generation', () => {
    it('generates an official white paper circular containing all key opportunity facts', () => {
      const html = HackathonTrackingService.generateWhitePageHTML(sampleHackathon, undefined, sampleProfile);

      // Must include official doc markings
      expect(html).toContain('Official Opportunity Circular');
      expect(html).toContain('Smart India Hackathon 2026');
      expect(html).toContain('AICTE &amp; MoE');

      // Must include prize pool / compensation
      expect(html).toContain('₹1,00,000 per problem statement');

      // Must include 100% Free guarantee
      expect(html).toContain('100% Free Guarantee');

      // Must include verbatim eligibility and the safety mandate
      expect(html).toContain('Indian college students');
      expect(html).toContain("Check the event's own official rules");

      // Must include official canonical link
      expect(html).toContain('https://sih.gov.in');

      // Must include mandatory submission deliverables
      expect(html).toContain('Working Source Code');
      expect(html).toContain('Demo Video');
    });

    it('generates a clean shareable summary for WhatsApp, email, or social media', () => {
      const summary = HackathonTrackingService.getShareableSummary(sampleHackathon);

      expect(summary.title).toContain('Smart India Hackathon 2026');
      expect(summary.text).toContain('🏆 Smart India Hackathon 2026');
      expect(summary.text).toContain('💰 Prize Pool: ₹1,00,000');
      expect(summary.text).toContain('✅ 100% Free - Verified Official Portal Link: https://sih.gov.in');
      expect(summary.url).toBe('https://sih.gov.in');
    });
  });
});

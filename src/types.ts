/**
 * TERRASYNX: Global Career Intelligence & Real-Time Opportunity Radar Platform
 * Core Data Models & Type Specifications
 * Strictly conforming to SYSTEM_SPEC (Strict Rules #1-#5, Requirements #1-#22)
 */

// Application Lifecycle Stages for Kanban Pipeline (Req #3)
export type ApplicationStage = 
  | 'discovered'    // Discovered on radar, not yet applied
  | 'applied'       // Applied on official portal (Mutes job-specific apply alerts, Req #7)
  | 'assessment'    // Online Assessment / Coding Test received (Req #9, #16)
  | 'interview'     // Recruiter screen / Technical interview rounds
  | 'offer'         // Official Offer Secured (Celebration Milestone, Req #10)
  | 'archived';     // Closed, rejected, or auto-pruned

// Opportunity Classification
export type OpportunityType = 'internship' | 'new-grad' | 'full-time' | 'fellowship';

export type WorkMode = 'remote' | 'hybrid' | 'on-site';

// Cryptographic & Origin Verification Proof (Strict Rule #2 & Req #2)
export interface VerificationProof {
  verified: boolean;
  sourceType: 'greenhouse' | 'lever' | 'ashby' | 'workday' | 'smartrecruiters' | 'direct_careers_domain';
  rootDomain: string;             // e.g. "openai.com", "google.com"
  endpointUrl: string;           // Direct API or careers portal URL
  lastCheckedTimestamp: number;   // Epoch ms of latest pulse check
  sslStatus: 'A+' | 'A' | 'VALID';
  noFeeGuarantee: boolean;        // 100% free authentic opportunity (no-scam guarantee)
  requisitionId: string;         // Official company job requisition identifier
}

// Student Eligibility Matrix (Req #1)
export interface EligibilityCriteria {
  allowedGraduationYears: number[];   // e.g. [2025, 2026, 2027]
  degrees: string[];                  // e.g. ["B.Tech", "B.E.", "BS", "BCA", "MCA", "MS"]
  undergradOnly: boolean;             // True for roles like OpenAI UG intern
  sponsorshipAvailable: boolean;      // Visa / work auth
  locationsAllowed: string[];         // Allowed regions / countries
}

// 10-Dimensional Fitment Assessment (Req #17 & Santiago-inspired A-F Evaluation)
export interface FitmentEvaluation {
  overallScore: number;               // 0 - 100%
  overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  dimensions: {
    roleFit: number;                  // 0 - 100
    skillsAlignment: number;          // 0 - 100
    batchEligibility: number;         // 0 - 100
    companyPrestige: number;          // 0 - 100
    learningTrajectory: number;       // 0 - 100
    compensationFairness: number;     // 0 - 100
  };
  missingSkills: string[];            // Critical ATS gaps to address (Req #13)
  matchedSkills: string[];            // Confirmed matching skills
  strategicVerdict: string;           // 1-2 sentence actionable executive advice
}

// Company Assessment Intelligence (Req #16)
export interface AssessmentIntelligence {
  hasHistoricalData: boolean;
  platform: 'HackerRank' | 'CodeSignal' | 'LeetCode' | 'Custom Take-Home' | 'Screening Call';
  durationMinutes: number;
  frequentTopics: string[];           // e.g. ["Dynamic Programming", "Concurrency", "Graphs"]
  difficulty: 'Easy' | 'Medium' | 'Hard';
  warmupPracticeUrl?: string;
}

// Compensation & Wage Transparency (Req #14)
export interface CompensationDetails {
  currency: string;                   // "USD" | "INR" | "EUR"
  range: string;                      // "$55 - $70 / hr" or "₹80,000 / month"
  period: 'hourly' | 'monthly' | 'annual';
  isPaid: boolean;
  transparentBenchmark: string;       // Levels.fyi / verified benchmark
}

// Core Verified Opportunity Model (Strict Rule #1 & #4)
export interface Opportunity {
  id: string;                         // Canonical unique identifier
  companyName: string;
  companyLogo: string;                // Real brand asset / SVG icon representation
  companyDomain: string;              // e.g. "openai.com"
  title: string;                      // e.g. "Software Engineer Intern - Systems (Summer 2026)"
  type: OpportunityType;
  workMode: WorkMode;
  location: string;
  department: string;                 // e.g. "Applied AI", "Infrastructure"
  officialApplyUrl: string;          // Strictly official application destination
  officialStatusTrackerUrl?: string; // Direct link to company candidate portal where students can log in and view live application status
  
  // Timestamps for Dynamic Urgency Radar (Req #11)
  releasedAt: number;                 // Epoch ms when role opened
  deadlineAt: number;                 // Epoch ms when role officially closes
  
  // Integrity & Proofs
  verification: VerificationProof;
  eligibility: EligibilityCriteria;
  compensation: CompensationDetails;
  fitment: FitmentEvaluation;
  assessmentIntel: AssessmentIntelligence;

  // Insider & Referral Signals (Req #15)
  alumniPresenceCount?: number;       // e.g. 14 college alumni currently work here (optional if not verified/available)
  recruiterPresenceCount?: number;    // optional if not verified/available

  // Application State for the active student (Multi-tenant isolated, Req #12)
  stage: ApplicationStage;
  appliedAt?: number;
  customNotes?: string;
  followUpDeadlineAt?: number;        // 7-day follow-up reminder date (Req #3)
}

// Verified Student Project Interface (Truth-Anchored, Fix 1)
export interface StudentProject {
  id: string;
  title: string;
  techStack: string[];
  description: string;
  liveUrl?: string;
  githubUrl?: string;
  metricsAchieved?: string; // e.g. "40% latency reduction, 10k daily requests"
}

// Predictable Annual Recurring Internship Cycle (Truth-Anchored Seasonal Calendar)
export type InternshipCycleCurrentStatus = 'OPEN_NOW' | 'UPCOMING' | 'PASSED_THIS_CYCLE';

export interface UpcomingInternshipCycle {
  id: string;
  companyName: string;
  companyLogo: string;
  companyDomain: string;
  programTitle: string;
  hiringCycleType: 'summer' | 'fall' | 'winter' | 'spring' | 'off_campus_drive' | 'scholarship' | 'early_career_12th' | 'global_full_ride' | 'scientific_lab' | 'open_source_grant' | 'academic_fellowship' | 'frontier_ai' | 'early_undergrad_exclusive' | 'quant_hft' | 'tech_giant' | 'pre_university_full_ride';
  programCategory?: 'internship' | 'scholarship' | 'early_career_12th' | 'global_full_ride' | 'scientific_lab' | 'open_source_grant' | 'academic_fellowship' | 'frontier_ai' | 'early_undergrad_exclusive' | 'quant_hft' | 'tech_giant' | 'pre_university_full_ride';
  tierCategory?: 'pre_university_full_ride' | 'scientific_lab' | 'open_source_grant' | 'academic_fellowship' | 'frontier_ai' | 'early_undergrad_exclusive' | 'quant_hft' | 'tech_giant' | 'industry_tech' | 'global_full_ride' | 'scholarship';
  rateType?: 'OFFICIAL_CONFIRMED' | 'MARKET_ESTIMATED'; // 'OFFICIAL_CONFIRMED' if exact stipend is verified, 'MARKET_ESTIMATED' if stipend is estimated/variable
  eligibility?: string; // e.g. "UG 2nd/3rd/4th yr", "UG 3rd/4th yr", or "No Degree Barrier"
  selectionCriteria?: string; // Formal selection parameters (e.g. GPA cutoff, PR history, research proposal, interview)
  isGlobalFullRide?: boolean; // True for prestigious ₹3 - 4 Crore+ ($350k - $450k) undergraduate full-ride scholarships
  isPreUniversityFullRide?: boolean; // True for Class 12 / Pre-University full-ride scholarships (Need-Blind Ivy+, Named & Govt Schemes)
  disclaimerNotice?: string; // Mandatory official confirmation disclaimer notice
  seatQuotaInfo?: string; // Explicit seat quota (e.g. "Varies year to year, check official page")
  fundingAmountText?: string; // Formatted value badge (e.g. "₹3.2 - ₹3.6 Crore ($360,000+ Full-Ride)")
  coverageBreakdown?: string; // e.g. "100% Tuition + Housing + Food + Flights + Laptop + Research Stipend"
  eligibilityCriteria?: string; // Explicit eligibility (e.g. Class 12th Pass with Maths 60%, 1st-Year CS, etc.)
  targetAudienceText?: string; // Formatted badge text (e.g. "Class 12th Pass / 1st Year Undergrad")
  isClass12Eligible?: boolean; // True for Class 12 / High school passout programs (TechBee, AFE, etc.)
  expectedAnnouncementMonth: string; // e.g. "July - August"
  startMonth: number; // 1-12 (e.g. 7 for July)
  startDay?: number; // 1-31 (Day of month when window typically opens)
  endMonth: number; // 1-12 (e.g. 8 for August)
  endDay?: number; // 1-31 (Day of month when window typically closes)
  currentStatus?: InternshipCycleCurrentStatus; // Dynamically calculated against the student's live viewing date/time
  daysRemaining?: number; // Days remaining if OPEN_NOW, or days until opening if UPCOMING
  exactWindowText?: string; // Formatted date window (e.g. "15 Aug – 21 Sep")
  expectedWindowDuration: string; // e.g. "3-4 weeks before cap"
  targetBatches: number[]; // e.g. [2026, 2027] or [12] for class 12
  annualRecurrencePattern: string; // e.g. "Annual campus & off-campus cycle, typically opens mid-July"
  officialCareersUrl: string; // Official careers link to bookmark
  historicalCompensation: string; // e.g. "₹1,15,00,000/mo" or "92 CHF/day"
  historicalAssessmentPlatform: string; // e.g. "CodeSignal / Google Screening"
  keyPreparationTopics: string[]; // e.g. ["Graphs & Trees", "Dynamic Programming", "System Design Basics"]
  authenticityStatus: 'CALENDAR_PREDICTABLE' | 'HISTORICALLY_CONFIRMED' | 'OFFICIALLY_SCHEDULED';
  prepTimeRemainingMonths: number; // e.g. 2, 3, 4 months
  actionTip: string; // Advice for students to prepare in advance
  timelinePhases: {
    announcementMonth: string;
    assessmentMonth: string;
    interviewMonth: string;
    internshipStartMonth: string;
  };
}

// Student Master Profile Dossier (Req #12 & Req #18)
export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  collegeName: string;
  degree: string;
  graduationYear: number;
  currentCgpa: string;
  targetBatch: number[];
  primarySkills: string[];
  secondarySkills: string[];
  projects?: StudentProject[];
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl?: string;
  resumeFileName?: string;
  workAuthorization: 'US Citizen / Green Card' | 'F-1 (OPT / CPT Eligible)' | 'Requires H-1B Sponsorship' | 'India / APAC Domestic Only';
  preferredRoles: string[];
  preferredWorkMode: 'any' | 'remote' | 'hybrid' | 'on-site';
  targetLocations: string[];
  emailAlertsEnabled: boolean;
  dailyDigestTime: 'morning' | 'evening' | 'both';
  urgentAlertThresholdHours: number;  // e.g. 72 hours
}

// Student User Authentication Session (Google / Phone OTP / Gmail OTP)
export interface AuthUserSession {
  uid: string;
  channel: 'google' | 'phone' | 'email';
  identifier: string;
  displayName: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  token?: string;
  verifiedAt?: number;
}

// Email Digest & Alert Payload Interface (Req #5, #6, #10)
export interface AlertEmailSimulation {
  id: string;
  type: 'discovery_alert' | 'submission_receipt' | 'oa_action_required' | 'offer_milestone' | 'otp_verification' | 'janch_pass_audit' | 'action_roadmap';
  tier: 'gold' | 'slate' | 'neon' | 'royal';
  subject: string;
  recipientEmail: string;
  fromHeader: string;                 // "TERRASYNX Radar Alerts <no-reply@carrier-radar.app>"
  payloadSizeKb: number;              // Strictly < 25 KB (Strict Rule #1 & Req #5)
  timestamp: number;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyDomain?: string;
  actionUrl: string;
  actionAdvisorPoints?: string[];
}

// Insider Contact & Recruiter Bridge Models (Req #15)
export type OutreachChannel = 'linkedin_dm' | 'alumni_email' | 'recruiter_inmail';

export interface InsiderContact {
  id: string;
  name: string;
  role: string;
  companyName: string;
  companyDomain: string;
  avatarUrl?: string;
  isAlumni: boolean;
  alumniCollege: string;
  gradYear: number;
  connectionDegree: '1st' | '2nd' | 'Campus Alumni';
  linkedinSearchUrl: string;
  directEmailHint: string;
  bestOutreachAngle: string;
}

export interface OutreachTemplate {
  channel: OutreachChannel;
  subjectLine?: string;
  bodyText: string;
  charCount: number;
  wordCount: number;
  advisorPointers: string[];
}

// Smart Auto-Fill Fast Apply Receipt & State (Req #4, #17)
export interface FastApplyReceipt {
  confirmationId: string;             // e.g. "CONF-2026-OPENAI-9941X"
  sha256Hash: string;                 // SHA-256 integrity token
  opportunityId: string;
  companyName: string;
  jobTitle: string;
  submittedAt: number;
  portalType: 'Greenhouse' | 'Lever' | 'Ashby' | 'Workday' | 'Direct';
  candidateName: string;
  candidateEmail: string;
  workAuthSelected: string;
  tailoredResumeUsed: string;
  humanLatencySeconds: number;
  antiBotStatus: string;              // e.g. "Form Pre-filled & Ready"
  status: 'confirmed' | 'pending';
  receiptUrl: string;
  selfConfirmedByStudent?: boolean;
  officialStatusTrackerUrl?: string;
  studentConfirmationNotes?: string;
}

// Core Operational Modes (Req #17, #18 & System Architecture)
export type OperationalMode = 
  | 'radar'          // Live opportunity radar and priority shelves
  | 'pipeline'       // Execution Kanban Tracker
  | 'evaluator'      // 10-D Deep Fitment Studio (A-F grade breakdown)
  | 'resume'         // Truth-Anchored Resume Tailor (No hallucination)
  | 'alerts'         // Notification Relay & 4-Tier Email Architecture
  | 'insider'        // Alumni & Referral Bridge
  | 'profile'        // Student Candidate Profile & Context Studio (Req #18)
  | 'internship_calendar' // Seasonal Internships: Ongoing Applications & Upcoming Predictable Annual Recruitment Cycles
  | 'analytics'      // Real-Time Application Telemetry & Conversion Analytics (Phase 4 Point 1)
  | 'calendar'       // Automated Interview & Assessment Calendar Sync / Scheduler (Phase 4 Point 2)
  | 'mock_interview' // Real-Time Mock Interview Simulator & STAR Response Coach (Phase 7 Point 1)
  | 'offer_evaluator' // Offer Evaluation, Comp Benchmarking & Negotiation Studio (Phase 7 Point 2)
  | 'career_launchpad' // Executive Offer Acceptance, Team Matching & Day-One Onboarding Launchpad (Phase 7 Point 3)
  | 'network_graph' // Enterprise Alumni Referral Network Graph & Warm Path Matrix (Phase 8 Point 1)
  | 'recruiter_radar' // Recruiter Intelligence Dossier & Headhunter Outreach Radar (Phase 8 Point 2)
  | 'referral_tracker'; // Referral Lifecycle Tracker & Application Back-Channel Status Reconciler (Phase 8 Point 3)

export type NavigationMode = OperationalMode;

// Assessment & Interview Calendar Models (Phase 4 Point 2)
export type CalendarEventType = 'oa_test' | 'technical_interview' | 'system_design' | 'recruiter_screen' | 'follow_up_deadline';

export interface CalendarEvent {
  id: string;
  opportunityId: string;
  companyName: string;
  companyDomain: string;
  jobTitle: string;
  eventType: CalendarEventType;
  title: string;
  description: string;
  startTime: number; // unix timestamp in ms
  endTime: number;   // unix timestamp in ms
  durationMinutes: number;
  meetingLink?: string;
  platform?: string; // e.g. "HackerRank", "CodeSignal", "Google Meet", "Zoom"
  status: 'scheduled' | 'completed' | 'urgent';
  preparationChecklist: string[];
  syncStatus: {
    googleCalendar: boolean;
    icsExported: boolean;
  };
}

// ==========================================
// Santiago 8-Block (A-H) Deep Reasoning Dossier (Phase 5 Point 2)
// ==========================================
export type RoleArchetype = 
  | 'LLMOps & Infra' 
  | 'Agentic Systems Engineer' 
  | 'Full-Stack Product Engineer' 
  | 'Solutions Architect' 
  | 'Forward Deployed Engineer (FDE)' 
  | 'Distributed Systems & Core Platform';

export type RequirementSource = 'JD-wording' | 'JD-structure' | 'estimate';

export interface RequirementMatchItem {
  requirement: string;
  weight: number; // 1 to 5 scale
  source: RequirementSource;
  candidateProof: string; // Grounded evidence from student's projects/skills
  status: 'strong_match' | 'partial_match' | 'gap_mitigated';
  gapAnalysis: string;
  mitigationStrategy: string;
}

export interface EightBlockDossier {
  opportunityId: string;
  evaluatedAt: number;
  
  // Block A: Role Summary & Archetype Classification
  blockA_roleSummary: {
    archetype: RoleArchetype;
    summary: string;
    missionCriticality: 'Tier-1 Core Revenue' | 'Zero-to-One Innovation' | 'Enterprise Infrastructure';
    coreTechStack: string[];
  };

  // Block B: CV Match (Per-Requirement with Source Labeling)
  blockB_cvMatch: {
    requirements: RequirementMatchItem[];
    groundedTruthScore: number; // 0-100 (estimates capped to prevent overconfidence)
    verdict: string;
  };

  // Block C: Level Strategy
  blockC_levelStrategy: {
    targetedLevel: 'Intern / Co-op' | 'New Grad (L3/E3)' | 'Mid-Level (L4/E4)' | 'Senior (L5)';
    downlevelingRisk: 'Low' | 'Moderate' | 'High';
    strategicAdvice: string;
  };

  // Block D: Compensation Research & Benchmarks
  blockD_compResearch: {
    verifiedBaseUsd: string;
    marketPercentile: string;
    equityOutlook: string;
    benchmarkSource: string;
  };

  // Block E: CV Personalization Plan
  blockE_personalizationPlan: {
    leadProjects: string[];
    topBulletsToElevate: string[];
    skillsToPrioritize: string[];
    customHeadlineHook: string;
  };

  // Block F: Interview Prep & Behavioral Anchors (STAR)
  blockF_interviewPrep: {
    starAnchors: {
      topic: string;
      situation: string;
      actionProof: string;
      resultMetric: string;
    }[];
    technicalDeepDives: string[];
    highImpactQuestionsToAsk: string[];
  };

  // Block G: Posting Legitimacy & Ghost-Job Detection (Separate Score)
  blockG_legitimacyCheck: {
    legitimacyScore: number; // 0-100
    ghostJobRisk: 'Safe / Actively Hiring' | 'Caution / Stale Posting' | 'High Ghost-Job Risk';
    postingAgeDays: number;
    auditSignals: string[];
    isScamRisk: boolean;
  };

  // Block H: Work-Authorization & Sponsorship Hard Blocker
  blockH_workAuthBlocker: {
    sponsorshipStatus: 'Full Sponsorship Provided' | 'OPT/CPT Friendly Only' | 'Explicitly Blocked (No Visa)';
    isBlockedForCandidate: boolean;
    blockerReason?: string;
    recommendedAction: string;
  };
}

// Phase 5 Point 4: Autonomous Pulse Cadence & Heartbeat Telemetry Types
export type PulseCadence = '30s' | '1m' | '5m' | '15m' | 'manual';

export interface HeartbeatTelemetryLog {
  id: string;
  timestamp: number;
  durationMs: number;
  cadence: PulseCadence;
  endpointsProbed: number;
  newRequisitionsFound: number;
  expiredRolesPruned: number;
  totalActiveRequisitions: number;
  status: 'success' | 'warning' | 'error';
  trigger: 'cron_timer' | 'manual' | 'tab_focus_catchup' | 'url_ingest';
  notes: string;
}

// Phase 6 Point 1: Company Response Inbound Engine & Lightweight Daily Digest (Req #9, #5, #6, #8)
export interface AtsInboundResponse {
  id: string;
  opportunityId: string;
  companyName: string;
  companyDomain: string;
  sourceAts: 'Greenhouse' | 'Lever' | 'Workday' | 'SmartRecruiters' | 'Direct';
  webhookEventType: 'assessment_link' | 'interview_invite' | 'application_rejected' | 'offer_letter' | 'custom_status';
  receivedAt: number;
  candidateEmail: string;
  subject: string;
  parsedData: {
    testPlatform?: string;
    testUrl?: string;
    deadlineHours?: number;
    interviewDate?: string;
    meetingLink?: string;
    interviewerNames?: string[];
    roundName?: string;
    offerCompensation?: string;
    startDate?: string;
    actionAdvisorPointers: string[];
  };
  rawPayloadSnippet: string;
  status: 'unprocessed' | 'processed' | 'auto_synced_kanban';
}

export interface DailyDigestPayload {
  id: string;
  title: string;
  digestType: 'morning_dispatch' | 'evening_wrapup';
  generatedAt: number;
  sizeKb: number; // Strictly < 25 KB (Req #5)
  rfcHeaders: {
    from: string;
    to: string;
    subject: string;
    autoSubmitted: string; // "auto-generated" (Req #6)
    messageId: string;
    mimeVersion: string;
    contentType: string;
  };
  urgentCount: number;
  actionRequiredCount: number;
  newDropsCount: number;
  items: {
    companyName: string;
    title: string;
    deadlineText: string;
    fitmentScore: number;
    actionUrl: string;
    tag: string;
  }[];
  summaryText: string;
}

// ============================================================================
// PHASE 7 POINT 1: REAL-TIME MOCK INTERVIEW SIMULATOR & STAR RESPONSE COACH
// ============================================================================

export type MockInterviewRoundType = 
  | 'behavioral_star'        // Behavioral STAR Method (Leadership, Conflict, Ownership)
  | 'system_architecture'    // Distributed Systems & Scaled Architecture
  | 'live_coding_algorithms'; // Algorithmic live trade-off & complexity reasoning

export interface MockInterviewQuestion {
  id: string;
  roundType: MockInterviewRoundType;
  roleArchetype: string;
  companyName: string;
  interviewerPersona: string;
  interviewerTitle: string;
  questionText: string;
  contextScenario: string;
  recommendedDurationSeconds: number;
  criticalKeywords: string[];
  starPrompts: {
    situationPrompt: string;
    taskPrompt: string;
    actionPrompt: string;
    resultPrompt: string;
  };
  exemplarAnswer: string;
}

export interface MockInterviewEvaluation {
  overallScore: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'Needs Work';
  starBreakdown: {
    situationScore: number; // 0 - 25
    taskScore: number;      // 0 - 25
    actionScore: number;    // 0 - 25
    resultScore: number;    // 0 - 25
  };
  technicalDepthScore: number; // 0 - 100
  communicationScore: number;  // 0 - 100
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  growthAreas: string[];
  modelAnswer: string;
  pacingFeedback: string;
}

export interface MockInterviewSession {
  id: string;
  timestamp: number;
  opportunityId: string;
  companyName: string;
  roleTitle: string;
  roundType: MockInterviewRoundType;
  question: MockInterviewQuestion;
  candidateResponse: string;
  durationSeconds: number;
  evaluation?: MockInterviewEvaluation;
}

// Offer Evaluation, Compensation Benchmarking & Negotiation Studio (Phase 7 Point 2)
export interface CompensationBreakdown {
  currency: 'USD' | 'INR' | 'EUR' | 'GBP' | 'CAD';
  baseSalary: number;            // e.g. 165000 (Annual) or hourly rate (e.g. 65)
  signOnBonus: number;           // e.g. 35000
  annualBonusTargetPercent: number; // e.g. 15%
  equityTotalGrant: number;      // e.g. 120000 over 4 years
  equityVestingYears: number;    // e.g. 4
  equityVestingSchedule: 'standard_equal' | 'backloaded_amazon' | 'frontloaded_uber'; // 25/25/25/25 or 5/15/40/40 or 33/33/22/12
  relocationStipend: number;     // e.g. 10000
  benefitsAnnualEstimate: number;// e.g. 15000 (health, 401k match, wellness)
  period: 'annual' | 'hourly';   // New grad / full-time is annual; intern is hourly
  hourlyHoursPerWeek?: number;   // 40
  internDurationWeeks?: number;  // 12
}

export interface MarketCompBenchmark {
  roleLevel: 'swe_intern' | 'swe_new_grad_l3' | 'swe_mid_l4' | 'ai_engineer_l3';
  locationTier: 'tier1_metro' | 'tier2_metro' | 'remote';
  p25TotalComp: number;
  p50TotalComp: number;
  p75TotalComp: number;
  p90TotalComp: number;
  dataPointsCount: number;
  verifiedSource: string; // e.g. "Levels.fyi & Radford 2026 Verified Tech Benchmark"
}

export type NegotiationStrategyType = 
  | 'competing_offer_leverage'
  | 'market_benchmark_anchoring'
  | 'cost_of_living_relocation'
  | 'equity_skew_optimization';

export interface NegotiationCounterOfferDraft {
  strategy: NegotiationStrategyType;
  subjectLine: string;
  bodyText: string;
  proposedBaseDelta: number;
  proposedSignOnDelta: number;
  proposedEquityDelta: number;
  rationalePoints: string[];
  keyAdviceForCall: string[];
}

export interface CandidateOffer {
  id: string;
  opportunityId: string;
  companyName: string;
  companyLogo: string;
  roleTitle: string;
  location: string;
  receivedDate: number;        // ms
  deadlineDate: number;        // ms (exploding offer deadline)
  compensation: CompensationBreakdown;
  status: 'active_review' | 'negotiating' | 'accepted' | 'declined' | 'expired';
  decisionScores?: {
    compensationWeight: number; // 0-100
    learningTrajectoryWeight: number; // 0-100
    prestigeWeight: number; // 0-100
    workCultureWeight: number; // 0-100
    locationWeight: number; // 0-100
    compositeScore: number; // 0-100
  };
  notes?: string;
  counterOfferSent?: boolean;
}

// Phase 7 Point 3: Executive Offer Acceptance, Team Matching & Day-One Onboarding Launchpad
export interface DeclinedOfferNotice {
  companyName: string;
  roleTitle: string;
  declineLetterText: string;
  reason: string;
  isSent: boolean;
}

export interface OfferAcceptanceRecord {
  id: string;
  offerId: string;
  companyName: string;
  roleTitle: string;
  startDate: string;
  acceptanceToken: string; // e.g. "ACC-2026-STRIPE-8821B"
  acceptedAt: number;
  formalLetterText: string;
  declinedOffers: DeclinedOfferNotice[];
}

export interface TeamMatchingDomainPillar {
  name: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  techStack: string[];
}

export interface TeamMatchingProfile {
  companyName: string;
  domainPillars: TeamMatchingDomainPillar[];
  preferredManagerStyle: 'hands-on-mentor' | 'autonomous-impact' | 'collaborative-architect';
  candidateIntroPitch: string;
  manager1on1Questions: string[];
}

export interface BackgroundCheckItem {
  id: string;
  title: string;
  category: 'education' | 'identity_work_auth' | 'employment_history' | 'drug_screen';
  status: 'verified' | 'action_required' | 'optional';
  guidance: string;
  documentsRequired: string[];
}

export interface BackgroundCheckCompliance {
  provider: 'HireRight' | 'Checkr' | 'Sterling' | 'Direct HR';
  overallStatus: 'cleared' | 'in_progress' | 'action_required' | 'ready_for_submission';
  items: BackgroundCheckItem[];
  i9Compliance: {
    formStatus: 'completed' | 'pending';
    documentType: 'F-1 CPT I-20' | 'F-1 OPT EAD' | 'US Passport' | 'Green Card';
    expiryDate: string;
  };
  advisoryAlerts: string[];
}

export interface DayOneRampPlan {
  targetCompany: string;
  roleTitle: string;
  startDate: string;
  equipmentLogistics: {
    laptopOption: string;
    shippingConfirmed: boolean;
    monitorAllowanceClaimed: boolean;
    badgePickupOffice: string;
  };
  days1to30: {
    theme: string;
    milestones: string[];
    keyContacts: string[];
  };
  days31to60: {
    theme: string;
    milestones: string[];
  };
  days61to90: {
    theme: string;
    milestones: string[];
  };
  weeklyCheckInChecklist: string[];
}

// ============================================================================
// PHASE 8 POINT 1: ALUMNI REFERRAL NETWORK GRAPH & WARM INTRODUCTION MATRIX
// ============================================================================

export type NetworkConnectionDegree = '1st' | '2nd' | 'Campus Alumni' | 'Former Colleague';

export interface NetworkAlumniNode {
  id: string;
  fullName: string;
  currentCompany: string;
  companyDomain: string;
  jobTitle: string;
  department: string;
  almaMater: string;
  gradYear: number;
  degree: string;
  connectionDegree: NetworkConnectionDegree;
  warmIntroScore: number; // 0 - 100% warm pathway score
  location: string;
  mutualConnections: string[];
  referralBandwidth: 'available' | 'high_demand' | 'closing_soon' | 'inactive';
  preferredContactChannel: 'linkedin_dm' | 'work_email' | 'slack_community';
  directEmailHint: string;
  linkedinUrl: string;
  verifiedReferralHistoryCount: number;
  strategicReferralAngle: string;
  recommendedIntroPath: string;
}

export interface WarmIntroductionRoute {
  targetCompany: string;
  targetRole: string;
  opportunityId: string;
  primaryAlumni: NetworkAlumniNode;
  intermediaryNode?: {
    name: string;
    relationship: string;
    actionPrompt: string;
  };
  overallWarmthScore: number;
  fastTrackAdvantage: string;
  draftedForwardableIntro: {
    subject: string;
    body: string;
    blurbForIntermediary?: string;
  };
}

export interface EnterpriseReferralNetworkStats {
  totalMappedAlumni: number;
  tier1AlumniCount: number;
  activeReferralOpenings: number;
  avgWarmPathScore: number;
  highestDensityCompany: string;
}

// ============================================================================
// PHASE 8 POINT 2: RECRUITER INTELLIGENCE DOSSIER & HEADHUNTER OUTREACH RADAR
// ============================================================================

export type RecruiterArchetype = 
  | 'University Talent Lead' 
  | 'Senior Technical Sourcer' 
  | 'Engineering Hiring Manager' 
  | 'Principal Technical Recruiter' 
  | 'Executive Headhunter';

export type OutreachChannelType = 'direct_inmail' | 'work_email' | 'x_twitter_dm' | 'github_discussion';

export interface RecruiterOutreachDna {
  preferredTimeSlot: string; // e.g., "Tuesday - Thursday, 09:30 AM - 11:30 AM PST"
  averageResponseTimeHours: number; // e.g., 18 hours
  activeRequisitionsCount: number;
  technicalDepthLevel: 'High (Former SWE/Eng Lead)' | 'Medium (Specialized Tech Recruiter)' | 'Coordination (University Program)';
  keyPhrasesToAnchor: string[];
  phrasesToAvoid: string[];
}

export interface RecruiterNode {
  id: string;
  fullName: string;
  avatarInitials: string;
  role: RecruiterArchetype;
  companyName: string;
  companyDomain: string;
  departmentFocus: string;
  location: string;
  verifiedEmail: string;
  linkedinUrl: string;
  responseProbabilityIndex: number; // 0 - 100%
  recruiterDna: RecruiterOutreachDna;
  activeHiringReqs: {
    requisitionId: string;
    title: string;
    level: string;
    urgency: 'critical' | 'high' | 'normal';
  }[];
  strategicHook: string;
}

export interface RecruiterOutreachPackage {
  recruiter: RecruiterNode;
  subjectLineOptions: string[];
  recommendedSubject: string;
  pitchBody: string;
  proofOfWorkEmbeds: {
    label: string;
    url: string;
    description: string;
  }[];
  followUpCadenceTimeline: {
    day: number;
    title: string;
    action: string;
    readyTemplate: string;
  }[];
  recommendedTimingNotice: string;
}

export interface RecruiterRadarStats {
  totalVerifiedRecruiters: number;
  hiringManagersCount: number;
  highProbabilityLeadsCount: number;
  avgResponseRatePercent: number;
  activeTargetCompaniesCount: number;
}

// ============================================================================
// PHASE 8 POINT 3: REFERRAL LIFECYCLE TRACKER & BACK-CHANNEL STATUS RECONCILER
// ============================================================================

export type ReferralSubmissionStage = 
  | 'requested'          // Referral requested from alumni/insider
  | 'endorsed_by_referee'// Referee endorsed and submitted internal portal form
  | 'ats_linked'         // ATS reconciled and linked candidate requisition
  | 'hiring_loop_priority'// Priority review triggered (bypasses cold screen)
  | 'converted_to_interview'// Recruiter screen / technical round scheduled
  | 'referral_bonus_locked';// Offer accepted & referee bonus milestone registered

export interface ReferralLifecycleRecord {
  id: string;
  opportunityId: string;
  companyName: string;
  companyDomain: string;
  roleTitle: string;
  requisitionId: string;
  refereeName: string;
  refereeRole: string;
  refereeEmail: string;
  portalSubmissionId: string; // e.g., "REF-2026-STRP-9921"
  stage: ReferralSubmissionStage;
  requestedAt: number;
  endorsedAt?: number;
  atsLinkedAt?: number;
  interviewScheduledAt?: number;
  priorityMultiplier: number; // e.g. 4.8x higher response velocity
  internalEndorsementNote: string;
  backChannelTelemetry: {
    internalPortalStatus: 'Pending Review' | 'Flagged for Priority Interview' | 'Under Hiring Squad Review' | 'Approved for Offer';
    lastActivityTimestamp: number;
    hiringManagerAssigned?: string;
    interviewFastTrackUnlocked: boolean;
  };
  actionableNextStep: string;
}

export interface ReferralTrackerStats {
  totalTrackedReferrals: number;
  endorsedCount: number;
  interviewConvertedCount: number;
  averageSpeedToFirstInterviewDays: number;
  conversionRatePercent: number;
}




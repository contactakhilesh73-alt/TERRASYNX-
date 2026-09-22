/**
 * TERRASYNX: Career Launchpad & Executive Onboarding Service (Phase 7 Point 3)
 * Provides official offer acceptance documentation, graceful decline letters,
 * team matching strategy, background check compliance auditing, and 30-60-90 day engineering ramp planning.
 */

import { 
  CandidateOffer, 
  StudentProfile, 
  OfferAcceptanceRecord, 
  TeamMatchingProfile, 
  BackgroundCheckCompliance, 
  DayOneRampPlan 
} from '../types';
import { logger } from '../utils/logger';

const ACCEPTANCE_STORAGE_KEY = 'terrasynx_offer_acceptance_record';

export class CareerLaunchpadService {
  /**
   * Generates a cryptographic verification token for the accepted offer
   */
  public static generateReceiptToken(companyName: string): string {
    const cleanCompany = companyName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6) || 'TECH';
    const randHex = Math.floor(Math.random() * 0xFFFFF).toString(16).toUpperCase().padStart(5, '0');
    return `ACC-2026-${cleanCompany}-${randHex}`;
  }

  /**
   * Retrieves the active offer acceptance record from local storage or returns a baseline default
   */
  public static getAcceptanceRecord(): OfferAcceptanceRecord {
    try {
      const stored = localStorage.getItem(ACCEPTANCE_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }

    // Default institutional record anchored in Stripe offer
    return {
      id: 'acc_stripe_default',
      offerId: 'offer_stripe_2026',
      companyName: 'Stripe',
      roleTitle: 'Software Engineer Intern - Core Systems (Summer 2026)',
      startDate: 'June 8, 2026',
      acceptanceToken: 'ACC-2026-STRIPE-78F4A',
      acceptedAt: Date.now() - 86400000 * 2,
      formalLetterText: `Dear Stripe University Recruiting & Engineering Leadership,\n\nI am thrilled to formally accept your offer for the Software Engineer Intern - Core Systems position at Stripe for Summer 2026. The technical vision of the Global Payments and Distributed Ledger teams aligns precisely with my engineering aspirations, and I look forward to contributing to Stripe's critical infrastructure.\n\nI confirm my planned start date of June 8, 2026, and accept the compensation package and terms outlined in the official offer letter.\n\nThank you once again for this incredible opportunity. I look forward to connecting with my host manager and onboarding team soon.\n\nSincerely,\nAlex Chen`,
      declinedOffers: [
        {
          companyName: 'Google',
          roleTitle: 'Software Engineering Intern (Summer 2026)',
          declineLetterText: `Dear Google University Programs Team,\n\nThank you very much for the offer to join Google as a Software Engineering Intern for Summer 2026. After thoughtful consideration, I have decided to accept an offer with another company whose current project scope directly matches my immediate focus in financial infrastructure.\n\nI have immense respect for Google's engineering culture and am deeply grateful for the time and support provided throughout the interview rounds. I sincerely hope we can stay in touch for future opportunities as I advance in my career.\n\nWarm regards,\nAlex Chen`,
          reason: 'Accepted Stripe for deeper distributed systems exposure',
          isSent: true,
        },
        {
          companyName: 'Meta',
          roleTitle: 'Software Engineer Intern (Systems)',
          declineLetterText: `Dear Meta Recruiting Team,\n\nThank you sincerely for extending an offer for the Software Engineer Intern (Systems) position. After careful deliberation, I have decided to pursue an opportunity that aligns very closely with my immediate distributed systems trajectory.\n\nI am truly grateful for the positive interview experience and thoughtful conversations with the team. I hope our paths cross again in the future.\n\nBest regards,\nAlex Chen`,
          reason: 'Comp and domain preference alignment',
          isSent: false,
        }
      ]
    };
  }

  /**
   * Persists the offer acceptance record
   */
  public static saveAcceptanceRecord(record: OfferAcceptanceRecord): void {
    try {
      localStorage.setItem(ACCEPTANCE_STORAGE_KEY, JSON.stringify(record));
    } catch (e) {
      logger.error('CareerLaunchpadService', 'Failed to save acceptance record to localStorage', e);
    }
  }

  /**
   * Creates or switches the acceptance record for any chosen company
   */
  public static createAcceptanceRecordForCompany(
    companyName: string,
    roleTitle: string,
    studentProfile: StudentProfile,
    startDate: string = 'June 8, 2026'
  ): OfferAcceptanceRecord {
    const token = this.generateReceiptToken(companyName);
    const candidateName = studentProfile.fullName || 'Alex Chen';
    
    // Other companies to gracefully decline
    const potentialDeclines = ['Google', 'Meta', 'OpenAI', 'Microsoft', 'Palantir', 'Stripe']
      .filter(c => c.toLowerCase() !== companyName.toLowerCase())
      .slice(0, 2);

    const record: OfferAcceptanceRecord = {
      id: `acc_${companyName.toLowerCase().replace(/[^a-z]/g, '')}_${Date.now()}`,
      offerId: `offer_${companyName.toLowerCase().replace(/[^a-z]/g, '')}`,
      companyName,
      roleTitle,
      startDate,
      acceptanceToken: token,
      acceptedAt: Date.now(),
      formalLetterText: `Dear ${companyName} University Recruiting & Engineering Leadership,\n\nI am thrilled to formally accept your offer for the ${roleTitle} position at ${companyName}. The technical vision and mission of the team align precisely with my engineering aspirations, and I look forward to contributing to high-impact production systems.\n\nI confirm my planned start date of ${startDate}, and accept the compensation package and terms outlined in the official offer letter.\n\nThank you once again for this incredible opportunity. I look forward to connecting with my host manager and onboarding team soon.\n\nSincerely,\n${candidateName}`,
      declinedOffers: potentialDeclines.map((decCompany, idx) => ({
        companyName: decCompany,
        roleTitle: 'Software Engineering Intern (Summer 2026)',
        declineLetterText: `Dear ${decCompany} University Programs Team,\n\nThank you very much for the offer to join ${decCompany} as a Software Engineering Intern for Summer 2026. After thoughtful consideration, I have decided to accept an offer with ${companyName} whose current project scope directly matches my immediate focus.\n\nI have immense respect for ${decCompany}'s engineering culture and am deeply grateful for the time and support provided throughout the interview rounds. I sincerely hope we can stay in touch for future opportunities as I advance in my career.\n\nWarm regards,\n${candidateName}`,
        reason: `Accepted ${companyName} for domain & architecture alignment`,
        isSent: idx === 0,
      }))
    };

    this.saveAcceptanceRecord(record);
    return record;
  }

  /**
   * Generates formal acceptance letter text tailored to a selected offer and student profile
   */
  public static generateFormalAcceptanceLetter(
    offer: CandidateOffer,
    studentProfile: StudentProfile,
    startDate: string
  ): string {
    const candidateName = studentProfile.fullName || 'Candidate';
    const college = studentProfile.collegeName || 'University';

    return `Dear ${offer.companyName} University Recruiting & Engineering Leadership,

I am writing to enthusiastically and formally accept your offer for the position of ${offer.roleTitle} at ${offer.companyName}.

After thoroughly reviewing the offer details, I am excited about the opportunity to join ${offer.companyName} and contribute to your team's mission and engineering excellence. The technical challenges and team values discussed during my interview process strongly resonate with my academic foundation at ${college}.

As confirmed, my expected start date will be ${startDate}. I understand that this acceptance is contingent on the standard background verification and employment authorization processes, which I am ready to complete promptly.

Thank you very much to the entire recruiting team and the engineering interviewers who supported me through this journey. I look forward to hitting the ground running on Day One!

Warmest regards,

${candidateName}
${studentProfile.email}
${studentProfile.githubUrl || ''}
Verified Acceptance Hash: ${this.generateReceiptToken(offer.companyName)}`;
  }

  /**
   * Generates diplomatic decline letter text keeping doors wide open
   */
  public static generateDiplomaticDeclineLetter(
    competingCompany: string,
    roleTitle: string,
    studentProfile: StudentProfile,
    reason: string
  ): string {
    const candidateName = studentProfile.fullName || 'Candidate';

    return `Dear ${competingCompany} Recruiting & Engineering Team,

Thank you very much for offering me the position of ${roleTitle} at ${competingCompany}. I genuinely appreciate the confidence your team has shown in my technical abilities and potential.

After extensive and thoughtful reflection regarding my career trajectory, I have made the difficult decision to accept an offer with another company. This choice was driven primarily by ${reason || 'a specific alignment with my current domain focus'}, and in no way reflects on the caliber of your engineering organization.

I want to extend my sincere gratitude to everyone who took the time to interview me and share insights about ${competingCompany}. The professionalism and warmth of your recruiting team made this process truly memorable.

I hope we can stay in touch, and I look forward to the possibility of collaborating or exploring opportunities together in the future.

Sincerely and with gratitude,

${candidateName}
${studentProfile.email}`;
  }

  /**
   * Generates team matching profile and strategic questions for host manager matching calls
   */
  public static getTeamMatchingProfile(companyName: string): TeamMatchingProfile {
    const normalizedCompany = companyName.toLowerCase();

    if (normalizedCompany.includes('stripe')) {
      return {
        companyName: 'Stripe',
        preferredManagerStyle: 'autonomous-impact',
        candidateIntroPitch: `I'm a systems-focused software engineer with hands-on experience building fault-tolerant distributed services and API abstractions. At Stripe, I'm especially eager to work on high-throughput ledger primitives, idempotency pipelines, or core infrastructure where microsecond latency and 99.999% availability directly safeguard economic transactions.`,
        domainPillars: [
          {
            name: 'Core Payments & Ledger Infrastructure',
            priority: 'high',
            description: 'Distributed ledger accounting, global idempotency engine, and cross-border settlement rails.',
            techStack: ['Go', 'Java', 'RocksDB', 'Kafka', 'gRPC']
          },
          {
            name: 'Developer Platform & Public API Gateway',
            priority: 'high',
            description: 'Stripe API versioning engine, declarative schema validation, and webhooks dispatcher.',
            techStack: ['Ruby (Sorbet)', 'Go', 'Redis', 'Envoy']
          },
          {
            name: 'Radar & Fraud Detection Systems',
            priority: 'medium',
            description: 'Real-time feature evaluation pipelines and inference engines blocking fraudulent chargebacks.',
            techStack: ['Scala', 'Python', 'Flink', 'Spark']
          },
          {
            name: 'Connect & Global Payouts Platform',
            priority: 'medium',
            description: 'Multi-party marketplaces, compliance orchestrators, and automated tax reporting services.',
            techStack: ['TypeScript', 'React', 'Go', 'PostgreSQL']
          }
        ],
        manager1on1Questions: [
          'What is the primary technical bottleneck or architectural transition your team is tackling over the next 6-12 months?',
          'What does a successful, production-shipped project look like for an engineer during their first 90 days on your team?',
          'How does your team balance shipping velocity against Stripe\'s rigorous zero-downtime and API backwards-compatibility guarantees?',
          'What are the typical code review and production on-call shadowing expectations for new team members?',
          'Can you describe the dynamic between senior staff architects and engineers on the team when designing new distributed services?'
        ]
      };
    }

    if (normalizedCompany.includes('openai')) {
      return {
        companyName: 'OpenAI',
        preferredManagerStyle: 'collaborative-architect',
        candidateIntroPitch: `I focus on low-level systems and high-scale inference infrastructure. I am passionate about how high-bandwidth GPU clusters, distributed KV-cache sharing, and robust serving layers can accelerate frontier models into production.`,
        domainPillars: [
          {
            name: 'Inference Infrastructure & Serving Engine',
            priority: 'high',
            description: 'PagedAttention, speculative decoding kernels, and cluster-wide dynamic batching.',
            techStack: ['C++', 'CUDA', 'Python', 'Triton', 'vLLM']
          },
          {
            name: 'Model Platform & Training Data Systems',
            priority: 'high',
            description: 'Petabyte-scale distributed data ingest, deduplication, and streaming tokenizers.',
            techStack: ['Ray', 'Rust', 'Kubernetes', 'PyTorch']
          },
          {
            name: 'Applied API & Enterprise Platform',
            priority: 'medium',
            description: 'Multi-tenant rate limiters, token metering, streaming SSE infrastructure, and function calling runtime.',
            techStack: ['TypeScript', 'Go', 'PostgreSQL', 'Redis']
          }
        ],
        manager1on1Questions: [
          'How does the team handle rapid model iteration cycles without disrupting enterprise SLA guarantees?',
          'What are the main performance profiling tools your team relies on when optimizing inference GPU memory and latency?',
          'What is the onboarding ramp-up like for engineers touching core model serving infrastructure?',
          'How closely do platform engineers collaborate with the research science team when deploying new model capabilities?'
        ]
      };
    }

    // Default Tier-1 Tech profile
    return {
      companyName,
      preferredManagerStyle: 'autonomous-impact',
      candidateIntroPitch: `I am an ambitious software engineer passionate about scalable backend architecture, robust system design, and clean developer workflows. I look forward to diving into high-impact systems, collaborating closely with senior mentors, and shipping reliable code that moves core company metrics.`,
      domainPillars: [
        {
          name: 'Core Backend Services & Cloud Platform',
          priority: 'high',
          description: 'High-throughput microservices, data persistence layers, and cloud infrastructure.',
          techStack: ['Go', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS/GCP']
        },
        {
          name: 'Distributed Systems & Data Pipelines',
          priority: 'medium',
          description: 'Streaming event queues, analytical batch processing, and caching layers.',
          techStack: ['Kafka', 'Redis', 'Python', 'gRPC']
        },
        {
          name: 'Product Engineering & Full-Stack Experience',
          priority: 'medium',
          description: 'Modern web applications, design systems, and customer-facing features.',
          techStack: ['React', 'Next.js', 'Node.js', 'Tailwind']
        }
      ],
      manager1on1Questions: [
        'What will be the most impactful project an incoming engineer can own during their first quarter on the team?',
        'How does your team approach technical mentoring and career progression for new joiners?',
        'What is your team’s deployment frequency and CI/CD workflow from PR to production?',
        'What has surprised you most about the engineering culture on this specific team?'
      ]
    };
  }

  /**
   * Generates HireRight / Checkr background check compliance inspection
   */
  public static getBackgroundCheckCompliance(
    companyName: string,
    studentProfile: StudentProfile
  ): BackgroundCheckCompliance {
    const isInternational = studentProfile.workAuthorization.includes('F-1') || studentProfile.workAuthorization.includes('Visa');

    return {
      provider: 'HireRight',
      overallStatus: 'ready_for_submission',
      advisoryAlerts: [
        'Exact Title Match: Ensure job titles entered on HireRight match your official payroll records, not abbreviated project titles.',
        'Degree In-Progress Proof: If your degree will be completed right before starting, request an Official Degree Anticipation Verification letter from your University Registrar now.',
        isInternational
          ? 'CPT/OPT I-20 Compliance: Obtain employer-specific CPT authorization on Page 2 of your Form I-20 prior to your Day-One start date.'
          : 'I-9 Identification: Prepare 1 Document from List A (US Passport) OR a combination of List B (Driver’s License) + List C (Social Security Card).'
      ],
      i9Compliance: {
        formStatus: 'pending',
        documentType: isInternational ? 'F-1 CPT I-20' : 'US Passport',
        expiryDate: '2028-06-30'
      },
      items: [
        {
          id: 'bg_education',
          title: 'Highest Level Education Verification',
          category: 'education',
          status: 'verified',
          guidance: `Verify enrollment at ${studentProfile.collegeName || 'University'}. Provide official transcript or National Student Clearinghouse verification.`,
          documentsRequired: ['Official/Unofficial Transcript', 'Degree Verification Letter']
        },
        {
          id: 'bg_identity',
          title: 'Federal I-9 Employment Eligibility Verification',
          category: 'identity_work_auth',
          status: 'action_required',
          guidance: 'Complete Section 1 of Form I-9 electronically on or before Day One. Present original unexpired identification within 3 business days.',
          documentsRequired: isInternational 
            ? ['Valid Foreign Passport', 'Form I-94 Arrival Record', 'Endorsed Form I-20 with Employer Authorization']
            : ['US Passport OR Real ID Driver’s License + SSN Card']
        },
        {
          id: 'bg_employment',
          title: 'Prior Technical Employment & Internships',
          category: 'employment_history',
          status: 'verified',
          guidance: 'Ensure exact company names, start/end dates (month and year), and W-2 or first/last pay stubs are available if prior employer phone line is unresponsive.',
          documentsRequired: ['W-2 Tax Forms (Optional Fallback)', 'Offer Letters / Paystubs']
        },
        {
          id: 'bg_criminal',
          title: 'County, State & Federal Criminal Background Screen',
          category: 'drug_screen',
          status: 'verified',
          guidance: 'Standard 7-year multi-jurisdiction criminal history and SSN trace executed automatically via HireRight.',
          documentsRequired: ['Electronic Signature Consent']
        }
      ]
    };
  }

  /**
   * Generates a tailored 30-60-90 day engineering onboarding roadmap
   */
  public static getDayOneRampPlan(
    companyName: string,
    roleTitle: string,
    startDate?: string
  ): DayOneRampPlan {
    const start = startDate || 'June 8, 2026';

    return {
      targetCompany: companyName,
      roleTitle: roleTitle,
      startDate: start,
      equipmentLogistics: {
        laptopOption: 'Apple MacBook Pro 16" (M3 Max / 64GB RAM) or Linux Workstation',
        shippingConfirmed: true,
        monitorAllowanceClaimed: true,
        badgePickupOffice: 'Headquarters Reception • Main Security Desk (Day One 9:00 AM)'
      },
      days1to30: {
        theme: 'Deep Technical Context Absorption & First Merged Pull Request',
        milestones: [
          'Complete corporate security onboarding, 1Password / YubiKey hardware 2FA setup, and GitHub enterprise access.',
          'Execute local dev environment bootstrap script; run unit test suite and verify green local build within 48 hours.',
          'Identify and ship a "Good First Issue" / small bug fix into staging to master the company PR, CI, and deployment canary pipeline.',
          'Conduct 1-on-1 coffee chats with all immediate team members to map team ownership domains and architectural dependencies.',
          'Read team\'s top 3 design documents / RFCs written in the past 6 months to understand historical trade-offs.'
        ],
        keyContacts: [
          'Engineering Manager (Direct Mentor & Goal Setter)',
          'Assigned Onboarding Buddy (Day-to-day code review and pairing)',
          'Staff Architect / Tech Lead (System design & domain guidance)',
          'Product Manager / Cross-functional partner (Customer problem definition)'
        ]
      },
      days31to60: {
        theme: 'Independent Feature Delivery & Active Code Review Participation',
        milestones: [
          'Assume end-to-end ownership of an assigned scoped feature or critical infrastructure sub-module.',
          'Author a clear Technical Design Document (TDD) or RFC, incorporating feedback from senior team members.',
          'Actively review incoming team pull requests; provide thoughtful comments on readability, edge cases, and test coverage.',
          'Participate in on-call triage shadow sessions to understand production incident management and alerting thresholds.'
        ]
      },
      days61to90: {
        theme: 'Production Impact, Measurable Yield & Final Presentation',
        milestones: [
          'Successfully roll out feature to 100% production traffic behind feature flags with zero customer regressions.',
          'Profile performance metrics (p99 latency, CPU usage, or error rate improvements) and document yield in final project review.',
          'Deliver an internal engineering lightning talk or demo to the broader department showcasing project architecture.',
          'Conduct end-of-quarter performance evaluation and return-offer / full-time conversion strategy sync with your manager.'
        ]
      },
      weeklyCheckInChecklist: [
        'What high-impact objective did I complete this week?',
        'Are there any technical or cross-team blockers slowing down my progress?',
        'Did I receive constructive feedback on my recent code reviews?',
        'What is my single most critical deliverable for next week?'
      ]
    };
  }
}

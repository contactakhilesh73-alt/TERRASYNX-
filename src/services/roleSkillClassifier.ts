/**
 * TERRASYNX: Role-Aware Skill & ATS Gap Classifier
 * Dynamically categorizes job titles into genuine role domains (Engineering, Design,
 * Finance/Payroll, People/HR, Marketing, Operations, Product, Legal, Security, etc.)
 * Eliminates generic hardcoded "Kubernetes, Cloud Infrastructure" gaps on non-engineering roles.
 */

import { AssessmentIntelligence } from '../types';

export interface RoleClassification {
  category: 
    | 'design'
    | 'finance_payroll'
    | 'hr_talent'
    | 'marketing_growth'
    | 'product_management'
    | 'operations_strategy'
    | 'sales_solutions'
    | 'legal_compliance'
    | 'ai_data'
    | 'cybersecurity'
    | 'mobile'
    | 'frontend'
    | 'qa_testing'
    | 'backend_systems';
  categoryLabel: string;
  department: string;
  matchedSkills: string[];
  missingSkills: string[];
  assessmentPlatform: AssessmentIntelligence['platform'];
  assessmentDurationMinutes: number;
  assessmentTopics: string[];
  strategicVerdictTemplate: (companyName: string) => string;
}

export class RoleSkillClassifier {
  /**
   * Classify any job title & department into role domain with authentic skills & ATS gaps.
   */
  public static classifyRole(
    title: string = '',
    companyName: string = 'the company',
    rawDepartment?: string
  ): RoleClassification {
    const t = (title || '').toLowerCase();
    const d = (rawDepartment || '').toLowerCase();
    const combined = `${t} ${d}`;

    // 1. DESIGN & CREATIVE (Brand Designer, UI/UX, Product Designer, Graphic Designer)
    if (
      /\b(designer|design|ui|ux|brand|creative|visual|graphic|motion|illustrator|art director)\b/i.test(t) ||
      /\b(product design|design systems|ux research|visual designer)\b/i.test(d)
    ) {
      return {
        category: 'design',
        categoryLabel: 'Design & Creative',
        department: 'Product Design & Creative',
        matchedSkills: ['Figma', 'Brand Identity Systems', 'Visual Hierarchy', 'UI/UX Prototyping', 'Design Systems'],
        missingSkills: ['Design Tokens & Component Architecture', 'Cross-Platform Vector Guidelines', 'Motion Graphics & After Effects'],
        assessmentPlatform: 'Custom Take-Home',
        assessmentDurationMinutes: 60,
        assessmentTopics: ['Design Systems Architecture', 'Visual Hierarchy & Typography', 'Figma Interactive Prototyping', 'Accessibility (WCAG 2.1)'],
        strategicVerdictTemplate: (comp) =>
          `Authentic creative role at ${comp}. Strong alignment with brand identity, visual storytelling, and cross-platform design systems.`,
      };
    }

    // 2. FINANCE, ACCOUNTING & PAYROLL (Payroll Analyst, Accountant, Financial Analyst, Tax, FP&A)
    if (
      /\b(payroll|finance|financial|accountant|accounting|tax|fp&a|treasury|billing|sox|audit|controller|compensation|equity)\b/i.test(t) ||
      /\b(finance|accounting|payroll)\b/i.test(d)
    ) {
      return {
        category: 'finance_payroll',
        categoryLabel: 'Finance & Payroll',
        department: 'Finance, Accounting & Payroll',
        matchedSkills: ['Financial Modeling', 'Advanced Excel (VBA/Formulas)', 'Payroll Operations & Compliance', 'General Ledger Reconciliation'],
        missingSkills: ['Workday Payroll & HCM Configuration', 'Multi-Jurisdiction Statutory Tax Compliance', 'SOX Internal Controls & Audit'],
        assessmentPlatform: 'Custom Take-Home',
        assessmentDurationMinutes: 60,
        assessmentTopics: ['Advanced Financial Modeling', 'Variance & Cash Flow Analysis', 'Payroll Statutory Calculations', 'ERP General Ledger Auditing'],
        strategicVerdictTemplate: (comp) =>
          `Authentic finance role at ${comp}. Emphasizes general ledger reconciliation, payroll compliance, and statutory reporting.`,
      };
    }

    // 3. HUMAN RESOURCES, RECRUITING & TALENT (Recruiter, Talent Acquisition, People Operations, HR)
    if (
      /\b(recruiter|recruiting|talent|people ops|people operations|hr|human resources|sourcing|people partner|hrbp|coordinator)\b/i.test(t) ||
      /\b(people|talent|human resources)\b/i.test(d)
    ) {
      return {
        category: 'hr_talent',
        categoryLabel: 'People & Talent',
        department: 'People & Talent Acquisition',
        matchedSkills: ['Full-Lifecycle Sourcing', 'Greenhouse & Lever ATS Operations', 'Candidate Experience & Engagement', 'Talent Pipeline Management'],
        missingSkills: ['Executive Search Sourcing Strategy', 'DEI Hiring Pipeline Analytics', 'Workday HCM Personnel Configuration'],
        assessmentPlatform: 'Screening Call',
        assessmentDurationMinutes: 45,
        assessmentTopics: ['Passive Talent Sourcing Playbook', 'Behavioral Interview Facilitation', 'Recruitment Pipeline Metrics', 'Candidate Closing & Offer Delivery'],
        strategicVerdictTemplate: (comp) =>
          `Authentic talent acquisition role at ${comp}. Strategic focus on high-touch sourcing and candidate funnel optimization.`,
      };
    }

    // 4. MARKETING, COMMUNICATIONS & GROWTH (PMM, Content, SEO, Social Media, Growth, Brand)
    if (
      /\b(marketing|growth|content|copywriter|social media|seo|sem|brand marketing|pmm|product marketing|communications|public relations|press)\b/i.test(t) ||
      /\b(marketing|communications)\b/i.test(d)
    ) {
      return {
        category: 'marketing_growth',
        categoryLabel: 'Marketing & Growth',
        department: 'Marketing & Communications',
        matchedSkills: ['Go-To-Market (GTM) Strategy', 'Content Strategy & Copywriting', 'Google Analytics (GA4)', 'A/B Experimentation'],
        missingSkills: ['Omnichannel Attribution Modeling', 'HubSpot / Marketo Enterprise Automation', 'B2B Enterprise GTM Playbooks'],
        assessmentPlatform: 'Custom Take-Home',
        assessmentDurationMinutes: 60,
        assessmentTopics: ['GTM Campaign Architecture', 'Conversion Funnel Optimization', 'Brand Positioning & Messaging', 'CAC & LTV Unit Economics'],
        strategicVerdictTemplate: (comp) =>
          `Authentic marketing role at ${comp}. High impact on omnichannel acquisition, brand positioning, and retention funnels.`,
      };
    }

    // 5. PRODUCT MANAGEMENT (Product Manager, Technical PM, APM, Group PM)
    if (
      /\b(product manager|product management|apm|technical product manager|product lead|group product manager)\b/i.test(t) ||
      /\b(product management)\b/i.test(d)
    ) {
      return {
        category: 'product_management',
        categoryLabel: 'Product Management',
        department: 'Product Management',
        matchedSkills: ['Product Discovery & Roadmapping', 'User Research & Wireframing', 'PRD & Feature Specification', 'Data Analytics (SQL/Mixpanel)'],
        missingSkills: ['Enterprise SaaS Pricing & Packaging', 'Technical Architecture Tradeoff Analysis', 'North Star Metric Decomposition'],
        assessmentPlatform: 'Custom Take-Home',
        assessmentDurationMinutes: 75,
        assessmentTopics: ['Product Strategy & Vision', 'Product Design & Sense', 'Analytical Problem Solving (SQL)', 'Technical & Execution Leadership'],
        strategicVerdictTemplate: (comp) =>
          `Authentic product management role at ${comp}. Strong alignment with product discovery, PRD scoping, and cross-functional leadership.`,
      };
    }

    // 6. BUSINESS OPERATIONS & STRATEGY (BizOps, Program Manager, Project Manager, Scrum Master)
    if (
      /\b(operations|bizops|business ops|strategy|project manager|program manager|scrum master|agile coach|chief of staff)\b/i.test(t) ||
      /\b(operations|strategy|bizops)\b/i.test(d)
    ) {
      return {
        category: 'operations_strategy',
        categoryLabel: 'Operations & Strategy',
        department: 'Business Operations & Strategy',
        matchedSkills: ['Cross-Functional Project Leadership', 'Process Optimization', 'Agile & Scrum Methodologies', 'Stakeholder Alignment'],
        missingSkills: ['Enterprise Jira & Linear Governance', 'Unit Economics & Operational Cost Modeling', 'Risk & Change Management Frameworks'],
        assessmentPlatform: 'Custom Take-Home',
        assessmentDurationMinutes: 60,
        assessmentTopics: ['Operational Process Mapping', 'Cross-Functional Execution Tradeoffs', 'OKR & KPI Metric Design', 'Incident Postmortem Governance'],
        strategicVerdictTemplate: (comp) =>
          `Authentic operations role at ${comp}. Focus on scaling business processes, project velocity, and strategic alignment.`,
      };
    }

    // 7. SALES, CUSTOMER SUCCESS & SOLUTIONS (Account Executive, SDR, Solutions Architect, CSM)
    if (
      /\b(sales|account executive|sdr|bdr|customer success|solutions architect|sales engineer|client partner|account manager|business development)\b/i.test(t) ||
      /\b(sales|customer success)\b/i.test(d)
    ) {
      return {
        category: 'sales_solutions',
        categoryLabel: 'Sales & Customer Success',
        department: 'Sales & Customer Success',
        matchedSkills: ['Consultative Solution Selling', 'Salesforce CRM Pipeline Management', 'Client Relationship Retention', 'Discovery & Demo Delivery'],
        missingSkills: ['Enterprise RFP Response Architecture', 'Salesforce CPQ & Enterprise Quoting', 'Executive C-Suite Stakeholder Navigation'],
        assessmentPlatform: 'Screening Call',
        assessmentDurationMinutes: 45,
        assessmentTopics: ['Enterprise Discovery Call Roleplay', 'Customer Retention & Churn Mitigation', 'Competitive Objection Handling', 'Pipeline Territory Planning'],
        strategicVerdictTemplate: (comp) =>
          `Authentic commercial role at ${comp}. Core focus on quota attainment, client retention, and consultative enterprise solutions.`,
      };
    }

    // 8. LEGAL, COMPLIANCE & RISK (Legal Counsel, Privacy Officer, Contracts, Compliance)
    if (
      /\b(legal|counsel|attorney|compliance|privacy|contracts|regulatory|paralegal|risk analyst|risk manager)\b/i.test(t) ||
      /\b(legal|compliance)\b/i.test(d)
    ) {
      return {
        category: 'legal_compliance',
        categoryLabel: 'Legal & Compliance',
        department: 'Legal, Risk & Compliance',
        matchedSkills: ['Commercial Contract Review', 'Contract Lifecycle Management (CLM)', 'Corporate Risk Mitigation', 'Regulatory Due Diligence'],
        missingSkills: ['Cross-Border Privacy Transfers (GDPR/CCPA)', 'Enterprise Master Services Agreements (MSA)', 'AI Governance & IP Licensing Frameworks'],
        assessmentPlatform: 'Custom Take-Home',
        assessmentDurationMinutes: 60,
        assessmentTopics: ['Commercial Contract Drafting Redlines', 'Data Privacy Impact Assessments', 'Enterprise Regulatory Compliance', 'Risk Assessment Matrix'],
        strategicVerdictTemplate: (comp) =>
          `Authentic legal & compliance role at ${comp}. Core focus on corporate risk governance and regulatory adherence.`,
      };
    }

    // 9. AI, DATA SCIENCE & ANALYTICS (Machine Learning, Data Scientist, Data Analyst, AI Engineer, NLP)
    if (
      /\b(machine learning|data scientist|data science|ai|ml|nlp|computer vision|deep learning|research scientist|llm|data analyst|bi analyst|data engineer)\b/i.test(t) ||
      /\b(data|ai|analytics)\b/i.test(d)
    ) {
      return {
        category: 'ai_data',
        categoryLabel: 'AI & Data Science',
        department: 'AI, Data Science & Analytics',
        matchedSkills: ['Python', 'SQL & Relational Modeling', 'PyTorch / Scikit-Learn', 'Statistical Inference & Hypothesis Testing'],
        missingSkills: ['Distributed Model Training (Ray/DeepSpeed)', 'Production Feature Stores & Vector DBs', 'Model Quantization & Inference Latency Optimization'],
        assessmentPlatform: 'HackerRank',
        assessmentDurationMinutes: 90,
        assessmentTopics: ['Statistical Learning & Probability', 'SQL Query Optimization & Data Modeling', 'Machine Learning System Design', 'Algorithms & Matrix Math'],
        strategicVerdictTemplate: (comp) =>
          `Authentic AI/Data role at ${comp}. Strong alignment with statistical modeling, predictive algorithms, and feature pipelines.`,
      };
    }

    // 10. CYBERSECURITY & TRUST (Security Engineer, SecOps, InfoSec, AppSec, Threat Intelligence)
    if (
      /\b(security|infosec|cyber|appsec|penetration|threat|soc|vulnerability|iam|cryptograph)\b/i.test(t) ||
      /\b(security|trust)\b/i.test(d)
    ) {
      return {
        category: 'cybersecurity',
        categoryLabel: 'Cybersecurity & Trust',
        department: 'Information Security & Trust',
        matchedSkills: ['Network Security Fundamentals', 'Vulnerability Assessment & Scanning', 'OWASP Top 10 Exploitation', 'Identity & Access Management (IAM)'],
        missingSkills: ['Cloud Threat Detection (AWS GuardDuty/GCP SCC)', 'Zero-Trust Architecture Implementation', 'Cryptographic Key Lifecycle Governance'],
        assessmentPlatform: 'Custom Take-Home',
        assessmentDurationMinutes: 90,
        assessmentTopics: ['Threat Modeling & Risk Scoring', 'Application Security Code Review', 'Network Forensics & Packet Analysis', 'Incident Containment Runbooks'],
        strategicVerdictTemplate: (comp) =>
          `Authentic cybersecurity role at ${comp}. Core focus on offensive/defensive postures, IAM governance, and threat detection.`,
      };
    }

    // 11. MOBILE ENGINEERING (iOS, Android, React Native, Flutter, Swift, Kotlin)
    if (/\b(ios|android|mobile|swift|kotlin|react native|flutter)\b/i.test(t)) {
      return {
        category: 'mobile',
        categoryLabel: 'Mobile Engineering',
        department: 'Mobile Engineering',
        matchedSkills: ['Swift / Kotlin', 'Mobile Architecture (MVVM/MVI)', 'REST API Client Integration', 'Mobile UI Layout & Gestures'],
        missingSkills: ['Fastlane & CI/CD App Store Automation', 'Low-Memory Thread Profiling & Leaks', 'Offline-First SQLite / CoreData Sync'],
        assessmentPlatform: 'CodeSignal',
        assessmentDurationMinutes: 70,
        assessmentTopics: ['Mobile System Architecture', 'Concurrency & Main-Thread Performance', 'Offline Cache Synchronization', 'Mobile Data Structures & Algorithms'],
        strategicVerdictTemplate: (comp) =>
          `Authentic mobile role at ${comp}. Strong alignment with client-side performance, responsive gestures, and platform APIs.`,
      };
    }

    // 12. FRONTEND & CLIENT PLATFORMS (Frontend, Web Developer, UI Engineer)
    if (/\b(frontend|front-end|ui engineer|web developer|client engineer|javascript)\b/i.test(t)) {
      return {
        category: 'frontend',
        categoryLabel: 'Frontend Engineering',
        department: 'Frontend & Client Platforms',
        matchedSkills: ['TypeScript', 'React / Next.js', 'CSS / Tailwind & Responsive Layouts', 'Client State Management (Zustand/Redux)'],
        missingSkills: ['WebAssembly (WASM) Modules', 'Micro-Frontend Federation Architecture', 'Core Web Vitals & Critical Render Path Profiling'],
        assessmentPlatform: 'CodeSignal',
        assessmentDurationMinutes: 75,
        assessmentTopics: ['JavaScript Event Loop & Async Mechanics', 'React Component State & Hook Optimization', 'DOM Manipulation & Rendering Performance', 'CSS Architecture & Responsive Design'],
        strategicVerdictTemplate: (comp) =>
          `Authentic frontend role at ${comp}. Strong alignment with modern web UI architecture, state synchronization, and render performance.`,
      };
    }

    // 13. QUALITY ENGINEERING & SDET (QA, SDET, Test Automation, Reliability)
    if (/\b(qa|sdet|test engineer|quality assurance|automation engineer|test automation)\b/i.test(t)) {
      return {
        category: 'qa_testing',
        categoryLabel: 'Quality Engineering',
        department: 'Quality Engineering & SDET',
        matchedSkills: ['Test Automation (Playwright / Cypress)', 'API Testing (Postman / REST Assured)', 'CI/CD Automated Test Pipelines', 'Test Plan & Defect Lifecycle Management'],
        missingSkills: ['Performance & Stress Testing (k6 / Locust)', 'Automated Visual Regression Frameworks', 'Contract Testing with Pact'],
        assessmentPlatform: 'HackerRank',
        assessmentDurationMinutes: 75,
        assessmentTopics: ['Test Automation Framework Design', 'API Mocking & Boundary Testing', 'CI/CD Pipeline Failure Triaging', 'Data-Driven Test Scenarios'],
        strategicVerdictTemplate: (comp) =>
          `Authentic quality engineering role at ${comp}. Core focus on test automation coverage, flaky test mitigation, and regression pipelines.`,
      };
    }

    // 14. DEFAULT: BACKEND, SYSTEMS, DEVOPS, SRE & CLOUD INFRASTRUCTURE
    // (Software Engineer, Backend, Infrastructure, Systems, Cloud, Platform)
    return {
      category: 'backend_systems',
      categoryLabel: 'Systems & Backend',
      department: combined.includes('infrastructure') || combined.includes('cloud') || combined.includes('devops') || combined.includes('sre')
        ? 'Cloud Platforms & Infrastructure'
        : 'Core Systems Engineering',
      matchedSkills: ['Python / Go / Java', 'Distributed Systems', 'PostgreSQL / Relational Data Modeling', 'REST & gRPC Microservices'],
      missingSkills: ['Kubernetes & Container Orchestration', 'High-Throughput Kafka / Event Streaming', 'Distributed Tracing & OpenTelemetry'],
      assessmentPlatform: 'CodeSignal',
      assessmentDurationMinutes: 90,
      assessmentTopics: ['Distributed Systems Architecture', 'Concurrency & Thread Safety', 'Database Indexing & Query Tuning', 'Data Structures & Algorithms'],
      strategicVerdictTemplate: (comp) =>
        `Authentic live role at ${comp}. Strong alignment with core systems, distributed backends, and cloud scalability.`,
    };
  }
}

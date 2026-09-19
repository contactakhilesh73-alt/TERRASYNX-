/**
 * TERRASYNX: Upcoming Predictable Annual Internship Recruitment Calendar Service
 * Truth-Anchored Seasonal Ingestion: Transparently tracking recurring annual recruitment cycles
 * (e.g. Google Summer SWE / STEP, Microsoft Engage, Amazon SDE, Uber STAR, Goldman Sachs, etc.)
 * giving students the critical advance notice & runway to prepare.
 */

import { UpcomingInternshipCycle } from '../types';

export const RECURRING_ANNUAL_INTERNSHIPS: UpcomingInternshipCycle[] = [
  {
    id: 'cycle_google_summer_intern',
    companyName: 'Google',
    companyLogo: 'https://logo.clearbit.com/google.com',
    companyDomain: 'google.com',
    programTitle: 'Google Summer of Code / Summer Software Engineering Intern (STEP & SWE)',
    hiringCycleType: 'summer',
    expectedAnnouncementMonth: 'July - August',
    expectedWindowDuration: '3-4 weeks before application cap',
    targetBatches: [2026, 2027],
    annualRecurrencePattern: 'Annual global recruitment wave. Applications typically open mid-July for next year summer batch.',
    officialCareersUrl: 'https://careers.google.com/students',
    historicalCompensation: '₹1,15,000 - ₹1,35,000/mo (India) | $62 - $75/hr (US)',
    historicalAssessmentPlatform: 'Google OA (CodeSignal / Google Screening Framework)',
    keyPreparationTopics: ['Graphs (BFS/DFS, Dijkstra)', 'Dynamic Programming', 'Trie & String Manipulation', 'API Boundary Validation'],
    authenticityStatus: 'CALENDAR_PREDICTABLE',
    prepTimeRemainingMonths: 3,
    actionTip: 'Solve medium/hard Graph and Tree problems on LeetCode. Ensure your resume highlights at least 1 systems project with measurable benchmarks.',
    timelinePhases: {
      announcementMonth: 'July / August',
      assessmentMonth: 'August / September',
      interviewMonth: 'September - November',
      internshipStartMonth: 'May / June',
    }
  },
  {
    id: 'cycle_microsoft_explore_swe',
    companyName: 'Microsoft',
    companyLogo: 'https://logo.clearbit.com/microsoft.com',
    companyDomain: 'microsoft.com',
    programTitle: 'Microsoft University Software Engineer Intern & Explore Program',
    hiringCycleType: 'summer',
    expectedAnnouncementMonth: 'August - September',
    expectedWindowDuration: '4 weeks (Priority review for early applicants)',
    targetBatches: [2026, 2027],
    annualRecurrencePattern: 'Annual university hiring wave opening worldwide in late August for campus and off-campus candidates.',
    officialCareersUrl: 'https://careers.microsoft.com/students/us/en',
    historicalCompensation: '₹1,00,000 - ₹1,25,000/mo (India) | $55 - $68/hr (US)',
    historicalAssessmentPlatform: 'Codility / Microsoft Automated Assessment',
    keyPreparationTopics: ['Binary Search', 'Sliding Window', 'Linked Lists & Trees', 'Object-Oriented Design'],
    authenticityStatus: 'HISTORICALLY_CONFIRMED',
    prepTimeRemainingMonths: 4,
    actionTip: 'Focus on clean modular code and edge case testing during Codility practice. Microsoft heavily weights readable production-style code.',
    timelinePhases: {
      announcementMonth: 'August / September',
      assessmentMonth: 'September / October',
      interviewMonth: 'October - December',
      internshipStartMonth: 'May / June',
    }
  },
  {
    id: 'cycle_amazon_sde_summer',
    companyName: 'Amazon',
    companyLogo: 'https://logo.clearbit.com/amazon.com',
    companyDomain: 'amazon.com',
    programTitle: 'Amazon Software Development Engineer (SDE) Intern - Global Wave',
    hiringCycleType: 'summer',
    expectedAnnouncementMonth: 'August - October',
    expectedWindowDuration: 'Rolling applications until headcount fills',
    targetBatches: [2026, 2027],
    annualRecurrencePattern: 'Annual high-volume hiring wave rolling out in early August. High batch intake across AWS and Consumer teams.',
    officialCareersUrl: 'https://amazon.jobs/en/teams/student-programs',
    historicalCompensation: '₹80,000 - ₹1,10,000/mo (India) | $58 - $70/hr (US)',
    historicalAssessmentPlatform: 'HackerRank (2 algorithmic questions + Work Simulation / LP questions)',
    keyPreparationTopics: ['Amazon Leadership Principles (STAR format)', 'Binary Trees & Graphs', 'Hash Tables & Two Pointers', 'System Debugging'],
    authenticityStatus: 'HISTORICALLY_CONFIRMED',
    prepTimeRemainingMonths: 4,
    actionTip: 'Prepare 2 authentic project stories matching Amazon Leadership Principles (Customer Obsession, Ownership, Deliver Results) for the OA work simulation.',
    timelinePhases: {
      announcementMonth: 'August / September',
      assessmentMonth: 'September / October',
      interviewMonth: 'October - January',
      internshipStartMonth: 'May / June',
    }
  },
  {
    id: 'cycle_uber_star_swe',
    companyName: 'Uber',
    companyLogo: 'https://logo.clearbit.com/uber.com',
    companyDomain: 'uber.com',
    programTitle: 'Uber Engineering Intern & Uber STAR Program',
    hiringCycleType: 'summer',
    expectedAnnouncementMonth: 'September - October',
    expectedWindowDuration: '2-3 weeks (Strict early cut-off)',
    targetBatches: [2026, 2027],
    annualRecurrencePattern: 'Annual competitive hiring wave for tech hubs in US, Europe, and India (Bangalore / Hyderabad).',
    officialCareersUrl: 'https://uber.com/careers/university',
    historicalCompensation: '₹1,20,000 - ₹1,40,000/mo (India) | $65 - $78/hr (US)',
    historicalAssessmentPlatform: 'CodeSignal General Coding Assessment (GCA)',
    keyPreparationTopics: ['Fast algorithmic speed on CodeSignal', 'Matrix & 2D Arrays', 'Hash Map Lookups', 'Concurrency & Low-Latency Basics'],
    authenticityStatus: 'CALENDAR_PREDICTABLE',
    prepTimeRemainingMonths: 5,
    actionTip: 'Target a CodeSignal score of 800+ (out of 850) on timed practice. Practice speed-coding on test frameworks without external IDE helpers.',
    timelinePhases: {
      announcementMonth: 'September / October',
      assessmentMonth: 'October',
      interviewMonth: 'November - December',
      internshipStartMonth: 'May / June',
    }
  },
  {
    id: 'cycle_goldman_sachs_analyst',
    companyName: 'Goldman Sachs',
    companyLogo: 'https://logo.clearbit.com/goldmansachs.com',
    companyDomain: 'goldmansachs.com',
    programTitle: 'Goldman Sachs Summer Analyst Internship - Engineering Division',
    hiringCycleType: 'summer',
    expectedAnnouncementMonth: 'July - August',
    expectedWindowDuration: 'Typically opens on July 1st annually',
    targetBatches: [2026, 2027],
    annualRecurrencePattern: 'Strictly recurring annual global application opening on July 1 for next year summer analyst program.',
    officialCareersUrl: 'https://goldmansachs.com/careers/students/programs',
    historicalCompensation: '₹1,00,000 - ₹1,20,000/mo (India) | $55 - $65/hr (US)',
    historicalAssessmentPlatform: 'HackerRank (Math, DSA, and Aptitude / Quantitative MCQs)',
    keyPreparationTopics: ['Advanced Dynamic Programming', 'Mathematics & Probability', 'Sorting & Searching', 'Algorithmic Proofs'],
    authenticityStatus: 'OFFICIALLY_SCHEDULED',
    prepTimeRemainingMonths: 3,
    actionTip: 'Review probability fundamentals alongside DSA. Goldman Sachs assessments consistently include quantitative math and time complexity MCQs.',
    timelinePhases: {
      announcementMonth: 'July 1 (Annual Date)',
      assessmentMonth: 'August',
      interviewMonth: 'September - October',
      internshipStartMonth: 'May / June',
    }
  },
  {
    id: 'cycle_meta_swe_university',
    companyName: 'Meta',
    companyLogo: 'https://logo.clearbit.com/meta.com',
    companyDomain: 'meta.com',
    programTitle: 'Meta Software Engineer Intern & Meta University (Product / Systems)',
    hiringCycleType: 'summer',
    expectedAnnouncementMonth: 'August - September',
    expectedWindowDuration: 'Fast-filling priority queue (2-3 weeks)',
    targetBatches: [2026, 2027],
    annualRecurrencePattern: 'Annual early-fall recruiting cycle across Menlo Park, New York, London, and international offices.',
    officialCareersUrl: 'https://metacareers.com/students',
    historicalCompensation: '$60 - $75/hr + Housing Stipend (US/UK)',
    historicalAssessmentPlatform: 'CodeSignal / Meta Screening Engineer Round',
    keyPreparationTopics: ['Binary Trees & Topological Sort', 'Two Pointers & Sliding Window', 'System Architecture Fundamentals'],
    authenticityStatus: 'CALENDAR_PREDICTABLE',
    prepTimeRemainingMonths: 4,
    actionTip: 'Solve the top 100 Meta-tagged questions on LeetCode. Meta interviewers value speed, optimal time complexity, and zero syntax compilation pauses.',
    timelinePhases: {
      announcementMonth: 'August / September',
      assessmentMonth: 'September / October',
      interviewMonth: 'October - November',
      internshipStartMonth: 'June',
    }
  },
  {
    id: 'cycle_apple_summer_intern',
    companyName: 'Apple',
    companyLogo: 'https://logo.clearbit.com/apple.com',
    companyDomain: 'apple.com',
    programTitle: 'Apple Hardware / Software Technology Intern (Summer Programs)',
    hiringCycleType: 'summer',
    expectedAnnouncementMonth: 'September - October',
    expectedWindowDuration: 'Rolling openings by specialized hardware & software teams',
    targetBatches: [2026, 2027],
    annualRecurrencePattern: 'Annual fall postings direct on jobs.apple.com with team-specific requisitions.',
    officialCareersUrl: 'https://apple.com/jobs/us/students.html',
    historicalCompensation: '$55 - $72/hr (US) | ₹90,000 - ₹1,20,000/mo (India)',
    historicalAssessmentPlatform: 'Custom Team Technical Assessment & Domain Deep-Dive',
    keyPreparationTopics: ['C / C++ Memory Management', 'Operating Systems Primitives', 'Data Structures', 'GPU / Swift / CoreML Architecture'],
    authenticityStatus: 'HISTORICALLY_CONFIRMED',
    prepTimeRemainingMonths: 5,
    actionTip: 'Tailor your resume precisely to specific team domains (CoreOS, Machine Learning, UI Frameworks) rather than a generic SWE template.',
    timelinePhases: {
      announcementMonth: 'September - October',
      assessmentMonth: 'October - November',
      interviewMonth: 'November - January',
      internshipStartMonth: 'May / June',
    }
  },
  {
    id: 'cycle_salesforce_futureforce',
    companyName: 'Salesforce',
    companyLogo: 'https://logo.clearbit.com/salesforce.com',
    companyDomain: 'salesforce.com',
    programTitle: 'Salesforce Futureforce Summer Software Engineer Intern',
    hiringCycleType: 'summer',
    expectedAnnouncementMonth: 'August - September',
    expectedWindowDuration: '3-4 weeks',
    targetBatches: [2026, 2027],
    annualRecurrencePattern: 'Futureforce global annual university cohort opens late August.',
    officialCareersUrl: 'https://salesforce.com/company/careers/university-recruiting',
    historicalCompensation: '₹95,000 - ₹1,15,000/mo (India) | $55 - $68/hr (US)',
    historicalAssessmentPlatform: 'HackerRank (2 algorithmic problems + Unit test coverage)',
    keyPreparationTopics: ['Java / Python Concurrency', 'Database Indexing & SQL', 'Graph Traversal', 'REST API Architecture'],
    authenticityStatus: 'CALENDAR_PREDICTABLE',
    prepTimeRemainingMonths: 4,
    actionTip: 'Practice writing modular code with edge-case test suites. Futureforce assessments evaluate code quality, variable naming, and unit test thoroughness.',
    timelinePhases: {
      announcementMonth: 'August',
      assessmentMonth: 'September',
      interviewMonth: 'October - November',
      internshipStartMonth: 'May / June',
    }
  },
  {
    id: 'cycle_adobe_swe_intern',
    companyName: 'Adobe',
    companyLogo: 'https://logo.clearbit.com/adobe.com',
    companyDomain: 'adobe.com',
    programTitle: 'Adobe Software Engineering Intern & Adobe Research Fellowship',
    hiringCycleType: 'summer',
    expectedAnnouncementMonth: 'August - September',
    expectedWindowDuration: '3 weeks',
    targetBatches: [2026, 2027],
    annualRecurrencePattern: 'Annual national college & off-campus hiring drive for Noida, Bangalore, and San Jose campuses.',
    officialCareersUrl: 'https://adobe.com/careers/university.html',
    historicalCompensation: '₹1,00,000 - ₹1,25,000/mo (India) | $58 - $70/hr (US)',
    historicalAssessmentPlatform: 'HackerRank (Medium/Hard Algorithmic + Computer Graphics/Systems)',
    keyPreparationTopics: ['Dynamic Programming (Grid/Knapsack)', 'Binary Trees & BSTs', 'Object-Oriented Design', 'Memory Optimization'],
    authenticityStatus: 'HISTORICALLY_CONFIRMED',
    prepTimeRemainingMonths: 4,
    actionTip: 'Solve multi-state DP questions and review modern C++ or Java memory structures.',
    timelinePhases: {
      announcementMonth: 'August / September',
      assessmentMonth: 'September',
      interviewMonth: 'October - November',
      internshipStartMonth: 'May / June',
    }
  },
  {
    id: 'cycle_cisco_ideathon_intern',
    companyName: 'Cisco',
    companyLogo: 'https://logo.clearbit.com/cisco.com',
    companyDomain: 'cisco.com',
    programTitle: 'Cisco Ideathon & Technical Undergraduate Software Intern',
    hiringCycleType: 'summer',
    expectedAnnouncementMonth: 'June - July',
    expectedWindowDuration: 'Strict campus & public registration window',
    targetBatches: [2026, 2027],
    annualRecurrencePattern: 'Cisco Ideathon & internship challenges open annually in June/July across universities.',
    officialCareersUrl: 'https://cisco.com/c/en/us/about/careers/we-are-cisco/students-and-new-graduates.html',
    historicalCompensation: '₹75,000 - ₹95,000/mo (India) | $45 - $55/hr (US)',
    historicalAssessmentPlatform: 'Cisco HackerRank Challenge + Networking / OS Fundamentals MCQs',
    keyPreparationTopics: ['Computer Networking (TCP/IP, OSI, Sockets)', 'Operating Systems & Threading', 'Array & String Algorithms'],
    authenticityStatus: 'OFFICIALLY_SCHEDULED',
    prepTimeRemainingMonths: 2,
    actionTip: 'Review TCP/IP layers, routing protocols, and socket programming alongside standard DSA arrays/strings.',
    timelinePhases: {
      announcementMonth: 'June / July',
      assessmentMonth: 'July',
      interviewMonth: 'August - September',
      internshipStartMonth: 'January (6-month) or May (Summer)',
    }
  }
];

export class UpcomingInternshipsService {
  /**
   * Get all recurring upcoming internship cycles
   */
  public static getAllUpcomingCycles(): UpcomingInternshipCycle[] {
    return [...RECURRING_ANNUAL_INTERNSHIPS];
  }

  /**
   * Filter cycles by month or search query
   */
  public static filterUpcomingCycles(params: {
    month?: string;
    targetBatch?: number;
    query?: string;
  }): UpcomingInternshipCycle[] {
    let list = [...RECURRING_ANNUAL_INTERNSHIPS];

    if (params.query && params.query.trim()) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(item => 
        item.companyName.toLowerCase().includes(q) ||
        item.programTitle.toLowerCase().includes(q) ||
        item.keyPreparationTopics.some(t => t.toLowerCase().includes(q))
      );
    }

    if (params.month && params.month !== 'all') {
      const m = params.month.toLowerCase();
      list = list.filter(item => 
        item.expectedAnnouncementMonth.toLowerCase().includes(m) ||
        item.timelinePhases.announcementMonth.toLowerCase().includes(m)
      );
    }

    if (params.targetBatch) {
      list = list.filter(item => item.targetBatches.includes(params.targetBatch!));
    }

    return list;
  }
}

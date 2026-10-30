import { curatedRecordsService } from './curatedRecordsService';
/**
 * TERRASYNX: Upcoming Predictable Annual Internship Recruitment Calendar Service
 * Truth-Anchored Seasonal Ingestion: Transparently tracking recurring annual recruitment cycles
 * (e.g. Google Summer SWE / STEP, Microsoft Engage, Amazon SDE, Uber STAR, Goldman Sachs, etc.)
 * giving students the critical advance notice & runway to prepare.
 * 
 * Strict Zero-Fake Policy:
 * All entries represent historical annual recurring recruitment patterns.
 * Marked explicitly as CALENDAR_PREDICTABLE or HISTORICALLY_CONFIRMED.
 * Never labeled as live-scraped cryptographic verified.
 * 
 * Day-Level Live Precision:
 * Status is evaluated against the exact day/time when the student views the platform:
 * - "OPEN_NOW": Current date is between startDay/startMonth and endDay/endMonth (e.g. 15 Aug to 21 Sep).
 * - "PASSED_THIS_CYCLE": As soon as current date exceeds endDay/endMonth (e.g. on 22 Sep),
 *   it automatically moves from Ongoing (Open Now) to Passed!
 * - "UPCOMING": Current date is before startDay/startMonth.
 */

import { UpcomingInternshipCycle, InternshipCycleCurrentStatus, DateConfidence } from '../types';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export interface CycleEvaluation {
  status: InternshipCycleCurrentStatus;
  daysRemaining: number;
  exactWindowText: string;
}

/**
 * Evaluates an internship cycle against an exact date down to the day/millisecond:
 * - Automatically detects year boundaries (e.g. Nov to Feb)
 * - Returns exact days remaining (hours/days until window closes or opens)
 * - Transitions seamlessly from OPEN_NOW to PASSED_THIS_CYCLE the moment the deadline passes
 */
export function evaluateInternshipCycle(
  cycle: {
    startMonth: number;
    startDay?: number;
    endMonth: number;
    endDay?: number;
    exactWindowText?: string;
  },
  currentDate: Date = new Date()
): CycleEvaluation {
  const currentYear = currentDate.getFullYear();
  const startDay = cycle.startDay ?? 1;
  const endDay = cycle.endDay ?? new Date(currentYear, cycle.endMonth, 0).getDate();

  let startDate: Date;
  let endDate: Date;

  if (cycle.startMonth <= cycle.endMonth) {
    startDate = new Date(currentYear, cycle.startMonth - 1, startDay, 0, 0, 0, 0);
    endDate = new Date(currentYear, cycle.endMonth - 1, endDay, 23, 59, 59, 999);
  } else {
    // Window spans year-end boundary (e.g., Nov to Feb)
    const currentMonth = currentDate.getMonth() + 1;
    if (currentMonth >= cycle.startMonth) {
      startDate = new Date(currentYear, cycle.startMonth - 1, startDay, 0, 0, 0, 0);
      endDate = new Date(currentYear + 1, cycle.endMonth - 1, endDay, 23, 59, 59, 999);
    } else {
      startDate = new Date(currentYear - 1, cycle.startMonth - 1, startDay, 0, 0, 0, 0);
      endDate = new Date(currentYear, cycle.endMonth - 1, endDay, 23, 59, 59, 999);
    }
  }

  const startMonthName = MONTH_NAMES[cycle.startMonth - 1];
  const endMonthName = MONTH_NAMES[cycle.endMonth - 1];
  const exactWindowText = cycle.exactWindowText || `${startDay} ${startMonthName} – ${endDay} ${endMonthName}`;

  const currentMs = currentDate.getTime();
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  let status: InternshipCycleCurrentStatus;
  let daysRemaining: number;

  if (currentMs < startMs) {
    status = 'UPCOMING';
    daysRemaining = Math.max(1, Math.ceil((startMs - currentMs) / (1000 * 60 * 60 * 24)));
  } else if (currentMs <= endMs) {
    status = 'OPEN_NOW';
    daysRemaining = Math.max(0, Math.ceil((endMs - currentMs) / (1000 * 60 * 60 * 24)));
  } else {
    status = 'PASSED_THIS_CYCLE';
    daysRemaining = 0;
  }

  return {
    status,
    daysRemaining,
    exactWindowText,
  };
}

export function calculateInternshipCycleStatus(
  startMonth: number,
  endMonth: number,
  currentDate: Date = new Date(),
  startDay?: number,
  endDay?: number,
  dateConfidence?: DateConfidence
): InternshipCycleCurrentStatus | undefined {
  if (dateConfidence === 'CONFLICTING' || dateConfidence === 'UNKNOWN') {
    return undefined;
  }
  return evaluateInternshipCycle({ startMonth, startDay, endMonth, endDay }, currentDate).status;
}

/**
 * Natural Search Synonyms Mapping:
 * Maps common geographic queries, domain phrases, abbreviations, and informal student terms
 * to relevant companies, tracks, research labs, and open source foundations.
 */
export const NATURAL_SEARCH_SYNONYMS: Record<string, { aliases: string[]; label: string }> = {
  // Global Scientific Labs & Geography
  'switzerland': { aliases: ['cern', 'geneva', 'swiss', 'eth', 'zurich', 'ssrf'], label: 'CERN & ETH Zurich Switzerland' },
  'geneva': { aliases: ['cern', 'swiss'], label: 'CERN Geneva' },
  'zurich': { aliases: ['eth', 'ssrf', 'swiss', 'switzerland'], label: 'ETH Zurich SSRF' },
  'eth': { aliases: ['eth zurich', 'ssrf', 'switzerland', 'zurich'], label: 'ETH Zurich Summer Fellowship' },
  'swiss': { aliases: ['cern', 'eth', 'zurich'], label: 'Swiss Research Labs' },
  'canada': { aliases: ['mitacs', 'globalink', 'vancouver', 'toronto'], label: 'Mitacs Globalink Research Canada' },
  'canadian': { aliases: ['mitacs', 'globalink'], label: 'Mitacs Canada' },
  'germany': { aliases: ['desy', 'daad', 'mpi', 'max planck', 'sws'], label: 'DESY / DAAD WISE / Max Planck Germany' },
  'german': { aliases: ['desy', 'daad', 'mpi', 'max planck'], label: 'German Research Labs' },
  'berlin': { aliases: ['desy', 'daad'], label: 'German Fellowships' },
  'hamburg': { aliases: ['desy'], label: 'DESY Hamburg' },
  'france': { aliases: ['charpak', 'french', 'paris'], label: 'Charpak Lab Fellowship France' },
  'paris': { aliases: ['charpak'], label: 'Charpak Lab France' },
  'japan': { aliases: ['riken', 'tokyo', 'oist', 'meti', 'woven', 'toyota'], label: 'RIKEN, OIST, METI & Woven by Toyota Japan' },
  'tokyo': { aliases: ['riken', 'woven', 'meti', 'toyota'], label: 'RIKEN & Woven by Toyota Tokyo' },
  'singapore': { aliases: ['ntu', 'nus', 'iris', 'mycareersfuture', 'govtech', 'singapore_gov'], label: 'Singapore Tech Hub (MyCareersFuture, NUS IRIS & NTU)' },
  'mycareersfuture': { aliases: ['mycareersfuture', 'govtech', 'singapore', 'singapore_gov'], label: 'MyCareersFuture Singapore Tech Portal' },
  'taiwan': { aliases: ['sinica', 'tiip', 'taiwan'], label: 'Academia Sinica TIIP Taiwan' },
  'korea': { aliases: ['kaist', 'snu', 'seoul'], label: 'KAIST & SNU Summer Research Korea' },
  'seoul': { aliases: ['kaist', 'snu'], label: 'KAIST / SNU Korea' },
  'israel': { aliases: ['weizmann', 'rehovot', 'tel aviv'], label: 'Weizmann Kupcinet-Getz Fellowship Israel' },
  'usa': { aliases: ['fermilab', 'chicago', 'us', 'united states'], label: 'Fermilab / US Tech Fellowships' },
  'rbi': { aliases: ['rbi', 'reserve bank of india', 'reserve bank'], label: 'Reserve Bank of India (RBI) Placements & Internships' },
  'deloitte': { aliases: ['deloitte'], label: 'Deloitte Cyber & Consulting Advisory' },
  'niti aayog': { aliases: ['niti', 'niti aayog'], label: 'NITI Aayog Policy & Analytics Internship' },
  'niti': { aliases: ['niti', 'niti aayog'], label: 'NITI Aayog Policy & Analytics Internship' },
  'meti': { aliases: ['meti', 'japan'], label: 'METI Government of Japan Internship' },
  'oist': { aliases: ['oist', 'okinawa'], label: 'OIST Research Internship (Japan)' },
  'woven': { aliases: ['woven', 'toyota'], label: 'Woven by Toyota Software & Robotics' },
  'toyota': { aliases: ['woven', 'toyota'], label: 'Woven by Toyota Software & Robotics' },
  'tiip': { aliases: ['tiip', 'sinica', 'taiwan'], label: 'Academia Sinica TIIP (Taiwan)' },
  'iris': { aliases: ['iris', 'nus'], label: 'NUS IRIS Research Internship (Singapore)' },

  // Open Source & Remote Work
  'remote': { aliases: ['gsoc', 'lfx', 'outreachy', 'mlh', 'gsod', 'gitlab', 'coinbase', 'twilio', 'open_source_grant'], label: 'Remote Open-Source & Work From Home Tracks' },
  'wfh': { aliases: ['gsoc', 'lfx', 'outreachy', 'mlh', 'gsod', 'gitlab', 'coinbase', 'twilio'], label: 'Remote / Work From Home Tracks' },
  'work from home': { aliases: ['gsoc', 'lfx', 'outreachy', 'mlh', 'gsod'], label: 'Remote / WFH Fellowships' },
  'github': { aliases: ['gsoc', 'lfx', 'outreachy', 'mlh', 'gsod', 'open_source_grant'], label: 'GitHub & Open Source Foundation Grants' },
  'git': { aliases: ['gsoc', 'lfx', 'outreachy', 'mlh', 'gsod', 'open_source_grant'], label: 'Open Source Foundations' },
  'open source': { aliases: ['gsoc', 'lfx', 'outreachy', 'mlh', 'gsod', 'open_source_grant'], label: 'Open Source Programs (GSoC, LFX, Outreachy)' },
  'opensource': { aliases: ['gsoc', 'lfx', 'outreachy', 'mlh', 'gsod', 'open_source_grant'], label: 'Open Source Programs' },
  'floss': { aliases: ['gsoc', 'lfx', 'outreachy', 'mlh', 'gsod'], label: 'Free & Open Source Programs' },

  // Quants & High-Frequency Trading
  'quant': { aliases: ['jane street', 'citadel', 'de shaw', 'd. e. shaw', 'two sigma', 'goldman sachs', 'morgan stanley', 'jpmorgan', 'quant_hft', 'hrt', 'hudson river trading', 'imc', 'optiver', 'jump', 'jump trading', 'tower research', 'five rings'], label: 'Top Quantitative Trading & HFT Firms' },
  'quants': { aliases: ['jane street', 'citadel', 'de shaw', 'd. e. shaw', 'two sigma', 'goldman sachs', 'morgan stanley', 'jpmorgan', 'quant_hft', 'hrt', 'hudson river trading', 'imc', 'optiver', 'jump', 'jump trading', 'tower research', 'five rings'], label: 'Quantitative Trading & HFT' },
  'hft': { aliases: ['jane street', 'citadel', 'de shaw', 'two sigma', 'quant_hft', 'hrt', 'hudson river trading', 'imc', 'optiver', 'jump', 'jump trading', 'tower research', 'five rings'], label: 'High Frequency Trading (HFT)' },
  'trading': { aliases: ['jane street', 'citadel', 'de shaw', 'two sigma', 'goldman sachs', 'morgan stanley', 'jpmorgan', 'hrt', 'hudson river trading', 'imc', 'optiver', 'jump', 'tower research', 'five rings'], label: 'Algorithmic Trading & Finance' },
  'algorithmic trading': { aliases: ['jane street', 'citadel', 'de shaw', 'two sigma', 'quant_hft', 'hrt', 'hudson river trading', 'imc', 'optiver', 'jump', 'tower research', 'five rings'], label: 'Algorithmic Trading' },
  'wall street': { aliases: ['goldman sachs', 'morgan stanley', 'jpmorgan', 'citadel', 'jane street', 'hrt', 'hudson river trading', 'imc', 'optiver', 'jump'], label: 'Wall Street & Financial Tech' },

  // Frontier AI & Deep Learning
  'frontier ai': { aliases: ['openai', 'deepmind', 'anthropic', 'fair', 'msr', 'frontier_ai'], label: 'Frontier AI Labs (OpenAI, DeepMind, Anthropic, FAIR)' },
  'ai': { aliases: ['openai', 'deepmind', 'anthropic', 'fair', 'msr', 'nvidia', 'databricks', 'frontier_ai'], label: 'Frontier AI & Machine Learning' },
  'llm': { aliases: ['openai', 'deepmind', 'anthropic', 'fair', 'frontier_ai'], label: 'Large Language Models (LLM) Research' },
  'llms': { aliases: ['openai', 'deepmind', 'anthropic', 'fair', 'frontier_ai'], label: 'LLM Research' },
  'generative ai': { aliases: ['openai', 'deepmind', 'anthropic', 'fair', 'nvidia'], label: 'Generative AI' },
  'deep learning': { aliases: ['openai', 'deepmind', 'anthropic', 'fair', 'deepmind'], label: 'Deep Learning Labs' },

  // Big Tech
  'big tech': { aliases: ['google', 'microsoft', 'amazon', 'meta', 'apple', 'netflix', 'uber', 'salesforce', 'adobe', 'nvidia', 'tech_giant'], label: 'Big Tech Giants (FAANG / MANGA)' },
  'faang': { aliases: ['meta', 'apple', 'amazon', 'netflix', 'google'], label: 'FAANG Companies' },
  'manga': { aliases: ['meta', 'apple', 'netflix', 'google', 'amazon'], label: 'MANGA Tech Giants' },

  // Undergrad / Freshers
  'freshers': { aliases: ['step', 'explore', 'star', 'university', 'first year', 'early_undergrad_exclusive'], label: '1st & 2nd Year Undergrad Exclusive (STEP, Explore, STAR)' },
  'fresher': { aliases: ['step', 'explore', 'star', 'university', 'first year', 'early_undergrad_exclusive'], label: 'Early Undergrad Freshers' },
  '1st year': { aliases: ['step', 'explore', 'star', 'university', 'first year', 'early_undergrad_exclusive'], label: '1st Year Freshmen Programs' },
  'first year': { aliases: ['step', 'explore', 'star', 'university', 'first year', 'early_undergrad_exclusive'], label: '1st Year Undergrad Programs' },
  '2nd year': { aliases: ['step', 'explore', 'star', 'university', 'first year', 'early_undergrad_exclusive'], label: '2nd Year Sophomore Programs' },
  'second year': { aliases: ['step', 'explore', 'star', 'university', 'first year', 'early_undergrad_exclusive'], label: '2nd Year Undergrad Programs' },
  'sophomore': { aliases: ['step', 'explore', 'star', 'university', 'early_undergrad_exclusive'], label: 'Sophomore Exclusive Programs' },
  'freshman': { aliases: ['step', 'explore', 'star', 'university', 'first year', 'early_undergrad_exclusive'], label: 'Freshman Exclusive Programs' },

  // Class 12th Early Talent
  'class 12': { aliases: ['techbee', 'amazon future engineer', 'early_career_12th', 'class 12'], label: 'Class 12th Passout Early Career Programs' },
  '12th': { aliases: ['techbee', 'amazon future engineer', 'early_career_12th', 'class 12'], label: 'Class 12th Programs' },
  'high school': { aliases: ['techbee', 'amazon future engineer', 'early_career_12th'], label: 'High School Early Talent' },

  // Global Full-Ride Scholarships
  'full ride': { aliases: ['global_full_ride', 'crore', 'scholarship', 'full-ride', 'pre_university_full_ride'], label: '₹3 - 4 Crore Global Full-Ride Scholarships' },
  'scholarship': { aliases: ['scholarship', 'global_full_ride', 'mitacs', 'daad', 'fellowship', 'pre_university_full_ride'], label: 'Scholarships & Research Fellowships' },
  'crore': { aliases: ['crore', 'global_full_ride', 'pre_university_full_ride'], label: '₹3 - 4 Crore Global Scholarships' },
  '3 crore': { aliases: ['crore', 'global_full_ride', 'pre_university_full_ride'], label: '₹3+ Crore Full-Ride Scholarships' },
  '4 crore': { aliases: ['crore', 'global_full_ride', 'pre_university_full_ride'], label: '₹4 Crore Full-Ride Scholarships' },

  // Early Runway: Pre-University Full-Ride Scholarships (Class 12 / Ivy+ / Govt Schemes)
  'pre-university': { aliases: ['pre_university_full_ride', 'harvard', 'mit', 'princeton', 'yale', 'amherst', 'dartmouth', 'bowdoin', 'brown', 'notre dame', 'washington and lee', 'tata', 'pearson', 'karsh', 'jardine', 'nos', 'marang gomke', 'rajarshi shahu', 'ambedkar'], label: 'Early Runway Pre-University Scholarships' },
  'pre university': { aliases: ['pre_university_full_ride', 'harvard', 'mit', 'princeton', 'yale', 'amherst', 'dartmouth', 'bowdoin', 'brown', 'notre dame', 'washington and lee', 'tata', 'pearson', 'karsh', 'jardine', 'nos', 'marang gomke', 'rajarshi shahu', 'ambedkar'], label: 'Early Runway Pre-University Scholarships' },
  'ivy': { aliases: ['harvard', 'mit', 'princeton', 'yale', 'dartmouth', 'brown', 'cornell', 'amherst', 'bowdoin', 'notre dame'], label: 'Need-Blind Ivy+ Full-Ride Admissions' },
  'ivy+': { aliases: ['harvard', 'mit', 'princeton', 'yale', 'dartmouth', 'brown', 'cornell', 'amherst', 'bowdoin', 'notre dame'], label: 'Need-Blind Ivy+ Full-Ride Admissions' },
  'need blind': { aliases: ['harvard', 'mit', 'princeton', 'yale', 'amherst', 'dartmouth', 'bowdoin', 'brown', 'notre dame', 'washington and lee'], label: '100% Need-Blind Admissions' },
  'need-blind': { aliases: ['harvard', 'mit', 'princeton', 'yale', 'amherst', 'dartmouth', 'bowdoin', 'brown', 'notre dame', 'washington and lee'], label: '100% Need-Blind Admissions' },
  'tata scholarship': { aliases: ['tata', 'cornell'], label: 'Tata Scholarship (Cornell University)' },
  'pearson': { aliases: ['pearson', 'toronto'], label: 'Lester B. Pearson Scholarship (U of Toronto)' },
  'karsh': { aliases: ['karsh', 'duke'], label: 'Karsh International Scholarship (Duke University)' },
  'jardine': { aliases: ['jardine', 'oxford', 'cambridge', 'oxbridge'], label: 'Jardine Scholarship (Oxford & Cambridge)' },
  'nos': { aliases: ['national overseas', 'nos', 'socialjustice'], label: 'National Overseas Scholarship (NOS)' },
  'national overseas': { aliases: ['national overseas', 'nos', 'socialjustice'], label: 'National Overseas Scholarship (NOS)' },
  'marang gomke': { aliases: ['marang gomke', 'jharkhand'], label: 'Marang Gomke Overseas Scholarship (Jharkhand)' },
  'rajarshi shahu': { aliases: ['rajarshi', 'shahu', 'maharashtra'], label: 'Rajarshi Shahu Maharaj Scholarship (Maharashtra)' },
  'ambedkar overseas': { aliases: ['ambedkar', 'vidya nidhi', 'telangana', 'andhra'], label: 'Ambedkar Overseas Vidya Nidhi (AP/Telangana)' },
  'vidya nidhi': { aliases: ['ambedkar', 'vidya nidhi', 'telangana', 'andhra'], label: 'Ambedkar Overseas Vidya Nidhi (AP/Telangana)' },
};

/**
 * Evaluates whether an internship cycle matches a search query using direct text
 * or natural search synonyms (e.g. "switzerland" -> CERN, "canada" -> Mitacs, "remote" -> GSoC/LFX).
 */
export function matchesSearchQuery(item: UpcomingInternshipCycle, query: string): boolean {
  if (!query || !query.trim()) return true;
  const q = query.toLowerCase().trim();

  const searchableText = [
    item.companyName,
    item.country,
    item.programTitle,
    item.companyDomain,
    item.eligibility,
    item.selectionCriteria,
    item.tierCategory,
    item.programCategory,
    item.rateType,
    item.eligibilityCriteria,
    item.targetAudienceText,
    item.fundingAmountText,
    item.coverageBreakdown,
    item.historicalCompensation,
    item.disclaimerNotice,
    item.seatQuotaInfo,
    item.historicalAssessmentPlatform,
    item.actionTip,
    item.annualRecurrencePattern,
    ...(item.keyPreparationTopics || []),
    ...(item.targetBatches ? item.targetBatches.map(b => b === 12 ? 'class 12' : `batch ${b}`) : [])
  ].filter(Boolean).join(' ').toLowerCase();

  // 1. Direct substring match
  if (searchableText.includes(q)) return true;

  // 2. Check each word in multi-word queries
  const words = q.split(/\s+/).filter(w => w.length > 1);
  if (words.length > 1 && words.every(w => searchableText.includes(w))) {
    return true;
  }

  // 3. Natural Search Synonyms resolution
  for (const [synonymKey, config] of Object.entries(NATURAL_SEARCH_SYNONYMS)) {
    if (q.includes(synonymKey) || synonymKey.includes(q)) {
      if (config.aliases.some(alias => searchableText.includes(alias.toLowerCase()))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Detects if a search query triggered a known natural synonym for user feedback
 */
export function detectNaturalSynonymHint(query: string): string | null {
  if (!query || !query.trim()) return null;
  const q = query.toLowerCase().trim();
  for (const [synonymKey, config] of Object.entries(NATURAL_SEARCH_SYNONYMS)) {
    if (q === synonymKey || q.includes(synonymKey) || synonymKey.includes(q)) {
      return `Natural synonym matched: "${query}" → ${config.label}`;
    }
  }
  return null;
}

// Prompt 64: Data out of code — Hardcoded array migrated to Firestore 'records' and 'sources' collections
export const RECURRING_ANNUAL_INTERNSHIPS: UpcomingInternshipCycle[] = curatedRecordsService.getUpcomingInternshipCycles();

export class UpcomingInternshipsService {
  /**
   * Calculate status for a specific cycle based on current date with day precision.
   * Prompt 57: Only computes status when dateConfidence is OFFICIAL or REPORTED.
   */
  public static calculateStatus(
    cycle: { startMonth: number; endMonth: number; startDay?: number; endDay?: number; dateConfidence?: DateConfidence },
    currentDate: Date = new Date()
  ): InternshipCycleCurrentStatus | undefined {
    if (cycle.dateConfidence === 'CONFLICTING' || cycle.dateConfidence === 'UNKNOWN') {
      return undefined;
    }
    return evaluateInternshipCycle(cycle, currentDate).status;
  }

  /**
   * Get all recurring upcoming internship cycles with enriched dynamically computed day-level status
   */
  public static getAllUpcomingCycles(currentDate: Date = new Date()): UpcomingInternshipCycle[] {
    return RECURRING_ANNUAL_INTERNSHIPS.map(cycle => {
      // Prompt 57: dateConfidence resolution
      const dateConfidence: DateConfidence = cycle.dateConfidence || (
        cycle.authenticityStatus === 'OFFICIALLY_SCHEDULED' ? 'OFFICIAL' : 'REPORTED'
      );

      // Prompt 57: Store dates as ISO strings (YYYY-MM-DD)
      const currentYear = currentDate.getFullYear();
      const startDay = cycle.startDay ?? 1;
      const endDay = cycle.endDay ?? new Date(currentYear, cycle.endMonth, 0).getDate();
      const startIso = dateConfidence === 'UNKNOWN' ? undefined : (cycle.startDate !== undefined ? cycle.startDate : `${currentYear}-${String(cycle.startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`);
      const endIso = dateConfidence === 'UNKNOWN' ? undefined : (cycle.endDate !== undefined ? cycle.endDate : `${currentYear}-${String(cycle.endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`);

      // Prompt 57: Compute status (Open Now / Upcoming / Passed) from the current date ONLY when dateConfidence is OFFICIAL or REPORTED
      let currentStatus: InternshipCycleCurrentStatus | undefined = undefined;
      let daysRemaining: number | undefined = undefined;
      let exactWindowText = cycle.exactWindowText;

      if (dateConfidence === 'OFFICIAL' || dateConfidence === 'REPORTED') {
        const evaluation = evaluateInternshipCycle(cycle, currentDate);
        currentStatus = evaluation.status;
        daysRemaining = evaluation.daysRemaining;
        exactWindowText = cycle.exactWindowText || evaluation.exactWindowText;
      }

      const guaranteedRateType = cycle.rateType || (
        cycle.historicalCompensation.includes('Official') ||
        cycle.historicalCompensation.includes('CHF/day') ||
        cycle.historicalCompensation.includes('€') ||
        cycle.tierCategory === 'open_source_grant' ||
        cycle.tierCategory === 'scientific_lab'
          ? 'OFFICIAL_CONFIRMED'
          : 'MARKET_ESTIMATED'
      );

      // Prompt 34B: Ensure accurate tierCategory resolution for corporate internships
      let resolvedTier = cycle.tierCategory;
      if (!resolvedTier || resolvedTier === 'industry_tech' || resolvedTier === ('internship' as any)) {
        if (cycle.isPreUniversityFullRide || cycle.programCategory === 'pre_university_full_ride') {
          resolvedTier = 'pre_university_full_ride';
        } else if (cycle.isGlobalFullRide || cycle.programCategory === 'global_full_ride') {
          resolvedTier = 'global_full_ride';
        } else if (cycle.programCategory === 'scholarship' || cycle.programCategory === 'early_career_12th' || cycle.isClass12Eligible) {
          resolvedTier = 'scholarship';
        } else if (cycle.id.includes('openai') || cycle.id.includes('anthropic')) {
          resolvedTier = 'frontier_ai';
        } else {
          resolvedTier = 'tech_giant';
        }
      }

      return {
        ...cycle,
        dateConfidence,
        startDate: startIso,
        endDate: endIso,
        tierCategory: resolvedTier,
        rateType: guaranteedRateType,
        currentStatus,
        daysRemaining,
        exactWindowText,
      };
    });
  }

  /**
   * Prompt 34A & 34B: Portal categories for separate top-level portals:
   * 1. Internships (corporate: tech_giant, quant_hft, frontier_ai, early_undergrad_exclusive)
   * 2. Scholarships (scholarship_12th, global_full_ride, pre_university_full_ride)
   * 3. Research & Fellowships (scientific_lab, academic_fellowship)
   * 4. Open Source (open_source_grant)
   */
  public static isCycleInPortal(
    cycle: UpcomingInternshipCycle, 
    portal: 'all' | 'internships' | 'scholarships' | 'research' | 'open_source'
  ): boolean {
    if (!portal || portal === 'all') return true;

    if (portal === 'open_source') {
      return (
        cycle.tierCategory === 'open_source_grant' ||
        cycle.programCategory === 'open_source_grant' ||
        cycle.hiringCycleType === 'open_source_grant'
      );
    }

    if (portal === 'research') {
      return (
        cycle.tierCategory === 'scientific_lab' ||
        cycle.tierCategory === 'academic_fellowship' ||
        cycle.programCategory === 'scientific_lab' ||
        cycle.programCategory === 'academic_fellowship' ||
        cycle.hiringCycleType === 'scientific_lab' ||
        cycle.hiringCycleType === 'academic_fellowship'
      );
    }

    if (portal === 'scholarships') {
      return Boolean(
        cycle.isGlobalFullRide ||
        cycle.isPreUniversityFullRide ||
        cycle.tierCategory === 'pre_university_full_ride' ||
        cycle.tierCategory === 'global_full_ride' ||
        cycle.tierCategory === 'scholarship' ||
        cycle.programCategory === 'pre_university_full_ride' ||
        cycle.programCategory === 'global_full_ride' ||
        cycle.programCategory === 'scholarship' ||
        cycle.programCategory === 'early_career_12th' ||
        cycle.hiringCycleType === 'scholarship' ||
        cycle.hiringCycleType === 'global_full_ride' ||
        cycle.hiringCycleType === 'pre_university_full_ride' ||
        cycle.hiringCycleType === 'early_career_12th'
      );
    }

    if (portal === 'internships') {
      return (
        cycle.tierCategory === 'tech_giant' ||
        cycle.tierCategory === 'quant_hft' ||
        cycle.tierCategory === 'frontier_ai' ||
        cycle.tierCategory === 'early_undergrad_exclusive' ||
        (!UpcomingInternshipsService.isCycleInPortal(cycle, 'open_source') &&
         !UpcomingInternshipsService.isCycleInPortal(cycle, 'research') &&
         !UpcomingInternshipsService.isCycleInPortal(cycle, 'scholarships'))
      );
    }

    return true;
  }

  /**
   * Filter cycles by status, month, target batch, category, portal, or search query with live day-level evaluation
   */
  public static filterUpcomingCycles(params: {
    status?: InternshipCycleCurrentStatus | 'all';
    month?: string;
    targetBatch?: number | 'class_12' | 'all';
    category?: 'all' | 'internship' | 'scholarship_12th' | 'global_full_ride_3cr' | 'scientific_lab' | 'open_source_grant' | 'academic_fellowship' | 'frontier_ai' | 'early_undergrad_exclusive' | 'quant_hft' | 'tech_giant' | 'pre_university_full_ride';
    portal?: 'all' | 'internships' | 'scholarships' | 'research' | 'open_source';
    query?: string;
    currentDate?: Date;
  }): UpcomingInternshipCycle[] {
    const curDate = params.currentDate || new Date();
    let list = this.getAllUpcomingCycles(curDate);

    if (params.portal && params.portal !== 'all') {
      list = list.filter(item => UpcomingInternshipsService.isCycleInPortal(item, params.portal!));
    }

    if (params.status && params.status !== 'all') {
      list = list.filter(item => item.currentStatus === params.status);
    }

    if (params.category && params.category !== 'all') {
      if (params.category === 'pre_university_full_ride') {
        list = list.filter(item => item.tierCategory === 'pre_university_full_ride' || item.isPreUniversityFullRide || item.programCategory === 'pre_university_full_ride');
      } else if (params.category === 'quant_hft') {
        list = list.filter(item => item.tierCategory === 'quant_hft' || item.programCategory === 'quant_hft');
      } else if (params.category === 'tech_giant') {
        list = list.filter(item => item.tierCategory === 'tech_giant' || item.programCategory === 'tech_giant');
      } else if (params.category === 'frontier_ai') {
        list = list.filter(item => item.tierCategory === 'frontier_ai' || item.programCategory === 'frontier_ai');
      } else if (params.category === 'early_undergrad_exclusive') {
        list = list.filter(item => item.tierCategory === 'early_undergrad_exclusive' || item.programCategory === 'early_undergrad_exclusive');
      } else if (params.category === 'scientific_lab') {
        list = list.filter(item => 
          item.tierCategory === 'scientific_lab' || 
          item.programCategory === 'scientific_lab' ||
          item.tierCategory === 'academic_fellowship' ||
          item.programCategory === 'academic_fellowship'
        );
      } else if (params.category === 'open_source_grant') {
        list = list.filter(item => item.tierCategory === 'open_source_grant' || item.programCategory === 'open_source_grant');
      } else if (params.category === 'academic_fellowship') {
        list = list.filter(item => item.tierCategory === 'academic_fellowship' || item.programCategory === 'academic_fellowship');
      } else if (params.category === 'global_full_ride_3cr') {
        list = list.filter(item => 
          item.isGlobalFullRide || 
          item.programCategory === 'global_full_ride' ||
          item.isPreUniversityFullRide ||
          item.tierCategory === 'pre_university_full_ride' ||
          (item.fundingAmountText && item.fundingAmountText.toLowerCase().includes('crore'))
        );
      } else if (params.category === 'scholarship_12th') {
        list = list.filter(item => 
          item.isClass12Eligible || 
          item.isPreUniversityFullRide ||
          item.programCategory === 'scholarship' || 
          item.programCategory === 'early_career_12th' ||
          item.programCategory === 'pre_university_full_ride' ||
          item.targetBatches.includes(12)
        );
      } else if (params.category === 'internship') {
        list = list.filter(item => 
          !item.isClass12Eligible && 
          !item.isPreUniversityFullRide &&
          item.tierCategory !== 'pre_university_full_ride' &&
          item.programCategory !== 'pre_university_full_ride' &&
          item.programCategory !== 'scholarship' && 
          item.programCategory !== 'early_career_12th' && 
          item.programCategory !== 'global_full_ride' &&
          item.tierCategory !== 'scientific_lab' &&
          item.tierCategory !== 'open_source_grant' &&
          item.tierCategory !== 'academic_fellowship' &&
          item.tierCategory !== 'frontier_ai' &&
          item.tierCategory !== 'early_undergrad_exclusive' &&
          item.tierCategory !== 'quant_hft' &&
          item.tierCategory !== 'tech_giant'
        );
      }
    }

    if (params.query && params.query.trim()) {
      list = list.filter(item => matchesSearchQuery(item, params.query!));
    }

    if (params.month && params.month !== 'all') {
      const m = params.month.toLowerCase();
      list = list.filter(item => 
        item.expectedAnnouncementMonth.toLowerCase().includes(m) ||
        item.timelinePhases.announcementMonth.toLowerCase().includes(m)
      );
    }

    if (params.targetBatch && params.targetBatch !== 'all') {
      if (params.targetBatch === 'class_12' || params.targetBatch === 12) {
        list = list.filter(item => item.isClass12Eligible || item.targetBatches.includes(12));
      } else {
        list = list.filter(item => item.targetBatches.includes(Number(params.targetBatch)));
      }
    }

    // Sort order:
    // If OPEN_NOW: Sort by daysRemaining ascending (expiring soonest first!)
    // If UPCOMING: Sort by daysRemaining ascending (opening soonest first!)
    // If PASSED_THIS_CYCLE or 'all': Sort by startMonth, startDay
    if (params.status === 'OPEN_NOW') {
      list.sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999));
    } else if (params.status === 'UPCOMING') {
      list.sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999));
    } else {
      list.sort((a, b) => {
        if (a.startMonth !== b.startMonth) return a.startMonth - b.startMonth;
        return (a.startDay ?? 1) - (b.startDay ?? 1);
      });
    }

    return list;
  }
}

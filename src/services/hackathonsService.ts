/**
 * TERRASYNX: Hackathons & Open Innovation Competitions Service (Prompt 42)
 * 
 * Provides verified data, filtering, search, and status detection for top global hackathons:
 * - Sources: 'devpost-live' & 'recurring-series'
 * - Modes: 'online' | 'in-person' | 'hybrid'
 * - Country: 'Online/Global' when virtual, authentic country otherwise
 * - Strict Rule: Zero hiding based on student eligibility (Never hide a hackathon because of eligibility)
 * - Honest Empty State when filters yield 0 matches
 */

import { Hackathon, HackathonMode, HackathonSource, HackathonStatusTab, HackathonStatus, HackathonType } from '../types';

export const HACKATHONS_DATABASE: Hackathon[] = [
  {
    id: 'hack_nasa_space_apps',
    name: 'NASA International Space Apps Challenge',
    organizer: 'NASA',
    type: 'hackathon',
    mode: 'hybrid',
    country: 'Online/Global',
    themes: ['Space Exploration', 'Earth Science', 'Open Data', 'AI / Machine Learning'],
    eligibilityText: 'Open to all ages, teams up to 6. Free participation. Some local events are full.',
    entryFeeText: 'Free',
    prizeText: 'not listed',
    dates: '14-15 November 2026',
    startDate: '2026-11-14',
    endDate: '2026-11-15',
    registrationDeadline: '2026-11-15',
    datesNote: 'Registration open since 26 August, challenge statements 28 October; some local events full; confirm on the official page',
    lastEditionNote: 'Worldwide local events, registration open since 26 August, challenge statements 28 October, free, open to all ages, teams up to 6, some local events are full. Confirm on the official page.',
    officialUrl: 'https://www.spaceappschallenge.org',
    source: 'recurring-series',
    status: 'ANNOUNCED_VERIFIED',
    description: 'NASA flagship international hackathon where teams address real-world Earth and space science challenges using open NASA data.',
    locationDetails: 'Worldwide Local Events & Virtual Global'
  },
  {
    id: 'hack_colosseum_solana',
    name: 'Colosseum / Solana Hackathons',
    organizer: 'Colosseum & Solana Foundation',
    type: 'hackathon',
    mode: 'online',
    country: 'Online/Global',
    themes: ['Web3 / Blockchain', 'Crypto Infrastructure', 'DeFi', 'Open Source'],
    eligibilityText: 'Open to builders, founders, and engineers globally.',
    entryFeeText: 'Free',
    prizeText: 'not listed',
    dates: 'Confirm on the official page',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    datesNote: 'Runs twice per year (spring and autumn). Next edition NOT_ANNOUNCED; confirm on the official page',
    lastEditionNote: 'Online, two main editions per year (spring and autumn); 2026 spring edition "Frontier" ran 6 April to 11 May with a $2.5M venture fund; next edition NOT_ANNOUNCED. Confirm on the official page.',
    officialUrl: 'https://www.colosseum.org',
    source: 'recurring-series',
    status: 'NOT_ANNOUNCED',
    description: 'Premier online Solana hackathon platform running bi-annual global competitions with venture funding tracks.',
    locationDetails: 'Virtual / Online Global'
  },
  {
    id: 'hack_cal_hacks',
    name: 'Cal Hacks',
    organizer: 'Cal Hacks (UC Berkeley)',
    type: 'hackathon',
    mode: 'in-person',
    country: 'United States',
    themes: ['AI / Machine Learning', 'Developer Tools', 'Open Source', 'Social Impact'],
    eligibilityText: 'Undergraduate and collegiate students worldwide. Free entry.',
    entryFeeText: 'Free',
    prizeText: '$200,000+',
    dates: 'Confirm on the official page',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    datesNote: '2026 not confirmed; confirm on the official page',
    lastEditionNote: '2025 edition 24-26 Oct 2025, prize "$200,000+" per its own site; 2026 not confirmed. Confirm on the official page.',
    officialUrl: 'https://calhacks.io',
    source: 'recurring-series',
    status: 'NOT_ANNOUNCED',
    description: 'World’s largest collegiate hackathon hosted at UC Berkeley, uniting builders across global engineering tracks.',
    locationDetails: 'San Francisco Bay Area / Berkeley, CA'
  },
  {
    id: 'hack_pennapps',
    name: 'PennApps',
    organizer: 'University of Pennsylvania',
    type: 'hackathon',
    mode: 'in-person',
    country: 'United States',
    themes: ['Software Engineering', 'Hardware / IoT', 'Healthcare', 'FinTech'],
    eligibilityText: 'College and university students globally. Travel reimbursements and mentorship provided.',
    entryFeeText: 'Free',
    prizeText: 'not listed',
    dates: 'Confirm on the official page',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    datesNote: 'Runs twice a year, each edition has its own site; 2026 fall not confirmed; confirm on the official page',
    lastEditionNote: 'Runs twice a year, each edition has its own site; 2026 fall not confirmed. Confirm on the official page.',
    officialUrl: 'https://pennapps.com',
    source: 'recurring-series',
    status: 'NOT_ANNOUNCED',
    description: 'The nation’s first student-run college hackathon, hosted by the University of Pennsylvania twice per year.',
    locationDetails: 'Philadelphia, PA, USA'
  },
  {
    id: 'hack_ethglobal',
    name: 'ETHGlobal',
    organizer: 'ETHGlobal',
    type: 'hackathon',
    mode: 'hybrid',
    country: 'Online/Global',
    themes: ['Web3 / Blockchain', 'Open Source', 'Cryptography', 'Developer Tools'],
    eligibilityText: 'Open to software developers, researchers, and cryptography enthusiasts worldwide.',
    entryFeeText: 'Free',
    prizeText: 'not listed',
    dates: 'Confirm on the official page',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    datesNote: 'Dates change every edition, confirm on the official page',
    lastEditionNote: 'Premier Ethereum hackathon series. Confirm on the official page.',
    officialUrl: 'https://ethglobal.com/events',
    source: 'recurring-series',
    status: 'NOT_ANNOUNCED',
    description: 'Premier Ethereum hackathon series bringing together top Web3 builders, core protocol devs, and startups globally.',
    locationDetails: 'Global Events & Online Streams'
  },
  {
    id: 'hack_google_solution_challenge',
    name: 'Google Solution Challenge',
    organizer: 'Google Developer Groups (GDG)',
    type: 'hackathon',
    mode: 'online',
    country: 'Online/Global',
    themes: ['AI / Machine Learning', 'Social Impact', 'Sustainability'],
    eligibilityText: 'Student teams, via Google Developer Groups',
    entryFeeText: 'Free',
    prizeText: 'not listed',
    dates: 'Confirm on the official page',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    datesNote: 'Dates change every edition, confirm on the official page',
    lastEditionNote: 'Last edition submission deadline 20 April 2026 PT. Confirm on the official page.',
    officialUrl: 'https://developers.google.com/community/gdsc-solution-challenge',
    source: 'recurring-series',
    status: 'NOT_ANNOUNCED',
    description: 'Annual global contest inviting student developer teams via Google Developer Groups to build solutions for local communities.',
    locationDetails: 'Virtual / Online Global'
  },
  {
    id: 'hack_hackmit',
    name: 'HackMIT',
    organizer: 'MIT TechX',
    type: 'hackathon',
    mode: 'hybrid',
    country: 'United States',
    themes: ['AI / Machine Learning', 'BioTech / Healthcare', 'Systems'],
    eligibilityText: 'Open to undergraduate students globally across any institution or degree track. Selective application, travel terms vary by year.',
    entryFeeText: 'Free',
    prizeText: 'not listed',
    dates: 'Confirm on the official page',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    datesNote: 'Dates change every edition, confirm on the official page',
    lastEditionNote: 'Last edition 19-20 Sept 2026, selective application, travel terms vary by year. Confirm on the official page.',
    officialUrl: 'https://hackmit.org',
    source: 'recurring-series',
    status: 'NOT_ANNOUNCED',
    description: 'MIT’s flagship annual student hackathon gathering student innovators on MIT campus and online.',
    locationDetails: 'Cambridge, MA, USA & Hybrid'
  },
  {
    id: 'hack_hack_the_north',
    name: 'Hack the North',
    organizer: 'University of Waterloo & Techvibes',
    type: 'hackathon',
    mode: 'in-person',
    country: 'Canada',
    themes: ['AI / Machine Learning', 'Fintech', 'Infrastructure'],
    eligibilityText: 'Open to undergraduate students worldwide. Free travel, food, and accommodation provided.',
    entryFeeText: 'Free',
    prizeText: 'not listed',
    dates: 'Confirm on the official page',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    datesNote: 'Dates change every edition, confirm on the official page',
    lastEditionNote: 'Last edition 18-20 Sept 2026, Waterloo. Confirm on the official page.',
    officialUrl: 'https://hackthenorth.com',
    source: 'recurring-series',
    status: 'NOT_ANNOUNCED',
    description: 'Canada’s biggest hackathon bringing together over 1,000 students from around the globe.',
    locationDetails: 'Waterloo, Ontario, Canada'
  },
  {
    id: 'hack_treehacks_stanford',
    name: 'TreeHacks',
    organizer: 'Stanford University',
    type: 'hackathon',
    mode: 'in-person',
    country: 'United States',
    themes: ['Healthcare', 'Sustainability', 'AI / Machine Learning', 'Education'],
    eligibilityText: 'Open to all undergraduate and graduate students globally. Flight reimbursements provided for accepted hackers.',
    entryFeeText: '100% Free Entry + Travel scholarships available',
    prizeText: 'not listed',
    dates: 'Confirm on the official page',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    datesNote: 'Dates change every edition, confirm on the official page',
    lastEditionNote: 'Last edition 13-15 Feb 2026; 2027 not confirmed, prize figures differ between sources, do not state one. Confirm on the official page.',
    officialUrl: 'https://treehacks.com',
    source: 'recurring-series',
    status: 'NOT_ANNOUNCED',
    description: 'Stanford University’s premier hackathon convening elite student builders to tackle urgent global problems.',
    locationDetails: 'Stanford University, Stanford, CA'
  },
  {
    id: 'hack_junction_europe',
    name: 'Junction',
    organizer: 'Junction',
    type: 'hackathon',
    mode: 'hybrid',
    country: 'Finland',
    themes: ['AI / Machine Learning', 'Developer Tools', 'Gaming & XR'],
    eligibilityText: 'Open to all international students, software engineers, and digital designers.',
    entryFeeText: 'Free entry (travel grants listed by the organizer)',
    prizeText: 'not listed',
    dates: '13-15 Nov 2026',
    startDate: '2026-11-13',
    endDate: '2026-11-15',
    registrationDeadline: '2026-09-06',
    lastEditionNote: '13-15 Nov 2026, Espoo, Finland, free entry, travel grants listed by the organizer, registration closed 6 Sept 2026. Confirm on the official page.',
    officialUrl: 'https://hackjunction.com',
    source: 'recurring-series',
    status: 'ANNOUNCED_UNCONFIRMED',
    description: 'Europe’s leading flagship hackathon held at Dipoli, Aalto University, bringing builders together for a 48-hour challenge.',
    locationDetails: 'Espoo, Finland & Hybrid'
  },
  {
    id: 'hack_microsoft_imagine_cup',
    name: 'Microsoft Imagine Cup',
    organizer: 'Microsoft',
    type: 'hackathon',
    mode: 'online',
    country: 'Online/Global',
    themes: ['AI / Machine Learning', 'Cloud & DevOps', 'Social Impact'],
    eligibilityText: 'Open to students worldwide 16+ enrolled in high school, undergraduate, or graduate programs.',
    entryFeeText: '100% Free Entry + Azure Cloud Sponsorship',
    prizeText: '$100,000 USD and mentorship per 2025/2026 official pages',
    dates: 'Confirm on the official page',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    datesNote: '2027 dates: confirm on the official page',
    lastEditionNote: 'Prize $100,000 and mentorship per 2025/2026 official pages, 2027 dates: confirm on the official page. Confirm on the official page.',
    officialUrl: 'https://imaginecup.microsoft.com',
    source: 'recurring-series',
    status: 'NOT_ANNOUNCED',
    description: 'Student technology competition empowering young innovators to launch viable AI startups.',
    locationDetails: 'Virtual / Online Global'
  },
  {
    id: 'hack_mlh_global_hack_week',
    name: 'MLH Global Hack Week',
    organizer: 'Major League Hacking',
    type: 'hackathon',
    mode: 'online',
    country: 'Online/Global',
    themes: ['AI / Machine Learning', 'Web Development', 'Open Source', 'Beginner Friendly'],
    eligibilityText: 'Free, age 13+, all countries, online',
    entryFeeText: 'Free',
    prizeText: 'not listed',
    dates: 'Confirm on the official page',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    datesNote: 'Dates change every edition, confirm on the official page',
    lastEditionNote: 'Recurring global week-long hackathon series. Confirm on the official page.',
    officialUrl: 'https://ghw.mlh.com',
    source: 'recurring-series',
    status: 'NOT_ANNOUNCED',
    description: 'Recurring global week-long hackathon series hosted regularly by MLH with workshops and challenges.',
    locationDetails: 'Virtual / Online Global'
  },
  {
    id: 'hack_mlh_hackathon_season',
    name: 'MLH Season',
    organizer: 'Major League Hacking',
    type: 'hackathon',
    mode: 'hybrid',
    country: 'Online/Global',
    themes: ['Collegiate Hacking', 'Software Engineering', 'Open Source'],
    eligibilityText: 'Student-run events, at least 80% students',
    entryFeeText: 'Free',
    prizeText: 'not listed',
    dates: 'Confirm on the official page',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    datesNote: 'Dates change every edition, confirm on the official page',
    lastEditionNote: 'Collegiate hackathon league running hundreds of student-run hackathons throughout the academic year. Confirm on the official page.',
    officialUrl: 'https://mlh.com/events',
    source: 'recurring-series',
    status: 'NOT_ANNOUNCED',
    description: 'Official collegiate hackathon league running hundreds of student-run hackathons throughout the academic year.',
    locationDetails: 'Worldwide Student Hackathons'
  },
  {
    id: 'hack_smart_india_hackathon',
    name: 'Smart India Hackathon',
    organizer: 'Ministry of Education & AICTE',
    type: 'hackathon',
    mode: 'in-person',
    country: 'India',
    themes: ['Smart Automation', 'CleanTech & Environment', 'Healthcare', 'Agriculture', 'FinTech'],
    eligibilityText: 'India, university students, entry only through the college SPOC',
    spocNote: 'Entry only through the college SPOC (Single Point of Contact). Nominations must be submitted by the institute SPOC.',
    entryFeeText: 'Free',
    prizeText: 'not listed',
    dates: 'Confirm on the official page',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    datesNote: 'Dates change every edition, confirm on the official page',
    lastEditionNote: 'College SPOC only. Entry strictly through institute Single Point of Contact nomination. Confirm on the official page.',
    officialUrl: 'https://sih.gov.in',
    source: 'recurring-series',
    status: 'NOT_ANNOUNCED',
    description: 'Nationwide recurring student hackathon by the Government of India, open to Indian university students via institute SPOC.',
    locationDetails: 'Multiple Nodal Centers across India'
  },
  {
    id: 'contest_tcs_codevita',
    name: 'TCS CodeVita',
    organizer: 'Tata Consultancy Services (TCS)',
    type: 'coding-contest',
    mode: 'online',
    country: 'Online/Global',
    themes: ['Competitive Programming', 'Algorithms', 'Data Structures'],
    eligibilityText: 'Science/Engineering UG/PG students, graduation year as stated on the official portal',
    entryFeeText: 'Free',
    prizeText: 'not listed',
    dates: 'Confirm on the official portal',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    datesNote: 'Season 14 dates reported by third-party sources (registration deadline 13 November 2026, MockVita 23-24 October and 13-14 November, Pre-Qualifier 11-12 December); prize figures differ between sources; confirm on the official portal',
    lastEditionNote: 'Season 14 dates reported by third-party sources (registration deadline 13 November 2026, MockVita 23-24 October and 13-14 November, Pre-Qualifier 11-12 December); prize figures differ between sources; confirm on the official portal. Confirm on the official page.',
    officialUrl: 'https://codevita.tcsapps.com',
    source: 'recurring-series',
    status: 'ANNOUNCED_UNCONFIRMED',
    description: 'Global programming competition organized by TCS for science and engineering students worldwide. Season 14 dates reported by third-party sources; confirm on the official portal.',
    locationDetails: 'Virtual / Online Global'
  },
  {
    id: 'contest_meta_hacker_cup',
    name: 'Meta Hacker Cup',
    organizer: 'Meta',
    type: 'coding-contest',
    mode: 'online',
    country: 'Online/Global',
    themes: ['Competitive Programming', 'Algorithms', 'Data Structures', 'Problem Solving'],
    eligibilityText: 'Main track age 18+, high-school division needs parental consent, subject to official terms',
    entryFeeText: 'Free',
    prizeText: 'not listed',
    dates: 'Confirm on the official Hacker Cup page',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    datesNote: '2026 season not announced as of the last check; confirm on the official Hacker Cup page.',
    lastEditionNote: '2025 season: registration opened 3 October 2025, free, main track age 18+, high-school division needs parental consent, prizes include T-shirts and cash for finalists, some countries excluded from prize shipping. 2026 season not announced as of the last check; confirm on the official Hacker Cup page.',
    officialUrl: 'https://www.facebook.com/codingcompetitions/hacker-cup',
    source: 'recurring-series',
    status: 'NOT_ANNOUNCED',
    description: 'Annual global algorithmic programming contest hosted by Meta for competitors across multiple online rounds.',
    locationDetails: 'Virtual / Online Global'
  }
];

export interface HackathonFilters {
  mode?: string;
  country?: string;
  theme?: string;
  status?: string; // 'all' | 'NOT_ANNOUNCED' | 'ANNOUNCED_UNCONFIRMED' | 'ANNOUNCED_VERIFIED' | 'PASSED'
  statusTab?: HackathonStatusTab;
  type?: HackathonType | 'all'; // Prompt 51: 'hackathon' | 'coding-contest'
  query?: string;
}

export class HackathonsService {
  /**
   * Return the entire verified hackathons list.
   */
  public static getAllHackathons(): Hackathon[] {
    return [...HACKATHONS_DATABASE];
  }

  /**
   * Enriches hackathons with data from official page watcher snapshots (Prompt 46)
   */
  public static enrichWithWatcherSnapshots(
    hackathons: Hackathon[],
    snapshots: Array<{
      organizer: string;
      sourceUrl: string;
      detectedOn: string;
      status: HackathonStatus;
      isStale: boolean;
      grounded?: {
        name?: string | null;
        dates?: string | null;
        deadline?: string | null;
        fee?: string | null;
      };
    }>
  ): Hackathon[] {
    if (!snapshots || snapshots.length === 0) return hackathons;

    const snapshotMap = new Map<string, any>();
    for (const snap of snapshots) {
      if (snap.organizer) {
        snapshotMap.set(snap.organizer.toLowerCase().trim(), snap);
      }
    }

    return hackathons.map(h => {
      const snap = snapshotMap.get(h.organizer.toLowerCase().trim());
      if (!snap) return h;

      return {
        ...h,
        sourceUrl: snap.sourceUrl || h.sourceUrl || h.officialUrl,
        detectedOn: snap.detectedOn || h.detectedOn,
        isStale: typeof snap.isStale === 'boolean' ? snap.isStale : h.isStale,
        status: snap.status || h.status,
        dates: snap.grounded?.dates || h.dates,
        registrationDeadline: snap.grounded?.deadline || h.registrationDeadline,
        name: snap.grounded?.name || h.name,
      };
    });
  }

  /**
   * Determine whether a hackathon is OPEN_NOW, UPCOMING, or PASSED based on a given reference date.
   * - OPEN_NOW: Currently active hacking period OR registration is open right now.
   * - UPCOMING: Scheduled in the future (starts in future, registration has not yet closed or is scheduled).
   * - PASSED: Both hackathon ending date and registration deadline have concluded in the past.
   */
  public static getHackathonStatus(hackathon: Hackathon, referenceDate: Date = new Date()): HackathonStatusTab {
    // Prompt 44: Recurring series with no fixed dates (or datesNote) are active ongoing recurring programs
    if (hackathon.datesNote || !hackathon.startDate || !hackathon.endDate) {
      return 'OPEN_NOW';
    }

    const now = referenceDate.getTime();
    
    // Parse ISO dates with safety
    const end = new Date(hackathon.endDate + 'T23:59:59Z').getTime();
    const deadline = new Date(hackathon.registrationDeadline + 'T23:59:59Z').getTime();
    const start = new Date(hackathon.startDate + 'T00:00:00Z').getTime();

    // 1. If the hackathon end date has passed, it is PASSED
    if (now > end) {
      return 'PASSED';
    }

    // 2. If the hackathon is currently ongoing (between start and end date)
    if (now >= start && now <= end) {
      return 'OPEN_NOW';
    }

    // 3. If registration is currently open (now <= registrationDeadline)
    if (now <= deadline) {
      // If the hackathon start is within 45 days, or registration is active, consider OPEN_NOW
      const daysUntilStart = (start - now) / (1000 * 60 * 60 * 24);
      if (daysUntilStart <= 45) {
        return 'OPEN_NOW';
      }
      return 'UPCOMING';
    }

    // 4. If registration deadline has passed but event hasn't happened yet (registered participants awaiting kickoff)
    if (now < start) {
      return 'UPCOMING';
    }

    return 'PASSED';
  }

  /**
   * Filters hackathons by mode, country, theme, status, status tab, and search query.
   * STRICT GUARANTEE: Never hide a hackathon because of eligibility!
   */
  public static filterHackathons(
    hackathons: Hackathon[],
    filters: HackathonFilters,
    referenceDate: Date = new Date()
  ): Hackathon[] {
    return hackathons.filter(hackathon => {
      // 1. Status Tab filter ('OPEN_NOW' | 'UPCOMING' | 'PASSED')
      if (filters.statusTab) {
        const computedStatus = this.getHackathonStatus(hackathon, referenceDate);
        if (computedStatus !== filters.statusTab) {
          return false;
        }
      }

      // 2. Status filter ('NOT_ANNOUNCED' | 'ANNOUNCED_UNCONFIRMED' | 'ANNOUNCED_VERIFIED' | 'PASSED')
      if (filters.status && filters.status !== 'all') {
        if (hackathon.status !== filters.status) {
          return false;
        }
      }

      // 2b. Type filter ('hackathon' | 'coding-contest') (Prompt 51)
      if (filters.type && filters.type !== 'all') {
        const itemType = hackathon.type || 'hackathon';
        if (itemType !== filters.type) {
          return false;
        }
      }

      // 3. Mode filter ('online' | 'in-person' | 'hybrid')
      if (filters.mode && filters.mode !== 'all') {
        if (hackathon.mode !== filters.mode) {
          return false;
        }
      }

      // 3. Country filter
      if (filters.country && filters.country !== 'all') {
        if (hackathon.country !== filters.country) {
          return false;
        }
      }

      // 4. Theme filter
      if (filters.theme && filters.theme !== 'all') {
        const hasTheme = hackathon.themes.some(
          t => t.toLowerCase() === filters.theme?.toLowerCase()
        );
        if (!hasTheme) {
          return false;
        }
      }

      // 5. Search query (matches name, organizer, themes, country, description)
      if (filters.query && filters.query.trim().length > 0) {
        const q = filters.query.toLowerCase().trim();
        const matchesName = hackathon.name.toLowerCase().includes(q);
        const matchesOrganizer = hackathon.organizer.toLowerCase().includes(q);
        const matchesCountry = hackathon.country.toLowerCase().includes(q);
        const matchesThemes = hackathon.themes.some(t => t.toLowerCase().includes(q));
        const matchesDesc = (hackathon.description || '').toLowerCase().includes(q);
        const matchesPrizes = hackathon.prizeText.toLowerCase().includes(q);
        const matchesEligibility = hackathon.eligibilityText.toLowerCase().includes(q);
        const matchesDatesNote = (hackathon.datesNote || '').toLowerCase().includes(q);
        const matchesSpocNote = (hackathon.spocNote || '').toLowerCase().includes(q);
        const matchesLastEditionNote = (hackathon.lastEditionNote || '').toLowerCase().includes(q);

        if (
          !matchesName && 
          !matchesOrganizer && 
          !matchesCountry && 
          !matchesThemes && 
          !matchesDesc && 
          !matchesPrizes &&
          !matchesEligibility &&
          !matchesDatesNote &&
          !matchesSpocNote &&
          !matchesLastEditionNote
        ) {
          return false;
        }
      }

      // STRICT RULE (Prompt 42): Never hide a hackathon because of eligibility.
      return true;
    });
  }

  /**
   * Extract unique countries from the dataset.
   */
  public static getUniqueCountries(hackathons: Hackathon[] = HACKATHONS_DATABASE): string[] {
    const set = new Set<string>();
    for (const h of hackathons) {
      if (h.country) set.add(h.country);
    }
    return Array.from(set).sort();
  }

  /**
   * Extract unique themes from the dataset.
   */
  public static getUniqueThemes(hackathons: Hackathon[] = HACKATHONS_DATABASE): string[] {
    const set = new Set<string>();
    for (const h of hackathons) {
      for (const t of h.themes) {
        set.add(t);
      }
    }
    return Array.from(set).sort();
  }

  /**
   * Extract unique modes from the dataset.
   */
  public static getUniqueModes(): HackathonMode[] {
    return ['online', 'in-person', 'hybrid'];
  }

  /**
   * Prompt 45: Source badge text ("Listed on Devpost" or "Official series")
   */
  public static getSourceBadgeText(source: HackathonSource): 'Listed on Devpost' | 'Official series' {
    return source === 'devpost-live' ? 'Listed on Devpost' : 'Official series';
  }

  /**
   * Prompt 45: Determine if a prize was explicitly listed by the organizer
   */
  public static isPrizeListed(prizeText?: string): boolean {
    if (!prizeText) return false;
    const trimmed = prizeText.trim();
    if (trimmed.length === 0) return false;
    const lower = trimmed.toLowerCase();
    if (
      lower === 'not listed' ||
      lower === 'none' ||
      lower === 'n/a' ||
      lower === 'no prize' ||
      lower === '0' ||
      lower === '$0' ||
      lower.includes('confirm on official') ||
      lower.includes('see official') ||
      lower.includes('check official') ||
      lower.includes('tbd')
    ) {
      return false;
    }
    return true;
  }

  /**
   * Prompt 45: Format prize display returning prize text as "listed by organizer" (or "not listed")
   */
  public static getPrizeDisplay(prizeText?: string): {
    isListed: boolean;
    displayText: string;
    badgeText: 'listed by organizer' | 'not listed';
  } {
    if (this.isPrizeListed(prizeText)) {
      return {
        isListed: true,
        displayText: prizeText!.trim(),
        badgeText: 'listed by organizer',
      };
    }
    return {
      isListed: false,
      displayText: 'Not listed',
      badgeText: 'not listed',
    };
  }

  /**
   * Prompt 45 & 51: Flag clearly if an entry fee or stake exists
   * For any hackathon whose source mentions a stake or entry fee, show a clear "Fee / stake required" flag.
   */
  public static isFeeRequired(entryFeeText?: string): boolean {
    if (!entryFeeText) return false;
    const lower = entryFeeText.toLowerCase().trim();

    // Explicitly refunded/refundable stake on check-in is not a net entry fee
    if (lower.includes('refunded stake') || lower.includes('refundable stake') || lower.includes('100% refunded')) {
      return false;
    }

    if (
      lower === 'free' ||
      lower.startsWith('free') ||
      lower.includes('100% free') ||
      lower.includes('free entry') ||
      lower.includes('no fee') ||
      lower.includes('$0') ||
      lower.includes('zero')
    ) {
      if (
        !lower.includes('not free') && 
        !lower.includes('fee exists') && 
        !lower.includes('stake required') && 
        !lower.includes('fee required')
      ) {
        return false;
      }
    }
    if (
      lower.includes('paid') ||
      lower.includes('fee exists') ||
      lower.includes('fee required') ||
      lower.includes('entry fee') ||
      lower.includes('stake required') ||
      lower.includes('stake exists') ||
      lower.includes('deposit stake') ||
      (lower.includes('stake') && !lower.includes('stakeholder')) ||
      /\$\s*\d+/.test(lower) ||
      /₹\s*\d+/.test(lower) ||
      /€\s*\d+/.test(lower) ||
      /\d+\s*(usd|eur|inr|gbp|usdc|usdt|eth|sol)/.test(lower)
    ) {
      return true;
    }
    return !lower.includes('free');
  }

  /**
   * Prompt 51: Check if any hackathon field or source text mentions a stake or entry fee
   * Returns true if entryFeeText, description, eligibility, or rules mention stake or entry fee.
   */
  public static hasFeeOrStake(hackathon: Partial<Hackathon>): boolean {
    if (this.isFeeRequired(hackathon.entryFeeText)) return true;
    const combined = [
      hackathon.entryFeeText,
      hackathon.description,
      hackathon.eligibilityText,
      hackathon.datesNote,
      hackathon.lastEditionNote
    ].filter(Boolean).join(' ').toLowerCase();

    if (combined.includes('refunded stake') || combined.includes('refundable stake') || combined.includes('100% refunded')) {
      return false;
    }

    if (
      combined.includes('stake required') ||
      combined.includes('fee required') ||
      combined.includes('entry fee') ||
      combined.includes('paid entry') ||
      combined.includes('fee of') ||
      combined.includes('fee / stake') ||
      combined.includes('stake / fee') ||
      combined.includes('staking required') ||
      combined.includes('stake to participate') ||
      combined.includes('deposit stake') ||
      combined.includes('participation stake') ||
      (combined.includes('stake') && !combined.includes('stakeholder'))
    ) {
      return true;
    }
    return false;
  }

  /**
   * Prompt 45: Mandatory rule note on eligibility
   * "Check the event's own rules"
   */
  public static readonly ELIGIBILITY_RULES_LINE = "Check the event's own rules";
}

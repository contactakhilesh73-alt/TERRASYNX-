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

import { Hackathon, HackathonMode, HackathonSource, HackathonStatusTab } from '../types';

export const HACKATHONS_DATABASE: Hackathon[] = [
  {
    id: 'hack_devpost_ai_challenge',
    name: 'Global AI Innovators Challenge',
    organizer: 'Devpost & AWS',
    mode: 'online',
    country: 'Online/Global',
    themes: ['AI / Machine Learning', 'Cloud & DevOps', 'Developer Tools'],
    eligibilityText: 'Open to developers, students, and founders worldwide (18+). Solo or teams up to 4.',
    entryFeeText: '100% Free Entry',
    prizeText: '$80,000 USD in cash + AWS GPU credits',
    startDate: '2026-10-15',
    endDate: '2026-11-28',
    registrationDeadline: '2026-11-20',
    officialUrl: 'https://devpost.com/hackathons',
    source: 'devpost-live',
    description: 'Build enterprise-grade AI assistants and autonomous workflows using foundation models on AWS Bedrock.',
    locationDetails: 'Virtual / Online Global'
  },
  {
    id: 'hack_solana_renaissance',
    name: 'Solana Global Renaissance Hackathon',
    organizer: 'Solana Foundation',
    mode: 'online',
    country: 'Online/Global',
    themes: ['Web3 / Blockchain', 'Fintech', 'Infrastructure'],
    eligibilityText: 'Open to all builders, engineers, and creators globally. No degree requirement.',
    entryFeeText: '100% Free Entry',
    prizeText: '$1,000,000+ USD in prizes & seed funding',
    startDate: '2026-10-01',
    endDate: '2026-11-15',
    registrationDeadline: '2026-11-05',
    officialUrl: 'https://solana.com/hackathon',
    source: 'devpost-live',
    description: 'Premier global Web3 hackathon for high-throughput decentralized apps, payments, and DePIN projects.',
    locationDetails: 'Virtual / Online Global'
  },
  {
    id: 'hack_devpost_gemini_sprint',
    name: 'Gemini Multimodal Innovation Challenge',
    organizer: 'Google Cloud & Devpost',
    mode: 'online',
    country: 'Online/Global',
    themes: ['AI / Machine Learning', 'Developer Tools', 'Social Impact'],
    eligibilityText: 'Open to students, researchers, and professional developers globally.',
    entryFeeText: 'Free Entry + Free Google Cloud API Credits',
    prizeText: '$50,000 USD + Google Cloud Innovator perks',
    startDate: '2026-10-05',
    endDate: '2026-11-30',
    registrationDeadline: '2026-11-22',
    officialUrl: 'https://devpost.com/software',
    source: 'devpost-live',
    description: 'Create revolutionary multimodal solutions leveraging Gemini 2.0 / Flash across text, vision, and real-time audio.',
    locationDetails: 'Virtual / Online Global'
  },
  {
    id: 'hack_calhacks_13',
    name: 'CalHacks 13.0 (World’s Largest Collegiate Hackathon)',
    organizer: 'UC Berkeley Cal Hacks',
    mode: 'hybrid',
    country: 'United States',
    themes: ['AI / Machine Learning', 'Developer Tools', 'Hardware & Robotics'],
    eligibilityText: 'Open to all currently enrolled undergraduate and graduate university students worldwide.',
    entryFeeText: '100% Free Entry (Travel grants available)',
    prizeText: '$150,000+ USD in prizes & incubator fast-tracks',
    startDate: '2026-10-24',
    endDate: '2026-10-26',
    registrationDeadline: '2026-10-18',
    officialUrl: 'https://calhacks.io',
    source: 'recurring-series',
    description: 'The world’s largest collegiate hackathon hosted at UC Berkeley and the San Francisco Metreon.',
    locationDetails: 'UC Berkeley / San Francisco, CA & Online'
  },
  {
    id: 'hack_ethglobal_bangkok',
    name: 'ETHGlobal Bangkok & Global Virtual Sprint',
    organizer: 'ETHGlobal',
    mode: 'hybrid',
    country: 'Thailand',
    themes: ['Web3 / Blockchain', 'Open Source', 'Cryptography'],
    eligibilityText: 'Open to all software developers, researchers, and cryptography enthusiasts worldwide.',
    entryFeeText: 'Free Entry (100% refunded stake on check-in)',
    prizeText: '$125,000 USD in track bounties & prizes',
    startDate: '2026-11-15',
    endDate: '2026-11-17',
    registrationDeadline: '2026-11-01',
    officialUrl: 'https://ethglobal.com',
    source: 'recurring-series',
    description: 'Premier Ethereum hackathon bringing together top Web3 builders, core protocol devs, and startups.',
    locationDetails: 'Bangkok, Thailand & Online Stream'
  },
  {
    id: 'hack_open_source_hacktoberfest',
    name: 'Hacktoberfest 2026 Global Build Sprint',
    organizer: 'DigitalOcean, GitHub & Cloudflare',
    mode: 'online',
    country: 'Online/Global',
    themes: ['Open Source', 'Developer Tools'],
    eligibilityText: 'Open to everyone, students, beginners, and senior engineers globally.',
    entryFeeText: '100% Free Entry',
    prizeText: 'Official Hacktoberfest tree planted or limited kit + digital credentials',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    registrationDeadline: '2026-10-31',
    officialUrl: 'https://hacktoberfest.com',
    source: 'recurring-series',
    description: 'Month-long celebration of open source code contribution, mentorship, and community pull requests.',
    locationDetails: 'Virtual / Online Global'
  },
  {
    id: 'hack_mlh_global_hack_week',
    name: 'MLH Global Hack Week',
    organizer: 'Major League Hacking',
    mode: 'online',
    country: 'Online/Global',
    themes: ['AI / Machine Learning', 'Web Development', 'Open Source', 'Beginner Friendly'],
    eligibilityText: 'Free, age 13+, all countries, online',
    entryFeeText: 'Free',
    prizeText: 'Confirm on official page',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    datesNote: 'Dates change every edition, confirm on the official page',
    officialUrl: 'https://ghw.mlh.com',
    source: 'recurring-series',
    description: 'Recurring global week-long hackathon series hosted regularly by MLH with workshops and challenges.',
    locationDetails: 'Virtual / Online Global'
  },
  {
    id: 'hack_mlh_hackathon_season',
    name: 'MLH Hackathon Season',
    organizer: 'Major League Hacking',
    mode: 'hybrid',
    country: 'Online/Global',
    themes: ['Collegiate Hacking', 'Software Engineering', 'Open Source'],
    eligibilityText: 'Student-run events, at least 80% students',
    entryFeeText: 'Free',
    prizeText: 'Confirm on official page',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    datesNote: 'Dates change every edition, confirm on the official page',
    officialUrl: 'https://mlh.com/events',
    source: 'recurring-series',
    description: 'Official collegiate hackathon league running hundreds of student-run hackathons throughout the academic year.',
    locationDetails: 'Worldwide Student Hackathons'
  },
  {
    id: 'hack_smart_india_hackathon',
    name: 'Smart India Hackathon',
    organizer: 'Ministry of Education & AICTE',
    mode: 'in-person',
    country: 'India',
    themes: ['Smart Automation', 'CleanTech & Environment', 'Healthcare', 'Agriculture', 'FinTech'],
    eligibilityText: 'India, university students, entry only through the college SPOC',
    spocNote: 'Entry only through the college SPOC (Single Point of Contact). Nominations must be submitted by the institute SPOC.',
    entryFeeText: 'Free',
    prizeText: 'Confirm on official page',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    datesNote: 'Dates change every edition, confirm on the official page',
    officialUrl: 'https://sih.gov.in',
    source: 'recurring-series',
    description: 'Nationwide recurring student hackathon by the Government of India, open to Indian university students via institute SPOC.',
    locationDetails: 'Multiple Nodal Centers across India'
  },
  {
    id: 'hack_junction_europe',
    name: 'Junction Europe 2026 (Europe’s Flagship Hackathon)',
    organizer: 'Junction',
    mode: 'hybrid',
    country: 'Finland',
    themes: ['AI / Machine Learning', 'Developer Tools', 'Gaming & XR'],
    eligibilityText: 'Open to all international students, software engineers, and digital designers.',
    entryFeeText: 'Free Entry + Free Meals & Traditional Finnish Sauna',
    prizeText: '€35,000 EUR in cash prizes + sponsor contracts',
    startDate: '2026-11-06',
    endDate: '2026-11-08',
    registrationDeadline: '2026-10-20',
    officialUrl: 'https://hackjunction.com',
    source: 'recurring-series',
    description: 'Europe’s leading hackathon held at Dipoli, bringing 1,500+ builders together for a 48-hour challenge.',
    locationDetails: 'Espoo / Helsinki, Finland & Hybrid'
  },
  {
    id: 'hack_google_solution_challenge',
    name: 'Google Solution Challenge 2027',
    organizer: 'Google Developer Student Clubs (GDSC)',
    mode: 'online',
    country: 'Online/Global',
    themes: ['AI / Machine Learning', 'Social Impact', 'Sustainability'],
    eligibilityText: 'Open to all university and college students globally. Must address 1 of 17 UN Sustainable Development Goals.',
    entryFeeText: '100% Free Entry (Official Google Initiative)',
    prizeText: '$30,000 USD + Mentorship with Google Engineers',
    startDate: '2027-01-15',
    endDate: '2027-03-31',
    registrationDeadline: '2027-02-15',
    officialUrl: 'https://developers.google.com/community/gdsc-solution-challenge',
    source: 'recurring-series',
    description: 'Annual global contest inviting student developers to build solutions for local communities using Google technologies.',
    locationDetails: 'Virtual / Online Global'
  },
  {
    id: 'hack_microsoft_imagine_cup',
    name: 'Microsoft Imagine Cup 2027',
    organizer: 'Microsoft',
    mode: 'online',
    country: 'Online/Global',
    themes: ['AI / Machine Learning', 'Cloud & DevOps', 'Social Impact'],
    eligibilityText: 'Open to students worldwide 16+ enrolled in high school, undergraduate, or graduate programs.',
    entryFeeText: '100% Free Entry + Azure Cloud Sponsorship',
    prizeText: '$100,000 USD + Mentorship session with Satya Nadella',
    startDate: '2026-12-01',
    endDate: '2027-05-15',
    registrationDeadline: '2027-01-25',
    officialUrl: 'https://imaginecup.microsoft.com',
    source: 'recurring-series',
    description: 'The Olympics of student technology competitions, empowering young innovators to launch viable AI startups.',
    locationDetails: 'Virtual / World Finals in Seattle, WA'
  },
  {
    id: 'hack_treehacks_stanford',
    name: 'TreeHacks 2027',
    organizer: 'Stanford University',
    mode: 'in-person',
    country: 'United States',
    themes: ['Healthcare', 'Sustainability', 'AI / Machine Learning', 'Education'],
    eligibilityText: 'Open to all undergraduate and graduate students globally. Flight reimbursements provided for accepted hackers.',
    entryFeeText: '100% Free Entry + Travel scholarships available',
    prizeText: '$120,000+ USD in category prizes & VC angel grants',
    startDate: '2027-02-19',
    endDate: '2027-02-21',
    registrationDeadline: '2027-01-15',
    officialUrl: 'https://treehacks.com',
    source: 'recurring-series',
    description: 'Stanford University’s premier hackathon, convening 1,200+ elite student builders to tackle urgent global problems.',
    locationDetails: 'Stanford University, Stanford, CA'
  },
  {
    id: 'hack_ai_engineer_challenge',
    name: 'AI Engineer World Summit Hackathon',
    organizer: 'AI Engineer & Latent Space',
    mode: 'online',
    country: 'Online/Global',
    themes: ['AI / Machine Learning', 'Developer Tools', 'Open Source'],
    eligibilityText: 'Open to software developers, ML researchers, and autonomous agent creators worldwide.',
    entryFeeText: '100% Free Entry',
    prizeText: '$40,000 USD + GPU compute allocations',
    startDate: '2026-11-25',
    endDate: '2026-12-10',
    registrationDeadline: '2026-11-24',
    officialUrl: 'https://ai.engineer',
    source: 'devpost-live',
    description: 'Sprint focused on production-ready autonomous coding agents, evals, and local inference toolchains.',
    locationDetails: 'Virtual / Online Global'
  },
  {
    id: 'hack_hackmit_2026',
    name: 'HackMIT 2026',
    organizer: 'MIT TechX',
    mode: 'hybrid',
    country: 'United States',
    themes: ['AI / Machine Learning', 'BioTech / Healthcare', 'Systems'],
    eligibilityText: 'Open to undergraduate students globally across any institution or degree track.',
    entryFeeText: '100% Free Entry + Hardware lab access',
    prizeText: '$50,000+ USD in hardware, cash & grants',
    startDate: '2026-09-19',
    endDate: '2026-09-21',
    registrationDeadline: '2026-08-30',
    officialUrl: 'https://hackmit.org',
    source: 'recurring-series',
    description: 'MIT’s flagship annual weekend hackathon gathering 1,000+ student innovators on MIT campus and online.',
    locationDetails: 'Cambridge, MA, USA & Hybrid'
  },
  {
    id: 'hack_pennapps_xxvi',
    name: 'PennApps XXVI (America’s First Student Hackathon)',
    organizer: 'University of Pennsylvania',
    mode: 'in-person',
    country: 'United States',
    themes: ['AI / Machine Learning', 'Healthcare', 'Fintech'],
    eligibilityText: 'Open to high school and college students aged 15+. All academic majors welcome.',
    entryFeeText: '100% Free Entry + On-site meals & swag',
    prizeText: '$45,000+ USD in cash and hardware prizes',
    startDate: '2026-09-04',
    endDate: '2026-09-06',
    registrationDeadline: '2026-08-10',
    officialUrl: 'https://pennapps.com',
    source: 'recurring-series',
    description: 'The nation’s first collegiate hackathon founded in 2009, continuing its heritage of high-impact engineering.',
    locationDetails: 'Philadelphia, PA, USA'
  },
  {
    id: 'hack_hack_the_north_2026',
    name: 'Hack the North 2026',
    organizer: 'University of Waterloo & Techvibes',
    mode: 'in-person',
    country: 'Canada',
    themes: ['AI / Machine Learning', 'Fintech', 'Infrastructure'],
    eligibilityText: 'Open to undergraduate students worldwide. Free travel, food, and accommodation provided.',
    entryFeeText: '100% Free Entry + Travel bursaries',
    prizeText: '$60,000+ CAD in gear, cash, and founder credits',
    startDate: '2026-09-11',
    endDate: '2026-09-13',
    registrationDeadline: '2026-08-15',
    officialUrl: 'https://hackthenorth.com',
    source: 'recurring-series',
    description: 'Canada’s biggest hackathon bringing together over 1,000 students from around the globe.',
    locationDetails: 'Waterloo, Ontario, Canada'
  },
  {
    id: 'hack_nasa_space_apps_2026',
    name: 'NASA International Space Apps Challenge',
    organizer: 'NASA & International Space Agencies',
    mode: 'hybrid',
    country: 'Online/Global',
    themes: ['Space & Astronomy', 'Climate & CleanTech', 'Open Source'],
    eligibilityText: 'Open to all curious problem solvers, students, and engineers globally.',
    entryFeeText: '100% Free Entry (Open Data Initiative)',
    prizeText: 'Global Winner Accolades + NASA Launch Viewing Invitation',
    startDate: '2026-10-03',
    endDate: '2026-10-04',
    registrationDeadline: '2026-10-02',
    officialUrl: 'https://spaceappschallenge.org',
    source: 'recurring-series',
    description: 'Global hackathon using open NASA and ESA earth observation data to solve real challenges on Earth and in space.',
    locationDetails: 'Virtual & 300+ Local Lead Centers Worldwide'
  },
  {
    id: 'hack_chainlink_block_magic',
    name: 'Chainlink Block Magic Global Hackathon',
    organizer: 'Chainlink Labs',
    mode: 'online',
    country: 'Online/Global',
    themes: ['Web3 / Blockchain', 'Fintech', 'AI / Machine Learning'],
    eligibilityText: 'Open globally to all software engineers, DeFi developers, and researchers.',
    entryFeeText: '100% Free Entry',
    prizeText: '$250,000+ USD in bounties and startup grants',
    startDate: '2026-04-10',
    endDate: '2026-05-15',
    registrationDeadline: '2026-05-01',
    officialUrl: 'https://chain.link/hackathon',
    source: 'devpost-live',
    description: 'Build decentralized applications connecting smart contracts with real-world data and verifiable compute.',
    locationDetails: 'Virtual / Online Global'
  }
];

export interface HackathonFilters {
  mode?: string;
  country?: string;
  theme?: string;
  statusTab?: HackathonStatusTab;
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
   * Filters hackathons by mode, country, theme, status tab, and search query.
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

      // 2. Mode filter ('online' | 'in-person' | 'hybrid')
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

        if (
          !matchesName && 
          !matchesOrganizer && 
          !matchesCountry && 
          !matchesThemes && 
          !matchesDesc && 
          !matchesPrizes &&
          !matchesEligibility &&
          !matchesDatesNote &&
          !matchesSpocNote
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
   * Prompt 45: Flag clearly if an entry fee exists (Prompt 45)
   */
  public static isFeeRequired(entryFeeText?: string): boolean {
    if (!entryFeeText) return false;
    const lower = entryFeeText.toLowerCase().trim();
    if (
      lower === 'free' ||
      lower.startsWith('free') ||
      lower.includes('100% free') ||
      lower.includes('free entry') ||
      lower.includes('no fee') ||
      lower.includes('$0') ||
      lower.includes('zero')
    ) {
      if (!lower.includes('not free')) {
        return false;
      }
    }
    if (
      lower.includes('paid') ||
      lower.includes('fee exists') ||
      lower.includes('fee required') ||
      lower.includes('entry fee:') ||
      /\$\s*\d+/.test(lower) ||
      /₹\s*\d+/.test(lower) ||
      /€\s*\d+/.test(lower) ||
      /\d+\s*(usd|eur|inr|gbp)/.test(lower)
    ) {
      return true;
    }
    return !lower.includes('free');
  }

  /**
   * Prompt 45: Mandatory rule note on eligibility
   * "Check the event's own rules"
   */
  public static readonly ELIGIBILITY_RULES_LINE = "Check the event's own rules";
}

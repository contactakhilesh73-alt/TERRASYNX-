/**
 * TERRASYNX: Hackathons & Open Innovation Competitions Portal (Prompt 42)
 * 
 * Separate top-level portal with an orange accent color:
 * - Types: Hackathon (id, name, organizer, mode, country, themes, eligibilityText, entryFeeText, prizeText, startDate, endDate, registrationDeadline, officialUrl, source)
 * - Status Tabs: Open Now | Upcoming | Passed
 * - Filters: mode ('online' | 'in-person' | 'hybrid'), country, theme, search query
 * - Strict Rule: NEVER hide a hackathon because of eligibility
 * - Honest empty state when no matching data
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Hackathon, HackathonMode, HackathonStatusTab, HackathonStatus, HackathonType, StudentProfile } from '../types';
import { HackathonsService } from '../services/hackathonsService';
import { LinkHealthBadge } from './LinkHealthBadge';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  Search, 
  RotateCcw, 
  Bookmark, 
  BookmarkCheck,
  Globe, 
  Building2, 
  ShieldCheck, 
  Flame, 
  CheckCircle2, 
  Filter,
  DollarSign,
  Laptop,
  Users,
  Compass,
  CalendarPlus,
  Share2,
  AlertCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  FileText,
  Printer
} from 'lucide-react';
import { HackathonFastApplyModal } from './HackathonFastApplyModal';
import { HackathonWhitePageModal } from './HackathonWhitePageModal';
import { CompanyLogo } from './CompanyLogo';
import { HackathonTrackingService, HackathonApplicationRecord } from '../services/hackathonTrackingService';

interface HackathonsPortalProps {
  onNavigateToCalendar?: () => void;
  studentProfile?: StudentProfile;
}

export const HackathonsPortal: React.FC<HackathonsPortalProps> = ({
  onNavigateToCalendar,
  studentProfile
}) => {
  // Live Date Reference State (defaults to current live time)
  const [referenceDate, setReferenceDate] = useState<Date>(() => new Date());

  // Auto-refresh clock every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setReferenceDate(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Status Tab: 'ALL' | 'OPEN_NOW' | 'UPCOMING' | 'PASSED'
  const [activeStatusTab, setActiveStatusTab] = useState<HackathonStatusTab | 'ALL'>('ALL');

  // Filters
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<HackathonType | 'all'>('all'); // Prompt 51
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Tracked Hackathons state (persisted in localStorage)
  const [trackedHackathonIds, setTrackedHackathonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('terrasynx_tracked_hackathons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state for Fast Apply Assistant & Official White Page
  const [fastApplyHackathon, setFastApplyHackathon] = useState<Hackathon | null>(null);
  const [whitePageHackathon, setWhitePageHackathon] = useState<Hackathon | null>(null);

  // Tracked Hackathon Application Records from HackathonTrackingService
  const [hackathonApplications, setHackathonApplications] = useState<HackathonApplicationRecord[]>(() => {
    return HackathonTrackingService.getApplications(studentProfile?.email);
  });

  // Filter toggle to view only user's tracked hackathons
  const [filterOnlyTracked, setFilterOnlyTracked] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Feed State (Prompt 43)
  const [liveHackathons, setLiveHackathons] = useState<Hackathon[]>([]);
  const [isLiveFeedLoading, setIsLiveFeedLoading] = useState<boolean>(true);
  const [liveFeedMessage, setLiveFeedMessage] = useState<string | null>(null);

  // Official Page Watcher Snapshots (Prompt 46)
  const [watcherSnapshots, setWatcherSnapshots] = useState<Record<string, any>>({});

  const fetchLiveFeed = async (force: boolean = false) => {
    setIsLiveFeedLoading(true);
    try {
      const res = await fetch(`/api/hackathons/live${force ? '?force=true' : ''}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.hackathons) && json.hackathons.length > 0) {
        setLiveHackathons(json.hackathons);
        setLiveFeedMessage(null);
      } else {
        // On any failure return an empty list and show "Live hackathon feed temporarily unavailable".
        // Never add hardcoded fallback hackathons.
        setLiveHackathons([]);
        setLiveFeedMessage(json.message || 'Live hackathon feed temporarily unavailable');
      }
    } catch {
      setLiveHackathons([]);
      setLiveFeedMessage('Live hackathon feed temporarily unavailable');
    } finally {
      setIsLiveFeedLoading(false);
    }
  };

  const fetchWatcherSnapshots = async () => {
    try {
      const res = await fetch('/api/hackathons/watcher/status');
      const json = await res.json();
      if (json.success && Array.isArray(json.snapshots)) {
        const map: Record<string, any> = {};
        for (const snap of json.snapshots) {
          if (snap.organizer) {
            map[snap.organizer.toLowerCase().trim()] = snap;
          }
        }
        setWatcherSnapshots(map);
      }
    } catch {
      // Ignore background failure
    }
  };

  useEffect(() => {
    fetchLiveFeed();
    fetchWatcherSnapshots();
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Sync application tracking records across events
  useEffect(() => {
    const refreshApplications = () => {
      setHackathonApplications(HackathonTrackingService.getApplications(studentProfile?.email));
    };

    window.addEventListener('terrasynx_hackathon_tracked', refreshApplications);
    window.addEventListener('terrasynx_hackathon_status_updated', refreshApplications);
    window.addEventListener('terrasynx_hackathon_removed', refreshApplications);

    return () => {
      window.removeEventListener('terrasynx_hackathon_tracked', refreshApplications);
      window.removeEventListener('terrasynx_hackathon_status_updated', refreshApplications);
      window.removeEventListener('terrasynx_hackathon_removed', refreshApplications);
    };
  }, [studentProfile?.email]);

  const toggleTrackHackathon = (id: string, name: string) => {
    setTrackedHackathonIds(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('terrasynx_tracked_hackathons', JSON.stringify(updated));
      } catch {
        // ignore
      }
      setToastMessage(exists ? `Removed "${name}" from tracked hackathons.` : `Tracking "${name}". Saved to your workspace.`);
      return updated;
    });
  };

  // Base list of all hackathons:
  // Verified recurring programs + live Devpost feed (if available).
  // STRICT RULE: Never add hardcoded fallback hackathons if live feed fails.
  const allHackathons = useMemo(() => {
    const staticList = HackathonsService.getAllHackathons();

    // Enrich static recurring hackathons with watcher snapshots if available (Prompt 46)
    const enrichedStatic = staticList.map(item => {
      const snap = watcherSnapshots[item.organizer.toLowerCase().trim()];
      if (!snap) return item;

      return {
        ...item,
        sourceUrl: snap.sourceUrl || item.sourceUrl || item.officialUrl,
        detectedOn: snap.detectedOn || item.detectedOn,
        isStale: typeof snap.isStale === 'boolean' ? snap.isStale : item.isStale,
        status: snap.status || item.status,
        dates: snap.grounded?.dates || item.dates,
        registrationDeadline: snap.grounded?.deadline || item.registrationDeadline,
        name: snap.grounded?.name || item.name,
      };
    });

    if (liveHackathons.length > 0) {
      const seenUrls = new Set(enrichedStatic.map(h => h.officialUrl.toLowerCase().trim()));
      const uniqueLive = liveHackathons.filter(h => !seenUrls.has(h.officialUrl.toLowerCase().trim()));
      return [...uniqueLive, ...enrichedStatic];
    }
    return enrichedStatic;
  }, [liveHackathons, watcherSnapshots]);

  // Compute status counts for the tabs
  const statusCounts = useMemo(() => {
    let openNow = 0;
    let upcoming = 0;
    let passed = 0;

    for (const h of allHackathons) {
      const status = HackathonsService.getHackathonStatus(h, referenceDate);
      if (status === 'OPEN_NOW') openNow++;
      else if (status === 'UPCOMING') upcoming++;
      else if (status === 'PASSED') passed++;
    }

    return { openNow, upcoming, passed };
  }, [allHackathons, referenceDate]);

  // Unique options for filters
  const uniqueCountries = useMemo(() => {
    return HackathonsService.getUniqueCountries(allHackathons);
  }, [allHackathons]);

  const uniqueThemes = useMemo(() => {
    return HackathonsService.getUniqueThemes(allHackathons);
  }, [allHackathons]);

  // Filtered hackathons
  // STRICT RULE: Never hide a hackathon because of eligibility!
  const filteredHackathons = useMemo(() => {
    const list = HackathonsService.filterHackathons(
      allHackathons,
      {
        mode: selectedMode,
        country: selectedCountry,
        theme: selectedTheme,
        status: selectedStatus,
        statusTab: selectedStatus === 'all' && activeStatusTab !== 'ALL' ? (activeStatusTab as HackathonStatusTab) : undefined,
        type: selectedType, // Prompt 51
        query: searchQuery
      },
      referenceDate
    );

    if (!filterOnlyTracked) return list;
    return list.filter(h => 
      HackathonTrackingService.isHackathonTracked(h.id, studentProfile?.email) ||
      trackedHackathonIds.includes(h.id)
    );
  }, [allHackathons, selectedMode, selectedCountry, selectedTheme, selectedStatus, selectedType, activeStatusTab, searchQuery, referenceDate, filterOnlyTracked, hackathonApplications, studentProfile?.email, trackedHackathonIds]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedMode('all');
    setSelectedCountry('all');
    setSelectedTheme('all');
    setSelectedStatus('all');
    setSelectedType('all');
    setSearchQuery('');
  };

  // Helper to format dates nicely
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr || dateStr.trim().length === 0) return 'Confirm on official page';
    try {
      const d = new Date(dateStr + 'T00:00:00Z');
      if (isNaN(d.getTime())) return 'Confirm on official page';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Google Calendar URL generator for registration deadline
  const createGoogleCalendarUrlForHackathon = (hackathon: Hackathon) => {
    const title = encodeURIComponent(`Hackathon Deadline: ${hackathon.name}`);
    const details = encodeURIComponent(
      `Official Organizer: ${hackathon.organizer}\nPrize: ${hackathon.prizeText}\nEntry: ${hackathon.entryFeeText}\nURL: ${hackathon.officialUrl}\nEligibility: ${hackathon.eligibilityText}`
    );
    const location = encodeURIComponent(hackathon.mode === 'online' ? 'Online/Global' : hackathon.country);
    
    // Set all-day or deadline event
    const cleanDate = hackathon.registrationDeadline.replace(/-/g, '');
    const dates = `${cleanDate}/${cleanDate}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
  };

  // Helper to extract clean hostname domain for link-health checking
  const getDomainFromUrl = (urlString: string): string => {
    try {
      return new URL(urlString).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-orange-500/60 shadow-xl shadow-orange-950/60 text-slate-100 px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-mono animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Trophy className="w-4 h-4 text-orange-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner with Orange Accent Deck */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-slate-950 via-orange-950/15 to-slate-900 p-6 shadow-xl shadow-orange-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/40">
                <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                <span>Portal 5 • Global Hackathons</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Transparent Fee &amp; Prize Disclosures</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zero Eligibility Filtering</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Hackathons &amp; Innovation Sprints</span>
              <Trophy className="w-7 h-7 text-orange-400 shrink-0" />
            </h1>

            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Curated global hackathons, collegiate build weekends, and open innovation competitions from Devpost and premier recurring series.
              <span className="text-orange-300/90 font-medium ml-1">
                Zero gatekeeping — every student, developer, and builder can explore and participate regardless of year or background.
              </span>
            </p>
          </div>

          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 shrink-0">
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-orange-500/20 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-400">Open Now</div>
              <div className="text-lg font-mono font-bold text-orange-300">{statusCounts.openNow}</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-400">Upcoming</div>
              <div className="text-lg font-mono font-bold text-sky-300">{statusCounts.upcoming}</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-400">Passed</div>
              <div className="text-lg font-mono font-bold text-slate-400">{statusCounts.passed}</div>
            </div>
            <button
              type="button"
              onClick={() => setFilterOnlyTracked(prev => !prev)}
              className={`px-3.5 py-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                filterOnlyTracked 
                  ? 'bg-amber-500/25 border-amber-500 text-amber-200 ring-2 ring-amber-500/40' 
                  : 'bg-slate-900/80 border-orange-500/20 hover:border-orange-500/50'
              }`}
              title="Click to toggle filter for only your tracked hackathons"
            >
              <div className="text-[10px] font-mono uppercase text-slate-400">
                Tracked {filterOnlyTracked ? '✓ (Active)' : ''}
              </div>
              <div className="text-lg font-mono font-bold text-amber-300">
                {Math.max(hackathonApplications.length, trackedHackathonIds.length)}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Live Feed Status / Alert Banner (Prompt 43) */}
      {liveFeedMessage ? (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs font-mono flex items-center justify-between gap-3 shadow-md shadow-amber-950/40">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold">{liveFeedMessage}</span>
          </div>
          <button
            onClick={() => fetchLiveFeed(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-100 text-[11px] font-mono border border-amber-700/60 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry Live Feed</span>
          </button>
        </div>
      ) : isLiveFeedLoading ? (
        <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs font-mono flex items-center gap-2">
          <RefreshCw className="w-3 h-3 text-orange-400 animate-spin" />
          <span>Synchronizing live Devpost hackathon feed...</span>
        </div>
      ) : liveHackathons.length > 0 ? (
        <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Feed Synchronized: {liveHackathons.length} public hackathons verified from Devpost</span>
          </div>
          <button
            onClick={() => fetchLiveFeed(true)}
            className="text-[11px] text-emerald-400 hover:text-emerald-200 flex items-center gap-1 cursor-pointer"
            title="Refresh feed"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync Fresh</span>
          </button>
        </div>
      ) : null}

      {/* Status Tabs (All / Open Now / Upcoming / Passed) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveStatusTab('ALL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeStatusTab === 'ALL'
                ? 'bg-orange-500/20 text-orange-200 border border-orange-500/60 shadow-md shadow-orange-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>All Hackathons</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
              {allHackathons.length}
            </span>
          </button>

          <button
            onClick={() => setActiveStatusTab('OPEN_NOW')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeStatusTab === 'OPEN_NOW'
                ? 'bg-orange-500/20 text-orange-200 border border-orange-500/60 shadow-md shadow-orange-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span>Open Now</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-orange-950 text-orange-300 border border-orange-800">
              {statusCounts.openNow}
            </span>
          </button>

          <button
            onClick={() => setActiveStatusTab('UPCOMING')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeStatusTab === 'UPCOMING'
                ? 'bg-orange-500/20 text-orange-200 border border-orange-500/60 shadow-md shadow-orange-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span>Upcoming Sprints</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-950 text-sky-300 border border-sky-800">
              {statusCounts.upcoming}
            </span>
          </button>

          <button
            onClick={() => setActiveStatusTab('PASSED')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeStatusTab === 'PASSED'
                ? 'bg-orange-500/20 text-orange-200 border border-orange-500/60 shadow-md shadow-orange-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Passed / Concluded</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
              {statusCounts.passed}
            </span>
          </button>
        </div>

        {/* Search bar */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hackathons, themes..."
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-slate-900/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filter Row: Mode, Country, Theme */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex flex-wrap items-center gap-3 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-orange-400 font-bold mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Mode Filter ('online' | 'in-person' | 'hybrid') */}
        <div className="flex items-center gap-1.5">
          <label className="text-slate-400 text-[11px]">Mode:</label>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-orange-500/50"
          >
            <option value="all">All Modes</option>
            <option value="online">Online (Virtual)</option>
            <option value="in-person">In-Person</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        {/* Country Filter */}
        <div className="flex items-center gap-1.5">
          <label className="text-slate-400 text-[11px]">Country:</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-orange-500/50"
          >
            <option value="all">All Countries</option>
            {uniqueCountries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* Theme Filter */}
        <div className="flex items-center gap-1.5">
          <label className="text-slate-400 text-[11px]">Theme:</label>
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-orange-500/50 max-w-[180px] truncate"
          >
            <option value="all">All Themes</option>
            {uniqueThemes.map(theme => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>
        </div>

        {/* Status Filter ('NOT_ANNOUNCED' | 'ANNOUNCED_UNCONFIRMED' | 'ANNOUNCED_VERIFIED' | 'PASSED') */}
        <div className="flex items-center gap-1.5">
          <label className="text-slate-400 text-[11px]">Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-orange-500/50"
          >
            <option value="all">All Statuses</option>
            <option value="ANNOUNCED_VERIFIED">Announced &amp; Verified</option>
            <option value="ANNOUNCED_UNCONFIRMED">Announced (Unconfirmed)</option>
            <option value="NOT_ANNOUNCED">Not Announced</option>
            <option value="PASSED">Passed</option>
          </select>
        </div>

        {/* Type Filter ('hackathon' | 'coding-contest') (Prompt 51) */}
        <div className="flex items-center gap-1.5">
          <label className="text-slate-400 text-[11px]">Type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as HackathonType | 'all')}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-orange-500/50"
          >
            <option value="all">All Types</option>
            <option value="hackathon">Hackathon</option>
            <option value="coding-contest">Coding Contest</option>
          </select>
        </div>

        {/* Reset button if any filter is dirty */}
        {(selectedMode !== 'all' || selectedCountry !== 'all' || selectedTheme !== 'all' || selectedStatus !== 'all' || selectedType !== 'all' || searchQuery) && (
          <button
            onClick={handleResetFilters}
            className="ml-auto flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Prompt 51: "Browse more" row with plain link-out cards to Devpost, MLH, Devfolio and Unstop */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-3" data-testid="browse-more-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-orange-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Browse More
            </h3>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              Explore global &amp; regional ecosystems directly on official directories
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            Plain Link-Out • No Scraper
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Devpost */}
          <a
            href="https://devpost.com"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="browse-more-devpost"
            className="group p-3 rounded-xl bg-slate-950/70 hover:bg-slate-900/90 border border-slate-800 hover:border-orange-500/50 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors">
                Devpost
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-400 transition-colors" />
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Browse thousands of global hackathons and virtual builder sprints.
            </p>
            <div className="mt-2 text-[10px] font-mono text-orange-400 flex items-center gap-1">
              <span>devpost.com</span>
            </div>
          </a>

          {/* MLH */}
          <a
            href="https://mlh.io"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="browse-more-mlh"
            className="group p-3 rounded-xl bg-slate-950/70 hover:bg-slate-900/90 border border-slate-800 hover:border-orange-500/50 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors">
                MLH (Major League Hacking)
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-400 transition-colors" />
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Official student hackathon league, Global Hack Week, and member events.
            </p>
            <div className="mt-2 text-[10px] font-mono text-orange-400 flex items-center gap-1">
              <span>mlh.io</span>
            </div>
          </a>

          {/* Devfolio */}
          <a
            href="https://devfolio.co"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="browse-more-devfolio"
            className="group p-3 rounded-xl bg-slate-950/70 hover:bg-slate-900/90 border border-slate-800 hover:border-orange-500/50 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors">
                Devfolio
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-400 transition-colors" />
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              India and global community hackathons, Web3 tracks, and university hackathons.
            </p>
            <div className="mt-2 text-[10px] font-mono text-orange-400 flex items-center gap-1">
              <span>devfolio.co</span>
            </div>
          </a>

          {/* Unstop */}
          <a
            href="https://unstop.com"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="browse-more-unstop"
            className="group p-3 rounded-xl bg-slate-950/70 hover:bg-slate-900/90 border border-slate-800 hover:border-orange-500/50 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors">
                Unstop
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-400 transition-colors" />
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Student competitions, corporate innovation challenges, and coding contests.
            </p>
            <div className="mt-2 text-[10px] font-mono text-orange-400 flex items-center gap-1">
              <span>unstop.com</span>
            </div>
          </a>
        </div>
      </div>

      {/* Main Hackathons Grid */}
      {filteredHackathons.length === 0 ? (
        /* Honest Empty State */
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-12 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Trophy className="w-7 h-7" />
          </div>
          
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white">No Hackathons Found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No hackathons match your current filter selection in the{' '}
              <span className="text-orange-400 font-medium">
                {activeStatusTab === 'OPEN_NOW' ? 'Open Now' : activeStatusTab === 'UPCOMING' ? 'Upcoming' : 'Passed'}
              </span>{' '}
              category.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
            {selectedMode !== 'all' && <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Mode: {selectedMode}</span>}
            {selectedCountry !== 'all' && <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Country: {selectedCountry}</span>}
            {selectedTheme !== 'all' && <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Theme: {selectedTheme}</span>}
            {selectedStatus !== 'all' && <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Status: {selectedStatus}</span>}
            {searchQuery && <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Query: "{searchQuery}"</span>}
          </div>

          <div className="pt-2">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/50 text-xs font-mono font-bold transition-all cursor-pointer shadow-md shadow-orange-950/30"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All Active Filters</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredHackathons.map((hackathon) => {
            const isTracked = trackedHackathonIds.includes(hackathon.id);
            const computedStatus = HackathonsService.getHackathonStatus(hackathon, referenceDate);
            const hasFeeOrStake = HackathonsService.hasFeeOrStake(hackathon);

            return (
              <div
                key={hackathon.id}
                className="group relative rounded-2xl border border-slate-800/90 hover:border-orange-500/40 bg-slate-950/90 hover:bg-gradient-to-br hover:from-slate-950 hover:via-slate-900/60 hover:to-orange-950/10 transition-all duration-200 p-5 shadow-lg flex flex-col justify-between"
              >
                {/* Header: Badges & Tracking */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Type Badge (Prompt 51: 'hackathon' | 'coding-contest') */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${
                        hackathon.type === 'coding-contest'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}>
                        {hackathon.type === 'coding-contest' ? 'Coding Contest' : 'Hackathon'}
                      </span>

                      {/* Mode Badge */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${
                        hackathon.mode === 'online'
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60'
                          : hackathon.mode === 'in-person'
                          ? 'emerald-950/80 text-emerald-300 border-emerald-800/60 bg-emerald-950/80'
                          : 'bg-purple-950/80 text-purple-300 border-purple-800/60'
                      }`}>
                        {hackathon.mode === 'online' ? 'Online' : hackathon.mode === 'in-person' ? 'In-Person' : 'Hybrid'}
                      </span>

                      {/* Country Badge */}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span>{hackathon.country}</span>
                      </span>

                      {/* Source Badge (Prompt 45: "Listed on Devpost" or "Official series") */}
                      <span 
                        data-testid="hackathon-source-badge"
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1 ${
                          hackathon.source === 'devpost-live' 
                            ? 'bg-blue-950/80 text-blue-300 border-blue-800/60 shadow-sm' 
                            : 'bg-orange-950/80 text-orange-300 border-orange-800/60 shadow-sm'
                        }`}
                      >
                        {HackathonsService.getSourceBadgeText(hackathon.source)}
                      </span>

                      {/* Prompt 51: Clear "Fee / stake required" flag */}
                      {hasFeeOrStake && (
                        <span 
                          data-testid="hackathon-fee-stake-flag"
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950/90 text-rose-300 border border-rose-500/80 flex items-center gap-1 shadow-sm ring-1 ring-rose-500/30"
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                          <span>Fee / stake required</span>
                        </span>
                      )}

                      {/* Status Tag (Open Now / Upcoming / Passed) */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold ${
                        computedStatus === 'OPEN_NOW'
                          ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800'
                          : computedStatus === 'UPCOMING'
                          ? 'bg-sky-950/90 text-sky-300 border border-sky-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {computedStatus === 'OPEN_NOW' ? 'Open Now' : computedStatus === 'UPCOMING' ? 'Upcoming' : 'Passed'}
                      </span>

                      {/* Prompt 42 Lifecycle Status Badge */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border ${
                        hackathon.status === 'ANNOUNCED_VERIFIED'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                          : hackathon.status === 'ANNOUNCED_UNCONFIRMED'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                          : hackathon.status === 'NOT_ANNOUNCED'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {hackathon.status === 'ANNOUNCED_VERIFIED'
                          ? 'Verified'
                          : hackathon.status === 'ANNOUNCED_UNCONFIRMED'
                          ? 'Unconfirmed'
                          : hackathon.status === 'NOT_ANNOUNCED'
                          ? 'Not Announced'
                          : 'Concluded'}
                      </span>

                      {/* Link-Health Badge in header (Prompt 45) */}
                      <LinkHealthBadge 
                        url={hackathon.officialUrl}
                        companyDomain={getDomainFromUrl(hackathon.officialUrl)}
                        compact
                      />
                    </div>

                    {/* Bookmark / Track Button */}
                    <button
                      onClick={() => toggleTrackHackathon(hackathon.id, hackathon.name)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isTracked
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/60 shadow-sm shadow-orange-950'
                          : 'text-slate-500 hover:text-orange-300 hover:bg-slate-900 border-slate-800'
                      }`}
                      title={isTracked ? 'Stop tracking hackathon' : 'Track hackathon in personal workspace'}
                    >
                      {isTracked ? (
                        <BookmarkCheck className="w-4 h-4 text-orange-400" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Hackathon Name & Organizer with Official Host/Company Logo */}
                  <div>
                    <div className="flex items-start gap-3">
                    <CompanyLogo
                      name={hackathon.organizer}
                      domain={getDomainFromUrl(hackathon.officialUrl)}
                      size="md"
                      className="shrink-0 mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-orange-400/90 font-semibold mb-0.5">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">{hackathon.organizer}</span>
                        <span className="text-slate-600">•</span>
                        <a 
                          href={hackathon.officialUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-slate-400 hover:text-orange-300 transition-colors flex items-center gap-0.5 font-normal truncate"
                          title={hackathon.officialUrl}
                        >
                          <span>{getDomainFromUrl(hackathon.officialUrl)}</span>
                        </a>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-orange-200 transition-colors leading-snug">
                        {hackathon.name}
                      </h3>
                    </div>
                  </div>

                    {/* Active Tracked Application Indicator (Fast Apply / Direct Official Portal Tracked) */}
                    {(() => {
                      const trackedApp = HackathonTrackingService.getApplicationForHackathon(hackathon.id, studentProfile?.email);
                      if (!trackedApp) return null;
                      return (
                        <div 
                          onClick={() => setWhitePageHackathon(hackathon)}
                          className="mt-2 p-2 px-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-2 text-xs font-mono cursor-pointer hover:bg-emerald-950/60 transition-colors"
                          title="Click to view application dossier and official white page"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">
                              Tracked: <strong className="text-emerald-200">{trackedApp.confirmationId}</strong>
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            {trackedApp.status}
                          </span>
                        </div>
                      );
                    })()}

                    {hackathon.description && (
                      <p className="mt-1.5 text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {hackathon.description}
                      </p>
                    )}
                  </div>

                  {/* Prize & Entry Fee Highlights (Prompt 45: prize text as "listed by organizer" or "not listed"; entry fee as listed, flag clearly if fee exists) */}
                  {(() => {
                    const prizeDisplay = HackathonsService.getPrizeDisplay(hackathon.prizeText);
                    const feeExists = HackathonsService.isFeeRequired(hackathon.entryFeeText);

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
                        {/* Prize Pool */}
                        <div 
                          data-testid="hackathon-prize-box"
                          className="p-2.5 rounded-xl bg-orange-950/20 border border-orange-500/30 flex items-center gap-2"
                        >
                          <Trophy className="w-4 h-4 text-orange-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 text-[10px] uppercase font-semibold">
                              <span className="text-orange-400">Prize</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium border ${
                                prizeDisplay.isListed
                                  ? 'bg-orange-950/70 text-orange-300 border-orange-800/50'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}>
                                {prizeDisplay.badgeText}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-orange-200 truncate mt-0.5" title={prizeDisplay.displayText}>
                              {prizeDisplay.isListed ? (
                                <span>{prizeDisplay.displayText} <span className="text-[10px] font-normal text-orange-300/80">(listed by organizer)</span></span>
                              ) : (
                                <span className="text-slate-400">Not listed <span className="text-[10px] text-slate-500">(not listed)</span></span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Entry Fee (Prompt 51: flag clearly if a fee or stake exists: "Fee / stake required") */}
                        <div 
                          data-testid="hackathon-fee-box"
                          className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                            (feeExists || hasFeeOrStake)
                              ? 'bg-rose-950/40 border-rose-500/70 text-rose-200 ring-1 ring-rose-500/30'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          {(feeExists || hasFeeOrStake) ? (
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                          ) : (
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 text-[10px] uppercase font-semibold">
                              <span className={(feeExists || hasFeeOrStake) ? 'text-rose-400 font-bold flex items-center gap-1' : 'text-slate-400'}>
                                {(feeExists || hasFeeOrStake) ? '⚠️ Fee / stake required' : 'Entry Fee (as listed)'}
                              </span>
                              {(feeExists || hasFeeOrStake) ? (
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-rose-900/90 text-rose-200 border border-rose-500 shadow-sm">
                                  Fee / stake required
                                </span>
                              ) : (
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                                  Free
                                </span>
                              )}
                            </div>
                            <div className={`text-xs font-semibold truncate mt-0.5 ${(feeExists || hasFeeOrStake) ? 'text-rose-200 font-bold' : 'text-emerald-300'}`}>
                              {hackathon.entryFeeText || 'Fee / stake required'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Dates Matrix or Schedule Note (Prompt 44) */}
                  {(hackathon.datesNote || !hackathon.startDate) ? (
                    <div className="p-2.5 rounded-xl bg-orange-950/20 border border-orange-500/30 flex items-start gap-2 text-[11px] font-mono">
                      <Calendar className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-orange-400 font-semibold">Schedule Note: </span>
                        <span className="text-slate-300">
                          {hackathon.datesNote || 'Confirm on the official page'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1.5 text-[11px] font-mono text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-orange-400" />
                          <span>Event Dates:</span>
                        </span>
                        <span className="font-semibold text-slate-200">
                          {formatDateDisplay(hackathon.startDate)} – {formatDateDisplay(hackathon.endDate)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Registration Deadline:</span>
                        </span>
                        {(() => {
                          const isDeadlinePassed = hackathon.registrationDeadline && 
                            new Date(hackathon.registrationDeadline + 'T23:59:59Z').getTime() < referenceDate.getTime();
                          if (isDeadlinePassed) {
                            return (
                              <span className="font-semibold text-rose-400 flex items-center gap-1">
                                <span>Registration closed</span>
                                <span className="text-slate-400 font-normal">({formatDateDisplay(hackathon.registrationDeadline)})</span>
                              </span>
                            );
                          }
                          return (
                            <span className="font-semibold text-amber-300">
                              {formatDateDisplay(hackathon.registrationDeadline)}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Previous Edition Facts & Confirmation Note (Prompt 44 & 48) */}
                  {hackathon.lastEditionNote && (
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed min-w-0">
                        <span className="text-orange-400 font-semibold">{hackathon.type === 'coding-contest' ? 'Contest Note: ' : 'Last Edition: '}</span>
                        <span>{hackathon.lastEditionNote}</span>
                      </div>
                    </div>
                  )}

                  {/* SPOC Requirement Note (Prompt 44: Show the SPOC note on the SIH card) */}
                  {hackathon.spocNote && (
                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/50 text-amber-200 text-[11px] font-mono flex items-start gap-2 shadow-sm shadow-amber-950/30">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px] block mb-0.5">SPOC Mandatory Requirement:</span>
                        <span>{hackathon.spocNote}</span>
                      </div>
                    </div>
                  )}

                  {/* Mandatory Official Page Confirmation Notice on Every Card (Prompt 48) */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800/80 text-[10px] font-mono text-amber-300/90">
                    <ExternalLink className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Confirm on the official page</span>
                  </div>

                  {/* Themes Tag Cloud */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {hackathon.themes.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setSelectedTheme(theme)}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 hover:bg-orange-950/60 text-slate-400 hover:text-orange-300 border border-slate-800 hover:border-orange-500/40 transition-colors cursor-pointer"
                      >
                        #{theme}
                      </button>
                    ))}
                  </div>

                  {/* PROMPT 46: Official Page Watcher Provenance & Stale Snapshot Badge */}
                  {/* Always store sourceUrl and detectedOn and show "Detected on the official page on <date>". If a fetch fails, keep the last verified snapshot and label it stale. */}
                  {hackathon.detectedOn && (
                    <div 
                      data-testid="hackathon-detected-box"
                      className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between gap-2 text-[11px] font-mono text-cyan-300"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">
                          Detected on the official page on {hackathon.detectedOn}
                        </span>
                      </div>
                      {hackathon.isStale && (
                        <span 
                          data-testid="hackathon-stale-badge"
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/40 shrink-0 uppercase tracking-wider font-semibold"
                        >
                          Stale
                        </span>
                      )}
                    </div>
                  )}

                  {hackathon.isStale && !hackathon.detectedOn && (
                    <div 
                      data-testid="hackathon-stale-box"
                      className="p-2 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center gap-2 text-[11px] font-mono text-amber-300"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Stale (upstream page fetch temporarily unavailable)</span>
                    </div>
                  )}

                  {/* STRICT MANDATE (Prompt 45): Eligibility text as listed with the line "Check the event's own rules". Never write that the student is eligible. */}
                  <div 
                    data-testid="hackathon-eligibility-box"
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1.5"
                  >
                    <div className="flex items-start gap-2">
                      <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-cyan-300 font-semibold">Eligibility: </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-cyan-950/70 text-cyan-300 border border-cyan-800/50">
                            as listed
                          </span>
                        </div>
                        <span className="text-slate-200">{hackathon.eligibilityText}</span>
                      </div>
                    </div>
                    <div className="pt-1.5 border-t border-slate-800/70 flex items-center gap-1.5 text-[10px] text-amber-300/90 font-sans">
                      <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-medium italic">Check the event's own rules</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footers */}
                <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Fast Apply Assistant Button */}
                    <button
                      type="button"
                      onClick={() => setFastApplyHackathon(hackathon)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-mono font-bold text-xs transition-all shadow-md shadow-orange-950/50 cursor-pointer"
                      title="Open Fast Apply form pre-fill assistant & requirement checker"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Fast Apply</span>
                    </button>

                    {/* Official White Page & PDF Button */}
                    <button
                      type="button"
                      onClick={() => setWhitePageHackathon(hackathon)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-orange-300 border border-slate-700 font-mono text-xs transition-colors cursor-pointer"
                      title="View verified official white page dossier & export PDF"
                    >
                      <FileText className="w-3.5 h-3.5 text-orange-400" />
                      <span>White Page &amp; PDF</span>
                    </button>

                    {/* Official Portal Link */}
                    <a
                      href={hackathon.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-orange-300 border border-slate-800 font-mono text-xs transition-colors cursor-pointer"
                      title={hackathon.officialUrl}
                    >
                      <span>{getDomainFromUrl(hackathon.officialUrl) || 'Official Portal'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* Google Calendar sync (only when fixed registrationDeadline exists) */}
                    {hackathon.registrationDeadline && hackathon.registrationDeadline.trim().length > 0 && (
                      <a
                        href={createGoogleCalendarUrlForHackathon(hackathon)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-orange-300 border border-slate-800 text-xs font-mono transition-colors"
                        title="Add registration deadline to Google Calendar"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Sync Deadline</span>
                      </a>
                    )}
                  </div>

                  {/* Link Health Badge (Prompt 45) */}
                  <LinkHealthBadge 
                    url={hackathon.officialUrl}
                    companyDomain={getDomainFromUrl(hackathon.officialUrl)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fast Apply Assistant Modal */}
      {fastApplyHackathon && (
        <HackathonFastApplyModal
          hackathon={fastApplyHackathon}
          studentProfile={studentProfile}
          isOpen={Boolean(fastApplyHackathon)}
          onClose={() => setFastApplyHackathon(null)}
          onApplicationTracked={(rec) => {
            setToastMessage(`Application successfully tracked: ${rec.confirmationId}`);
            setHackathonApplications(HackathonTrackingService.getApplications(studentProfile?.email));
          }}
        />
      )}

      {/* Official White Page & PDF Modal */}
      {whitePageHackathon && (
        <HackathonWhitePageModal
          hackathon={whitePageHackathon}
          studentProfile={studentProfile}
          isOpen={Boolean(whitePageHackathon)}
          onClose={() => setWhitePageHackathon(null)}
          applicationRecord={HackathonTrackingService.getApplicationForHackathon(whitePageHackathon.id, studentProfile?.email)}
        />
      )}
    </div>
  );
};

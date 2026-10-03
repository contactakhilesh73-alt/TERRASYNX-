/**
 * TERRASYNX: Reusable Interview Story Bank View (Prompt 16)
 * TERRASYNX persistent STAR repository created from evaluated mock interview
 * sessions and saved in Firestore (under student profile) with local resilience.
 *
 * Provides full editing, tagging, role-based best-story recommendation, and
 * 1-click practice routing back to Mock Interview Studio.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  InterviewStory, 
  StoryMatchSuggestion, 
  Opportunity, 
  StudentProfile, 
  MockInterviewRoundType 
} from '../types';
import { InterviewStoryBankService } from '../services/interviewStoryBankService';
import { 
  BookOpen, 
  Sparkles, 
  Star, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  ArrowRight, 
  Layers, 
  Tag, 
  Briefcase, 
  Target, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  X, 
  Mic, 
  ChevronDown, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';

interface StoryBankViewProps {
  opportunities: Opportunity[];
  studentProfile: StudentProfile;
  onNavigateToMockInterview?: (oppId?: string, questionText?: string) => void;
  onNavigateToPipeline?: () => void;
}

export const StoryBankView: React.FC<StoryBankViewProps> = ({
  opportunities,
  studentProfile,
  onNavigateToMockInterview,
  onNavigateToPipeline,
}) => {
  const [stories, setStories] = useState<InterviewStory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoundType, setSelectedRoundType] = useState<string>('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  const [onlyStarred, setOnlyStarred] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Role Match Suggestion State
  const [selectedOppId, setSelectedOppId] = useState<string>(opportunities[0]?.id || '');
  const [customRoleQuery, setCustomRoleQuery] = useState<string>('');
  const [showRoleMatcher, setShowRoleMatcher] = useState<boolean>(true);

  // Edit / Create Modal State
  const [editingStory, setEditingStory] = useState<InterviewStory | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [storyForm, setStoryForm] = useState<Partial<InterviewStory>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Load stories on mount
  useEffect(() => {
    loadStories();
  }, [studentProfile.id]);

  const loadStories = async () => {
    setIsLoading(true);
    try {
      const data = await InterviewStoryBankService.getStories(studentProfile.id);
      setStories(data);
    } catch {
      // Handled inside service
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Star
  const handleToggleStar = async (storyId: string) => {
    const updatedStarred = await InterviewStoryBankService.toggleStar(storyId, studentProfile.id);
    setStories(prev => prev.map(s => s.id === storyId ? { ...s, isStarred: updatedStarred } : s));
  };

  // Delete Story
  const handleDeleteStory = async (storyId: string) => {
    if (window.confirm('Are you sure you want to remove this story from your bank?')) {
      await InterviewStoryBankService.deleteStory(storyId, studentProfile.id);
      setStories(prev => prev.filter(s => s.id !== storyId));
    }
  };

  // Copy Full Narrative
  const handleCopyStory = (story: InterviewStory) => {
    const text = `STORY: ${story.title}\nQuestion: "${story.questionPrompt}"\n\n[SITUATION]\n${story.starSituation}\n\n[TASK]\n${story.starTask}\n\n[ACTION]\n${story.starAction}\n\n[RESULT]\n${story.starResult}\n\nKey Metrics: ${story.metricsMentioned.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(story.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export Entire Bank
  const handleExportBank = () => {
    InterviewStoryBankService.exportStoryBankAsText(stories, studentProfile.fullName || 'Candidate');
  };

  // Target Opportunity currently selected for match scoring
  const targetOpportunity = useMemo(() => {
    return opportunities.find(o => o.id === selectedOppId) || opportunities[0];
  }, [selectedOppId, opportunities]);

  // Compute Role Match Suggestions
  const roleSuggestions: StoryMatchSuggestion[] = useMemo(() => {
    const roleTitle = customRoleQuery.trim() || (targetOpportunity ? `${targetOpportunity.companyName} ${targetOpportunity.title}` : 'Software Engineer');
    const jdText = targetOpportunity?.description || '';
    return InterviewStoryBankService.suggestBestStoriesForRole(roleTitle, jdText, stories);
  }, [customRoleQuery, targetOpportunity, stories]);

  // Map of storyId to match suggestion
  const suggestionMap = useMemo(() => {
    const map = new Map<string, StoryMatchSuggestion>();
    roleSuggestions.forEach(sug => map.set(sug.story.id, sug));
    return map;
  }, [roleSuggestions]);

  // Filtered stories for grid view
  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch = 
          story.title.toLowerCase().includes(q) ||
          story.companyName.toLowerCase().includes(q) ||
          story.tags.some(t => t.toLowerCase().includes(q)) ||
          story.fullNarrative.toLowerCase().includes(q) ||
          story.roleArchetype.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Round Type
      if (selectedRoundType !== 'all' && story.roundType !== selectedRoundType) {
        return false;
      }

      // Grade
      if (selectedGradeFilter !== 'all' && story.grade !== selectedGradeFilter) {
        return false;
      }

      // Starred
      if (onlyStarred && !story.isStarred) {
        return false;
      }

      return true;
    });
  }, [stories, searchQuery, selectedRoundType, selectedGradeFilter, onlyStarred]);

  // Open Edit Modal
  const handleOpenEdit = (story: InterviewStory) => {
    setEditingStory(story);
    setIsCreatingNew(false);
    setStoryForm({ ...story });
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingStory(null);
    setIsCreatingNew(true);
    setStoryForm({
      id: `story_custom_${Date.now()}`,
      userId: studentProfile.id,
      title: '',
      companyName: targetOpportunity?.companyName || 'Target Enterprise',
      roleArchetype: 'Distributed Systems & Backend',
      roundType: 'behavioral_star',
      questionPrompt: 'Describe a complex engineering challenge you resolved.',
      starSituation: '',
      starTask: '',
      starAction: '',
      starResult: '',
      fullNarrative: '',
      tags: ['Problem Solving', 'Architecture'],
      targetRoles: ['Software Engineer', 'Backend Engineer'],
      score: 90,
      grade: 'A',
      metricsMentioned: [],
      strengths: ['Clear individual ownership'],
      growthAreas: [],
      isStarred: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  // Save Modal Form
  const handleSaveForm = async () => {
    if (!storyForm.title?.trim() || !storyForm.starAction?.trim()) {
      setFormError('Please provide both a Story Title and the Action details.');
      return;
    }
    setFormError(null);

    const narrative = storyForm.fullNarrative || 
      `Situation: ${storyForm.starSituation}\nTask: ${storyForm.starTask}\nAction: ${storyForm.starAction}\nResult: ${storyForm.starResult}`;

    const completeStory: InterviewStory = {
      id: storyForm.id || `story_${Date.now()}`,
      userId: studentProfile.id,
      title: storyForm.title.trim(),
      companyName: storyForm.companyName?.trim() || 'Enterprise',
      roleArchetype: storyForm.roleArchetype?.trim() || 'Software Engineering',
      roundType: (storyForm.roundType as MockInterviewRoundType) || 'behavioral_star',
      questionPrompt: storyForm.questionPrompt?.trim() || 'Interview Question Prompt',
      starSituation: storyForm.starSituation?.trim() || '',
      starTask: storyForm.starTask?.trim() || '',
      starAction: storyForm.starAction.trim(),
      starResult: storyForm.starResult?.trim() || '',
      fullNarrative: narrative,
      tags: Array.isArray(storyForm.tags) ? storyForm.tags : ['Engineering'],
      targetRoles: Array.isArray(storyForm.targetRoles) ? storyForm.targetRoles : ['Software Engineer'],
      score: Number(storyForm.score) || 88,
      grade: storyForm.grade || 'A',
      metricsMentioned: Array.isArray(storyForm.metricsMentioned) ? storyForm.metricsMentioned : [],
      strengths: Array.isArray(storyForm.strengths) ? storyForm.strengths : ['Structured STAR framing'],
      growthAreas: Array.isArray(storyForm.growthAreas) ? storyForm.growthAreas : [],
      isStarred: Boolean(storyForm.isStarred),
      createdAt: storyForm.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    await InterviewStoryBankService.saveStory(completeStory, studentProfile.id);
    await loadStories();
    setEditingStory(null);
    setIsCreatingNew(false);
  };

  // Calculate high-level stats
  const totalStories = stories.length;
  const starredCount = stories.filter(s => s.isStarred).length;
  const avgScore = totalStories > 0 ? Math.round(stories.reduce((acc, s) => acc + s.score, 0) / totalStories) : 0;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      
      {/* Top Banner & Control Deck */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wide uppercase font-mono">
                TERRASYNX Reusable Narrative Repository
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Firestore Synced
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-indigo-400" />
              <span>My Reusable Interview Story Bank</span>
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Turn your real mock interview practice sessions into an enduring, reusable repository. Anchor your STAR narratives once, and let the AI suggest the highest-converting stories tailored to any target job role.
            </p>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <Layers className="w-4 h-4 text-indigo-400" />
              <div className="text-left">
                <p className="text-[10px] text-slate-400 font-mono uppercase">Bank Size</p>
                <p className="text-xs font-bold text-slate-100 font-mono">{totalStories} Stories</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <div className="text-left">
                <p className="text-[10px] text-slate-400 font-mono uppercase">Anchors</p>
                <p className="text-xs font-bold text-amber-300 font-mono">{starredCount} Starred</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <Award className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <p className="text-[10px] text-slate-400 font-mono uppercase">Avg Score</p>
                <p className="text-xs font-bold text-emerald-300 font-mono">{avgScore}/100</p>
              </div>
            </div>

            <button
              onClick={handleExportBank}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              title="Download entire story bank as a formatted interview cheat sheet (.txt)"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export .txt</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 hover:opacity-95 shadow-md shadow-indigo-950 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Add STAR Story</span>
            </button>
          </div>
        </div>
      </div>

      {/* Target Job Role Matcher & Best Story Suggester Widget */}
      <div className="rounded-2xl border border-indigo-900/40 bg-gradient-to-b from-indigo-950/20 via-slate-900/70 to-slate-900/90 p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Job-Role Matcher: Suggested Stories for Target Company
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Autonomous Recommendation
            </span>
          </div>

          <button
            onClick={() => setShowRoleMatcher(!showRoleMatcher)}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            {showRoleMatcher ? 'Hide Matcher' : 'Show Matcher'}
          </button>
        </div>

        {showRoleMatcher && (
          <div className="space-y-3.5">
            {/* Target Role Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1 font-mono">
                  Select Active Opportunity from Radar:
                </label>
                <div className="relative">
                  <select
                    value={selectedOppId}
                    onChange={(e) => {
                      setSelectedOppId(e.target.value);
                      setCustomRoleQuery('');
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans cursor-pointer"
                  >
                    {opportunities.map(opp => (
                      <option key={opp.id} value={opp.id}>
                        {opp.companyName} — {opp.title} ({opp.location || 'Remote'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1 font-mono">
                  Or Test Custom Role / Keywords:
                </label>
                <input
                  type="text"
                  value={customRoleQuery}
                  onChange={(e) => setCustomRoleQuery(e.target.value)}
                  placeholder="e.g., Staff Systems Architect, Distributed Storage Engineer..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* Top 2 Recommended Anchor Stories for this role */}
            <div className="pt-2">
              <p className="text-[11px] font-mono text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Highest-Converting Stories for: <strong className="text-cyan-300">{customRoleQuery || `${targetOpportunity?.companyName} • ${targetOpportunity?.title}`}</strong></span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roleSuggestions.slice(0, 2).map((sug, idx) => (
                  <div
                    key={sug.story.id}
                    className="p-3.5 rounded-xl border border-cyan-500/30 bg-slate-950/70 hover:border-cyan-500/60 transition-all flex flex-col justify-between space-y-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                            #{idx + 1} Best Fit
                          </span>
                          <span className="text-xs font-bold text-slate-100 truncate max-w-[200px]">
                            {sug.story.title}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                          {sug.matchScore}% Match
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 mt-2 line-clamp-2 italic">
                        "{sug.story.questionPrompt}"
                      </p>

                      <div className="mt-2.5 p-2 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-200">
                        <span className="font-semibold text-cyan-300">Recommended Pitch: </span>
                        <span>{sug.recommendedPitchAngle}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-xs">
                      <span className="text-[11px] font-mono text-slate-500">
                        {sug.story.companyName} • Score: {sug.story.score} ({sug.story.grade})
                      </span>

                      {onNavigateToMockInterview && (
                        <button
                          onClick={() => onNavigateToMockInterview(targetOpportunity?.id, sug.story.questionPrompt)}
                          className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer"
                        >
                          <span>Practice Story</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories by keyword, tag (e.g. Redis, Idempotency, Kafka), or company..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Round Type Filter */}
          <select
            value={selectedRoundType}
            onChange={(e) => setSelectedRoundType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Round Types</option>
            <option value="behavioral_star">Behavioral STAR</option>
            <option value="system_architecture">System Architecture</option>
            <option value="live_coding_algorithms">Algorithms & Coding</option>
          </select>

          {/* Grade Filter */}
          <select
            value={selectedGradeFilter}
            onChange={(e) => setSelectedGradeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Grades</option>
            <option value="A+">Grade A+</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
          </select>

          {/* Starred Toggle */}
          <button
            onClick={() => setOnlyStarred(!onlyStarred)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              onlyStarred
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Starred Only</span>
          </button>
        </div>
      </div>

      {/* Stories Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 font-mono text-sm">
          Loading student story bank from Firestore...
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No stories found matching your filter criteria</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try resetting your search query, or conduct a practice session in the Mock Interview Studio to automatically synthesize a new STAR story!
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedRoundType('all');
              setSelectedGradeFilter('all');
              setOnlyStarred(false);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredStories.map(story => {
            const sug = suggestionMap.get(story.id);

            return (
              <div
                key={story.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-md overflow-hidden"
              >
                {/* Story Top Header Bar */}
                <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleStar(story.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
                      title={story.isStarred ? 'Unstar anchor story' : 'Star as top priority anchor story'}
                    >
                      <Star className={`w-4 h-4 ${story.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-100">
                          {story.title}
                        </h3>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                          {story.companyName}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                          {story.roleArchetype}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mt-1 italic">
                        "{story.questionPrompt}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Score & Grade Badge */}
                    <div className="text-right">
                      <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg border ${
                        story.score >= 90
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : story.score >= 75
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        Score {story.score} • {story.grade}
                      </span>
                    </div>

                    {sug && (
                      <span className="text-[11px] font-mono font-semibold px-2 py-1 rounded-lg bg-indigo-950/80 text-cyan-300 border border-cyan-800/60">
                        {sug.matchScore}% Match
                      </span>
                    )}

                    <button
                      onClick={() => handleCopyStory(story)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Copy full story to clipboard"
                    >
                      {copiedId === story.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(story)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit STAR story fields"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteStory(story.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete story"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 4-Part STAR Grid Breakdown */}
                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Situation */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                      S • Situation
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {story.starSituation}
                    </p>
                  </div>

                  {/* Task */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                      T • Task &amp; Goal
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {story.starTask}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                      A • Proactive Action
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {story.starAction}
                    </p>
                  </div>

                  {/* Result */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                      R • Quantified Result
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {story.starResult}
                    </p>
                  </div>
                </div>

                {/* Tags & Bottom Footer Bar */}
                <div className="px-4 sm:px-5 py-3 border-t border-slate-800/60 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Keywords:</span>
                    {story.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {t}
                      </span>
                    ))}
                    {story.metricsMentioned.map((m, idx) => (
                      <span key={`metric-${idx}`} className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/60 font-semibold">
                        📈 {m}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {onNavigateToMockInterview && (
                      <button
                        onClick={() => onNavigateToMockInterview(targetOpportunity?.id, story.questionPrompt)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/80 transition-colors cursor-pointer"
                        title="Rehearse this question live in Mock Interview Studio"
                      >
                        <Mic className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Practice in Studio</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create Story Modal */}
      {(editingStory || isCreatingNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-slate-100">
                  {isCreatingNew ? 'Create New Reusable Interview Story' : 'Edit STAR Interview Story'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditingStory(null);
                  setIsCreatingNew(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                  {formError}
                </div>
              )}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Story Title</label>
                <input
                  type="text"
                  value={storyForm.title || ''}
                  onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                  placeholder="e.g., Geo-Distributed KV Store Raft Partition Resolution"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Target Company</label>
                  <input
                    type="text"
                    value={storyForm.companyName || ''}
                    onChange={(e) => setStoryForm({ ...storyForm, companyName: e.target.value })}
                    placeholder="e.g., Stripe, OpenAI, Google"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Role Archetype</label>
                  <input
                    type="text"
                    value={storyForm.roleArchetype || ''}
                    onChange={(e) => setStoryForm({ ...storyForm, roleArchetype: e.target.value })}
                    placeholder="e.g., Distributed Systems & Backend"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Interview Question Prompt</label>
                <textarea
                  rows={2}
                  value={storyForm.questionPrompt || ''}
                  onChange={(e) => setStoryForm({ ...storyForm, questionPrompt: e.target.value })}
                  placeholder="The question asked by the interviewer..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              {/* STAR Form Fields */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="font-semibold text-cyan-400 block mb-1">Situation (Context &amp; Challenge)</label>
                  <textarea
                    rows={2}
                    value={storyForm.starSituation || ''}
                    onChange={(e) => setStoryForm({ ...storyForm, starSituation: e.target.value })}
                    placeholder="Set the scene: what was broken, at risk, or needed?"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <div>
                  <label className="font-semibold text-indigo-400 block mb-1">Task (Your Goal &amp; Ownership)</label>
                  <textarea
                    rows={2}
                    value={storyForm.starTask || ''}
                    onChange={(e) => setStoryForm({ ...storyForm, starTask: e.target.value })}
                    placeholder="What was your specific responsibility under the SLA or deadline?"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div>
                  <label className="font-semibold text-emerald-400 block mb-1">Action (What You Engineered &amp; Decided)</label>
                  <textarea
                    rows={3}
                    value={storyForm.starAction || ''}
                    onChange={(e) => setStoryForm({ ...storyForm, starAction: e.target.value })}
                    placeholder="Use active verbs: I designed, I benchmarked, I refactored..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>

                <div>
                  <label className="font-semibold text-amber-400 block mb-1">Result (Quantifiable Impact &amp; Metrics)</label>
                  <textarea
                    rows={2}
                    value={storyForm.starResult || ''}
                    onChange={(e) => setStoryForm({ ...storyForm, starResult: e.target.value })}
                    placeholder="Include numbers: latency reduced by X%, zero data loss, $Y saved..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={Array.isArray(storyForm.tags) ? storyForm.tags.join(', ') : ''}
                  onChange={(e) => setStoryForm({ 
                    ...storyForm, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
                  })}
                  placeholder="e.g. Distributed Systems, Redis, Concurrency, PostgreSQL"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <button
                onClick={() => {
                  setEditingStory(null);
                  setIsCreatingNew(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveForm}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-indigo-400 to-cyan-400 hover:opacity-95 transition-all cursor-pointer shadow-md shadow-indigo-950"
              >
                Save to Story Bank
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

/**
 * TERRASYNX: Mock Interview Studio & Real-Time STAR Coach (Phase 7 Point 1)
 * Interactive live mock interview simulator with company-specific personas,
 * pacing timer, STAR structure evaluator, keyword gap analysis, and model answers.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Opportunity, 
  StudentProfile, 
  MockInterviewQuestion, 
  MockInterviewRoundType, 
  MockInterviewEvaluation, 
  MockInterviewSession 
} from '../types';
import { MockInterviewEngine } from '../services/mockInterviewEngine';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  Building2, 
  Timer, 
  ChevronRight, 
  Layers, 
  BookOpen, 
  Copy, 
  Check, 
  ArrowRight,
  TrendingUp,
  History,
  Trash2,
  ExternalLink
} from 'lucide-react';

interface MockInterviewStudioViewProps {
  opportunities: Opportunity[];
  studentProfile: StudentProfile;
  initialOpportunityId?: string;
  onOpenDetails?: (opp: Opportunity) => void;
  onNavigateToPipeline?: () => void;
  onNavigateToOfferEvaluator?: () => void;
}

export const MockInterviewStudioView: React.FC<MockInterviewStudioViewProps> = ({
  opportunities,
  studentProfile,
  initialOpportunityId,
  onOpenDetails,
  onNavigateToPipeline,
  onNavigateToOfferEvaluator,
}) => {
  // Selected Opportunity
  const [selectedOppId, setSelectedOppId] = useState<string>(
    initialOpportunityId || (opportunities[0]?.id || '')
  );
  const currentOpp = opportunities.find(o => o.id === selectedOppId) || opportunities[0];

  // Selected Round Type
  const [selectedRoundType, setSelectedRoundType] = useState<MockInterviewRoundType>('behavioral_star');

  // Current Question
  const [currentQuestion, setCurrentQuestion] = useState<MockInterviewQuestion>(() => {
    return MockInterviewEngine.getQuestionForOpportunity(currentOpp, 'behavioral_star');
  });

  // Candidate Response State
  const [candidateResponse, setCandidateResponse] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<MockInterviewEvaluation | null>(null);

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // UI Tabs & Copy State
  const [activeTab, setActiveTab] = useState<'practice' | 'history' | 'model_answer'>('practice');
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [showStarGuide, setShowStarGuide] = useState<boolean>(true);
  const [savedSessions, setSavedSessions] = useState<MockInterviewSession[]>(() => {
    return MockInterviewEngine.getSavedSessions();
  });

  // When selected opp or round type changes, update current question
  useEffect(() => {
    if (currentOpp) {
      const q = MockInterviewEngine.getQuestionForOpportunity(currentOpp, selectedRoundType);
      setCurrentQuestion(q);
      setCurrentEvaluation(null);
      setCandidateResponse('');
      setTimerSeconds(0);
      setIsTimerRunning(false);
    }
  }, [selectedOppId, selectedRoundType]);

  // Timer Tick
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Timer controls
  const handleToggleTimer = () => {
    setIsTimerRunning(prev => !prev);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  // Word count helper
  const wordCount = candidateResponse.trim().split(/\s+/).filter(Boolean).length;

  // Insert STAR template
  const handleInsertTemplate = () => {
    const template = `Situation: At my previous project, we were developing a critical distributed pipeline when...
Task: My individual objective was to resolve the latency bottleneck without compromising...
Action: I designed and implemented...
Result: Consequently, the system achieved a 45% latency reduction and zero data loss.`;
    setCandidateResponse(template);
  };

  // Load sample exemplar response
  const handleLoadSample = () => {
    setCandidateResponse(currentQuestion.exemplarAnswer);
  };

  // Evaluate candidate response
  const handleEvaluateResponse = async () => {
    if (!candidateResponse.trim()) return;

    setIsEvaluating(true);
    setIsTimerRunning(false);

    try {
      const evaluation = await MockInterviewEngine.evaluateSession(
        currentQuestion,
        candidateResponse,
        timerSeconds || 120,
        studentProfile
      );

      setCurrentEvaluation(evaluation);

      // Automatically persist session
      const session: MockInterviewSession = {
        id: `session_${Date.now()}`,
        timestamp: Date.now(),
        opportunityId: currentOpp.id,
        companyName: currentOpp.companyName,
        roleTitle: currentOpp.title,
        roundType: selectedRoundType,
        question: currentQuestion,
        candidateResponse: candidateResponse,
        durationSeconds: timerSeconds || 120,
        evaluation: evaluation,
      };

      MockInterviewEngine.saveSession(session);
      setSavedSessions(MockInterviewEngine.getSavedSessions());
    } finally {
      setIsEvaluating(false);
    }
  };

  // Copy model answer to clipboard
  const handleCopyModelAnswer = () => {
    navigator.clipboard.writeText(currentQuestion.exemplarAnswer);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Delete session from history
  const handleDeleteSession = (id: string) => {
    MockInterviewEngine.deleteSession(id);
    setSavedSessions(MockInterviewEngine.getSavedSessions());
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Top Banner & Control Deck */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wide uppercase">
                Phase 7 Point 1 • Enterprise Intelligence
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Coach Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-7 h-7 text-indigo-400" />
              Mock Interview Studio & Real-Time STAR Coach
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Simulate high-stakes technical architecture and behavioral interview rounds customized to verified company criteria with instant STAR scoring.
            </p>
          </div>

          {/* Quick Stats / History Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('practice')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'practice'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Practice Cockpit
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Session History ({savedSessions.length})
              </button>
            </div>

            {onNavigateToOfferEvaluator && (
              <button
                type="button"
                onClick={onNavigateToOfferEvaluator}
                className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-700/50 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Proceed to Offer Evaluator Studio (P7.2)"
              >
                <span>Offer Evaluator</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Opportunity & Round Selectors Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-800/80">
          
          {/* Target Company Requisition Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              Target Requisition
            </label>
            <select
              value={selectedOppId}
              onChange={(e) => setSelectedOppId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {opportunities.map(opp => (
                <option key={opp.id} value={opp.id}>
                  {opp.companyName} — {opp.title} ({opp.location})
                </option>
              ))}
            </select>
          </div>

          {/* Round Type Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Interview Round Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRoundType('behavioral_star')}
                className={`px-2.5 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  selectedRoundType === 'behavioral_star'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                🎯 STAR Behavioral
              </button>
              <button
                type="button"
                onClick={() => setSelectedRoundType('system_architecture')}
                className={`px-2.5 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  selectedRoundType === 'system_architecture'
                    ? 'bg-cyan-600/20 border-cyan-500 text-cyan-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                🏗️ System Design
              </button>
              <button
                type="button"
                onClick={() => setSelectedRoundType('live_coding_algorithms')}
                className={`px-2.5 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  selectedRoundType === 'live_coding_algorithms'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                💻 Live Algorithms
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Practice Workspace */}
      {activeTab === 'practice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interviewer Cockpit & Question Prompt (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Interviewer Persona HUD */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-white text-lg shadow-md shrink-0">
                  {currentQuestion.interviewerPersona.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-base truncate">
                      {currentQuestion.interviewerPersona}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase border border-slate-700">
                      Interviewer
                    </span>
                  </div>
                  <p className="text-xs text-indigo-400 mt-0.5 truncate font-medium">
                    {currentQuestion.interviewerTitle}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Evaluating for: <span className="text-slate-200 font-medium">{currentOpp.title}</span>
                  </p>
                </div>
              </div>

              {/* Speech / Cadence Pacing Timer */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isTimerRunning ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                    <Timer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-lg font-mono font-bold text-white tracking-wider">
                      {formatTime(timerSeconds)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Target: ~{formatTime(currentQuestion.recommendedDurationSeconds)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleTimer}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isTimerRunning
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" /> Start Timer
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetTimer}
                    title="Reset Timer"
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Question Prompt Card */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Live Interview Prompt
                </span>
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  {currentQuestion.roleArchetype}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <p className="text-base text-slate-100 font-medium leading-relaxed">
                  "{currentQuestion.questionText}"
                </p>
              </div>

              <div className="text-xs text-slate-400 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-300">Context & Rationale: </span>
                {currentQuestion.contextScenario}
              </div>

              {/* Critical Keywords Evaluated */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Target Technical Vocabulary
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentQuestion.criticalKeywords.map((kw, i) => (
                    <span 
                      key={i}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Collapsible STAR Guide */}
              <div className="border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setShowStarGuide(prev => !prev)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <span>STAR Methodology Checkpoints</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showStarGuide ? 'rotate-90' : ''}`} />
                </button>

                {showStarGuide && (
                  <div className="mt-3 space-y-2 text-xs text-slate-300 animate-in fade-in">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <strong className="text-indigo-400">Situation: </strong>
                      {currentQuestion.starPrompts.situationPrompt}
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <strong className="text-cyan-400">Task: </strong>
                      {currentQuestion.starPrompts.taskPrompt}
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <strong className="text-emerald-400">Action: </strong>
                      {currentQuestion.starPrompts.actionPrompt}
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <strong className="text-amber-400">Result: </strong>
                      {currentQuestion.starPrompts.resultPrompt}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Response Editor & Live Evaluation (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Candidate Response Editor */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    Your Response
                  </span>
                  <span className="text-xs text-slate-400">
                    ({wordCount} words)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleInsertTemplate}
                    className="text-xs text-slate-400 hover:text-indigo-300 transition-colors font-medium"
                  >
                    + Insert STAR Template
                  </button>
                  <span className="text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                  >
                    ⚡ Load Model Answer
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={candidateResponse}
                  onChange={(e) => setCandidateResponse(e.target.value)}
                  placeholder="Structure your answer using the STAR method:
• Situation: Set the scene and technical constraint...
• Task: What was your specific responsibility...
• Action: Detail the architecture, PRs, or algorithms you implemented...
• Result: Quantify business or system impact (e.g. 50% p99 reduction)..."
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed resize-y"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Target word count: 120–220 words
                </div>

                <button
                  type="button"
                  onClick={handleEvaluateResponse}
                  disabled={isEvaluating || !candidateResponse.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {isEvaluating ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Evaluating Structure...
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      Evaluate My Response
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Evaluation Scorecard HUD */}
            {currentEvaluation && (
              <div className="rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                
                {/* Scorecard Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-indigo-950 border border-indigo-700/50 text-indigo-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        Evaluation Scorecard
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                          currentEvaluation.grade === 'A+' || currentEvaluation.grade === 'A'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : currentEvaluation.grade === 'B'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          Grade: {currentEvaluation.grade}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Weighted composite score across STAR framing, technical depth, and delivery
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                      {currentEvaluation.overallScore}
                      <span className="text-sm font-normal text-slate-400">/100</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                      Confidence Level: High
                    </div>
                  </div>
                </div>

                {/* 4-Part STAR Breakdown Progress Bars */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>STAR Structural Breakdown</span>
                    <span className="text-slate-400">Target: 25 pts each</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-indigo-400 font-semibold">Situation</span>
                        <span className="font-mono text-slate-200">{currentEvaluation.starBreakdown.situationScore}/25</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${(currentEvaluation.starBreakdown.situationScore / 25) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-cyan-400 font-semibold">Task</span>
                        <span className="font-mono text-slate-200">{currentEvaluation.starBreakdown.taskScore}/25</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${(currentEvaluation.starBreakdown.taskScore / 25) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-emerald-400 font-semibold">Action</span>
                        <span className="font-mono text-slate-200">{currentEvaluation.starBreakdown.actionScore}/25</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${(currentEvaluation.starBreakdown.actionScore / 25) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-amber-400 font-semibold">Result</span>
                        <span className="font-mono text-slate-200">{currentEvaluation.starBreakdown.resultScore}/25</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${(currentEvaluation.starBreakdown.resultScore / 25) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary Metrics: Technical Depth & Communication */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-semibold">Technical Depth & Accuracy</span>
                      <span className="font-mono text-cyan-400 font-bold">{currentEvaluation.technicalDepthScore}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${currentEvaluation.technicalDepthScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-semibold">Communication & Conciseness</span>
                      <span className="font-mono text-indigo-400 font-bold">{currentEvaluation.communicationScore}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${currentEvaluation.communicationScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Strengths & Growth Areas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Key Strengths
                    </span>
                    <ul className="space-y-1.5">
                      {currentEvaluation.strengths.map((str, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Elevate Your Answer
                    </span>
                    <ul className="space-y-1.5">
                      {currentEvaluation.growthAreas.map((area, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Pacing Feedback */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <Timer className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="text-xs text-slate-300">
                    <strong className="text-indigo-300">Pacing Advisor: </strong>
                    {currentEvaluation.pacingFeedback}
                  </div>
                </div>

                {/* Model Exemplar Comparison Box */}
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Gold-Standard Model Exemplar
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyModelAnswer}
                      className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      {copiedText ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Answer
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                    "{currentEvaluation.modelAnswer}"
                  </p>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* Session History Tab */}
      {activeTab === 'history' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                Practice Session History & Performance Log
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Past mock interview rounds, score progressions, and recorded responses
              </p>
            </div>
          </div>

          {savedSessions.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium">No recorded practice sessions yet.</p>
              <p className="text-xs text-slate-500 mt-1">Complete your first mock interview above to track score trends!</p>
              <button
                type="button"
                onClick={() => setActiveTab('practice')}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Launch Mock Session
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSessions.map((session) => (
                <div 
                  key={session.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">
                        {session.companyName}
                      </span>
                      <span className="text-xs text-slate-400">• {session.roleTitle}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {session.roundType.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      "{session.question.questionText}"
                    </p>
                    <div className="text-[11px] text-slate-500">
                      {new Date(session.timestamp).toLocaleDateString()} • {session.durationSeconds}s duration
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {session.evaluation && (
                      <div className="text-right">
                        <div className="text-lg font-bold font-mono text-indigo-300">
                          {session.evaluation.overallScore}/100
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Grade: {session.evaluation.grade}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOppId(session.opportunityId);
                        setSelectedRoundType(session.roundType);
                        setCurrentQuestion(session.question);
                        setCandidateResponse(session.candidateResponse);
                        setCurrentEvaluation(session.evaluation || null);
                        setActiveTab('practice');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-medium transition-all"
                    >
                      Review
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSession(session.id)}
                      title="Delete Session"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

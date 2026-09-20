/**
 * TERRASYNX: Master Application Core
 * Conforming strictly to SYSTEM_SPEC (Rules #1-#5, Req #1-#22)
 */

import React, { useState, useEffect } from 'react';
import { Opportunity, OperationalMode, ApplicationStage, StudentProfile } from './types';
import { RadarEngine } from './services/radarEngine';
import { Header } from './components/Header';
import { RadarView } from './components/RadarView';
import { KanbanPipeline } from './components/KanbanPipeline';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { CopilotGuideModal } from './components/CopilotGuideModal';
import { VerificationAuditModal } from './components/VerificationAuditModal';
import { FitmentStudioView } from './components/FitmentStudioView';
import { ResumeCrafterView } from './components/ResumeCrafterView';
import { AssessmentVaultModal } from './components/AssessmentVaultModal';
import { AlertRelayView } from './components/AlertRelayView';
import { CompanyLogo } from './components/CompanyLogo';
import { FastApplyModal } from './components/FastApplyModal';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { InsiderBridgeView } from './components/InsiderBridgeView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { CalendarSyncView } from './components/CalendarSyncView';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { SystemAuditModal } from './components/SystemAuditModal';
import { DossierModal } from './components/DossierModal';
import { AppliedDossierVaultModal } from './components/AppliedDossierVaultModal';
import { MockInterviewStudioView } from './components/MockInterviewStudioView';
import { OfferEvaluatorView } from './components/OfferEvaluatorView';
import { CareerLaunchpadView } from './components/CareerLaunchpadView';
import { NetworkGraphView } from './components/NetworkGraphView';
import { RecruiterRadarView } from './components/RecruiterRadarView';
import { ReferralTrackerView } from './components/ReferralTrackerView';
import { UpcomingInternshipsCalendar } from './components/UpcomingInternshipsCalendar';
import { HeartbeatScheduler } from './services/heartbeatScheduler';
import { 
  signInWithGoogle, 
  signOutStudent, 
  saveStudentProfileToFirestore, 
  loadStudentProfileFromFirestore, 
  onAuthUserChanged 
} from './firebaseConfig';
import type { User as FirebaseUser } from 'firebase/auth';
import { 
  Radar, 
  Cpu, 
  FileText, 
  BellRing, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  Mail, 
  Send,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  Lock
} from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<OperationalMode>('radar');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(RadarEngine.getStudentProfile());
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [inspectedOpp, setInspectedOpp] = useState<Opportunity | null>(null);
  const [assessmentOpp, setAssessmentOpp] = useState<Opportunity | null>(null);
  const [fastApplyOpp, setFastApplyOpp] = useState<Opportunity | null>(null);
  const [selectedDossierOpp, setSelectedDossierOpp] = useState<Opportunity | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isDossierVaultOpen, setIsDossierVaultOpen] = useState<boolean>(false);
  const [mutedAlertIds, setMutedAlertIds] = useState<string[]>([]);
  const [simulatedEmails, setSimulatedEmails] = useState(RadarEngine.getSimulatedEmails());

  // Global Tactical Keyboard Navigation & Hotkeys Router (Phase 4 Point 3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is actively inputting in a text input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // Escape key immediately dismisses any open modal or drawer
      if (e.key === 'Escape') {
        setSelectedOpp(null);
        setInspectedOpp(null);
        setAssessmentOpp(null);
        setFastApplyOpp(null);
        setSelectedDossierOpp(null);
        setIsCopilotOpen(false);
        setIsShortcutsOpen(false);
        setIsAuditModalOpen(false);
        setIsDossierVaultOpen(false);
        return;
      }

      // Hotkey '?' or 'Cmd+K' / 'Ctrl+K': Toggle Tactical Shortcuts modal
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
        return;
      }

      // Hotkey 'Shift + C': Toggle Production Certification & System Audit modal
      if (e.shiftKey && e.key.toUpperCase() === 'C') {
        e.preventDefault();
        setIsAuditModalOpen(prev => !prev);
        return;
      }

      // Numeric hotkeys '1' to '0' & 'm' for instant zero-latency view routing
      const keyMap: Record<string, OperationalMode> = {
        '1': 'radar',
        '2': 'pipeline',
        '3': 'evaluator',
        '4': 'resume',
        '5': 'alerts',
        '6': 'insider',
        '7': 'profile',
        '8': 'analytics',
        '9': 'calendar',
        '0': 'mock_interview',
        'm': 'mock_interview',
        'M': 'mock_interview',
        'o': 'offer_evaluator',
        'O': 'offer_evaluator',
        'l': 'career_launchpad',
        'L': 'career_launchpad',
        'n': 'network_graph',
        'N': 'network_graph',
        'r': 'recruiter_radar',
        'R': 'recruiter_radar',
        't': 'referral_tracker',
        'T': 'referral_tracker',
      };

      if (keyMap[e.key]) {
        setCurrentMode(keyMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize Core Radar Engine & subscribe to real-time live pulse (Strict Rule #3)
  useEffect(() => {
    RadarEngine.init();
    HeartbeatScheduler.init();

    const updateState = () => {
      setOpportunities(RadarEngine.getActiveRadarOpportunities());
      setStudentProfile(RadarEngine.getStudentProfile());
      setMutedAlertIds(RadarEngine.getMutedAlerts());
      setSimulatedEmails(RadarEngine.getSimulatedEmails());
    };

    updateState();
    const unsubscribe = RadarEngine.subscribe(updateState);
    return () => unsubscribe();
  }, []);

  // Firebase Authentication & Firestore Cloud Profile Synchronization
  useEffect(() => {
    const unsubscribe = onAuthUserChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const cloudProfile = await loadStudentProfileFromFirestore(user.uid);
          if (cloudProfile) {
            RadarEngine.updateStudentProfile(cloudProfile);
            setStudentProfile(RadarEngine.getStudentProfile());
          } else {
            // First time student logs in: seed their profile with their Google credentials and persist to Firestore
            const local = RadarEngine.getStudentProfile();
            const initialSeed: Partial<StudentProfile> = {
              fullName: user.displayName || local.fullName || 'Student Candidate',
              email: user.email || local.email,
            };
            await saveStudentProfileToFirestore(user.uid, initialSeed);
            RadarEngine.updateStudentProfile(initialSeed);
            setStudentProfile(RadarEngine.getStudentProfile());
          }
        } catch (err) {
          console.error('Failed to sync student record with Firestore:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Handlers
  const handleMarkApplied = (jobId: string) => {
    RadarEngine.updateStage(jobId, 'applied');
  };

  const handleUpdateStage = (jobId: string, nextStage: ApplicationStage, notes?: string) => {
    RadarEngine.updateStage(jobId, nextStage, notes);
  };

  const handleResetFactory = () => {
    if (window.confirm('Sync fresh canonical feed and reset demo states?')) {
      RadarEngine.resetToFactoryDefaults();
    }
  };

  const handleUpdateProfile = async (updated: Partial<StudentProfile>) => {
    RadarEngine.updateStudentProfile(updated);
    setStudentProfile(RadarEngine.getStudentProfile());
    if (currentUser) {
      try {
        await saveStudentProfileToFirestore(currentUser.uid, updated);
      } catch (err) {
        console.error('Error saving updated student profile to Firestore:', err);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign-in error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutStudent();
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  // Metrics calculation
  const totalActive = opportunities.length;
  const urgentCount = opportunities.filter(o => {
    const h = (o.deadlineAt - Date.now()) / (1000 * 60 * 60);
    return h <= 72 && h > 0;
  }).length;
  const appliedCount = opportunities.filter(o => o.stage !== 'discovered' && o.stage !== 'archived').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Global Command Deck & Navigation */}
      <Header
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        totalActiveCount={totalActive}
        urgentCount={urgentCount}
        appliedCount={appliedCount}
        studentBatch={`Batch ${studentProfile.graduationYear}`}
        onResetFactory={handleResetFactory}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        onOpenDossierVault={() => setIsDossierVaultOpen(true)}
        currentUser={currentUser}
        onSignInWithGoogle={handleGoogleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Main Tactical Workstation Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* MODE 1: Opportunity Radar View */}
        {currentMode === 'radar' && (
          <RadarView
            opportunities={opportunities}
            onMarkApplied={handleMarkApplied}
            onOpenDetails={setSelectedOpp}
            onInspectVerification={setInspectedOpp}
            onFastApply={setFastApplyOpp}
            onOpenDossier={setSelectedDossierOpp}
            mutedAlertIds={mutedAlertIds}
          />
        )}

        {/* MODE 2: Execution Kanban Pipeline */}
        {currentMode === 'pipeline' && (
          <KanbanPipeline
            opportunities={opportunities}
            onUpdateStage={handleUpdateStage}
            onOpenDetails={setSelectedOpp}
            onFastApply={setFastApplyOpp}
            onOpenDossierVault={() => setIsDossierVaultOpen(true)}
            onOpenMockInterview={(opp) => {
              setSelectedOpp(opp);
              setCurrentMode('mock_interview');
            }}
            onOpenOfferEvaluator={(opp) => {
              setSelectedOpp(opp);
              setCurrentMode('offer_evaluator');
            }}
            onOpenCareerLaunchpad={() => setCurrentMode('career_launchpad')}
          />
        )}

        {/* MODE 3: 10-D Fitment Studio (Oferta Inspired) */}
        {currentMode === 'evaluator' && (
          <FitmentStudioView
            opportunities={opportunities}
            studentProfile={studentProfile}
            onOpenDetails={setSelectedOpp}
            onMarkApplied={handleMarkApplied}
          />
        )}

        {/* MODE 4: ATS Resume Crafter (Req #13 & Strict Rule #1) */}
        {currentMode === 'resume' && (
          <ResumeCrafterView
            opportunities={opportunities}
            studentProfile={studentProfile}
            onOpenDetails={setSelectedOpp}
          />
        )}

        {/* MODE 5: Real-Time 4-Tier Simulated Email & Alert Relay (Req #5, #6, #7, #10) */}
        {currentMode === 'alerts' && (
          <AlertRelayView
            opportunities={opportunities}
            studentProfile={studentProfile}
            simulatedEmails={simulatedEmails}
            mutedAlertIds={mutedAlertIds}
            onOpenDetails={setSelectedOpp}
            onMarkApplied={handleMarkApplied}
          />
        )}

        {/* MODE 6: Alumni & Insider Bridge Studio (Req #15 & Phase 3 Point 3) */}
        {currentMode === 'insider' && (
          <InsiderBridgeView
            opportunities={opportunities}
            studentProfile={studentProfile}
            onOpenDetails={setSelectedOpp}
            onNavigateToPipeline={() => setCurrentMode('pipeline')}
          />
        )}

        {/* MODE 7: Candidate Profile & Context Studio (Phase 3 Point 2 / Req #18) */}
        {currentMode === 'profile' && (
          <ProfileSettingsView
            profile={studentProfile}
            currentUser={currentUser}
            onSignInWithGoogle={handleGoogleSignIn}
            onUpdateProfile={handleUpdateProfile}
            onResetDefaults={() => {
              RadarEngine.resetToFactoryDefaults();
            }}
          />
        )}

        {/* MODE: Seasonal Internships Portal (Ongoing Applications & Upcoming Predictable Recruitment Calendar) */}
        {currentMode === 'internship_calendar' && (
          <div className="space-y-6">
            <UpcomingInternshipsCalendar
              onNavigateToCalendar={() => setCurrentMode('calendar')}
            />
          </div>
        )}

        {/* MODE 8: Real-Time Application Telemetry & Conversion Dashboard (Phase 4 Point 1) */}
        {currentMode === 'analytics' && (
          <AnalyticsDashboardView
            opportunities={opportunities}
            studentProfile={studentProfile}
            onNavigateToPipeline={() => setCurrentMode('pipeline')}
            onNavigateToRadar={() => setCurrentMode('radar')}
          />
        )}

        {/* MODE 9: Automated Assessment & Interview Calendar Sync / Scheduler (Phase 4 Point 2) */}
        {currentMode === 'calendar' && (
          <CalendarSyncView
            opportunities={opportunities}
            studentProfile={studentProfile}
            onOpenOpportunity={setSelectedOpp}
            onNavigateToPipeline={() => setCurrentMode('pipeline')}
          />
        )}

        {/* MODE 10: Mock Interview Studio & Real-Time STAR Coach (Phase 7 Point 1) */}
        {currentMode === 'mock_interview' && (
          <MockInterviewStudioView
            opportunities={opportunities}
            studentProfile={studentProfile}
            initialOpportunityId={selectedOpp?.id}
            onOpenDetails={setSelectedOpp}
            onNavigateToPipeline={() => setCurrentMode('pipeline')}
            onNavigateToOfferEvaluator={() => setCurrentMode('offer_evaluator')}
          />
        )}

        {/* MODE 11: Offer Evaluator & Negotiation Studio (Phase 7 Point 2) */}
        {currentMode === 'offer_evaluator' && (
          <OfferEvaluatorView
            opportunities={opportunities}
            studentProfile={studentProfile}
            initialSelectedOfferId={undefined}
            onNavigateToPipeline={() => setCurrentMode('pipeline')}
            onNavigateToLaunchpad={() => setCurrentMode('career_launchpad')}
          />
        )}

        {/* MODE 12: Career Launchpad & Executive Onboarding Studio (Phase 7 Point 3) */}
        {currentMode === 'career_launchpad' && (
          <CareerLaunchpadView
            opportunities={opportunities}
            studentProfile={studentProfile}
            onNavigateToPipeline={() => setCurrentMode('pipeline')}
            onNavigateToOfferEvaluator={() => setCurrentMode('offer_evaluator')}
          />
        )}

        {/* MODE 13: Alumni Referral Network Graph & Warm Path Matrix (Phase 8 Point 1) */}
        {currentMode === 'network_graph' && (
          <NetworkGraphView
            opportunities={opportunities}
            studentProfile={studentProfile}
            onNavigateToPipeline={() => setCurrentMode('pipeline')}
            onOpenOpportunity={setSelectedOpp}
          />
        )}

        {/* MODE 14: Recruiter Intelligence Dossier & Headhunter Outreach Radar (Phase 8 Point 2) */}
        {currentMode === 'recruiter_radar' && (
          <RecruiterRadarView
            opportunities={opportunities}
            studentProfile={studentProfile}
            onNavigateToPipeline={() => setCurrentMode('pipeline')}
            onOpenOpportunity={setSelectedOpp}
          />
        )}

        {/* MODE 15: Referral Lifecycle Tracker & Back-Channel Reconciler (Phase 8 Point 3) */}
        {currentMode === 'referral_tracker' && (
          <ReferralTrackerView
            opportunities={opportunities}
            studentProfile={studentProfile}
            onNavigateToPipeline={() => setCurrentMode('pipeline')}
            onOpenOpportunity={setSelectedOpp}
          />
        )}

      </main>

      {/* Footer & Mobile Quick Touch Deck (>=44px touch targets) */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 px-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            TERRASYNX Global Intelligence System • Autonomous Early-Career Radar • 100% Cryptographic Verification
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="min-h-[44px] sm:min-h-0 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Hotkeys (⌘K)</span>
            </button>
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="min-h-[44px] sm:min-h-0 px-3 py-1.5 rounded-lg bg-teal-950/60 hover:bg-teal-900/60 text-teal-300 border border-teal-800/60 flex items-center gap-1.5 transition-colors cursor-pointer font-bold"
            >
              <span>Audit Suite</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Tactical Keyboard Shortcuts & Command Deck Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        onNavigate={setCurrentMode}
        onOpenAudit={() => setIsAuditModalOpen(true)}
      />

      {/* Production Certification & System Audit Modal (Phase 4 Point 3) */}
      <SystemAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        opportunities={opportunities}
        studentProfile={studentProfile}
      />

      {/* Opportunity Detail & Assessment Intel Modal */}
      <OpportunityDetailModal
        opportunity={selectedOpp}
        onClose={() => setSelectedOpp(null)}
        onMarkApplied={handleMarkApplied}
        onOpenAssessmentVault={setAssessmentOpp}
        onOpenInsiderBridge={(opp) => {
          setSelectedOpp(null);
          setCurrentMode('insider');
        }}
        onOpenCalendar={(opp) => {
          setSelectedOpp(null);
          setCurrentMode('calendar');
        }}
        onFastApply={setFastApplyOpp}
        onOpenDossier={(opp) => {
          setSelectedOpp(null);
          setSelectedDossierOpp(opp);
        }}
        onOpenMockInterview={(opp) => {
          setSelectedOpp(opp);
          setCurrentMode('mock_interview');
        }}
        onOpenOfferEvaluator={(opp) => {
          setSelectedOpp(opp);
          setCurrentMode('offer_evaluator');
        }}
        onOpenCareerLaunchpad={() => {
          setSelectedOpp(null);
          setCurrentMode('career_launchpad');
        }}
        onOpenNetworkGraph={(opp) => {
          setSelectedOpp(opp);
          setCurrentMode('network_graph');
        }}
        onOpenRecruiterRadar={(opp) => {
          setSelectedOpp(opp);
          setCurrentMode('recruiter_radar');
        }}
        isApplied={selectedOpp ? selectedOpp.stage !== 'discovered' && selectedOpp.stage !== 'archived' : false}
      />

      {/* Smart Auto-Fill Assistant Modal (Req #4 & #17) */}
      <FastApplyModal
        opportunity={fastApplyOpp}
        studentProfile={studentProfile}
        isOpen={Boolean(fastApplyOpp)}
        onClose={() => setFastApplyOpp(null)}
        onNavigateToPipeline={() => setCurrentMode('pipeline')}
      />

      {/* In-App Friendly Copilot Guide Modal (Req #22) */}
      <CopilotGuideModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        studentProfile={studentProfile}
      />

      {/* Cryptographic Authenticity Proof Modal (Strict Rule #2) */}
      <VerificationAuditModal
        opportunity={inspectedOpp}
        onClose={() => setInspectedOpp(null)}
      />

      {/* Tactical Assessment Intelligence & Warm-up Vault Modal (Req #16) */}
      <AssessmentVaultModal
        opportunity={assessmentOpp}
        onClose={() => setAssessmentOpp(null)}
      />

      {/* Santiago 8-Block (A to H) Deep Reasoning Dossier Modal (Phase 5 Point 2) */}
      {selectedDossierOpp && (
        <DossierModal
          opportunity={selectedDossierOpp}
          profile={studentProfile}
          onClose={() => setSelectedDossierOpp(null)}
          onFastApply={(opp) => {
            setSelectedDossierOpp(null);
            setFastApplyOpp(opp);
          }}
          onTailorResume={(opp) => {
            setSelectedDossierOpp(null);
            setCurrentMode('resume');
          }}
        />
      )}

      {/* Permanent Applied Dossier Archive & Workspace Snapshot Vault (Req #8 & #12) */}
      <AppliedDossierVaultModal
        isOpen={isDossierVaultOpen}
        onClose={() => setIsDossierVaultOpen(false)}
        studentProfile={studentProfile}
        opportunities={opportunities}
        mutedAlertIds={mutedAlertIds}
        onSelectOpportunity={(opp) => {
          setIsDossierVaultOpen(false);
          setSelectedOpp(opp);
        }}
      />

    </div>
  );
}

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InterviewStoryBankService } from '../services/interviewStoryBankService';
import { MockInterviewSession, MockInterviewQuestion, StudentProfile, InterviewStory } from '../types';

// Mock localStorage for test environment
const mockStorage: Record<string, string> = {};
const testLocalStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = String(val);
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k of Object.keys(mockStorage)) delete mockStorage[k];
  },
};

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: testLocalStorage,
    writable: true,
  });
}

const mockQuestion: MockInterviewQuestion = {
  id: 'q_test_1',
  roundType: 'behavioral_star',
  roleArchetype: 'Distributed Systems & Cloud Platform',
  companyName: 'Stripe',
  interviewerPersona: 'Lead Architect',
  interviewerTitle: 'Staff Engineer',
  questionText: 'Tell me about a high-concurrency production incident or data race you resolved.',
  contextScenario: 'Handling high financial throughput with zero double writes.',
  recommendedDurationSeconds: 150,
  criticalKeywords: ['idempotency', 'distributed lock', 'race condition', 'rollback', 'redis'],
  starPrompts: {
    situationPrompt: 'Describe the payment workflow',
    taskPrompt: 'Your responsibility',
    actionPrompt: 'What locking or key strategy you used',
    resultPrompt: 'Quantify metrics',
  },
  exemplarAnswer: 'At my internship, we had duplicate webhooks...',
};

const mockSession: MockInterviewSession = {
  id: 'sess_12345',
  timestamp: Date.now(),
  opportunityId: 'opp_stripe_sys',
  companyName: 'Stripe',
  roleTitle: 'Software Engineer - Infrastructure',
  roundType: 'behavioral_star',
  question: mockQuestion,
  candidateResponse: `Situation: During payment webhook processing, duplicate provider callbacks caused a 4% credit spike under a network partition.
Task: My objective was to enforce exactly-once processing semantics without degrading the 85ms SLA.
Action: I implemented Redis-backed distributed locks with 60-second TTLs keyed on SHA-256 payload digests and database unique constraints.
Result: Duplicate ledger events dropped to zero across 2.4M daily transactions, while p99 latency dropped to 68ms.`,
  durationSeconds: 140,
  evaluation: {
    overallScore: 92,
    grade: 'A',
    starBreakdown: {
      situationScore: 23,
      taskScore: 22,
      actionScore: 24,
      resultScore: 23,
    },
    technicalDepthScore: 90,
    communicationScore: 88,
    matchedKeywords: ['idempotency', 'distributed lock', 'redis'],
    missingKeywords: ['rollback'],
    strengths: ['Clear metric impact', 'Distributed locking strategy'],
    growthAreas: ['Mention error circuit breakers'],
    modelAnswer: 'Exemplar text',
    pacingFeedback: 'Optimal cadence',
  },
};

describe('InterviewStoryBankService (Prompt 16)', () => {
  beforeEach(() => {
    testLocalStorage.clear();
    vi.restoreAllMocks();
  });

  describe('extractStarComponents', () => {
    it('correctly parses explicit Situation, Task, Action, and Result headers', () => {
      const extracted = InterviewStoryBankService.extractStarComponents(
        mockSession.candidateResponse,
        mockSession.question.questionText
      );

      expect(extracted.situation).toContain('During payment webhook processing');
      expect(extracted.task).toContain('My objective was to enforce');
      expect(extracted.action).toContain('I implemented Redis-backed distributed locks');
      expect(extracted.result).toContain('Duplicate ledger events dropped to zero');
      expect(extracted.metrics.length).toBeGreaterThan(0);
      expect(extracted.metrics.some(m => m.includes('4%') || m.includes('2.4M') || m.includes('68ms'))).toBe(true);
    });

    it('falls back to sentence-based heuristic segmentation if headers are omitted', () => {
      const rawText = 'We were building an e-commerce checkout when database locks timed out. My goal was to fix the bottleneck before Black Friday. I redesigned the database indexes and added connection pooling. This reduced checkout latency by 60% and handled 10,000 QPS.';
      const extracted = InterviewStoryBankService.extractStarComponents(rawText, 'Describe a bottleneck');

      expect(extracted.situation).toBeTruthy();
      expect(extracted.task).toBeTruthy();
      expect(extracted.action).toBeTruthy();
      expect(extracted.result).toBeTruthy();
      expect(extracted.metrics.some(m => m.includes('60%') || m.includes('10,000 QPS'))).toBe(true);
    });
  });

  describe('isQualityStoryCandidate', () => {
    it('identifies A and B grade sessions as quality story candidates', () => {
      expect(InterviewStoryBankService.isQualityStoryCandidate(mockSession.evaluation)).toBe(true);
      expect(InterviewStoryBankService.isQualityStoryCandidate({
        overallScore: 68,
        grade: 'B',
        starBreakdown: { situationScore: 18, taskScore: 16, actionScore: 18, resultScore: 16 },
        technicalDepthScore: 70,
        communicationScore: 65,
        matchedKeywords: [],
        missingKeywords: [],
        strengths: [],
        growthAreas: [],
        modelAnswer: '',
        pacingFeedback: '',
      })).toBe(true);
    });

    it('rejects low-scoring incomplete sessions', () => {
      expect(InterviewStoryBankService.isQualityStoryCandidate({
        overallScore: 45,
        grade: 'D',
        starBreakdown: { situationScore: 10, taskScore: 10, actionScore: 10, resultScore: 10 },
        technicalDepthScore: 40,
        communicationScore: 45,
        matchedKeywords: [],
        missingKeywords: [],
        strengths: [],
        growthAreas: [],
        modelAnswer: '',
        pacingFeedback: '',
      })).toBe(false);
    });
  });

  describe('createStoryFromSession', () => {
    it('transforms session into a complete InterviewStory record with metrics and tags', () => {
      const story = InterviewStoryBankService.createStoryFromSession(mockSession, 'student_test_user');

      expect(story.id).toContain('story_sess_12345');
      expect(story.userId).toBe('student_test_user');
      expect(story.companyName).toBe('Stripe');
      expect(story.roleArchetype).toBe('Distributed Systems & Cloud Platform');
      expect(story.starAction).toContain('Redis-backed distributed locks');
      expect(story.score).toBe(92);
      expect(story.grade).toBe('A');
      expect(story.tags).toContain('idempotency');
      expect(story.isStarred).toBe(true); // >= 88 is starred
    });
  });

  describe('suggestBestStoriesForRole (Role-Based Match Suggester)', () => {
    it('ranks stories matching target company and role keywords at the top', () => {
      const stories: InterviewStory[] = [
        InterviewStoryBankService.createStoryFromSession(mockSession, 'student_test_user'),
        {
          id: 'story_frontend_react',
          userId: 'student_test_user',
          title: 'Design System Accessibility Refactor',
          companyName: 'Airbnb',
          roleArchetype: 'Frontend & UI Engineering',
          roundType: 'behavioral_star',
          questionPrompt: 'Describe a UI accessibility challenge.',
          starSituation: 'Design tokens lacked contrast.',
          starTask: 'Audit WCAG AA compliance.',
          starAction: 'Migrated CSS tokens and added axe automated tests.',
          starResult: 'Zero accessibility violations across 50 components.',
          fullNarrative: 'Full narrative text...',
          tags: ['React', 'CSS', 'Accessibility', 'Design Systems'],
          targetRoles: ['Frontend Engineer', 'UI Engineer'],
          score: 88,
          grade: 'A',
          metricsMentioned: ['zero violations', '50 components'],
          strengths: ['UI rigor'],
          growthAreas: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
      ];

      // Target role: Stripe Backend / Infrastructure
      const suggestions = InterviewStoryBankService.suggestBestStoriesForRole(
        'Stripe Software Engineer - Infrastructure',
        'Requirements: distributed systems, Redis, high concurrency, idempotency',
        stories
      );

      expect(suggestions.length).toBe(2);
      expect(suggestions[0].story.id).toContain('story_sess_12345');
      expect(suggestions[0].matchScore).toBeGreaterThan(suggestions[1].matchScore);
      expect(suggestions[0].matchReasons.some(r => r.includes('alignment') || r.includes('keywords'))).toBe(true);
      expect(suggestions[0].recommendedPitchAngle).toBeTruthy();
    });
  });

  describe('Local CRUD Persistence (Rule #20 Offline Resilience)', () => {
    it('saves, retrieves, updates, and deletes stories from the repository', async () => {
      const initialStory = InterviewStoryBankService.createStoryFromSession(mockSession, 'student_test_user');

      await InterviewStoryBankService.saveStory(initialStory, 'student_test_user');

      const loaded = await InterviewStoryBankService.getStories('student_test_user');
      expect(loaded.some(s => s.id === initialStory.id)).toBe(true);

      // Update story
      await InterviewStoryBankService.updateStory(
        initialStory.id, 
        { title: 'Refined Idempotency Story' }, 
        'student_test_user'
      );
      const afterUpdate = await InterviewStoryBankService.getStories('student_test_user');
      const updatedStory = afterUpdate.find(s => s.id === initialStory.id);
      expect(updatedStory?.title).toBe('Refined Idempotency Story');

      // Toggle Star
      const starredState = await InterviewStoryBankService.toggleStar(initialStory.id, 'student_test_user');
      expect(starredState).toBe(false); // was true, now false

      // Delete Story
      await InterviewStoryBankService.deleteStory(initialStory.id, 'student_test_user');
      const afterDelete = await InterviewStoryBankService.getStories('student_test_user');
      expect(afterDelete.some(s => s.id === initialStory.id)).toBe(false);
    });
  });
});

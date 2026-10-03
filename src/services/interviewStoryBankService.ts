/**
 * TERRASYNX: Reusable Interview Story Bank Service (Prompt 16)
 * Converts high-grade STAR answers from mock interview sessions into a persistent,
 * editable story repository backed by Firestore (under the student's profile) with
 * 100% offline fallback in LocalStorage (Rule #20).
 *
 * Implements TERRASYNX reusable story bank architecture with role-based match suggestion.
 */

import { 
  InterviewStory, 
  StoryMatchSuggestion, 
  MockInterviewSession, 
  MockInterviewEvaluation, 
  StudentProfile 
} from '../types';
import { db, auth } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  serverTimestamp,
  type DocumentData
} from 'firebase/firestore';
import { logger } from '../utils/logger';

const STORAGE_KEY_STORIES = 'terrasynx_interview_stories_v1';

// Seed starter stories for immediate high-signal student demonstration
const SEED_STORIES: InterviewStory[] = [
  {
    id: 'seed_story_stripe_idempotency',
    userId: 'system_seed',
    title: 'Distributed Data Race & Idempotency Key Pipeline',
    companyName: 'Stripe',
    roleArchetype: 'Distributed Systems & Financial Infrastructure',
    roundType: 'behavioral_star',
    questionPrompt: 'Tell me about a high-concurrency production incident or distributed data race you diagnosed. How did you maintain strict idempotency and zero data corruption?',
    starSituation: 'During payment webhook receiver processing, duplicate provider callbacks spiked by 4% under a cross-datacenter network partition, threatening duplicate ledger balance writes.',
    starTask: 'As the backend infrastructure contributor, my objective was to enforce strict exactly-once processing semantics without degrading the 85ms p99 SLA.',
    starAction: 'I engineered Redis-backed distributed locks with 60-second TTLs keyed on SHA-256 payload digests, paired with database unique constraints on transaction IDs and exponential backoff retry jitter.',
    starResult: 'Duplicate ledger events dropped to exactly zero across 2.4 million daily transactions, while p99 latency held steady at 68ms.',
    fullNarrative: 'At my previous internship, our payment webhook receiver processed duplicate provider callbacks during a network partition, causing a 4% duplicate credit spike. As the backend owner, my goal was to enforce strict exactly-once processing semantics without degrading the 85ms SLA. I implemented Redis-backed distributed locks with 60-second TTLs keyed on SHA-256 payload digests, paired with database unique constraints on transaction IDs and exponential backoff retry jitter. As a result, duplicate ledger events dropped to exactly zero across 2.4 million daily events, while p99 latency remained steady at 68ms.',
    tags: ['Distributed Systems', 'Idempotency', 'Redis Locks', 'PostgreSQL', 'High Concurrency', 'Zero Data Loss'],
    targetRoles: ['Backend Engineer', 'Infrastructure Engineer', 'Distributed Systems', 'Payments Platform'],
    score: 95,
    grade: 'A+',
    metricsMentioned: ['4% duplicate spike averted', '2.4M daily transactions', '68ms p99 latency', 'zero duplicate events'],
    strengths: ['Clear quantifiable business impact', 'Deep distributed locking strategy', 'Strong proactive ownership'],
    growthAreas: ['Highlight how failure modes like Redis eviction were handled'],
    sourceSessionId: 'seed_session_01',
    isStarred: true,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'seed_story_openai_kvcache',
    userId: 'system_seed',
    title: 'Streaming Inference KV-Cache Memory Quantization',
    companyName: 'OpenAI',
    roleArchetype: 'AI/ML Infrastructure & Model Platform',
    roundType: 'behavioral_star',
    questionPrompt: 'Describe a project where you had to push through severe technical ambiguity or conflicting performance trade-offs under tight timeline constraints.',
    starSituation: 'While building an on-premise LLM serving cluster, we faced severe GPU memory exhaustion during long-context queries exceeding 16k tokens, threatening an upcoming product demo.',
    starTask: 'My goal was to resolve the GPU memory bottleneck in under 7 days without degrading model perplexity or increasing time-to-first-token beyond 180ms.',
    starAction: 'I constructed a vLLM synthetic traffic benchmark comparing FP8 dynamic quantization against KV-cache eviction. Verified 8-bit KV-cache quantization incurred <0.2% perplexity loss while halving VRAM requirements, and led the team rollout in 48 hours.',
    starResult: 'Scaled maximum batch concurrency by 2.4x on identical hardware, reduced time-to-first-token to 118ms, and eliminated the need for an emergency $45k GPU cluster expansion.',
    fullNarrative: 'While building an on-premise LLM serving cluster, we faced severe GPU memory exhaustion during long-context queries exceeding 16k tokens. With a demo deadline in 7 days, there was ambiguity between migrating to FP8 quantization vs dynamic KV-cache eviction. I benchmarked both under synthetic traffic loads using vLLM harnesses. I discovered that 8-bit KV-cache quantization caused negligible perplexity degradation (<0.2%) while halving VRAM requirements. I led the migration in 48 hours, scaling maximum batch concurrency by 2.4x and preventing costly cluster expansion.',
    tags: ['AI Infrastructure', 'LLM Inference', 'vLLM', 'GPU VRAM', 'Quantization', 'Benchmarking'],
    targetRoles: ['AI Systems Engineer', 'ML Infrastructure Engineer', 'Performance Engineer', 'Backend SWE'],
    score: 93,
    grade: 'A+',
    metricsMentioned: ['2.4x batch concurrency', '<0.2% perplexity degradation', '118ms TTFT', '$45k savings'],
    strengths: ['Rigorous experimental benchmarking', 'High-stakes deadline execution', 'Measurable ROI'],
    growthAreas: ['Explain how client streaming backpressure was monitored'],
    sourceSessionId: 'seed_session_02',
    isStarred: true,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'seed_story_google_kafka_vs_rabbitmq',
    userId: 'system_seed',
    title: 'Data-Driven Consensus: Messaging Architecture Benchmark',
    companyName: 'Google',
    roleArchetype: 'Cloud Systems & Scaled Infrastructure',
    roundType: 'behavioral_star',
    questionPrompt: 'Give an example of a technical disagreement or design review where you had to persuade teammates using data-driven arguments rather than seniority.',
    starSituation: 'During a backend architecture refactor, a senior staff engineer strongly advocated for Apache Kafka, whereas our resource-constrained Kubernetes nodes faced JVM memory pressure.',
    starTask: 'My task was to build technical alignment on the messaging broker without causing team friction or delaying code freeze.',
    starAction: 'Rather than arguing conceptually, I authored a load-testing harness simulating 15,000 msg/sec on both Kafka and RabbitMQ in a staging cluster, collecting telemetry on p99 latency, RAM footprint, and operational recovery.',
    starResult: 'The benchmark proved RabbitMQ delivered identical throughput with 75% lower baseline RAM consumption for our non-retained pub/sub needs. The team united behind the data, saving $1,800/month in cloud resources.',
    fullNarrative: 'During a backend redesign, a senior engineer strongly advocated for Apache Kafka for internal messaging, whereas I proposed lightweight RabbitMQ workers to avoid JVM overhead on our resource-constrained Kubernetes nodes. Rather than arguing conceptually, I built an automated load harness deploying both in a staging cluster and simulated our target 15,000 msg/sec load. The telemetry proved that Kafka consumed 4x more baseline RAM with zero latency advantage for our non-retained pub/sub requirements. I presented the metrics in a blameless RFC review; the senior engineer agreed, saving our team $1,800/month in cloud infrastructure.',
    tags: ['System Architecture', 'RabbitMQ', 'Kafka', 'Benchmarking', 'Technical Consensus', 'Kubernetes'],
    targetRoles: ['Software Engineer', 'Systems Engineer', 'Cloud Architect', 'Platform Engineer'],
    score: 91,
    grade: 'A',
    metricsMentioned: ['15,000 msg/sec load', '75% lower RAM', '$1,800/month savings'],
    strengths: ['Blameless engineering culture', 'Empirical benchmarking over opinion', 'Cost awareness'],
    growthAreas: ['Detail long-term retention trade-offs considered'],
    sourceSessionId: 'seed_session_03',
    isStarred: false,
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
  }
];

export class InterviewStoryBankService {
  /**
   * Evaluates if a mock interview session is high enough quality to recommend
   * or auto-save into the student's Story Bank.
   */
  public static isQualityStoryCandidate(evaluation?: MockInterviewEvaluation): boolean {
    if (!evaluation) return false;
    return evaluation.overallScore >= 65 || ['A+', 'A', 'B'].includes(evaluation.grade);
  }

  /**
   * Synthesizes structured STAR components from raw session response
   */
  public static extractStarComponents(
    response: string, 
    questionPrompt: string
  ): {
    situation: string;
    task: string;
    action: string;
    result: string;
    metrics: string[];
  } {
    const text = response.trim();
    let situation = '';
    let task = '';
    let action = '';
    let result = '';

    // Check if user explicitly wrote "Situation:", "Task:", "Action:", "Result:"
    const situationMatch = text.match(/situation\s*:\s*([^]+?)(?=\btask\s*:|\baction\s*:|\bresult\s*:|$)/i);
    const taskMatch = text.match(/task\s*:\s*([^]+?)(?=\baction\s*:|\bresult\s*:|$)/i);
    const actionMatch = text.match(/action\s*:\s*([^]+?)(?=\bresult\s*:|$)/i);
    const resultMatch = text.match(/result\s*:\s*([^]+?$)/i);

    if (situationMatch && situationMatch[1]) situation = situationMatch[1].trim();
    if (taskMatch && taskMatch[1]) task = taskMatch[1].trim();
    if (actionMatch && actionMatch[1]) action = actionMatch[1].trim();
    if (resultMatch && resultMatch[1]) result = resultMatch[1].trim();

    // Fallback heuristic extraction if explicit headers are missing
    if (!situation || !task || !action || !result) {
      const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
      const total = sentences.length;

      if (total >= 4) {
        if (!situation) situation = sentences.slice(0, Math.max(1, Math.floor(total * 0.25))).join(' ');
        if (!task) task = sentences.slice(Math.max(1, Math.floor(total * 0.25)), Math.max(2, Math.floor(total * 0.45))).join(' ');
        if (!action) action = sentences.slice(Math.max(2, Math.floor(total * 0.45)), Math.max(3, Math.floor(total * 0.80))).join(' ');
        if (!result) result = sentences.slice(Math.max(3, Math.floor(total * 0.80))).join(' ');
      } else {
        situation = situation || text;
        task = task || `Demonstrated ownership on ${questionPrompt.slice(0, 60)}...`;
        action = action || 'Executed architectural changes and systematic debugging.';
        result = result || 'Delivered quantifiable engineering improvements.';
      }
    }

    // Extract quantifiable metrics
    const metricMatches = text.match(/(\d+%\s*|\d+\s*ms|\d+\s*x|\d+\s*qps|\$\d+[\d,]*|\d+\s*seconds|\d+\s*hours|zero\s+\w+|doubled|halved)/gi) || [];
    const uniqueMetrics = Array.from(new Set(metricMatches.map(m => m.trim())));

    return {
      situation: situation.trim(),
      task: task.trim(),
      action: action.trim(),
      result: result.trim(),
      metrics: uniqueMetrics,
    };
  }

  /**
   * Generates a concise title from company name, role archetype, and question context
   */
  public static generateStoryTitle(session: MockInterviewSession): string {
    const keywords = session.question.criticalKeywords || [];
    const mainKeyword = keywords.length > 0 ? keywords[0] : session.question.roleArchetype;
    const cleanKeyword = mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1);
    
    if (session.companyName) {
      return `${session.companyName}: ${cleanKeyword} Engineering Incident`;
    }
    return `${cleanKeyword} Production Resolution`;
  }

  /**
   * Transforms a completed MockInterviewSession into a reusable InterviewStory
   */
  public static createStoryFromSession(
    session: MockInterviewSession, 
    userId?: string
  ): InterviewStory {
    const star = this.extractStarComponents(session.candidateResponse, session.question.questionText);
    const evaluation = session.evaluation;
    const currentUserId = userId || (auth.currentUser ? auth.currentUser.uid : 'local_student');

    const tags = Array.from(new Set([
      ...(session.question.criticalKeywords || []),
      session.question.roleArchetype,
      session.companyName
    ])).filter(Boolean).slice(0, 8);

    const targetRoles = [
      session.roleTitle || 'Software Engineer',
      session.question.roleArchetype || 'Distributed Systems',
      'Backend Engineer',
      'Full-Stack Engineer'
    ];

    return {
      id: `story_${session.id || Date.now()}`,
      userId: currentUserId,
      title: this.generateStoryTitle(session),
      companyName: session.companyName || 'Technology Enterprise',
      roleArchetype: session.question.roleArchetype || 'Software Engineering',
      roundType: session.roundType,
      questionPrompt: session.question.questionText,
      starSituation: star.situation,
      starTask: star.task,
      starAction: star.action,
      starResult: star.result,
      fullNarrative: session.candidateResponse,
      tags,
      targetRoles,
      score: evaluation?.overallScore || 85,
      grade: evaluation?.grade || 'A',
      metricsMentioned: star.metrics.length > 0 ? star.metrics : ['Measured system yield'],
      strengths: evaluation?.strengths || ['Well-structured STAR narrative'],
      growthAreas: evaluation?.growthAreas || [],
      sourceSessionId: session.id,
      isStarred: (evaluation?.overallScore || 0) >= 88,
      createdAt: session.timestamp || Date.now(),
      updatedAt: Date.now(),
    };
  }

  // ==========================================================================
  // PERSISTENCE (FIRESTORE WITH LOCAL RESILIENCE - Rule #20)
  // ==========================================================================

  /**
   * Retrieves all saved interview stories. Merges Firestore stories (if authenticated)
   * with locally saved stories and seed starter templates.
   */
  public static async getStories(userId?: string): Promise<InterviewStory[]> {
    const localStories = this.getLocalStories();
    const effectiveUserId = userId || (auth.currentUser ? auth.currentUser.uid : null);

    // If student is authenticated with Google and Firestore is active, fetch cloud stories
    if (effectiveUserId && auth.currentUser) {
      try {
        const storiesCol = collection(db, 'students', effectiveUserId, 'stories');
        const snapshot = await getDocs(storiesCol);
        
        if (!snapshot.empty) {
          const cloudStories: InterviewStory[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as DocumentData;
            cloudStories.push({
              id: docSnap.id,
              userId: effectiveUserId,
              title: data.title || 'Untitled Story',
              companyName: data.companyName || 'Enterprise',
              roleArchetype: data.roleArchetype || 'Software Engineering',
              roundType: data.roundType || 'behavioral_star',
              questionPrompt: data.questionPrompt || '',
              starSituation: data.starSituation || '',
              starTask: data.starTask || '',
              starAction: data.starAction || '',
              starResult: data.starResult || '',
              fullNarrative: data.fullNarrative || '',
              tags: Array.isArray(data.tags) ? data.tags : [],
              targetRoles: Array.isArray(data.targetRoles) ? data.targetRoles : [],
              score: Number(data.score) || 80,
              grade: data.grade || 'B',
              metricsMentioned: Array.isArray(data.metricsMentioned) ? data.metricsMentioned : [],
              strengths: Array.isArray(data.strengths) ? data.strengths : [],
              growthAreas: Array.isArray(data.growthAreas) ? data.growthAreas : [],
              sourceSessionId: data.sourceSessionId,
              isStarred: Boolean(data.isStarred),
              createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (Number(data.createdAt) || Date.now()),
              updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : (Number(data.updatedAt) || Date.now()),
            });
          });

          // Merge cloud with local and seed
          const map = new Map<string, InterviewStory>();
          [...SEED_STORIES, ...localStories, ...cloudStories].forEach(s => map.set(s.id, s));
          return Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
        }
      } catch (err) {
        logger.warn('InterviewStoryBank', 'Firestore story load fallback to local', err);
      }
    }

    // Default to local stories merged with seeds
    const map = new Map<string, InterviewStory>();
    [...SEED_STORIES, ...localStories].forEach(s => map.set(s.id, s));
    return Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Retrieves purely local stories from localStorage
   */
  public static getLocalStories(): InterviewStory[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_STORIES);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * Persists a single story in Firestore and LocalStorage
   */
  public static async saveStory(story: InterviewStory, userId?: string): Promise<void> {
    const updatedStory: InterviewStory = {
      ...story,
      updatedAt: Date.now()
    };

    // 1. Save locally for instant offline availability
    try {
      const local = this.getLocalStories();
      const filtered = local.filter(s => s.id !== updatedStory.id);
      localStorage.setItem(STORAGE_KEY_STORIES, JSON.stringify([updatedStory, ...filtered]));
    } catch (e) {
      logger.error('InterviewStoryBank', 'Local storage write failed', e);
    }

    // 2. Persist to Firestore if user is authenticated with Google
    const effectiveUserId = userId || (auth.currentUser ? auth.currentUser.uid : null);
    if (effectiveUserId && auth.currentUser) {
      try {
        const storyRef = doc(db, 'students', effectiveUserId, 'stories', updatedStory.id);
        await setDoc(storyRef, {
          id: updatedStory.id,
          userId: effectiveUserId,
          title: updatedStory.title,
          companyName: updatedStory.companyName,
          roleArchetype: updatedStory.roleArchetype,
          roundType: updatedStory.roundType,
          questionPrompt: updatedStory.questionPrompt,
          starSituation: updatedStory.starSituation,
          starTask: updatedStory.starTask,
          starAction: updatedStory.starAction,
          starResult: updatedStory.starResult,
          fullNarrative: updatedStory.fullNarrative,
          tags: updatedStory.tags,
          targetRoles: updatedStory.targetRoles,
          score: updatedStory.score,
          grade: updatedStory.grade,
          metricsMentioned: updatedStory.metricsMentioned,
          strengths: updatedStory.strengths,
          growthAreas: updatedStory.growthAreas,
          sourceSessionId: updatedStory.sourceSessionId || null,
          isStarred: Boolean(updatedStory.isStarred),
          createdAt: updatedStory.createdAt,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        logger.info('InterviewStoryBank', `Persisted story ${updatedStory.id} in Firestore`);
      } catch (err) {
        logger.warn('InterviewStoryBank', `Firestore story save error for ${updatedStory.id}`, err);
      }
    }
  }

  /**
   * Updates partial fields of an existing story
   */
  public static async updateStory(
    storyId: string, 
    updates: Partial<InterviewStory>, 
    userId?: string
  ): Promise<InterviewStory | null> {
    const stories = await this.getStories(userId);
    const existing = stories.find(s => s.id === storyId);
    if (!existing) return null;

    const merged: InterviewStory = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    await this.saveStory(merged, userId);
    return merged;
  }

  /**
   * Deletes a story from Firestore and LocalStorage
   */
  public static async deleteStory(storyId: string, userId?: string): Promise<void> {
    // 1. Delete from local storage
    try {
      const local = this.getLocalStories();
      const filtered = local.filter(s => s.id !== storyId);
      localStorage.setItem(STORAGE_KEY_STORIES, JSON.stringify(filtered));
    } catch (e) {
      logger.error('InterviewStoryBank', 'Local story delete failed', e);
    }

    // 2. Delete from Firestore if authenticated
    const effectiveUserId = userId || (auth.currentUser ? auth.currentUser.uid : null);
    if (effectiveUserId && auth.currentUser) {
      try {
        const storyRef = doc(db, 'students', effectiveUserId, 'stories', storyId);
        await deleteDoc(storyRef);
        logger.info('InterviewStoryBank', `Deleted story ${storyId} from Firestore`);
      } catch (err) {
        logger.warn('InterviewStoryBank', `Firestore delete error for ${storyId}`, err);
      }
    }
  }

  /**
   * Toggles the starred status of a story
   */
  public static async toggleStar(storyId: string, userId?: string): Promise<boolean> {
    const stories = await this.getStories(userId);
    const existing = stories.find(s => s.id === storyId);
    if (!existing) return false;

    const newStarred = !existing.isStarred;
    await this.updateStory(storyId, { isStarred: newStarred }, userId);
    return newStarred;
  }

  // ==========================================================================
  // REUSABLE ROLE-BASED MATCH SUGGESTION ENGINE
  // ==========================================================================

  /**
   * Analyzes target role requirements and matches against candidate's Story Bank.
   * Suggests the best-matching stories with match scores and actionable pitch angles.
   */
  public static suggestBestStoriesForRole(
    targetRoleTitle: string,
    jobDescription: string = '',
    stories: InterviewStory[] = SEED_STORIES
  ): StoryMatchSuggestion[] {
    const cleanTargetRole = targetRoleTitle.toLowerCase();
    const cleanJD = jobDescription.toLowerCase();
    const queryTokens = Array.from(new Set(
      `${cleanTargetRole} ${cleanJD}`
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 2 && !['and', 'the', 'for', 'with', 'from', 'our', 'team', 'role'].includes(t))
    ));

    const suggestions: StoryMatchSuggestion[] = stories.map(story => {
      let matchScore = 0;
      const matchReasons: string[] = [];

      // 1. Direct Target Role / Role Archetype Overlap (Up to 35 pts)
      const roleArchetypeLower = story.roleArchetype.toLowerCase();
      const hasRoleOverlap = story.targetRoles.some(r => cleanTargetRole.includes(r.toLowerCase()) || r.toLowerCase().includes(cleanTargetRole))
        || cleanTargetRole.includes(roleArchetypeLower) || roleArchetypeLower.includes(cleanTargetRole);

      if (hasRoleOverlap) {
        matchScore += 35;
        matchReasons.push(`Direct alignment with ${story.roleArchetype} archetype`);
      } else {
        // Partial token overlap in target roles
        const matchingRoleTokens = queryTokens.filter(tok => roleArchetypeLower.includes(tok));
        if (matchingRoleTokens.length > 0) {
          matchScore += Math.min(25, matchingRoleTokens.length * 8);
          matchReasons.push(`Overlaps on domain focus: ${matchingRoleTokens.slice(0, 3).join(', ')}`);
        }
      }

      // 2. Technical Tags & Keywords Matching (Up to 35 pts)
      const matchedTags: string[] = [];
      story.tags.forEach(tag => {
        const tagLower = tag.toLowerCase();
        if (cleanTargetRole.includes(tagLower) || cleanJD.includes(tagLower) || queryTokens.includes(tagLower)) {
          matchedTags.push(tag);
        }
      });

      if (matchedTags.length > 0) {
        const tagPoints = Math.min(35, matchedTags.length * 10);
        matchScore += tagPoints;
        matchReasons.push(`Shares technical keywords: ${matchedTags.slice(0, 4).join(', ')}`);
      }

      // 3. Concrete Metrics & Production Verification Bonus (Up to 15 pts)
      if (story.metricsMentioned && story.metricsMentioned.length >= 2) {
        matchScore += 15;
        matchReasons.push(`Contains high-signal production metrics (${story.metricsMentioned.slice(0, 2).join(', ')})`);
      } else if (story.metricsMentioned && story.metricsMentioned.length === 1) {
        matchScore += 8;
      }

      // 4. Starred & Grade Bonus (Up to 15 pts)
      if (story.isStarred) {
        matchScore += 10;
        matchReasons.push('Flagged by candidate as top priority anchor story');
      }
      if (story.grade === 'A+' || story.score >= 90) {
        matchScore += 5;
      }

      // Normalize match score to 0 - 99 scale (reserve 100 for perfect match)
      const finalScore = Math.min(98, Math.max(15, Math.round(matchScore)));

      // Generate Tactical Pitch Angle
      let recommendedPitchAngle = `Use this story when answering: "Tell me about a technical challenge or trade-off you owned." Anchor on your ${story.starResult.slice(0, 60)}...`;
      if (matchedTags.length > 0) {
        recommendedPitchAngle = `Lead with your experience in ${matchedTags.slice(0, 2).join(' and ')}. Highlight the quantitative outcome: ${story.metricsMentioned[0] || 'sub-100ms yield'}.`;
      } else if (hasRoleOverlap) {
        recommendedPitchAngle = `Perfect anchor for system design and architecture deep dives at ${story.companyName}. Emphasize the Action step where you took ownership.`;
      }

      return {
        story,
        matchScore: finalScore,
        matchReasons: matchReasons.length > 0 ? matchReasons : ['Good baseline engineering narrative'],
        recommendedPitchAngle,
      };
    });

    // Sort by match score descending
    return suggestions.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Exports candidate's story bank as a clean, formatted Markdown / Text cheat-sheet
   */
  public static exportStoryBankAsText(stories: InterviewStory[], studentName: string = 'Candidate'): void {
    const header = `======================================================================
TERRASYNX INTERVIEW STAR STORY BANK
Reusable Persistent Narrative Repository (TERRASYNX Architecture)
Candidate: ${studentName}
Total Verified Stories: ${stories.length}
Exported: ${new Date().toLocaleString()}
======================================================================\n\n`;

    const body = stories.map((s, idx) => `
----------------------------------------------------------------------
STORY #${idx + 1}: ${s.title.toUpperCase()}
Company: ${s.companyName} | Archetype: ${s.roleArchetype}
Round: ${s.roundType} | Score: ${s.score}/100 (${s.grade})
Tags: ${s.tags.join(', ')}
Target Roles: ${s.targetRoles.join(', ')}
----------------------------------------------------------------------

[INTERVIEW QUESTION HOOK]:
"${s.questionPrompt}"

[S - SITUATION]:
${s.starSituation}

[T - TASK]:
${s.starTask}

[A - ACTION]:
${s.starAction}

[R - RESULT]:
${s.starResult}

[KEY QUANTIFIED METRICS]:
${s.metricsMentioned.map(m => `• ${m}`).join('\n')}

[FULL NARRATIVE PITCH]:
${s.fullNarrative}
`).join('\n');

    const fullContent = header + body;
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `terrasynx_interview_star_story_bank_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

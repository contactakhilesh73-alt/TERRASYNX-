/**
 * TERRASYNX: Mock Interview Simulation & Real-Time STAR Coach Engine (Phase 7 Point 1)
 * Provides company-specific interview prompts, live pacing timers, STAR method breakdown,
 * and dual evaluation (AI-assisted + 100% autonomous deterministic fallback).
 */

import { 
  Opportunity, 
  MockInterviewQuestion, 
  MockInterviewRoundType, 
  MockInterviewEvaluation, 
  MockInterviewSession, 
  StudentProfile 
} from '../types';
import { AiOrchestrationEngine } from './aiOrchestrationEngine';

const STORAGE_KEY_SESSIONS = 'terrasynx_mock_sessions_v1';

export class MockInterviewEngine {
  /**
   * Curated repository of verified company-specific technical and behavioral questions
   */
  private static CURATED_QUESTIONS: Record<string, MockInterviewQuestion[]> = {
    'Stripe': [
      {
        id: 'stripe_beh_1',
        roundType: 'behavioral_star',
        roleArchetype: 'Distributed Systems & Financial Infrastructure',
        companyName: 'Stripe',
        interviewerPersona: 'Sarah Vance',
        interviewerTitle: 'Staff Payments Reliability Architect @ Stripe',
        questionText: 'Tell me about a high-concurrency production incident or distributed data race you diagnosed. How did you maintain strict idempotency and zero data corruption?',
        contextScenario: 'At Stripe scale, a single non-idempotent retry can result in duplicate financial ledger entries. Interviewers look for deep understanding of distributed transactions, idempotency keys, and post-mortem accountability.',
        recommendedDurationSeconds: 150,
        criticalKeywords: ['idempotency', 'distributed lock', 'race condition', 'rollback', 'exponential backoff', 'deadlock', 'reconciliation'],
        starPrompts: {
          situationPrompt: 'Describe the payment or transactional workflow and when the race condition manifested.',
          taskPrompt: 'What was your specific responsibility regarding the ledger integrity?',
          actionPrompt: 'What distributed locking, idempotency key strategy, or circuit breakers did you engineer?',
          resultPrompt: 'Quantify the outcome: zero double-spend, p99 latency reduction, or error rate drop.',
        },
        exemplarAnswer: 'At my previous internship, our payment webhook receiver processed duplicate provider callbacks during a network partition, causing a 4% duplicate credit spike. As the backend owner, my goal was to enforce strict exactly-once processing semantics without degrading the 85ms SLA. I implemented Redis-backed distributed locks with 60-second TTLs keyed on SHA-256 payload digests, paired with database unique constraints on transaction IDs and exponential backoff retry jitter. As a result, duplicate ledger events dropped to exactly zero across 2.4 million daily events, while p99 latency remained steady at 68ms.'
      },
      {
        id: 'stripe_sys_1',
        roundType: 'system_architecture',
        roleArchetype: 'Distributed Systems & API Platform',
        companyName: 'Stripe',
        interviewerPersona: 'Alex Chen',
        interviewerTitle: 'Principal Distributed Infrastructure Engineer @ Stripe',
        questionText: 'How would you architect a global rate limiter that enforces 10,000 req/sec limits across multiple geographic cloud regions without central database bottlenecks?',
        contextScenario: 'Cross-region network latency (e.g. US-East to EU-West) is ~80ms, making synchronous cross-datacenter calls impossible for real-time per-request rate limiting.',
        recommendedDurationSeconds: 240,
        criticalKeywords: ['token bucket', 'sliding window', 'Redis cluster', 'eventual consistency', 'local batching', 'p99 latency', 'asynchronous sync'],
        starPrompts: {
          situationPrompt: 'Define the cross-region latency constraint and multi-tenant scale.',
          taskPrompt: 'Outline the architectural trade-off between strict global accuracy vs local latency.',
          actionPrompt: 'Propose local token-bucket caches with asynchronous gossip or centralized Redis cluster with read-local allocation.',
          resultPrompt: 'Highlight throughput guarantee, sub-5ms overhead, and graceful degradation during regional partitions.',
        },
        exemplarAnswer: 'To handle 10,000 req/sec across 4 regions with <5ms overhead, I would reject synchronous cross-region DB lookups. Instead, I architect a two-tier Token Bucket algorithm: edge Envoy proxies maintain local atomic token counters allocated in 500ms batches from regional Redis clusters. A lightweight asynchronous gossip daemon reconciles global consumption quotas. If a region loses connectivity, it defaults to a local safe rate-limit cap to preserve upstream services. This keeps latency at <2ms while limiting global over-allocation drift to less than 1.5%.'
      }
    ],
    'OpenAI': [
      {
        id: 'openai_beh_1',
        roundType: 'behavioral_star',
        roleArchetype: 'AI/ML Infrastructure & Model Platform',
        companyName: 'OpenAI',
        interviewerPersona: 'Elena Rostova',
        interviewerTitle: 'Research Systems Engineer @ OpenAI Inference',
        questionText: 'Describe a project where you had to push through severe technical ambiguity or conflicting performance trade-offs under tight timeline constraints.',
        contextScenario: 'Frontier AI engineering requires rapid decision-making in unchartered territory—balancing GPU memory constraints, KV-cache quantization, and output quality without clear playbooks.',
        recommendedDurationSeconds: 150,
        criticalKeywords: ['trade-off', 'quantization', 'GPU memory', 'inference latency', 'throughput', 'benchmarking', 'first-principles'],
        starPrompts: {
          situationPrompt: 'What was the ambiguous bottleneck or research deadline you faced?',
          taskPrompt: 'What core constraint did you prioritize (e.g., latency vs VRAM vs accuracy)?',
          actionPrompt: 'How did you formulate hypotheses, build fast benchmark harnesses, and isolate variables?',
          resultPrompt: 'Share concrete benchmark yields: throughput increase, VRAM savings, or successful deployment.',
        },
        exemplarAnswer: 'While building an on-premise LLM serving cluster, we faced severe GPU memory exhaustion during long-context queries exceeding 16k tokens. With a demo deadline in 7 days, there was ambiguity between migrating to FP8 quantization vs dynamic KV-cache eviction. I benchmarked both under synthetic traffic loads using vLLM harnesses. I discovered that 8-bit KV-cache quantization caused negligible perplexity degradation (<0.2%) while halving VRAM requirements. I led the migration in 48 hours, scaling maximum batch concurrency by 2.4x and preventing costly cluster expansion.'
      },
      {
        id: 'openai_sys_1',
        roundType: 'system_architecture',
        roleArchetype: 'AI/ML Infrastructure & Model Platform',
        companyName: 'OpenAI',
        interviewerPersona: 'Marcus Vance',
        interviewerTitle: 'Model Platform Infrastructure Lead @ OpenAI',
        questionText: 'Walk me through how you would design a high-throughput streaming inference gateway for millions of concurrent users while optimizing GPU cluster utilization.',
        contextScenario: 'Streaming generation tokens must be dispatched chunk-by-chunk to clients via SSE/WebSockets while continuous batching schedules new requests without stalling running sequences.',
        recommendedDurationSeconds: 240,
        criticalKeywords: ['continuous batching', 'KV-cache', 'Server-Sent Events', 'load balancer', 'speculative decoding', 'preemption', 'PagedAttention'],
        starPrompts: {
          situationPrompt: 'Set the scale: millions of concurrent streams and unpredictable sequence lengths.',
          taskPrompt: 'State the GPU utilization challenge (memory fragmentation and head-of-line blocking).',
          actionPrompt: 'Detail PagedAttention memory management, continuous dynamic batching, and async SSE streaming proxies.',
          resultPrompt: 'Target metrics: GPU compute saturation >85%, time-to-first-token <180ms, zero connection drops.',
        },
        exemplarAnswer: 'I would architect a 3-layer architecture: 1) A stateless Go/Rust API gateway handling TLS termination and Server-Sent Events (SSE) backpressure. 2) A Triton/vLLM inference pool employing PagedAttention to eliminate memory fragmentation from variable sequence lengths. 3) An intelligent priority scheduler implementing continuous batching with speculative decoding. Requests with shared system prefixes reuse prefix KV-caches in GPU memory. This yields a time-to-first-token of <120ms and maximizes GPU compute saturation above 88% under peak burst loads.'
      }
    ],
    'Google': [
      {
        id: 'google_beh_1',
        roundType: 'behavioral_star',
        roleArchetype: 'Cloud Systems & Scaled Infrastructure',
        companyName: 'Google',
        interviewerPersona: 'David Kim',
        interviewerTitle: 'Senior Staff Engineer @ Google Cloud Core',
        questionText: 'Give an example of a technical disagreement or design review where you had to persuade teammates using data-driven arguments rather than seniority.',
        contextScenario: 'Google places strong emphasis on "Googliness": collaborative technical consensus, rigorous data over opinions, psychological safety, and respectful debate.',
        recommendedDurationSeconds: 150,
        criticalKeywords: ['data-driven', 'consensus', 'A/B benchmark', 'instrumentation', 'post-mortem', 'trade-off', 'collaboration'],
        starPrompts: {
          situationPrompt: 'What was the conflicting architectural proposal between you and your peers?',
          taskPrompt: 'Why was this decision critical for the reliability of the system?',
          actionPrompt: 'How did you build a reproducible test benchmark rather than arguing theoretically?',
          resultPrompt: 'How did the team unite behind the validated solution, and what was the production outcome?',
        },
        exemplarAnswer: 'During a backend redesign, a senior engineer strongly advocated for Apache Kafka for internal messaging, whereas I proposed lightweight RabbitMQ workers to avoid JVM overhead on our resource-constrained Kubernetes nodes. Rather than arguing conceptually, I built an automated load harness deploying both in a staging cluster and simulated our target 15,000 msg/sec load. The telemetry proved that Kafka consumed 4x more baseline RAM with zero latency advantage for our non-retained pub/sub requirements. I presented the metrics in a blameless RFC review; the senior engineer agreed, saving our team $1,800/month in cloud infrastructure.'
      }
    ]
  };

  /**
   * Generates a context-aware question based on company name, role, and round type
   */
  public static getQuestionForOpportunity(
    opp: Opportunity,
    roundType: MockInterviewRoundType = 'behavioral_star'
  ): MockInterviewQuestion {
    const companyName = opp.companyName;
    const companyQuestions = this.CURATED_QUESTIONS[companyName];

    if (companyQuestions && companyQuestions.length > 0) {
      const matched = companyQuestions.find(q => q.roundType === roundType);
      if (matched) return matched;
      return companyQuestions[0];
    }

    // Dynamic Generation for arbitrary companies based on Opportunity metadata
    const role = opp.title;
    const company = opp.companyName;
    const allSkills = [...(opp.fitment.matchedSkills || []), ...(opp.fitment.missingSkills || [])];
    const reqs = (allSkills.length > 0 ? allSkills : ['Algorithms', 'Data Structures', 'Distributed Systems']).slice(0, 4).join(', ');

    if (roundType === 'system_architecture') {
      return {
        id: `dyn_sys_${opp.id}`,
        roundType: 'system_architecture',
        roleArchetype: opp.department || 'Distributed Systems & Scaled Architecture',
        companyName: company,
        interviewerPersona: 'Engineering Lead',
        interviewerTitle: `Principal Architect @ ${company}`,
        questionText: `Walk me through how you would design an end-to-end scalable backend for ${company}'s core product, ensuring high availability, sub-100ms latency, and graceful degradation during network partitions.`,
        contextScenario: `Targeting role: ${role}. Key technological competencies expected: ${reqs}. Focus on trade-offs between consistency and availability.`,
        recommendedDurationSeconds: 240,
        criticalKeywords: ['scalability', 'horizontal scaling', 'database sharding', 'caching', 'p99 latency', 'fault tolerance', 'load balancer'],
        starPrompts: {
          situationPrompt: 'Define the functional and non-functional requirements (QPS, data volume, SLA).',
          taskPrompt: 'State the primary architectural bottleneck (database write bottlenecks or network lag).',
          actionPrompt: 'Detail your data modeling, caching layers, message queues, and partition tolerance.',
          resultPrompt: 'Conclude with failure-mode mitigation and monitoring telemetry.',
        },
        exemplarAnswer: `For ${company}, I would isolate the read and write paths using CQRS with event sourcing. Writes hit an edge load balancer routing to stateless Go microservices, which validate payloads and append immutable events to a distributed message log (Kafka/Pulsar). Asynchronous consumer workers update read-optimized Redis and PostgreSQL replica clusters. Under peak loads or regional network partitions, circuit breakers degrade non-critical features while preserving core transactional throughput, keeping p99 response times below 65ms.`
      };
    }

    if (roundType === 'live_coding_algorithms') {
      return {
        id: `dyn_algo_${opp.id}`,
        roundType: 'live_coding_algorithms',
        roleArchetype: opp.department || 'Core Software Engineering',
        companyName: company,
        interviewerPersona: 'Senior Staff Engineer',
        interviewerTitle: `Senior Software Engineer @ ${company}`,
        questionText: `How would you design an algorithmic solution to detect anomalies in real-time streaming time-series data while bounding memory complexity to O(K) sliding window elements?`,
        contextScenario: `Algorithmic live coding round for ${role}. The interviewer assesses time complexity, space optimization, edge-case handling, and clean modular code.`,
        recommendedDurationSeconds: 180,
        criticalKeywords: ['sliding window', 'monotonic queue', 'deque', 'time complexity', 'space complexity', 'O(1) amortized', 'edge cases'],
        starPrompts: {
          situationPrompt: 'Clarify input constraints, streaming rate, and memory restrictions.',
          taskPrompt: 'Explain why a naive O(N*K) brute-force scan fails under high throughput.',
          actionPrompt: 'Present an optimal Monotonic Deque or Ring Buffer approach with O(1) amortized insertion.',
          resultPrompt: 'Analyze edge cases (empty stream, duplicates, out-of-order timestamps).',
        },
        exemplarAnswer: `I would utilize a Monotonic Decreasing Double-Ended Queue (Deque) over a sliding window of size K. For every incoming stream metric, I pop elements from the back that are smaller than the current value, ensuring the front of the deque always represents the maximum anomaly candidate. Elements whose index falls outside the window are popped from the front in O(1). This achieves O(N) total runtime with O(1) amortized per-element processing and strict O(K) memory.`
      };
    }

    // Default: Behavioral STAR
    return {
      id: `dyn_beh_${opp.id}`,
      roundType: 'behavioral_star',
      roleArchetype: opp.department || 'Software Engineering',
      companyName: company,
      interviewerPersona: 'Engineering Manager',
      interviewerTitle: `Hiring Manager @ ${company}`,
      questionText: `Describe a challenging engineering situation where a project was falling behind schedule or a critical bug occurred. How did you diagnose the root cause and lead the resolution?`,
      contextScenario: `Tailored for ${role} at ${company}. Evaluates ownership, systematic debugging, leadership under pressure, and quantified business impact.`,
      recommendedDurationSeconds: 150,
      criticalKeywords: ['ownership', 'root cause analysis', 'debugging', 'metrics', 'collaboration', 'timeline', 'deliverable'],
      starPrompts: {
        situationPrompt: `Set the scene in a real project where systems or schedules were threatened.`,
        taskPrompt: `What was your specific individual ownership in averting failure?`,
        actionPrompt: `What systematic debugging or prioritization actions did you execute?`,
        resultPrompt: `Quantify the final outcome: bug resolution time, feature shipped on time, performance gained.`,
      },
      exemplarAnswer: `In my last major system build, we hit a blocking regression 48 hours before code freeze where API response times ballooned from 90ms to over 1,400ms under load. As the lead backend contributor, my responsibility was to find the regression without postponing the release. I profiled the request lifecycle with OpenTelemetry traces and discovered an N+1 query pattern introduced by a recent ORM schema change. I refactored the relational joins into a single batch query with an indexed foreign key. This reduced query round-trips from 45 to 1, cutting latency to 42ms and allowing us to ship on schedule with zero production regressions.`
    };
  }

  /**
   * 100% Autonomous Algorithmic Response Evaluator
   * Computes objective scores across STAR methodology, Technical Depth, and Communication
   */
  public static evaluateResponseAlgorithmic(
    question: MockInterviewQuestion,
    response: string,
    durationSeconds: number
  ): MockInterviewEvaluation {
    const cleanText = response.trim();
    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
    const lowerText = cleanText.toLowerCase();

    // 1. STAR Breakdown Scoring (0 - 25 points each)
    let situationScore = 10;
    let taskScore = 10;
    let actionScore = 10;
    let resultScore = 10;

    // Situation indicators
    if (/(when|while|at my|during|in my project|we were building|our team faced)/i.test(cleanText)) situationScore += 7;
    if (/(problem|challenge|incident|deadlock|bottleneck|spike|issue)/i.test(cleanText)) situationScore += 8;

    // Task indicators
    if (/(my goal was|my objective|my task|I was responsible for|my role was|needed to)/i.test(cleanText)) taskScore += 8;
    if (/(deadline|sla|requirement|constraint|deliverable)/i.test(cleanText)) taskScore += 7;

    // Action indicators (strong verbs)
    const actionMatches = cleanText.match(/(I implemented|I architected|I refactored|I designed|I benchmarked|I migrated|I optimized|I analyzed|I led)/gi) || [];
    actionScore += Math.min(15, actionMatches.length * 5);

    // Result indicators (quantification, impact)
    const metricMatches = cleanText.match(/(\d+%\s*|\d+\s*ms|\d+\s*x|\d+\s*qps|\$\d+|\d+\s*seconds|\d+\s*hours|zero|doubled|halved)/gi) || [];
    if (/(resulted in|as a result|ultimately|which reduced|which increased|delivered|shipped)/i.test(cleanText)) resultScore += 7;
    resultScore += Math.min(8, metricMatches.length * 4);

    // Clamp STAR scores
    situationScore = Math.min(25, Math.max(5, situationScore));
    taskScore = Math.min(25, Math.max(5, taskScore));
    actionScore = Math.min(25, Math.max(5, actionScore));
    resultScore = Math.min(25, Math.max(5, resultScore));

    const starTotal = situationScore + taskScore + actionScore + resultScore;

    // 2. Critical Keyword Matching
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    question.criticalKeywords.forEach(kw => {
      if (lowerText.includes(kw.toLowerCase())) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });

    const keywordRatio = question.criticalKeywords.length > 0 
      ? matchedKeywords.length / question.criticalKeywords.length 
      : 0.8;
    
    // 3. Technical Depth Score (0 - 100)
    let technicalDepthScore = Math.round((keywordRatio * 60) + (actionScore * 1.6));
    if (metricMatches.length >= 2) technicalDepthScore += 10;
    technicalDepthScore = Math.min(98, Math.max(25, technicalDepthScore));

    // 4. Communication & Pacing Score (0 - 100)
    let communicationScore = 50;
    if (wordCount >= 60 && wordCount <= 280) communicationScore += 30;
    else if (wordCount > 280) communicationScore += 15; // slightly verbose
    else communicationScore -= 15; // too brief

    if (actionMatches.length >= 2) communicationScore += 15;
    communicationScore = Math.min(96, Math.max(30, communicationScore));

    // Overall Score (Weighted: 40% STAR, 35% Technical, 25% Communication)
    const overallScore = Math.round((starTotal * 0.40) + (technicalDepthScore * 0.35) + (communicationScore * 0.25));

    // Grade assignment
    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'Needs Work' = 'B';
    if (overallScore >= 93) grade = 'A+';
    else if (overallScore >= 85) grade = 'A';
    else if (overallScore >= 75) grade = 'B';
    else if (overallScore >= 65) grade = 'C';
    else if (overallScore >= 50) grade = 'D';
    else grade = 'Needs Work';

    // Strengths
    const strengths: string[] = [];
    if (actionMatches.length >= 2) strengths.push('Strong first-person proactive action verbs demonstrating direct ownership.');
    if (metricMatches.length >= 1) strengths.push(`Concrete quantifiable impact referenced (${metricMatches.join(', ')}).`);
    if (matchedKeywords.length >= 2) strengths.push(`Accurate technical terminology matched: ${matchedKeywords.slice(0, 3).join(', ')}.`);
    if (situationScore >= 20 && taskScore >= 20) strengths.push('Clear problem framing with explicit task constraints.');
    if (strengths.length === 0) strengths.push('Clear baseline narrative demonstrating relevant domain familiarity.');

    // Growth Areas
    const growthAreas: string[] = [];
    if (missingKeywords.length > 0) {
      growthAreas.push(`Elevate technical specificity by integrating: ${missingKeywords.slice(0, 3).join(', ')}.`);
    }
    if (metricMatches.length === 0) {
      growthAreas.push('Anchor the Result with measurable engineering numbers (e.g. latency reduced by X%, zero double-writes).');
    }
    if (actionMatches.length < 2) {
      growthAreas.push('Replace passive voice ("we decided", "it was handled") with strong individual agency ("I architected", "I refactored").');
    }
    if (wordCount < 70) {
      growthAreas.push('Response is slightly concise—expand on the exact technical trade-offs you considered.');
    }

    // Pacing Feedback
    let pacingFeedback = 'Optimal delivery cadence within the target timeframe.';
    if (durationSeconds > question.recommendedDurationSeconds + 45) {
      pacingFeedback = `Pacing was slightly lengthy (${durationSeconds}s vs ${question.recommendedDurationSeconds}s recommended). Aim to deliver the punchline within 2.5 minutes.`;
    } else if (durationSeconds < 40 && wordCount < 60) {
      pacingFeedback = `Response was rapid (${durationSeconds}s). Take time to structure the Problem and quantifiable Business Result.`;
    }

    return {
      overallScore,
      grade,
      starBreakdown: {
        situationScore,
        taskScore,
        actionScore,
        resultScore
      },
      technicalDepthScore,
      communicationScore,
      matchedKeywords,
      missingKeywords,
      strengths,
      growthAreas,
      modelAnswer: question.exemplarAnswer,
      pacingFeedback
    };
  }

  /**
   * Evaluates response with AI-assisted enhancement or falls back to the deterministic core
   */
  public static async evaluateSession(
    question: MockInterviewQuestion,
    response: string,
    durationSeconds: number,
    studentProfile: StudentProfile
  ): Promise<MockInterviewEvaluation> {
    // 1. Calculate deterministic baseline immediately
    const baseline = this.evaluateResponseAlgorithmic(question, response, durationSeconds);

    // 2. If AI is available, query for deep reasoning insights and merge with baseline
    try {
      const prompt = `You are an executive engineering interviewer evaluating a candidate for ${question.companyName}.
Question: "${question.questionText}"
Candidate's response: "${response.trim()}"
Elapsed time: ${durationSeconds} seconds (Target: ${question.recommendedDurationSeconds}s).
Provide 2 targeted positive strengths and 2 concrete technical growth areas in JSON format:
{"strengths": ["...", "..."], "growthAreas": ["...", "..."]}
Return ONLY valid JSON.`;

      const aiResponse = await AiOrchestrationEngine.sendMessage(
        prompt,
        studentProfile
      );

      // If AI produced actionable feedback, extract and parse JSON safely
      if (aiResponse && aiResponse.content && aiResponse.content.trim().length > 10) {
        let jsonStr = aiResponse.content.trim();

        // 1. Strip markdown code fence if present
        const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (codeBlockMatch && codeBlockMatch[1]) {
          jsonStr = codeBlockMatch[1].trim();
        }

        // 2. Extract outermost JSON object
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(jsonStr);

        const aiStrengths = Array.isArray(parsed.strengths)
          ? parsed.strengths.filter((s: unknown): s is string => typeof s === 'string' && s.trim().length > 0).map((s: string) => s.trim())
          : [];

        const aiGrowthAreas = Array.isArray(parsed.growthAreas)
          ? parsed.growthAreas.filter((g: unknown): g is string => typeof g === 'string' && g.trim().length > 0).map((g: string) => g.trim())
          : [];

        // If valid AI strengths or growth areas were parsed, merge with baseline
        if (aiStrengths.length > 0 || aiGrowthAreas.length > 0) {
          const mergedStrengths = [
            ...aiStrengths,
            ...baseline.strengths.filter(bs => !aiStrengths.some(as => as.toLowerCase().includes(bs.toLowerCase()) || bs.toLowerCase().includes(as.toLowerCase())))
          ];

          const mergedGrowthAreas = [
            ...aiGrowthAreas,
            ...baseline.growthAreas.filter(bg => !aiGrowthAreas.some(ag => ag.toLowerCase().includes(bg.toLowerCase()) || bg.toLowerCase().includes(ag.toLowerCase())))
          ];

          return {
            ...baseline,
            strengths: mergedStrengths.slice(0, 5),
            growthAreas: mergedGrowthAreas.slice(0, 5),
          };
        }
      }
    } catch {
      // Seamless silent fallback to deterministic baseline if parsing or AI call fails
    }

    return baseline;
  }

  /**
   * Session Persistence in LocalStorage
   */
  public static getSavedSessions(): MockInterviewSession[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public static saveSession(session: MockInterviewSession): void {
    try {
      const existing = this.getSavedSessions();
      const updated = [session, ...existing.filter(s => s.id !== session.id)].slice(0, 30);
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));
    } catch {
      // Storage quota resilience
    }
  }

  public static deleteSession(sessionId: string): void {
    try {
      const existing = this.getSavedSessions();
      const updated = existing.filter(s => s.id !== sessionId);
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));
    } catch {
      // Resilience
    }
  }
}

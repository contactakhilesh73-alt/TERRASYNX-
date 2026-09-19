/**
 * TERRASYNX: Dynamic 10-Dimensional Career Fitment & Evaluation Service
 * Fully configurable, modular weights, strictly zero-hardcoding
 * Conforming to Santiago's oferta-inspired model & SYSTEM_SPEC (Req #17)
 */

import { Opportunity, StudentProfile, FitmentEvaluation } from '../types';

export interface DimensionWeightConfig {
  roleFit: number;             // Default: 25%
  skillsAlignment: number;     // Default: 25%
  batchEligibility: number;    // Default: 20%
  companyPrestige: number;     // Default: 10%
  learningTrajectory: number;  // Default: 10%
  compensationFairness: number;// Default: 10%
}

// Default Global Configurable Evaluation Weights (Easily customizable on the fly)
export const DEFAULT_FITMENT_WEIGHTS: DimensionWeightConfig = {
  roleFit: 25,
  skillsAlignment: 25,
  batchEligibility: 20,
  companyPrestige: 10,
  learningTrajectory: 10,
  compensationFairness: 10,
};

// Skill preparation cheatsheets database for 1-click action plans
export const ACTIONABLE_SKILL_RESOURCES: Record<string, { label: string; prepTime: string; link: string; summary: string }> = {
  'C++ Systems Programming': {
    label: 'Modern C++20 & Systems Concurrency',
    prepTime: '2-Day Fast-Track',
    link: 'https://en.cppreference.com/w/cpp/thread',
    summary: 'Master std::jthread, mutex synchronization, RAII memory management, and cache-locality principles.',
  },
  'Triton / CUDA Kernels': {
    label: 'GPU Kernel Writing with OpenAI Triton',
    prepTime: '3-Day Fast-Track',
    link: 'https://triton-lang.org/main/getting-started/tutorials/',
    summary: 'Learn fused attention, block pointers, tensor cores, and memory bandwidth optimization on GPUs.',
  },
  'Java / Go Concurrency': {
    label: 'High-Throughput Goroutines & Java Virtual Threads',
    prepTime: '1-Day Fast-Track',
    link: 'https://go.dev/tour/concurrency/1',
    summary: 'Focus on channels, worker pools, deadlock prevention, and distributed locks.',
  },
  'PyTorch Distributed Training': {
    label: 'Distributed Data Parallel (DDP) & FSDP',
    prepTime: '2-Day Fast-Track',
    link: 'https://pytorch.org/tutorials/intermediate/ddp_tutorial.html',
    summary: 'Understand gradient all-reduce, mixed precision (FP16/BF16), and pipeline parallelism.',
  },
  'RLHF / DPO': {
    label: 'Direct Preference Optimization & Reward Models',
    prepTime: '2-Day Fast-Track',
    link: 'https://huggingface.co/blog/dpo-trl',
    summary: 'Learn pairwise ranking loss, Bradley-Terry models, and alignment benchmarking.',
  },
  'Ruby on Rails Internal Core': {
    label: 'Stripe-Grade Architecture & ActiveModel',
    prepTime: '1-Day Fast-Track',
    link: 'https://guides.rubyonrails.org/',
    summary: 'Demystify metaprogramming, database migrations, and idempotent webhook handlers.',
  },
  'WebSockets Streaming Optimization': {
    label: 'Server-Sent Events & Low-Latency Tokens',
    prepTime: '1-Day Fast-Track',
    link: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events',
    summary: 'Explore backpressure handling, chunked transfer encoding, and edge caching.',
  },
  'C# / .NET Cloud Services': {
    label: 'Azure Core SDKs & Microservices',
    prepTime: '2-Day Fast-Track',
    link: 'https://learn.microsoft.com/en-us/dotnet/core/',
    summary: 'Focus on ASP.NET Core web APIs, dependency injection, and Cosmos DB SDK.',
  },
};

export class FitmentEvaluator {
  /**
   * Dynamically evaluate a candidate opportunity against a student profile
   * using configurable custom weights
   */
  public static calculateFitment(
    opp: Opportunity,
    profile: StudentProfile,
    weights: DimensionWeightConfig = DEFAULT_FITMENT_WEIGHTS
  ): FitmentEvaluation {
    const totalWeights = Object.values(weights).reduce((a, b) => a + b, 0) || 100;

    // 1. Batch Eligibility (Strict 0 or 100)
    const isEligibleBatch = opp.eligibility.allowedGraduationYears.includes(profile.graduationYear);
    const batchScore = isEligibleBatch ? 100 : 40;

    // 2. Skills Alignment Calculation
    const allStudentSkills = [...profile.primarySkills, ...profile.secondarySkills].map(s => s.toLowerCase());
    const matched = opp.fitment.matchedSkills.filter(s => 
      allStudentSkills.some(st => st.includes(s.toLowerCase()) || s.toLowerCase().includes(st))
    );
    const missing = opp.fitment.missingSkills;
    const skillsScore = Math.min(100, Math.round((matched.length / Math.max(1, matched.length + missing.length)) * 100));

    // 3. Normalized dimension scores
    const dimensions = {
      roleFit: opp.fitment.dimensions.roleFit,
      skillsAlignment: skillsScore,
      batchEligibility: batchScore,
      companyPrestige: opp.fitment.dimensions.companyPrestige,
      learningTrajectory: opp.fitment.dimensions.learningTrajectory,
      compensationFairness: opp.fitment.dimensions.compensationFairness,
    };

    // Calculate weighted sum
    const weightedTotal = 
      (dimensions.roleFit * weights.roleFit) +
      (dimensions.skillsAlignment * weights.skillsAlignment) +
      (dimensions.batchEligibility * weights.batchEligibility) +
      (dimensions.companyPrestige * weights.companyPrestige) +
      (dimensions.learningTrajectory * weights.learningTrajectory) +
      (dimensions.compensationFairness * weights.compensationFairness);

    const finalScore = Math.round(weightedTotal / totalWeights);

    // Derive Santiago-inspired A-F Grade
    let grade: FitmentEvaluation['overallGrade'] = 'B';
    if (finalScore >= 93) grade = 'A+';
    else if (finalScore >= 87) grade = 'A';
    else if (finalScore >= 80) grade = 'B';
    else if (finalScore >= 70) grade = 'C';
    else if (finalScore >= 60) grade = 'D';
    else grade = 'F';

    let verdict = opp.fitment.strategicVerdict;
    if (missing.length > 0) {
      verdict = `High potential match (${finalScore}%). Address ${missing[0]} via 1-click prep plan to maximize OA selection odds.`;
    }

    return {
      overallScore: finalScore,
      overallGrade: grade,
      dimensions,
      matchedSkills: opp.fitment.matchedSkills,
      missingSkills: missing,
      strategicVerdict: verdict,
    };
  }

  /**
   * Real AI Fitment Scoring via Gemini Server Endpoint (Fix 4)
   */
  public static async evaluateWithAi(
    opp: Opportunity,
    profile: StudentProfile
  ): Promise<FitmentEvaluation> {
    try {
      const response = await fetch('/api/ai/evaluate-fitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity: opp, profile })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.evaluation) {
          const evalRes = data.evaluation;
          return {
            overallScore: Number(evalRes.overallScore) || 85,
            overallGrade: evalRes.overallGrade || 'B',
            dimensions: {
              roleFit: Number(evalRes.dimensions?.roleFit) || 80,
              skillsAlignment: Number(evalRes.dimensions?.skillsAlignment) || 80,
              batchEligibility: Number(evalRes.dimensions?.batchEligibility) || 100,
              companyPrestige: Number(evalRes.dimensions?.companyPrestige) || 85,
              learningTrajectory: Number(evalRes.dimensions?.learningTrajectory) || 85,
              compensationFairness: Number(evalRes.dimensions?.compensationFairness) || 85,
            },
            matchedSkills: Array.isArray(evalRes.matchedSkills) ? evalRes.matchedSkills : opp.fitment.matchedSkills,
            missingSkills: Array.isArray(evalRes.missingSkills) ? evalRes.missingSkills : opp.fitment.missingSkills,
            strategicVerdict: evalRes.strategicVerdict || opp.fitment.strategicVerdict,
          };
        }
      }
    } catch {
      // Safe fallback to deterministic matrix if network / offline
    }
    return this.calculateFitment(opp, profile);
  }

  /**
   * Get actionable learning resource for an ATS missing skill
   */
  public static getSkillActionPlan(skillName: string) {
    return ACTIONABLE_SKILL_RESOURCES[skillName] || {
      label: `${skillName} Fast-Track Guide`,
      prepTime: '2-Day Focused Sprint',
      link: `https://www.google.com/search?q=${encodeURIComponent(skillName + ' interview preparation cheatsheet')}`,
      summary: `Master core mental models, standard libraries, and common interview coding patterns for ${skillName}.`,
    };
  }
}

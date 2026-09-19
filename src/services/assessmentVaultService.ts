/**
 * TERRASYNX: Company Online Assessment (OA) Intelligence & Warm-up Vault
 * Conforming strictly to SYSTEM_SPEC (Req #16 & Strict Rule #1)
 */

export interface AssessmentDossier {
  companyDomain: string;
  companyName: string;
  testingPlatform: string;
  durationMinutes: number;
  passingScoreTarget: string;
  proctoringStyle: 'Automated Webcam & Screen' | 'Browser Tab Monitored' | 'Standard Non-Proctored';
  frequentlyTestedPatterns: string[];
  warmupPracticeQuestions: {
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topic: string;
    directPracticeUrl: string;
  }[];
  strategicAdvice: string;
}

export const COMPANY_OA_INTEL: Record<string, AssessmentDossier> = {
  'openai.com': {
    companyDomain: 'openai.com',
    companyName: 'OpenAI',
    testingPlatform: 'Custom CodeSignal / HackerRank Hard',
    durationMinutes: 90,
    passingScoreTarget: '825+ GCA Equivalent (4/4 Completed)',
    proctoringStyle: 'Browser Tab Monitored',
    frequentlyTestedPatterns: ['High-throughput Concurrency', 'Triton / Matrix Kernels', 'Memory-bounded Caching', 'Trie / Tokenizers'],
    warmupPracticeQuestions: [
      {
        title: 'Design In-Memory Key-Value Store with TTL & Transactions',
        difficulty: 'Hard',
        topic: 'Data Structures & Concurrency',
        directPracticeUrl: 'https://leetcode.com/problemset/all/?search=in-memory+key+value',
      },
      {
        title: 'Parallel Task Scheduler with Dependency DAG',
        difficulty: 'Medium',
        topic: 'Topological Sort & Worker Pools',
        directPracticeUrl: 'https://leetcode.com/problemset/all/?search=course+schedule',
      },
    ],
    strategicAdvice: 'OpenAI heavily penalizes memory leaks and sub-optimal O(N) space. Ensure you test corner cases with large arrays before submitting.',
  },
  'google.com': {
    companyDomain: 'google.com',
    companyName: 'Google',
    testingPlatform: 'Google OA (Online Assessment via Internal Testing Tool)',
    durationMinutes: 90,
    passingScoreTarget: '2/2 Questions optimal solution (100% Testcases)',
    proctoringStyle: 'Browser Tab Monitored',
    frequentlyTestedPatterns: ['Graph BFS/DFS Shortest Path', 'Dynamic Programming on Trees', 'Segment Trees & Fenwick', 'Bitmask DP'],
    warmupPracticeQuestions: [
      {
        title: 'Shortest Path in a Grid with Obstacles Elimination',
        difficulty: 'Hard',
        topic: 'BFS Graph Traversal',
        directPracticeUrl: 'https://leetcode.com/problemset/all/?search=shortest+path+grid',
      },
      {
        title: 'Binary Tree Maximum Path Sum',
        difficulty: 'Hard',
        topic: 'Trees & Recursion',
        directPracticeUrl: 'https://leetcode.com/problemset/all/?search=binary+tree+maximum+path+sum',
      },
    ],
    strategicAdvice: 'Google OA tests clean code and asymptotic complexity. Write self-explanatory variable names and clean helper functions.',
  },
  'anthropic.com': {
    companyDomain: 'anthropic.com',
    companyName: 'Anthropic',
    testingPlatform: 'Take-Home Systems / Live Pair-Programming',
    durationMinutes: 120,
    passingScoreTarget: 'Production-ready code with complete unit tests',
    proctoringStyle: 'Standard Non-Proctored',
    frequentlyTestedPatterns: ['Token Streaming Parsers', 'Asynchronous Worker Queues', 'Prompt Rate Limiter', 'JSON Schema Validation'],
    warmupPracticeQuestions: [
      {
        title: 'Design a Rate Limiter with Sliding Window Logs',
        difficulty: 'Medium',
        topic: 'System Design & Queues',
        directPracticeUrl: 'https://leetcode.com/problemset/all/?search=rate+limiter',
      },
      {
        title: 'Streaming JSON Decoder with Incomplete Chunks',
        difficulty: 'Hard',
        topic: 'String Parsing & Streams',
        directPracticeUrl: 'https://leetcode.com/problemset/all/?search=json+parser',
      },
    ],
    strategicAdvice: 'Anthropic values code readability and robust unit test coverage over speed. Structure your classes modularly.',
  },
  'stripe.com': {
    companyDomain: 'stripe.com',
    companyName: 'Stripe',
    testingPlatform: 'HackerRank Interactive Debugging & System Extension',
    durationMinutes: 60,
    passingScoreTarget: 'Passing all 5 sequential test suites',
    proctoringStyle: 'Browser Tab Monitored',
    frequentlyTestedPatterns: ['Idempotency Ledger', 'Currency Converter with Fees', 'Pagination & Cursor Handling', 'State Machine Invalidation'],
    warmupPracticeQuestions: [
      {
        title: 'Design Snake Game / State Machine Machine',
        difficulty: 'Medium',
        topic: 'Design & State Management',
        directPracticeUrl: 'https://leetcode.com/problemset/all/?search=design+snake+game',
      },
      {
        title: 'Evaluate Reverse Polish Notation with Error Recovery',
        difficulty: 'Medium',
        topic: 'Stacks & Edge Cases',
        directPracticeUrl: 'https://leetcode.com/problemset/all/?search=reverse+polish+notation',
      },
    ],
    strategicAdvice: 'Stripe does not test LeetCode brain-teasers! They test whether you can read existing code, navigate a codebase, and write tests.',
  },
  'perplexity.ai': {
    companyDomain: 'perplexity.ai',
    companyName: 'Perplexity AI',
    testingPlatform: 'CodeSignal General Coding Assessment (GCA)',
    durationMinutes: 70,
    passingScoreTarget: '800+ GCA Score',
    proctoringStyle: 'Automated Webcam & Screen',
    frequentlyTestedPatterns: ['Matrix Traversal', 'Hash Table Counting', 'String Prefix Trees', 'Fast Sliding Window'],
    warmupPracticeQuestions: [
      {
        title: 'Implement Trie (Prefix Tree) with Wildcards',
        difficulty: 'Medium',
        topic: 'Trie & Strings',
        directPracticeUrl: 'https://leetcode.com/problemset/all/?search=implement+trie',
      },
      {
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        topic: 'Sliding Window',
        directPracticeUrl: 'https://leetcode.com/problemset/all/?search=longest+substring+without+repeating',
      },
    ],
    strategicAdvice: 'In CodeSignal GCA, speed on Q1 and Q2 is critical so you have 40+ minutes left for the complex Q4 implementation problem.',
  },
  'microsoft.com': {
    companyDomain: 'microsoft.com',
    companyName: 'Microsoft',
    testingPlatform: 'Codility / Mettle University Assessment',
    durationMinutes: 90,
    passingScoreTarget: '3/3 Optimal Solutions (100% Testcases)',
    proctoringStyle: 'Browser Tab Monitored',
    frequentlyTestedPatterns: ['Array Subarrays & Kadane', 'Binary Search on Answer', 'Graph BFS/DFS', 'Linked List & Tree Inversions'],
    warmupPracticeQuestions: [
      {
        title: 'Maximum Subarray (Kadane Algorithm)',
        difficulty: 'Medium',
        topic: 'Dynamic Programming & Greedy',
        directPracticeUrl: 'https://leetcode.com/problemset/all/?search=maximum+subarray',
      },
      {
        title: 'Word Break Problem with Dictionary Trie',
        difficulty: 'Medium',
        topic: 'Dynamic Programming & Strings',
        directPracticeUrl: 'https://leetcode.com/problemset/all/?search=word+break',
      },
    ],
    strategicAdvice: 'Microsoft tests boundary conditions rigorously (e.g. empty inputs, negative numbers, integer overflow). Ensure your code runs cleanly without index out of bound exceptions.',
  },
};

export class AssessmentVaultService {
  public static getDossierForDomain(domain: string): AssessmentDossier {
    const key = domain.toLowerCase().trim();
    return COMPANY_OA_INTEL[key] || {
      companyDomain: key,
      companyName: key.split('.')[0].toUpperCase(),
      testingPlatform: 'HackerRank / CodeSignal Standard',
      durationMinutes: 75,
      passingScoreTarget: '80%+ Test Cases Passed',
      proctoringStyle: 'Browser Tab Monitored',
      frequentlyTestedPatterns: ['Array Sorting & Binary Search', 'Dynamic Programming', 'Graph Shortest Paths', 'Hash Maps'],
      warmupPracticeQuestions: [
        {
          title: 'Two Sum & Three Sum Variations',
          difficulty: 'Medium',
          topic: 'Two Pointers & Hashing',
          directPracticeUrl: 'https://leetcode.com/problemset/all/?search=3sum',
        },
        {
          title: 'Course Schedule (Cycle Detection in DAG)',
          difficulty: 'Medium',
          topic: 'Graphs & Topological Sort',
          directPracticeUrl: 'https://leetcode.com/problemset/all/?search=course+schedule',
        },
      ],
      strategicAdvice: 'Review standard Big-O time and space trade-offs before starting the test.',
    };
  }
}

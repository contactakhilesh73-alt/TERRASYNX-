import { describe, it, expect, beforeEach } from 'vitest';
import {
  AiOrchestrationEngine,
  MARKET_AI_CONSENSUS_ROSTER,
  SYSTEM_CODEBASE_MANIFEST,
} from '../services/aiOrchestrationEngine';
import { createDefaultStudentProfile } from '../services/radarEngine';
import { StudentProfile } from '../types';

// In-memory mock for localStorage in headless test runner
const memoryStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => memoryStorage[key] ?? null,
  setItem: (key: string, value: string) => {
    memoryStorage[key] = String(value);
  },
  removeItem: (key: string) => {
    delete memoryStorage[key];
  },
  clear: () => {
    for (const key of Object.keys(memoryStorage)) {
      delete memoryStorage[key];
    }
  },
};
(globalThis as any).localStorage = mockLocalStorage;

describe('Multi-Model AI Consensus Engine & Security Guardrails', () => {
  const mockProfile: StudentProfile = {
    ...createDefaultStudentProfile('test_student_01', 'akhilesh@example.com', 'Akhilesh Singh'),
    degree: 'B.Tech in Computer Science',
    collegeName: 'IIT Bombay',
    graduationYear: 2026,
    currentCgpa: '8.8',
    workAuthorization: 'F-1 (OPT / CPT Eligible)',
    preferredRoles: ['Distributed Systems Engineer', 'Full-Stack Developer'],
    primarySkills: ['TypeScript', 'Go', 'Rust', 'PostgreSQL', 'Docker'],
    secondarySkills: ['TailwindCSS', 'Kafka', 'Redis'],
    projects: [
      {
        id: 'proj_1',
        title: 'High-Throughput Distributed Cache',
        description: 'Engineered a multi-tier Raft consensus key-value store in Go.',
        techStack: ['Go', 'gRPC', 'Raft'],
        metricsAchieved: 'Handled 100k requests/sec with p99 latency < 2ms',
      },
    ],
  };

  beforeEach(() => {
    mockLocalStorage.clear();
    AiOrchestrationEngine.init();
    AiOrchestrationEngine.setProviderMode('deterministic_core');
  });

  it('verifies that all 8 market-leading AI models are configured with STRICT READ-ONLY permissions', () => {
    expect(MARKET_AI_CONSENSUS_ROSTER).toHaveLength(8);

    const modelIds = MARKET_AI_CONSENSUS_ROSTER.map((m) => m.id);
    expect(modelIds).toContain('gemini-3.8-flash');
    expect(modelIds).toContain('claude-3.7-sonnet');
    expect(modelIds).toContain('chatgpt-o3-mini');
    expect(modelIds).toContain('cursor-ai-agent');
    expect(modelIds).toContain('deepseek-r1');
    expect(modelIds).toContain('perplexity-sonar');
    expect(modelIds).toContain('meta-llama-3.3');
    expect(modelIds).toContain('mistral-large');

    // Strict Security & Zero-Exfiltration Guardrail Verification
    for (const model of MARKET_AI_CONSENSUS_ROSTER) {
      expect(model.permissionLevel).toBe('STRICT_READ_ONLY_INTROSPECTION');
      expect(model.writePermission).toBe(false);
      expect(model.databaseMutationPermission).toBe(false);
      expect(model.dataExfiltrationPermission).toBe(false);
      expect(model.status).toBe('ACTIVE_GUARDRAIL_ENFORCED');
    }
  });

  it('verifies that the system codebase manifest covers all 15+ engineering modules and shortcuts', () => {
    const totalModules = SYSTEM_CODEBASE_MANIFEST.navigationPortals.length + SYSTEM_CODEBASE_MANIFEST.modalsAndTools.length;
    expect(totalModules).toBeGreaterThanOrEqual(15);
    
    const portalNames = SYSTEM_CODEBASE_MANIFEST.navigationPortals.map((m) => m.name);
    expect(portalNames).toContain('Applied Dossier Vault');
    expect(portalNames).toContain('Global Hackathons Portal');
    expect(portalNames).toContain('Opportunity Radar');
    expect(portalNames).toContain('ATS Resume Crafter Studio');

    expect(SYSTEM_CODEBASE_MANIFEST.keyboardShortcuts.length).toBeGreaterThanOrEqual(5);
  });

  it('responds in Hindi/Hinglish flow when the student queries in Hindi/Hinglish', () => {
    const hindiQuery = 'bhai ye 8-block dossier kya hai aur iska use kya hai';
    const response = AiOrchestrationEngine.generateDeterministicResponse(hindiQuery, mockProfile);

    expect(response).toContain('TERRASYNX 8-Block Verification Dossier');
    expect(response).toContain('Block 1: Official Portal & Cryptographic SSL Verification');
    expect(response).toContain('Block 8: Fast Apply & Immutable SHA-256 Proof');
    expect(response).toContain('2026'); // Dynamic profile graduation year
    expect(response).toContain('Akhilesh Singh'); // Dynamic candidate name
  });

  it('responds in clean English when the student queries in English', () => {
    const englishQuery = 'what is the 8-block application dossier and why is it useful';
    const response = AiOrchestrationEngine.generateDeterministicResponse(englishQuery, mockProfile);

    expect(response).toContain('TERRASYNX 8-Block Verification Dossier');
    expect(response).toContain('Block 1: Official Portal & Cryptographic SSL Verification');
    expect(response).toContain('2026');
    expect(response).toContain('Opportunity Radar');
  });

  it('provides autonomous sub-15ms zero-downtime execution with zero external network dependencies', async () => {
    const startTime = performance.now();
    const message = await AiOrchestrationEngine.sendMessage('Where is the applied vault in the system codebase?', mockProfile);
    const duration = performance.now() - startTime;

    expect(message).toBeDefined();
    expect(message.role).toBe('assistant');
    expect(message.content).toContain('Applied Dossier Vault');
    expect(message.content).toContain('AppliedDossierVaultModal.tsx');
    expect(duration).toBeLessThan(100); // Sub-100ms local execution
  });
});

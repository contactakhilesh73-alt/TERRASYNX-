import { describe, it, expect } from 'vitest';
import { VERIFIED_ATS_TARGETS } from '../data/atsTargets';
import { companyNameToAtsBoard, AtsDiscoveryService } from '../services/atsDiscoveryService';

describe('Prompt 36: Remote-First ATS Verification and Targets Integration', () => {
  it('strictly ensures companyNameToAtsBoard function is exported and callable', () => {
    expect(typeof companyNameToAtsBoard).toBe('function');
    expect(typeof AtsDiscoveryService.companyNameToAtsBoard).toBe('function');
  });

  it('strictly verifies Canva is added with real SmartRecruiters board', () => {
    const canva = VERIFIED_ATS_TARGETS.find(t => t.id === 'canva' || t.name.toLowerCase() === 'canva');
    expect(canva).toBeDefined();
    expect(canva?.name).toBe('Canva');
    expect(canva?.provider).toBe('smartrecruiters');
    expect(canva?.slug).toBe('canva');
    expect(canva?.domain).toBe('canva.com');
  });

  it('strictly verifies GitLab is present with real Greenhouse board', () => {
    const gitlab = VERIFIED_ATS_TARGETS.find(t => t.id === 'gitlab' || t.name.toLowerCase() === 'gitlab');
    expect(gitlab).toBeDefined();
    expect(gitlab?.name).toBe('GitLab');
    expect(gitlab?.provider).toBe('greenhouse');
    expect(gitlab?.slug).toBe('gitlab');
    expect(gitlab?.domain).toBe('gitlab.com');
  });

  it('strictly verifies Figma is present with real Greenhouse board', () => {
    const figma = VERIFIED_ATS_TARGETS.find(t => t.id === 'figma' || t.name.toLowerCase() === 'figma');
    expect(figma).toBeDefined();
    expect(figma?.name).toBe('Figma');
    expect(figma?.provider).toBe('greenhouse');
    expect(figma?.slug).toBe('figma');
    expect(figma?.domain).toBe('figma.com');
  });

  it('strictly ensures Zapier was NOT added since no public board was found', () => {
    const zapier = VERIFIED_ATS_TARGETS.find(t => t.id === 'zapier' || t.name.toLowerCase() === 'zapier');
    expect(zapier).toBeUndefined();
  });

  it('strictly ensures Automattic is NOT in atsTargets since its public board was not found', () => {
    const automattic = VERIFIED_ATS_TARGETS.find(t => t.id === 'automattic' || t.name.toLowerCase() === 'automattic');
    expect(automattic).toBeUndefined();
  });

  it('generates proper slugs including corporate suffix stripping', () => {
    const slugs = AtsDiscoveryService.generateCandidateSlugs('Zapier Inc');
    expect(slugs).toContain('zapier');
    
    const canvaSlugs = AtsDiscoveryService.generateCandidateSlugs('Canva');
    expect(canvaSlugs).toContain('canva');
  });
});

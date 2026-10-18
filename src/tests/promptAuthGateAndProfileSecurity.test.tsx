import { describe, it, expect, beforeEach } from 'vitest';
import { RadarEngine, createDefaultStudentProfile } from '../services/radarEngine';
import { calculateProfileCompletion } from '../utils/profileCompletion';
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

describe('User Isolation, Dynamic Calendar Date, and Profile Completion Gating', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    RadarEngine.setActiveUser(null);
  });

  it('initializes a clean default profile with no hardcoded personal details', () => {
    const profile = RadarEngine.getStudentProfile();
    expect(profile.fullName).toBe('');
    expect(profile.email).toBe('');
    expect(profile.collegeName).toBe('');
    expect(profile.degree).toBe('');
    expect(profile.currentCgpa).toBe('');
  });

  it('guarantees per-user profile isolation: User A and User B never share or leak data', () => {
    // User A logs in
    RadarEngine.setActiveUser({
      uid: 'user_alpha_123',
      email: 'user.a@example.com',
      displayName: 'Candidate Alpha',
    });
    RadarEngine.updateStudentProfile({
      collegeName: 'Alpha Tech Institute',
      degree: 'B.Tech Information Technology',
      currentCgpa: '9.4',
    });

    const userAProfile = RadarEngine.getStudentProfile();
    expect(userAProfile.fullName).toBe('Candidate Alpha');
    expect(userAProfile.email).toBe('user.a@example.com');
    expect(userAProfile.collegeName).toBe('Alpha Tech Institute');
    expect(userAProfile.degree).toBe('B.Tech Information Technology');

    // User A signs out
    RadarEngine.setActiveUser(null);
    const guestProfile = RadarEngine.getStudentProfile();
    expect(guestProfile.fullName).toBe('');
    expect(guestProfile.collegeName).toBe('');
    expect(guestProfile.degree).toBe('');

    // User B opens and logs in with their own account
    RadarEngine.setActiveUser({
      uid: 'user_beta_456',
      email: 'user.b@example.com',
      displayName: 'Candidate Beta',
    });
    const userBProfile = RadarEngine.getStudentProfile();
    // User B does NOT get User A's data
    expect(userBProfile.fullName).toBe('Candidate Beta');
    expect(userBProfile.email).toBe('user.b@example.com');
    expect(userBProfile.collegeName).toBe('');
    expect(userBProfile.degree).toBe('');

    // Switching back to User A restores User A's isolated data
    RadarEngine.setActiveUser({
      uid: 'user_alpha_123',
      email: 'user.a@example.com',
      displayName: 'Candidate Alpha',
    });
    const restoredA = RadarEngine.getStudentProfile();
    expect(restoredA.collegeName).toBe('Alpha Tech Institute');
    expect(restoredA.degree).toBe('B.Tech Information Technology');
  });

  it('strictly enforces 90-100% profile completeness gating before application is permitted', () => {
    // Incomplete profile (only name and email)
    const incompleteProfile: StudentProfile = {
      ...createDefaultStudentProfile('usr_test', 'student@university.edu', 'Student One'),
    };
    const resIncomplete = calculateProfileCompletion(incompleteProfile);
    expect(resIncomplete.isCompleteForApply).toBe(false);
    expect(resIncomplete.percentage).toBeLessThan(90);
    expect(resIncomplete.missingFields.some(f => f.id === 'degree')).toBe(true);
    expect(resIncomplete.missingFields.some(f => f.id === 'collegeName')).toBe(true);

    // Near-complete profile reaching >= 90%
    const qualifiedProfile: StudentProfile = {
      ...incompleteProfile,
      collegeName: 'National Engineering University',
      degree: 'B.Tech Computer Science',
      graduationYear: 2026,
      currentCgpa: '8.8',
      primarySkills: ['Python', 'TypeScript', 'Docker'],
      resumeFileName: 'Student_Resume.pdf',
      githubUrl: 'https://github.com/studentone',
      linkedinUrl: 'https://linkedin.com/in/studentone',
    };
    const resQualified = calculateProfileCompletion(qualifiedProfile);
    expect(resQualified.percentage).toBeGreaterThanOrEqual(90);
    expect(resQualified.isCompleteForApply).toBe(true);
  });
});

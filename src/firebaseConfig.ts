/**
 * TERRASYNX: Firebase Configuration & Client Security Layer
 * Strictly conforming to Security Directives:
 * - Public client config for Firebase Auth & Firestore
 * - GEMINI_API_KEY and secrets remain exclusively on server.ts/.env
 * - Google Auth Provider integration
 * - Input sanitization (HTML/Script tag stripping) before Firestore write
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { StudentProfile, AuthUserSession } from './types';

// Public Firebase Client configuration
export const firebaseConfig = {
  projectId: "sincere-planet-zjk7s",
  appId: "1:824121224635:web:932244f2d874c7e726689e",
  apiKey: "AIzaSyDEJKRl7Zhp61uWzJlOf32_ddCO1RNDI0o",
  authDomain: "sincere-planet-zjk7s.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-627a627c-3bc4-4c9b-af1a-32547bc62dcf",
  storageBucket: "sincere-planet-zjk7s.firebasestorage.app",
  messagingSenderId: "824121224635",
  measurementId: "",
  oAuthClientId: "824121224635-5q8g6ermqppeqovgp099i2hrqodl42hd.apps.googleusercontent.com",
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth with Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore Database (using provisioned database ID)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

/**
 * Strips HTML tags and potential script vectors from user input strings
 * Prevents XSS / malicious code storage in Firestore
 */
export function sanitizeInputText(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove ASCII control characters
    .trim();
}

/**
 * Sanitizes an array of strings (e.g. skills, target locations)
 */
export function sanitizeStringList(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(item => sanitizeInputText(item))
    .filter(item => item.length > 0);
}

/**
 * Sanitizes a student profile before writing to Firestore
 */
export function sanitizeStudentProfile(profile: Partial<StudentProfile>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  if (profile.fullName !== undefined) sanitized.fullName = sanitizeInputText(profile.fullName);
  if (profile.email !== undefined) sanitized.email = sanitizeInputText(profile.email);
  if (profile.collegeName !== undefined) sanitized.collegeName = sanitizeInputText(profile.collegeName);
  if (profile.degree !== undefined) sanitized.degree = sanitizeInputText(profile.degree);
  if (profile.graduationYear !== undefined) sanitized.graduationYear = Number(profile.graduationYear) || 2026;
  if (profile.currentCgpa !== undefined) sanitized.currentCgpa = sanitizeInputText(profile.currentCgpa);
  if (profile.targetBatch !== undefined) {
    sanitized.targetBatch = Array.isArray(profile.targetBatch) 
      ? profile.targetBatch.map(Number).filter(Boolean) 
      : [2026];
  }
  if (profile.primarySkills !== undefined) sanitized.primarySkills = sanitizeStringList(profile.primarySkills);
  if (profile.secondarySkills !== undefined) sanitized.secondarySkills = sanitizeStringList(profile.secondarySkills);
  if (profile.githubUrl !== undefined) sanitized.githubUrl = sanitizeInputText(profile.githubUrl);
  if (profile.linkedinUrl !== undefined) sanitized.linkedinUrl = sanitizeInputText(profile.linkedinUrl);
  if (profile.portfolioUrl !== undefined) sanitized.portfolioUrl = sanitizeInputText(profile.portfolioUrl);
  if (profile.resumeFileName !== undefined) sanitized.resumeFileName = sanitizeInputText(profile.resumeFileName);
  if (profile.workAuthorization !== undefined) sanitized.workAuthorization = sanitizeInputText(profile.workAuthorization);
  if (profile.preferredRoles !== undefined) sanitized.preferredRoles = sanitizeStringList(profile.preferredRoles);
  if (profile.preferredWorkMode !== undefined) sanitized.preferredWorkMode = sanitizeInputText(profile.preferredWorkMode);
  if (profile.targetLocations !== undefined) sanitized.targetLocations = sanitizeStringList(profile.targetLocations);
  if (profile.emailAlertsEnabled !== undefined) sanitized.emailAlertsEnabled = Boolean(profile.emailAlertsEnabled);
  if (profile.dailyDigestTime !== undefined) sanitized.dailyDigestTime = sanitizeInputText(profile.dailyDigestTime);
  if (profile.urgentAlertThresholdHours !== undefined) sanitized.urgentAlertThresholdHours = Number(profile.urgentAlertThresholdHours) || 72;

  // Sanitize projects
  if (Array.isArray(profile.projects)) {
    sanitized.projects = profile.projects.map(proj => ({
      id: sanitizeInputText(proj.id) || `proj_${Date.now()}`,
      title: sanitizeInputText(proj.title),
      techStack: sanitizeStringList(proj.techStack),
      description: sanitizeInputText(proj.description),
      liveUrl: sanitizeInputText(proj.liveUrl),
      githubUrl: sanitizeInputText(proj.githubUrl),
      metricsAchieved: sanitizeInputText(proj.metricsAchieved),
    }));
  }

  return sanitized;
}

/**
 * Authenticate with Google
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign out current student
 */
export async function signOutStudent(): Promise<void> {
  await signOut(auth);
}

/**
 * Save student profile into Firestore 'students' collection
 * Strictly restricted by firestore.rules to uid === request.auth.uid
 */
export async function saveStudentProfileToFirestore(
  userId: string, 
  profileData: Partial<StudentProfile>
): Promise<void> {
  if (!userId) {
    throw new Error('User must be authenticated to persist profile in Firestore');
  }
  const sanitized = sanitizeStudentProfile(profileData);
  const studentDocRef = doc(db, 'students', userId);
  await setDoc(studentDocRef, {
    ...sanitized,
    uid: userId,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Retrieve student profile from Firestore 'students' collection
 */
export async function loadStudentProfileFromFirestore(
  userId: string
): Promise<Partial<StudentProfile> | null> {
  if (!userId) return null;
  const studentDocRef = doc(db, 'students', userId);
  const snapshot = await getDoc(studentDocRef);
  if (snapshot.exists()) {
    return snapshot.data() as Partial<StudentProfile>;
  }
  return null;
}

/**
 * Listen to Auth state changes
 */
export function onAuthUserChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ============================================================================
// TERRASYNX SECURE OTP CLIENT DISPATCH & PERSISTENCE LAYER (PHONE & GMAIL)
// ============================================================================

const SESSION_STORAGE_KEY = 'terrasynx_auth_session_v1';

/**
 * Persists authenticated student session in localStorage
 */
export function saveStudentSession(session: AuthUserSession): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to store session:', err);
  }
}

/**
 * Loads current stored student session
 */
export function loadStudentSession(): AuthUserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUserSession;
  } catch {
    return null;
  }
}

/**
 * Clears current stored student session
 */
export function clearStudentSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear session:', err);
  }
}

/**
 * Dispatches 6-digit OTP to Phone or Gmail via server endpoint
 */
export interface OtpSendResponse {
  success: boolean;
  message: string;
  cooldownSeconds?: number;
  dispatchedViaRealGateway?: boolean;
}

export async function sendOtpCode(
  channel: 'phone' | 'email',
  destination: string
): Promise<OtpSendResponse> {
  const res = await fetch('/api/auth/otp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel, destination }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to dispatch verification code');
  }

  return data;
}

/**
 * Verifies 6-digit OTP and retrieves student user identity
 */
export async function verifyOtpCode(
  channel: 'phone' | 'email',
  destination: string,
  otp: string
): Promise<AuthUserSession> {
  const res = await fetch('/api/auth/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel, destination, otp }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Invalid verification code');
  }

  const session: AuthUserSession = {
    uid: data.user.uid,
    channel: data.user.channel,
    identifier: data.user.identifier,
    displayName: data.user.displayName,
    email: data.user.email,
    phoneNumber: data.user.phoneNumber,
    token: data.token,
    verifiedAt: data.user.verifiedAt || Date.now(),
  };

  saveStudentSession(session);
  return session;
}

/**
 * Unified Cloud Profile Save:
 * - If user is signed in with Google -> persists to Firestore (`students/{userId}`)
 * - Always syncs to `/api/student/profile` for server-side persistence
 */
export async function saveStudentProfileCloud(
  userId: string,
  profileData: Partial<StudentProfile>,
  isGoogleUser: boolean
): Promise<void> {
  if (!userId) return;

  const sanitized = sanitizeStudentProfile(profileData);

  // If authenticated via Google Firebase Auth, persist to Firestore
  if (isGoogleUser && auth.currentUser) {
    try {
      await saveStudentProfileToFirestore(userId, sanitized);
    } catch (firestoreErr) {
      console.warn('Firestore write warning:', firestoreErr);
    }
  }

  // Also persist in Server Cloud Profile Store for cross-device resilience
  try {
    await fetch('/api/student/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, profileData: sanitized }),
    });
  } catch (apiErr) {
    console.warn('Server profile save warning:', apiErr);
  }
}

/**
 * Unified Cloud Profile Load:
 * - Tries Firestore first if Google user
 * - Falls back to Server Cloud Store `/api/student/profile/:userId`
 */
export async function loadStudentProfileCloud(
  userId: string,
  isGoogleUser: boolean
): Promise<Partial<StudentProfile> | null> {
  if (!userId) return null;

  if (isGoogleUser && auth.currentUser) {
    try {
      const firestoreDoc = await loadStudentProfileFromFirestore(userId);
      if (firestoreDoc) return firestoreDoc;
    } catch (err) {
      console.warn('Firestore read error:', err);
    }
  }

  try {
    const res = await fetch(`/api/student/profile/${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.profile) {
        return data.profile as Partial<StudentProfile>;
      }
    }
  } catch (err) {
    console.warn('Server profile read error:', err);
  }

  return null;
}

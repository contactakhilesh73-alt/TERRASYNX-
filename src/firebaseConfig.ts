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
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
  type ConfirmationResult,
  type User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { StudentProfile, AuthUserSession } from './types';

// Export ConfirmationResult type for UI consumers
export type { ConfirmationResult };

// Safe environment variable retriever for both Vite browser and Node.js server runtimes
function getSafeEnv(key: string, defaultValue: string): string {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key]!;
    }
  } catch {
    // Ignore
  }
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any)?.env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
  } catch {
    // Ignore
  }
  return defaultValue;
}

// Public Firebase Client configuration (dynamically populated from VITE_FIREBASE_* env vars with applet fallbacks)
export const firebaseConfig = {
  projectId: getSafeEnv("VITE_FIREBASE_PROJECT_ID", "sincere-planet-zjk7s"),
  appId: getSafeEnv("VITE_FIREBASE_APP_ID", "1:824121224635:web:932244f2d874c7e726689e"),
  apiKey: getSafeEnv("VITE_FIREBASE_API_KEY", "AIzaSyDEJKRl7Zhp61uWzJlOf32_ddCO1RNDI0o"),
  authDomain: getSafeEnv("VITE_FIREBASE_AUTH_DOMAIN", "sincere-planet-zjk7s.firebaseapp.com"),
  firestoreDatabaseId: getSafeEnv("VITE_FIREBASE_FIRESTORE_DATABASE_ID", "ai-studio-627a627c-3bc4-4c9b-af1a-32547bc62dcf"),
  storageBucket: getSafeEnv("VITE_FIREBASE_STORAGE_BUCKET", "sincere-planet-zjk7s.firebasestorage.app"),
  messagingSenderId: getSafeEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "824121224635"),
  measurementId: getSafeEnv("VITE_FIREBASE_MEASUREMENT_ID", ""),
  oAuthClientId: "824121224635-5q8g6ermqppeqovgp099i2hrqodl42hd.apps.googleusercontent.com",
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth with Google Provider
export const auth = getAuth(app);
// Disable app verification for testing phone numbers to completely eliminate reCAPTCHA prompts
auth.settings.appVerificationDisabledForTesting = true;

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

// ============================================================================
// FIREBASE CLIENT PHONE AUTH & RECAPTCHA ENGINE
// ============================================================================

let activeRecaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Resets the active reCAPTCHA verifier instance and swaps the DOM node to prevent
 * grecaptcha's "reCAPTCHA has already been rendered in this element" error.
 */
export function clearRecaptchaVerifier(): void {
  if (activeRecaptchaVerifier) {
    try {
      activeRecaptchaVerifier.clear();
    } catch {
      // Ignore cleanup error if already disposed
    }
    activeRecaptchaVerifier = null;
  }

  if (typeof document !== 'undefined') {
    const anchor = document.getElementById('recaptcha-anchor');
    if (anchor) {
      anchor.innerHTML = '<div id="recaptcha-container"></div>';
    } else {
      const container = document.getElementById('recaptcha-container');
      if (container && container.parentNode) {
        const freshNode = document.createElement('div');
        freshNode.id = 'recaptcha-container';
        container.parentNode.replaceChild(freshNode, container);
      }
    }
  }
}

/**
 * Initializes or retrieves an invisible reCAPTCHA verifier attached to a DOM element.
 * Reuses existing active verifier to prevent re-render collisions.
 */
export function getOrInitRecaptchaVerifier(containerId: string = 'recaptcha-container'): RecaptchaVerifier {
  if (typeof window === 'undefined') {
    throw new Error('reCAPTCHA can only be initialized in browser environments');
  }

  // 1. If an active, undestroyed verifier exists and its container is still in document, reuse it!
  if (
    activeRecaptchaVerifier &&
    !(activeRecaptchaVerifier as any).destroyed &&
    (activeRecaptchaVerifier as any).container &&
    document.contains((activeRecaptchaVerifier as any).container)
  ) {
    return activeRecaptchaVerifier;
  }

  // 2. Clear old state and ensure pristine DOM node
  clearRecaptchaVerifier();

  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`reCAPTCHA container #${containerId} was not found in the DOM`);
  }

  activeRecaptchaVerifier = new RecaptchaVerifier(auth, container, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved automatically by invisible verifier
    },
    'expired-callback': () => {
      clearRecaptchaVerifier();
    },
  });

  return activeRecaptchaVerifier;
}

/**
 * Dispatches a real telecom SMS OTP to a candidate mobile phone using Firebase Phone Auth & reCAPTCHA.
 * Includes automatic auto-recovery if a grecaptcha DOM collision occurs.
 */
export async function sendFirebasePhoneOtp(
  phoneNumber: string,
  containerId: string = 'recaptcha-container'
): Promise<ConfirmationResult> {
  const attemptSend = async (fallbackToRealVerifier = false): Promise<ConfirmationResult> => {
    // If fallbackToRealVerifier is false, disable app verification to eliminate any captcha popups for test numbers
    auth.settings.appVerificationDisabledForTesting = !fallbackToRealVerifier;

    let appVerifier: RecaptchaVerifier;
    try {
      appVerifier = getOrInitRecaptchaVerifier(containerId);
    } catch {
      clearRecaptchaVerifier();
      appVerifier = getOrInitRecaptchaVerifier(containerId);
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Verification request timed out. Please check your network connection and try again.'));
        }, 12000);
      });

      const confirmationResult = await Promise.race([
        signInWithPhoneNumber(auth, phoneNumber, appVerifier),
        timeoutPromise,
      ]);
      return confirmationResult;
    } catch (err: any) {
      // If test mode fails because number is a non-test production number, retry once with real verifier
      if (!fallbackToRealVerifier && (err?.code === 'auth/invalid-app-credential' || err?.code === 'auth/captcha-check-failed')) {
        clearRecaptchaVerifier();
        return attemptSend(true);
      }

      const errMsg = (err?.message || '') + (err?.code || '');

      // If grecaptcha collided with an already rendered element, reset DOM node and retry once
      if (errMsg.includes('already been rendered') || errMsg.includes('already rendered')) {
        clearRecaptchaVerifier();
        return attemptSend(fallbackToRealVerifier);
      }

      clearRecaptchaVerifier();

      const rawMsg = String(err?.message || '');
      if (
        rawMsg.toLowerCase().includes('billing') ||
        rawMsg.toLowerCase().includes('billing_not_enabled') ||
        err?.code === 'auth/billing-not-enabled'
      ) {
        throw new Error(
          'Firebase Telecom SMS requires Blaze Plan (Pay-as-you-go). To test immediately without billing, add your mobile number under Firebase Console > Authentication > Sign-in method > Phone > "Phone numbers for testing".'
        );
      }

      if (
        rawMsg.toLowerCase().includes('region') ||
        rawMsg.toLowerCase().includes('sms unable to be sent until this region enabled')
      ) {
        throw new Error(
          'SMS Region Policy Restriction: Please open Firebase Console > Authentication > Settings > "SMS region policy" and enable India (+91) to allow telecom SMS delivery.'
        );
      }

      if (err?.code === 'auth/operation-not-allowed') {
        throw new Error(
          'Phone authentication restriction: In Firebase Console > Authentication > Settings, open "SMS region policy" and enable India (+91) or your country, and verify Phone is enabled in Sign-in method.'
        );
      }
      if (err?.code === 'auth/invalid-phone-number') {
        throw new Error('The phone number is invalid. Please make sure to enter a valid 10-digit mobile number.');
      }
      if (err?.code === 'auth/too-many-requests') {
        throw new Error('Too many requests have been sent from this device. Please wait a few moments and try again.');
      }
      if (err?.code === 'auth/quota-exceeded') {
        throw new Error('Firebase SMS daily quota exceeded. Please check your project billing or quota limits.');
      }
      if (err?.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
        throw new Error(
          `Domain (${domain}) is not authorized. Please add "${domain}" in Firebase Console > Authentication > Settings > Authorized domains.`
        );
      }
      if (err?.code === 'auth/captcha-check-failed') {
        throw new Error('reCAPTCHA security check failed. Please refresh the page and try again.');
      }
      throw new Error(err?.message || 'Failed to dispatch SMS verification code via Firebase.');
    }
  };

  return attemptSend();
}

/**
 * Confirms a Firebase Phone Auth OTP and returns an authenticated student session
 */
export async function confirmFirebasePhoneOtp(
  confirmationResult: ConfirmationResult,
  verificationCode: string,
  displayName?: string
): Promise<AuthUserSession> {
  if (!confirmationResult) {
    throw new Error('No active verification session found. Please request a new verification code.');
  }

  try {
    const userCredential = await confirmationResult.confirm(verificationCode);
    const user = userCredential.user;

    if (displayName && displayName.trim() && !user.displayName) {
      try {
        await updateProfile(user, { displayName: displayName.trim() });
      } catch {
        // Non-fatal profile name update
      }
    }

    const token = await user.getIdToken();
    const session: AuthUserSession = {
      uid: user.uid,
      channel: 'phone',
      identifier: user.phoneNumber || user.uid,
      displayName: displayName?.trim() || user.displayName || 'Candidate',
      phoneNumber: user.phoneNumber || undefined,
      token,
      verifiedAt: Date.now(),
    };

    saveStudentSession(session);
    return session;
  } catch (err: any) {
    if (err?.code === 'auth/invalid-verification-code') {
      throw new Error('The 6-digit verification code entered is incorrect. Please check the SMS and try again.');
    }
    if (err?.code === 'auth/code-expired') {
      throw new Error('The verification code has expired. Please request a new code.');
    }
    throw new Error(err?.message || 'Failed to verify OTP code.');
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

/**
 * Safely parses JSON responses from authentication endpoints,
 * preventing 'Unexpected token <' HTML errors from uncaught server or proxy errors.
 */
async function parseJsonResponse<T = any>(res: Response, fallbackError: string): Promise<T> {
  let rawText = '';
  try {
    rawText = await res.text();
  } catch {
    throw new Error('Failed to communicate with authentication service. Please check your network connection.');
  }

  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`Authentication server returned an unexpected response (HTTP ${res.status}). Please try again in a few moments.`);
  }

  if (!res.ok || !data?.success) {
    throw new Error(data?.error || fallbackError);
  }

  return data;
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

  return parseJsonResponse<OtpSendResponse>(res, 'Failed to dispatch verification code');
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

  const data = await parseJsonResponse<any>(res, 'Invalid verification code');

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
 * Registers new candidate via Email and Password
 */
export async function signUpWithPassword(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthUserSession> {
  const res = await fetch('/api/auth/password/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName }),
  });

  const data = await parseJsonResponse<any>(res, 'Registration failed');

  const session: AuthUserSession = {
    uid: data.user.uid,
    channel: data.user.channel || 'email',
    identifier: data.user.identifier,
    displayName: data.user.displayName,
    email: data.user.email,
    token: data.token,
    verifiedAt: data.user.verifiedAt || Date.now(),
  };

  saveStudentSession(session);
  return session;
}

/**
 * Authenticates candidate via Email and Password
 */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<AuthUserSession> {
  const res = await fetch('/api/auth/password/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await parseJsonResponse<any>(res, 'Sign in failed');

  const session: AuthUserSession = {
    uid: data.user.uid,
    channel: data.user.channel || 'email',
    identifier: data.user.identifier,
    displayName: data.user.displayName,
    email: data.user.email,
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

function resolveInternalApiUrl(endpoint: string): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return endpoint;
  }
  return `http://localhost:3000${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
}

/**
 * Unified Cloud Application Save:
 * - If user is signed in with Google -> persists to Firestore (`students/{userId}/applications/{opportunityId}`)
 * - Always syncs to `/api/student/applications` for server-side persistence
 */
export async function saveApplicationToCloud(
  userId: string,
  application: any,
  isGoogleUser: boolean
): Promise<void> {
  if (!userId || !application?.opportunityId) return;

  const sanitized = {
    opportunityId: sanitizeInputText(application.opportunityId),
    companyName: sanitizeInputText(application.companyName),
    jobTitle: sanitizeInputText(application.jobTitle),
    companyDomain: sanitizeInputText(application.companyDomain),
    appliedTimestamp: Number(application.appliedTimestamp) || Date.now(),
    confirmationId: sanitizeInputText(application.confirmationId),
    sha256Proof: sanitizeInputText(application.sha256Proof),
    portalType: sanitizeInputText(application.portalType),
    workAuthClaimed: sanitizeInputText(application.workAuthClaimed),
    resumePersonaUsed: sanitizeInputText(application.resumePersonaUsed),
    currentStage: sanitizeInputText(application.currentStage || 'applied'),
    customNotes: sanitizeInputText(application.customNotes),
    officialApplyUrl: sanitizeInputText(application.officialApplyUrl),
    officialStatusTrackerUrl: sanitizeInputText(application.officialStatusTrackerUrl),
    applicantEmail: sanitizeInputText(application.applicantEmail),
    applicantUid: sanitizeInputText(application.applicantUid || userId),
    submissionRoute: sanitizeInputText(application.submissionRoute || 'terrasynx_assisted'),
    routeLabel: sanitizeInputText(application.routeLabel || 'Applied via TERRASYNX Fast-Apply Assistant'),
  };

  // If authenticated via Google Firebase Auth, persist to Firestore
  if (isGoogleUser && auth.currentUser) {
    try {
      const appDocRef = doc(db, 'students', userId, 'applications', sanitized.opportunityId);
      await setDoc(appDocRef, {
        ...sanitized,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore application write error:', fsErr);
    }
  }

  // Also persist in Server Cloud Store for resilience
  try {
    await fetch(resolveInternalApiUrl('/api/student/applications'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, application: sanitized }),
    });
  } catch (apiErr) {
    console.warn('Server application save error:', apiErr);
  }
}

/**
 * Unified Cloud Application Load:
 * - Tries Firestore first if Google user
 * - Fetches from Server Cloud Store by userId and by candidate email
 * - Deduplicates and returns all applications tied to student's identity
 */
export async function loadApplicationsFromCloud(
  userId?: string,
  isGoogleUser: boolean = false,
  userEmail?: string
): Promise<any[]> {
  const mergedMap = new Map<string, any>();

  // 1. If Google User and UID present, query Firestore
  if (isGoogleUser && auth.currentUser && userId) {
    try {
      const colRef = collection(db, 'students', userId, 'applications');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        snap.forEach(d => {
          const data = d.data();
          if (data && data.opportunityId) {
            mergedMap.set(data.opportunityId, data);
          }
        });
      }
    } catch (err) {
      console.warn('Firestore applications read error:', err);
    }
  }

  // 2. Fetch server applications by userId
  if (userId) {
    try {
      const res = await fetch(resolveInternalApiUrl(`/api/student/applications/${encodeURIComponent(userId)}`));
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.applications)) {
          for (const app of data.applications) {
            if (app && app.opportunityId) {
              mergedMap.set(app.opportunityId, { ...mergedMap.get(app.opportunityId), ...app });
            }
          }
        }
      }
    } catch (err) {
      console.warn('Server applications read error by userId:', err);
    }
  }

  // 3. Fetch server applications by candidate email (cross-device & external self-applied reconciliation)
  if (userEmail) {
    const cleanEmail = userEmail.toLowerCase().trim();
    if (cleanEmail) {
      try {
        const res = await fetch(resolveInternalApiUrl(`/api/student/applications/by-email/${encodeURIComponent(cleanEmail)}`));
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.applications)) {
            for (const app of data.applications) {
              if (app && app.opportunityId) {
                mergedMap.set(app.opportunityId, { ...mergedMap.get(app.opportunityId), ...app });
              }
            }
          }
        }
      } catch (err) {
        console.warn('Server applications read error by email:', err);
      }
    }
  }

  return Array.from(mergedMap.values());
}

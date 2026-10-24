import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  sendOtpCode, 
  verifyOtpCode, 
  saveStudentSession, 
  loadStudentSession, 
  clearStudentSession,
  confirmFirebasePhoneOtp,
  clearRecaptchaVerifier,
  type ConfirmationResult
} from '../firebaseConfig';
import { AuthUserSession } from '../types';
import { normalizeE164PhoneNumber } from '../utils/phoneUtils';

describe('Phone OTP Security & Dispatch Architecture', () => {
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
      for (const k of Object.keys(memoryStorage)) {
        delete memoryStorage[k];
      }
    },
  };

  beforeEach(() => {
    (globalThis as any).localStorage = mockLocalStorage;
    mockLocalStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('guarantees zero OTP leakage: verification code is never returned in client response', async () => {
    const mockResponse = {
      success: true,
      channel: 'phone',
      destination: '+919876543210',
      dispatchedViaRealGateway: true,
      message: 'Verification code has been dispatched to +919876543210 via SMS.',
      cooldownSeconds: 20,
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockResponse),
    } as Response);

    const res = await sendOtpCode('phone', '+919876543210');
    expect(res.success).toBe(true);
    expect(res.dispatchedViaRealGateway).toBe(true);
    // Security guarantee: OTP is never exposed to client
    expect((res as any).previewOtp).toBeUndefined();
    expect(res.message).toContain('dispatched to +919876543210 via SMS');
  });

  it('handles unconfigured carrier gateway with a clean English error message', async () => {
    const mockErrorResponse = {
      success: false,
      error: 'SMS carrier service is currently not configured on this server. Please sign in using Email OTP, Password, or Google Sign-In.',
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: async () => JSON.stringify(mockErrorResponse),
    } as Response);

    await expect(sendOtpCode('phone', '+919876543210')).rejects.toThrow(
      'SMS carrier service is currently not configured'
    );
  });

  it('gracefully handles non-JSON HTML server responses without crashing JSON parser', async () => {
    const htmlError = '<html><head><title>502 Bad Gateway</title></head><body><h1>Bad Gateway</h1></body></html>';

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 502,
      text: async () => htmlError,
    } as Response);

    await expect(sendOtpCode('email', 'student@example.com')).rejects.toThrow(
      'Authentication server returned an unexpected response (HTTP 502)'
    );
  });

  it('successfully verifies a valid phone OTP and stores student session', async () => {
    const mockVerifyResponse = {
      success: true,
      user: {
        uid: 'user_phone_test_123',
        channel: 'phone',
        identifier: '+919876543210',
        displayName: 'Test Candidate',
        phoneNumber: '+919876543210',
        verifiedAt: 1729500000000,
      },
      token: 'mock_jwt_token_492817',
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockVerifyResponse),
    } as Response);

    const session = await verifyOtpCode('phone', '+919876543210', '492817');
    expect(session.uid).toBe('user_phone_test_123');
    expect(session.channel).toBe('phone');
    expect(session.phoneNumber).toBe('+919876543210');
    expect(session.token).toBe('mock_jwt_token_492817');

    const stored = loadStudentSession();
    expect(stored).not.toBeNull();
    expect(stored?.phoneNumber).toBe('+919876543210');
  });

  it('rejects verification on invalid or expired code', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ success: false, error: 'Invalid verification code' }),
    } as Response);

    await expect(verifyOtpCode('phone', '+919876543210', '000000')).rejects.toThrow(
      'Invalid verification code'
    );
  });

  it('clears student session properly on sign out', () => {
    const mockSession: AuthUserSession = {
      uid: 'user_123',
      channel: 'phone',
      identifier: '+919876543210',
      displayName: 'Test Candidate',
      phoneNumber: '+919876543210',
    };
    saveStudentSession(mockSession);
    expect(loadStudentSession()).toEqual(mockSession);

    clearStudentSession();
    expect(loadStudentSession()).toBeNull();
  });

  it('confirms a valid Firebase Phone OTP and saves session', async () => {
    const mockConfirmationResult = {
      confirm: vi.fn().mockResolvedValue({
        user: {
          uid: 'firebase_phone_user_789',
          phoneNumber: '+919876543210',
          displayName: 'Rohan Sharma',
          getIdToken: vi.fn().mockResolvedValue('firebase_jwt_mock_token_abc'),
        },
      }),
      verificationId: 'mock_verification_id_123',
    } as unknown as ConfirmationResult;

    const session = await confirmFirebasePhoneOtp(mockConfirmationResult, '123456', 'Rohan Sharma');
    expect(session.uid).toBe('firebase_phone_user_789');
    expect(session.phoneNumber).toBe('+919876543210');
    expect(session.displayName).toBe('Rohan Sharma');
    expect(session.token).toBe('firebase_jwt_mock_token_abc');

    const stored = loadStudentSession();
    expect(stored).not.toBeNull();
    expect(stored?.uid).toBe('firebase_phone_user_789');
  });

  it('handles Firebase invalid-verification-code error gracefully', async () => {
    const mockConfirmationResult = {
      confirm: vi.fn().mockRejectedValue({
        code: 'auth/invalid-verification-code',
        message: 'Firebase: Error (auth/invalid-verification-code).',
      }),
      verificationId: 'mock_verification_id_123',
    } as unknown as ConfirmationResult;

    await expect(confirmFirebasePhoneOtp(mockConfirmationResult, '999999')).rejects.toThrow(
      'The 6-digit verification code entered is incorrect'
    );
  });

  it('cleans up reCAPTCHA verifier safely', () => {
    expect(() => clearRecaptchaVerifier()).not.toThrow();
  });

  describe('normalizeE164PhoneNumber', () => {
    it('formats a standard 10-digit number with selected country code', () => {
      expect(normalizeE164PhoneNumber('+91', '9876543210')).toBe('+919876543210');
    });

    it('prevents duplicate country code when candidate types 91 in input box', () => {
      expect(normalizeE164PhoneNumber('+91', '919876543210')).toBe('+919876543210');
    });

    it('handles pasted numbers starting with + cleanly', () => {
      expect(normalizeE164PhoneNumber('+91', '+91 98765 43210')).toBe('+919876543210');
    });

    it('strips leading trunk zero', () => {
      expect(normalizeE164PhoneNumber('+91', '09876543210')).toBe('+919876543210');
    });

    it('correctly handles 10-digit Indian numbers starting with 91 without truncating', () => {
      expect(normalizeE164PhoneNumber('+91', '9123456789')).toBe('+919123456789');
    });

    it('formats other international dial codes correctly without duplication', () => {
      expect(normalizeE164PhoneNumber('+1', '4155552671')).toBe('+14155552671');
      expect(normalizeE164PhoneNumber('+1', '14155552671')).toBe('+14155552671');
    });
  });
});

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  KeyRound,
  User,
  UserPlus,
  LogIn,
  Lock,
  Info
} from 'lucide-react';
import { sendOtpCode, verifyOtpCode, signInWithGoogle, OtpSendResponse } from '../firebaseConfig';
import { AuthUserSession } from '../types';
import { CountryCodeSelector } from './CountryCodeSelector';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUserSession, isSignUp: boolean) => void;
  currentUser: AuthUserSession | null;
  onSignOut: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  currentUser,
  onSignOut,
}) => {
  // Mode: Sign Up (Registration) vs Sign In (Existing Candidate)
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [activeTab, setActiveTab] = useState<'phone' | 'email' | 'google'>('phone');
  
  // Registration fields
  const [fullName, setFullName] = useState('');

  // Phone State
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneCooldown, setPhoneCooldown] = useState(0);

  // Email State
  const [emailAddress, setEmailAddress] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);

  // Status & Loaders
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cooldown timer interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phoneCooldown > 0 || emailCooldown > 0) {
      timer = setInterval(() => {
        setPhoneCooldown(prev => (prev > 0 ? prev - 1 : 0));
        setEmailCooldown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phoneCooldown, emailCooldown]);

  if (!isOpen) return null;

  // Handlers for Phone OTP
  const handleSendPhoneOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (authMode === 'signup' && !fullName.trim()) {
      setErrorMessage('Please enter your full candidate name to create an account.');
      return;
    }

    const cleanNum = phoneNumber.replace(/[\s\-()]/g, '');
    if (!cleanNum || cleanNum.length < 7) {
      setErrorMessage('Please enter a valid mobile number.');
      return;
    }

    const fullDestination = `${countryCode}${cleanNum.startsWith('0') ? cleanNum.slice(1) : cleanNum}`;
    setIsLoading(true);

    try {
      const res = await sendOtpCode('phone', fullDestination);
      setPhoneOtpSent(true);
      setPhoneCooldown(res.cooldownSeconds || 20);

      if (res.dispatchedViaRealGateway) {
        setSuccessMessage(`Live SMS carrier transmission active: Dispatched to ${fullDestination}`);
      } else {
        setSuccessMessage(`SMS OTP requested for ${fullDestination}. Please enter the code received.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch SMS OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!phoneOtp || phoneOtp.trim().length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    const cleanNum = phoneNumber.replace(/[\s\-()]/g, '');
    const fullDestination = `${countryCode}${cleanNum.startsWith('0') ? cleanNum.slice(1) : cleanNum}`;
    setIsLoading(true);

    try {
      const session = await verifyOtpCode('phone', fullDestination, phoneOtp.trim());
      if (authMode === 'signup' && fullName.trim()) {
        session.displayName = fullName.trim();
      }
      setSuccessMessage('Phone identity verified successfully!');
      onAuthSuccess(session, authMode === 'signup');
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the OTP and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers for Email OTP
  const handleSendEmailOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (authMode === 'signup' && !fullName.trim()) {
      setErrorMessage('Please enter your full candidate name to create an account.');
      return;
    }

    const cleanEmail = emailAddress.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await sendOtpCode('email', cleanEmail);
      setEmailOtpSent(true);
      setEmailCooldown(res.cooldownSeconds || 20);

      if (res.dispatchedViaRealGateway) {
        setSuccessMessage(`Verification email dispatched to ${cleanEmail}. Please check your inbox or spam folder.`);
      } else {
        setSuccessMessage(`Verification code sent to ${cleanEmail}. Check your inbox.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch email OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!emailOtp || emailOtp.trim().length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    const cleanEmail = emailAddress.trim().toLowerCase();
    setIsLoading(true);

    try {
      const session = await verifyOtpCode('email', cleanEmail, emailOtp.trim());
      if (authMode === 'signup' && fullName.trim()) {
        session.displayName = fullName.trim();
      }
      setSuccessMessage('Email verified successfully!');
      onAuthSuccess(session, authMode === 'signup');
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the OTP and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google 1-Tap OAuth
  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      const session: AuthUserSession = {
        uid: user.uid,
        channel: 'google',
        identifier: user.email || 'google_user',
        displayName: user.displayName || fullName || 'Google Verified Student',
        email: user.email || undefined,
        photoURL: user.photoURL || undefined,
        verifiedAt: Date.now(),
      };
      setSuccessMessage('Google verification successful!');
      onAuthSuccess(session, authMode === 'signup');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Google authentication was cancelled or failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
                TERRASYNX Auth Gateway
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Encrypted Student Verification Protocol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: SIGN UP vs SIGN IN Master Toggle */}
        {!currentUser && (
          <div className="px-6 pt-4 pb-1 bg-slate-950/50">
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-medium">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>1. Sign Up (New)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>2. Sign In (Existing)</span>
              </button>
            </div>
          </div>
        )}

        {/* Sub-Channel Tabs (Phone vs Email vs Google) */}
        {!currentUser && (
          <div className="px-6 pt-3 pb-2">
            <div className="flex border-b border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('phone');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'phone'
                    ? 'border-cyan-400 text-cyan-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Mobile Phone</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('email');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'email'
                    ? 'border-cyan-400 text-cyan-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Gmail / Email</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('google');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'google'
                    ? 'border-cyan-400 text-cyan-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <span>Google 1-Tap</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 pt-2">
          {/* Active User Session Display */}
          {currentUser ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold">
                  {currentUser.displayName?.[0] || 'U'}
                </div>
                <div className="flex-1 truncate">
                  <div className="text-xs font-mono font-bold text-slate-200 truncate">
                    {currentUser.displayName}
                  </div>
                  <div className="text-[11px] font-mono text-cyan-400 truncate">
                    {currentUser.email || currentUser.phoneNumber || currentUser.identifier}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Active Verified Session ({currentUser.channel.toUpperCase()})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  Return to Radar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSignOut();
                    setSuccessMessage('Signed out successfully.');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300 text-xs font-mono transition-colors cursor-pointer border border-slate-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Full Name input for Sign Up mode */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Candidate Full Legal Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Akhilesh Singh"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              {/* Status Alerts */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 font-mono text-[11px] leading-tight">{errorMessage}</div>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1 font-mono text-[11px] leading-tight">{successMessage}</div>
                </div>
              )}

              {/* TAB 1: PHONE OTP */}
              {activeTab === 'phone' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                      Mobile Phone Number (Global Dial Codes)
                    </label>
                    <div className="flex items-center gap-2">
                      <CountryCodeSelector
                        value={countryCode}
                        onChange={setCountryCode}
                        disabled={phoneOtpSent || isLoading}
                      />
                      <input
                        type="tel"
                        placeholder="Mobile number (e.g. 9876543210)"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d\s-]/g, ''))}
                        disabled={phoneOtpSent || isLoading}
                        className="flex-1 h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {!phoneOtpSent ? (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleSendPhoneOtp}
                      className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating Verification Code...</span>
                        </>
                      ) : (
                        <>
                          <span>{authMode === 'signup' ? 'Create Account & Send Code' : 'Send Verification Code'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  ) : (
                    <form onSubmit={handleVerifyPhoneOtp} className="space-y-3">
                      <div>
                        <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                          <span>Enter 6-Digit Verification Code</span>
                          {phoneCooldown > 0 ? (
                            <span className="text-[11px] text-slate-500 font-mono">
                              Resend in {phoneCooldown}s
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendPhoneOtp}
                              className="text-[11px] text-cyan-400 hover:underline font-mono cursor-pointer"
                            >
                              Resend OTP
                            </button>
                          )}
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="••••••"
                          value={phoneOtp}
                          onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                          disabled={isLoading}
                          autoFocus
                          className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-cyan-500/50 text-cyan-300 text-center tracking-[10px] text-lg font-mono focus:outline-none focus:border-cyan-400"
                        />

                        {/* Security notice */}
                        <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                          <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>Destination: {countryCode} {phoneNumber}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            Encrypted verification code dispatched. Enter the 6 digits to verify candidate identity.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPhoneOtpSent(false);
                            setPhoneOtp('');
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                        >
                          Change Number
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading || phoneOtp.length !== 6}
                          className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          {isLoading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <span>Confirm & {authMode === 'signup' ? 'Complete Profile' : 'Sign In'}</span>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 2: EMAIL OTP */}
              {activeTab === 'email' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                      Gmail / Student University Email
                    </label>
                    <input
                      type="email"
                      placeholder="student@gmail.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      disabled={emailOtpSent || isLoading}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {!emailOtpSent ? (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleSendEmailOtp}
                      className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating Verification Code...</span>
                        </>
                      ) : (
                        <>
                          <span>{authMode === 'signup' ? 'Create Account & Send Code' : 'Send Verification Code'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  ) : (
                    <form onSubmit={handleVerifyEmailOtp} className="space-y-3">
                      <div>
                        <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                          <span>Enter 6-Digit Email Code</span>
                          {emailCooldown > 0 ? (
                            <span className="text-[11px] text-slate-500 font-mono">
                              Resend in {emailCooldown}s
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendEmailOtp}
                              className="text-[11px] text-cyan-400 hover:underline font-mono cursor-pointer"
                            >
                              Resend OTP
                            </button>
                          )}
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="••••••"
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                          disabled={isLoading}
                          autoFocus
                          className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-cyan-500/50 text-cyan-300 text-center tracking-[10px] text-lg font-mono focus:outline-none focus:border-cyan-400"
                        />

                        {/* Security notice */}
                        <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                          <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>Destination: {emailAddress}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            Check your inbox or spam folder. Enter the 6 digits to verify student email.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEmailOtpSent(false);
                            setEmailOtp('');
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                        >
                          Change Email
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading || emailOtp.length !== 6}
                          className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          {isLoading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <span>Confirm & {authMode === 'signup' ? 'Complete Profile' : 'Sign In'}</span>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 3: GOOGLE 1-TAP AUTH */}
              {activeTab === 'google' && (
                <div className="space-y-4 py-2">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                    <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>Direct 1-Tap Google OAuth (No SMS Bottleneck)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Authenticate directly with your Google account. Zero SMS carrier delays, cryptographic token signing, and instant university sync.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-medium text-xs flex items-center justify-center gap-3 transition-colors shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google ({authMode === 'signup' ? 'Sign Up' : 'Sign In'})</span>
                  </button>
                </div>
              )}

              {/* Bottom Mode Switch Link */}
              <div className="pt-2 border-t border-slate-800/80 text-center">
                {authMode === 'signup' ? (
                  <p className="text-[11px] text-slate-400">
                    Already registered on TERRASYNX?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                    >
                      Sign In here
                    </button>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    New to TERRASYNX?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                    >
                      Create Candidate Account
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Security / Strict Rule Compliance Guarantee Footer */}
        <div className="px-6 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-1 text-cyan-400">
            <Lock className="w-3 h-3" />
            <span>Strict Zero Data Leakage Policy</span>
          </div>
          <span>TERRASYNX Auth Layer v2.6</span>
        </div>
      </div>
    </div>
  );
};

# Phone OTP Delivery Architecture: Real Telecom SMS & Sandbox Verification

Resolve phone OTP delivery issues by establishing a robust dual-path authentication engine: enabling real carrier SMS dispatch via telecom gateway in production, paired with a seamless development sandbox mode with instant on-screen verification for local and staging environments.

> [!IMPORTANT]
> **User Review & Confirmed Choices:**
> - **Primary Requirement**: Real telecom SMS dispatch to user mobile phones when configured in production.
> - **Development Fallback**: Development sandbox mode with on-screen test OTP so testing and staging never get blocked when carrier credentials are not active.
> - **Execution Posture**: Plan-only discussion mode requested by user ("Bhai ise code base me add na karna abhi sirf ek problem ko discuss kar rahe hai"). Zero source code will be modified until explicit approval is given.

---

## 1. Overview & Core Concept

### What It Does
Empowers students and candidates to register and log in via their mobile phone number using one-time passwords (OTP). When telecom gateway credentials (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`) are present in the environment, the server transmits a real SMS over carrier networks (Airtel, Jio, Vi, AT&T, etc.). When operating in development or preview mode without active SMS credits, the system transparently switches to **Sandbox Mode**, securely returning a test OTP token to the UI so developers and testers can verify auth flows without friction.

### Target Audience & Persona
- **Students & Job Seekers**: Want fast, hassle-free authentication using either Phone OTP, Email OTP, Password, or Google 1-Tap.
- **Recruiters & Evaluators**: Reviewing the candidate portal without having to configure third-party SMS telephony credentials.

### Key Value
- **Zero Blocked Logins**: Eliminates the current dead-end where users see "SMS requested" but never receive an SMS.
- **Production-Ready & Enterprise-Grade**: Direct gateway integration for real phone verification with rate-limiting, SHA-256 hash validation, and 10-minute expiry windows.

---

## 2. User Experience & Visual Design

### User Interaction Flow
1. **Phone Input & Country Code**:
   - User opens the Auth Modal, selects the **Phone OTP** tab.
   - Enters mobile number (e.g., `+91 98765 43210`) with country code dropdown pre-selected to `+91 (India)`.
2. **Dispatch State**:
   - Clicks **"Send Verification Code"**.
   - **Production (Gateway Active)**: UI displays an emerald status badge: `"SMS dispatched via carrier network to +91 98765 43210"`.
   - **Development (Sandbox Active)**: UI displays a subtle slate/cyan helper pill:
     `"Dev Sandbox Mode: Your test code is [ 491823 ] (Click to auto-fill)"`.
3. **Verification**:
   - User enters or clicks to auto-fill the 6-digit code.
   - Verification succeeds, authenticating the candidate into their Student Dossier and unlocking applied tracking.

### UI Styling & Anti-Slop Guidelines
- **No Floating Generic Cards**: Seamlessly embedded inside the existing high-contrast slate/navy `AuthModal`.
- **Status Indicators**:
  - Live Carrier: Emerald check with carrier icon (`"SMS sent via carrier"`).
  - Dev Sandbox: Sky/slate helper notice with copyable monospaced 6-digit code (`font-mono tracking-widest`).
- **Cooldown & Rate-Limiting**: Honest 25-second countdown timer preventing telecom spam or network congestion.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Hybrid Architecture (Real Gateway + Dev Sandbox)
- **Chosen Approach**: Server checks environment configuration dynamically. If Twilio/telecom credentials are valid, it executes real carrier dispatch. If absent or in dev, it returns `sandboxMode: true` and `previewOtp` in the response payload.
- **Why**: Real SMS costs money and requires carrier registration (DLT registration in India, 10DLC in the US). A sandbox mode ensures the app remains 100% testable in AI Studio preview while remaining fully equipped for live production SMS.
- **Alternatives Considered**: 
  - *Real SMS Only*: Fails for anyone running the preview without Twilio billing.
  - *Firebase Phone Auth with reCAPTCHA*: Requires configuring reCAPTCHA domain whitelisting and SMS quotas in Google Cloud Console.

### Decision 2: Security & Production Guardrails
- **Chosen Approach**: The `previewOtp` is strictly suppressed in production environments (`process.env.NODE_ENV === 'production'` or when gateway is active) to prevent security leaks.
- **Why**: Keeps authentication tamper-proof and prevents unauthorized access in live deployments.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TERRASYNX Auth Client                           │
│  (AuthModal.tsx • CountryCodeSelector.tsx • firebaseConfig.ts)         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                     POST /api/auth/otp/send
                     { channel: "phone", destination: "+91..." }
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Express Server (server.ts)                       │
│  - Normalizes phone number to E.164 format                             │
│  - Enforces 25-second cooldown and 5-attempt rate limit                │
│  - Generates secure 6-digit OTP & stores SHA-256 hash (10m TTL)        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                  ┌────────────────┴────────────────┐
                  │ Are TWILIO credentials present? │
                  └────────────────┬────────────────┘
                         YES       │       NO
             ┌─────────────────────┘       └─────────────────────┐
             ▼                                                   ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│     Twilio SMS Gateway API    │               │       Dev Sandbox Engine      │
│  - POST to Twilio Messages    │               │  - Logs OTP to console        │
│  - Real SMS delivered to phone│               │  - Returns previewOtp in JSON │
│  - dispatchedViaGateway: true │               │  - dispatchedViaGateway: false│
└───────────────────────────────┘               └───────────────────────────────┘
```

### Data Model & Endpoint Schema
- **POST `/api/auth/otp/send` Response**:
  ```json
  {
    "success": true,
    "channel": "phone",
    "destination": "+919876543210",
    "dispatchedViaRealGateway": false,
    "sandboxMode": true,
    "previewOtp": "839201",
    "message": "Dev Sandbox Mode: Use code 839201 to verify"
  }
  ```
- **POST `/api/auth/otp/verify`**:
  - Compares SHA-256 hash of submitted OTP against active hashes in memory.
  - Returns authenticated `AuthUserSession` (`uid`, `phoneNumber`, `token`, `verifiedAt`).

---

## 5. Next Steps
Once you approve this plan, we can proceed to implement:
1. Server-side environment detection and sandbox payload response in `server.ts`.
2. AuthModal UI helper for 1-click test code auto-fill during sandbox mode.
3. `.env.example` documentation with Twilio and Firebase SMS credentials setup guide for production rollout.

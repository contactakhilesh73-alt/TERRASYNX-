# TERRASYNX Platform Architecture & Delivery Milestones

## Completed Milestones

### 1. Prompt 62: Server-Synchronized Time Bar & Dual Deadlines
- **UTC Server Endpoint**: Added `GET /api/time` returning `utcTime`, `epochMs`, `serverTimezone: 'UTC'`, and `officialTimezone: 'Asia/Kolkata' (IST)`.
- **DateTimeStatusBar**: Displayed on every page beneath the header after authentication.
  - Live clock synced with the server UTC time.
  - Device clock skew detector alerting users with an amber badge whenever the client clock deviates by more than 2 minutes from server time.
  - Active verification counters for live checks.
- **Dual Deadlines**: All dates and deadlines are rendered in official IST time alongside the candidate's localized device time.

### 2. Prompt 63: Comprehensive Verification Status Model
- **Verification Status Domain**:
  - `OPEN_VERIFIED`: Official portal active, verified within source freshness window.
  - `OPEN_NOT_RECENTLY_VERIFIED`: Verification window exceeded pending fresh crawler probe.
  - `CLOSING_SOON`: Less than 72 hours remaining until deadline.
  - `POSSIBLY_CLOSED`: Portal indicates capacity or ambiguous closure indicators.
  - `CLOSED_EARLY_BY_PORTAL`: Explicit early closure detected before stated deadline.
  - `DEADLINE_PASSED`: Official stated deadline elapsed.
  - `REMOVED_BY_PORTAL`: Requisition 404/deleted from careers portal.
  - `CANCELLED_OR_POSTPONED`: Explicit postponement notice.
  - `UNKNOWN`: No verifiable source URL available.
- **Provenance Attributes**: `lastVerifiedAt`, `evidence` (human-readable proof snippet), and `sourceUrl` on every card.
- **Grace Period & Archive Pipeline**: Closed requisitions stay visible with a styled closed banner for a grace period of several hours before moving to the Archive view.

### 3. Prompt 64: Data Out of Code (Firestore Sources & Records)
- **Firestore Schema Architecture**:
  - `/sources/{sourceId}`: `name`, `officialUrls`, `category`, `country`, `parserType`, `createdAt`.
  - `/records/{recordId}`: `sourceId`, `sourceUrl`, `status`, `curatedOn`, `lastVerifiedAt`, `evidence`, `title`, `organizer`, `category`, `country`, `verifiedFacts`.
- **Security Hardening (`firestore.rules`)**:
  - Writes to `/sources` and `/records` are strictly locked down to admin only (`kakhileshsingh310@gmail.com`).
  - Public reads are permitted so students and candidates can query opportunities in real time.
- **Data Migration & Array Removal**:
  - 19 hackathons and 155 recurring annual internship cycles migrated into Firestore collections.
  - Every record tagged `UNVERIFIED_CURATED` with `curatedOn` timestamp and official source URL (or `UNKNOWN` if lacking verifiable source).
  - Hardcoded arrays removed from `hackathonsService.ts` and `upcomingInternshipsService.ts`.
  - Only rules, schemas, models, and type definitions remain in code.

### 4. Prompt 65: Deterministic Parsers
- Created `src/services/liveParsers.ts`:
  - JSON-LD structured data extraction for `JobPosting` (`validThrough`) and `Event` (`startDate`, `endDate`, `eventStatus` handling `EventCancelled`, `EventPostponed`, `EventRescheduled`, `EventMovedOnline`) from allowlisted official pages.
  - HTTP 404 / 410 response status codes and portal homepage redirect detection as strict closure signals (`REMOVED_BY_PORTAL`, `CLOSED_EARLY_BY_PORTAL`).
  - ATS listing diffing against live Greenhouse and Lever endpoints.
  - Zero date hallucination guarantee: fall back to grounded Official Page Watcher AI only if deterministic signals do not apply.

### 5. Prompt 66: Autonomous Janch Scheduler
- Endpoint `POST /api/janch/run` protected by `JANCH_SECRET` header from `.env`.
- Priority-based batching (urgent deadlines within 7 days checked first).
- Per-host rate limiting, jitter (100–500ms), exponential backoff, robots.txt inspection, and authentic User-Agent header (`TERRASYNX-JanchScheduler/1.0`).
- Persistent caching of last check times in memory; Firestore writes occur strictly when status or deadline dates change.
- User-triggered cache bust: `POST /api/janch/refresh-record` for stale opportunities.
- External cron documentation added to `README.md` (Cloud Scheduler, GitHub Actions, crontab).

### 6. Prompt 67: Tracked Opportunity Closure Alerts
- Created `ClosureAlertService` (`src/services/closureAlertService.ts`):
  - Detects transitions to `POSSIBLY_CLOSED`, `CLOSED_EARLY_BY_PORTAL`, `REMOVED_BY_PORTAL`, and `CANCELLED_OR_POSTPONED`.
  - Determines tracked opportunities via explicit tracking (`isTracked`), RadarEngine tracking registry, active pipeline stages (`applied`, `assessment`, `interview`, `offer`), or `AppliedDossierService`.
  - Generates Alert Relay messages (`type: 'closure_alert'`) explicitly specifying **what changed** (prior vs new status and root reason) and **when it was detected** (ISO/UTC timestamp and human relative time).
  - Wired into `RadarEngine.updateOpportunityVerification`, `AtsClosureDetectionService`, and `JanchSchedulerService`.
  - Added "Closure Alerts" filter tab and card badge styling in `AlertRelayView.tsx` with reading pane closure callout.
  - 17 unit tests in `src/tests/closureAlerts.test.ts` (total 53 test suites, 383 unit tests passing).

### 7. Prompt 68: Hackathon Intake & Verification Engine
- **Intake Flow ("Submit a hackathon")**:
  - Modal intake component `SubmitHackathonModal.tsx` allowing submission of `name`, `officialUrl`, and `organizer`.
  - Submissions enter a persistent queue stored in local storage and Firestore collection `hackathon_submissions`.
- **Live Verification Engine (`src/services/hackathonIntakeService.ts` & `/api/hackathons/verify-submission`)**:
  - Allowlist verification: enforces approved domains (Devpost, MLH, Unstop, Hackerearth, Kaggle, Devfolio, Taikai, DoraHacks, Gitcoin, GitHub events) plus legitimate academic/government institutions (`.edu`, `.edu.*`, `.ac.in`, `.gov`, `.gov.*`).
  - Strict SSRF protection: rejects URL shorteners (`bit.ly`, `tinyurl`, `t.co`, etc.) and private/loopback IP blocks.
  - Deterministic date extraction: extracts JSON-LD Schema.org `Event` dates (`startDate`, `endDate`), standard meta tags, and verified textual expressions with ISO parsing and strict date validation. Zero hallucinated dates allowed.
- **Display Integrity Rule**:
  - Only submissions with status `VERIFIED` are visible in the Hackathons portal listings (`HackathonIntakeService.getVerifiedSubmissions()`). Submissions with `PENDING` or `REJECTED` are isolated to the submission review tab.
- **Coverage Line on Hackathons Page**:
  - Displayed prominently at top of Hackathons portal: `"Tracking N sources, last run <time>"` with a live pulsing indicator and active source count.
  - Backed by `HackathonIntakeService.getCoverageInfo()` and `GET /api/hackathons/coverage`.
- **Comprehensive Unit Testing**:
  - 16 test cases in `src/tests/hackathonIntake.test.ts` verifying allowlist rejection/acceptance, date extraction, queue lifecycle, strict display filtering, and coverage line computation.


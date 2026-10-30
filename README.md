# TERRASYNX: Autonomous Career Intelligence & Verified Opportunity Platform

TERRASYNX is an enterprise-grade opportunity discovery radar and candidate intelligence platform. It tracks corporate internships, high-value scholarships, research fellowships, and global hackathons with cryptographic verification, strict SSRF security, and zero hallucination.

---

## Janch Automated Priority Crawler (`/api/janch/run`)

The **Janch** engine continuously verifies official job postings, hackathon registrations, and internship portals against live web changes.

### Core Architecture & Guarantees

1. **Priority Scheduling**:
   - **Priority 1 (Urgent <= 7 Days)**: Postings whose deadlines or end dates fall within the next 7 days are prioritized at the front of every check batch.
   - **Priority 2 (Active/Open)**: Roles and events actively open and in cycle.
   - **Priority 3 (Standard Cycle)**: Recurring or historical series checked in rotation.
   - Records within each tier are sorted by least recently checked (`lastCheckedAt` ascending).

2. **Per-Host Rate Limiting & Politeness**:
   - Minimum 1200ms gap between consecutive outbound requests to the same destination host.
   - Randomized 100ms – 400ms jitter between requests to eliminate synchronized traffic spikes.
   - Automatic exponential backoff (up to 5 minutes) on HTTP 429, 503, or connection timeouts.
   - Full compliance with `robots.txt` before fetching.
   - Honest user-agent: `TerrasynxLinkChecker/1.0`.

3. **Zero-Redundancy Firestore Writes**:
   - In-memory tracking (`lastCheckTimeByRecordId`) records every pulse check.
   - **Writes to Firestore occur ONLY when a record's `status` or dates (`dates`, `registrationDeadline`, `startDate`, `endDate`) change.**
   - If a record is still open with the exact same dates, Firestore write operations are bypassed, drastically reducing database churn and preserving quota.

4. **On-Demand Stale Record Refresh**:
   - When a user views an opportunity or program card in the app, the client inspects its verification age against its source-specific freshness window.
   - If stale, the client calls `POST /api/janch/refresh-record` to refresh the record's live state in real time.

---

## External Cron Setup

You can schedule automated execution of `POST /api/janch/run` via any external cron service using the secret header `x-janch-secret`.

### 1. Environment Variable Configuration

Set `JANCH_SECRET` in your server environment (or Cloud Run environment variables):

```env
JANCH_SECRET="your-secure-random-token-here"
```

### 2. Google Cloud Scheduler (Recommended for Cloud Run)

To run the crawler automatically every 30 minutes on GCP:

```bash
gcloud scheduler jobs create http terrasynx-janch-cron \
    --schedule="*/30 * * * *" \
    --uri="https://<YOUR-CLOUD-RUN-URL>/api/janch/run" \
    --http-method=POST \
    --headers="x-janch-secret=YOUR_JANCH_SECRET,Content-Type=application/json" \
    --message-body='{"batchSize": 20}' \
    --time-zone="UTC" \
    --location="asia-southeast1"
```

### 3. GitHub Actions Cron Workflow

Create `.github/workflows/janch-cron.yml`:

```yaml
name: Janch Verification Crawler Cron

on:
  schedule:
    # Runs every 30 minutes
    - cron: '*/30 * * * *'
  workflow_dispatch:

jobs:
  run-janch:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Janch Batch Run
        run: |
          curl -s -f -X POST "https://${{ secrets.APP_DOMAIN }}/api/janch/run" \
            -H "Content-Type: application/json" \
            -H "x-janch-secret: ${{ secrets.JANCH_SECRET }}" \
            -d '{"batchSize": 25}'
```

### 4. Linux Crontab / cURL

Add to your server's `crontab -e`:

```bash
# Run Janch crawler every 20 minutes with honest user-agent and secret header
*/20 * * * * curl -s -X POST https://your-terrasynx-domain.com/api/janch/run \
  -H "x-janch-secret: your-secure-random-token-here" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 20}' > /dev/null 2>&1
```

### 5. API Reference

#### `POST /api/janch/run`
- **Headers**:
  - `x-janch-secret: <JANCH_SECRET>` *(Required)*
- **Body** *(Optional JSON)*:
  ```json
  {
    "batchSize": 20,
    "targetCategory": "hackathon"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "timestamp": 1792944900000,
    "totalCandidates": 68,
    "batchSize": 20,
    "processedCount": 20,
    "firestoreWritesCommitted": 1,
    "firestoreWritesSkipped": 19,
    "prioritiesChecked": {
      "urgent7Days": 4,
      "activeOpen": 16,
      "standardCycle": 0
    },
    "results": [...]
  }
  ```

#### `POST /api/janch/refresh-record`
- **Body**:
  ```json
  {
    "recordId": "hack_nasa_space_apps",
    "force": true
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "result": {
      "recordId": "hack_nasa_space_apps",
      "sourceUrl": "https://www.spaceappschallenge.org",
      "isStale": true,
      "refreshed": true,
      "statusChanged": false,
      "dateChanged": false,
      "firestoreWritten": false,
      "status": "ANNOUNCED_VERIFIED",
      "datesText": "14-15 November 2026",
      "lastCheckedAt": 1792944901000
    }
  }
  ```

#### `GET /api/janch/status`
- Public health check for the crawler queue, priority counts, and rate limiter settings.

---

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run full test suite
npm test

# Build production bundle
npm run build
```

# Nexora Simple Flow (Clerk + Winlogbeat → Elastic → Dashboard)

## What this does

1. User signs in on Nexora (Clerk).
2. User downloads `winlogbeat.yml` (includes their Clerk `user_id` as `nexora_user_id`).
3. Winlogbeat sends Windows logs **directly to Elastic Cloud**.
4. Nexora API pulls **only that user's** events from Elastic, runs detection/ML/correlation.
5. Dashboard shows live results (no Kibana for the user).

No multi-tenant DB. No FastAPI ingest (for now).

---

## Setup

### 1. Clerk

1. Create app at [clerk.com](https://clerk.com).
2. Enable Email sign-in.
3. Copy **Publishable key** and **Issuer URL** (Frontend API → JWT issuer).

`.env`:

```bash
CLERK_ISSUER=https://your-app.clerk.accounts.dev
CLERK_PUBLISHABLE_KEY=pk_test_...
ELASTIC_URL=https://your-deployment.es.cloud.elastic.io
ELASTICSEARCH_API=your-elastic-api-key
NEXORA_EVENTS_INDEX=nexora-events
```

### 2. Elastic Cloud

1. Create API key with `create_index`, `index`, `read` on `nexora-events*`.
2. Same key is embedded in downloaded Winlogbeat config (MVP only — rotate keys in production).

### 3. Backend

```bash
pip install -e .
pip install PyJWT cryptography
uvicorn apps.api.main:app --reload
```

Dev without Clerk:

```bash
NEXORA_DEV_SKIP_CLERK=true
NEXORA_DEV_USER_ID=user_test123
```

### 4. Frontend

```bash
cd frontend/nexora
# Set CLERK_PUBLISHABLE_KEY in index.html or config.js
python -m http.server 5500
```

Open http://127.0.0.1:5500 — sign in, download connector, open dashboard.

### 5. Windows endpoint

1. Install [Winlogbeat](https://www.elastic.co/downloads/beats/winlogbeat).
2. Replace `winlogbeat.yml` with downloaded file.
3. Run as admin: `winlogbeat.exe -e`
4. Install as service when verified.

---

## API endpoints

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /api/v1/connector/winlogbeat.yml` | Clerk JWT | Download agent config |
| `GET /api/v1/live/dashboard` | Clerk JWT | Run pipeline + return alerts |
| `GET /api/v1/live/status` | Clerk JWT | Check if events arrived |

---

## Later (not MVP)

- FastAPI ingest + retry/cron
- Per-user Elastic API keys (no shared key in YAML)
- React app (replace static HTML)

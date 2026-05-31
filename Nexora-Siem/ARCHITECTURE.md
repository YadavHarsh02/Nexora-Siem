# Nexora SIEM — Project Architecture

## Layout

```
mini-siem/
├── src/siem/              # Core library (domain logic)
│   ├── collectors/        # Log ingestion
│   ├── parsers/           # Normalization
│   ├── detection/         # Rules + correlation engine
│   ├── alerts/            # Notify, dedup, export
│   ├── ml/                # Feature extraction + classifier
│   ├── threat_intel/      # Feed + IP checks
│   ├── database/          # Elasticsearch client
│   ├── services/          # Business logic (used by API)
│   └── config/            # Central paths & settings
├── apps/                  # Deployable entry points
│   ├── api/               # FastAPI REST + WebSocket
│   ├── pipeline/          # Batch CLI (main menu)
│   └── worker/            # Realtime log tail worker
├── frontend/nexora/       # Static SOC dashboard (HTML/JS)
├── infra/                 # Docker + compose
├── config/settings.yaml   # App configuration
├── data/                  # Runtime data (not code)
│   ├── raw/
│   ├── parsed/
│   ├── threat_intel/
│   └── exports/
├── legacy/dashboard/      # Old Flask UI (deprecated)
└── tests/
```

## How to run

| Task | Command |
|------|---------|
| Install package | `pip install -e .` |
| Batch pipeline | `python main.py` |
| API server | `uvicorn apps.api.main:app --reload` |
| Realtime worker | `python realtime_monitor.py` |
| Threat hunt CLI | `python hunt.py` |
| Frontend | `cd frontend/nexora && python -m http.server 5500` |
| Full stack (Docker) | `docker compose -f infra/docker-compose.yml up` |

## Data flow

1. **Collect** → `data/raw/`
2. **Parse** → `data/parsed/parsed_logs.json`
3. **Detect** → rules, MITRE, ML, correlation
4. **Alert** → Elasticsearch + Telegram + `data/exports/dashboard_data.json`
5. **Serve** → API reads ES → frontend at `:5500`

## Production principles used

- **Separation**: domain (`src/siem`) vs apps (`apps/`) vs UI (`frontend/`)
- **Service layer**: API routes are thin; logic lives in `siem.services`
- **Central config**: all paths via `siem.config.get_settings()`
- **Multiple deployables**: API, pipeline, and worker can scale independently later

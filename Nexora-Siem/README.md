# Nexora SIEM

Nexora SIEM is an AI-powered Security Information and Event Management (SIEM) platform built for educational, research, and defensive cybersecurity purposes.

It provides centralized log monitoring, alert correlation, behavioral analytics, and real-time threat visibility.

For lab, educational, and authorized environments only.

---

## Quick start

```bash
cd mini-siem
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
pip install -e .

# Batch SIEM pipeline (menu)
python main.py

# API server
uvicorn apps.api.main:app --reload

# Frontend (separate terminal)
cd frontend/nexora && python -m http.server 5500
```

See **[ARCHITECTURE.md](ARCHITECTURE.md)** for the full layout.

---

# Features

- Real-Time Log Monitoring
- AI-Based Alert Correlation Engine to reduce False Positives
- UEBA (User & Entity Behavior Analytics)
- Threat Detection Dashboard
- REST API Backend
- Docker Support
- Email Alerting System
- Event Severity Classification
- ElasticSearch Integration
- Modern Web UI
- CORS Enabled API
- Production-style Python package layout (`src/siem` + `apps/`)

---

# Tech Stack

- Python / FastAPI / scikit-learn
- Elasticsearch
- Static HTML/JS dashboard (`frontend/nexora`)
- Docker Compose (`infra/`)
---

# Usage Notes

- Nexora SIEM is intended for educational, defensive, and authorized security environments only.
- Do not use against systems without permission.
- Logs and alerts are processed through the centralized SIEM pipeline.
- AI correlation engine helps identify suspicious behavioral patterns.
- UEBA modules analyze anomalies in user and entity activity.

---

# About

Nexora SIEM is a modern AI-assisted cybersecurity monitoring platform designed to simulate enterprise-grade SIEM workflows for learning, experimentation, and defensive security operations.

---

# Author

## Harsh Yadav

GitHub: https://github.com/YadavHarsh02

---

# Repository

https://github.com/YadavHarsh02/Nexora-Siem

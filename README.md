# Nexora SIEM

Nexora SIEM is an AI-powered Security Information and Event Management (SIEM) platform built for educational, research, and defensive cybersecurity purposes.

It provides centralized log monitoring, alert correlation, behavioral analytics, and real-time threat visibility through a modern dashboard interface.

For lab, educational, and authorized environments only.

---

# Features

- Real-Time Log Monitoring
- AI-Based Alert Correlation Engine
- UEBA (User & Entity Behavior Analytics)
- Threat Detection Dashboard
- REST API Backend
- Docker Support
- Email Alerting System
- Event Severity Classification
- MongoDB Integration
- Modern Web UI
- CORS Enabled API
- Scalable MERN-Based Architecture

---

# Tech Stack

- MongoDB
- Express.js
- React.js
- Node.js
- Docker
- Python (AI/ML modules)
- Tailwind CSS

---

# Prerequisites

Make sure you have installed:

- Node.js (v18+ recommended)
- MongoDB
- Git
- Docker (optional)
- npm or yarn

---

# Setup Instructions

## 1. Clone the Repository

```bash
git clone https://github.com/YadavHarsh02/Nexora-Siem.git
cd Nexora-Siem
```

---

## 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## 4. Configure Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
PORT=5555
MONGODB_URL=your_mongodb_connection_string
RESEND_API_KEY=your_resend_api_key
```

---

## 5. Run Backend Server

```bash
cd backend
npm run dev
```

---

## 6. Run Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

---

## 7. Open Application

Frontend:

```bash
http://localhost:5173
```

Backend API:

```bash
http://localhost:5555
```

---

# Docker Setup (Optional)

Build the Docker image:

```bash
docker build -t nexora-siem .
```

Run the container:

```bash
docker run -p 5555:5555 nexora-siem
```

---

# Usage Notes

- Nexora SIEM is intended for educational, defensive, and authorized security environments only.
- Do not use against systems without permission.
- Logs and alerts are processed through the centralized SIEM pipeline.
- AI correlation engine helps identify suspicious behavioral patterns.
- UEBA modules analyze anomalies in user and entity activity.

---

# Future Enhancements

- Threat Intelligence Feed Integration
- Live Attack Mapping
- SOC Analyst Panel
- SIEM Rule Builder
- ML-Based Threat Scoring
- Multi-Tenant Architecture
- Kubernetes Deployment
- Elasticsearch Integration

---

# About

Nexora SIEM is a modern AI-assisted cybersecurity monitoring platform designed to simulate enterprise-grade SIEM workflows for learning, experimentation, and defensive security operations.

---

# License

MIT License

---

# Author

## Harsh Yadav

GitHub: https://github.com/YadavHarsh02

---

# Repository

https://github.com/YadavHarsh02/Nexora-Siem

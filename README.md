<p align="center">
  <span style="font-size: 48px;">🛡️</span>
</p>

<h1 align="center">SentinelOps AI</h1>

<p align="center">
  <strong>AI-Powered Infrastructure Intelligence with Autonomous Self-Healing</strong>
</p>

<p align="center">
  Real-time server monitoring • Gemini AI diagnostics • Z-score anomaly detection • Autonomous self-healing autopilot • Double Exponential Smoothing
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express_5-339933?logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose_8-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socketdotio&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Gemini_AI-Google-4285F4?logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Tests-30%2F30%20Passed-brightgreen?logo=node.js&logoColor=white" alt="Tests" />
  <img src="https://img.shields.io/badge/Docker-dockerode-2496ED?logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white" alt="Vite" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Complete Feature List](#-complete-feature-list)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Automated Testing Suite](#-automated-testing-suite)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [WebSocket Events](#-websocket-events)
- [Frontend Components](#-frontend-components)
- [Key Algorithms](#-key-algorithms)
- [Security & DevSecOps](#-security--devsecops)
- [License](#-license)

---

## 🧠 Overview

**SentinelOps AI** is an enterprise-grade, full-stack infrastructure monitoring and anomaly detection platform that synthesizes real-time hardware telemetry with Google Gemini AI diagnostics and an autonomic 5-phase self-healing recovery loop. It monitors CPU, memory, filesystem storage, network throughput, and Docker containers, evaluates statistical Z-score deviations against rolling historical baselines, projects resource saturation trajectories via Holt's Double Exponential Smoothing, and autonomously mitigates operational incidents.

### What Makes It Different

| Capability | Description |
|---|---|
| **Autonomous Self-Healing** | A 5-phase autopilot loop that diagnoses root causes via Gemini AI, dispatches diagnostic commands to target nodes, constructs remediation actions, applies fixes, and verifies recovery — governed by a strict command execution allowlist and 30-minute cooldowns. |
| **Statistical Anomaly Detection** | Rolling Z-score evaluation against historical baselines ($Z > 2.5$) with static fallback guards for memory ($>85\%$), disk ($>80\%$ warning, $>90\%$ critical), and network spikes. |
| **Predictive Forecasting** | Holt's Double Exponential Smoothing ($\alpha=0.3, \beta=0.1$) extrapolates future resource usage trajectory 5 steps (~15s) ahead. |
| **AI + Rules-Based Fallback** | Every AI feature gracefully degrades to deterministic SRE rule heuristics if Google Gemini credentials are unset, network drops occur, or HTTP 429 quota limits are encountered. |
| **Multi-Model Failover** | Transparently rotates across 4 Gemini model variants (`gemini-flash-lite-latest`, `gemini-2.0-flash`, `gemini-2.5-flash`, `gemini-2.0-flash-lite`) with dynamic quota cooldown timers. |
| **Enterprise Security & DevSecOps** | Zero query-string token leaks, input sanitization middleware with password complexity rules, brute-force rate-limiting, strict CORS policies, bcrypt password hashing, and safe command allowlist in remote monitoring daemons. |
| **Automated Testing Suite** | Comprehensive 30-test automated suite (`node:test`) covering forecasters, statistical anomaly detection, AI fallback rules, and input validation with 100% pass rate. |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          SENTINELOPS AI ARCHITECTURE                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐     WebSocket      ┌────────────────────────────────┐  │
│  │  Monitoring   │ ◄──────────────►  │        Backend (Node.js)        │  │
│  │   Agent       │   Socket.IO       │  ┌──────────────────────────┐  │  │
│  │  (Node.js)    │   (Port 5000)     │  │  Express 5 REST API      │  │  │
│  │              │                    │  │  Socket.IO Server         │  │  │
│  │  • CPU Load  │                    │  │  Z-Score Anomaly Engine   │  │  │
│  │  • Memory RSS│                    │  │  Holt's DES Forecaster    │  │  │
│  │  • Disk Usage│                    │  │  Gemini AI SRE Engine     │  │  │
│  │  • Network IO│                    │  │  Autopilot Controller     │  │  │
│  │  • Safe Exec │                    │  │  Docker Container Service │  │  │
│  └──────────────┘                    │  │  Alert Dispatcher (Webhooks)│ │
│                                      │  │  Executive PDF Generator  │  │  │
│  ┌──────────────┐     WebSocket      │  └──────────────────────────┘  │  │
│  │  Frontend     │ ◄──────────────►  │              │                  │  │
│  │  (React 19)   │   Socket.IO       │              ▼                  │  │
│  │              │   (Auth Token)     │  ┌──────────────────────────┐  │  │
│  │  • Dashboard  │                    │  │    MongoDB Atlas          │  │  │
│  │  • Visualizer │     REST API       │  │  ┌────────────────────┐  │  │  │
│  │  • Incident UI│ ◄──────────────►  │  │  │ Users (Indexed)    │  │  │  │
│  │  • Terminal   │   (Port 5000)     │  │  │ Incidents (TTL/Idx)│  │  │  │
│  │  • Autopilot  │                    │  │  │ SystemMetrics (Idx)│  │  │  │
│  └──────────────┘                    │  │  │ ApiKeys             │  │  │  │
│                                      │  │  │ AutopilotEvents     │  │  │  │
│  ┌──────────────┐                    │  │  └────────────────────┘  │  │  │
│  │  Google       │ ◄── API ────────► │  │  └──────────────────────────┘  │  │
│  │  Gemini AI    │                    │  └────────────────────────────────┘  │
│  └──────────────┘                    └────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────┐                                                        │
│  │  Docker       │ ◄── dockerode ──► Backend (Docker Service)            │
│  │  Engine       │                                                        │
│  └──────────────┘                                                        │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Complete Feature List

1. **Real-Time Telemetry Pipeline:** Polls and broadcasts CPU usage, RAM utilization, filesystem storage (`si.fsSize()`), network ingress/egress, top 10 running processes sorted by CPU load, and host OS metadata every 3 seconds via Socket.IO.
2. **Statistical Anomaly Engine:** Employs rolling Z-score detection against the last 30 historical metrics ($Z > 2.5$) for CPU and memory, plus threshold fallbacks (>80% warning, >90% critical on disk).
3. **Double Exponential Smoothing (DES):** Implements Holt's algorithm ($\alpha=0.3, \beta=0.1$) to project 5-step future resource demand (~15s) with trend tracking.
4. **Autonomous Self-Healing Autopilot:** 5-phase loop (Detect $\rightarrow$ Diagnose $\rightarrow$ Remediate $\rightarrow$ Apply $\rightarrow$ Verify) with execution cooldowns and safe command allowlists.
5. **Generative AI Diagnostics:** Integrates Google Gemini 2.5 Flash SDK to deliver root-cause explanations and suggested remediation commands, with graceful fallback to deterministic SRE rules.
6. **Multi-Model AI Failover:** Sequentially attempts 4 Gemini models on rate-limit (HTTP 429) errors, enforcing backoff cooldowns per model.
7. **Multi-Server Fleet Operations:** Supports distributed agents (`agent.js`) streaming live hardware statistics from remote Linux and Windows nodes, with automatic offline detection after 10-second heartbeat timeouts.
8. **Multi-Channel Alert Dispatcher:** Employs Slack incoming webhooks, Discord rich embeds, and automated SMTP email notifications (via Nodemailer) for critical anomalies.
9. **Docker Container Management:** Real-time container inspection, status telemetry, interactive start/stop/restart operations, and live stdout/stderr log streaming.
10. **Executive PDF Reports:** Generates authenticated downloadable PDF incident summaries and server health reports.
11. **Hardened Remote Terminal:** Web-based terminal console enabling authorized DevOps engineers to execute diagnostic commands on remote agents, secured by a strict regex allowlist.

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | Core UI component library |
| Vite | 6.0 / 8.0 | High-performance build tool and dev server |
| React Router DOM | 7.13 | Client-side routing and protected routes |
| Recharts | 2.15 | Real-time telemetry and forecast charting |
| Socket.IO Client | 4.8 | Low-latency bi-directional WebSocket client |
| Lucide React | 1.16 | UI icon set |
| Canvas Confetti | 1.9 | Interactive celebratory feedback |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 22 LTS | JavaScript runtime engine |
| Express | 5.2 | RESTful API server framework |
| Socket.IO | 4.8 | Real-time WebSocket server engine |
| Mongoose | 8.12 | MongoDB Object Data Modeling (ODM) |
| @google/genai | 0.1 | Official Google Gemini Generative AI SDK |
| dockerode | 5.0 | Docker Engine API client |
| PDFKit | 0.19 | PDF executive document generation |
| bcryptjs | 3.0 | Salting and password hashing |
| jsonwebtoken | 9.0 | Cryptographic JWT authentication |
| Helmet | 8.1 | HTTP security headers |
| Morgan | 1.10 | HTTP request logger |
| systeminformation | 5.31 | System metrics and disk collection |
| Axios | 1.18 | Slack and Discord webhook client |
| Nodemailer | 8.0 | Enterprise SMTP email notification service |
| express-rate-limit | 8.5 | Brute-force authentication rate limiting |

---

## 📁 Project Structure

```
SentinelOps-AI/
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI workflow (lint, syntax, tests)
├── package.json                    # Root workspace convenience scripts
├── SentinelOps_AI_MCA_Capstone_Project_Report.docx  # Formal university capstone report
│
├── agent/                          # Lightweight distributed monitoring agent
│   ├── agent.js                    # Metrics collection, Socket.IO client, safe exec allowlist
│   ├── package.json
│   └── .env                        # BACKEND_URL, API_KEY
│
├── backend/                        # Express 5 REST API & WebSocket server
│   ├── src/
│   │   ├── server.js               # Main entry — Express app, Socket.IO, polling loop, rate-limiting
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection with Mongoose
│   │   ├── controllers/
│   │   │   ├── authController.js   # Registration, login, logout, API keys, integrations
│   │   │   ├── autopilotController.js # 5-phase self-healing loop and cooldown logic
│   │   │   ├── monitorController.js   # Autopilot status, events, and metrics
│   │   │   └── reportController.js    # PDF report generation
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # JWT authentication (header-only, zero query tokens)
│   │   │   ├── roleMiddleware.js   # Role-based access control (admin, engineer, viewer)
│   │   │   └── validateInput.js    # Input sanitization, password complexity & email regex
│   │   ├── models/
│   │   │   ├── ApiKey.js           # Remote agent credentials schema
│   │   │   ├── AutopilotEvent.js   # Self-healing audit trail schema
│   │   │   ├── Incident.js         # Anomaly incident records with severity enums and indexes
│   │   │   ├── SystemMetric.js     # Time-series metrics (CPU, RAM, disk, network) with indexes
│   │   │   └── User.js            # User accounts with roles and webhook configuration
│   │   ├── routes/
│   │   │   ├── authRoutes.js       # /api/auth endpoints (rate-limited, validated)
│   │   │   ├── incidentRoutes.js   # /api/incidents (JWT-protected)
│   │   │   ├── metricsRoutes.js    # /api/metrics (history, AI analyze, AI chat, remediation)
│   │   │   ├── monitorRoutes.js    # /api/monitor (autopilot events, Docker logs)
│   │   │   ├── protectedRoutes.js  # /api/protected (JWT verification test)
│   │   │   └── reportRoutes.js     # /api/reports (PDF export)
│   │   ├── services/
│   │   │   ├── dockerService.js    # Dockerode container management & log streaming
│   │   │   ├── emailService.js     # Nodemailer alert notification service
│   │   │   ├── monitorService.js   # Metrics delegator service
│   │   │   └── monitoringService.js# CPU, memory, diskUsage, network, and top 10 processes
│   │   └── utils/
│   │       ├── aiAnalyzer.js       # Gemini AI diagnostic engine with SRE rule fallback
│   │       ├── anomalyDetector.js  # Z-score statistical engine & disk threshold checks
│   │       ├── forecaster.js       # Holt's Double Exponential Smoothing algorithm
│   │       ├── geminiHelper.js     # 4-model Gemini failover with quota cooldowns
│   │       ├── logger.js           # Ring-buffer in-memory log manager
│   │       └── notifier.js         # Slack, Discord, and SMTP email alert dispatcher
│   ├── tests/                      # Automated unit and integration test harness
│   │   ├── aiAnalyzer.test.js      # SRE rule fallback tests (5 tests)
│   │   ├── anomalyDetector.test.js # Z-score and static threshold anomaly tests (8 tests)
│   │   ├── forecaster.test.js      # Holt's DES algorithm tests (7 tests)
│   │   └── validateInput.test.js   # Input validation and password complexity tests (10 tests)
│   ├── package.json
│   └── .env.example
│
└── frontend/                       # React 19 + Vite SPA
    ├── src/
    │   ├── App.jsx                 # Router, protected routes, JWT expiry validation
    │   ├── main.jsx                # DOM root entry
    │   ├── index.css               # Global glassmorphism styling
    │   ├── pages/
    │   │   ├── Landing.jsx         # Product landing page with live animations
    │   │   ├── Dashboard.jsx       # Unified operations command center
    │   │   ├── Login.jsx           # Login interface with client-side validation
    │   │   └── Register.jsx        # Registration interface with password complexity checks
    │   ├── components/
    │   │   ├── AIAnalysisCard.jsx  # AI diagnostic card with confidence metrics
    │   │   ├── AIAnomalyPanel.jsx  # Anomaly alert list with manual remediation triggers
    │   │   ├── AIIncidentSummary.jsx# Executive incident summary card
    │   │   ├── AutopilotConsole.jsx# Autopilot control switch, status, and event timeline
    │   │   ├── CPUChart.jsx        # Live CPU telemetry line chart with forecast overlay
    │   │   ├── DockerPanel.jsx     # Docker container manager, action buttons, and log viewer
    │   │   ├── GaugeCard.jsx       # Circular gauges for CPU, Memory, and Disk usage
    │   │   ├── HistoricalCPUChart.jsx # Long-term telemetry trend viewer
    │   │   ├── IncidentHistory.jsx # Searchable, severity-coded incident timeline
    │   │   ├── LogsConsole.jsx     # Real-time streaming system logs
    │   │   ├── MultiServerPanel.jsx# Multi-server cluster node status cards
    │   │   ├── NetworkChart.jsx    # Dual-axis network download/upload line chart
    │   │   ├── NotificationCenter.jsx # Unread notification dropdown
    │   │   └── ProcessTable.jsx    # Real-time top-10 active processes table
    │   └── socket/
    │       └── socket.js           # Dynamic Socket.IO client singleton
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20+ or v22 LTS and npm
- **MongoDB** — local instance or MongoDB Atlas cloud cluster
- **Google Gemini API Key** — from [Google AI Studio](https://aistudio.google.com/) *(optional; rules engine operates offline)*
- **Docker Engine** *(optional; required for container monitoring)*

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/SentinelOps-AI.git
cd SentinelOps-AI
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Populate `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/sentinelops?retryWrites=true&w=majority
JWT_SECRET=your_high_entropy_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
ALERT_EMAIL=alerts@yourdomain.com
```

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm run dev      # Development with nodemon auto-restart
npm start        # Production
```

### 3. Configure Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The frontend launches at `http://localhost:5173`.

### 4. Start Remote Monitoring Agent (Optional)

```bash
cd ../agent
npm install
node agent.js
```

---

## 🧪 Automated Testing Suite

SentinelOps AI features an automated unit and integration test suite built with Node.js native test runner (`node:test` and `node:assert`).

To run the complete test suite:

```bash
# From workspace root
npm test

# Or directly within backend
npm test --prefix backend
```

### Test Harness Summary

| Test File | Target Module | Test Scenarios | Status |
|---|---|---|---|
| `forecaster.test.js` | `forecaster.js` | 7 tests: 5-step forecast generation, empty inputs, small series fallback, upward/downward trends, zero-variance stability, boundary clamping [0, 100] | **7/7 PASSED** |
| `validateInput.test.js` | `validateInput.js` | 10 tests: name constraints, email regex formats, password complexity (uppercase, lowercase, number, 8+ chars), whitespace trimming, missing bodies | **10/10 PASSED** |
| `anomalyDetector.test.js` | `anomalyDetector.js` | 8 tests: rolling baseline Z-score spikes, sub-threshold normal metrics, fallback static thresholds (RAM >85%, Disk >80% & >90%), database error resilience | **8/8 PASSED** |
| `aiAnalyzer.test.js` | `aiAnalyzer.js` | 5 tests: CPU rule fallback, Memory exhaustion rules, Network flood heuristics, Disk saturation recommendations, Healthy state defaults | **5/5 PASSED** |
| **Total** | **All Core Services** | **30 Automated Test Cases** | **30/30 PASSED (100%)** |

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Port for the Express REST and Socket.IO server |
| `MONGO_URI` | Yes | — | MongoDB Atlas or local MongoDB connection URI |
| `JWT_SECRET` | Yes | — | Secret key utilized for signing and verifying JSON Web Tokens |
| `GEMINI_API_KEY` | No* | — | Google Gemini API key (*gracefully falls back to SRE rules engine if absent) |
| `FRONTEND_URL` | No | `http://localhost:5173` | Trusted frontend origin for CORS and Socket.IO handshakes |
| `EMAIL_USER` | No | — | SMTP service username for automated email alert dispatch |
| `EMAIL_PASS` | No | — | SMTP service password / application-specific password |
| `ALERT_EMAIL` | No | — | Destination email address for high-severity incident notifications |

### Agent (`agent/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `BACKEND_URL` | No | `http://localhost:5000` | URL of the SentinelOps AI backend server |
| `API_KEY` | Yes | — | Cryptographic API key generated via Dashboard for agent authentication |

---

## 🔌 API Endpoints

### Authentication & Integrations (`/api/auth`)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | None | Validates password complexity and registers a new user |
| POST | `/api/auth/login` | None | Authenticates credentials and returns a 7-day signed JWT |
| POST | `/api/auth/logout` | None | Clears session credentials |
| GET | `/api/auth/api-keys` | JWT | Retrieves registered agent API keys for the user |
| POST | `/api/auth/api-keys` | JWT | Generates a new secure API key for remote agents |
| DELETE | `/api/auth/api-keys/:id` | JWT | Revokes an existing agent API key |
| GET | `/api/auth/integrations` | JWT | Fetches configured Slack/Discord webhook endpoints |
| PUT | `/api/auth/integrations` | JWT | Updates Slack and Discord webhook alert URLs |

### Metrics & AI Diagnostics (`/api/metrics`)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/metrics/history` | JWT | Retrieves last 1440 historical metric snapshots |
| POST | `/api/metrics/ai-analyze` | JWT | Manually triggers Gemini AI analysis on current telemetry |
| POST | `/api/metrics/ai-chat` | JWT | Interactive natural-language diagnostic query with Gemini SRE assistant |
| POST | `/api/metrics/ai-remediation` | JWT | Generates targeted shell remediation commands |

### Incidents, Autopilot & Reports

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/incidents` | JWT | Returns sorted incident records matching `{ createdAt: -1 }` index |
| GET | `/api/monitor/autopilot/status` | JWT | Fetches current autopilot toggle state |
| GET | `/api/monitor/autopilot/events` | JWT | Fetches last 10 self-healing audit events |
| GET | `/api/monitor/docker/:id/logs` | JWT | Streams container logs via Dockerode |
| GET | `/api/reports/export-pdf` | JWT | Downloads generated executive health and incident PDF report |
| GET | `/health` | None | Returns backend status and current timestamp |

---

## 📡 WebSocket Events

### Client / Agent $\rightarrow$ Server
* `agent-metrics`: Sent by `agent.js` every 3s containing CPU, RAM, disk, and network stats.
* `execute-command`: Sent by Dashboard to trigger a diagnostic command on a remote agent.
* `toggle-autopilot`: Sent by Dashboard to enable/disable autonomous self-healing.

### Server $\rightarrow$ Dashboard
* `system-metrics`: Real-time system telemetry with forecast trajectories.
* `ai-analysis`: Live Gemini AI diagnostic evaluation and confidence metrics.
* `docker-containers`: Real-time Docker container operational status.
* `system-anomalies`: Detected statistical and threshold-based anomaly alerts.
* `new-incident`: Emitted immediately when a new incident is persisted.
* `autopilot-event-update`: Emits step-by-step progress during self-healing cycles.
* `command-output`: Streams command output from agent to the web terminal.

---

## 🧮 Key Algorithms

### 1. Adaptive Z-Score Anomaly Detection
```
Mean:    μ = (1 / N) * Σ X(i)
StdDev:  σ = sqrt((1 / N) * Σ (X(i) - μ)²)
Z-Score: Z = (X(current) - μ) / σ
```
* **Window Size ($N$):** Last 30 data points from MongoDB.
* **Sensitivity Threshold:** Flags anomaly when $Z > 2.5$ (minimum 5 baseline points).
* **Static Fallback Guards:** Memory $>85\%$, Disk $>80\%$ (Warning), Disk $>90\%$ (Critical), Network $>20\text{ MB/s}$.

### 2. Holt's Double Exponential Smoothing (Linear Trend Forecasting)
```
Level:    L(t) = α * Y(t) + (1 - α) * (L(t-1) + T(t-1))
Trend:    T(t) = β * (L(t) - L(t-1)) + (1 - β) * T(t-1)
Forecast: F(t+m) = L(t) + m * T(t)
```
* **Smoothing Constants:** $\alpha = 0.3, \beta = 0.1$.
* **Forecast Horizon ($m$):** 5 steps (~15 seconds ahead). Clamped to $[0, 100]$.

---

## 🔒 Security & DevSecOps

* **Strict Token Discipline:** Removed query parameter token transmission; all protected routes mandate `Authorization: Bearer <token>` HTTP headers.
* **Brute-Force Rate Limiting:** Enforces `express-rate-limit` (20 requests per 15 minutes) on all `/api/auth` endpoints.
* **Remote Command Execution Allowlist:** `agent.js` strictly validates incoming commands against safe regex patterns (`Get-Process`, `ps aux`, `df -h`, `free -m`, `netstat`, `systemctl status`), blocking arbitrary command injection.
* **Input Sanitization Middleware:** `validateInput.js` enforces minimum string lengths, lowercase email regex verification, and password complexity ($\ge 8$ characters, uppercase, lowercase, numerical digit).
* **Cryptographic Password Security:** All user credentials hashed via `bcryptjs` with 10 salt rounds.
* **Database Time-Series Indexing:** MongoDB collections leverage compound indexes (`{ createdAt: -1 }`, `{ message: 1, createdAt: -1 }`) for fast querying and deduplication.
* **Graceful Process Termination:** Handlers for `SIGTERM` and `SIGINT` gracefully close the HTTP server and Mongoose connection pool.

---

## 📄 License

This project is licensed under the ISC License.

---

<p align="center">
  <strong>Built with React 19, Node.js 22 LTS, Socket.IO, MongoDB Atlas, and Google Gemini AI</strong>
</p>

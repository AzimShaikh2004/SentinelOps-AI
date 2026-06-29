<p align="center">
  <span style="font-size: 48px;">🛡️</span>
</p>

<h1 align="center">SentinelOps AI</h1>

<p align="center">
  <strong>AI-Powered Infrastructure Intelligence with Autonomous Self-Healing</strong>
</p>

<p align="center">
  Real-time server monitoring • Gemini AI diagnostics • Z-score anomaly detection • Autonomous self-healing autopilot
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express_5-339933?logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socketdotio&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Gemini_AI-Google-4285F4?logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Docker-dockerode-2496ED?logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white" alt="Vite" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Complete Feature List](#-complete-feature-list)
- [Landing Page Feature Coverage](#-landing-page-feature-coverage)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [WebSocket Events](#-websocket-events)
- [Frontend Components](#-frontend-components)
- [Key Algorithms](#-key-algorithms)
- [Security](#-security)
- [License](#-license)

---

## 🧠 Overview

**SentinelOps AI** is a full-stack, real-time infrastructure monitoring platform that combines traditional server telemetry with Google Gemini AI-powered diagnostics and a fully autonomous self-healing autopilot. It monitors CPU, memory, network, and Docker containers, detects anomalies using statistical Z-score analysis, and can autonomously diagnose and remediate issues without human intervention.

### What Makes It Different

| Capability | Description |
|---|---|
| **Autonomous Self-Healing** | A 5-phase autopilot loop that generates a diagnosis command via AI, executes it on the target node via WebSocket, designs a remediation strategy, applies the fix, and verifies recovery — all without human intervention. |
| **Statistical Anomaly Detection** | Z-score-based anomaly detection against rolling historical baselines (not just static thresholds). |
| **Predictive Forecasting** | Holt's Double Exponential Smoothing projects CPU and memory saturation 15 seconds into the future. |
| **AI + Rules-Based Fallback** | Every AI-powered feature gracefully falls back to deterministic rules-based logic when the Gemini API is unavailable or rate-limited. |
| **Multi-Model Failover** | The Gemini integration automatically cycles through 4 different model variants with per-model rate-limit cooldowns. |

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
│  │  (Node.js)    │   (Port 5000)     │  │  Express REST API        │  │  │
│  │              │                    │  │  Socket.IO Server         │  │  │
│  │  • CPU       │                    │  │  Anomaly Detector (Z)     │  │  │
│  │  • Memory    │                    │  │  AI Analyzer (Gemini)     │  │  │
│  │  • Network   │                    │  │  Forecaster (Holt)        │  │  │
│  │  • Exec Cmds │                    │  │  Autopilot Controller     │  │  │
│  └──────────────┘                    │  │  Docker Service           │  │  │
│                                      │  │  Notifier (Slack/Discord) │  │  │
│  ┌──────────────┐     WebSocket      │  │  PDF Report Generator     │  │  │
│  │  Frontend     │ ◄──────────────►  │  └──────────────────────────┘  │  │
│  │  (React+Vite) │   Socket.IO       │              │                  │  │
│  │              │   (JWT Auth)       │              ▼                  │  │
│  │  • Dashboard  │                    │  ┌──────────────────────────┐  │  │
│  │  • Landing    │                    │  │    MongoDB Atlas          │  │  │
│  │  • Login      │     REST API       │  │  ┌────────────────────┐  │  │  │
│  │  • Register   │ ◄──────────────►  │  │  │ Users              │  │  │  │
│  │  • AI Chat    │   (Port 5000)     │  │  │ Incidents          │  │  │  │
│  └──────────────┘                    │  │  │ SystemMetrics       │  │  │  │
│                                      │  │  │ ApiKeys             │  │  │  │
│  ┌──────────────┐                    │  │  │ AutopilotEvents     │  │  │  │
│  │  Google       │ ◄── API ────────► │  │  └────────────────────┘  │  │  │
│  │  Gemini AI    │                    │  └──────────────────────────┘  │  │
│  └──────────────┘                    └────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────┐                                                        │
│  │  Docker       │ ◄── dockerode ──► Backend (Docker Service)            │
│  │  Engine       │                                                        │
│  └──────────────┘                                                        │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Complete Feature List

### 1. 🖥️ Real-Time System Monitoring
- **CPU Usage** — Live percentage via `systeminformation`, updated every 3 seconds
- **Memory Usage** — Used/free/total memory with percentage calculation
- **Network I/O** — Download and upload speeds (MB/s) from network interface stats
- **CPU Cores** — Total logical core count
- **System Uptime** — Hours since last boot
- **Hostname & Platform** — OS identification and architecture
- **Running Processes** — Top 10 processes (Chrome, VS Code, Node) with CPU% and memory (MB)

### 2. 📊 Live Charts & Visualizations
- **Real-Time CPU Chart** — Recharts line chart with last 10 data points, gradient fill, and forecast overlay
- **Historical CPU Chart** — Long-term CPU trend chart with 1-minute granularity from MongoDB (up to 1440 data points = 24 hours)
- **Network Chart** — Dual-line chart showing download and upload speeds
- **Gauge Cards** — Animated circular progress bars (CPU and Memory) with dynamic color thresholds

### 3. 🧠 Gemini AI Diagnostics
- **AI SRE Analysis** — Gemini analyzes live metrics, anomalies, and process lists to generate diagnostic summaries with confidence scores
- **Manual Diagnostic Trigger** — One-click "Run Diagnostic" button invokes AI analysis on demand
- **AI Remediation API** — Generates safe diagnostic commands and remediation scripts per anomaly type
- **Rules-Based Fallback** — When `GEMINI_API_KEY` is missing or rate-limited, deterministic rules produce equivalent analysis

### 4. 🔍 Statistical Anomaly Detection (Z-Score)
- **Rolling Baseline** — Computes mean and standard deviation from the last 30 historical metric entries in MongoDB
- **Z-Score Thresholds** — CPU/Memory anomalies trigger at Z > 2.5; Network at Z > 3.0
- **Static Fallback Thresholds** — If insufficient history (< 5 data points): CPU > 85%, Memory > 85%, Network > 20 MB/s
- **Confidence Scoring** — Dynamic confidence percentage based on Z-score magnitude (88–99%)
- **Three Anomaly Types** — CPU, MEMORY, and NETWORK with severity levels (HIGH, MEDIUM)

### 5. 🤖 Autonomous Self-Healing Autopilot (5-Phase Loop)
The crown feature — a fully autonomous remediation pipeline:

| Phase | Name | Description |
|-------|------|-------------|
| 1 | **Diagnosis Command Generation** | Gemini AI (or rules-based fallback) generates a safe diagnostic shell command appropriate for the OS (Windows PowerShell / Linux bash) |
| 2 | **Diagnostics Execution on Node** | The command is sent to the remote monitoring agent via WebSocket and executed with a 35-second timeout |
| 3 | **Remediation Strategy Selection** | Gemini analyzes the diagnostic output and recommends a specific mitigation command; falls back to rules-based remediation if AI is unavailable |
| 4 | **Mitigation Action Execution** | The remediation command is executed on the agent node |
| 5 | **Recovery Verification Check** | Waits 6 seconds for fresh telemetry and marks the event as RESOLVED or FAILED |

Additional Autopilot Features:
- **30-Minute Cooldown** — Prevents re-triggering the same anomaly type on the same server within 30 minutes
- **Event Logging** — Full audit trail stored in MongoDB (`AutopilotEvent` model) with per-step command, output, AI analysis, and status
- **Real-Time Dashboard Updates** — Each phase broadcasts progress to all connected dashboard clients via WebSocket
- **History Panel** — Expandable timeline view of all past autopilot runs with step-by-step details

### 6. 🔮 Predictive Forecasting
- **Algorithm** — Holt's Double Exponential Smoothing (linear trend model)
- **Parameters** — α = 0.3 (level smoothing), β = 0.1 (trend smoothing)
- **Horizon** — Forecasts 5 steps (approximately 15 seconds) into the future
- **Metrics** — Both CPU and Memory usage are forecasted
- **Early Warning Alerts** — Dashboard shows warnings when projected values exceed 80% (CPU) or 90% (Memory)
- **Value Clamping** — Forecasted values are constrained to 0–100% range

### 7. 💬 AI SRE Chat Assistant
- **Natural Language Interface** — Ask infrastructure questions in plain English
- **Live Context Injection** — Every chat message includes current hostname, CPU, memory, network, anomalies, and top processes
- **Chat History** — Full conversation history is maintained and sent with each request for contextual responses
- **Gemini-Powered** — Uses the same multi-model failover system with rate-limit awareness
- **Graceful Error Handling** — Returns fallback diagnostic info even when the API key is invalid

### 8. 🐳 Docker Container Monitoring
- **Container Listing** — All containers (running + stopped) via `dockerode`
- **Live Stats** — Per-container CPU% and memory (MB) calculated from Docker stats API
- **Container Controls** — Start, stop, and restart containers from the dashboard
- **Container Logs** — Stream last 150 lines of container logs with timestamp parsing
- **Cross-Platform** — Auto-detects Docker socket path (Windows named pipe vs Linux unix socket)

### 9. 🌐 Multi-Server Fleet View
- **Agent Authentication** — Remote agents authenticate via generated API keys
- **Server Registration** — Each agent identifies itself by hostname and is tracked in a live server list
- **Status Tracking** — ONLINE/OFFLINE status with 10-second heartbeat timeout
- **Per-Server Metrics** — CPU, memory, network, upload/download for each connected agent
- **Offline Detection** — Automatic incident creation when a server goes offline

### 10. 📢 Slack & Discord Alert Notifications
- **Slack Webhooks** — Rich attachments with color-coded severity, alert type, message, and timestamp
- **Discord Webhooks** — Embed messages with severity fields, descriptions, and footer branding
- **Per-User Configuration** — Each user can set their own webhook URLs in the Settings modal
- **Automatic Dispatch** — Alerts fire automatically when anomalies are detected (no manual action needed)

### 11. 📄 AI-Powered PDF Reports
- **One-Click Export** — Download a styled executive incident report as PDF
- **AI Executive Summary** — Gemini generates an executive-level health summary, root cause analysis, and numbered remediation plan
- **Operational Metrics Grid** — Total incidents, memory alerts, CPU alerts, offline server counts
- **Incident Log Table** — Zebra-striped table with type, severity, message, and timestamp (up to 12 recent incidents)
- **Professional Styling** — PDFKit-generated document with dark header, color palette, and branded footer

### 12. 🖥️ Remote Terminal Execution
- **Interactive Terminal** — Full terminal overlay with command input, output streaming, and clear
- **WebSocket Relay** — Dashboard → Backend → Agent → Backend → Dashboard command routing
- **Execution IDs** — Each command gets a unique ID for output correlation
- **Role-Based Access** — Only `admin` and `engineer` roles can execute commands
- **Streaming Output** — stdout and stderr stream back in real-time (not buffered)
- **Timeout Safety** — Commands time out after 30 seconds on the agent

### 13. 🔑 Authentication & Authorization
- **JWT Authentication** — Token-based auth with 7-day expiry using `jsonwebtoken`
- **Password Hashing** — bcrypt with 10 salt rounds
- **Role-Based Access Control (RBAC)** — Three roles: `admin`, `engineer`, `viewer`
- **Protected Routes** — Middleware guards for authenticated and role-restricted endpoints
- **Socket Authentication** — WebSocket connections require either JWT token or API key

### 14. 🔐 API Key Management & One-Click Installer
- **Key Generation** — Cryptographically secure keys (`sentinel_` prefix + 48 hex chars) via `crypto.randomBytes`
- **Key Description** — Optional description for identification (e.g., "Production VM")
- **Key Revocation** — Delete/revoke keys from the dashboard modal
- **Agent Auth** — Agents use API keys to authenticate their WebSocket connections
- **Per-User Scoping** — Each user manages their own set of API keys
- **One-Click Installer** — Pre-configured PowerShell (Windows) and Bash (Linux) installation commands generated inside the modal with auto-injected API keys and backend URLs

### 15. 🔔 Notification Center
- **In-App Notifications** — Real-time notification bell with unread count badge
- **Anomaly Notifications** — Each detected anomaly creates a notification entry
- **Toast Notifications** — `react-toastify` with dark theme, glassmorphism styling, and gradient progress bar
- **Deduplication** — Same notification throttled to once per 60 seconds

### 16. 📈 Historical Metrics & Incident Management
- **Metric Persistence** — System metrics saved to MongoDB every 60 seconds
- **Incident Logging** — Anomalies create incidents with type, severity, message, and timestamp
- **Incident Deduplication** — Same incident message won't duplicate within a 5-minute window
- **Incident History Panel** — Timeline view of all incidents with AI-powered incident summaries
- **AI Incident Summary** — Gemini generates a high-level summary of recent incident trends

### 17. 🎨 Premium Landing Page
- **Animated Particle Background** — Canvas-based particle network with mouse interaction
- **Scroll-Reveal Animations** — IntersectionObserver-powered fade-in-up animations on scroll
- **Animated Counter Hook** — Numbers count up with cubic easing when scrolled into view
- **Terminal Preview** — Animated CLI simulation showing SentinelOps commands typing out
- **Dashboard Mini Preview** — Mock dashboard with gauges, charts, and navigation
- **Orbiting Ring SVGs** — Decorative rotating orbit animations in the hero section
- **Mobile Responsive** — Hamburger menu, responsive grid, and adaptive typography
- **Glassmorphism Design** — Frosted glass panels, subtle gradients, and aurora glow effects

### 18. 🔒 Security Middleware
- **Helmet** — HTTP security headers
- **CORS** — Cross-origin resource sharing configuration
- **Morgan** — HTTP request logging (dev mode)
- **Rate Limiting** — `express-rate-limit` available in dependencies
- **Input Validation** — Email uniqueness, password minimum length (6 chars)

---

## 🗺 Landing Page Feature Coverage

Every feature in the project is represented on the landing page. Here is the complete mapping:

| # | Project Feature | Landing Page Section | How It's Mentioned |
|---|----------------|---------------------|-------------------|
| 1 | Real-Time WebSocket Telemetry | ✅ Features Grid (Card 3) | "CPU, memory, network, and process-level metrics streamed every 3 seconds via Socket.IO" |
| 2 | Gemini AI Diagnostics | ✅ Features Grid (Card 1) | "Gemini-powered SRE analyzes live system metrics, identifies root causes" |
| 3 | Autonomous Self-Healing Autopilot | ✅ Features Grid (Card 2) + Architecture Section | "5-phase autopilot loop: Generate diagnosis → Execute on node → Design remediation → Apply fix → Verify recovery" |
| 4 | Predictive Forecasting (Holt) | ✅ Features Grid (Card 4) | "Holt's Double Exponential Smoothing predicts CPU and memory saturation 15 seconds ahead" |
| 5 | Docker Container Monitoring | ✅ Features Grid (Card 5) | "Live Docker container stats via dockerode — CPU%, memory usage, state, and image info" |
| 6 | Multi-Server Fleet View | ✅ Features Grid (Card 6) | "Deploy lightweight Node.js agents on any machine… streams metrics to a unified command center" |
| 7 | AI SRE Chat Assistant | ✅ Tech Stack Section (Card 1) | "Ask your infrastructure questions in natural language. Gemini AI responds with real-time system context" |
| 8 | Slack & Discord Alerts | ✅ Tech Stack Section (Card 2) | "Configure webhook URLs in the dashboard. Get instant anomaly alerts" |
| 9 | AI-Powered PDF Reports | ✅ Tech Stack Section (Card 3) | "One-click export of executive incident reports. Gemini generates an executive summary, root cause analysis" |
| 10 | Remote Terminal Execution | ✅ Tech Stack Section (Card 4) | "Run diagnostic commands directly on any connected agent from the dashboard" |
| 11 | API Keys & RBAC | ✅ Tech Stack Section (Card 5) | "Role-based access control (admin, engineer, viewer). Generate and manage API keys" |
| 12 | Historical Metrics & Incidents | ✅ Tech Stack Section (Card 6) | "All metrics are persisted to MongoDB with 1-minute granularity. Incident history with timeline view" |
| 13 | Z-Score Anomaly Detection | ✅ Hero Subtitle + Demo Section + Architecture Step 2 | "Z-score anomaly detection" / "Z-score above 2.5 triggers an anomaly alert with confidence scoring" |
| 14 | Rules-Based Fallback | ✅ Features Grid (Card 1) | "rules-based fallback when API is unavailable" |
| 15 | Agent Architecture | ✅ Architecture Step 1 | "A lightweight Node.js agent uses systeminformation to collect CPU, memory, and network data every 3 seconds" |
| 16 | WebSocket Communication | ✅ Demo Annotations | "WebSocket real-time stream" floating badge |
| 17 | Tech Stack (React, Node, MongoDB, Socket.IO, Gemini, Docker) | ✅ Hero Trust Logos + Footer "Built With" Column | Full logo strip under hero + footer columns |
| 18 | Authentication (Login/Register) | ✅ Navbar Buttons + CTA Section | "Sign In" / "Get Started" / "Create Account & Launch" buttons |

**Result: ✅ All 18 features are represented on the landing page.**

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | UI framework |
| Vite | 8.0 | Build tool and dev server |
| React Router DOM | 7.15 | Client-side routing |
| Recharts | 3.8 | Charts and data visualization |
| Socket.IO Client | 4.8 | Real-time WebSocket communication |
| React Toastify | 11.1 | Toast notification system |
| React Circular Progressbar | 2.2 | Gauge card visualizations |
| JWT Decode | 4.0 | Client-side token decoding |
| Axios | 1.16 | HTTP client |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js + Express | 5.2 | REST API server |
| Socket.IO | 4.8 | Real-time bidirectional communication |
| Mongoose | 9.6 | MongoDB ODM |
| @google/genai | 2.8 | Google Gemini AI integration |
| dockerode | 5.0 | Docker Engine API client |
| PDFKit | 0.19 | PDF document generation |
| bcryptjs | 3.0 | Password hashing |
| jsonwebtoken | 9.0 | JWT authentication |
| Helmet | 8.1 | HTTP security headers |
| Morgan | 1.10 | HTTP request logging |
| systeminformation | 5.31 | System metrics collection |
| Axios | 1.18 | HTTP client (Slack/Discord webhooks) |
| Nodemailer | 8.0 | Email service (available) |
| express-rate-limit | 8.5 | API rate limiting |
| dotenv | 17.4 | Environment variable management |
| nodemon | 3.1 | Development auto-restart (dev dependency) |

### Monitoring Agent
| Technology | Version | Purpose |
|---|---|---|
| Socket.IO Client | 4.8 | WebSocket connection to backend |
| systeminformation | 5.31 | CPU, memory, network data collection |

### Infrastructure
| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud database |
| Docker Engine | Container runtime |
| Google Gemini AI | AI diagnostics, chat, remediation, and reports |

---

## 📁 Project Structure

```
SentinelOps-AI/
├── agent/                          # Lightweight monitoring agent
│   ├── agent.js                    # Main agent — collects metrics, sends via Socket.IO, executes commands
│   ├── package.json                # Dependencies: socket.io-client, systeminformation
│   └── .env                        # API_KEY for agent authentication
│
├── backend/                        # Express.js API server
│   ├── src/
│   │   ├── server.js               # Main entry — Express app, Socket.IO server, polling loop
│   │   │
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection via Mongoose
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js   # Register, login, API key CRUD, webhook integrations
│   │   │   ├── autopilotController.js  # 5-phase self-healing loop, event logging, cooldown
│   │   │   ├── monitorController.js    # Monitor routes handler
│   │   │   └── reportController.js     # AI-powered PDF report generation
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # JWT verification middleware
│   │   │   └── roleMiddleware.js   # Role-based access control middleware
│   │   │
│   │   ├── models/
│   │   │   ├── ApiKey.js           # Agent API key schema
│   │   │   ├── AutopilotEvent.js   # Self-healing event + steps audit trail
│   │   │   ├── Incident.js         # Anomaly incident records
│   │   │   ├── SystemMetric.js     # Historical metric snapshots (1-min granularity)
│   │   │   └── User.js            # User schema with roles and webhook URLs
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js       # /api/auth — register, login, API keys, integrations
│   │   │   ├── incidentRoutes.js   # /api/incidents — fetch incident history
│   │   │   ├── metricsRoutes.js    # /api/metrics — history, AI analyze, AI chat, AI remediation
│   │   │   ├── monitorRoutes.js    # /api/monitor — autopilot status, events, Docker logs
│   │   │   ├── protectedRoutes.js  # /api/protected — JWT-protected test endpoint
│   │   │   └── reportRoutes.js     # /api/reports — PDF export
│   │   │
│   │   ├── services/
│   │   │   ├── dockerService.js    # Docker container listing, stats, and log streaming
│   │   │   ├── emailService.js     # Email notification service (Nodemailer)
│   │   │   ├── monitorService.js   # Monitor service handler
│   │   │   └── monitoringService.js # System metrics collection (CPU, memory, network, processes)
│   │   │
│   │   └── utils/
│   │       ├── aiAnalyzer.js       # Gemini AI analysis with caching and rules-based fallback
│   │       ├── anomalyDetector.js  # Z-score statistical anomaly detection
│   │       ├── forecaster.js       # Holt's Double Exponential Smoothing forecaster
│   │       ├── geminiHelper.js     # Multi-model Gemini fallback with rate-limit cooldowns
│   │       ├── logger.js           # In-memory log ring buffer
│   │       └── notifier.js         # Slack & Discord webhook alert dispatcher
│   │
│   ├── package.json
│   └── .env                        # PORT, MONGO_URI, JWT_SECRET, GEMINI_API_KEY
│
├── frontend/                       # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx                 # Router setup, protected routes, toast config
│   │   ├── main.jsx                # React DOM entry point
│   │   ├── index.css               # Global styles, animations, glassmorphism design system
│   │   │
│   │   ├── pages/
│   │   │   ├── Landing.jsx         # Premium landing page with animations and feature showcase
│   │   │   ├── Dashboard.jsx       # Main monitoring command center (1000+ lines)
│   │   │   ├── Login.jsx           # Authentication — login form
│   │   │   └── Register.jsx        # Authentication — registration form
│   │   │
│   │   ├── components/
│   │   │   ├── AIAnalysisCard.jsx      # AI diagnostic results card
│   │   │   ├── AIAnomalyPanel.jsx      # Anomaly alert panel with remediation actions
│   │   │   ├── AIIncidentSummary.jsx   # AI-generated incident trend summary
│   │   │   ├── AutopilotConsole.jsx    # Self-healing autopilot control & timeline
│   │   │   ├── CPUChart.jsx            # Real-time CPU line chart with forecast
│   │   │   ├── DockerPanel.jsx         # Docker container management panel
│   │   │   ├── GaugeCard.jsx           # Circular progress gauge card
│   │   │   ├── HistoricalCPUChart.jsx  # Long-term CPU trend chart
│   │   │   ├── IncidentHistory.jsx     # Incident timeline list
│   │   │   ├── LoadingSpinner.jsx      # Loading animation component
│   │   │   ├── LogsConsole.jsx         # System logs viewer
│   │   │   ├── MultiServerPanel.jsx    # Multi-server fleet status panel
│   │   │   ├── NetworkChart.jsx        # Download/Upload speed chart
│   │   │   ├── NotificationCenter.jsx  # Bell icon notification dropdown
│   │   │   ├── ParticleBackground.jsx  # Canvas particle animation
│   │   │   ├── ProcessTable.jsx        # Running processes table
│   │   │   └── TerminalConsole.jsx     # Remote command execution terminal
│   │   │
│   │   ├── socket/
│   │   │   └── socket.js              # Socket.IO client singleton
│   │   │
│   │   └── styles/
│   │       └── landing.css            # Landing page premium styles (32KB)
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── e2e-test-simulation.js      # End-to-end test simulation script
│
├── docker/                         # Docker configuration (placeholder)
├── docs/                           # Documentation (placeholder)
├── monitoring-engine/              # Monitoring engine (placeholder)
└── README.md                       # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** — local instance or MongoDB Atlas cloud cluster
- **Google Gemini API Key** — obtain from [Google AI Studio](https://aistudio.google.com/)
- **Docker** (optional) — for container monitoring features

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/SentinelOps-AI.git
cd SentinelOps-AI
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/sentinelops?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend:

```bash
npm run dev    # Development (with nodemon auto-restart)
npm start      # Production
```

### 3. Set Up the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` by default.

### 4. Set Up the Monitoring Agent

```bash
cd agent
npm install
```

Create a `.env` file in `agent/`:

```env
API_KEY=your_generated_api_key_here
```

> **Note:** Generate an API key from the dashboard (🔑 API Keys button) after registering and logging in.

Start the agent:

```bash
node agent.js
```

### 5. Access the Application

| URL | Description |
|-----|-------------|
| `http://localhost:5173` | Landing Page |
| `http://localhost:5173/login` | Login |
| `http://localhost:5173/register` | Register |
| `http://localhost:5173/dashboard` | Dashboard (requires auth) |
| `http://localhost:5000` | Backend API health check |

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT token signing |
| `GEMINI_API_KEY` | No* | Google Gemini API key for AI features |

> *If `GEMINI_API_KEY` is not set, all AI features gracefully fall back to rules-based logic. The platform remains fully functional.

### Agent (`agent/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `API_KEY` | Yes | API key generated from the dashboard for agent authentication |

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Register a new user |
| POST | `/api/auth/login` | None | Login and receive JWT token |
| GET | `/api/auth/api-keys` | JWT | List user's API keys |
| POST | `/api/auth/api-keys` | JWT | Generate a new API key |
| DELETE | `/api/auth/api-keys/:id` | JWT | Revoke an API key |
| GET | `/api/auth/integrations` | JWT | Get webhook URLs |
| PUT | `/api/auth/integrations` | JWT | Update Slack/Discord webhook URLs |

### Metrics (`/api/metrics`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/metrics/history` | None | Fetch historical metric snapshots (last 1440) |
| POST | `/api/metrics/ai-analyze` | JWT | Trigger manual AI diagnostic analysis |
| POST | `/api/metrics/ai-chat` | JWT | Send a message to the AI SRE Chat |
| POST | `/api/metrics/ai-remediation` | JWT | Get AI-generated remediation commands |

### Incidents (`/api/incidents`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/incidents` | None | Fetch all incidents (sorted by newest) |

### Reports (`/api/reports`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reports/export-pdf?token=JWT` | JWT (query) | Download AI-powered PDF incident report |

### Monitor (`/api/monitor`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/monitor/autopilot/status` | JWT | Get autopilot enabled/disabled state |
| GET | `/api/monitor/autopilot/events` | JWT | Get last 10 autopilot event logs |
| GET | `/api/monitor/docker/:id/logs` | JWT | Stream Docker container logs |

---

## 📡 WebSocket Events

### Client → Server

| Event | Payload | Source | Description |
|-------|---------|--------|-------------|
| `agent-metrics` | `{ serverId, cpu, memory, download, upload, timestamp, status }` | Agent | Periodic metric push from agent (every 3s) |
| `execute-command` | `{ command, serverId, executionId }` | Dashboard | Execute a command on a remote agent |
| `toggle-autopilot` | `{ enabled: boolean }` | Dashboard | Enable/disable the self-healing autopilot |

### Server → Client

| Event | Payload | Target | Description |
|-------|---------|--------|-------------|
| `system-metrics` | Full metrics object + forecasts | Dashboard | Live system metrics broadcast |
| `ai-analysis` | `{ analysis, recommendation, confidence }` | Dashboard | AI diagnostic results |
| `docker-containers` | Container array | Dashboard | Docker container stats |
| `system-anomalies` | Anomaly array | Dashboard | Detected anomalies |
| `system-logs` | Log array | Dashboard | System log entries |
| `multi-server-data` | Server array | Dashboard | Fleet status update |
| `new-incident` | Incident object | Dashboard | New incident created |
| `autopilot-status` | `{ enabled: boolean }` | Dashboard | Autopilot state change |
| `autopilot-event-update` | AutopilotEvent object | Dashboard | Real-time autopilot step progress |
| `command-output` | `{ executionId, output, type }` | Dashboard | Streaming command output |
| `command-close` | `{ executionId, code }` | Dashboard | Command execution completed |
| `command-error` | `{ executionId, error }` | Dashboard | Command execution error |

### Agent Events

| Event | Payload | Description |
|-------|---------|-------------|
| `execute-command` (receive) | `{ command, executionId }` | Agent receives and executes a command |
| `command-output` (emit) | `{ executionId, output, type }` | Agent streams stdout/stderr |
| `command-close` (emit) | `{ executionId, code }` | Agent signals command completion |

---

## 🧩 Frontend Components

| Component | File | Description |
|-----------|------|-------------|
| **AIAnalysisCard** | `AIAnalysisCard.jsx` | Displays Gemini AI diagnostic summary with confidence score and recommendations |
| **AIAnomalyPanel** | `AIAnomalyPanel.jsx` | Anomaly alert panel with severity badges, AI analysis, and remediation action buttons |
| **AIIncidentSummary** | `AIIncidentSummary.jsx` | AI-generated high-level summary of recent incident trends |
| **AutopilotConsole** | `AutopilotConsole.jsx` | Self-healing autopilot control panel with toggle, active run timeline, and history logs |
| **CPUChart** | `CPUChart.jsx` | Real-time CPU usage line chart with forecast overlay (Recharts) |
| **DockerPanel** | `DockerPanel.jsx` | Docker container list with stats, controls (start/stop/restart), and log viewer |
| **GaugeCard** | `GaugeCard.jsx` | Animated circular progress bar for CPU and Memory with dynamic color thresholds |
| **HistoricalCPUChart** | `HistoricalCPUChart.jsx` | Long-term CPU trend chart from MongoDB historical data |
| **IncidentHistory** | `IncidentHistory.jsx` | Scrollable incident timeline with severity-coded entries |
| **LoadingSpinner** | `LoadingSpinner.jsx` | Animated loading indicator |
| **LogsConsole** | `LogsConsole.jsx` | Real-time system log viewer with color-coded log levels |
| **MultiServerPanel** | `MultiServerPanel.jsx` | Fleet view showing all connected agents with online/offline status |
| **NetworkChart** | `NetworkChart.jsx` | Dual-line chart for download and upload network speeds |
| **NotificationCenter** | `NotificationCenter.jsx` | Bell icon notification dropdown with unread count badge |
| **ParticleBackground** | `ParticleBackground.jsx` | Canvas-based animated particle network for the landing page |
| **ProcessTable** | `ProcessTable.jsx` | Table of running processes with PID, name, CPU%, and memory |
| **TerminalConsole** | `TerminalConsole.jsx` | Full-screen remote command execution terminal with streaming output |

---

## 🧮 Key Algorithms

### Z-Score Anomaly Detection

```
Z = (current_value - rolling_mean) / rolling_std_dev
```

- Rolling window: Last 30 metric entries from MongoDB
- Minimum 5 data points required for statistical baseline
- CPU/Memory threshold: Z > 2.5
- Network threshold: Z > 3.0
- Confidence = min(99, 90 + Z × 2)

### Holt's Double Exponential Smoothing

```
Level:  L(t) = α × Y(t) + (1 - α) × (L(t-1) + T(t-1))
Trend:  T(t) = β × (L(t) - L(t-1)) + (1 - β) × T(t-1)
Forecast: F(t+m) = L(t) + m × T(t)
```

- α = 0.3 (level smoothing factor)
- β = 0.1 (trend smoothing factor)
- Forecast horizon: 5 steps (~15 seconds)
- Output clamped to [0, 100]

### Multi-Model Gemini Failover

Models tried in order:
1. `gemini-flash-lite-latest`
2. `gemini-2.0-flash`
3. `gemini-2.5-flash`
4. `gemini-2.0-flash-lite`

Rate-limited models (HTTP 429) are skipped for a cooldown period (default: 3 minutes, or parsed from API response).

---

## 🔒 Security

- **Helmet** — Sets security-related HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.)
- **CORS** — Configured for cross-origin requests
- **bcrypt** — Passwords hashed with 10 salt rounds
- **JWT** — Stateless authentication with 7-day token expiry
- **Socket Auth** — WebSocket connections require JWT token (dashboard) or API key (agent)
- **RBAC** — Role-based middleware restricts destructive operations to `admin` and `engineer` roles
- **API Key Auth** — Agents authenticate via cryptographically generated keys validated against MongoDB
- **Environment Variables** — Secrets stored in `.env` files (not committed to version control)

---

## 📄 License

ISC

---

<p align="center">
  <strong>Built By Mohammed Azim using React, Node.js, Socket.IO, MongoDB, and Google Gemini AI</strong>
</p>

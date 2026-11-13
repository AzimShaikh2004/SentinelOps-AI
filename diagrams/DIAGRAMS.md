# SentinelOps AI - System Analysis & Design Diagrams (UML & Flowcharts)

This document contains all formal system diagrams for **SentinelOps AI - Infrastructure Monitoring and Anomaly Detection Platform** for the MCA Semester III Capstone Project.

---

## 1. System Architecture Diagram (Section 2.3)

```mermaid
flowchart TD
    subgraph Client["Presentation Tier (Browser SPA)"]
        UI["React 19 Dashboard<br>(Vite + Recharts + Tailwind)"]
        TerminalUI["Terminal Console<br>& Autopilot Switch"]
        AuthUI["JWT Session Store<br>(LocalStorage)"]
    end

    subgraph Server["Application Tier (Node.js 22 LTS / Express 5)"]
        GW["Socket.IO Server<br>(Port 5000 / WebSocket)"]
        REST["Express REST API<br>(Rate-Limited / Protected)"]
        AD["Adaptive Anomaly Detector<br>(Rolling Z-Score > 2.5)"]
        FC["Holt's DES Forecaster<br>(α=0.3, β=0.1, 5-Step)"]
        Auto["Autopilot Controller<br>(5-Phase Self-Healing)"]
        DockerSvc["Dockerode Service<br>(Container Engine API)"]
        Notifier["Alert Dispatcher<br>(Slack / Discord / SMTP)"]
    end

    subgraph Remote["Distributed Host Tier (agent.js)"]
        Agent["Monitoring Daemon<br>(Systeminformation)"]
        Exec["Safe Shell Execution<br>(Regex Allowlist)"]
    end

    subgraph Intelligence["Cognitive Tier (Cloud LLM)"]
        Gemini["Google Gemini 2.5 Flash<br>(Multi-Model Failover)"]
        RuleFallback["Deterministic SRE<br>Rule Fallback Engine"]
    end

    subgraph Storage["Persistence Tier (MongoDB Atlas)"]
        DB[("MongoDB Cloud Cluster")]
        Users[("Users Collection<br>{email: UK}")]
        Metrics[("SystemMetrics<br>{createdAt: -1}")]
        Incidents[("Incidents Collection<br>{message:1, createdAt:-1}")]
        Events[("AutopilotEvents<br>{audit: trail}")]
    end

    UI <-->|WebSocket Stream / Auth Token| GW
    UI <-->|HTTPS REST API / Bearer Token| REST
    Agent <-->|WebSocket Metric Push / API Key| GW
    GW --> AD
    AD --> FC
    AD --> Auto
    Auto <-->|Prompt / Diagnostics| Gemini
    Auto -.->|Fallback on 429| RuleFallback
    Auto -->|Safe Command Dispatch| Exec
    REST --> DB
    GW --> DB
    DockerSvc <--> Docker[("Docker Daemon / Socket")]
    Auto --> Notifier
    Notifier --> Webhooks["Slack / Discord Webhooks & Email"]
    DB --> Users
    DB --> Metrics
    DB --> Incidents
    DB --> Events
```

---

## 2. Entity Relationship Diagram (ERD) (Section 2.4)

```mermaid
erDiagram
    USER ||--o{ API_KEY : "owns / generates"
    USER ||--o{ INCIDENT : "reviews / resolves"
    USER ||--o{ AUTOPILOT_EVENT : "triggers / inspects"
    
    USER {
        ObjectId _id PK
        string name "User full name"
        string email UK "Regex validated, lowercase"
        string password "Bcrypt hashed (10 rounds)"
        string role "admin | engineer | viewer"
        string slackWebhookUrl "Optional Slack alert endpoint"
        string discordWebhookUrl "Optional Discord alert endpoint"
        date createdAt "Automatic Mongoose timestamp"
        date updatedAt "Automatic Mongoose timestamp"
    }

    API_KEY {
        ObjectId _id PK
        string key UK "Hashed / prefixed token"
        string description "Friendly node label"
        ObjectId user FK "Reference to owning User"
        date createdAt "Issuance timestamp"
    }

    SYSTEM_METRIC {
        ObjectId _id PK
        number cpuUsage "CPU load % (0-100)"
        number memoryUsage "Used physical RAM (MB)"
        number freeMemory "Free RAM (GB)"
        number diskUsage "Storage utilisation %"
        number downloadSpeed "Inbound network (MB/s)"
        number uploadSpeed "Outbound network (MB/s)"
        string hostname "Reporting server node ID"
        date createdAt INDEX "Time-series descending index"
    }

    INCIDENT {
        ObjectId _id PK
        string type "CPU | MEMORY | NETWORK | DISK | SERVER_OFFLINE"
        string severity "HIGH | MEDIUM | LOW"
        string message INDEX "Descriptive anomaly summary"
        string server "Node identifier (default: Local)"
        date timestamp "Exact detection timestamp"
        date createdAt INDEX "Compound index with message"
    }

    AUTOPILOT_EVENT {
        ObjectId _id PK
        string serverId "Target agent node ID"
        string anomalyType "CPU | MEMORY | DISK | NETWORK"
        string diagnosisCommand "Generated diagnostic query"
        string diagnosisOutput "Raw stdout from agent"
        string remediationAction "Applied corrective command"
        string status "TRIGGERED | IN_PROGRESS | RESOLVED | FAILED"
        array steps "Audit trail timestamps"
        date createdAt "Event timestamp"
    }
```

---

## 3. Class Diagram (Section 2.5)

```mermaid
classDiagram
    class AuthController {
        +registerUser(req, res)
        +loginUser(req, res)
        +generateApiKey(req, res)
        +getApiKeys(req, res)
        +deleteApiKey(req, res)
        +updateIntegrations(req, res)
    }

    class AnomalyDetector {
        +detectAnomalies(metrics) Array
        -getStats(values) Object
        -rollingWindow: 30
        -zScoreThreshold: 2.5
    }

    class Forecaster {
        +forecastSeries(data, steps, alpha, beta) Array
        -alpha: 0.3
        -beta: 0.1
        -horizon: 5
    }

    class AIAnalyzer {
        +analyzeMetrics(metrics) Object
        +generateRemediation(metrics, anomalies) String
        -fallbackRules(metrics) Object
    }

    class GeminiHelper {
        -models: Array
        -cooldowns: Map
        +generateWithFallback(prompt) String
    }

    class AutopilotController {
        +isAutopilotRunning: Boolean
        +cooldownMap: Map
        +toggleAutopilot(enabled)
        +runSelfHealingLoop(anomaly, io)
    }

    class MonitoringService {
        +getSystemMetrics() Object
        +getDiskUsage() Object
        +getRunningProcesses() Array
    }

    class DockerService {
        +getDockerContainers() Array
        +streamContainerLogs(id) Stream
    }

    AuthController --> AuthMiddleware : enforces JWT
    AutopilotController --> AnomalyDetector : queries anomalies
    AutopilotController --> Forecaster : projects trends
    AutopilotController --> AIAnalyzer : requests diagnostics
    AIAnalyzer --> GeminiHelper : multi-model query
    MonitoringService --> AnomalyDetector : feeds telemetry
```

---

## 4. Use Case Diagram (Section 2.6)

```mermaid
flowchart LR
    subgraph Actors["System Actors"]
        Admin((Administrator))
        Engineer((DevOps Engineer))
        Viewer((Read-Only Viewer))
        AgentDaemon((Remote Agent Daemon))
    end

    subgraph AuthCases["Authentication & Access"]
        UC1["Register & Login (JWT)"]
        UC2["Configure Slack/Discord Webhooks"]
        UC3["Provision Agent API Keys"]
    end

    subgraph MonitoringCases["Monitoring & Intelligence"]
        UC4["View Real-Time Dashboard"]
        UC5["Inspect Forecasted Trajectories"]
        UC6["Review Anomaly & Incident Log"]
        UC7["Interact with Gemini SRE Chat"]
        UC8["Export Executive PDF Reports"]
    end

    subgraph OperationsCases["Operations & Autopilot"]
        UC9["Toggle Autopilot Self-Healing"]
        UC10["Execute Safe Diagnostic Commands"]
        UC11["Inspect Docker Container Logs"]
        UC12["Push 3s Telemetry (agent-metrics)"]
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11

    Engineer --> UC1
    Engineer --> UC4
    Engineer --> UC5
    Engineer --> UC6
    Engineer --> UC7
    Engineer --> UC8
    Engineer --> UC10
    Engineer --> UC11

    Viewer --> UC1
    Viewer --> UC4
    Viewer --> UC5
    Viewer --> UC6
    Viewer --> UC8

    AgentDaemon --> UC12
    AgentDaemon --> UC10
```

---

## 5. Activity Diagram: Telemetry & Anomaly Loop (Section 2.7)

```mermaid
flowchart TD
    Start([Start Telemetry Loop Every 3,000ms]) --> Collect[Sample Hardware: CPU, Memory, Disk, Network]
    Collect --> Processes[Query Top-10 CPU Processes]
    Processes --> Broadcast[Broadcast Live Metrics over Socket.IO]
    Broadcast --> CheckHistory{Query last 30 snapshots from MongoDB}
    
    CheckHistory -->|Data count >= 5| CalcZ[Calculate Mean μ & StdDev σ]
    CheckHistory -->|Data count < 5| FallbackThresholds[Use Static Guard Thresholds]
    
    CalcZ --> EvalZ{Is |Z| > 2.5?}
    FallbackThresholds --> EvalStatic{CPU>85% or RAM>85% or Disk>90%?}
    
    EvalZ -->|Yes| FlagAnomaly[Construct Anomaly Incident Record]
    EvalZ -->|No| CheckDisk{Disk > 80% or Net > 20MB/s?}
    EvalStatic -->|Yes| FlagAnomaly
    EvalStatic -->|No| NormalState[System State Healthy]
    
    CheckDisk -->|Yes| FlagAnomaly
    CheckDisk -->|No| NormalState
    
    FlagAnomaly --> PersistDB[Save Incident to MongoDB with Index]
    FlagAnomaly --> DispatchAlerts[Dispatch Slack, Discord & Email Alerts]
    FlagAnomaly --> CheckAutopilot{Autopilot Enabled & Not in Cooldown?}
    
    CheckAutopilot -->|Yes| TriggerAutopilot[Trigger 5-Phase Autopilot Loop]
    CheckAutopilot -->|No / Cooldown| EmitUI[Emit system-anomalies to Dashboard]
    
    TriggerAutopilot --> EmitUI
    NormalState --> Sleep[Wait for Next 3-Second Tick]
    EmitUI --> Sleep
    Sleep --> Start
```

---

## 6. Sequence Diagram: 5-Phase Autopilot Self-Healing (Section 2.8)

```mermaid
sequenceDiagram
    autonumber
    actor SRE as DevOps Engineer / System
    participant Server as SentinelOps Server (Backend)
    participant AI as Gemini 2.5 Flash / Rules Engine
    participant DB as MongoDB Atlas
    participant Agent as Remote Agent Daemon (Host)
    participant Channel as Slack / Discord / Email

    Note over Server, DB: Telemetry Polling triggers Anomaly Detection
    Server->>Server: Detects Z-Score Anomaly (Z = 3.2 > 2.5)
    Server->>DB: Persist Incident {type: 'CPU', severity: 'HIGH'}
    Server->>Channel: Send Alert Notification (Webhook/SMTP)
    
    opt Autopilot is Enabled & Cooldown Elapsed (>30 min)
        Note over Server, Agent: PHASE 1: DIAGNOSIS GENERATION
        Server->>AI: Prompt with telemetry & top process context
        AI-->>Server: Diagnostic Command: "Get-Process | Sort-Object CPU -Desc | Select -First 5"
        
        Note over Server, Agent: PHASE 2: DIAGNOSIS EXECUTION
        Server->>Agent: Socket.IO emit: "execute-command"
        Agent->>Agent: Check against ALLOWED_COMMAND_PATTERNS
        Agent->>Agent: Execute native child_process.exec()
        Agent-->>Server: Socket.IO emit: "command-output" (Raw Process List)
        
        Note over Server, AI: PHASE 3: REMEDIATION STRATEGY
        Server->>AI: Prompt with diagnostic output for safe repair
        AI-->>Server: Remediation Command: "[System.GC]::Collect()" or lower thread priority
        
        Note over Server, Agent: PHASE 4: REMEDIATION APPLICATION
        Server->>Agent: Socket.IO emit: "execute-command" (Remediation)
        Agent->>Agent: Validate allowlist & execute remediation
        Agent-->>Server: Socket.IO emit: "command-close" (Return Code: 0)
        
        Note over Server, Agent: PHASE 5: RECOVERY VERIFICATION
        Server->>Server: Wait 6,000ms stabilization interval
        Server->>Agent: Sample post-fix hardware telemetry
        alt CPU / RAM dropped below threshold
            Server->>DB: Log AutopilotEvent: status = "RESOLVED"
            Server->>Server: Broadcast "autopilot-event-update" to UI
            Server->>Channel: Notify Resolution: "Incident Auto-Remediated"
        else Anomaly persists
            Server->>DB: Log AutopilotEvent: status = "ESCALATED"
            Server->>Channel: Alert: "Autopilot Failed - Human Intervention Required"
        end
    end
```

---

## 7. Component Diagram (Section 2.9)

```mermaid
flowchart TD
    subgraph Presentation["Presentation Tier (Client Side)"]
        SPA["React 19 Single Page App"]
        Charts["Recharts Telemetry Canvas"]
        TerminalComp["Interactive Terminal Console"]
        Gauges["Animated SVG Gauge Components"]
        Toasts["React-Toastify Notification Engine"]
    end

    subgraph Gateway["Transport & Security Gateway"]
        CORS["CORS Policy Middleware"]
        HelmetMW["Helmet HTTP Headers"]
        RateLimiter["Express-Rate-Limit (Auth)"]
        JWTMiddleware["JWT Bearer Authentication"]
        SocketServer["Socket.IO Full-Duplex Gateway"]
    end

    subgraph ApplicationCore["Application Business Core"]
        AuthCtrl["Auth & API Key Controller"]
        AutoCtrl["Autopilot Orchestration Controller"]
        MetricsCtrl["Metrics & History Controller"]
        ReportCtrl["PDFKit Executive Report Generator"]
        DockerCtrl["Dockerode Container Engine"]
    end

    subgraph AnalyticalEngine["Analytical & Intelligence Core"]
        ZScoreEngine["Rolling Z-Score Anomaly Engine"]
        HoltEngine["Holt's DES Predictive Forecaster"]
        GeminiAdapter["Google Gemini Generative AI Adapter"]
        RuleFallbackEngine["Deterministic SRE Heuristic Rules"]
    end

    subgraph HostDaemon["Target Infrastructure Tier"]
        AgentCore["Monitoring Agent (agent.js)"]
        SysInfo["Systeminformation Hardware Probes"]
        SafeExecEngine["Regex-Guarded Command Execution Engine"]
    end

    SPA --> CORS
    SPA --> SocketServer
    CORS --> HelmetMW --> RateLimiter --> JWTMiddleware
    JWTMiddleware --> AuthCtrl
    JWTMiddleware --> MetricsCtrl
    JWTMiddleware --> AutoCtrl
    JWTMiddleware --> ReportCtrl
    
    SocketServer --> AutoCtrl
    AutoCtrl --> ZScoreEngine
    AutoCtrl --> HoltEngine
    AutoCtrl --> GeminiAdapter
    GeminiAdapter -.-> RuleFallbackEngine
    
    SocketServer <--> AgentCore
    AgentCore --> SysInfo
    AgentCore --> SafeExecEngine
```

---

## 8. Module Hierarchy Diagram (Section 2.10)

```mermaid
flowchart TD
    Root["SentinelOps AI Platform (Root)"]
    
    Root --> Frontend["1. Frontend Subsystem (React 19 + Vite)"]
    Root --> Backend["2. Backend Subsystem (Node.js 22 + Express 5)"]
    Root --> Agent["3. Monitoring Daemon Subsystem (agent.js)"]
    Root --> Storage["4. Persistence Subsystem (MongoDB Atlas)"]

    Frontend --> F1["Pages (Landing, Login, Register, Dashboard)"]
    Frontend --> F2["Visualizers (GaugeCard, CPUChart, NetworkChart)"]
    Frontend --> F3["Controls (AutopilotConsole, TerminalConsole, DockerPanel)"]
    Frontend --> F4["Communication (Socket.IO Client, Fetch REST API)"]

    Backend --> B1["API Routes (/auth, /metrics, /incidents, /monitor, /reports)"]
    Backend --> B2["Security Pipeline (JWT, Bcrypt, RateLimit, Helmet, CORS)"]
    Backend --> B3["Intelligence Services (Z-Score Detector, Holt Forecaster, Gemini AI)"]
    Backend --> B4["Infrastructure Services (Dockerode, Nodemailer, Slack, Discord)"]

    Agent --> A1["Telemetry Probes (CPU, RAM, Disk fsSize, Network rx/tx)"]
    Agent --> A2["Process Monitor (Top 10 CPU Tasks)"]
    Agent --> A3["Command Executor (Regex-Guarded child_process.exec)"]

    Storage --> S1["Users Collection (Role-based credentials, webhooks)"]
    Storage --> S2["SystemMetrics Collection (Descending time-series index)"]
    Storage --> S3["Incidents Collection (Severity enums, compound index)"]
    Storage --> S4["AutopilotEvents Collection (Step-by-step audit trail)"]
```


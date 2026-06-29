import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ParticleBackground from "../components/ParticleBackground";
import "../styles/landing.css";

/* ─── Animated counter hook ─── */
const useCountUp = (end, duration = 2000, startOnView = true) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          const start = performance.now();
          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, startOnView]);

  return [count, ref];
};

/* ─── Scroll reveal hook ─── */
const useReveal = (delay = 0) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return [ref, visible];
};

/* ─── Orbiting ring SVG ─── */
const OrbitRing = ({ size, duration, color, opacity = 0.15, dasharray = "6 14" }) => (
  <svg
    width={size}
    height={size}
    viewBox={`0 0 ${size} ${size}`}
    className="orbit-ring"
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      animation: `spin-slow ${duration}s linear infinite`,
      pointerEvents: "none",
    }}
  >
    <circle
      cx={size / 2}
      cy={size / 2}
      r={size / 2 - 2}
      fill="none"
      stroke={color}
      strokeWidth="1"
      strokeDasharray={dasharray}
      opacity={opacity}
    />
  </svg>
);

/* ─── Premium SVG Icons ─── */
const FeatureIcons = {
  brain: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#icon-grad-1)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <defs><linearGradient id="icon-grad-1" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#06d6a0"/><stop offset="100%" stopColor="#38bdf8"/></linearGradient></defs>
      <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/>
      <line x1="10" y1="21" x2="14" y2="21"/><line x1="12" y1="17" x2="12" y2="13"/>
      <path d="M9 13a3 3 0 0 0 6 0"/>
    </svg>
  ),
  robot: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#icon-grad-2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <defs><linearGradient id="icon-grad-2" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#f472b6"/></linearGradient></defs>
      <rect x="3" y="8" width="18" height="12" rx="3"/><path d="M12 2v6"/><circle cx="12" cy="2" r="1.5"/>
      <circle cx="9" cy="14" r="1.5" fill="url(#icon-grad-2)"/><circle cx="15" cy="14" r="1.5" fill="url(#icon-grad-2)"/>
      <path d="M9 18h6"/>
    </svg>
  ),
  chart: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#icon-grad-3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <defs><linearGradient id="icon-grad-3" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#06d6a0"/></linearGradient></defs>
      <path d="M3 3v18h18"/><path d="M7 16l4-6 4 4 5-8"/>
      <circle cx="7" cy="16" r="1.5" fill="url(#icon-grad-3)"/><circle cx="11" cy="10" r="1.5" fill="url(#icon-grad-3)"/>
      <circle cx="15" cy="14" r="1.5" fill="url(#icon-grad-3)"/><circle cx="20" cy="6" r="1.5" fill="url(#icon-grad-3)"/>
    </svg>
  ),
  crystal: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#icon-grad-4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <defs><linearGradient id="icon-grad-4" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#f97316"/></linearGradient></defs>
      <path d="M12 2l4 4-4 14-4-14 4-4z"/><path d="M8 6h8"/><path d="M6 10l6 10 6-10"/>
    </svg>
  ),
  docker: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#icon-grad-5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <defs><linearGradient id="icon-grad-5" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#a78bfa"/></linearGradient></defs>
      <rect x="2" y="10" width="6" height="6" rx="1"/><rect x="9" y="10" width="6" height="6" rx="1"/><rect x="16" y="10" width="6" height="6" rx="1"/>
      <rect x="9" y="3" width="6" height="6" rx="1"/><path d="M2 16h20"/>
    </svg>
  ),
  globe: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#icon-grad-6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <defs><linearGradient id="icon-grad-6" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#06d6a0"/><stop offset="100%" stopColor="#fbbf24"/></linearGradient></defs>
      <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
};

/* ─── Feature Card ─── */
const FeatureCard = ({ svgIcon, title, description, gradient, glowColor, delay }) => {
  const [ref, visible] = useReveal(delay);
  return (
    <div
      ref={ref}
      className={`landing-feature-card ${visible ? "revealed" : ""}`}
      style={{ "--card-gradient": gradient }}
    >
      <div className="feature-icon-wrap">
        <span className="feature-icon">{svgIcon}</span>
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{description}</p>
      <div className="feature-card-glow" style={{ "--glow-color": glowColor }} />
    </div>
  );
};

/* ─── Floating Terminal Preview ─── */
const TerminalPreview = () => {
  const [lines, setLines] = useState([]);
  const terminalLines = [
    { text: "$ sentinel monitor --status", color: "#38bdf8", delay: 0 },
    { text: "  ● System Health: OPTIMAL", color: "#06d6a0", delay: 600 },
    { text: "  ● CPU: 23.4%  Memory: 61.2%  Uptime: 14.2h", color: "#94a3b8", delay: 1200 },
    { text: "  ● Anomalies Detected: 0  Agent: Connected", color: "#94a3b8", delay: 1800 },
    { text: "", color: "#94a3b8", delay: 2200 },
    { text: "$ sentinel autopilot --enable", color: "#38bdf8", delay: 2600 },
    { text: "  ✓ SentinelSRE Autopilot: ACTIVE", color: "#06d6a0", delay: 3200 },
    { text: "  ✓ Self-healing engaged. AI diagnosing anomalies...", color: "#a78bfa", delay: 3800 },
  ];

  useEffect(() => {
    terminalLines.forEach((line) => {
      setTimeout(() => {
        setLines((prev) => [...prev, line]);
      }, line.delay + 1500);
    });
  }, []);

  return (
    <div className="terminal-preview">
      <div className="terminal-header">
        <div className="terminal-dots">
          <span style={{ background: "#ef4444" }} />
          <span style={{ background: "#fbbf24" }} />
          <span style={{ background: "#22c55e" }} />
        </div>
        <span className="terminal-title">SentinelOps CLI — bash</span>
        <div />
      </div>
      <div className="terminal-body">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className="terminal-line"
            style={{
              color: line.color,
              animationDelay: `${idx * 0.08}s`,
            }}
          >
            {line.text}
          </div>
        ))}
        <span className="terminal-cursor">█</span>
      </div>
    </div>
  );
};

/* ─── Dashboard Mini Preview ─── */
const DashboardPreview = () => {
  const [ref, visible] = useReveal(200);
  return (
    <div ref={ref} className={`dashboard-preview-wrap ${visible ? "revealed" : ""}`}>
      <div className="dashboard-preview">
        {/* Mock nav */}
        <div className="mock-nav">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>🛡️</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#f1f5f9" }}>SentinelOps AI</span>
            <span className="mock-badge-healthy">● HEALTHY</span>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span className="mock-nav-link">📊 Metrics</span>
            <span className="mock-nav-link">🔔 Alerts</span>
            <span className="mock-btn-sre">● AI SRE</span>
          </div>
        </div>

        {/* Mock gauge row */}
        <div className="mock-gauge-row">
          {[
            { label: "CPU", value: "23%", color: "#06d6a0" },
            { label: "Memory", value: "61%", color: "#38bdf8" },
            { label: "Network", value: "4.2 MB/s", color: "#a78bfa" },
            { label: "Uptime", value: "14.2h", color: "#06d6a0" },
          ].map((g) => (
            <div key={g.label} className="mock-gauge-card">
              <div className="mock-gauge-value" style={{ color: g.color }}>
                {g.value}
              </div>
              <div className="mock-gauge-label">{g.label}</div>
            </div>
          ))}
        </div>

        {/* Mock chart */}
        <div className="mock-chart-area">
          <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="mock-chart-svg">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06d6a0" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#06d6a0" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06d6a0" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <path
              d="M0 60 Q20 55 40 50 T80 42 T120 45 T160 35 T200 38 T240 25 T280 30 T320 20 T360 22 T400 15 V80 H0 Z"
              fill="url(#chartGrad)"
            />
            <path
              d="M0 60 Q20 55 40 50 T80 42 T120 45 T160 35 T200 38 T240 25 T280 30 T320 20 T360 22 T400 15"
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="2"
            />
          </svg>
          <div className="mock-chart-label">Real-Time CPU Telemetry</div>
        </div>
      </div>

      {/* Reflection glow */}
      <div className="dashboard-preview-reflection" />
    </div>
  );
};

/* ────────────────────────────────────────────────────── */
/* ──────────────── MAIN LANDING COMPONENT ─────────────── */
/* ────────────────────────────────────────────────────── */

const Landing = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [navSolid, setNavSolid] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setNavSolid(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-root">
      <ParticleBackground />

      {/* ═══ NAVBAR ═══ */}
      <nav className={`landing-nav ${navSolid ? "nav-solid" : ""}`}>
        <div className="nav-inner">
          <div className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="nav-logo-icon">🛡️</div>
            <span className="nav-logo-text">SentinelOps AI</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#demo">Demo</a>
            <a href="#architecture">Architecture</a>
            <a href="#tech-stack">Tech Stack</a>
          </div>
          <div className="nav-actions">
            <button className="btn-ghost" onClick={() => navigate("/login")}>
              Sign In
            </button>
            <button className="btn-primary nav-cta" onClick={() => navigate("/register")}>
              Get Started
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button className="nav-mobile-toggle" onClick={() => {
            document.querySelector('.nav-links').classList.toggle('mobile-open');
            document.querySelector('.nav-actions').classList.toggle('mobile-open');
          }}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      <section className="hero-section">
        {/* Orbiting decorative rings */}
        <div className="hero-orbits" style={{ transform: `translateY(${scrollY * 0.08}px)` }}>
          <OrbitRing size={500} duration={40} color="#06d6a0" dasharray="4 18" />
          <OrbitRing size={650} duration={55} color="#38bdf8" opacity={0.08} dasharray="8 20" />
          <OrbitRing size={800} duration={70} color="#a78bfa" opacity={0.06} dasharray="3 25" />
        </div>

        {/* Aurora glow behind hero */}
        <div className="hero-glow" />

        <div className="hero-content">
          <div className="hero-badge animate-fade-in-up">
            <span className="hero-badge-dot" />
            Gemini-Powered Autonomous SRE
          </div>

          <h1 className="hero-title">
            <span className="hero-title-line-1">AI-Powered</span>
            <span className="hero-title-line-2">Infrastructure</span>
            <span className="hero-title-line-3">Intelligence</span>
          </h1>

          <p className="hero-subtitle">
            Real-time server monitoring with Gemini AI diagnostics, Z-score anomaly detection,
            and a fully autonomous self-healing autopilot that diagnoses, remediates,
            and verifies recovery — without human intervention.
          </p>

          <div className="hero-cta-group">
            <button className="btn-primary hero-cta-primary" onClick={() => navigate("/register")}>
              <span>Launch Dashboard</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button className="btn-ghost hero-cta-secondary" onClick={() => {
              document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" opacity="0.6" />
              </svg>
              See It In Action
            </button>
          </div>

          {/* Tech stack line */}
          <div className="hero-trust">
            <span className="hero-trust-text">Built with</span>
            <div className="hero-trust-logos">
              {["React", "Node.js", "MongoDB", "Socket.IO", "Gemini AI", "Docker"].map((name) => (
                <span key={name} className="hero-trust-logo">{name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Floating dashboard preview */}
        <DashboardPreview />
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-eyebrow">CORE CAPABILITIES</span>
          <h2 className="section-heading">
            Everything built into
            <span className="text-gradient"> this platform</span>
          </h2>
          <p className="section-subheading">
            Every feature listed here is real, working, and deployed in the codebase —
            from AI anomaly detection to autonomous self-healing.
          </p>
        </div>

        <div className="features-grid">
          <FeatureCard
            svgIcon={FeatureIcons.brain}
            title="Gemini AI Diagnostics"
            description="Gemini-powered SRE analyzes live system metrics, identifies root causes, and generates diagnostic commands — with rules-based fallback when API is unavailable."
            gradient="linear-gradient(135deg, rgba(6, 214, 160, 0.08), rgba(56, 189, 248, 0.06))"
            glowColor="rgba(6, 214, 160, 0.1)"
            delay={0}
          />
          <FeatureCard
            svgIcon={FeatureIcons.robot}
            title="Autonomous Self-Healing"
            description="5-phase autopilot loop: Generate diagnosis → Execute on node → Design remediation → Apply fix → Verify recovery. Fully autonomous with 30-min cooldown."
            gradient="linear-gradient(135deg, rgba(167, 139, 250, 0.08), rgba(244, 114, 182, 0.06))"
            glowColor="rgba(167, 139, 250, 0.1)"
            delay={100}
          />
          <FeatureCard
            svgIcon={FeatureIcons.chart}
            title="Real-Time WebSocket Telemetry"
            description="CPU, memory, network, and process-level metrics streamed every 3 seconds via Socket.IO with live charts, gauge cards, and historical trend storage in MongoDB."
            gradient="linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(6, 214, 160, 0.06))"
            glowColor="rgba(56, 189, 248, 0.1)"
            delay={200}
          />
          <FeatureCard
            svgIcon={FeatureIcons.crystal}
            title="Predictive Forecasting"
            description="Holt's Double Exponential Smoothing (linear trend) predicts CPU and memory saturation 15 seconds ahead, with early-warning alerts before incidents happen."
            gradient="linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(239, 68, 68, 0.05))"
            glowColor="rgba(251, 191, 36, 0.1)"
            delay={300}
          />
          <FeatureCard
            svgIcon={FeatureIcons.docker}
            title="Docker Container Monitoring"
            description="Live Docker container stats via dockerode — CPU%, memory usage, state, and image info. Start/stop/restart containers and stream container logs from the dashboard."
            gradient="linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(167, 139, 250, 0.05))"
            glowColor="rgba(56, 189, 248, 0.1)"
            delay={400}
          />
          <FeatureCard
            svgIcon={FeatureIcons.globe}
            title="Multi-Server Fleet View"
            description="Deploy lightweight agents on any machine with pre-configured one-click installation scripts. Each agent authenticates via API key and streams metrics to a unified command center."
            gradient="linear-gradient(135deg, rgba(6, 214, 160, 0.05), rgba(251, 191, 36, 0.08))"
            glowColor="rgba(6, 214, 160, 0.1)"
            delay={500}
          />
        </div>
      </section>

      {/* ═══ LIVE DEMO ═══ */}
      <section id="demo" className="demo-section">
        <div className="section-header">
          <span className="section-eyebrow">SEE IT IN ACTION</span>
          <h2 className="section-heading">
            Watch SentinelOps
            <span className="text-gradient"> think and act</span>
          </h2>
          <p className="section-subheading">
            When an anomaly is detected via Z-score analysis, the Autopilot generates
            a diagnosis command via Gemini, executes it on your server, designs a fix,
            and verifies recovery — all autonomously.
          </p>
        </div>

        <div className="demo-terminal-wrap">
          <TerminalPreview />

          {/* Floating annotation badges */}
          <div className="demo-annotation" style={{ top: "15%", right: "-12%" }}>
            <span className="annotation-dot" style={{ background: "#06d6a0" }} />
            WebSocket real-time stream
          </div>
          <div className="demo-annotation" style={{ bottom: "20%", left: "-14%" }}>
            <span className="annotation-dot" style={{ background: "#a78bfa" }} />
            Gemini AI autopilot response
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="architecture" className="howitworks-section">
        <div className="section-header">
          <span className="section-eyebrow">ARCHITECTURE</span>
          <h2 className="section-heading">
            How the
            <span className="text-gradient"> self-healing loop works</span>
          </h2>
        </div>

        <div className="howitworks-steps">
          {[
            {
              step: "01",
              icon: "📡",
              title: "Agent Streams Metrics",
              desc: "A lightweight Node.js agent uses systeminformation to collect CPU, memory, and network data every 3 seconds, sending it to the backend via Socket.IO.",
            },
            {
              step: "02",
              icon: "🔍",
              title: "Z-Score Anomaly Detection",
              desc: "The backend computes rolling mean & standard deviation from MongoDB history. A Z-score above 2.5 triggers an anomaly alert with confidence scoring.",
            },
            {
              step: "03",
              icon: "⚡",
              title: "Autopilot Self-Heals",
              desc: "Gemini AI generates a diagnosis command, executes it on the agent, designs a remediation script, applies the fix, and verifies recovery — 5 autonomous phases.",
            },
          ].map((item, idx) => {
            const [ref, visible] = useReveal(idx * 150);
            return (
              <div key={item.step} ref={ref} className={`hiw-step ${visible ? "revealed" : ""}`}>
                <div className="hiw-step-number">{item.step}</div>
                <div className="hiw-step-icon">{item.icon}</div>
                <h3 className="hiw-step-title">{item.title}</h3>
                <p className="hiw-step-desc">{item.desc}</p>
                {idx < 2 && <div className="hiw-connector" />}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ TECH STACK & EXTRA FEATURES ═══ */}
      <section id="tech-stack" className="testimonial-section">
        <div className="section-header">
          <span className="section-eyebrow">ALSO INCLUDED</span>
          <h2 className="section-heading">
            More than just
            <span className="text-gradient"> monitoring</span>
          </h2>
          <p className="section-subheading">
            Built-in AI chat, Slack/Discord alerts, PDF reports, role-based access control,
            remote terminal execution, and more.
          </p>
        </div>

        <div className="testimonial-grid">
          {[
            {
              icon: "💬",
              title: "AI SRE Chat Assistant",
              desc: "Ask your infrastructure questions in natural language. Gemini AI responds with real-time system context, diagnostics, and recommendations.",
            },
            {
              icon: "📢",
              title: "Slack & Discord Alerts",
              desc: "Configure webhook URLs in the dashboard. Get instant anomaly alerts with severity, message, and timestamps pushed to your team's channels.",
            },
            {
              icon: "📄",
              title: "AI-Powered PDF Reports",
              desc: "One-click export of executive incident reports. Gemini generates an executive summary, root cause analysis, and remediation plan — all in a styled PDF.",
            },
            {
              icon: "🖥️",
              title: "Remote Terminal Execution",
              desc: "Run diagnostic commands directly on any connected agent from the dashboard. Output streams back in real time via WebSocket.",
            },
            {
              icon: "🔑",
              title: "API Keys & RBAC",
              desc: "Role-based access control (admin, engineer, viewer). Generate and manage API keys for authenticating remote monitoring agents.",
            },
            {
              icon: "📊",
              title: "Historical Metrics & Incidents",
              desc: "All metrics are persisted to MongoDB with 1-minute granularity. Incident history with timeline view and AI-powered incident summaries.",
            },
          ].map((item, idx) => {
            const [ref, visible] = useReveal(idx * 80);
            return (
              <div key={item.title} ref={ref} className={`testimonial-card ${visible ? "revealed" : ""}`}>
                <div className="testimonial-quote" style={{ fontSize: "28px" }}>{item.icon}</div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>{item.title}</h3>
                <p className="testimonial-text" style={{ fontStyle: "normal" }}>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="final-cta-section">
        <div className="final-cta-glow" />
        <div className="final-cta-content">
          <h2 className="final-cta-title">
            Ready to see your infrastructure
            <span className="text-gradient"> come alive?</span>
          </h2>
          <p className="final-cta-desc">
            Create an account, connect the agent, and watch SentinelOps AI
            monitor, diagnose, and heal your servers in real time.
          </p>
          <div className="final-cta-buttons">
            <button className="btn-primary hero-cta-primary" onClick={() => navigate("/register")}>
              Create Account & Launch
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button className="btn-ghost hero-cta-secondary" onClick={() => navigate("/login")}>
              Sign In to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ fontSize: "22px" }}>🛡️</span>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "#f1f5f9" }}>SentinelOps AI</span>
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.7, maxWidth: "300px" }}>
              AI-powered infrastructure monitoring with autonomous self-healing.
              Built with React, Node.js, Socket.IO, MongoDB, and Google Gemini.
            </p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Platform</h4>
              <a href="#features">Features</a>
              <a href="#demo">Live Demo</a>
              <a href="#architecture">Architecture</a>
              <a href="#tech-stack">Tech Stack</a>
            </div>
            <div className="footer-col">
              <h4>Built With</h4>
              <a href="#">React + Vite</a>
              <a href="#">Node.js + Express</a>
              <a href="#">MongoDB + Mongoose</a>
              <a href="#">Google Gemini AI</a>
            </div>
            <div className="footer-col">
              <h4>Integrations</h4>
              <a href="#">Slack Webhooks</a>
              <a href="#">Discord Webhooks</a>
              <a href="#">Docker Engine</a>
              <a href="#">Socket.IO</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 SentinelOps AI. Full-stack infrastructure intelligence.</span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "10px" }}>⚡</span>
            Powered by Gemini AI
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

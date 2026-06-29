import { useState } from "react";
import axios from "axios";
import ParticleBackground from "../components/ParticleBackground";
import { API_BASE_URL } from "../config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      localStorage.setItem("token", response.data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <ParticleBackground />
      
      {/* Ambient glow orbs */}
      <div style={{
        position: "fixed",
        top: "-20%",
        left: "-10%",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6, 214, 160, 0.08) 0%, transparent 70%)",
        filter: "blur(60px)",
        animation: "float 8s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed",
        bottom: "-15%",
        right: "-5%",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(167, 139, 250, 0.08) 0%, transparent 70%)",
        filter: "blur(60px)",
        animation: "float 10s ease-in-out infinite reverse",
        pointerEvents: "none",
      }} />

      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(24px) saturate(1.3)",
          WebkitBackdropFilter: "blur(24px) saturate(1.3)",
          padding: "48px 40px",
          borderRadius: "28px",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: "0 25px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          position: "relative",
          zIndex: 10,
          animation: "fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: "absolute",
          top: 0,
          left: "20%",
          right: "20%",
          height: "2px",
          background: "linear-gradient(90deg, transparent, #06d6a0, #38bdf8, transparent)",
          borderRadius: "0 0 2px 2px",
        }} />

        {/* Logo / Brand */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(6, 214, 160, 0.15), rgba(56, 189, 248, 0.15))",
            border: "1px solid rgba(6, 214, 160, 0.2)",
            marginBottom: "20px",
            boxShadow: "0 0 30px rgba(6, 214, 160, 0.1)",
          }}>
            <span style={{ fontSize: "28px" }}>🛡️</span>
          </div>
          <h1 style={{
            fontSize: "32px",
            fontWeight: "800",
            background: "linear-gradient(135deg, #f1f5f9 30%, #06d6a0 60%, #38bdf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.03em",
            marginBottom: "8px",
          }}>
            SentinelOps AI
          </h1>
          <p style={{
            color: "#64748b",
            fontSize: "14px",
            fontWeight: "500",
            letterSpacing: "0.02em",
          }}>
            Secure Infrastructure Command Center
          </p>
        </div>

        {/* Email Input */}
        <div style={{ marginBottom: "16px", position: "relative" }}>
          <label style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "700",
            color: focused === "email" ? "#06d6a0" : "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "8px",
            transition: "color 0.3s ease",
          }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="operator@sentinelops.ai"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            required
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "14px",
              border: `1px solid ${focused === "email" ? "rgba(6, 214, 160, 0.4)" : "rgba(255, 255, 255, 0.06)"}`,
              background: focused === "email" ? "rgba(0, 0, 0, 0.35)" : "rgba(0, 0, 0, 0.2)",
              color: "white",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: focused === "email" ? "0 0 0 3px rgba(6, 214, 160, 0.08), 0 0 20px rgba(6, 214, 160, 0.05)" : "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Password Input */}
        <div style={{ marginBottom: "24px", position: "relative" }}>
          <label style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "700",
            color: focused === "password" ? "#06d6a0" : "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "8px",
            transition: "color 0.3s ease",
          }}>
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            required
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "14px",
              border: `1px solid ${focused === "password" ? "rgba(6, 214, 160, 0.4)" : "rgba(255, 255, 255, 0.06)"}`,
              background: focused === "password" ? "rgba(0, 0, 0, 0.35)" : "rgba(0, 0, 0, 0.2)",
              color: "white",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: focused === "password" ? "0 0 0 3px rgba(6, 214, 160, 0.08), 0 0 20px rgba(6, 214, 160, 0.05)" : "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            color: "#fca5a5",
            padding: "12px 16px",
            borderRadius: "12px",
            marginBottom: "20px",
            fontSize: "13px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "fade-in-up 0.3s ease both",
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            background: loading
              ? "rgba(6, 214, 160, 0.3)"
              : "linear-gradient(135deg, #06d6a0 0%, #38bdf8 100%)",
            border: "none",
            borderRadius: "14px",
            color: loading ? "#94a3b8" : "#030712",
            fontWeight: "800",
            fontSize: "15px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: loading ? "none" : "0 8px 24px rgba(6, 214, 160, 0.2)",
            letterSpacing: "0.02em",
            fontFamily: "inherit",
            position: "relative",
            overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.target.style.transform = "translateY(-2px) scale(1.01)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0) scale(1)";
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <svg width="18" height="18" viewBox="0 0 50 50" style={{ animation: "spin-slow 1s linear infinite" }}>
                <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 94.2" strokeLinecap="round" />
              </svg>
              Authenticating...
            </span>
          ) : (
            "Access Dashboard →"
          )}
        </button>

        {/* Register Link */}
        <p style={{
          marginTop: "28px",
          color: "#64748b",
          textAlign: "center",
          fontSize: "14px",
        }}>
          New to SentinelOps?{" "}
          <span
            onClick={() => (window.location.href = "/register")}
            style={{
              color: "#06d6a0",
              cursor: "pointer",
              fontWeight: "700",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#38bdf8")}
            onMouseLeave={(e) => (e.target.style.color = "#06d6a0")}
          >
            Create Account
          </span>
        </p>

        {/* Bottom security badge */}
        <div style={{
          marginTop: "24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "6px",
          opacity: 0.4,
        }}>
          <span style={{ fontSize: "12px" }}>🔒</span>
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "500", letterSpacing: "0.05em" }}>
            256-BIT ENCRYPTED SESSION
          </span>
        </div>
      </form>

      <style>{`
        @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
      `}</style>
    </div>
  );
};

export default Login;
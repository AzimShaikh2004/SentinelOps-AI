import { useState } from "react";
import axios from "axios";
import ParticleBackground from "../components/ParticleBackground";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", { name, email, password });
      window.location.href = "/login";
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "14px 16px",
    borderRadius: "14px",
    border: `1px solid ${focused === field ? "rgba(167, 139, 250, 0.4)" : "rgba(255, 255, 255, 0.06)"}`,
    background: focused === field ? "rgba(0, 0, 0, 0.35)" : "rgba(0, 0, 0, 0.2)",
    color: "white",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    boxShadow: focused === field ? "0 0 0 3px rgba(167, 139, 250, 0.08), 0 0 20px rgba(167, 139, 250, 0.05)" : "none",
    fontFamily: "inherit",
  });

  const labelStyle = (field) => ({
    display: "block",
    fontSize: "12px",
    fontWeight: "700",
    color: focused === field ? "#a78bfa" : "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "8px",
    transition: "color 0.3s ease",
  });

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

      <div style={{
        position: "fixed",
        top: "-15%",
        right: "-10%",
        width: "450px",
        height: "450px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(167, 139, 250, 0.08) 0%, transparent 70%)",
        filter: "blur(60px)",
        animation: "float 9s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed",
        bottom: "-20%",
        left: "-8%",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(56, 189, 248, 0.06) 0%, transparent 70%)",
        filter: "blur(60px)",
        animation: "float 11s ease-in-out infinite reverse",
        pointerEvents: "none",
      }} />

      <form
        onSubmit={handleRegister}
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
        {/* Top accent */}
        <div style={{
          position: "absolute",
          top: 0,
          left: "20%",
          right: "20%",
          height: "2px",
          background: "linear-gradient(90deg, transparent, #a78bfa, #38bdf8, transparent)",
          borderRadius: "0 0 2px 2px",
        }} />

        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(167, 139, 250, 0.15), rgba(56, 189, 248, 0.15))",
            border: "1px solid rgba(167, 139, 250, 0.2)",
            marginBottom: "20px",
            boxShadow: "0 0 30px rgba(167, 139, 250, 0.1)",
          }}>
            <span style={{ fontSize: "28px" }}>✨</span>
          </div>
          <h1 style={{
            fontSize: "32px",
            fontWeight: "800",
            background: "linear-gradient(135deg, #f1f5f9 30%, #a78bfa 60%, #38bdf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.03em",
            marginBottom: "8px",
          }}>
            Create Account
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>
            Join the SentinelOps AI Platform
          </p>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle("name")}>Full Name</label>
          <input
            type="text"
            placeholder="Commander Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
            required
            style={inputStyle("name")}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle("email")}>Email Address</label>
          <input
            type="email"
            placeholder="operator@sentinelops.ai"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            required
            style={inputStyle("email")}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={labelStyle("password")}>Password</label>
          <input
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            required
            style={inputStyle("password")}
          />
        </div>

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

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            background: loading
              ? "rgba(167, 139, 250, 0.3)"
              : "linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%)",
            border: "none",
            borderRadius: "14px",
            color: loading ? "#94a3b8" : "#030712",
            fontWeight: "800",
            fontSize: "15px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: loading ? "none" : "0 8px 24px rgba(167, 139, 250, 0.2)",
            letterSpacing: "0.02em",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => { if (!loading) e.target.style.transform = "translateY(-2px) scale(1.01)"; }}
          onMouseLeave={(e) => { e.target.style.transform = "translateY(0) scale(1)"; }}
        >
          {loading ? "Creating Account..." : "Create Account →"}
        </button>

        <p style={{ marginTop: "28px", color: "#64748b", textAlign: "center", fontSize: "14px" }}>
          Already have an account?{" "}
          <span
            onClick={() => (window.location.href = "/login")}
            style={{ color: "#a78bfa", cursor: "pointer", fontWeight: "700" }}
            onMouseEnter={(e) => (e.target.style.color = "#38bdf8")}
            onMouseLeave={(e) => (e.target.style.color = "#a78bfa")}
          >
            Sign In
          </span>
        </p>
      </form>

      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
      `}</style>
    </div>
  );
};

export default Register;
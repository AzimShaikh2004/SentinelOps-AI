const AIAnalysisCard = ({ aiAnalysis, onRunDiagnostic, loading }) => {
  return (
    <div className="glass-panel" style={{ marginTop: "30px", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "22px 24px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>🤖</span>
          <h2 style={{
            color: "#f1f5f9",
            fontSize: "18px",
            fontWeight: "700",
            margin: 0,
            letterSpacing: "-0.01em",
          }}>
            AI Site Reliability Engineer
          </h2>
          <span style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "#38bdf8",
            background: "rgba(56, 189, 248, 0.1)",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            padding: "3px 8px",
            borderRadius: "6px",
            letterSpacing: "0.05em",
          }}>
            GEMINI
          </span>
        </div>
        <button
          onClick={onRunDiagnostic}
          disabled={loading}
          style={{
            background: loading
              ? "rgba(255, 255, 255, 0.04)"
              : "linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(6, 214, 160, 0.12))",
            border: `1px solid ${loading ? "rgba(255, 255, 255, 0.06)" : "rgba(56, 189, 248, 0.2)"}`,
            color: loading ? "#475569" : "#38bdf8",
            padding: "8px 18px",
            borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "700",
            fontSize: "13px",
            fontFamily: "inherit",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {loading ? (
            <>
              <svg width="14" height="14" viewBox="0 0 50 50" style={{ animation: "spin-anim 1s linear infinite" }}>
                <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 94.2" strokeLinecap="round" />
              </svg>
              Analyzing...
            </>
          ) : (
            "🔍 Run Diagnostic"
          )}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "24px" }}>
        {aiAnalysis ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fade-in 0.4s ease both" }}>
            {/* Analysis */}
            <div style={{
              background: "rgba(56, 189, 248, 0.04)",
              border: "1px solid rgba(56, 189, 248, 0.1)",
              borderRadius: "14px",
              padding: "18px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "14px" }}>📋</span>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Analysis
                </span>
              </div>
              <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>
                {aiAnalysis.analysis}
              </p>
            </div>

            {/* Recommendation */}
            <div style={{
              background: "rgba(6, 214, 160, 0.04)",
              border: "1px solid rgba(6, 214, 160, 0.1)",
              borderRadius: "14px",
              padding: "18px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "14px" }}>💡</span>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#06d6a0", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Recommendation
                </span>
              </div>
              <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>
                {aiAnalysis.recommendation}
              </p>
            </div>

            {/* Confidence */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                🎯 Confidence
              </span>
              <div style={{
                flex: 1,
                height: "6px",
                borderRadius: "3px",
                background: "rgba(255, 255, 255, 0.04)",
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${aiAnalysis.confidence}%`,
                  height: "100%",
                  borderRadius: "3px",
                  background: aiAnalysis.confidence > 70
                    ? "linear-gradient(90deg, #06d6a0, #38bdf8)"
                    : "linear-gradient(90deg, #fbbf24, #f97316)",
                  transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: `0 0 8px ${aiAnalysis.confidence > 70 ? "rgba(6, 214, 160, 0.3)" : "rgba(251, 191, 36, 0.3)"}`,
                }} />
              </div>
              <span style={{
                fontSize: "14px",
                fontWeight: "800",
                color: aiAnalysis.confidence > 70 ? "#06d6a0" : "#fbbf24",
                fontFamily: "'Outfit', sans-serif",
              }}>
                {aiAnalysis.confidence}%
              </span>
            </div>
          </div>
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "36px 20px",
            color: "#475569",
            gap: "10px",
          }}>
            <span style={{ fontSize: "32px", opacity: 0.3 }}>🔬</span>
            <span style={{ fontSize: "13px", fontWeight: "600" }}>No active diagnostics</span>
            <span style={{ fontSize: "12px", color: "#334155" }}>Click "Run Diagnostic" to launch Gemini SRE analysis</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin-anim { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default AIAnalysisCard;
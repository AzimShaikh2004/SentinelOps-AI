const LoadingSpinner = ({ size = 40, color = "#06d6a0", label = "" }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        {/* Outer ring */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 50 50"
          style={{ animation: "spin-slow 2s linear infinite" }}
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeDasharray="31.4 31.4"
            strokeLinecap="round"
            opacity="0.3"
          />
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray="15.7 94.2"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        {/* Inner pulsing core */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: size * 0.2,
            height: size * 0.2,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 12px ${color}, 0 0 24px ${color}40`,
            animation: "pulse-core 1.5s ease-in-out infinite",
          }}
        />
      </div>
      {label && (
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#94a3b8",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      )}
      <style>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-core {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.4); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;

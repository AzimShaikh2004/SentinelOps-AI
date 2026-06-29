import { useEffect, useState } from "react";

const GaugeCard = ({ title, value, color, icon }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Smooth count-up animation
    const duration = 600;
    const start = displayValue;
    const diff = value - start;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayValue(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayValue / 100) * circumference;

  const getStatusColor = () => {
    if (displayValue < 50) return "#06d6a0";
    if (displayValue < 80) return "#fbbf24";
    return "#ef4444";
  };

  const activeColor = color || getStatusColor();
  const glowColor = `${activeColor}40`;

  return (
    <div
      className="glass-panel"
      style={{
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "300px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute",
        bottom: "-40%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "200px",
        height: "200px",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
        filter: "blur(40px)",
        pointerEvents: "none",
      }} />

      {/* Title */}
      <h3 style={{
        fontSize: "13px",
        fontWeight: "700",
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}>
        {icon && <span style={{ fontSize: "16px" }}>{icon}</span>}
        {title}
      </h3>

      {/* SVG Gauge */}
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth={strokeWidth}
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id={`gauge-grad-${title}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={activeColor} stopOpacity="0.5" />
              <stop offset="100%" stopColor={activeColor} stopOpacity="1" />
            </linearGradient>
            <filter id={`glow-${title}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Active arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#gauge-grad-${title})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            filter={`url(#glow-${title})`}
            style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
        </svg>

        {/* Center value */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}>
          <span style={{
            fontSize: "38px",
            fontWeight: "800",
            fontFamily: "'Outfit', 'Inter', sans-serif",
            color: activeColor,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            textShadow: `0 0 20px ${glowColor}`,
          }}>
            {displayValue}
          </span>
          <span style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#64748b",
            marginLeft: "2px",
          }}>
            %
          </span>
        </div>
      </div>

      {/* Status indicator bar */}
      <div style={{
        marginTop: "20px",
        width: "100%",
        maxWidth: "140px",
        height: "4px",
        borderRadius: "2px",
        background: "rgba(255, 255, 255, 0.04)",
        overflow: "hidden",
      }}>
        <div style={{
          width: `${displayValue}%`,
          height: "100%",
          borderRadius: "2px",
          background: `linear-gradient(90deg, ${activeColor}80, ${activeColor})`,
          transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: `0 0 8px ${glowColor}`,
        }} />
      </div>

      {/* Status text */}
      <div style={{
        marginTop: "12px",
        fontSize: "11px",
        fontWeight: "700",
        color: activeColor,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        opacity: 0.8,
      }}>
        {displayValue < 50 ? "OPTIMAL" : displayValue < 80 ? "ELEVATED" : "CRITICAL"}
      </div>
    </div>
  );
};

export default GaugeCard;
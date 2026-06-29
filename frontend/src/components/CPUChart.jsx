import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

const CPUChart = ({ data, forecast }) => {
  const mergedData = data.map(d => ({ ...d, forecastUsage: null }));

  if (forecast && forecast.length > 0) {
    if (mergedData.length > 0) {
      mergedData[mergedData.length - 1].forecastUsage = mergedData[mergedData.length - 1].usage;
    }
    forecast.forEach((val, idx) => {
      mergedData.push({
        time: `+${(idx + 1) * 3}s`,
        usage: null,
        forecastUsage: val,
      });
    });
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={{
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "14px",
        padding: "14px 18px",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
      }}>
        <p style={{ color: "#64748b", fontSize: "11px", fontWeight: "700", marginBottom: "8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {label}
        </p>
        {payload.map((entry, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: entry.color, boxShadow: `0 0 8px ${entry.color}60` }} />
            <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "600" }}>{entry.name}:</span>
            <span style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: "700" }}>{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: "24px", marginTop: "30px" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>📈</span>
          <h2 style={{
            color: "#f1f5f9",
            fontSize: "18px",
            fontWeight: "700",
            margin: 0,
            letterSpacing: "-0.01em",
          }}>
            CPU Usage & ML Forecast
          </h2>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          fontSize: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "12px", height: "3px", borderRadius: "2px", background: "#06d6a0" }} />
            <span style={{ color: "#64748b", fontWeight: "600" }}>Actual</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "12px", height: "3px", borderRadius: "2px", background: "#a78bfa", opacity: 0.6 }} />
            <span style={{ color: "#64748b", fontWeight: "600" }}>Forecast</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={mergedData}>
          <defs>
            <linearGradient id="cpuGlowPremium" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06d6a0" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#06d6a0" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="forecastGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="#334155"
            tickLine={false}
            axisLine={false}
            style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}
          />
          <YAxis
            stroke="#334155"
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={80} stroke="rgba(239, 68, 68, 0.2)" strokeDasharray="4 4" label="" />

          <Area
            type="monotone"
            dataKey="usage"
            name="Actual CPU"
            stroke="#06d6a0"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#cpuGlowPremium)"
            connectNulls
            dot={false}
            activeDot={{
              r: 5,
              fill: "#06d6a0",
              stroke: "#030712",
              strokeWidth: 2,
              filter: "drop-shadow(0 0 6px rgba(6, 214, 160, 0.5))",
            }}
          />

          <Area
            type="monotone"
            dataKey="forecastUsage"
            name="Forecast (Holt ML)"
            stroke="#a78bfa"
            strokeWidth={2}
            strokeDasharray="6 4"
            fill="url(#forecastGlow)"
            fillOpacity={1}
            connectNulls
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CPUChart;
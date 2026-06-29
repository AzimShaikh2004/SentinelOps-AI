import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const HistoricalCPUChart = ({ data }) => {
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
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a78bfa", boxShadow: "0 0 8px rgba(167, 139, 250, 0.5)" }} />
            <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "600" }}>{entry.name}:</span>
            <span style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: "700" }}>{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ marginTop: "30px", padding: "24px" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>📊</span>
          <h2 style={{
            color: "#f1f5f9",
            fontSize: "18px",
            fontWeight: "700",
            margin: 0,
            letterSpacing: "-0.01em",
          }}>
            Historical CPU Trend
          </h2>
        </div>
        <span style={{
          fontSize: "11px",
          fontWeight: "700",
          color: "#a78bfa",
          background: "rgba(167, 139, 250, 0.1)",
          border: "1px solid rgba(167, 139, 250, 0.2)",
          padding: "3px 8px",
          borderRadius: "6px",
          letterSpacing: "0.05em",
        }}>
          60s INTERVAL
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="histCpuGlowPremium" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.2} />
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
            style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="cpuUsage"
            name="CPU Usage"
            stroke="#a78bfa"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#histCpuGlowPremium)"
            dot={false}
            activeDot={{
              r: 5,
              fill: "#a78bfa",
              stroke: "#030712",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoricalCPUChart;
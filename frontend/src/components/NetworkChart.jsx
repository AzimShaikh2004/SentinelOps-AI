import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const NetworkChart = ({ data }) => {
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
            <span style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: "700" }}>{entry.value} MB/s</span>
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
          <span style={{ fontSize: "20px" }}>🌐</span>
          <h2 style={{
            color: "#f1f5f9",
            fontSize: "18px",
            fontWeight: "700",
            margin: 0,
            letterSpacing: "-0.01em",
          }}>
            Network Throughput
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
            <span style={{ color: "#64748b", fontWeight: "600" }}>⬇ Download</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "12px", height: "3px", borderRadius: "2px", background: "#38bdf8" }} />
            <span style={{ color: "#64748b", fontWeight: "600" }}>⬆ Upload</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="dlGlowPremium" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06d6a0" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#06d6a0" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="ulGlowPremium" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.0} />
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
            dataKey="download"
            name="Download"
            stroke="#06d6a0"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#dlGlowPremium)"
            dot={false}
            activeDot={{
              r: 5,
              fill: "#06d6a0",
              stroke: "#030712",
              strokeWidth: 2,
            }}
          />
          <Area
            type="monotone"
            dataKey="upload"
            name="Upload"
            stroke="#38bdf8"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#ulGlowPremium)"
            dot={false}
            activeDot={{
              r: 5,
              fill: "#38bdf8",
              stroke: "#030712",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NetworkChart;
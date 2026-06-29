import { useState, useRef, useEffect } from "react";

const NotificationCenter = ({ notifications, setNotifications }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case "HIGH": return { color: "#ef4444", bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.15)", icon: "🔴" };
      case "MEDIUM": return { color: "#fbbf24", bg: "rgba(251, 191, 36, 0.08)", border: "rgba(251, 191, 36, 0.15)", icon: "🟡" };
      default: return { color: "#06d6a0", bg: "rgba(6, 214, 160, 0.08)", border: "rgba(6, 214, 160, 0.15)", icon: "🟢" };
    }
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: isOpen ? "rgba(56, 189, 248, 0.1)" : "rgba(255, 255, 255, 0.04)",
          border: `1px solid ${isOpen ? "rgba(56, 189, 248, 0.3)" : "rgba(255, 255, 255, 0.06)"}`,
          borderRadius: "14px",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          color: isOpen ? "#38bdf8" : "#94a3b8",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          fontFamily: "inherit",
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        <span style={{ fontSize: "18px", filter: unreadCount > 0 ? "drop-shadow(0 0 4px #ef4444)" : "none" }}>
          🔔
        </span>
        <span style={{ display: "none" }}>Alerts</span>
        {unreadCount > 0 && (
          <div style={{
            background: "linear-gradient(135deg, #ef4444, #f97316)",
            color: "white",
            borderRadius: "10px",
            minWidth: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: "800",
            padding: "0 5px",
            boxShadow: "0 0 12px rgba(239, 68, 68, 0.3)",
            animation: "badge-pulse 2s infinite",
          }}>
            {unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: "400px",
            maxHeight: "480px",
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(24px) saturate(1.3)",
            WebkitBackdropFilter: "blur(24px) saturate(1.3)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "18px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.1)",
            zIndex: 999,
            overflow: "hidden",
            animation: "dropdown-enter 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "16px", fontWeight: "700", color: "#f1f5f9" }}>Alerts</span>
              {unreadCount > 0 && (
                <span style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  color: "#ef4444",
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "2px 8px",
                  borderRadius: "8px",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={markAllAsRead}
              style={{
                background: "none",
                border: "none",
                color: "#38bdf8",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                padding: "6px 10px",
                borderRadius: "8px",
                transition: "all 0.2s ease",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => (e.target.style.background = "rgba(56, 189, 248, 0.1)")}
              onMouseLeave={(e) => (e.target.style.background = "none")}
            >
              Mark all read
            </button>
          </div>

          {/* Notification list */}
          <div style={{ overflowY: "auto", maxHeight: "380px", padding: "8px" }}>
            {notifications.length === 0 ? (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 20px",
                color: "#475569",
                gap: "8px",
              }}>
                <span style={{ fontSize: "28px", opacity: 0.4 }}>🔕</span>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>All clear</span>
                <span style={{ fontSize: "11px", color: "#334155" }}>No active notifications</span>
              </div>
            ) : (
              notifications.map((notification, index) => {
                const config = getSeverityConfig(notification.severity);
                return (
                  <div
                    key={index}
                    style={{
                      padding: "14px 16px",
                      marginBottom: "4px",
                      borderRadius: "14px",
                      background: notification.read ? "transparent" : config.bg,
                      border: `1px solid ${notification.read ? "transparent" : config.border}`,
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = notification.read ? "transparent" : config.bg;
                    }}
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "12px" }}>{config.icon}</span>
                        <span style={{
                          fontWeight: "700",
                          fontSize: "13px",
                          color: notification.read ? "#94a3b8" : "#f1f5f9",
                        }}>
                          {notification.type}
                        </span>
                      </div>
                      {!notification.read && (
                        <div style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: "#38bdf8",
                          boxShadow: "0 0 8px rgba(56, 189, 248, 0.5)",
                        }} />
                      )}
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: "13px",
                      color: notification.read ? "#64748b" : "#cbd5e1",
                      lineHeight: "1.5",
                      marginBottom: "6px",
                    }}>
                      {notification.message}
                    </p>
                    <span style={{
                      fontSize: "11px",
                      color: "#475569",
                      fontWeight: "500",
                    }}>
                      {notification.time}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropdown-enter {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes badge-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;
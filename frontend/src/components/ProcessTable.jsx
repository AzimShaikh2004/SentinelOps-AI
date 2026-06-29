const ProcessTable = ({
  processes,
}) => {
  return (
    <div
      style={{
        marginTop: "30px",

        background:
          "rgba(30,41,59,0.7)",

        borderRadius: "18px",

        padding: "25px",

        border:
          "1px solid rgba(255,255,255,0.08)",

        overflowX: "auto",
      }}
    >
      <h2
        style={{
          marginBottom: "20px",

          color: "white",
        }}
      >
        Live Process Monitoring
      </h2>

      <table
        style={{
          width: "100%",

          borderCollapse: "collapse",

          color: "white",
        }}
      >
        <thead>
          <tr
            style={{
              background:
                "rgba(255,255,255,0.05)",
            }}
          >
            <th style={thStyle}>PID</th>

            <th style={thStyle}>
              Process Name
            </th>

            <th style={thStyle}>
              CPU %
            </th>

            <th style={thStyle}>
              Memory (MB)
            </th>
          </tr>
        </thead>

        <tbody>
          {processes &&
          processes.length > 0 ? (
            processes.map(
              (process, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom:
                      "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <td style={tdStyle}>
                    {process.pid}
                  </td>

                  <td style={tdStyle}>
                    {process.name}
                  </td>

                  <td
                    style={{
                      ...tdStyle,

                      color:
                        process.cpu > 50
                          ? "#ef4444"
                          : "#22c55e",
                    }}
                  >
                    {process.cpu}%
                  </td>

                  <td style={tdStyle}>
                    {process.memory}
                  </td>
                </tr>
              )
            )
          ) : (
            <tr>
              <td
                colSpan="4"
                style={{
                  textAlign: "center",

                  padding: "20px",

                  color: "#94a3b8",
                }}
              >
                No process data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = {
  padding: "14px",

  textAlign: "left",

  color: "#94a3b8",
};

const tdStyle = {
  padding: "14px",
};

export default ProcessTable;
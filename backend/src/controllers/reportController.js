const PDFDocument = require("pdfkit");
const Incident = require("../models/Incident");
const { generateContentWithFallback } = require("../utils/geminiHelper");

const exportIncidentReport = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .sort({ createdAt: -1 })
      .limit(100);

    const memoryCount = incidents.filter((i) => i.type === "MEMORY").length;
    const cpuCount = incidents.filter((i) => i.type === "CPU").length;
    const networkCount = incidents.filter((i) => i.type === "NETWORK").length;
    const offlineCount = incidents.filter((i) => i.type === "SERVER_OFFLINE").length;

    // Generate AI Summary and Root Cause Analysis using Gemini
    const incidentListText = incidents
      .slice(0, 15) // send top 15 to keep prompt concise
      .map(i => `- [${i.severity}] ${i.type}: ${i.message} (${new Date(i.createdAt).toLocaleTimeString()})`)
      .join('\n');

    const prompt = `
      You are an elite virtual SRE Chief Technology Officer (CTO). 
      Analyze the following incident logs (last alerts) from the active server cluster and write a high-level executive diagnostic report.
      
      Recent Alert Logs:
      ${incidentListText || "No active alerts or server outages logged."}
      
      Provide your summary strictly in the following JSON format:
      {
        "executiveSummary": "A concise 2-3 sentence executive-level SRE summary summarizing the health trends, frequent failure modes, and total impact of the cluster's alerts.",
        "rootCauseAnalysis": "A brief analysis pointing out potential root causes (e.g. resource contention, misconfiguration, application leaks) based on the alert trends.",
        "remediationPlan": "A numbered list of 3-4 professional recommendations to prevent these outages from recurring."
      }
    `;

    let aiSummary = {
      executiveSummary: "System is overall stable with minimal incident counts. Basic monitors indicate no immediate critical cluster outages.",
      rootCauseAnalysis: "No active anomaly alerts detected in log files. Baselines are within standard limits.",
      remediationPlan: "1. Continue normal operations and routine monitoring.\n2. Review system alarm thresholds periodically.\n3. Validate log rotations to keep disk metrics clean."
    };

    try {
      if (process.env.GEMINI_API_KEY) {
        const aiResponse = await generateContentWithFallback({
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                executiveSummary: { type: "STRING" },
                rootCauseAnalysis: { type: "STRING" },
                remediationPlan: { type: "STRING" }
              },
              required: ["executiveSummary", "rootCauseAnalysis", "remediationPlan"]
            }
          }
        });

        if (aiResponse && aiResponse.text) {
          aiSummary = JSON.parse(aiResponse.text);
        }
      }
    } catch (err) {
      console.warn("Gemini report generation failed, using local fallback summary:", err.message);
    }

    // PDF generation
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=SentinelOps_Executive_Report.pdf");
    doc.pipe(res);

    // Color Palette
    const slateDark = "#0f172a";
    const slateLight = "#475569";
    const skyBlue = "#0ea5e9";
    const emeraldGreen = "#10b981";
    const bgGray = "#f8fafc";
    const amberBorder = "#f59e0b";
    const amberBg = "#fffbeb";

    // 1. Header Section
    doc
      .rect(0, 0, doc.page.width, 100)
      .fill(slateDark);

    doc
      .fillColor("#ffffff")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("SENTINELOPS AI", 40, 25)
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#94a3b8")
      .text("Automated Infrastructure Diagnostic & Incident Report", 40, 52);

    // Date tag
    doc
      .fillColor("#ffffff")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(`GENERATED: ${new Date().toLocaleString()}`, doc.page.width - 250, 40, { align: "right", width: 210 });

    doc.y = 120; // reset vertical index

    // 2. Metrics Summary Grid Card
    doc
      .fillColor(slateDark)
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Operational Summary", 40, doc.y);
    doc.moveDown(0.5);

    const gridTop = doc.y;
    const boxWidth = 125;
    const boxHeight = 60;
    const gap = 12;

    const stats = [
      { label: "Total Incidents", value: incidents.length, color: slateDark },
      { label: "Memory Alerts", value: memoryCount, color: "#f59e0b" },
      { label: "CPU Alerts", value: cpuCount, color: "#ef4444" },
      { label: "Offline Servers", value: offlineCount, color: "#7c3aed" }
    ];

    stats.forEach((stat, i) => {
      const left = 40 + i * (boxWidth + gap);
      // Background Box
      doc
        .rect(left, gridTop, boxWidth, boxHeight)
        .fillAndStroke(bgGray, "#e2e8f0");
      
      // Text Value
      doc
        .fillColor(stat.color)
        .fontSize(18)
        .font("Helvetica-Bold")
        .text(stat.value.toString(), left + 15, gridTop + 12);

      // Text Label
      doc
        .fillColor(slateLight)
        .fontSize(9)
        .font("Helvetica")
        .text(stat.label, left + 15, gridTop + 34, { width: boxWidth - 30 });
    });

    doc.y = gridTop + boxHeight + 25;

    // 3. AI SRE Diagnostics Card
    doc
      .fillColor(slateDark)
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("🤖 AI SRE Incident Analysis", 40, doc.y);
    doc.moveDown(0.5);

    const aiCardTop = doc.y;
    doc
      .rect(40, aiCardTop, doc.page.width - 80, 165)
      .fillAndStroke(amberBg, "#fcd34d");

    doc.y = aiCardTop + 15;
    
    doc
      .fillColor(slateDark)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Executive Summary: ", 55, doc.y)
      .font("Helvetica")
      .fillColor(slateLight)
      .text(aiSummary.executiveSummary, 170, doc.y, { width: doc.page.width - 245 });
    doc.moveDown(0.8);

    doc
      .fillColor(slateDark)
      .font("Helvetica-Bold")
      .text("Root Cause: ", 55, doc.y)
      .font("Helvetica")
      .fillColor(slateLight)
      .text(aiSummary.rootCauseAnalysis, 170, doc.y, { width: doc.page.width - 245 });
    doc.moveDown(0.8);

    doc
      .fillColor(slateDark)
      .font("Helvetica-Bold")
      .text("Remediation Plan: ", 55, doc.y)
      .font("Helvetica")
      .fillColor(slateLight)
      .text(aiSummary.remediationPlan, 170, doc.y, { width: doc.page.width - 245 });

    doc.y = aiCardTop + 185;

    // 4. Incident Logs Section
    doc
      .fillColor(slateDark)
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Recent Alerts Log History", 40, doc.y);
    doc.moveDown(0.5);

    // Draw Table Header
    const tableTop = doc.y;
    doc
      .rect(40, tableTop, doc.page.width - 80, 25)
      .fill(slateDark);

    doc
      .fillColor("#ffffff")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Alert Type", 55, tableTop + 7)
      .text("Severity", 160, tableTop + 7)
      .text("Message description", 250, tableTop + 7)
      .text("Logged Time", doc.page.width - 160, tableTop + 7);

    doc.y = tableTop + 30;

    // Table rows
    const rowHeight = 22;
    const maxRows = 12; // cap it to fit single page beautifully
    const displayIncidents = incidents.slice(0, maxRows);

    displayIncidents.forEach((incident, i) => {
      const currentY = doc.y;
      
      // Zebra striping
      if (i % 2 === 0) {
        doc
          .rect(40, currentY, doc.page.width - 80, rowHeight)
          .fill(bgGray);
      }

      const severityColor = incident.severity === "HIGH" ? "#ef4444" : incident.severity === "MEDIUM" ? "#f59e0b" : emeraldGreen;

      doc
        .fillColor(slateDark)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(incident.type, 55, currentY + 6)
        .fillColor(severityColor)
        .text(incident.severity, 160, currentY + 6)
        .fillColor(slateLight)
        .font("Helvetica")
        .text(incident.message, 250, currentY + 6, { width: doc.page.width - 420, ellipsis: true })
        .text(new Date(incident.createdAt).toLocaleString(), doc.page.width - 160, currentY + 6, { width: 110, align: "right" });

      doc.y = currentY + rowHeight;
    });

    // Page footer
    doc
      .fillColor(slateLight)
      .fontSize(8)
      .text("SentinelOps AI Monitor • Automated Executive Diagnostics Report • Confidentially Distributed", 40, doc.page.height - 30, { align: "center", width: doc.page.width - 80 });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to generate report",
    });
  }
};

module.exports = {
  exportIncidentReport,
};
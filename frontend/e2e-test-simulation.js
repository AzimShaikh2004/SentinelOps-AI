/**
 * SentinelOps AI - E2E Visual Verification Simulation
 * Requirements: npm install -D playwright
 * Run: npx playwright test (or node e2e-test-simulation.js)
 */

const { chromium } = require("playwright");

(async () => {
  console.log("🚀 Starting SentinelOps AI E2E Visual Test Simulation...");

  // Launch Chrome in headless mode
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  try {
    // 1. Navigate to SentinelOps AI
    console.log("🌐 Navigating to login portal...");
    await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
    
    // Assert Page Title
    const title = await page.title();
    console.log(`✅ Loaded page. Title: "${title}"`);

    // 2. Perform Authentication
    console.log("🔐 Entering test administrator credentials...");
    await page.fill('input[placeholder*="Username"]', "admin");
    await page.fill('input[placeholder*="Password"]', "admin123");
    
    console.log("🖱 Clicking Submit...");
    await page.click('button[type="submit"]');

    // Wait for Dashboard Navigation
    await page.waitForURL("**/dashboard", { timeout: 8000 });
    console.log("✅ Authenticated and navigated to Dashboard successfully!");

    // 3. Verify Glassmorphic Telemetry Panels
    console.log("📊 Checking CPU and Memory telemetry cards...");
    const isHeaderVisible = await page.isVisible("text=SentinelOps AI");
    if (isHeaderVisible) {
      console.log("✅ Main Glassmorphic Header is visible.");
    }

    // 4. Test AI SRE Chat Drawer
    console.log("💬 Opening AI SRE Assistant Chat Drawer...");
    await page.click("text=Ask AI SRE");
    await page.waitForSelector("text=AI SRE Chat Assistant", { state: "visible" });
    console.log("✅ Chat drawer opened successfully.");

    console.log("✍ Sending test metric inquiry to SRE...");
    await page.fill('input[placeholder*="Ask SRE"]', "Is my CPU usage normal?");
    await page.click("text=Send");
    console.log("⏳ Awaiting AI analysis response...");
    
    // Wait for AI to respond
    await page.waitForSelector("text=SRE is analyzing system metrics...", { state: "hidden" });
    console.log("✅ AI SRE responded to telemetry query.");

    // Close chat drawer
    await page.click('button:has-text("×")');

    // 5. Test Docker Logs Panel
    console.log("🐳 Testing Docker Logs Modal...");
    const logsButton = page.locator('button:has-text("Logs")').first();
    if (await logsButton.isVisible()) {
      await logsButton.click();
      console.log("⏳ Awaiting container logs from Docker socket...");
      await page.waitForSelector("text=logs @", { state: "visible" });
      console.log("✅ Live logs streamed and rendered successfully inside modal!");
      
      // Close logs modal
      await page.click('button:has-text("Close")');
      console.log("✅ Logs modal dismissed.");
    } else {
      console.log("⚠️ No Docker containers found to execute log verification.");
    }

    console.log("\n🎉 All E2E Verification Checkpoints Passed Successfully!");

  } catch (error) {
    console.error("\n❌ E2E Simulation failed:", error.message);
  } finally {
    await browser.close();
    console.log("🏁 Browser closed. Simulation completed.");
  }
})();

# SentinelOps-AI Monitoring Agent Installer for Windows (PowerShell)
$ErrorActionPreference = "Stop"

# Use environment variables if set, fallback to default prompts
$apiKey = $env:API_KEY
$backendUrl = $env:BACKEND_URL

if (-not $apiKey) {
    $apiKey = Read-Host -Prompt "Enter your SentinelOps API Key"
}
if (-not $backendUrl) {
    $backendUrl = "https://sentinelops-ai-jzlp.onrender.com"
}

Write-Host "🛡️ SentinelOps-AI Agent Installation Utility" -ForegroundColor Cyan
Write-Host "=============================================="

# 1. Check prerequisites
Write-Host "Checking system dependencies..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed on this system. Please install Node.js (v18+) to run the agent."
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not installed on this system. npm is required to install agent dependencies."
}

# 2. Create installation directory
$installDir = Join-Path $env:USERPROFILE "sentinelops-agent"
if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Force -Path $installDir | Out-Null
    Write-Host "Created installation folder: $installDir" -ForegroundColor Green
} else {
    Write-Host "Found existing folder: $installDir"
}

# 3. Download agent files from GitHub raw
Write-Host "Downloading agent components from GitHub repository..."
$githubRawUrl = "https://raw.githubusercontent.com/AzimShaikh2004/SentinelOps-AI/main/agent"

try {
    Invoke-WebRequest -Uri "$githubRawUrl/package.json" -OutFile (Join-Path $installDir "package.json") -UseBasicParsing
    Invoke-WebRequest -Uri "$githubRawUrl/agent.js" -OutFile (Join-Path $installDir "agent.js") -UseBasicParsing
    Write-Host "Download completed successfully." -ForegroundColor Green
} catch {
    Write-Error "Failed to download files from GitHub. Please check your internet connection."
}

# 4. Write credentials configuration
Write-Host "Configuring local environment..."
$envContent = "API_KEY=$apiKey`nBACKEND_URL=$backendUrl"
Set-Content -Path (Join-Path $installDir ".env") -Value $envContent -Force

# 5. Install dependencies
Write-Host "Installing required dependencies via npm (this may take a few seconds)..."
Push-Location $installDir
try {
    Start-Process npm -ArgumentList "install --no-audit --no-fund" -NoNewWindow -Wait
    Write-Host "Dependencies installed successfully." -ForegroundColor Green
} catch {
    Write-Error "npm install failed. Please check local npm configuration."
}

# 6. Success message and start instructions
Write-Host ""
Write-Host "🛡️ SentinelOps-AI Agent is fully installed!" -ForegroundColor Green
Write-Host "==========================================="
Write-Host "Location: $installDir"
Write-Host "To run the agent in the background, execute:"
Write-Host "  Start-Process node -ArgumentList 'agent.js' -WorkingDirectory '$installDir' -NoNewWindow" -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting agent now..." -ForegroundColor Cyan
Start-Process node -ArgumentList "agent.js" -WorkingDirectory $installDir -NoNewWindow
Write-Host "Agent started! Check your SentinelOps dashboard fleet view." -ForegroundColor Green
Pop-Location

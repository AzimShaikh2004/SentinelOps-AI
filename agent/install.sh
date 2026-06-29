#!/bin/bash
# SentinelOps-AI Monitoring Agent Installer for Linux (Bash)
set -e

# Use environment variables if set, fallback to default prompts
API_KEY="${API_KEY:-}"
BACKEND_URL="${BACKEND_URL:-https://sentinelops-ai-jzlp.onrender.com}"

if [ -z "$API_KEY" ]; then
    echo -n "Enter your SentinelOps API Key: "
    read -r API_KEY
fi

echo -e "\e[36m🛡️ SentinelOps-AI Agent Installation Utility\e[0m"
echo "=============================================="

# 1. Check prerequisites
echo "Checking system dependencies..."
if ! command -v node &> /dev/null; then
    echo -e "\e[31mError: Node.js is not installed on this system. Please install Node.js (v18+) to run the agent.\e[0m"
    exit 1
fi
if ! command -v npm &> /dev/null; then
    echo -e "\e[31mError: npm is not installed on this system. npm is required to install dependencies.\e[0m"
    exit 1
fi

# 2. Create installation directory
INSTALL_DIR="$HOME/sentinelops-agent"
if [ ! -d "$INSTALL_DIR" ]; then
    mkdir -p "$INSTALL_DIR"
    echo -e "Created installation folder: \e[32m$INSTALL_DIR\e[0m"
else
    echo "Found existing folder: $INSTALL_DIR"
fi

# 3. Download agent files from GitHub raw
echo "Downloading agent components from GitHub repository..."
GITHUB_RAW_URL="https://raw.githubusercontent.com/AzimShaikh2004/SentinelOps-AI/main/agent"

if curl -s "$GITHUB_RAW_URL/package.json" -o "$INSTALL_DIR/package.json" && \
   curl -s "$GITHUB_RAW_URL/agent.js" -o "$INSTALL_DIR/agent.js"; then
    echo -e "\e[32mDownload completed successfully.\e[0m"
else
    echo -e "\e[31mError: Failed to download files from GitHub. Please check internet connection.\e[0m"
    exit 1
fi

# 4. Write credentials configuration
echo "Configuring local environment..."
cat << EOF > "$INSTALL_DIR/.env"
API_KEY=$API_KEY
BACKEND_URL=$BACKEND_URL
EOF

# 5. Install dependencies
echo "Installing required dependencies via npm (this may take a few seconds)..."
cd "$INSTALL_DIR"
npm install --no-audit --no-fund

# 6. Success message and start instructions
echo ""
echo -e "\e[32m🛡️ SentinelOps-AI Agent is fully installed!\e[0m"
echo "==========================================="
echo "Location: $INSTALL_DIR"
echo "To run the agent in the background, run:"
echo -e "  \e[33mnohup node agent.js > agent.log 2>&1 &\e[0m"
echo ""
echo -e "\e[36mStarting agent now...\e[0m"
nohup node agent.js > agent.log 2>&1 &
echo -e "\e[32mAgent started in background! Check your SentinelOps dashboard fleet view.\e[0m"

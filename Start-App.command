#!/bin/bash
# ══════════════════════════════════════════════════
#   AI-CareerMatch — Double Click to START
#   Just double-click this file in Finder to launch!
# ══════════════════════════════════════════════════

PROJECT="$(cd "$(dirname "$0")" && pwd)"

# Start MySQL
brew services start mysql > /dev/null 2>&1
sleep 2

# Get current LAN IP
LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")

# Update frontend API URL with current IP
echo "VITE_API_URL=http://${LAN_IP}:8000/api" > "$PROJECT/frontend/.env.local"

# Kill any old instances
pkill -f "uvicorn app.main:app" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 1

# Start Backend
cd "$PROJECT/backend"
nohup .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/aicm_backend.log 2>&1 &
sleep 3

# Start Frontend
cd "$PROJECT/frontend"
nohup npm run dev > /tmp/aicm_frontend.log 2>&1 &
sleep 3

# Open in browser automatically
open "http://localhost:5173"

# Show macOS notification
osascript -e 'display notification "App is running! Open http://localhost:5173 or http://'"$LAN_IP"':5173 on mobile." with title "AI-CareerMatch is LIVE" sound name "Glass"' 2>/dev/null || true

echo "================================================="
echo " App started successfully!"
echo " Laptop: http://localhost:5173"
echo " Mobile (same WiFi): http://${LAN_IP}:5173"
echo "================================================="


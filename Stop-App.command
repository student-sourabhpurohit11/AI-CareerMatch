#!/bin/bash
# ══════════════════════════════════════════════════
#   AI-CareerMatch — Double Click to STOP
# ══════════════════════════════════════════════════

pkill -f "uvicorn app.main:app" 2>/dev/null
pkill -f "vite" 2>/dev/null

osascript -e 'display notification "Backend and Frontend have been stopped." with title "AI-CareerMatch Stopped" sound name "Basso"' 2>/dev/null || true

echo "================================================="
echo " All AI-CareerMatch services stopped."
echo "================================================="


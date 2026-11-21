#!/bin/bash
# =============================================================================
# AI-CareerMatch — One-Command Startup Script
# Usage: ./start.sh
# Starts MySQL, Backend (FastAPI), and Frontend (Vite) together.
# Mobile phones on the same WiFi can access via your Mac's LAN IP.
# =============================================================================

set -e

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# ── Get LAN IP ────────────────────────────────────────────────────────────────
LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        AI-CareerMatch — Starting Up            ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"
echo ""

# ── 1. Ensure MySQL is running ────────────────────────────────────────────────
echo -e "${YELLOW}[1/3] Checking MySQL...${NC}"
if ! mysql -h 127.0.0.1 -P 3306 -u root -pRoot@1234 -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "      Starting MySQL..."
    brew services start mysql > /dev/null 2>&1
    sleep 3
fi
echo -e "${GREEN}      ✓ MySQL is running${NC}"

# ── 2. Update frontend .env.local with current LAN IP ────────────────────────
echo -e "${YELLOW}[2/3] Configuring frontend API URL → http://${LAN_IP}:8000/api${NC}"
cat > "$FRONTEND_DIR/.env.local" << EOF
VITE_API_URL=http://${LAN_IP}:8000/api
EOF
echo -e "${GREEN}      ✓ Frontend configured${NC}"

# ── 3. Start Backend ──────────────────────────────────────────────────────────
echo -e "${YELLOW}[3/3] Starting Backend (FastAPI on port 8000)...${NC}"
cd "$BACKEND_DIR"
# Activate venv and start uvicorn bound to all interfaces
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
sleep 2

# Check backend started
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}      ✓ Backend running (PID $BACKEND_PID)${NC}"
else
    echo -e "${RED}      ✗ Backend failed to start. Check errors above.${NC}"
    exit 1
fi

# ── 4. Start Frontend ─────────────────────────────────────────────────────────
echo -e "${YELLOW}      Starting Frontend (Vite on port 5173)...${NC}"
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!
sleep 3

# ── Print Access URLs ─────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║               🚀 App is LIVE!                  ║${NC}"
echo -e "${CYAN}╠════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║${NC}  💻 On this Mac:                                ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}     ${GREEN}http://localhost:5173${NC}                        ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}                                                ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  📱 On Mobile (same WiFi):                      ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}     ${GREEN}http://${LAN_IP}:5173${NC}                  ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}                                                ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  🔧 API Docs:                                   ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}     ${GREEN}http://localhost:8000/docs${NC}                  ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}                                                ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  👤 Demo Credentials:                           ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}     Student: student.test.unit@example.com      ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}     Password: SecureStudentPass123               ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}     Admin:   admin@aicareermatch.com             ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}     Password: Admin@123                          ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services.${NC}"
echo ""

# ── Trap Ctrl+C to cleanly kill both processes ────────────────────────────────
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Done. Goodbye!${NC}"
    exit 0
}
trap cleanup INT TERM

# Wait for both
wait $BACKEND_PID $FRONTEND_PID


#!/bin/bash
# =============================================================
# PulseBoard Deploy Script
# Usage: bash deploy.sh
# Pulls latest code from GitHub and restarts all services
# =============================================================

set -euo pipefail

SERVER="deploy@98.83.149.72"
SSH_PORT=2200
SSH_KEY="$HOME/.ssh/pulseboard-key"
APP_DIR="/opt/pulseboard"
LOG_FILE="/tmp/pulseboard-deploy.log"

log() { echo "[$(date '+%H:%M:%S')] $1"; }

log "Starting PulseBoard deployment"
log "Target: $SERVER:$SSH_PORT"

# ── Run all commands on the remote server ──────────────────
ssh -i "$SSH_KEY" -p "$SSH_PORT" "$SERVER" << 'REMOTE'
set -euo pipefail

APP_DIR="/opt/pulseboard"
log() { echo "[$(date '+%H:%M:%S')] $1"; }

log "Pulling latest code from GitHub"
cd $APP_DIR
git pull origin main

log "Updating auth-service dependencies"
cd $APP_DIR/services/auth-service
source .venv/bin/activate
pip install -r requirements.txt -q

log "Restarting auth-service"
sudo systemctl restart pulseboard-auth
sleep 3

log "Reloading Nginx"
sudo nginx -t && sudo systemctl reload nginx

log "Running smoke tests"
sleep 2

AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8001/health)
if [ "$AUTH_STATUS" = "200" ]; then
    echo "✓ auth-service healthy"
else
    echo "✗ auth-service returned $AUTH_STATUS"
    exit 1
fi

HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://pulseboard.duckdns.org/api/auth/health)
if [ "$HTTPS_STATUS" = "200" ]; then
    echo "✓ HTTPS endpoint healthy"
else
    echo "✗ HTTPS endpoint returned $HTTPS_STATUS"
    exit 1
fi

echo ""
echo "=================================================="
echo "✓ Deployment complete"
echo "  Live at: https://pulseboard.duckdns.org"
echo "=================================================="
REMOTE

log "Deployment finished successfully"

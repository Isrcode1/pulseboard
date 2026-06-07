#!/bin/bash
# =============================================================
# PulseBoard Server Setup Script
# Stage 0 — Task 5
# Idempotent: safe to run multiple times
# Usage: sudo bash setup.sh
# =============================================================

set -euo pipefail

# ── CONFIG — edit these before running ──────────────────────
DOMAIN="pulseboard.duckdns.org"
SSH_PORT=2200
DEPLOY_USER="deploy"
EMAIL="folarinisrael981@gmail.com"
LOG_FILE="/var/log/pulseboard-setup.log"
# ─────────────────────────────────────────────────────────────

# ── LOGGING ──────────────────────────────────────────────────
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ── MUST RUN AS ROOT ─────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
    echo "Run this script with sudo: sudo bash setup.sh"
    exit 1
fi

log "=================================================="
log "PulseBoard setup starting"
log "Domain: $DOMAIN | SSH Port: $SSH_PORT | User: $DEPLOY_USER"
log "=================================================="


# ── STEP 1: SYSTEM UPDATE ────────────────────────────────────
log "STEP 1: Updating system packages"

apt update -y >> "$LOG_FILE" 2>&1
apt upgrade -y >> "$LOG_FILE" 2>&1
apt install -y curl wget git vim htop ufw net-tools unzip \
    certbot python3-certbot-nginx >> "$LOG_FILE" 2>&1

log "STEP 1: Done"


# ── STEP 2: CREATE DEPLOY USER ───────────────────────────────
log "STEP 2: Creating deploy user"

if id "$DEPLOY_USER" &>/dev/null; then
    log "STEP 2: User $DEPLOY_USER already exists — skipping"
else
    adduser --disabled-password --gecos '' "$DEPLOY_USER"
    log "STEP 2: User $DEPLOY_USER created"
fi

# Add to sudo group
usermod -aG sudo "$DEPLOY_USER"

# Copy SSH keys from root or ubuntu user
ROOT_KEYS=""
if [[ -f /root/.ssh/authorized_keys ]]; then
    ROOT_KEYS="/root/.ssh/authorized_keys"
elif [[ -f /home/ubuntu/.ssh/authorized_keys ]]; then
    ROOT_KEYS="/home/ubuntu/.ssh/authorized_keys"
fi

if [[ -n "$ROOT_KEYS" ]]; then
    mkdir -p /home/$DEPLOY_USER/.ssh
    cp "$ROOT_KEYS" /home/$DEPLOY_USER/.ssh/authorized_keys
    chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
    chmod 700 /home/$DEPLOY_USER/.ssh
    chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys
    log "STEP 2: SSH keys copied to $DEPLOY_USER"
else
    log "STEP 2: WARNING — no authorized_keys found to copy"
fi

log "STEP 2: Done"


# ── STEP 3: SSH HARDENING ────────────────────────────────────
log "STEP 3: Hardening SSH"

# Back up original if backup doesn't exist yet
if [[ ! -f /etc/ssh/sshd_config.bak ]]; then
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
    log "STEP 3: sshd_config backed up"
fi

cat > /etc/ssh/sshd_config << EOF
Include /etc/ssh/sshd_config.d/*.conf
Port $SSH_PORT
AllowUsers $DEPLOY_USER
PermitRootLogin no
PasswordAuthentication no
ChallengeResponseAuthentication no
UsePAM yes
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
AllowTcpForwarding no
MaxAuthTries 3
MaxSessions 5
SyslogFacility AUTH
LogLevel VERBOSE
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server
EOF

# Validate before restarting
if sshd -t; then
    systemctl restart ssh
    log "STEP 3: SSH hardened and restarted on port $SSH_PORT"
else
    log "STEP 3: ERROR — sshd config invalid. Restoring backup."
    cp /etc/ssh/sshd_config.bak /etc/ssh/sshd_config
    systemctl restart ssh
    exit 1
fi

log "STEP 3: Done"


# ── STEP 4: UFW FIREWALL ─────────────────────────────────────
log "STEP 4: Configuring UFW firewall"

ufw --force reset >> "$LOG_FILE" 2>&1
ufw default deny incoming >> "$LOG_FILE" 2>&1
ufw default allow outgoing >> "$LOG_FILE" 2>&1
ufw allow $SSH_PORT/tcp comment 'SSH' >> "$LOG_FILE" 2>&1
ufw allow 80/tcp comment 'HTTP' >> "$LOG_FILE" 2>&1
ufw allow 443/tcp comment 'HTTPS' >> "$LOG_FILE" 2>&1
ufw --force enable >> "$LOG_FILE" 2>&1

log "STEP 4: UFW enabled — ports $SSH_PORT, 80, 443 open"
log "STEP 4: Done"


# ── STEP 5: NGINX ────────────────────────────────────────────
log "STEP 5: Installing and configuring Nginx"

apt install -y nginx >> "$LOG_FILE" 2>&1
systemctl enable nginx >> "$LOG_FILE" 2>&1

# Create web directory
mkdir -p /var/www/pulseboard

# Write landing page only if it doesn't exist
if [[ ! -f /var/www/pulseboard/index.html ]]; then
    cat > /var/www/pulseboard/index.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PulseBoard — Coming Soon</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #07090f; color: #cde0f0;
      font-family: 'Segoe UI', sans-serif;
      min-height: 100vh; display: flex;
      align-items: center; justify-content: center; text-align: center;
    }
    .container { max-width: 600px; padding: 40px 24px; }
    .badge {
      display: inline-block;
      background: rgba(0,229,255,0.08);
      border: 1px solid rgba(0,229,255,0.25);
      color: #00e5ff; font-size: 11px; letter-spacing: 3px;
      text-transform: uppercase; padding: 6px 16px;
      border-radius: 2px; margin-bottom: 28px;
    }
    h1 { font-size: 56px; font-weight: 800; letter-spacing: -2px; margin-bottom: 16px; }
    h1 span { color: #00e5ff; } h1 span.o { color: #ff6b35; }
    p { font-size: 14px; color: #607d96; line-height: 1.9; margin-bottom: 36px; font-family: monospace; }
    .form { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    input {
      background: #0f1420; border: 1px solid #1e2d45; color: #cde0f0;
      padding: 12px 18px; border-radius: 3px; font-size: 13px;
      font-family: monospace; width: 260px; outline: none;
    }
    button {
      background: #00e5ff; color: #07090f; border: none;
      padding: 12px 24px; border-radius: 3px; font-size: 13px;
      font-weight: 700; cursor: pointer; letter-spacing: 1px;
    }
    .footer { margin-top: 48px; font-family: monospace; font-size: 11px; color: #2a3f58; }
    .footer a { color: #00e5ff; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">Coming Soon</div>
    <h1><span>Pulse</span><span class="o">Board</span></h1>
    <p>Your entire dev life. One link. Always live.<br>
    GitHub activity · Blog posts · Skills · Analytics.</p>
    <div class="form">
      <input type="email" placeholder="your@email.com" />
      <button>GET EARLY ACCESS</button>
    </div>
    <div class="footer">
      Built by <a href="https://github.com/Isrcode1" target="_blank">@Isrcode1</a>
      &nbsp;·&nbsp; DevOps Stage 0
    </div>
  </div>
</body>
</html>
HTMLEOF
    log "STEP 5: Landing page created"
else
    log "STEP 5: Landing page already exists — skipping"
fi

# Write Nginx server block
cat > /etc/nginx/sites-available/pulseboard << EOF
server {
    listen 80;
    server_name $DOMAIN;
    root /var/www/pulseboard;
    index index.html;
    location / {
        try_files \$uri \$uri/ =404;
    }
    access_log /var/log/nginx/pulseboard-access.log;
    error_log  /var/log/nginx/pulseboard-error.log;
}
EOF

# Enable site
if [[ ! -L /etc/nginx/sites-enabled/pulseboard ]]; then
    ln -s /etc/nginx/sites-available/pulseboard /etc/nginx/sites-enabled/
fi

# Disable default
if [[ -L /etc/nginx/sites-enabled/default ]]; then
    unlink /etc/nginx/sites-enabled/default
fi

# Test and reload
if nginx -t >> "$LOG_FILE" 2>&1; then
    systemctl reload nginx
    log "STEP 5: Nginx configured and reloaded"
else
    log "STEP 5: ERROR — Nginx config invalid"
    exit 1
fi

log "STEP 5: Done"


# ── STEP 6: SSL CERTIFICATE ──────────────────────────────────
log "STEP 6: Obtaining SSL certificate for $DOMAIN"

if [[ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]]; then
    log "STEP 6: Certificate already exists — skipping"
else
    if certbot --nginx -d "$DOMAIN" \
        --non-interactive --agree-tos \
        -m "$EMAIL" --redirect >> "$LOG_FILE" 2>&1; then
        log "STEP 6: SSL certificate obtained successfully"
    else
        log "STEP 6: WARNING — SSL certificate failed. Run certbot manually later."
    fi
fi

log "STEP 6: Done"


# ── DONE ─────────────────────────────────────────────────────
log "=================================================="
log "PulseBoard setup COMPLETE"
log "Server IP:  $(curl -s https://checkip.amazonaws.com)"
log "Domain:     https://$DOMAIN"
log "SSH Port:   $SSH_PORT"
log "Log file:   $LOG_FILE"
log "=================================================="

echo ""
echo "✓ Setup complete. Check the log: tail -50 $LOG_FILE"

#!/usr/bin/env bash
# One-time bootstrap of a fresh Ubuntu/Debian VDS. Run as root:
#   scp deploy/server-setup.sh root@SERVER:/root/ && ssh root@SERVER bash /root/server-setup.sh
#
# What it does:
#   - installs Docker Engine + Compose plugin, pulls Docker Hub images via mirror.gcr.io
#   - creates the `deploy` user (docker group, root's SSH keys copied over)
#   - creates /srv/infra, /srv/backups and project directories owned by `deploy`
#   - enables the firewall: only SSH, HTTP and HTTPS are open
#   - adds 2 GB swap if there is none (small VDS + Postgres + Node)
set -euo pipefail

DEPLOY_USER="${DEPLOY_USER:-deploy}"

if [[ $EUID -ne 0 ]]; then
  echo "Run as root" >&2
  exit 1
fi

apt-get update
apt-get install -y ca-certificates curl ufw openssl

if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi

# Docker Hub is unreachable from some hosting networks (e.g. Russian VDS), so pull
# Docker Hub images through Google's mirror. ghcr.io (project images) is not affected.
if [[ ! -s /etc/docker/daemon.json ]]; then
  install -d /etc/docker
  cat > /etc/docker/daemon.json <<'JSON'
{
  "registry-mirrors": ["https://mirror.gcr.io"]
}
JSON
  systemctl restart docker
elif ! grep -q registry-mirrors /etc/docker/daemon.json; then
  echo "WARN: /etc/docker/daemon.json exists, add \"registry-mirrors\": [\"https://mirror.gcr.io\"] manually" >&2
fi

if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi
usermod -aG docker "$DEPLOY_USER"

install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
if [[ -f /root/.ssh/authorized_keys ]]; then
  cat /root/.ssh/authorized_keys >> "/home/$DEPLOY_USER/.ssh/authorized_keys"
  sort -u -o "/home/$DEPLOY_USER/.ssh/authorized_keys" "/home/$DEPLOY_USER/.ssh/authorized_keys"
  chown "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh/authorized_keys"
  chmod 600 "/home/$DEPLOY_USER/.ssh/authorized_keys"
fi

# /srv belongs to the deploy user so new projects can be added without root.
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" /srv /srv/infra /srv/backups /srv/apexrate

ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo
echo "Done. Next: log in as '$DEPLOY_USER' and set up /srv/infra (see deploy/README.md)."
echo "Note: Docker publishes ports past ufw; only Caddy (80/443) and Postgres on 127.0.0.1 are published."

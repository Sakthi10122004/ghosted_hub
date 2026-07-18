#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# Ghosted Platform — Deployment Script
# ─────────────────────────────────────────────────────────────────

set -e

if [ -z "$1" ]; then
  echo "Usage: ./deploy.sh <user@your-vm-ip>"
  echo "Example: ./deploy.sh ubuntu@203.0.113.50"
  exit 1
fi

DEST="$1"
REMOTE_DIR="~/ghosted-platform"

echo "🚀 Starting deployment to $DEST..."

# 1. Sync files to the remote server using rsync
echo "📦 Syncing files to remote server (this may take a minute)..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.next' \
  --exclude 'dist' \
  --exclude '.env' \
  --exclude '.env.local' \
  ./ "$DEST:$REMOTE_DIR"

# 2. SSH into the server and run docker-compose
echo "🐳 Building and starting Docker containers on remote server..."
ssh -t "$DEST" << EOF
  cd $REMOTE_DIR

  # Ensure .env is present (if this is the first deployment, copy from .env.production)
  if [ ! -f .env ]; then
    echo "⚠️ .env file not found on server! Creating one from .env.production..."
    cp .env.production .env
    echo "Please remember to update the .env file with your real secrets on the server!"
  fi

  # Build and start services
  docker compose -f docker-compose.prod.yml down
  docker compose -f docker-compose.prod.yml build
  docker compose -f docker-compose.prod.yml up -d
  
  echo "✅ Deployment finished!"
EOF

echo "🎉 Deployment successful!"

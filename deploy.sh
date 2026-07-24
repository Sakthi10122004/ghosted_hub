#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# Ghosted Platform — Deployment Script
# ─────────────────────────────────────────────────────────────────

set -e

KEY_ARG=""
SSH_ARGS=""
RSYNC_RSH=""

# Parse options
while getopts "i:" opt; do
  case ${opt} in
    i )
      KEY_ARG=$OPTARG
      SSH_ARGS="-i $KEY_ARG"
      RSYNC_RSH="ssh -i $KEY_ARG"
      ;;
    \? )
      echo "Usage: ./deploy.sh [-i /path/to/key.pem] <user@your-vm-ip>"
      exit 1
      ;;
  esac
done
shift $((OPTIND -1))

if [ -z "$1" ]; then
  echo "Usage: ./deploy.sh [-i /path/to/key.pem] <user@your-vm-ip>"
  echo "Example: ./deploy.sh ubuntu@203.0.113.50"
  echo "Example with key: ./deploy.sh -i ~/.ssh/my-key.pem ubuntu@203.0.113.50"
  exit 1
fi

DEST="$1"
REMOTE_DIR="~/ghosted-platform"

echo "🚀 Starting deployment to $DEST..."

# 1. Sync files to the remote server using rsync
echo "📦 Syncing files to remote server (this may take a minute)..."

if [ -n "$RSYNC_RSH" ]; then
  rsync -avz --delete -e "$RSYNC_RSH" \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.next' \
    --exclude 'dist' \
    --exclude '.env' \
    --exclude '.env.local' \
    ./ "$DEST:$REMOTE_DIR"
else
  rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.next' \
    --exclude 'dist' \
    --exclude '.env' \
    --exclude '.env.local' \
    ./ "$DEST:$REMOTE_DIR"
fi


# 2. SSH into the server and run docker-compose
echo "🐳 Building and starting Docker containers on remote server..."
ssh $SSH_ARGS -t "$DEST" << EOF
  cd $REMOTE_DIR

  # Ensure .env is present (if this is the first deployment, copy from .env.production)
  if [ ! -f .env ]; then
    echo "⚠️ .env file not found on server! Creating one from .env.production..."
    cp .env.production .env
    echo "Please remember to update the .env file with your real secrets on the server!"
  fi

  # Build and start services
  docker compose -f docker/docker-compose.prod.yml down
  docker compose -f docker/docker-compose.prod.yml build
  docker compose -f docker/docker-compose.prod.yml up -d
  
  echo "✅ Deployment finished!"
EOF

echo "🎉 Deployment successful!"

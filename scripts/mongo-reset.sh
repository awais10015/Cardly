#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  Stops the local development MongoDB and wipes its data directory.
#  ⚠️  Only affects the LOCAL db/mongo-data instance — a remote MONGODB_URI
#      (Atlas …) is never touched.
#
#      npm run db:reset
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="$ROOT/db/mongo-data"
TOOL_DIR="$ROOT/.mongo"
PID_FILE="$TOOL_DIR/mongod.pid"

log() { echo "[mongo-reset] $*"; }

if [ -f "$PID_FILE" ]; then
  PID="$(cat "$PID_FILE")"
  if kill -0 "$PID" 2>/dev/null; then
    log "Stopping mongod (pid $PID)…"
    kill "$PID" 2>/dev/null || true
    for _ in $(seq 1 10); do kill -0 "$PID" 2>/dev/null || break; sleep 1; done
    kill -9 "$PID" 2>/dev/null || true
  fi
  rm -f "$PID_FILE"
fi

if [ -d "$DATA_DIR" ]; then
  log "Removing $DATA_DIR …"
  rm -rf "$DATA_DIR"
fi

log "Local MongoDB data cleared. Run 'npm run db:start' to start fresh."
exit 0

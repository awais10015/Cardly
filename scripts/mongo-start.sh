#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  Starts a local MongoDB for development (idempotent — safe to run always).
#
#  • Skips entirely when MONGODB_URI points at a non-local cluster (Atlas …).
#  • Reuses a mongod already listening on the port.
#  • Finds a mongod binary in PATH, in .mongo/, or downloads the official
#    MongoDB Community binary once (~120 MB) into .mongo/.
#  • Data lives in db/mongo-data/ (git-ignored).
#
#  Managed automatically by `npm run dev` (predev hook). Manual use:
#      npm run db:start
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${MONGODB_PORT:-27017}"
DATA_DIR="$ROOT/db/mongo-data"
TOOL_DIR="$ROOT/.mongo"
LOG_FILE="$TOOL_DIR/mongod.log"
PID_FILE="$TOOL_DIR/mongod.pid"
MONGO_VERSION="8.0.12"
TGZ_URL="https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-debian12-${MONGO_VERSION}.tgz"

log() { echo "[mongo-start] $*"; }

# ── 1. Respect a remote MONGODB_URI from .env ────────────────────────────────
if [ -f "$ROOT/.env" ]; then
  URI_LINE="$(rg -N '^\s*MONGODB_URI\s*=' "$ROOT/.env" | tail -1 | cut -d= -f2- | tr -d '\"'"'"' ' || true)"
  if [ -n "${URI_LINE// /}" ] && [[ "$URI_LINE" != *"127.0.0.1"* && "$URI_LINE" != *"localhost"* ]]; then
    log "MONGODB_URI is remote ($URI_LINE) — skipping local mongod."
    exit 0
  fi
fi

# ── 2. Already running? ──────────────────────────────────────────────────────
if node -e "
  const net = require('net');
  const s = net.connect($PORT, '127.0.0.1');
  s.on('connect', () => process.exit(0));
  s.on('error', () => process.exit(1));
  setTimeout(() => process.exit(1), 1500);
" 2>/dev/null; then
  log "mongod already listening on 127.0.0.1:$PORT — nothing to do."
  exit 0
fi

# ── 3. Locate (or fetch) a mongod binary ─────────────────────────────────────
MONGOD_BIN="$(command -v mongod || true)"
if [ -z "$MONGOD_BIN" ] && [ -x "$TOOL_DIR/mongod" ]; then
  MONGOD_BIN="$TOOL_DIR/mongod"
fi
if [ -z "$MONGOD_BIN" ] && [ -f "$TOOL_DIR/mongodb.tgz" ]; then
  log "Extracting cached $TOOL_DIR/mongodb.tgz …"
  tar -xzf "$TOOL_DIR/mongodb.tgz" -C "$TOOL_DIR"
  BIN_SRC="$(rg --files "$TOOL_DIR" -g 'mongod' 2>/dev/null | head -1 || true)"
  if [ -n "$BIN_SRC" ]; then mv "$BIN_SRC" "$TOOL_DIR/mongod" && chmod +x "$TOOL_DIR/mongod"; fi
  [ -x "$TOOL_DIR/mongod" ] && MONGOD_BIN="$TOOL_DIR/mongod"
fi
if [ -z "$MONGOD_BIN" ]; then
  log "No mongod found — downloading MongoDB ${MONGO_VERSION} (one-time, ~120 MB)…"
  mkdir -p "$TOOL_DIR"
  if curl -fsSL --max-time 300 -o "$TOOL_DIR/mongodb.tgz" "$TGZ_URL"; then
    tar -xzf "$TOOL_DIR/mongodb.tgz" -C "$TOOL_DIR"
    BIN_SRC="$(rg --files "$TOOL_DIR" -g 'mongod' 2>/dev/null | head -1 || true)"
    if [ -n "$BIN_SRC" ]; then mv "$BIN_SRC" "$TOOL_DIR/mongod" && chmod +x "$TOOL_DIR/mongod"; fi
    [ -x "$TOOL_DIR/mongod" ] && MONGOD_BIN="$TOOL_DIR/mongod"
  else
    log "WARN: download failed — continuing without a local database."
    log "      The app will start, but /api/health reports database: down."
    log "      Fix: set MONGODB_URI in .env to an Atlas cluster, or re-run 'npm run db:start'."
    exit 0
  fi
fi
log "Using mongod: $MONGOD_BIN"

# ── 4. Start + wait for readiness ────────────────────────────────────────────
mkdir -p "$DATA_DIR"
log "Starting mongod (dbpath=$DATA_DIR, port=$PORT)…"
"$MONGOD_BIN" \
  --dbpath "$DATA_DIR" \
  --port "$PORT" \
  --bind_ip 127.0.0.1 \
  --fork \
  --pidfilepath "$PID_FILE" \
  --logpath "$LOG_FILE" >/dev/null 2>&1

for i in $(seq 1 30); do
  if node -e "
    const net = require('net');
    const s = net.connect($PORT, '127.0.0.1');
    s.on('connect', () => process.exit(0));
    s.on('error', () => process.exit(1));
    setTimeout(() => process.exit(1), 1000);
" 2>/dev/null; then
    log "MongoDB is up on 127.0.0.1:$PORT (data: $DATA_DIR, log: $LOG_FILE)"
    exit 0
  fi
  sleep 1
done

log "WARN: mongod did not become ready within 30s — check $LOG_FILE"
exit 0

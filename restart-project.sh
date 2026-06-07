#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/BOT TG/backend"
MINI_APP_DIR="$ROOT_DIR/BOT TG"

BACKEND_PORT="${BACKEND_PORT:-3000}"
FRONTEND_PORT="${FRONTEND_PORT:-8000}"
MINI_APP_PORT="${MINI_APP_PORT:-8080}"

LOG_DIR="$ROOT_DIR/.logs"
mkdir -p "$LOG_DIR"

BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"
MINI_APP_LOG="$LOG_DIR/mini-app.log"

WITH_MINI_APP=false
CLEANUP_DONE=false

if [ "${1:-}" = "--with-mini" ]; then
  WITH_MINI_APP=true
fi

echo "=== VoltEdge restart ==="
echo "Project root: $ROOT_DIR"
echo "Backend port: $BACKEND_PORT"
echo "Frontend port: $FRONTEND_PORT"
echo "Mini App port: $MINI_APP_PORT"
echo "With Mini App: $WITH_MINI_APP"
echo ""

kill_port() {
  local port="$1"

  echo "Checking port $port..."

  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" >/dev/null 2>&1 || true
    return
  fi

  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -ti tcp:"$port" || true)"

    if [ -n "$pids" ]; then
      echo "$pids" | xargs kill -9 || true
    fi

    return
  fi

  echo "No fuser/lsof found. Skipping port kill for $port."
}

cleanup() {
  if [ "$CLEANUP_DONE" = true ]; then
    return
  fi

  CLEANUP_DONE=true

  echo ""
  echo "Stopping services..."

  if [ -n "${BACKEND_PID:-}" ]; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi

  if [ -n "${FRONTEND_PID:-}" ]; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi

  if [ -n "${MINI_APP_PID:-}" ]; then
    kill "$MINI_APP_PID" >/dev/null 2>&1 || true
  fi

  echo "Stopped."
}

trap cleanup INT TERM EXIT

echo "Stopping old processes..."
kill_port "$BACKEND_PORT"
kill_port "$FRONTEND_PORT"

if [ "$WITH_MINI_APP" = true ]; then
  kill_port "$MINI_APP_PORT"
fi

echo ""
echo "Preparing backend..."

if [ ! -d "$BACKEND_DIR" ]; then
  echo "Backend folder not found: $BACKEND_DIR"
  exit 1
fi

cd "$BACKEND_DIR"

if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies..."
  npm install
fi

if [ ! -f ".env" ]; then
  echo "WARNING: .env not found in BOT TG/backend"
  echo "Create it with:"
  echo "PORT=$BACKEND_PORT"
  echo "TG_KEY=your_bot_token"
  echo "OWNER_ID=your_telegram_chat_id"
  echo ""
fi

echo "Starting backend..."
PORT="$BACKEND_PORT" npm run dev > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Backend log: $BACKEND_LOG"

echo ""
echo "Starting frontend..."
cd "$ROOT_DIR"

python3 -m http.server "$FRONTEND_PORT" --bind 0.0.0.0 > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!

echo "Frontend PID: $FRONTEND_PID"
echo "Frontend log: $FRONTEND_LOG"

if [ "$WITH_MINI_APP" = true ]; then
  echo ""
  echo "Preparing Mini App..."

  if [ ! -d "$MINI_APP_DIR" ]; then
    echo "Mini App folder not found: $MINI_APP_DIR"
    exit 1
  fi

  cd "$MINI_APP_DIR"

  if ! command -v flutter >/dev/null 2>&1; then
    echo "Flutter is not installed or not available in PATH."
    echo "Mini App was not started."
  else
    echo "Installing Flutter dependencies..."
    flutter pub get

    echo "Starting Mini App..."
    flutter run -d web-server --web-hostname 0.0.0.0 --web-port "$MINI_APP_PORT" > "$MINI_APP_LOG" 2>&1 &
    MINI_APP_PID=$!

    echo "Mini App PID: $MINI_APP_PID"
    echo "Mini App log: $MINI_APP_LOG"
  fi
fi

echo ""
echo "Waiting for services..."
sleep 2

echo ""
echo "Health check backend:"
curl -s "http://localhost:$BACKEND_PORT/health" || true

echo ""
echo ""
echo "=== Started ==="
echo "Frontend: http://localhost:$FRONTEND_PORT"
echo "Backend:  http://localhost:$BACKEND_PORT"
echo "Health:   http://localhost:$BACKEND_PORT/health"

if [ "$WITH_MINI_APP" = true ]; then
  echo "Mini App: http://localhost:$MINI_APP_PORT"
fi

echo ""
echo "Logs:"
echo "Backend:  tail -f $BACKEND_LOG"
echo "Frontend: tail -f $FRONTEND_LOG"

if [ "$WITH_MINI_APP" = true ]; then
  echo "Mini App: tail -f $MINI_APP_LOG"
fi

echo ""
echo "Press Ctrl+C to stop services."

wait

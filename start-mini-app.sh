#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
MINI_APP_DIR="$ROOT_DIR/BOT TG"
MINI_APP_PORT="${MINI_APP_PORT:-8080}"

LOG_DIR="$ROOT_DIR/.logs"
mkdir -p "$LOG_DIR"

MINI_APP_LOG="$LOG_DIR/mini-app.log"
CLEANUP_DONE=false

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
  echo "Stopping Mini App..."

  if [ -n "${MINI_APP_PID:-}" ]; then
    kill "$MINI_APP_PID" >/dev/null 2>&1 || true
  fi

  echo "Stopped."
}

trap cleanup INT TERM EXIT

echo "=== VoltEdge Mini App ==="
echo "Mini App dir: $MINI_APP_DIR"
echo "Mini App port: $MINI_APP_PORT"
echo ""

if [ ! -d "$MINI_APP_DIR" ]; then
  echo "Mini App folder not found: $MINI_APP_DIR"
  exit 1
fi

if ! command -v flutter >/dev/null 2>&1; then
  echo "Flutter is not installed or not available in PATH."
  exit 1
fi

kill_port "$MINI_APP_PORT"

cd "$MINI_APP_DIR"

echo "Installing Flutter dependencies..."
flutter pub get

echo "Starting Mini App..."
flutter run -d web-server --web-hostname 0.0.0.0 --web-port "$MINI_APP_PORT" > "$MINI_APP_LOG" 2>&1 &
MINI_APP_PID=$!

echo ""
echo "=== Started ==="
echo "Mini App: http://localhost:$MINI_APP_PORT"
echo "Log:      tail -f $MINI_APP_LOG"
echo ""
echo "Press Ctrl+C to stop Mini App."

wait

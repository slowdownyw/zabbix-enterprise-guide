#!/usr/bin/env bash
set -euo pipefail

RAC_BIN="${RAC_BIN:-/opt/1cv8/x86_64/current/rac}"
RAC_HOST="${RAC_HOST:-127.0.0.1}"
RAC_PORT="${RAC_PORT:-1545}"
TIMEOUT="${TIMEOUT:-10}"

if timeout "$TIMEOUT" "$RAC_BIN" "$RAC_HOST:$RAC_PORT" cluster list >/dev/null 2>&1; then
  echo 1
else
  echo 0
fi

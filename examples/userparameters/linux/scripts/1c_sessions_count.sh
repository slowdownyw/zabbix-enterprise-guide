#!/usr/bin/env bash
set -euo pipefail

RAC_BIN="${RAC_BIN:-/opt/1cv8/x86_64/current/rac}"
RAC_HOST="${RAC_HOST:-127.0.0.1}"
RAC_PORT="${RAC_PORT:-1545}"
TIMEOUT="${TIMEOUT:-15}"

# This example counts session lines across all clusters.
# Adapt parsing to your 1C version/localization and authentication model.
clusters=$(timeout "$TIMEOUT" "$RAC_BIN" "$RAC_HOST:$RAC_PORT" cluster list 2>/dev/null | awk '/cluster[[:space:]]*:/ {print $3}')

count=0
for cluster in $clusters; do
  current=$(timeout "$TIMEOUT" "$RAC_BIN" "$RAC_HOST:$RAC_PORT" session list --cluster="$cluster" 2>/dev/null | awk '/session[[:space:]]*:/ {c++} END {print c+0}')
  count=$((count + current))
done

echo "$count"

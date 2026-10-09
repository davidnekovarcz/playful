#!/bin/sh
# Walk the hub and game-start flows on local Next. Never uses production.
set -eu
ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
cd "$ROOT"

STARTED=0
if ! curl -sf -o /dev/null --max-time 2 http://localhost:3011/; then
  npm run dev -- -p 3011 >/tmp/playful-next.log 2>&1 &
  STARTED=$!
  ready=0
  i=0
  while [ "$i" -lt 60 ]; do
    if curl -sf -o /dev/null --max-time 1 http://localhost:3011/; then
      ready=1
      break
    fi
    i=$((i + 1))
    sleep 1
  done
  if [ "$ready" -ne 1 ]; then
    echo "Next did not answer on http://localhost:3011" >&2
    kill "$STARTED" 2>/dev/null || true
    exit 1
  fi
fi

cleanup() {
  if [ "$STARTED" != 0 ]; then
    kill "$STARTED" 2>/dev/null || true
  fi
}
trap cleanup EXIT

fail=0
for f in qa/flows/hub-scores.yml qa/flows/games-start.yml; do
  [ -f "$f" ] || continue
  echo "── $f"
  if ! npx kaloko start --scenario "$f" --env local; then
    fail=1
    continue
  fi
  if ! npx kaloko walk; then
    fail=1
    continue
  fi
  if ! npx kaloko evaluate; then
    fail=1
  fi
done

exit "$fail"

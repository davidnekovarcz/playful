#!/bin/sh
# Walk the production hub and game-start flows. Does not start a local server.
set -eu
ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
cd "$ROOT"

fail=0
for f in qa/flows/hub-scores.yml qa/flows/games-start.yml; do
  [ -f "$f" ] || continue
  echo "── $f"
  if ! npx kaloko start --scenario "$f" --env production; then
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

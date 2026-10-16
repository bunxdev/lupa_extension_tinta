#!/usr/bin/env bash
# tinta — empaqueta la extensión en dist/tinta-<version>.zip (uso: bash scripts/pack.sh)
set -e
cd "$(dirname "$0")/.."

ver=$(node -e "console.log(require('./manifest.json').version)" 2>/dev/null \
  || python3 -c "import json; print(json.load(open('manifest.json'))['version'])" 2>/dev/null \
  || grep -oE '"version"[[:space:]]*:[[:space:]]*"[^"]+"' manifest.json | head -1 | sed 's/.*"\([^"]*\)"$/\1/')

mkdir -p dist
out="dist/tinta-${ver}.zip"
rm -f "$out"
zip -qr "$out" manifest.json icons src LICENSES
echo "✓ $out  ($(du -h "$out" | cut -f1))"

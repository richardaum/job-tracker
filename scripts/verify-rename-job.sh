#!/bin/bash
set -e

# Exclude generated, build artifacts, verification scripts, and compozy
EXCLUDE_PATTERN="node_modules|\.git|dist|\.next|\.turbo|gql/|scripts/verify|\.compozy"

echo "=== Checking residual 'Application' ==="
RAW=$(grep -r --include='*.ts' --include='*.tsx' --include='*.gql' --include='*.graphql' \
  '\bApplication\b' apps/ packages/ 2>/dev/null || true)
FILTERED=$(echo "$RAW" | grep -vE "$EXCLUDE_PATTERN" || true)
# Exclude application/json MIME type
FILTERED=$(echo "$FILTERED" | grep -v 'application/json' || true)
MATCHES=$(echo "$FILTERED" | grep -c '^' 2>/dev/null || echo 0)
MATCHES=${MATCHES:-0}
if [ "$MATCHES" -gt 0 ]; then
  echo "FAIL: $MATCHES occurrences of 'application' still exist"
  echo "$FILTERED" | head -20
  exit 1
fi

echo "PASS: No Application remnants found"

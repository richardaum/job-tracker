#!/bin/bash
set -euo pipefail

# Post-merge script: refactor-enums → main
# Usage: bash scripts/post-merge-refactor-enums.sh

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

step() { echo -e "\n${GREEN}==>${NC} $1"; }
fail() { echo -e "${RED}FAIL:${NC} $1"; exit 1; }

# ── 1. Datafix scripts (JSONB) ──────────────────────────────────────

step "1/4 — Datafix: fit_analysis.items[].verdict"
pnpm tsx apps/api/scripts/fix-fit-verdict-casing.ts --dry-run || fail "verdict dry-run"
pnpm tsx apps/api/scripts/fix-fit-verdict-casing.ts || fail "verdict apply"

step "1/4 — Datafix: fit_analysis.items[].source"
pnpm tsx apps/api/scripts/fix-fit-source-casing.ts --dry-run || fail "source dry-run"
pnpm tsx apps/api/scripts/fix-fit-source-casing.ts || fail "source apply"

step "1/4 — Datafix: fit_analysis.items[].type"
pnpm tsx apps/api/scripts/fix-requirement-type-casing.ts --dry-run || fail "type dry-run"
pnpm tsx apps/api/scripts/fix-requirement-type-casing.ts || fail "type apply"

# ── 2. Migrations ───────────────────────────────────────────────────

step "2/4 — Run PG migrations"
pnpm --filter @job-tracker/api run db:migrate || fail "migrations"

# ── 3. Schema + codegen ─────────────────────────────────────────────

step "3/4 — Restart API + regenerate codegen"
pm2 restart api
sleep 10

curl -s http://localhost:3101/health >/dev/null || fail "API health check (port 3101)"

pnpm --filter @job-tracker/web run codegen || fail "codegen"

# ── 4. Verification ─────────────────────────────────────────────────

step "4/4 — typecheck"
pnpm typecheck || fail "typecheck"

step "4/4 — lint"
pnpm lint || fail "lint"

step "4/4 — test"
pnpm test || fail "test"

step "4/4 — PM2 error logs"
pm2 logs api --lines 10 --nostream 2>&1 | grep -i "error\|QueryFailedError" && fail "PM2 errors found"

echo -e "\n${GREEN}Done. All checks passed.${NC}"

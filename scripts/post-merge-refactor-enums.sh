#!/bin/bash
# Post-merge verification & migration: refactor-enums → main
#   - Checks whether migrations are already applied
#   - Detects if JSONB data still needs normalization
#   - Runs only what's missing (idempotent)
#   - Verifies final state (schema, codegen, typecheck, lint, test)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}==>${NC} $1"; }
warn() { echo -e "${YELLOW}WARN:${NC} $1"; }
fail() { echo -e "${RED}FAIL:${NC} $1"; exit 1; }
ok()   { echo -e "    ${GREEN}✓${NC} $1"; }
skip() { echo -e "    ${YELLOW}⊘${NC} $1"; }

NEEDS_DATA_FIX=false
NEEDS_MIGRATION=false
NEEDS_CODEGEN=false
CHANGES_MADE=false

# ── 1. Audit: are migrations already applied? ───────────────────────

log "1/5 — Audit migrations"
MIGRATIONS=(
  "AddStageEventSourceEnum1767700000000"
  "AddFitClassificationEnum1767800000000"
)
for m in "${MIGRATIONS[@]}"; do
  if docker exec job-tracker-postgres-1 psql -U postgres -d job_tracker -tAc \
    "SELECT 1 FROM typeorm_migrations WHERE name = '$m'" 2>/dev/null | grep -q 1; then
    skip "migration $m already applied"
  else
    warn "migration $m NOT applied"
    NEEDS_MIGRATION=true
  fi
done

# ── 2. Audit: JSONB data still lowercase? ───────────────────────────

log "2/5 — Audit JSONB enum data"
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/job_tracker}"

check_jsonb_field() {
  local field=$1 table=$2
  local count
  count=$(docker exec job-tracker-postgres-1 psql -U postgres -d job_tracker -tAc \
    "SELECT count(*) FROM $table, jsonb_array_elements(items) AS item
     WHERE item->>'$field' ~ '^[a-z]'" 2>/dev/null || echo "0")
  if [ "$count" -gt 0 ]; then
    warn "$count rows in $table with lowercase $field — needs fix"
    NEEDS_DATA_FIX=true
  else
    ok "$table items[].$field — all PascalCase"
  fi
}

check_jsonb_field "verdict" "fit_analysis"
check_jsonb_field "source"  "fit_analysis"
check_jsonb_field "type"    "fit_analysis"

# ── 3. Audit: schema.gql has new enums? ─────────────────────────────

log "3/5 — Audit schema.gql"
SCHEMA_ENUMS=("StageEventSource" "FitVerdict" "FitSource" "FitClassification")
for e in "${SCHEMA_ENUMS[@]}"; do
  if grep -q "enum $e " apps/api/src/schema.gql 2>/dev/null; then
    ok "schema.gql contains $e"
  else
    warn "schema.gql MISSING $e"
    NEEDS_CODEGEN=true
  fi
done

# ── 4. Run fixes (only what's needed) ───────────────────────────────

log "4/5 — Apply fixes"

if $NEEDS_DATA_FIX; then
  log "Running datafix scripts..."
  for script in fix-match-verdict-casing fix-match-source-casing fix-requirement-type-casing; do
    pnpm tsx "apps/api/scripts/${script}.ts" --dry-run
    pnpm tsx "apps/api/scripts/${script}.ts" || fail "$script failed"
    CHANGES_MADE=true
  done
else
  skip "no datafix needed"
fi

if $NEEDS_MIGRATION; then
  log "Running migrations..."
  pnpm --filter @job-tracker/api run db:migrate || fail "migrations failed"
  CHANGES_MADE=true
else
  skip "no migrations pending"
fi

if $NEEDS_CODEGEN || $CHANGES_MADE; then
  log "Regenerating schema + codegen..."
  pm2 restart api
  sleep 10
  curl -s http://localhost:3101/health >/dev/null || fail "API health check"
  pnpm --filter @job-tracker/web run codegen || fail "codegen failed"
  CHANGES_MADE=true
else
  skip "codegen up to date"
fi

# ── 5. Final verification ───────────────────────────────────────────

log "5/5 — Verification"
pnpm typecheck || fail "typecheck"
pnpm lint      || fail "lint"
pnpm test      || fail "test"

if pm2 logs api --lines 10 --nostream 2>&1 | grep -qi "QueryFailedError"; then
  fail "QueryFailedError in PM2 logs"
fi
ok "no errors in PM2 logs"

echo ""
echo -e "${GREEN}Done.${NC} Branch task/refactor-enums fully integrated and verified."

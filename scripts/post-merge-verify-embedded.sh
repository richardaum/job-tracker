#!/usr/bin/env bash
# scripts/post-merge-verify-embedded.sh
# Verifica que a migração JSONB→embedded foi completa: banco + código fonte.
#
# Uso: bash scripts/post-merge-verify-embedded.sh [database_name]
# Default database: job_tracker

set -e

DB="${1:-job_tracker}"
PG_CMD="docker exec -i \$(docker ps --filter name=postgres -q 2>/dev/null | head -1) psql -U postgres -d $DB -t -A"
ROOT="$(git rev-parse --show-toplevel)"
FAIL=0
WARN=0

red()   { echo -e "\033[31m$*\033[0m"; }
green() { echo -e "\033[32m$*\033[0m"; }
yellow(){ echo -e "\033[33m$*\033[0m"; }

# ─── PARTE 1: Banco de dados ────────────────────────────

echo ""
echo "━━━ BANCO DE DADOS ($DB) ━━━"
echo ""

echo "Colunas embedded (devem existir):"
for col in \
  draft_applications,conversion_status \
  draft_applications,conversion_error \
  draft_applications,conversion_timestamp \
  applications,summary_status \
  applications,summary_error \
  applications,summary_timestamp \
  fit_analysis,generation_status \
  fit_analysis,generation_error \
  fit_analysis,generation_timestamp; do

  table="${col%%,*}"
  cname="${col##*,}"
  exists=$(eval "$PG_CMD" <<< "SELECT 1 FROM information_schema.columns WHERE table_name='$table' AND column_name='$cname';" 2>/dev/null)
  if [ "$exists" = "1" ]; then
    green "  ✅ $table.$cname"
  else
    red "  ❌ $table.$cname — FALTANDO"
    FAIL=1
  fi
done

echo ""
echo "Colunas JSONB antigas (devem ter sido removidas):"
for col in \
  draft_applications,conversion_metadata \
  applications,summary_metadata \
  fit_analysis,generation_metadata; do

  table="${col%%,*}"
  cname="${col##*,}"
  exists=$(eval "$PG_CMD" <<< "SELECT 1 FROM information_schema.columns WHERE table_name='$table' AND column_name='$cname';" 2>/dev/null)
  if [ "$exists" = "1" ]; then
    yellow "  ⚠️  $table.$cname — AINDA EXISTE"
    WARN=1
  else
    green "  ✅ $table.$cname — removida"
  fi
done

echo ""
echo "Migrations aplicadas:"
for mig in \
  MigrateDraftConversionJsonbToEmbedded1767700000000 \
  MigrateApplicationSummaryJsonbToEmbedded1767800000000 \
  MigrateFitAnalysisGenerationJsonbToEmbedded1767900000000 \
  RenameEmbeddedColumnsToSnakeCase1768000000000; do
  applied=$(eval "$PG_CMD" <<< "SELECT 1 FROM typeorm_migrations WHERE name='$mig';" 2>/dev/null)
  if [ "$applied" = "1" ]; then
    green "  ✅ $mig"
  else
    red "  ❌ $mig — NÃO APLICADA"
    FAIL=1
  fi
done

# ─── PARTE 2: Código fonte ──────────────────────────────

echo ""
echo "━━━ CÓDIGO FONTE ━━━"
echo ""

echo "Referências a JSONB antigo (conversion_metadata, summary_metadata, generation_metadata):"
# Busca nos domínios e entidades (exclui migrations e specs)
REFS=$(grep -rn \
  -e '"conversion_metadata"' \
  -e '"summary_metadata"' \
  -e '"generation_metadata"' \
  "$ROOT/apps/api/src/domains/" \
  "$ROOT/apps/api/src/database/entities/" \
  "$ROOT/apps/api/scripts/" \
  2>/dev/null || true)

if [ -z "$REFS" ]; then
  green "  ✅ Nenhuma referência residual"
else
  yellow "  ⚠️  Referências antigas encontradas:"
  echo "$REFS" | while read -r line; do
    yellow "     $line"
  done
  WARN=1
fi

echo ""
echo "Referências a naming PascalCase (conversion_Status, summary_Error, etc.):"
PASCAL=$(grep -rn \
  -e 'conversion_Status\|conversion_Error\|conversion_Timestamp' \
  -e 'summary_Status\|summary_Error\|summary_Timestamp' \
  -e 'generation_Status\|generation_Error\|generation_Timestamp' \
  "$ROOT/apps/api/src/domains/" \
  "$ROOT/apps/api/scripts/" \
  2>/dev/null || true)

if [ -z "$PASCAL" ]; then
  green "  ✅ Nenhuma referência PascalCase"
else
  yellow "  ⚠️  Referências PascalCase encontradas (devem ser snake_case):"
  echo "$PASCAL" | while read -r line; do
    yellow "     $line"
  done
  WARN=1
fi

echo ""
echo "Arquivos com timestamp.toISOString() nos mappers (deveriam ser Date direto):"
TIMESTAMPS=$(grep -rn 'timestamp.*toISOString' \
  "$ROOT/apps/api/src/domains/draft-applications/draft-applications.service.ts" \
  "$ROOT/apps/api/src/domains/applications/applications.service.ts" \
  "$ROOT/apps/api/src/domains/fit-analysis/fit-analysis.service.ts" \
  2>/dev/null || true)

if [ -z "$TIMESTAMPS" ]; then
  green "  ✅ Nenhum timestamp.toISOString() nos mappers"
else
  yellow "  ⚠️  timestamp.toISOString() encontrado:"
  echo "$TIMESTAMPS" | while read -r line; do
    yellow "     $line"
  done
  WARN=1
fi

echo ""
echo "Arquivos staged ou modificados (resta commitar?):"
DIRTY=$(git -C "$ROOT" status --porcelain=v1 -u -- \
  "apps/api/src/domains/" \
  "apps/api/src/database/" \
  "apps/api/scripts/" \
  "apps/web/src/" \
  2>/dev/null | grep -v "^?" || true)

if [ -z "$DIRTY" ]; then
  green "  ✅ Nada pendente de commit"
else
  yellow "  ⚠️  Arquivos modificados/unstaged:"
  echo "$DIRTY" | while read -r line; do
    yellow "     $line"
  done
  WARN=1
fi

# ─── RESULTADO ─────────────────────────────────────────

echo ""
echo "━━━ RESULTADO ━━━"

if [ "$FAIL" = "1" ]; then
  red ""
  red "❌ FALHAS ENCONTRADAS. Ações necessárias:"
  red "   - Rode 'pnpm --filter @job-tracker/api run db:migrate' se migrations não aplicadas"
  red "   - Verifique os ❌ acima"
  red ""
  exit 1
elif [ "$WARN" = "1" ]; then
  yellow ""
  yellow "⚠️  WARNINGS. Pode seguir, mas revise os ⚠️ acima."
  yellow ""
else
  green ""
  green "✅ TUDO CERTO — banco, código e migrations consistentes."
  green ""
fi

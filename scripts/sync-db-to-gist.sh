#!/usr/bin/env bash
# Dump local Docker Postgres (job_tracker) and push to GitHub Gist.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/docker-compose.yml}"
GIST_ID="${GIST_ID:-3f2cf15d12e91315b56728d0eb566c5e}"

POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-job_tracker}"
POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"

TZ_LABEL="${TZ_LABEL:-America/Sao_Paulo}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "error: '$1' is required but not installed" >&2
    exit 1
  fi
}

require_cmd docker
require_cmd gh

if ! gh auth status >/dev/null 2>&1; then
  echo "error: gh is not authenticated (run: gh auth login)" >&2
  exit 1
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "error: compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

if ! docker compose -f "$COMPOSE_FILE" ps --status running --services 2>/dev/null | grep -qx "$POSTGRES_SERVICE"; then
  echo "error: postgres service is not running (start with: docker compose up -d postgres)" >&2
  exit 1
fi

timestamp="$(TZ="$TZ_LABEL" date +%Y%m%d-%H%M%S)"
backup_name="job_tracker_${timestamp}.sql"
desc="Backup job_tracker PostgreSQL - $(TZ="$TZ_LABEL" date '+%Y-%m-%d %H:%M (%Z)')"

dump_file="$(mktemp -t job_tracker.XXXXXX.sql)"

echo "Dumping database '$POSTGRES_DB' from Docker..."
docker compose -f "$COMPOSE_FILE" exec -T \
  -e PGPASSWORD="$POSTGRES_PASSWORD" \
  "$POSTGRES_SERVICE" \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  >"$dump_file"

dump_bytes="$(wc -c <"$dump_file" | tr -d ' ')"
if [[ "$dump_bytes" -lt 100 ]]; then
  echo "error: dump looks empty (${dump_bytes} bytes)" >&2
  exit 1
fi

echo "Dump size: $(du -h "$dump_file" | awk '{print $1}')"

old_files="$(gh gist view "$GIST_ID" --files 2>/dev/null || true)"
if [[ -z "$old_files" ]]; then
  echo "error: could not read gist $GIST_ID (check GIST_ID and gh access)" >&2
  exit 1
fi

staging_dir="$(mktemp -d)"
trap 'rm -f "$dump_file"; rm -rf "$staging_dir"' EXIT
cp "$dump_file" "$staging_dir/$backup_name"

echo "Updating gist https://gist.github.com/richardaum/$GIST_ID ..."
(
  cd "$staging_dir"
  gh gist edit "$GIST_ID" --add "$backup_name"
)

while IFS= read -r old_file; do
  [[ -z "$old_file" || "$old_file" == "$backup_name" ]] && continue
  echo "Removing previous file: $old_file"
  gh gist edit "$GIST_ID" --remove "$old_file"
done <<<"$old_files"

# --desc alone fails when the gist has multiple files; use the API instead.
gh api -X PATCH "gists/${GIST_ID}" -f description="$desc" >/dev/null

echo "Done: $backup_name ($desc)"
echo "https://gist.github.com/richardaum/$GIST_ID"

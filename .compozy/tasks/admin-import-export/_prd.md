# PRD: Admin Data Export & Import

## Overview

Provides a mechanism to export all user data from a Job Tracker instance and import it into another instance. The primary use case is **instance migration** — moving a local deployment to a cloud provider (e.g., Supabase) as a one-time or low-frequency operation. Export produces a single structured JSON file; import reads that file and upserts all entities into the target database.

## Goals

- Enable instance migration from local to cloud via a single export → import flow
- Export and import cover all user-scoped data domains
- Preserve all entity relationships (foreign keys) across export and import
- The JSON export serves as a portable backup format independent of PostgreSQL version

## User Stories

- As an admin, I want to export all platform data as a JSON file so I can back up the instance before migrating.
- As an admin, I want to import a previously exported JSON file into a fresh database so I can restore or migrate the instance.

## Core Features

### 1. CLI Export Script

**Priority**: P0 (MVP)

A standalone NestJS CLI script (`db:export`) that:

- Reads all user-scoped tables via TypeORM repositories
- Produces a single JSON file with top-level keys per entity type
- Accepts `DATABASE_URL` via environment variable to target any PostgreSQL instance
- Outputs to stdout (pipeable to a file)

### 2. CLI Import Script

**Priority**: P0 (MVP)

A standalone NestJS CLI script (`db:import`) that:

- Reads a JSON file produced by the export script
- Upserts all entities in dependency order (users before jobs, etc.)
- Uses `INSERT ... ON CONFLICT (id) DO UPDATE` for idempotent import
- Accepts `DATABASE_URL` via environment variable

### 3. Structured JSON Format

**Priority**: P0

A single JSON object with these top-level keys, each an array of entity records:

```
users, user_accounts, user_settings, jobs, companies, job_notes,
job_stage_events, match_analysis, resumes, work_preferences,
plans, source_templates, source_runs, ai_conversations,
ai_messages, extension_activity_events
```

Excluded:

- `exchange_rate` — system-wide seed data, not user data
- `tokenVersion`, `refreshJti` on `users` — runtime auth state, not portable

## User Experience

```
# Export from local
DATABASE_URL=postgres://local:5432/job_tracker \
  pnpm --filter @job-tracker/api run db:export > backup.json

# Import into Supabase
DATABASE_URL=postgres://supabase:5432/job_tracker \
  pnpm --filter @job-tracker/api run db:import backup.json
```

## High-Level Technical Constraints

- Export must not expose auth secrets (`tokenVersion`, `refreshJti`)
- Import must respect foreign key ordering to avoid constraint violations
- The JSON format must be self-describing (clear entity keys) for human readability

## Non-Goals (Out of Scope)

- Per-user or per-entity filtered export/import
- Incremental/delta export (only export changes since last export)
- Scheduled/automated exports
- Cross-version schema migration (import assumes same schema version)
- Conflict resolution UI for import into non-empty databases
- Progress bars, preview tables, or dry-run mode
- Compression or encryption of export files
- CSV or other non-JSON formats

## Phased Rollout Plan

### MVP (Phase 1)

- CLI export script (`db:export`)
- CLI import script (`db:import`)
- Structured JSON format covering all user-scoped entities

## Success Metrics

- A full export → import cycle on a fresh database produces an identical logical state
- CLI scripts complete in under 30 seconds for a typical instance (< 10k rows)

## Risks and Mitigations

| Risk                                                                 | Mitigation                                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Import into non-empty database causes duplicate or constraint errors | Document that import targets a fresh database; upsert handles idempotent re-imports  |
| Schema drift between export and import versions                      | Document that both instances must run the same schema version (same migration state) |

## Architecture Decision Records

- [ADR-001: CLI-only bulk export/import](adrs/adr-001.md) — CLI scripts as the sole mechanism, structured JSON format

## Open Questions

- None at this time.

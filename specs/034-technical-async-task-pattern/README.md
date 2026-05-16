---
status: in-progress
created: 2026-05-12
updated: 2026-05-15
priority: high
tags:
  - api
  - async
  - architecture
  - pattern
---

# Technical Scope: async-task-pattern

> **Status**: active · **Priority**: high · **Created**: 2026-05-12 · **Updated**: 2026-05-15

## Objective

Standardize async background tasks using a **single JSONB column per task slot** — replacing the 3-column pattern (`status` + `error` + `generated_at`) with a unified `AsyncMetadata` structure.

## Motivation

Every async feature needs the same metadata: status, error, completion timestamp. Spreading these across 3–4 columns forces repetitive migrations, verbose entities, and inconsistent naming. A single typed JSONB column is:

- **DRY** — one type definition, one GraphQL type, one entity column
- **Extensible** — future metadata (`progress`, `attempts`, `startedAt`, `model`) goes in the JSONB, zero migrations
- **Replaceable** — same structure for inline (summary on Application) and standalone (FitAnalysis) use

## Context

Flow unchanged from current pattern:

1. Mutation sets `task = { status: "processing" }`, persists, returns immediately.
2. Server continues in background (`void this.work()`).
3. Client polls until terminal state (`completed` / `failed`).

## Standard Pattern

See **[`PATTERN.md`](./PATTERN.md)** for the full reference — type definition, entity mapping, repository atomic updates, service template, stale recovery, GraphQL schema, and frontend handling.

## Migration Delta

Existing implementations need to consolidate 3 columns into 1 JSONB:

| Entity             | Current (3 cols)                                          | Target (1 col)                                 |
| ------------------ | --------------------------------------------------------- | ---------------------------------------------- |
| `Application`      | `summary_status`, `summary_error`, `summary_generated_at` | `summary_metadata` (jsonb)                     |
| `FitAnalysis`      | `status` (enum), `error` (text)                           | `generation_metadata` (jsonb, + `generatedAt`) |
| `DraftApplication` | `conversion_status`, `conversion_error`, `converted_at`   | `conversion_metadata` (jsonb)                  |

## Modus Operandi

1. **Non-blocking**: Background method called with `void` — never `await`
2. **Resilience**: `tryRun()` for all external integrations — never raw try/catch in background paths
3. **Atomic transitions**: `jsonb_set()` or `||` operator guarded by `task->>'status'` — no blind overwrites
4. **Stale recovery**: Every async service owns its recovery in `onModuleInit`
5. **Spread on update**: When mutating `task` in TypeORM, always spread existing state to avoid data loss
6. **Default value**: `{ status: "completed" }` for backward compat; `null` for "never requested" states

---
status: planned
created: "2026-05-09"
tags:
  - imports
  - api
  - web
  - extension
priority: high
created_at: "2026-05-09T15:23:47.976149+00:00"
---

# Importer, ImportTemplate, and ImportRun remodel

> **Status**: planned · **Priority**: high · **Created**: 2026-05-09

## Motivation

The current **Importer + ImportRun** pairing collapses two concerns: **what kind of import is allowed** (board rules, extractors, modality) and **how a user (or system) intends to execute it** (target surface, cadence, repeatable configuration). That makes it harder to attach **multiple executions** to a stable configuration, to show **grouped history** in the web app, and to evolve toward **scheduled reruns** without overloading the importer row.

Splitting **Importer** (plan contract) from **ImportTemplate** (user-scoped configuration referencing a plan) and **ImportRun** (one execution of a template) matches how **`/imports`** and the extension reason about “pick a plan → run → see applications created in that run.” It also aligns **`specs/023-product-chrome-extension/README.md`** expectations (runs persisted server-side, latest round semantics) with a clearer persistence model.

## Mental model

| Concept            | Role                                                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Importer**       | The **plan**: allowed sources, extractors, modality constraints, server-side behavior contract. Does **not** carry per-run **surface URL**.                                       |
| **ImportTemplate** | A **configured use** of an importer: references **Importer**, holds **schedule** (cron expression, optional), **rerun** semantics/flags as needed, and aggregates **ImportRuns**. |
| **ImportRun**      | A **single execution** of a template: status, timestamps, **surface URL** for that execution, link to **applications** created or associated with this run.                       |

**Flows:** User (or future scheduler) chooses a **template** → creates a **run** → applications are associated to the **run**. Manual “run again” duplicates or restarts execution from the UI using the same template configuration while keeping history per run.

**Out of scope for the first implementation pass:** a background **cron worker** that evaluates `schedule` and spawns runs automatically. Persist the expression and surface it in UI; wire the executor later.

## Cross-spec context

- **`specs/016-product-import-and-onboarding-expansion/README.md`**: product intent for imports and onboarding (extension behavior is **not** in 016).
- **`specs/023-product-chrome-extension/README.md`**: extension and **`/imports`** surfaces; this remodel should keep GraphQL naming and list/detail UX consistent with **runs** and **templates** as the extension gains parity.

## Traceability and work items

### Product

- [P-131] Present **Importer**, **ImportTemplate**, and **ImportRun** in UI copy and navigation so users see **plan vs configuration vs execution** clearly (rename files/routes only when it improves clarity; keep `/imports` route if still appropriate).
- [P-132] **Applications** list supports **`/applications?runId=<id>`** filtering so users can inspect all applications tied to an import run from a single URL.
- [P-133] **Import run** detail links to that filtered applications view and offers **remove all applications from this run** (bulk detach) with clear confirmation.
- [P-134] **Imports** index groups **runs under their importer (plan)**; run detail shows **multiple runs in an accordion** (one expanded at a time) for the selected template context.

### Technical

- [T-142] Add **`ImportTemplate`** persistence (TypeORM entity, migration): foreign key to **Importer**, ownership/scoping consistent with existing import domain, relation to **ImportRuns**.
- [T-143] Migrate **surface URL** from importer/plan configuration to **`ImportRun`** (column + backfill/migration strategy + update “available importers/plans” payloads so clients read URL from the run).
- [T-144] Persist **`ImportRun` ↔ `Application`** association (join column or join table as appropriate), expose on GraphQL for list/detail; ensure create/import flows set the link when applications are created from a run.
- [T-145] Add **manual rerun** entry point in API + web (e.g. mutation or “Run again” action creating a new **ImportRun** under the same template); add **schedule** fields on **ImportTemplate** (`cron` expression, enabled flag if needed) — **no cron executor** in this scope.
- [T-146] Rename/refactor **web** module files and folders (`ImportsPage`, run detail, hooks, GraphQL operations) to match template/run vocabulary; update **labels** accordingly.
- [T-147] Rebuild **import run detail** UI: use **`FieldWithLabelAction`** from **`@job-tracker/ui`** for labeled fields; accordion for run list; deep link to applications with **`runId`** query param.
- [T-148] Update **extension** import flows to use renamed GraphQL types/fields and to send **surface URL** on **run** creation/update where applicable (parity with API contract).
- [T-149] Tests: API unit/integration coverage for template/run relations, application linkage, and rerun mutation; web tests for URL filter and critical UI actions where coverage gates apply.

## Verification

- [ ] `pnpm leanspec:validate`
- [ ] `pnpm --filter @job-tracker/api test` (or targeted specs) for import domain changes
- [ ] `pnpm --filter @job-tracker/web test` for applications filter and imports UI where covered

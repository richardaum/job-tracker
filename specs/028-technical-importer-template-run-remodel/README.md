---
status: completed
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

> **Status**: completed · **Priority**: high · **Created**: 2026-05-09

## Motivation

The current **Importer + ImportRun** pairing collapses two concerns: **what kind of import is allowed** (board rules, extractors, modality) and **how a user (or system) intends to execute it** (target surface, cadence, repeatable configuration). That makes it harder to attach **multiple executions** to a stable configuration, to show **grouped history** in the web app, and to evolve toward **scheduled reruns** without overloading the importer row.

Splitting **Importer** (plan contract) from **ImportTemplate** (user-scoped configuration referencing a plan) and **ImportRun** (one execution of a template) matches how **`/imports`** and the extension represent the flow **pick plan → execute run → inspect applications tied to that run**. It also aligns **`specs/023-product-chrome-extension/README.md`** expectations (runs persisted server-side, latest round semantics) with a clearer persistence model.

## Mental model

| Concept            | Role                                                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Importer**       | The **plan**: allowed sources, extractors, modality constraints, server-side behavior contract. Does **not** carry per-run **surface URL**.                                       |
| **ImportTemplate** | A **configured use** of an importer: references **Importer**, holds **schedule** (cron expression, optional), **rerun** semantics/flags as needed, and aggregates **ImportRuns**. |
| **ImportRun**      | A **single execution** of a template: status, timestamps, **surface URL** for that execution, link to **applications** created or associated with this run.                       |

**Flows:** User (or future scheduler) selects a **template** → creates a **run** → applications **link** to **that run**. **Run again** from the UI kicks off another execution against the **same template** while history stays **per run**.

**Out of scope for the first implementation pass:** a background **cron worker** that evaluates `schedule` and spawns runs automatically. Persist the expression and expose it in **the UI**; add the executor later.

## Cross-spec context

- **`specs/016-product-import-and-onboarding-expansion/README.md`**: product intent for imports and onboarding (extension behavior is **not** in 016).
- **`specs/023-product-chrome-extension/README.md`**: extension and **`/imports`** surfaces; this remodel should keep GraphQL naming and list/detail UX consistent with **runs** and **templates** as the extension gains parity.

## Checklist

Use **`[x]`** when shipped. Suggested order: **persistence → GraphQL → web/extension → tests**.

### Product (**[P-131]** … **[P-134]**)

- [x] **[P-131]** Labels, titles, and navigation clearly separate **Importer** (plan), **ImportTemplate** (configuration), and **ImportRun** (execution).
- [x] **[P-132]** Applications list honors **`/applications?runId=<id>`** (stable filter in the URL).
- [x] **[P-133]** Run detail links to that filtered list; **remove all applications from this run** with confirmation.
- [x] **[P-134]** Imports index groups runs under **Importer**; detail shows **multiple runs in an accordion** (one expanded at a time).

### API & persistence (**[T-142]** … **[T-145]**)

- [x] **[T-142]** **`ImportTemplate`** entity + migration: FK to **Importer**, user scope; **ImportRun** belongs to template.
- [x] **[T-143]** **`surfaceUrl`** only on **`ImportRun`**; migrate off plan; refresh seeds/metadata.
- [x] **[T-144]** **Application ↔ ImportRun** association (FK or equivalent); backfill where appropriate.
  - [x] **[T-144]** Set link when applications are created from the import pipeline.
  - [x] **[T-144]** GraphQL exposes link + `runId` filter; authorized **detach all** mutation.
- [x] **[T-145]** **Schedule** fields on template (**cron**, enabled); **manual rerun** mutation (new run, same template) — **no** cron worker in this phase.

### GraphQL & codegen

- [x] **`schema.gql`**: template type, run fields (**surface URL**, template ref), queries for grouped listing; **`pnpm codegen`** for **web** and for types used by **`apps/extension`**. (**[T-142]**–**[T-146]**, **[T-148]**)

### Web (**[T-146]**, **[T-147]**)

- [x] **[T-146]** Rename modules/folders/GraphQL operations to match new vocabulary.
- [x] **`ImportsPage`**: group by importer + row/template model aligned with API (**[P-134]**).
- [x] **[T-147]** Run/template detail: **`FieldWithLabelAction`**, run **accordion**, **View applications** → `?runId=`, **schedule** fields stored and editable in UI (no background scheduler yet), **Run again**, bulk detach confirmation (**[P-133]**, **[P-134]**, **[T-145]**).

### Extension (**[T-148]**)

- [x] **[T-148]** Collect/import flows use new operations; **surface URL** on run create/update (**[T-143]**).

### Verification (**[T-149]**)

- [x] **[T-149]** API tests: template/run, rerun, application linkage, detach-all.
- [x] **[T-149]** Web tests: **`runId`** filter, imports UI smoke where package gates require it.
- [x] **`pnpm leanspec:validate`**; when the scope lands, bump this spec’s **`status`**, prepend **`specs/HISTORY.md`** with the next **`[H-NNN]`** entry, then **`pnpm leanspec:sync-spec-indices`** if IDs or metadata changed.

---
status: completed
created: 2026-05-14
priority: high
tags:
  - sources
  - api
  - web
  - extension
created_at: 2026-05-14T00:00:00.000000Z
updated_at: 2026-05-14T00:00:00.000000Z
---

# Product Scope: sources

> **Status**: active · **Priority**: high · **Created**: 2026-05-14

Consolidated from **`specs/016-product-import-and-onboarding-expansion`** (source portion) and **`specs/028-technical-importer-template-run-remodel`**.

The **Chrome extension** source flows are defined in **`specs/023-product-chrome-extension/README.md`**.

## Motivation

The original **Importer + ImportRun** pairing collapses two concerns: **what kind of source is allowed** (board rules, extractors, modality) and **how a user (or system) intends to execute it** (target surface, cadence, repeatable configuration). That makes it harder to attach **multiple executions** to a stable configuration, to show **grouped history** in the web app, and to evolve toward **scheduled reruns** without overloading the importer row.

Splitting **Importer** (plan contract) from **ImportTemplate** (user-scoped configuration referencing a plan) and **ImportRun** (one execution of a template) matches how **`/sources`** and the extension represent the flow **pick plan → execute run → inspect applications tied to that run**.

## Mental model

| Concept            | Role                                                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Importer**       | The **plan**: allowed sources, extractors, modality constraints, server-side behavior contract. Does **not** carry per-run **surface URL**.                                       |
| **ImportTemplate** | A **configured use** of an importer: references **Importer**, holds **schedule** (cron expression, optional), **rerun** semantics/flags as needed, and aggregates **ImportRuns**. |
| **ImportRun**      | A **single execution** of a template: status, timestamps, **surface URL** for that execution, link to **applications** created or associated with this run.                       |

**Flows:** User (or future scheduler) selects a **template** → creates a **run** → applications **link** to **that run**. **Run again** from the UI kicks off another execution against the **same template** while history stays **per run**.

**Out of scope for the first implementation pass:** a background **cron worker** that evaluates `schedule` and spawns runs automatically. Persist the expression and expose it in **the UI**; add the executor later.

## In Scope

- [P-54] Support generic board import by URL parsing and normalized field extraction into user-review drafts.
- [P-79] Normalize imported payloads with field-confidence markers before user confirmation and final save.
- [P-80] Protect source integrations with signed requests and explicit API-side validation contracts.
- [P-131] Labels, titles, and navigation clearly separate **Importer** (plan), **ImportTemplate** (configuration), and **ImportRun** (execution).
- [P-132] Applications list honors **`/applications?runId=<id>`** (stable filter in the URL).
- [P-133] Run detail links to that filtered list; **remove all applications from this run** with confirmation.
- [P-134] Sources index groups runs under **Importer**; detail shows **multiple runs in an accordion** (one expanded at a time).

## Out of Scope

- [P-57] Fully automatic background scraping without user action or consent.
- [P-82] Unrestricted source adapters without isolated parser boundaries and failure observability.

## Acceptance Criteria

- [P-59] A user can import a supported job listing via URL or paste-oriented guided paths into a draft and confirm mapped fields before persistence.
- [P-61] Import failures provide actionable guidance and never overwrite existing owned records without confirmation.
- [P-83] Import mapping accuracy, migration integrity, and failure recovery behavior are validated through automated scenario coverage.

## API & persistence

- [x] **[T-142]** **`ImportTemplate`** entity + migration: FK to **Importer**, user scope; **ImportRun** belongs to template.
- [x] **[T-143]** **`surfaceUrl`** only on **`ImportRun`**; migrate off plan; refresh seeds/metadata.
- [x] **[T-144]** **Application ↔ ImportRun** association (FK or equivalent); backfill where appropriate.
  - [x] **[T-144]** Set link when applications are created from the source pipeline.
  - [x] **[T-144]** GraphQL exposes link + `runId` filter; authorized **detach all** mutation.
- [x] **[T-145]** **Schedule** fields on template (**cron**, enabled); **manual rerun** mutation (new run, same template) — **no** cron worker in this phase.

## GraphQL & codegen

- [x] **`schema.gql`**: template type, run fields (**surface URL**, template ref), queries for grouped listing; **`pnpm codegen`** for **web** and for types used by **`apps/extension`**. (**[T-142]**–**[T-146]**, **[T-148]**)

## Web

- [x] **[T-146]** Rename modules/folders/GraphQL operations to match new vocabulary.
- [x] **`SourcesPage`**: group by importer + row/template model aligned with API (**[P-134]**).
- [x] **[T-147]** Run/template detail: **`FieldWithLabelAction`**, run **accordion**, **View applications** → `?runId=`, **schedule** fields stored and editable in UI (no background scheduler yet), **Run again**, bulk detach confirmation (**[P-133]**, **[P-134]**, **[T-145]**).

## Extension

- [x] **[T-148]** Collect/source flows use new operations; **surface URL** on run create/update (**[T-143]**).

## Verification

- [x] **[T-149]** API tests: template/run, rerun, application linkage, detach-all.
- [x] **[T-149]** Web tests: **`runId`** filter, sources UI smoke where package gates require it.

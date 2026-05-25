---
status: complete
title: "Jobs domain refactor (3 orchestrators)"
type: backend
complexity: high
dependencies: []
completed: 2026-05-24
---

# Task 01: Jobs domain refactor (3 orchestrators)

## Overview

Restructure the jobs domain into three orchestrator services before wiring settings-based auto-fill. **Applied manually by user.**

<requirements>
- MUST split fill workflow into `JobAutomaticFillService` (`fillJobAutomatically`, `processFillJob`, TX finalize)
- MUST rename summary to `JobSummaryService` (`requestSummary`, `doGenerate`)
- MUST keep `JobsService` as lifecycle orchestrator (CRUD, stages, domain events)
- MUST move CAS/stale-reset SQL to `JobsRepository` via `async-metadata.helper.ts`
- MUST delete `JobFillPersistence`, `JobAsyncMetadataRepository`, `summary.service.ts`
- MUST update listeners/resolver to delegate to feature services
</requirements>

## Delivered

| Artifact             | Path                                                                         |
| -------------------- | ---------------------------------------------------------------------------- |
| Fill orchestrator    | `apps/api/src/domains/jobs/job-automatic-fill.service.ts`                    |
| Summary orchestrator | `apps/api/src/domains/jobs/summary/job-summary.service.ts`                   |
| Metadata helpers     | `apps/api/src/domains/shared/async-metadata.helper.ts`                       |
| Fill listener        | `FillJobEventListener` → `processFillJob`                                    |
| Summary listener     | `SummaryEventListener` → `requestSummary` + `autoSummaryEnabled` gate        |
| Resolver             | `fillJobAutomatically` → fill service; `requestJobSummary` → summary service |

## Success Criteria

- [x] No `JobFillPersistence` or `JobAsyncMetadataRepository` in codebase
- [x] `jobs-fill.integration.ts` and service specs pass
- [x] ADR-004 documents final architecture

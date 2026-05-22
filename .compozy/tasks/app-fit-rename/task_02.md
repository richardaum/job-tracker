---
status: pending
title: "Domains jobs/ + draft-jobs/ + cross-domain imports (API)"
type: backend
complexity: high
dependencies: [01]
---

# Task 02: Domains jobs/ + draft-jobs/ + cross-domain imports (API)

## 2a. `applications/` → `jobs/` (23 files)

**Directory:** `apps/api/src/domains/applications/` → `apps/api/src/domains/jobs/`

Rename files and update content:

| File rename                                                                   | Class/export renames                    |
| ----------------------------------------------------------------------------- | --------------------------------------- |
| `application.type.ts` → `job.type.ts`                                         | (types)                                 |
| `application.events.ts` → `job.events.ts`                                     | Events names                            |
| `application-event.bus.ts` → `job-event.bus.ts`                               | Class name                              |
| `application-source.enum.ts` → `job-source.enum.ts`                           | `ApplicationSource` → `JobSource`       |
| `application-source.util.ts` → `job-source.util.ts`                           | Function names                          |
| `application-stage.enum.ts` → `job-stage.enum.ts`                             | `ApplicationStage` → `JobStage`         |
| `application-stage-event.type.ts` → `job-stage-event.type.ts`                 | (types)                                 |
| `application-stage-events.schema.ts` → `job-stage-events.schema.ts`           | (schemas)                               |
| `application-quick-filter.enum.ts` → `job-quick-filter.enum.ts`               | Enum name                               |
| `application-duplicate.constants.ts` → `job-duplicate.constants.ts`           | Constants                               |
| `applications.module.ts` → `jobs.module.ts`                                   | `ApplicationsModule` → `JobsModule`     |
| `applications.service.ts` → `jobs.service.ts`                                 | `ApplicationsService` → `JobsService`   |
| `applications.service.spec.ts` → `jobs.service.spec.ts`                       | Tests                                   |
| `applications.resolver.ts` → `jobs.resolver.ts`                               | `ApplicationsResolver` → `JobsResolver` |
| `applications.resolver.spec.ts` → `jobs.resolver.spec.ts`                     | Tests                                   |
| `applications.repository.ts` → `jobs.repository.ts`                           | Repository class                        |
| `applications.repository.spec.ts` → `jobs.repository.spec.ts`                 | Tests                                   |
| `applications.schema.ts` → `jobs.schema.ts`                                   | (schemas)                               |
| `applications-sse.controller.ts` → `jobs-sse.controller.ts`                   | Controller class                        |
| `create-application.input.ts` → `create-job.input.ts`                         | Input class                             |
| `update-application.input.ts` → `update-job.input.ts`                         | Input class                             |
| `create-application-stage-event.input.ts` → `create-job-stage-event.input.ts` | Input class                             |
| `update-application-stage-event.input.ts` → `update-job-stage-event.input.ts` | Input class                             |

**Enum values:** preserve internal values, rename only TypeScript names.

## 2b. `draft-applications/` → `draft-jobs/` (10 files)

**Directory:** `apps/api/src/domains/draft-applications/` → `apps/api/src/domains/draft-jobs/`

Same pattern — rename files, classes (`DraftApplicationsModule` → `DraftJobsModule`, etc.), imports.

## 2c. Cross-domain imports

Update all files that import from `applications/` or `draft-applications/`:

```bash
grep -rn "from.*applications" apps/api/src/ --include='*.ts'
grep -rn "from.*draft-applications" apps/api/src/ --include='*.ts'
```

Key files:

- `apps/api/src/app.module.ts`
- `apps/api/src/database/data-source-options.ts`
- `apps/api/src/database/migrations/index.ts`
- `apps/api/src/domains/fit-analysis/`
- `apps/api/src/domains/companies/`
- `apps/api/src/domains/ai/`
- `apps/api/src/domains/imports/`

## Verification

```bash
pnpm --filter @job-tracker/api run typecheck
pnpm --filter @job-tracker/api run test
```

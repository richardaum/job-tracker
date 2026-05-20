---
status: pending
title: "Schema + Entities — Application→Job (API)"
type: backend
complexity: high
dependencies: []
---

# Task 01: Schema + Entities — Application→Job (API)

## 1. GraphQL Schema

**File:** `apps/api/src/schema.gql`

| Category  | Changes                                                                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Types     | `Application` → `Job`, `DraftApplication` → `DraftJob`                                                                                          |
| Inputs    | `CreateApplicationInput` → `CreateJobInput`, `UpdateApplicationInput` → `UpdateJobInput`, `CreateDraftApplicationInput` → `CreateDraftJobInput` |
| Queries   | `application(id)` → `job(id)`, `applications(...)` → `jobs(...)`, `draftApplications` → `draftJobs`                                             |
| Mutations | `createApplication` → `createJob`, `updateApplication` → `updateJob`, `deleteApplication` → `deleteJob`                                         |
| Payloads  | `DeleteApplicationPayload` → `DeleteJobPayload`                                                                                                 |
| Fields    | `applicationId` → `jobId`, `application` → `job`, `applications` → `jobs`                                                                       |

## 2. Entity files

Rename and update content:

| Original                                              | New                         |
| ----------------------------------------------------- | --------------------------- |
| `database/entities/application.entity.ts`             | `job.entity.ts`             |
| `database/entities/application-note.entity.ts`        | `job-note.entity.ts`        |
| `database/entities/application-stage-event.entity.ts` | `job-stage-event.entity.ts` |
| `database/entities/draft-application.entity.ts`       | `draft-job.entity.ts`       |

In each: class name, `@Entity()` name, column names (`application_id` → `job_id`), relation types, `@Index()` names.

## Casing map

| Original       | Replacement |
| -------------- | ----------- |
| `Application`  | `Job`       |
| `application`  | `job`       |
| `Applications` | `Jobs`      |
| `applications` | `jobs`      |
| `APPLICATION`  | `JOB`       |

## Verification

```bash
pnpm --filter @job-tracker/api run typecheck
```

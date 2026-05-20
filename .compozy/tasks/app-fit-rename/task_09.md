---
status: pending
title: "Rename GraphQL documents in web"
type: web
complexity: medium
dependencies: [08]
---

# Task 09: Rename GraphQL documents in web

## Files

| Original                                          | New                  |
| ------------------------------------------------- | -------------------- |
| `apps/web/src/graphql/applications.graphql`       | `jobs.graphql`       |
| `apps/web/src/graphql/draft-applications.graphql` | `draft-jobs.graphql` |

## Content changes

- Query names: `applications` → `jobs`, `application` → `job`
- Mutation names: `createApplication` → `createJob`, `updateApplication` → `updateJob`, `deleteApplication` → `deleteJob`
- Variable names: `$applicationId` → `$jobId`
- Fragment names: `ApplicationFields` → `JobFields`
- Type references: `Application` → `Job`

## Verification

```bash
pnpm --filter @job-tracker/web run codegen
pnpm --filter @job-tracker/web run typecheck
```

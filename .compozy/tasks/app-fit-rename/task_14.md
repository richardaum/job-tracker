---
status: pending
title: "Rename import-application/ domain in extension"
type: extension
complexity: medium
dependencies: [08]
---

# Task 14: Rename import-application/ domain in extension

**Directory:** `apps/extension/src/domains/import-application/` → `apps/extension/src/domains/import-job/`

## Files to rename

| Original                                                | New                                             |
| ------------------------------------------------------- | ----------------------------------------------- |
| `import-application-labels.ts`                          | `import-job-labels.ts`                          |
| `import-application.service.ts`                         | `import-job.service.ts`                         |
| `parse-salary-inner-text-for-application.ts`            | `parse-salary-inner-text-for-job.ts`            |
| `parse-salary-inner-text-for-application.test.ts`       | `parse-salary-inner-text-for-job.test.ts`       |
| `map-collected-job-to-create-application-input.ts`      | `map-collected-job-to-create-job-input.ts`      |
| `map-collected-job-to-create-application-input.test.ts` | `map-collected-job-to-create-job-input.test.ts` |

## GraphQL documents

| Original                                                      | New                        |
| ------------------------------------------------------------- | -------------------------- |
| `apps/extension/src/graphql/create-application.graphql`       | `create-job.graphql`       |
| `apps/extension/src/graphql/create-draft-application.graphql` | `create-draft-job.graphql` |

## Content changes

- Function names: `mapCollectedJobToCreateApplicationInput` → `mapCollectedJobToCreateJobInput`
- GraphQL mutation names: `createApplication` → `createJob`
- Variable names: `application` → `job`
- Imports: update paths

## Verification

```bash
pnpm --filter @job-tracker/extension run typecheck
pnpm --filter @job-tracker/extension run test
```

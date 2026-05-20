---
status: pending
title: "Rename Application E2E test files"
type: e2e
complexity: medium
dependencies: [10, 11, 12]
---

# Task 16: Rename Application E2E test files

## Files to rename

| Original                            | New            |
| ----------------------------------- | -------------- |
| `apps/web/e2e/applications.spec.ts` | `jobs.spec.ts` |

## Content changes

- Describe blocks and test names: "Applications" → "Jobs"
- Selectors: update `data-testid` values if they contain "application"
- URLs: `/applications` → `/jobs`
- GraphQL operation names in test fixtures

Also check for any other E2E files referencing applications or draft-applications.

## Verification

```bash
pnpm --filter @job-tracker/web run typecheck
```

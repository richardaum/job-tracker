---
status: pending
title: "Codegen + GraphQL documents — Application→Job (Web)"
type: web
complexity: medium
dependencies: [01, 02, 03]
---

# Task 04: Codegen + GraphQL documents — Application→Job (Web)

**Prerequisite:** API Tasks 01–03 complete, `pnpm typecheck` passing in `apps/api`.

## 4a. Regenerate codegen

```bash
pnpm --filter @job-tracker/web run codegen
```

This regenerates `apps/web/src/gql/` with new schema names (hooks, types, documents).

## 4b. Rename GraphQL document files

| Original                                          | New                  |
| ------------------------------------------------- | -------------------- |
| `apps/web/src/graphql/applications.graphql`       | `jobs.graphql`       |
| `apps/web/src/graphql/draft-applications.graphql` | `draft-jobs.graphql` |

Update content: query/mutation/fragment/type names.

## Verification

```bash
pnpm --filter @job-tracker/web run typecheck
```

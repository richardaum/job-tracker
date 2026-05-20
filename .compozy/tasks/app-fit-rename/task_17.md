---
status: pending
title: "Rename Application specs and docs"
type: docs
complexity: medium
dependencies: [01]
---

# Task 17: Rename Application specs and docs

## Spec directories to rename

| Original                                          | New                                       |
| ------------------------------------------------- | ----------------------------------------- |
| `specs/001-product-auth-and-application-core/`    | `specs/001-product-auth-and-job-core/`    |
| `specs/013-product-application-salary/`           | `specs/013-product-job-salary/`           |
| `specs/014-product-application-stages-and-notes/` | `specs/014-product-job-stages-and-notes/` |
| `specs/019-technical-application-salary/`         | `specs/019-technical-job-salary/`         |
| `specs/027-technical-ai-application-create-v2/`   | `specs/027-technical-ai-job-create-v2/`   |
| `specs/036-product-application-location/`         | `specs/036-product-job-location/`         |
| `specs/037-product-application-summary/`          | `specs/037-product-job-summary/`          |

## Doc files to rename

| Original                           | New                        |
| ---------------------------------- | -------------------------- |
| `docs/ADDING_APPLICATION_STAGE.md` | `docs/ADDING_JOB_STAGE.md` |

## Content changes in specs/docs

- Text: "Application" → "Job", "application" → "job"
- Traceability IDs: keep as-is unless they encode "application"
- YAML frontmatter: update `title` and `tags` fields

## Also update

- `specs/INDEX.md` — generated, will be regenerated
- `specs/HISTORY.md` — any references to renamed specs
- Run `pnpm leanspec:sync-spec-indices` after spec directory renames

## Verification

```bash
pnpm leanspec:validate
pnpm leanspec:sync-spec-indices -- --check
```

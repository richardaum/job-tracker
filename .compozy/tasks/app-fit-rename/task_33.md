---
status: pending
title: "Rename Fit specs"
type: docs
complexity: medium
dependencies: [20]
---

# Task 33: Rename Fit specs

## Spec directory to rename

| Original                     | New                            |
| ---------------------------- | ------------------------------ |
| `specs/032-product-job-fit/` | `specs/032-product-job-match/` |

## Content changes in spec files

- `README.md`: "Job Fit" → "Job Match", "fit analysis" → "match analysis"
- `design.md`: all references
- `checklist.md`: all references
- `tasks.md`: all references

## Other specs that reference "fit"

Search and update references in:

- `specs/033-compliance-lgpd/README.md`
- `specs/034-technical-async-task-pattern/README.md`
- `specs/034-technical-async-task-pattern/PATTERN.md`
- `specs/038-ai-infrastructure/README.md`
- `specs/040-technical-enum-naming-convention/README.md`
- `specs/041-technical-async-metadata-sub-patterns/README.md`
- `specs/HISTORY.md`

## Post-rename

```bash
pnpm leanspec:sync-spec-indices
pnpm leanspec:validate
```

## Verification

```bash
pnpm leanspec:sync-spec-indices -- --check
```

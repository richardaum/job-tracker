---
status: pending
title: "Update Application references in UI package"
type: ui
complexity: low
dependencies: [01]
---

# Task 18: Update Application references in UI package

## Search for references

```bash
grep -rn -i "application" packages/ui/src/ --include='*.ts' --include='*.tsx'
```

## Action

- Update any component names, types, or props that reference `Application`
- Rename files if they contain "application" in the filename
- Update Storybook stories if they reference application-related components

## Verification

```bash
pnpm --filter @job-tracker/ui run typecheck
```

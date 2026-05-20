---
status: pending
title: "Update sidebar navigation labels and routes"
type: web
complexity: low
dependencies: [10, 11, 12]
---

# Task 15: Update sidebar navigation labels and routes

**File:** `apps/web/src/modules/navigation/components/Sidebar.tsx`

## Changes

- Labels: "Applications" → "Jobs", "Draft Applications" → "Draft Jobs"
- Routes: `/applications` → `/jobs`, `/draft-applications` → `/draft-jobs`
- Icons: keep the same

Also check for any other navigation-related files that reference these routes:

- `apps/web/src/modules/navigation/` — all files
- Any middleware or redirect config referencing `/applications`

## Verification

```bash
pnpm --filter @job-tracker/web run typecheck
```

---
status: pending
title: "Update sidebar Fit→Match labels and routes in web"
type: web
complexity: low
dependencies: [28, 30]
---

# Task 31: Update sidebar Fit→Match labels and routes in web

**File:** `apps/web/src/modules/navigation/components/Sidebar.tsx`

## Changes

- Label: "Fit Analyses" → "Match Analyses"
- Route: `/fits` → `/matches`
- Icon: keep the same

## Verification

```bash
pnpm --filter @job-tracker/web run typecheck
```

---
status: pending
title: "Routes + Sidebar — Application→Job (Web)"
type: web
complexity: medium
dependencies: [05]
---

# Task 06: Routes + Sidebar — Application→Job (Web)

## 6a. Route directories

| Original                                               | New           |
| ------------------------------------------------------ | ------------- |
| `apps/web/src/app/(authenticated)/applications/`       | `jobs/`       |
| `apps/web/src/app/(authenticated)/draft-applications/` | `draft-jobs/` |

Rename dirs and route files (`page.tsx`, `[id]/page.tsx`, `layout.tsx`). Update imports to new module paths.

## 6b. Sidebar

**File:** `apps/web/src/modules/navigation/components/Sidebar.tsx`

- Labels: "Applications" → "Jobs", "Draft Applications" → "Draft Jobs"
- Routes: `/applications` → `/jobs`, `/draft-applications` → `/draft-jobs`
- Icons: keep same

Also check middleware/redirect config for `/applications`.

## Verification

```bash
pnpm --filter @job-tracker/web run typecheck
```

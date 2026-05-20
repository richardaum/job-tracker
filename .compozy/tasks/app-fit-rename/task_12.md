---
status: pending
title: "Rename /applications and /draft-applications routes in web"
type: web
complexity: medium
dependencies: [10, 11]
---

# Task 12: Rename /applications and /draft-applications routes in web

## Directories to rename

| Original                                               | New                                            |
| ------------------------------------------------------ | ---------------------------------------------- |
| `apps/web/src/app/(authenticated)/applications/`       | `apps/web/src/app/(authenticated)/jobs/`       |
| `apps/web/src/app/(authenticated)/draft-applications/` | `apps/web/src/app/(authenticated)/draft-jobs/` |

## Route files

| Original                           | New                           |
| ---------------------------------- | ----------------------------- |
| `applications/page.tsx`            | `jobs/page.tsx`               |
| `applications/[id]/page.tsx`       | `jobs/[id]/page.tsx`          |
| `applications/layout.tsx`          | `jobs/layout.tsx` (if exists) |
| `draft-applications/page.tsx`      | `draft-jobs/page.tsx`         |
| `draft-applications/[id]/page.tsx` | `draft-jobs/[id]/page.tsx`    |

## Content changes in route files

- Imports: update to new module paths (`@/modules/jobs/...`)
- Component references: `ApplicationsPage` → `JobsPage`, etc.

## Verification

```bash
pnpm --filter @job-tracker/web run typecheck
```

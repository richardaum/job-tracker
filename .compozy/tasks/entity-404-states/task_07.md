---
id: T-07
title: Verification
status: pending
type: test
depends_on: [T-02, T-03, T-04, T-05, T-06]
---

# T-07: Verification

## Scope

Run the full validation pipeline and verify no regressions.

## Commands

```bash
pnpm fix:imports
pnpm lint
pnpm format
pnpm typecheck
pnpm test
pnpm knip
```

## Manual checks

1. Navigate to `/applications/nonexistent-id` — EntityNotFound renders
2. Navigate to `/companies/nonexistent-id` — EntityNotFound renders
3. Navigate to `/draft-applications/nonexistent-id` — EntityNotFound renders
4. Navigate to `/resumes/nonexistent-id` — EntityNotFound renders
5. Navigate to `/fits/nonexistent-id` — EmptyState "No analysis yet" renders (unchanged behavior)
6. Stop API → navigate to any detail page — error text renders (for App/Company/Draft/Resume/Fit)

## Acceptance criteria

- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm lint` — zero warnings
- [ ] `pnpm test` — all passing
- [ ] `pnpm knip` — no new dead code
- [ ] All 6 detail pages render EntityNotFound or proper error state when entity missing

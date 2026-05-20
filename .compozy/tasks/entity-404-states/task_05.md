---
id: T-05
title: Add error branch to Fit analysis page
status: pending
type: frontend
depends_on: [T-01]
---

# T-05: Add error branch to Fit analysis page

## Scope

FitAnalysisPage currently has no error branch for Apollo query failures. Add one with descriptive error text.

Also add a `// TODO` comment noting the ambiguity between "ID not found" and "never generated" that will resolve when Application/Job, Fit/Match, and DraftApplication/PastedJob are unified.

## Implementation

### 1. FitAnalysisPage: add error branch

**File:** `apps/web/src/modules/fit-analyses/details/page/FitAnalysisPage.tsx`

Current condition chain (simplified):

```
fitLoading && !fit → Loading text
!fit → EmptyState "No analysis yet"
...isProcessing/isFailed/isCompleted...
```

New chain:

```
fitLoading && !fit → Loading text
error && !fit → Error text (NEW)
!fit → EmptyState "No analysis yet"
...isProcessing/isFailed/isCompleted...
```

The error text should follow the existing pattern:

```tsx
<Text size="sm" color="error">
  Failed to load fit analysis.
</Text>
```

### 2. Add TODO comment

Above the `!fit → EmptyState` branch, add:

```tsx
// TODO: When Application→Job, Fit→Match, DraftApplication→PastedJob are unified,
// the resolver will be able to distinguish "ID not found" (→EntityNotFound)
// from "never generated" (→EmptyState). This branch currently covers both.
```

## Verification

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Error text renders when `useFitQuery` fails (simulate by stopping API)
- [ ] Existing EmptyState "No analysis yet" still renders when fit is null without error

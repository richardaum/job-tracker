---
id: T-04
title: Update Draft application details page
status: pending
type: frontend
depends_on: [T-01]
---

# T-04: Update Draft application details page

## Scope

- Add `notFound` to `useDraftApplicationDetailsViewModel`
- Replace inline not-found text in `DraftApplicationDetailsPage` with `EntityNotFound`

## Implementation

### 1. View-model: add `notFound`

**File:** `apps/web/src/modules/draft-applications/details/hooks/useDraftApplicationDetailsViewModel.ts`

Add to the returned object:

```ts
notFound: !showInitialLoading && !draft,
```

### 2. DraftApplicationDetailsPage: replace not-found branch

**File:** `apps/web/src/modules/draft-applications/details/page/DraftApplicationDetailsPage.tsx`

- Import `EntityNotFound` from `@/components/entity-not-found`
- Destructure `notFound` from the view-model
- Replace the `!draft ? <Text>Draft not found.</Text>` branch with `notFound ? <EntityNotFound resource="draft application" backHref="/draft-applications" backLabel="Back to draft applications" />`
- The condition chain becomes: `showInitialLoading → error → notFound → ...tabs/content`

## Verification

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Navigating to `/draft-applications/nonexistent-id` shows EntityNotFound with message + "Back to draft applications" link
- [ ] Existing error state still renders correctly

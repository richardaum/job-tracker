---
id: T-02
title: Update Application details + notes pages
status: pending
type: frontend
depends_on: [T-01]
---

# T-02: Update Application and ApplicationNotes detail pages

## Scope

- Add `notFound` to `useApplicationDetailsViewModel`
- Replace inline not-found text in `ApplicationDetailsPage` and `ApplicationNotesPage` with `EntityNotFound`

## Implementation

### 1. View-model: add `notFound`

**File:** `apps/web/src/modules/applications/details/hooks/useApplicationDetailsViewModel.ts`

Add to the returned object:

```ts
notFound: !showInitialLoading && !application,
```

### 2. ApplicationDetailsPage: replace not-found branch

**File:** `apps/web/src/modules/applications/details/page/ApplicationDetailsPage.tsx`

- Import `EntityNotFound` from `@/components/entity-not-found`
- Destructure `notFound` from the view-model
- Replace the `!application ? <Text>Application not found.</Text>` branch with `notFound ? <EntityNotFound resource="application" backHref="/applications" backLabel="Back to applications" />`
- The condition chain becomes: `showInitialLoading → error → notFound → ...content`

### 3. ApplicationNotesPage: replace not-found branch

**File:** `apps/web/src/modules/applications/details/page/ApplicationNotesPage.tsx`

Same changes as ApplicationDetailsPage. Use same `resource`, `backHref`, and `backLabel`.

## Verification

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Navigating to `/applications/nonexistent-id` shows EntityNotFound with message + "Back to applications" link
- [ ] Navigating to `/applications/nonexistent-id/notes` shows EntityNotFound with message + "Back to applications" link
- [ ] Existing error state (e.g. network failure) still renders correctly

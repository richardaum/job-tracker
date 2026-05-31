---
id: T-06
title: Update Resume details page (error branch + EntityNotFound)
status: pending
type: frontend
depends_on: [T-01]
---

# T-06: Update Resume details page

## Scope

- Expose `error` from `useResumeEditorState` (currently captured but not returned)
- Add error branch to `ResumeDetailsPage` (currently missing)
- Replace inline not-found text with `EntityNotFound`

## Implementation

### 1. useResumeEditorState: expose `error`

**File:** `apps/web/src/modules/resumes/details/hooks/useResumeEditorState.ts`

The hook already captures `error` from `useResumeQuery` but doesn't return it. Add `error` to the returned object:

```ts
return {
  resume,
  loading,
  error, // ← add this
  notFound,
  refetch,
  startPolling,
  stopPolling,
};
```

### 2. ResumeDetailsPage: add error branch + EntityNotFound

**File:** `apps/web/src/modules/resumes/details/page/ResumeDetailsPage.tsx`

- Import `EntityNotFound` from `@/components/entity-not-found`
- Destructure `error` from the hook

Current condition chain:

```
showInitialLoading → Loading text
notFound → <Text>Resume not found.</Text>
!resume ? null
Editor
```

New chain:

```
showInitialLoading → Loading text
error → Error text (NEW)
notFound → EntityNotFound
!resume ? null
Editor
```

Error text:

```tsx
<Text size="sm" color="error">
  Failed to load resume details.
</Text>
```

EntityNotFound props:

```tsx
<EntityNotFound resource="resume" backHref="/resumes" backLabel="Back to resumes" />
```

## Verification

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Navigating to `/resumes/nonexistent-id` shows EntityNotFound with message + "Back to resumes" link
- [ ] Error text renders on query failure (simulate by stopping API)
- [ ] Existing not-found state now uses EntityNotFound component

# TechSpec: Entity 404 States

**Feature slug:** `entity-404-states`
**PRD:** `_prd.md`

## Design Decisions

### D1 — Component approach over Next.js `notFound()`

**Choice:** Reusable `EntityNotFound` component rendered via conditional logic in pages.
**Rejected:** `notFound()` from `next/navigation` + `not-found.tsx` per segment.

**Rationale:**

- No API changes needed (resolvers stay as-is: some throw, some return null).
- Single component handles all entity types with explicit props — no per-segment `not-found.tsx` duplication.
- HTTP 404 status is not a requirement (current pages already render 200 for missing entities).
- Easier to reason about: the condition `!loading && !entity` is computed in the view-model and passed as a boolean.

### D2 — Component location

**Choice:** `apps/web/src/components/entity-not-found/EntityNotFound.tsx`
**Rejected:** `apps/web/src/modules/shared/` (does not exist), `apps/web/src/modules/applications/shared/` (domain-coupling).

**Rationale:** Follows the existing pattern of `components/empty-state/`. Cross-cutting UI concerns that are not domain-specific belong in `components/`.

### D3 — Explicit backLabel prop

**Choice:** Each page passes `backLabel` explicitly (e.g., `"Back to applications"`).
**Rejected:** Auto-generating from `resource` with pluralization.

**Rationale:** Irregular plurals ("company" → "companies", "analysis" → "analyses") make auto-generation fragile. Explicit labels are a one-time cost per integration site.

## Component Contract

### `EntityNotFound`

**File:** `apps/web/src/components/entity-not-found/EntityNotFound.tsx`

```tsx
type EntityNotFoundProps = {
  /** Human-readable entity name, lowercase. Used in message: "The {resource} was not found..." */
  resource: string;
  /** URL for the back link (e.g., "/applications"). */
  backHref: string;
  /** Visible text for the back link (e.g., "Back to applications"). */
  backLabel: string;
};
```

**Markup structure:**

```
<div className="flex flex-col items-center justify-center gap-4 py-12">
  <Heading level="h2">{resource} not found</Heading>
  <p className="text-sm text-text-secondary text-center max-w-md">
    The {resource} was not found or you don't have access to it.
    Please try again or contact support.
  </p>
  <Link href={backHref} className="text-sm text-text-secondary underline-offset-2 hover:underline">
    {backLabel}
  </Link>
</div>
```

**Imports:** `Link` from `next/link`, `Heading` from `@job-tracker/ui`, `cn` from `@/lib/utils`.

## View-Model Changes

Each view-model gains a `notFound: boolean` field computed from the query state.

### `useApplicationDetailsViewModel`

**Path:** `apps/web/src/modules/applications/details/hooks/useApplicationDetailsViewModel.ts`

**Add to return:**

```ts
notFound: !showInitialLoading && !application,
```

### `useCompanyDetailsViewModel`

**Path:** `apps/web/src/modules/companies/details/hooks/useCompanyDetailsViewModel.ts`

**Add to return:**

```ts
notFound: !showCompaniesInitialLoading && !company,
```

### `useDraftApplicationDetailsViewModel`

**Path:** `apps/web/src/modules/draft-applications/details/hooks/useDraftApplicationDetailsViewModel.ts`

**Add to return:**

```ts
notFound: !showInitialLoading && !draft,
```

### Fit analysis (no view-model — error branch only)

**Path:** `apps/web/src/modules/fit-analyses/details/page/FitAnalysisPage.tsx`

The page uses `useFitQuery` directly. The resolver returns `null` for both "ID doesn't exist" and "never generated", so they are indistinguishable without API changes. The current `EmptyState` "No analysis yet" already covers both cases.

**Changes:**

1. Add **error branch** (currently missing): when `error` from `useFitQuery` is truthy, render error text before the not-found check.
2. Add a **`// TODO`** inline comment explaining this ambiguity will resolve when Application (→Job), Fit (→Match), and DraftApplication (→PastedJob) are integrated into a single entity.

**No `EntityNotFound` for Fit** — not possible without API resolver change.

### Resume details (useResumeEditorState)

**Path:** `apps/web/src/modules/resumes/details/hooks/useResumeEditorState.ts`

Already has `notFound: boolean` field (line ~80). The page already uses it but renders inline text. Also missing an `error` branch — add one.

The Resume resolver **throws NotFoundException**, so `error` is set when the resume ID doesn't exist. The `notFound` flag already handles this (`!loading && !error && !resume`), but when `error` is present AND `!resume`, the error branch should render.

**Current chain** in `ResumeDetailsPage`:

```
{showInitialLoading ? <Loading> : notFound ? <Text>Resume not found.</Text> : !resume ? null : <Editor>}
```

**New chain:**

```
{showInitialLoading ? <Loading> : error ? <ErrorText> : notFound ? <EntityNotFound> : !resume ? null : <Editor>}
```

## Page Integration Matrix

| Page                          | EntityNotFound props                                                                                     | Error branch change                  |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `ApplicationDetailsPage`      | `resource="application"` `backHref="/applications"` `backLabel="Back to applications"`                   | None — keep existing                 |
| `ApplicationNotesPage`        | `resource="application"` `backHref="/applications"` `backLabel="Back to applications"`                   | None — keep existing                 |
| `CompanyDetailsPage`          | `resource="company"` `backHref="/companies"` `backLabel="Back to companies"`                             | None — keep existing                 |
| `DraftApplicationDetailsPage` | `resource="draft application"` `backHref="/draft-applications"` `backLabel="Back to draft applications"` | None — keep existing                 |
| `FitAnalysisPage`             | **N/A** — resolver ambiguity prevents it                                                                 | Add error branch + `// TODO` comment |
| `ResumeDetailsPage`           | `resource="resume"` `backHref="/resumes"` `backLabel="Back to resumes"`                                  | Add error branch for query failures  |

## Condition Order (per page)

### Application, Company, Draft (existing error kept)

```
showInitialLoading → Loading text
error → Error text (existing)
notFound → EntityNotFound
else → Content
```

### ApplicationNotesPage

Same condition order as Application (uses same view-model):

```
showInitialLoading → Loading text
error → Error text (existing)
notFound → EntityNotFound
else → Content
```

### Fit (new error branch + TODO)

```
fitLoading && !fit → Loading text
error → Error text (NEW)
!fit → EmptyState "No analysis yet" (existing)  // TODO: can't distinguish ID-not-found from never-generated until Job/Match/PastedJob unification
isProcessing → EmptyState (existing)
isFailed → EmptyState (existing)
isCompleted → Content (existing)
```

### Resume (new error branch)

```
showInitialLoading → Loading text
error → Error text (NEW)
notFound → EntityNotFound
!resume → null
else → Content
```

## Files Changed

| File                                                                                           | Change                                                          |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `apps/web/src/components/entity-not-found/EntityNotFound.tsx`                                  | **NEW** — component                                             |
| `apps/web/src/components/entity-not-found/index.ts`                                            | **NEW** — barrel export                                         |
| `apps/web/src/modules/applications/details/hooks/useApplicationDetailsViewModel.ts`            | Add `notFound` to return                                        |
| `apps/web/src/modules/applications/details/page/ApplicationDetailsPage.tsx`                    | Replace not-found text with `EntityNotFound`                    |
| `apps/web/src/modules/applications/details/page/ApplicationNotesPage.tsx`                      | Replace not-found text with `EntityNotFound`                    |
| `apps/web/src/modules/companies/details/hooks/useCompanyDetailsViewModel.ts`                   | Add `notFound` to return                                        |
| `apps/web/src/modules/companies/details/page/CompanyDetailsPage.tsx`                           | Replace not-found text with `EntityNotFound`                    |
| `apps/web/src/modules/draft-applications/details/hooks/useDraftApplicationDetailsViewModel.ts` | Add `notFound` to return                                        |
| `apps/web/src/modules/draft-applications/details/page/DraftApplicationDetailsPage.tsx`         | Replace not-found text with `EntityNotFound`                    |
| `apps/web/src/modules/resumes/details/hooks/useResumeEditorState.ts`                           | Expose `error` to return                                        |
| `apps/web/src/modules/resumes/details/page/ResumeDetailsPage.tsx`                              | Add error branch + replace not-found text with `EntityNotFound` |
| `apps/web/src/modules/fit-analyses/details/page/FitAnalysisPage.tsx`                           | Add error branch                                                |

## Verification

1. `pnpm typecheck` — zero new errors
2. `pnpm lint` — zero new warnings
3. `pnpm test` — existing tests pass
4. Manual: navigate to `/applications/nonexistent-id`, verify EntityNotFound renders with message + back-link
5. Manual: same for `/companies/nonexistent-id`, `/draft-applications/nonexistent-id`, `/resumes/nonexistent-id`
6. Manual: Fit and Resume pages render error text on network failure (simulate by stopping API)
7. `pnpm knip` — no dead code introduced

# PRD: Entity 404 States

**Feature slug:** `entity-404-states`

## Workflow context (Compozy)

- **Execution mode:** **B — Single branch, no worktree** — single-branch PRD → TechSpec → tasks → implementation → review → verify in the current checkout. No extra worktree isolation required (scope is frontend-only, no DB migrations, no API changes).
- **ADR inputs:** None (decision is captured in TechSpec; no architectural trade-off requiring separate ADR).

## Overview

When a user navigates to a detail page for an entity that does not exist (or they lack access to), the current behavior is inconsistent across the 6 entity types. Some show inline text messages (HTTP 200), some lack error branches entirely, and none provide a back-link to the listing from the error state. This creates a fragmented experience and leaves users stranded without clear recovery path.

**Primary beneficiaries:** job seekers using detail views for applications, companies, drafts, fit analyses, and resumes.

## Goals (testable)

1. **G1 — Consistent not-found UX**  
   **Pass:** All 6 entity detail pages render a shared `EntityNotFound` component with the message _"The {resource} was not found or you don't have access to it. Please try again or contact support."_ and a back-link to the respective listing page when the entity is not resolvable.

2. **G2 — No regression on error states**  
   **Pass:** Application, Company, and Draft detail pages preserve their existing error states for non-404 failures (network errors, server errors). Fit and Resume gain proper error branches they currently lack.

3. **G3 — Zero dead branches**  
   **Pass:** The `!entity` branch in each detail page is reachable and renders the new component (not dead code behind an `error` gate). Typecheck passes with zero new errors.

## User Stories

- As a **job seeker**, when I open a link to an application that was deleted, I want a clear message telling me it's not available and a link to go back to my applications list.
- As a **job seeker**, when I navigate to a company I don't have access to, I want the same clear recovery path.
- As a **maintainer**, I want one reusable component for "entity not found" states so future entities get this for free.

## Core Features

1. **Reusable `EntityNotFound` component**  
   Single component at `apps/web/src/components/entity-not-found/` with `resource`, `backHref`, and `backLabel` props.

2. **View-model not-found signals**  
   Each view-model exposes a `notFound: boolean` computed from the query result (entity is null/undefined after loading completes, regardless of whether the API returned null or threw).

3. **Page integration**  
   Replace inline `<Text size="sm" color="secondary">X not found.</Text>` in all 6 detail pages with `<EntityNotFound ... />`.

4. **Error branch gaps**  
   FitAnalysisPage and ResumeDetailsPage currently lack error-state rendering for Apollo query failures — add proper error branches.

## User Experience

- **Not-found state**: Centered layout with a heading ("Application not found"), a descriptive paragraph (the standard message), and an underlined back-link.
- **Loading state**: Unchanged — existing loading texts preserved.
- **Error state (non-404)**: Unchanged for Application/Company/Draft; newly added for Fit/Resume.
- **No new surfaces**: No new pages, routes, or settings.

## Requirements

- **Frontend-only**: No API or database changes.
- **i18n**: English only (consistent with existing messages).
- **Design**: Follow existing `components/empty-state/` pattern for component structure.
- **Accessibility**: Back-link is a standard `<Link>`, heading uses semantic markup.

## Non-Goals (Out of Scope)

- HTTP 404 status codes (stays at 200).
- `notFound()` / `error.tsx` from Next.js (stays with inline conditional rendering).
- Server-side access control or authorization changes.
- API resolver changes (throw vs return null behavior stays as-is).
- Changing the "Back to X" link style or location outside the not-found state.
- Normalizing loading/error/not-found rendering into a shared wrapper component (deferred).
- Adding a "contact support" action beyond the text message.
- Pluralization logic — each page passes explicit `backLabel`.

## Risks and Mitigations

- **Breaking existing error detection**: Changing condition order could mask network errors. **Mitigate**: keep `error` check before `notFound` in pages where error was already handled; only reorder where error branch was absent.
- **Component placement**: Risk of choosing a poor location. **Mitigate**: follow the existing `components/empty-state/` pattern (co-located internals, barrel export).

## Open Questions

- Should the EntityNotFound component also receive a `children` slot for custom actions? (Defer — not needed for current scope; can be added later via `asChild` pattern.)

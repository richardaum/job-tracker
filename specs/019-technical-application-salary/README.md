---
status: planned
created: "2026-05-02"
priority: medium
tags:
  - migrated
---

# Technical Scope: application-salary

## Architecture Impact

- [T-112] Extend the Drizzle `applications` model and PostgreSQL schema with `salary_min_cents`, `salary_max_cents`, `salary_currency` (text), `salary_period` (enum: year, month, hour), and `salary_tags` (text array with empty default), plus a versioned SQL migration in `apps/api`.
- [T-113] Surface the same fields on GraphQL `ApplicationType`, `CreateApplicationInput`, and `UpdateApplicationInput` with null semantics aligned to SQL; regenerate the web `graphql` contract and client hooks.
- [T-114] Add a shared web formatting utility for range + `Intl` currency display, and a small presentational chip row reused by the list card and the details overview.

## Design Decisions

- [T-115] Store money as integer minor units to avoid float drift, require `salary_currency` and `salary_period` when either amount is set, and treat a cleared salary write as `NULL` amounts with empty `salary_tags` in one transaction. -> Keeps invariants testable and matches GraphQL nullability.
- [T-116] Derive a single user-visible range string (including single-value and min–max) from stored cents, currency, and period, and keep free-form `salary_tags` as chip-only content separate from the numeric string. -> Preserves scannable list layout and avoids overloading one text field.
- [T-117] Normalize `salary_tags` by trimming, case-folding for deduplication, enforcing a max length per tag, max tag count, and dropping empties. -> Prevents unbounded array growth and UI overflow.

## Risks and Mitigations

- [T-118] Invalid partial payloads (cents without currency) -> service-layer validation with integration tests; GraphQL errors map to user toast copy on web.
- [T-119] Tag-only vs amount-only product ambiguity -> [P-93] is resolved in implementation by a single rule set documented in the service (either forbid tag-only, or require at least one amount when tags exist) and mirrored in the UI.
- [T-120] List card horizontal overflow on small screens -> chip overflow with `+N` and responsive wrapping consistent with `ApplicationsPage` line layout.

## Validation

- [T-121] API unit/integration tests cover create/update invariants, optional null clears, and tag normalization; web lint, typecheck, and affected tests pass; optional Storybook for new chip or field affordance if it becomes a package export.

---
status: planned
created: "2026-05-02"
priority: medium
tags:
  - migrated
---

> **Migrated** from `.specs/product/APPLICATION-COMPENSATION.md`. Links in the body may still reference `.specs/`; update them to this tree under `specs/` when editing.

# Product Scope: application-compensation

## Objective

- [P-84] Users can optionally record structured pay expectations (range and cadence) plus short free-form tags on each owned application, and see them consistently in the list and details surfaces.

## In Scope

- [P-85] Store optional `salary_min_cents` and `salary_max_cents` as integer minor currency units, optional ISO-4217 `salary_currency`, and optional `salary_period` (year, month, hour) on `applications` with clear all-or-cleared empty state.
- [P-86] Store optional `salary_tags` as a bounded list of user-defined string labels (for example `Equity`, `Bonus`, `CLT`) with server-side trim, deduplication, and count limits.
- [P-87] Show compensation on the application list card only when a numeric range and/or tags exist, using a compact primary text line for the range and small neutral chips for currency, period, and up to a few tags with overflow handling.
- [P-88] Expose read and edit for compensation in the details `Overview` tab using the same inline hover pattern as other core fields, including the ability to clear the entire compensation block in one action.
- [P-89] Wire optional compensation fields into create and update application surfaces (new application, quick edit, GraphQL) without requiring them for save.

## Out of Scope

- [P-90] Cross-application salary analytics, team benchmarks, and employer-reported pay transparency digests.
- [P-91] Automatic tax, equity, or currency-conversion math beyond display formatting and minor-unit storage.

## Acceptance Criteria

- [P-92] A user can save a valid compensation row (or clear it) and immediately see the same values on the list card and the details `Overview` after refetch, with API rejecting inconsistent partial states defined by the technical scope.
- [P-93] A user with only tags and no numeric range can still see tag chips in list and details when that state is allowed by the technical validation rules, or the UI must clearly reflect that tags require accompanying structured fields if the API forbids tag-only records.

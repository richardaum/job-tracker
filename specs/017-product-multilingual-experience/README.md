---
status: planned
created: "2026-05-02"
priority: medium
tags:
  - migrated
---

# Product Scope: multilingual-experience

## Objective

- [P-34] Deliver a consistent multilingual UX so users can operate the application in English or Portuguese (Brazil).

## In Scope

- [P-35] Support locale selection and persistence across authenticated and guest sessions.
- [P-36] Externalize all user-facing strings in Beta2 surfaces to locale dictionaries.
- [P-37] Provide translated labels, validation messages, and empty-state content for EN and PT-BR.
- [P-65] Support locale-aware routing and runtime dictionary loading across Beta2 user-facing flows.
- [P-66] Standardize translation key conventions across application surfaces to avoid key drift.
- [P-67] Enforce structured dictionary modules with static key validation and profile/cookie locale persistence.

## Out of Scope

- [P-38] Additional locales beyond EN and PT-BR in Beta2.
- [P-39] AI translation of free-form user content and notes.

## Acceptance Criteria

- [P-40] A user can switch locale and see interface labels update without data loss.
- [P-41] Regression checks confirm no hard-coded user-visible strings remain in Beta2 feature paths.
- [P-42] Validation and error feedback messages are available and accurate in both supported locales.
- [P-68] Pre-merge quality checks prevent missing translation keys and verify bilingual rendering in end-to-end validation.

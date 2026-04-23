# Product Scope: import-and-onboarding-expansion

## Objective

- [P-52] Reduce manual entry friction by enabling guided import paths and guest onboarding before authentication.

## In Scope

- [P-53] Support extension-assisted application capture from selected job boards into draft records.
- [P-54] Support generic board import by URL parsing and normalized field extraction into user-review drafts.
- [P-55] Provide a guest onboarding mode that allows temporary exploration of tracking workflows.
- [P-56] Convert guest data into owned records after sign-in with explicit user consent.
- [P-79] Normalize imported payloads with field-confidence markers before user confirmation and final save.
- [P-80] Protect import integrations with signed requests and explicit API-side validation contracts.
- [P-81] Guarantee idempotent guest-to-user migration with reconciliation signals to reduce data-loss risk.

## Out of Scope

- [P-57] Fully automatic background scraping without user action or consent.
- [P-58] One-click autonomous apply actions to third-party platforms.
- [P-82] Unrestricted source adapters without isolated parser boundaries and failure observability.

## Acceptance Criteria

- [P-59] A user can import a supported job listing into a draft and confirm mapped fields before persistence.
- [P-60] A guest can create temporary tracking data and later migrate it into an authenticated account.
- [P-61] Import failures provide actionable guidance and never overwrite existing owned records without confirmation.
- [P-83] Import mapping accuracy, migration integrity, and failure recovery behavior are validated through automated scenario coverage.

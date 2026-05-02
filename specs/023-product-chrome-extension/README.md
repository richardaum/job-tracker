---
status: planned
created: "2026-05-02"
priority: medium
tags: []
---

# Product scope: chrome-extension

Companion to **`specs/016-product-import-and-onboarding-expansion/README.md`**: shared normalization, signing, and guest migration rules ([P-79]–[P-81]; acceptance [P-61], [P-83]) apply to extension-originated payloads unless this spec narrows behavior.

## Objective

- [P-109] Deliver a Chrome extension-assisted capture path that sends job listings from selected boards into draft application records for the same confirm-and-save model as other import surfaces.

## In scope

- [P-53] Support extension-assisted application capture from selected job boards into draft records.

## Out of scope

- [P-111] Fully automatic background capture without an explicit user action in the extension for each send-to-track operation.
- [P-112] One-click autonomous apply actions on third-party platforms from the extension.

## Technical decisions

- [T-132] Ship the extension on **Manifest V3** with least-privilege host permissions and authenticated API calls that satisfy [P-80] (signed requests and API validation contracts).
- [T-133] Reuse `packages/ui` token and component contracts for any shared extension UI shell so design-system decisions stay aligned with `specs/002-technical-design-system-and-visual-identity/README.md` ([T-1]–[T-4]).

## Acceptance criteria

- [P-110] A signed-in user can send a supported job board page from the Chrome extension into a draft, review mapped fields (including confidence treatment consistent with [P-79]), and persist only after explicit confirmation.
- [P-113] Extension failures surface actionable guidance and never overwrite existing owned records without confirmation, consistent with [P-61].

## Validation

- [T-134] Automated coverage exercises extension-to-API draft handoff and rejection paths for invalid or unsigned payloads alongside [P-83] scenario expectations.

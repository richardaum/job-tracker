# Product Scope: application-stages-and-notes

## Objective

- [P-15] Enable users to track each application lifecycle with explicit stage transitions and structured interview notes.

## In Scope

- [P-16] Define a default stage model (Applied, Recruiter Screen, Technical, Offer, Rejected) with manual stage transitions.
- [P-17] Persist stage transition history with timestamps and actor context for each application.
- [P-18] Add free-form notes and dedicated post-interview feedback fields per application.
- [P-19] Keep ownership isolation for stage and note operations under the authenticated user account.
- [P-69] Model stage transitions as append-only workflow events to preserve timeline auditability.
- [P-70] Support revision-aware note updates to reduce silent overwrite during concurrent edits.
- [P-71] Expose stage transition, timeline retrieval, and note management through stable application APIs.
- [P-72] Enforce transition validation rules so current stage snapshots remain consistent with event history.

## Out of Scope

- [P-20] Shared or collaborative notes across multiple users.
- [P-21] Automated stage changes triggered by external board events.

## Acceptance Criteria

- [P-22] A user can change stage for an owned application and see the new state immediately.
- [P-23] A user can review chronological stage history entries for an owned application.
- [P-24] A user can create and update interview notes without exposing records to other users.
- [P-73] Workflow and notes behavior pass integration coverage for transition invariants, timeline ordering, and ownership boundaries.

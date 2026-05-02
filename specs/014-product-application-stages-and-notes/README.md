---
status: planned
created: "2026-05-02"
priority: medium
tags:
  - migrated
---

> **Migrated** from `.specs/product/APPLICATION-STAGES-AND-NOTES.md`. Links in the body may still reference `.specs/`; update them to this tree under `specs/` when editing.

# Product Scope: application-stages-and-notes

## Objective

- [P-15] Enable users to track each application lifecycle with explicit stage transitions and status-linked notes.

## In Scope

- [P-16] Define a default stage model (New, Applied, Recruiter Screen, Technical, Offer, Rejected) with manual stage transitions.
- [P-17] Persist stage transition history with timestamps and actor context for each application.
- [P-18] Keep notes in a dedicated notes store where each note targets exactly one entity (`application` or `stage event`) and content is stored as TipTap document JSON.
- [P-19] Keep ownership isolation for stage and note operations under the authenticated user account.
- [P-69] Model stage transitions as append-only workflow events to preserve timeline auditability.
- [P-70] Support revision-aware note updates to reduce silent overwrite during concurrent edits.
- [P-71] Expose stage transition, timeline retrieval, and note management through stable application APIs.
- [P-72] Allow user-driven transitions between any defined statuses while keeping current stage snapshots consistent with event history.
- [P-76] Support an optional `description` field on each application stored as TipTap document JSON for role context, stack, and quick notes visible in list and edit flows.

## Out of Scope

- [P-20] Shared or collaborative notes across multiple users.
- [P-21] Automated stage changes triggered by external board events.

## Acceptance Criteria

- [P-22] A user can change stage for an owned application and see the new state immediately.
- [P-23] A user can review chronological stage history entries for an owned application.
- [P-24] A user can create and update general notes without exposing records to other users.
- [P-73] Workflow and notes behavior pass integration coverage for timeline ordering, free-status transitions, and ownership boundaries.
- [P-74] Every newly created application starts with an automatic initial stage event in status New.
- [P-75] Tracking controls render with two dropdowns: one for status changes (status + optional `scheduledAt` + optional stage note) and one for application note editing, both backed by the notes store.
- [P-77] A user can create, view, and edit an optional application `description` as valid TipTap document JSON without affecting stage timeline or note ownership rules.

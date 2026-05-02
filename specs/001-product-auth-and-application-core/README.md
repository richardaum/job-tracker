---
status: archived
created: "2026-05-02"
priority: low
tags:
  - migrated
---

> **Migrated** from `.specs/beta1/product/AUTH-AND-APPLICATION-CORE.md`. Links in the body may still reference `.specs/`; update them to this tree under `specs/` when editing.

# Product Scope: auth-and-application-core

## Objective

- [P-1] Enable authenticated users to securely manage their job applications in one place with full lifecycle tracking.

## In Scope

- [P-2] Sign in with Google and maintain authenticated sessions for returning users.
- [P-3] Create job applications with title, company, source URL, and application date.
- [P-4] View only the applications that belong to the signed-in user.
- [P-5] Edit and delete existing applications owned by the signed-in user.
- [P-6] Provide a reliable daily workflow that reduces missed updates across active applications.

## Out of Scope

- [P-7] Import applications automatically from external job boards or browser extensions.
- [P-8] Guided auto-apply flows or autonomous job submission.
- [P-9] Design system implementation details, build tooling, and infrastructure topology decisions.

## Acceptance Criteria

- [P-10] A user can complete sign-in and access protected application screens in one session.
- [P-11] A user can create, view, edit, and delete an application record without accessing another user's data.
- [P-12] The applications list reflects user mutations after create, update, and delete operations.
- [P-13] Unauthorized access attempts to another user's applications are blocked.
- [P-14] The core authenticated CRUD flow is verifiable through automated end-to-end tests.

# PRD: Registration Access Control

## Overview

The job tracker currently grants access to anyone who logs in with Google — there is no gate. As the product moves toward a public launch, the owner needs a temporary switch to control who can get in: a feature flag that, when enabled, lets anyone register and use the product freely, and when disabled, requires each new person to be individually approved by an admin before they can use the app. This feature adds that switch, the approval workflow, and the admin screen needed to operate it.

## Goals

- Let the product owner toggle between "open registration" and "admin-approved registration" without a deploy, using a PostHog feature flag.
- When registration is gated, give people who attempt to log in a clear, honest "pending approval" state instead of silent failure or a broken app.
- Give the admin a simple, searchable place to see who has requested access and approve or reject each request.
- Reuse the product's existing account-status mechanism as the enforcement point, so the gate is consistent with how access is already managed elsewhere in the app.

## User Stories

- As the product owner, I want to flip a single feature flag so that I can open or close self-registration without shipping code.
- As a new visitor, when registration is gated, I want to attempt to log in and land on a clear "your access is pending approval" screen so that I understand what's happening and that my request was received.
- As a new visitor whose request is rejected, I want a clear message if I try to log in again so that I'm not left wondering why access still doesn't work.
- As an admin, I want to see a list of people who have requested access, with their name, email, avatar, and request date, so that I can decide who to let in.
- As an admin, I want to approve or reject a pending request with one action so that granting access is fast.
- As an admin, I want to search and filter the list by status (pending / approved / rejected) so that I can find a specific request or review history.
- As an admin, I want approvals to be permanent (not tied to the flag's current state) so that once someone is let in, they stay in even if the flag is later turned off for new signups.

## Core Features

### 1. Feature flag gate on first login

When the PostHog flag `auto-accept-register-enabled` is `true`, first-time Google logins are accepted and the account is activated immediately, exactly as today. When the flag is `false`, a first-time login only activates the account automatically if the email was previously approved; otherwise the account is created with a pending status and awaits admin review.

### 2. Pending approval screen

A person whose login lands on a pending, not-yet-decided account sees a dedicated screen explaining that their access request was received and is pending admin approval. This replaces any generic error or silent failure for this case.

### 3. Registration status tracking

Each gated first-time login records the requester's status (pending, approved, or rejected) along with the name and avatar available from Google at that moment. This is what the admin screen operates on.

### 4. Admin approval screen

A new tab in the existing Admin area lists pending, approved, and rejected registrations, following the conventions of the current admin "Users" tab (searchable list, status filter, per-row action). The admin can approve or reject a pending request; approving activates the corresponding account.

### 5. Rejected-request re-login handling

If a rejected person attempts to log in again, they see a state that reflects the rejection rather than reverting to a fresh "pending" state, so they aren't given false hope of an automatic retry succeeding.

## User Experience

**Open flag (`auto-accept-register-enabled = true`):** No visible change from today — Google login works end to end for anyone.

**Gated flag, first-time visitor:** Attempts Google login → account is created inactive → lands on a "your access is pending approval" screen. No email confirmation is sent (MVP); the person must check back by attempting to log in again later.

**Gated flag, previously approved email:** Google login succeeds normally; no friction at all — this is what lets an admin pre-clear returning or known users implicitly once they've been approved once.

**Gated flag, previously rejected email:** Google login lands on a state that communicates access was not granted, distinct from the pending message.

**Admin:** Opens the Admin area, navigates to the new registration-requests tab, sees a searchable, status-filterable list (pending first by default), and approves or rejects each entry with a single action. Approving is immediate and permanent.

## Non-Goals

- No email notifications to applicants on approval or rejection (MVP) — status is only visible by attempting to log in again.
- No self-service "request access" form with a reason/message field — the request is created implicitly by the login attempt itself.
- No proactive allowlisting by the admin (adding an email before anyone has attempted to log in) — requests only exist once someone has tried.
- No access revocation flow as part of this feature — revoking a previously approved person continues to go through the existing user deactivation mechanism, unchanged in behavior by this work.
- No self-service password/email registration — Google OAuth remains the only login method; this feature only adds a gate in front of it.
- No bulk approve/reject actions in the admin UI for the MVP.

## Phased Rollout Plan

1. **Ship gated internally with flag off, allowlist empty.** Verify the pending-approval screen and admin approval flow work end to end using the product owner's own test accounts.
2. **Turn flag off for real, approve trusted contacts manually** as they attempt to log in, to validate the full loop with real users before any public sharing of the app.
3. **Flip the flag on** once the owner is ready for open registration; the admin screen and request history remain available for future use even after open registration begins.

## Success Metrics

- Zero unapproved accounts gain active access while the flag is off (verifies the gate holds).
- Admin can approve a pending request in a single action, end to end, without needing direct database access.
- No increase in login-related error reports or confusion from applicants beyond the expected "pending approval" messaging.

## Risks and Mitigations

- **Risk:** Inactive/rejected accounts accumulate in the `users` table over time, one row per login attempt, including from spam or repeated attempts. **Mitigation:** Accepted as a known trade-off for the MVP (see [ADR-001](adrs/adr-001.md)); revisit if volume becomes a problem.
- **Risk:** A person incorrectly believes rejection is temporary and keeps retrying. **Mitigation:** the rejected-state screen is explicit and distinct from the pending-state screen.
- **Risk:** Admin forgets the gate is on and wonders why new users aren't showing up. **Mitigation:** the admin screen's pending list is the visible signal; no separate alerting is in scope for MVP.

## Architecture Decision Records

- [ADR-001: Registration Gate Creates a User Row on First Login, Governed by a Unified Status Enum](adrs/adr-001.md) — first login always creates the user record (pending if gated and unapproved); account status (pending/active/rejected/deactivated) is a single field on the user record, reused as the login enforcement point.

## Open Questions

- None blocking. Future consideration (explicitly out of scope now): whether rejected applicants should ever be able to trigger a new request, and whether email notifications should be added once volume grows beyond what manual re-login checks can handle.

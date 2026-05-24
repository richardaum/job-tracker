# PRD: User Profile Page

**Status**: planned · **Priority**: high · **Created**: 2026-05-23

## Overview

The app has no user profile page. Identity (name, email, avatar) comes read-only from Google OAuth and is only visible in the sidebar user card — a purely decorative element. App settings, resume management, and work preferences are scattered across separate pages or modals. Users need a single, centralized destination for everything about themselves.

This feature creates a unified `/profile` page accessible from the sidebar user card. It consolidates four concerns into horizontal tabs: Identity, Settings, Resumes, and Work Preferences. The sidebar becomes cleaner: "Resumes" moves into the profile, and "Settings" redirects to the profile's Settings tab.

## Goals

- **Identity display**: Users see their OAuth-derived profile (name, email, avatar) in a read-only Identity tab.
- **Settings hub**: Users configure duplicate-detection window, auto-fill, and auto-summary toggles from a Settings tab.
- **Resume management inline**: Users create, edit, delete, and list resumes inside the Resumes tab — no separate `/resumes` route.
- **Work preferences inline**: Users manage work preferences (text + weight) in the Work Preferences tab instead of a floating modal.
- **Cleaner navigation**: The sidebar loses its "Resumes" nav item. The user card becomes clickable with a chevron and hover effect. The "Settings" bottom item points to `/profile/settings`.

## User Stories

- As a user, I click my avatar in the sidebar and go to my profile page — one place for everything about me.
- As a user, I see my name, email, and avatar on the Identity tab so I know which account I'm using.
- As a user, I toggle auto-fill on/off so the system knows whether to pre-fill application fields when converting from draft.
- As a user, I toggle auto-summary on/off so summaries are generated automatically when I change job fields.
- As a user, I adjust the duplicate-detection window so the app uses my preferred time range when checking for duplicates.
- As a user, I manage all my resumes from the profile without switching pages.
- As a user, I edit my work preferences directly on the profile page instead of opening a modal.

## Core Features

1. **Profile page shell** — `/profile` route with 4 horizontal tabs. Follows existing detail-page layout with `BackToLink` and `Heading`.

2. **Identity tab** — Read-only display of `name`, `email`, `avatarUrl` from the OAuth provider. User sees their current identity with no edit controls.

3. **Settings tab** — Three setting controls, each rendered as a card section:

   | Setting                    | Type          | Default | Range/Values |
   | -------------------------- | ------------- | ------- | ------------ |
   | Duplicate detection window | Number (days) | 30      | 1–365        |
   | Auto-fill                  | Toggle        | Off     | On / Off     |
   | Auto-summary               | Toggle        | Off     | On / Off     |

   Persisted server-side per user. Auto-saved on change — no explicit save button needed for toggles.

4. **Resumes tab** — Full resume management: list with `Stack` + `ResumeCard`, create (TipTap editor), edit (navigate to edit view or inline editor), delete with confirmation. Matches existing `/resumes` page functionality if implemented.

5. **Work Preferences tab** — Inline rendering of the existing preferences editor (text input + weight toggle high/low per item). Replaces the modal `PreferencesDialog` used across multiple pages.

6. **Sidebar user card** — Gains a chevron icon, row hover effect (`hover:bg-*`), and `cursor-pointer`. Click navigates to `/profile`.

7. **Sidebar cleanup** — "Resumes" removed from main `navItems`. "Settings" bottom item updated from `href="#"` to `href="/profile/settings"`.

## User Experience

- **Entry point**: Click the user card (avatar + name + email + chevron) at the bottom of the sidebar. Visual feedback: row hover highlight.
- **Navigation within profile**: Horizontal tabs switch between Identity, Settings, Resumes, Work Preferences. Each tab is a subpage: `/profile`, `/profile/settings`, `/profile/resumes`, `/profile/preferences`.
- **Settings editing**: Toggles flip immediately with optimistic UI. Number input for duplicate window auto-saves on blur or debounced change.
- **Resume management**: List view shows all resumes as cards. "New Resume" button opens an inline editor or navigates to a full-page editor. Edit/delete actions on each card.
- **Empty state**: First-time users see appropriate empty states for Resumes and Work Preferences tabs.

## Non-Goals

- Editing OAuth identity fields (name, email, avatar) — these are provider-managed.
- Password management or multi-factor auth — out of scope.
- Notification preferences (email, in-app) — deferred to future Settings iteration.
- Theme/locale preferences — deferred.
- Account deletion or deactivation — deferred.
- Upload or parse resumes from files — deferred.
- Skills and education sections on profile — deferred.

## Phased Rollout Plan

**Phase 1 — MVP (this PRD):**

1. Create `/profile` page shell with 4 tabs
2. Identity tab with read-only OAuth data
3. Settings tab with duplicate window, auto-fill, auto-summary
4. Resumes tab with full CRUD inline
5. Work Preferences tab inline
6. Sidebar: user card clickable, remove "Resumes" nav item, wire "Settings" link
7. Remove or redirect old `/resumes` route if it exists
8. Absorb/update spec `031-product-settings-screen` to align

**Phase 2 — Future:**

- Resume file upload + auto-parse
- Skills and education sections
- Notification preferences
- Theme/locale preferences
- Account management (delete, deactivate)

## Success Metrics

- The "Resumes" sidebar item is gone — users access resumes through the profile.
- The sidebar user card is clickable and navigates to `/profile`.
- Settings changes persist across sessions.
- All 4 tabs render without errors and pass existing test suites.
- The sidebar "Settings" link opens the Settings tab of the profile page.

## Risks and Mitigations

| Risk                                                         | Mitigation                                                                                          |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Existing `/resumes` page may have been partially implemented | Remove or redirect; migrate functionality into the profile's Resumes tab                            |
| Spec 031 defines its own `/settings` route and layout        | Adapt spec 031 to use the profile's Settings tab instead of a standalone page                       |
| Work preferences currently in a modal used by multiple pages | Move the editor to the profile tab; pages that need quick access can link to `/profile/preferences` |
| Auto-fill and auto-summary toggles need backend wiring       | Ensure existing auto-fill/summary flows respect the new user settings                               |

## Architecture Decision Records

- [ADR-001](./adrs/adr-001.md) — Unified Profile Hub: single `/profile` page with tabs instead of separate `/settings` and `/resumes` routes

## Open Questions

- Should the Resumes tab support a "default resume" selection for auto-fill/matching?
- Should auto-fill and auto-summary default to On or Off?
- What happens to existing deep links to `/resumes` after the route is removed?

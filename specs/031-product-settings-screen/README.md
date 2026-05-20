---
status: planned
created: "2026-05-10"
priority: low
tags:
  - web
  - settings
  - configuration
---

# Settings screen

> **Status**: planned · **Priority**: low · **Created**: 2026-05-10

## Motivation

The app has no centralized place for user preferences. As features grow (duplicate detection, notification prefs, display options, etc.), users need a single **Settings** page to view and adjust their configuration.

This spec establishes the settings shell **and** ships the first setting: the **duplicate-detection time window** — the interval past which two job applications are no longer considered duplicates. Default: **1 month**.

## Design

### Settings shell (`/settings`)

- A new authenticated route under **`apps/web/src/app/settings/`**.
- Layout: sidebar nav (desktop) / tabs (mobile) listing available setting groups.
- Each setting group renders as a **card** with a title, description, and the control.
- The shell is **extensible by convention**: adding a new setting group means adding a new section component — no routing changes needed for new settings.

### Setting: duplicate-detection window

| Field          | Value                                                    |
| -------------- | -------------------------------------------------------- |
| Key (internal) | `duplicateWindowDays`                                    |
| Label (UI)     | Duplicate detection window                               |
| Description    | Time interval to consider two applications as duplicates |
| Type           | **number** (days)                                        |
| Default        | **30** (1 month)                                         |
| Storage        | **User settings** table or column on `users`             |
| Control        | Number input with `min=1`, `max=365`, step=1             |

- The value is persisted server-side, exposed via a GraphQL mutation (`updateSetting`) and query (`settings`).
- The API enforces the window when checking for duplicates on job creation (existing dedup logic reads this value; default 30 if unset).

### API

- **`UserSetting`** entity/table: `userId` (PK, FK → `users`), `key` (PK, string), `value` (JSON column).
- GraphQL: `Query.settings: [UserSetting!]!` (scoped to current user), `Mutation.updateSetting(key: String!, value: JSON!): UserSetting!`.
- Resolver reads settings at the job-service layer during duplicate checks.

### Future settings (extensibility)

This shell is designed to hold any future user-level configuration. For example:

- Notification preferences (email, in-app).
- Default stage for new applications.
- UI density / theme preferences.
- Locale / timezone overrides.

Adding a new setting requires: (1) define the key + default in code, (2) add UI section component, and (3) optional migration for a new default. No schema changes beyond a single `user_settings` table.

## Product outcomes

- **[P-146]** Logged-in users can access a **`/settings`** page with a navigation sidebar and at least one setting group (duplicate-detection window).
- **[P-147]** The **duplicate-detection window** defaults to **30 days** and is adjustable per-user in the range 1–365 days.
- **[P-148]** The value is **persisted server-side** and honored by the job-creation duplicate check.
- **[P-149]** The settings shell is **extensible**: adding a new setting requires no route/layout changes — only a new section component.

## Technical plan

| ID          | Deliverable                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **[T-169]** | Create **`UserSetting`** TypeORM entity (`userId`, `key`, `value`) + migration.                                                  |
| **[T-170]** | Add GraphQL **`Query.settings`** and **`Mutation.updateSetting`** to the API, scoped to the authenticated user.                  |
| **[T-171]** | Create **`/settings`** page shell in **`apps/web`** with sidebar nav layout and section-based rendering.                         |
| **[T-172]** | Build **`DuplicateWindowSetting`** section component: number input (1–365), save button, reads/writes via new GraphQL hooks.     |
| **[T-173]** | Wire the **duplicate-detection window** value into the job-creation service so it honors `duplicateWindowDays` (fallback to 30). |
| **[T-174]** | Unit tests for the API (resolver + service), web (page render, setting save), and behavior (duplicate check uses user setting).  |

## Acceptance checklist

### Product

- [ ] **[P-146]** `/settings` route exists, authenticated, with sidebar + at least one group.
- [ ] **[P-147]** Duplicate window defaults to 30, adjustable 1–365.
- [ ] **[P-148]** Value persisted and used by duplicate logic.
- [ ] **[P-149]** Adding a setting requires only a new section component.

### Tech

- [ ] **[T-169]** `UserSetting` entity + migration applied.
- [ ] **[T-170]** `settings` query + `updateSetting` mutation working.
- [ ] **[T-171]** `/settings` page shell renders with layout.
- [ ] **[T-172]** `DuplicateWindowSetting` component functional.
- [ ] **[T-173]** Job create dedup reads user setting.
- [ ] **[T-174]** Tests passing (API, web, dedup integration).

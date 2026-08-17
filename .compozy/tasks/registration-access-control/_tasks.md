# Registration Access Control — Task List

## Tasks

| #   | Title                                                              | Status    | Complexity | Dependencies     |
| --- | ------------------------------------------------------------------ | --------- | ---------- | ---------------- |
| 01  | Migrate `active` boolean to `user_status` enum                     | completed | medium     | —                |
| 02  | Wire `UserEntity.status` through all existing `active` consumers   | completed | high       | task_01          |
| 03  | Gate first-login status via PostHog `auto-accept-register-enabled` | completed | medium     | task_02          |
| 04  | Redirect non-active OAuth outcomes via callback query param        | completed | medium     | task_02, task_03 |
| 05  | Add `RegistrationsResolver` with approve/reject mutations          | completed | medium     | task_02          |
| 06  | Handle `status=pending`/`rejected` on the login page               | completed | medium     | task_04          |
| 07  | Build admin "Registrations" tab                                    | completed | high       | task_05          |

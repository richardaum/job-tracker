# User Profile Page — Task List

## Tasks

| #   | Title                                                          | Status    | Complexity | Dependencies     |
| --- | -------------------------------------------------------------- | --------- | ---------- | ---------------- |
| 01  | Backend settings infrastructure                                | completed | medium     | —                |
| 02  | Wire duplicate window to SettingsService                       | completed | low        | task_01          |
| 03  | PM2 restart + GraphQL codegen                                  | completed | low        | task_01, task_02 |
| 04  | Profile shell with tab routing                                 | completed | medium     | —                |
| 05  | Identity tab                                                   | completed | low        | task_04          |
| 06  | Settings tab with GraphQL operations                           | completed | medium     | task_03, task_04 |
| 07  | Extract WorkPreferencesEditor + Preferences tab                | completed | medium     | task_04          |
| 08  | Extract ResumesList + Resumes tab page                         | completed | medium     | task_04          |
| 09  | Resume detail under profile + path updates + remove old routes | completed | high       | task_08          |
| 10  | Sidebar changes                                                | completed | medium     | task_04          |
| 11  | Tests + final validation                                       | completed | high       | task_01..task_10 |
| 12  | Header actions portal + cleanup Resumes tab                    | completed | medium     | task_08, task_10 |

## Post-merge follow-up

- **Migration timestamp rename (drift):** `main` already applied auth columns under `AddUserActiveTokenVersion1767900000000` / `AddUserRefreshJti1767910000000`. After merge, profile branch expects `176791` / `176792` class names. On DBs that hit `column "active" already exists`, fake-insert those two rows into `typeorm_migrations`, then run `pnpm --filter @job-tracker/api db:migrate` for `UserAuthProvider1767950000000` and `UserAccounts1767960000000`.
- **Test drift fixes (uncommitted):** `useCurrentUser.test.ts` missing `CurrentUser` import; `Sidebar.test.tsx` mock user missing `accounts`; `jobs.resolver.spec.ts` guard for undefined `req`.

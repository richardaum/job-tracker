# Checklist — Job Fit / Profile Match

> Real progress against the execution plan in [`tasks.md`](./tasks.md).

## Phase 1 — Foundation (API + data)

| Task  | Description                                 | Deps                      | Status                                        |
| ----- | ------------------------------------------- | ------------------------- | --------------------------------------------- |
| T-175 | Resume entity + migration                   | —                         | ✅ _(merged into T-176)_                      |
| T-192 | FitAnalysis entity + migration              | —                         | ⬜                                            |
| T-190 | Scoring logic (pure functions)              | —                         | ⬜                                            |
| T-176 | GraphQL resume CRUD                         | T-175                     | ✅                                            |
| T-186 | Verify preferences column                   | T-175 (merged into T-176) | ✅ _(no-op, preferences moved to user-level)_ |
| T-183 | `generateApplicationFit` + `applicationFit` | T-192, T-175              | ⬜                                            |

## Phase 2 — Web: Resume CRUD UI

| Task      | Description                                                   | Deps         | Status                   |
| --------- | ------------------------------------------------------------- | ------------ | ------------------------ |
| T-177     | `/resumes` page shell                                         | —            | ✅                       |
| T-178     | ResumeCard component                                          | —            | ✅ _(merged into T-177)_ |
| **T-179** | **Resume editor w/ TipTap + preferences**                     | —            | **✅**                   |
| T-179a    | Route `/resumes/[id]` page + back navigation                  | —            | ✅                       |
| T-179b    | Editable title input                                          | —            | ✅                       |
| T-179c    | TipTapEditor for resume content (fill height)                 | —            | ✅                       |
| T-179d    | Save button in header + draft state management                | —            | ✅                       |
| T-179e    | Delete action from details page                               | —            | ✅                       |
| **T-186** | **UserPreferences entity + GraphQL (1:1 with User)**          | —            | **⬜**                   |
| **T-187** | **Preferences modal (list page, Dialog, bullet list editor)** | —            | **✅ _(mock data)_**     |
| T-187a    | Preference item: text input + weight dropdown + remove        | —            | ✅ _(mock data)_         |
| T-187b    | "Add preference" button                                       | —            | ✅ _(mock data)_         |
| T-187c    | Save button in modal                                          | —            | ✅ _(mock data)_         |
| T-188     | Tests: preferences                                            | T-186, T-187 | ⬜                       |

## Phase 3 — Web: Fit analysis UI

| Task  | Description                                 | Deps         | Status |
| ----- | ------------------------------------------- | ------------ | ------ |
| T-182 | FitModal (Dialog, empty, generate, results) | —            | ⬜     |
| T-184 | Wire GraphQL hooks (fit)                    | T-183, T-182 | ⬜     |
| T-191 | Final score badge component                 | T-190, T-183 | ⬜     |
| T-189 | Weight badge + source/weight filters        | T-184, T-187 | ⬜     |
| T-185 | Tests: fit modal                            | T-184        | ⬜     |

## Notes

- ✅ = done (even if with mock data)
- ⬜ = not started
- 🔄 = in progress
- T-175 merged into T-176: entity + migration + GraphQL CRUD done on API side. Schema auto-generated at `apps/api/src/schema.gql`.
- T-177/T-178 merged: list page shell + `ResumeCard` connected to real GraphQL query (`useResumesQuery`) and delete mutation (`useDeleteResumeMutation`). `useMockResumes.ts` deleted.
- T-179 implemented: detail page `/resumes/[id]` with real query (`useResumeQuery`), update mutation (`useUpdateResumeMutation`), and delete mutation (`useDeleteResumeMutation`). All mock data removed.
- Preferences are **user-level**: T-186 (entity) + T-187 (modal on list page). Not started yet (T-186). Modal UI done with mock data (T-187).

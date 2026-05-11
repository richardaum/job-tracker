# Checklist — Job Fit / Profile Match

> Progresso real contra o execution plan em [`tasks.md`](./tasks.md).

## Phase 1 — Foundation (API + data)

| Task  | Descrição                                   | Deps                      | Status |
| ----- | ------------------------------------------- | ------------------------- | ------ |
| T-175 | Resume entity + migration                   | —                         | ⬜     |
| T-192 | FitAnalysis entity + migration              | —                         | ⬜     |
| T-190 | Scoring logic (pure functions)              | —                         | ⬜     |
| T-176 | GraphQL resume CRUD                         | T-175                     | ⬜     |
| T-186 | Verify preferences column                   | T-175 (merged into T-176) | ⬜     |
| T-183 | `generateApplicationFit` + `applicationFit` | T-192, T-175              | ⬜     |

## Phase 2 — Web: Resume CRUD UI

| Task      | Descrição                                                     | Deps         | Status                              |
| --------- | ------------------------------------------------------------- | ------------ | ----------------------------------- |
| T-177     | `/resumes` page shell                                         | —            | ✅ _(mock data)_                    |
| T-178     | ResumeCard component                                          | —            | ✅ _(mock data, merged into T-177)_ |
| **T-179** | **Resume editor w/ TipTap + preferences**                     | —            | **🔄**                              |
| T-179a    | Route `/resumes/[id]` page + back navigation                  | —            | 🔄                                  |
| T-179b    | Editable title input                                          | —            | 🔄                                  |
| T-179c    | TipTapEditor for resume content (fill height)                 | —            | 🔄                                  |
| T-179d    | Save button in header + draft state management                | —            | 🔄                                  |
| T-179e    | Delete action from details page                               | —            | 🔄                                  |
| **T-186** | **UserPreferences entity + GraphQL (1:1 com User)**           | —            | **⬜**                              |
| **T-187** | **Preferences modal (list page, Dialog, bullet list editor)** | —            | **⬜**                              |
| T-187a    | Preference item: text input + weight dropdown + remove        | —            | ⬜                                  |
| T-187b    | "Add preference" button                                       | —            | ⬜                                  |
| T-187c    | Save button in modal                                          | —            | ⬜                                  |
| T-188     | Tests: preferences                                            | T-186, T-187 | ⬜                                  |

## Phase 3 — Web: Fit analysis UI

| Task  | Descrição                                   | Deps         | Status |
| ----- | ------------------------------------------- | ------------ | ------ |
| T-182 | FitModal (Dialog, empty, generate, results) | —            | ⬜     |
| T-184 | Wire GraphQL hooks (fit)                    | T-183, T-182 | ⬜     |
| T-191 | Final score badge component                 | T-190, T-183 | ⬜     |
| T-189 | Weight badge + source/weight filters        | T-184, T-187 | ⬜     |
| T-185 | Tests: fit modal                            | T-184        | ⬜     |

## Notas

- ✅ = concluído (ainda que com dados mockados)
- ⬜ = não iniciado
- 🔄 = em progresso
- T-177 e T-178 merged: page shell já inclui `ResumeCard`. Migrar: deletar `useMockResumes.ts` e conectar ViewModel real.
- T-179 implementado como page `/resumes/[id]` com mock data. Save no header. Todo código mockado marcado com `/* MOCK DATA */`.
- Preferences são **user-level**: T-186 (entity) + T-187 (modal na list page). Ainda não iniciado.

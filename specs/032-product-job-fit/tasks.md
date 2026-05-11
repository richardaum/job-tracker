# Tasks — Job Fit / Profile Match

> Execution plan with dependency ordering and parallelization.

## Dependencies

```
T-175  Resume entity + migration                          —
T-192  FitAnalysis entity + migration                     —
T-190  Scoring logic (pure functions)                     —
T-177  /resumes page shell                                —
T-178  ResumeCard component                               —
T-179  Resume editor (TipTap)                             —
T-187  Preferences editor (bullet list, weight toggle)     —
T-182  FitModal (generate button, empty state, results)    —

T-176  GraphQL resume CRUD                                → T-175
T-186  Verify preferences column                          → T-175 (merged into T-176)
T-183  Mutation.generateApplicationFit + Query.appFit     → T-192, T-175

T-180  Wire web hooks (resume)                            → T-176, T-177, T-178, T-179
T-184  Wire web hooks (fit)                               → T-183, T-182
T-191  Final score badge component                        → T-190, T-183
T-189  Weight badge + source/weight filters               → T-184, T-187

T-181  Tests: resume CRUD                                 → T-180, T-176
T-188  Tests: preferences                                 → T-187
T-185  Tests: fit modal                                   → T-184
```

Tasks on the same line or grouped with `→ —` are fully parallel (no dependency between them).

## Execution plan

### Phase 1 — Foundation (API + data)

| Batch | Tasks                                               | Deps         | Est. |
| ----- | --------------------------------------------------- | ------------ | ---- |
| 1a    | **T-175** — Resume entity + migration               | —            | 1d   |
| 1b    | **T-176** — GraphQL resume CRUD + **T-186**         | T-175        | 2d   |
| 1c    | **T-192** — FitAnalysis entity + migration          | —            | 1d   |
| 1d    | **T-183** — generateApplicationFit + applicationFit | T-192, T-175 | 2.5d |
| 1e    | **T-190** — Scoring logic                           | —            | 1d   |

1b ⇄ 1c (parallel once T-175 lands).
1d depends on both entities.
1e is independent — can start day 1.

### Phase 2 — Web: Resume CRUD UI

| Batch | Tasks                                   | Deps                       | Est. |
| ----- | --------------------------------------- | -------------------------- | ---- |
| 2a    | **T-177** — /resumes page shell         | —                          | 1d   |
| 2b    | **T-178** — ResumeCard component        | —                          | 1d   |
| 2c    | **T-179** — Resume editor               | —                          | 2d   |
| 2d    | **T-187** — Preferences editor          | —                          | 1d   |
| 2e    | **T-180** — Wire GraphQL hooks (resume) | T-176, T-177, T-178, T-179 | 1d   |
| 2f    | **T-181** — Tests: resume               | T-180, T-176               | 1.5d |

2a ⇄ 2b ⇄ 2c ⇄ 2d — fully parallel.

### Phase 3 — Web: Fit analysis UI

| Batch | Tasks                                                                | Deps         | Est. |
| ----- | -------------------------------------------------------------------- | ------------ | ---- |
| 3a    | **T-182** — FitModal (Dialog, empty state, generate button, results) | —            | 1.5d |
| 3b    | **T-184** — Wire GraphQL hooks (fit)                                 | T-183, T-182 | 1.5d |
| 3c    | **T-191** — Final score badge                                        | T-190, T-183 | 1d   |
| 3d    | **T-189** — Weight badge + filters                                   | T-184, T-187 | 1d   |
| 3e    | **T-185** — Tests: fit modal                                         | T-184        | 2d   |

3a independent — can start alongside Phase 2.
3c ⇄ 3d — parallel once T-183 + T-190 are done.

## Parallel blocks

| Block | Tasks                                                         | Why                                               |
| ----- | ------------------------------------------------------------- | ------------------------------------------------- |
| **A** | T-175 + T-192 + T-190 + T-177 + T-178 + T-179 + T-182 + T-187 | Zero deps — entities, scoring, shells, components |
| **B** | T-176 + T-183                                                 | Need T-175 / T-192; independent resolvers         |
| **C** | T-180 + T-184                                                 | Wire hooks; separate domains (resume vs fit)      |
| **D** | T-181 + T-185 + T-188                                         | Independent test suites                           |
| **E** | T-189 + T-191                                                 | Independent UI atop fit modal                     |

## Critical path

```
T-175 → T-176 → T-180 → T-181       (Resume CRUD)
T-192 → T-183 → T-184 → T-185       (Fit analysis)
```

## Design decisions (captured durante implementação)

| Decisão                                           | Rationale                                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Save no header, não no footer/tabs**            | Editor page com tabs; save no header fica visível em qualquer aba. Evita botões duplicados.       |
| **Resume editor como página (`/resumes/[id]`)**   | Mais espaço que dialog para TipTapEditor. Consistente com detail pages (applications, companies). |
| **Preferences são user-level, não per-resume**    | Faz mais sentido — preferências são do usuário, não variam por versão de currículo.               |
| **Preferences modal na list page, não no editor** | Button "Preferences" na action bar da list page. Abre Dialog com o editor de bullet list.         |
| **T-186 vira UserPreferences entity**             | Deixa de ser coluna no Resume; vira entidade separada 1:1 com User.                               |

## Integration points

1. **T-176** → consumed by T-180 (web needs resume CRUD hooks)
2. **T-183** → consumed by T-184 (web needs fit mutation + query)
3. **T-190** → consumed by T-191 + T-183 (scoring logic)
4. **T-187** → consumed by T-189 (preference weight model)

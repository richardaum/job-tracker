# Tasks: Entity 404 States

**Feature slug:** `entity-404-states`
**PRD:** `_prd.md`
**TechSpec:** `_techspec.md`

## Dependency Graph

```
task_01 (EntityNotFound component)
  ├── task_02 (Application details + notes)
  ├── task_03 (Company details)
  ├── task_04 (Draft application details)
  ├── task_05 (Fit analysis — error branch)
  └── task_06 (Resume details)
        └── task_07 (Verification)
```

## Execution Order

| Phase | Task | File         | Depends On |
| ----- | ---- | ------------ | ---------- |
| 1     | T-01 | `task_01.md` | —          |
| 2     | T-02 | `task_02.md` | T-01       |
| 2     | T-03 | `task_03.md` | T-01       |
| 2     | T-04 | `task_04.md` | T-01       |
| 2     | T-05 | `task_05.md` | T-01       |
| 2     | T-06 | `task_06.md` | T-01       |
| 3     | T-07 | `task_07.md` | T-02..T-06 |

**Parallelizable:** T-02 through T-06 can run in parallel after T-01.

# React Portal Slots — Task List

**Feature slug:** `react-portalslots`
**PRD:** `_prd.md`

## Dependency Graph

```
T-01 (Add dependency)
  └── T-02 (Define slots)
        ├── T-03 (Refactor JobDetailsLayout)
        └── T-04 (Refactor MatchTabContent + tests)
              └── T-05 (Remove obsolete files)
                    └── T-06 (Verify integration)
                          └── T-07 (Document convention)
                                └── T-08 (AGENTS keyword — optional)
                                      └── T-09 (Profile migration — optional, separate worktree)
```

## Tasks

| #   | Title                                            | Status    | Complexity | Dependencies |
| --- | ------------------------------------------------ | --------- | ---------- | ------------ |
| 01  | Add react-portalslots dependency                 | completed | low        | —            |
| 02  | Define job details header portal slots           | completed | low        | 01           |
| 03  | Refactor JobDetailsLayout to PortalSlotsProvider | completed | medium     | 02           |
| 04  | Refactor MatchTabContent to fill slots           | completed | medium     | 02           |
| 05  | Remove obsolete header provider files            | completed | low        | 03, 04       |
| 06  | Verify job match header integration              | completed | low        | 05           |
| 07  | Document header actions convention in web-ui.md  | completed | low        | 06           |
| 08  | Add AGENTS.md keyword index entry                | completed | low        | 07           |
| 09  | Migrate Profile shell to portal slots            | pending   | medium     | 07           |

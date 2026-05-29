# Migrate ESLint to OXC — Task List

## Tasks

| #   | Title                                              | Status    | Complexity | Dependencies              |
| --- | -------------------------------------------------- | --------- | ---------- | ------------------------- |
| 01  | Install OXC and generate baseline `.oxlintrc.json` | completed | low        | —                         |
| 02  | Rewrite custom ESLint plugin as OXC Rust plugin    | pending   | medium     | task_01                   |
| 03  | Migrate `apps/api` to OXC                          | completed | medium     | task_01, task_02          |
| 04  | Migrate `apps/web` to OXC                          | pending   | medium     | task_01, task_02, task_03 |
| 05  | Migrate `packages/ui` to OXC                       | completed | low        | task_01, task_02, task_04 |
| 06  | Migrate `apps/extension` to OXC                    | completed | medium     | task_01, task_02, task_05 |
| 07  | Cleanup ESLint dependencies and config files       | completed | medium     | task_06                   |

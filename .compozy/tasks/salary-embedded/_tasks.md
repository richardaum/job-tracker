# Salary TypeORM Embedded — Task List

## Tasks

| #   | Title                                                                         | Status  | Complexity | Dependencies                                                  |
| --- | ----------------------------------------------------------------------------- | ------- | ---------- | ------------------------------------------------------------- |
| 01  | Create `SalaryEmbedded` class                                                 | pending | low        | —                                                             |
| 02  | Create `JobSalaryInput` + update GraphQL inputs                               | pending | medium     | —                                                             |
| 03  | Update `JobEntity` + remove `SalaryResolver` + cleanup schema                 | pending | medium     | task_01                                                       |
| 04  | Refactor `SalaryService`                                                      | pending | medium     | task_01, task_02                                              |
| 05  | Update `JobsRepository` + `JobsService`                                       | pending | high       | task_01, task_02, task_03, task_04                            |
| 06  | Update `DraftExtractionNormalizationService` + `SummaryService` + their tests | pending | high       | task_01, task_03                                              |
| 07  | Update all test/spec files                                                    | pending | medium     | task_01, task_02, task_03, task_04, task_05, task_06          |
| 08  | Codegen + frontend + final validation                                         | pending | medium     | task_01, task_02, task_03, task_04, task_05, task_06, task_07 |

# Integrate Draft into Jobs — Task List

## Tasks

| #   | Title                                                  | Status    | Complexity | Dependencies     |
| --- | ------------------------------------------------------ | --------- | ---------- | ---------------- |
| 01  | Create baseline tests for affected areas               | completed | high       | —                |
| 02  | DB migration: merge draft_jobs into jobs               | completed | critical   | task_01          |
| 03  | Update JobEntity, enums, and inputs                    | completed | high       | task_02          |
| 04  | Update MatchAnalysisEntity (remove draft FK)           | completed | medium     | task_02          |
| 05  | GraphQL: remove draft types + add fillJobAutomatically | completed | high       | task_03          |
| 06  | Relocate AI extraction to jobs domain                  | completed | medium     | task_05          |
| 07  | Unify match analysis (single mutation)                 | completed | high       | task_04, task_05 |
| 08  | Implement fillJobAutomatically with SSE tracking       | completed | high       | task_05, task_06 |
| 09  | Remove DraftJobsModule and legacy entities             | completed | medium     | task_05, task_08 |
| 10  | Codegen: regenerate frontend hooks                     | pending   | low        | task_05          |
| 11  | Frontend: add Source content tab + Fill button         | pending   | high       | task_10          |
| 12  | Frontend: add Draft filter + indicator on cards        | pending   | medium     | task_10          |
| 13  | Frontend: remove draft routes and components           | pending   | medium     | task_11, task_12 |

# Draft persistence (post–task 02)

There is **no** `DraftJobEntity` mapped to PostgreSQL anymore: migrations drop `draft_jobs`, and `apiEntities` (`data-source-options.ts`) must not reference it.

Draft captures are **`jobs` rows with `stage = 'DRAFT'`**, accessed through `DraftJobsRepository` (`JobEntity` + `JobStageEventEntity`).

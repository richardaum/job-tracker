# Workflow Memory

Keep only durable, cross-task context here. Do not duplicate facts that are obvious from the repository, PRD documents, or git history.

## Current State

## Shared Decisions

- `export-job-md.ts` defines its own input types (`JobData`, `NoteData`, `StageEventData`, `ExportJobData`) inline — no runtime imports from `@/gql/hooks`. Task 02 (component) must map GraphQL query results to these types before calling `formatJobAsMarkdown`.

## Shared Learnings

## Open Risks

## Handoffs

# Task Memory: task_01.md

## Objective Snapshot

Create utility functions for Markdown export: `slugifyFileName`, `formatJobAsMarkdown`, `downloadMarkdown`, plus unit tests.

## Important Decisions

- Define `JobData`, `NoteData`, `StageEventData`, `ExportJobData` interfaces inline instead of importing from `@/gql/hooks` to keep the utility purely functional with zero runtime dependencies.
- Use `formatDate` and `formatDateTime` helpers (matching `job-details.shared.ts` pattern) for date formatting with `en-US` locale.
- Stage events with null `fromStage` display `—` as the origin (first event).
- Salary formatting handles min-only, max-only, and full-range cases.

## Learnings

- jsdom uses system timezone for `toLocaleString`, so test assertions that check formatted times need regex/timezone-agnostic matching.
- `slugifyFileName` collapses consecutive special characters into single hyphens, which is the expected behavior for clean filenames.

## Files / Surfaces

- `apps/web/src/modules/jobs/details/utils/export-job-md.ts` — created
- `apps/web/src/modules/jobs/details/utils/export-job-md.test.ts` — created

## Errors / Corrections

- Test `handles special characters safely` expected double hyphens; corrected to single hyphen (actual collapse behavior).
- Test `produces well-structured Markdown` used hardcoded UTC time; changed to regex to be timezone-agnostic.

## Ready for Next Run

Yes. Task complete with 13/13 tests passing, lint clean, typecheck clean.

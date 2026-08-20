# Task Memory: task_02.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

- Instrument every supported OpenAI request boundary with exact, source-specific token usage while preserving AI access behavior and making persistence best-effort.

## Important Decisions

- Keep provider response parsing at `AiBaseService` and `AiChatGenerationService`, where the SDK response shapes are available.
- Preserve the atomic trial quota update inside `AiAccessService`; enrich its successful return value with the access source.
- Keep `resolveClientKey` as a compatibility wrapper while all token-bearing provider paths adopt `resolveClientAccess`.
- Re-export `AiUsageModule` through `LibAiModule` and inject `AiUsageService` into every `AiBaseService` subclass so inherited accounting is available at runtime in each owning feature module.
- Treat usage persistence as best-effort in the shared `recordUsage` helper; safe diagnostics include only source and request-path labels.

## Learnings

- Pre-change baseline: `resolveClientKey` returns only a string; shared calls, title generation, and streams do not persist provider usage; streams do not request `include_usage`.
- A repository-wide search found no other token-bearing OpenAI calls beyond shared Chat Completions/Responses and direct chat title/stream calls; settings key validation uses `models.list()` and has no token usage payload.
- Focused coverage showed 95.23% lines for `AiAccessService`, 90% for `AiBaseService`, and 100% for `AiChatGenerationService`.
- The caller-provided master tracker path `.compozy/tasks/ai-usage/_tasks.md` is absent; do not fabricate it or claim its tracking update succeeded.

## Files / Surfaces

- `apps/api/src/lib/ai`: source-aware access, shared usage parsing/persistence, module export, subclass constructor wiring, and tests/integration fixture updates.
- `apps/api/src/domains/ai-chat`: title and final-stream usage capture plus success, missing-usage, source, and persistence-failure tests.
- AI base subclasses under companies, jobs, match-analysis, and notes: constructor injection and unit fixture updates only.

## Errors / Corrections

- The documented `pnpm --filter <workspace> vitest` example does not work here because the API package has no `vitest` script; use `pnpm --filter @job-tracker/api exec vitest` or the package `test` script.
- Database-backed access integration tests are discovered but skipped because `DATABASE_INTEGRATION_URL` is not configured.
- `pnpm knip` still fails on the shared, pre-existing dead-code backlog; no cleanup was attempted without user approval.
- Docker EOC logs are unavailable because the `job-tracker-api` container does not exist; PM2 `main-api` restarted after the final edits with zero compile errors and successful Nest initialization.
- The first final full-suite run was terminated with exit 143 under concurrent build/coverage load; rerunning the API suite alone passed 95 files and 700 tests.

## Ready for Next Run

- Implementation and self-review are complete. Fresh API lint, typecheck, build, formatting, diff, coverage, and full-suite gates pass; 14 database-gated files remain skipped. The current task file is marked completed with all subtasks checked, but the missing `_tasks.md` master path could not be updated.

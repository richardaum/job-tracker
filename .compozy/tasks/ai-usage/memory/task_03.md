# Task Memory: task_03.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

- Implement and verify the Profile AI Usage tab, its generated GraphQL query, separated usage areas, refresh/availability states, and route/rendering tests.

## Important Decisions

- Query `aiUsage` and `settings.hasOpenAiKey` in one generated operation so the missing-key state is truthful without exposing key material.
- Keep rolling trial calls (`trial.calls`) separate from allowance fields (`trialCallsUsed`, `trialCallsLimit`, derived remaining).
- Keep `/profile/ai-usage` as the primary Profile route and support `/profile/ai/usage` as an alias; AI key management lives at `/profile/ai/settings` and appears beside Usage through `ProfileSubTabs`.
- Preserve general Settings at `/profile/settings`; the concurrent navigation refactor extracted AI-only settings into `AiSettingsTabPage`.

## Learnings

- Focused web tests use `pnpm --filter @job-tracker/web exec vitest ...` because the workspace exposes Vitest through its `test` script rather than a `vitest` script.
- Task coverage is above target: AI Usage module 100%; combined AI Usage/ProfileShell surface 97.91% statements and 96.29% branches.

## Files / Surfaces

- `apps/web/src/graphql/ai-usage.graphql` and regenerated `apps/web/src/gql/` artifacts.
- `apps/web/src/modules/profile/ai-usage/` view-model, components, page, and tests.
- Profile route/shell files under `apps/web/src/app/(authenticated)/(profile)/profile/` and `apps/web/src/modules/profile/layout/`.
- AI subtab/settings split under `apps/web/src/modules/profile/ai/` plus the narrowed general Settings page.

## Errors / Corrections

- The caller-provided `.compozy/tasks/ai-usage/_tasks.md` is absent; do not invent or update a substitute master tracker.
- Replaced a direct Phosphor refresh-icon import with the canonical `conceptIcon.refresh` mapping.
- Reconciled overlapping navigation/settings edits, scoped duplicate tab-name assertions to the secondary tablist, and verified the stabilized split with the full web suite.
- Repository `knip` still fails on the known unrelated dead-code backlog; no AI Usage file or export appears in its findings.

## Ready for Next Run

- Product implementation and affected-web validation are clean. Master task tracking remains unavailable until `.compozy/tasks/ai-usage/_tasks.md` is restored or supplied.

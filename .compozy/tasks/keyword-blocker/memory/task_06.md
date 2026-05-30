# Task Memory: task_06.md

## Objective Snapshot

Settings UI for keyword blocker: add blocked keywords section to SettingsTabPage.

## Important Decisions

- Used `@phosphor-icons/react` icons (CaretDownIcon, PlusIcon, TrashIcon, XIcon) — consistent with existing codebase
- Built custom collapsible with button + state (no Collapsible component in `@job-tracker/ui`)
- Companies use inline tag-style input matching existing TagsInput pattern in codebase
- Scope/MatchMode displayed via Badge component (`info` for scope, `default` for matchMode)
- Match mode toggled via secondary button (not a separate dropdown) — simpler UX for a binary choice

## Files / Surfaces

- `apps/web/src/graphql/settings.graphql` — added blockedKeywords + blockedCompanies to query and mutation
- `apps/web/src/gql/` — regenerated via codegen
- `apps/web/src/modules/profile/settings/components/BlockedKeywordSection.tsx` — new component
- `apps/web/src/modules/profile/settings/page/SettingsTabPage.tsx` — integrated new section
- `apps/web/src/modules/profile/settings/page/SettingsTabPage.test.tsx` — added 10 new tests

## Validation

- Lint: clean (0 errors, 0 warnings)
- Typecheck: clean
- Tests: 23 passed (SettingsTabPage.test.tsx), all 10 new tests passing

## Ready for Next Run

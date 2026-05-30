# Task Memory: task_05.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Migrate `packages/ui` from ESLint to OXC — update lint script, fix violations, verify.

## Important Decisions

- Phosphor-icons v2 deprecated bare icon names (`Bell`, `Trash`, etc.) in favor of `Icon`-suffixed names (`BellIcon`, `TrashIcon`). Updated all story/test imports to non-deprecated variants.
- Removed `baseUrl` from ui `tsconfig.json` to fix tsgolint `typescript(tsconfig-error)`.

## Learnings

- `--no-warn-ignored` is not supported by oxlint CLI. OXC uses `.eslintignore` / `.oxlintignore` and `ignorePatterns` in config instead.

## Files / Surfaces

- `packages/ui/package.json` — lint/lint:fix scripts updated
- `packages/ui/tsconfig.json` — removed deprecated `baseUrl`
- `packages/ui/src/components/Button/Button.stories.tsx` — updated icon imports
- `packages/ui/src/components/DropdownButton/DropdownButton.stories.tsx` — updated icon imports
- `packages/ui/src/components/DropdownMenu/DropdownMenu.stories.tsx` — updated icon imports
- `packages/ui/src/components/IconButton/IconButton.stories.tsx` — updated icon imports
- `packages/ui/src/components/IconButton/IconButton.test.tsx` — updated icon imports
- `packages/ui/src/components/Link/Link.stories.tsx` — updated icon imports
- `packages/ui/src/components/Tooltip/Tooltip.stories.tsx` — updated icon imports

## Errors / Corrections

- Initial full lint script failed because `--no-warn-ignored` is not an oxlint flag. Removed from script.

## Ready for Next Run

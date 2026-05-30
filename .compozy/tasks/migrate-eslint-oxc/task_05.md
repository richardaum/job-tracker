---
status: completed
title: Migrate `packages/ui` to OXC
type: refactor
complexity: low
dependencies:
  - task_01
  - task_02
  - task_04
---

# Task 05: Migrate `packages/ui` to OXC

## Overview

Migrate `packages/ui` from ESLint to OXC. The UI package uses React components (JSX rules, hooks) and Tailwind CSS class ordering. It is simpler than web — no Next.js, no Testing Library, no process.env restrictions. This task configures the react and import plugins plus the better-tailwindcss JS Plugin.

<critical>
- REFERENCE TECHSPEC "Build Order (step 4)" section
- FOCUS ON "WHAT" — update config and scripts for ui package
- TESTS REQUIRED — verify lint output matches baseline
</critical>

<requirements>
- MUST enable `react` and `import` native plugins in `.oxlintrc.json` for ui scope
- MUST configure better-tailwindcss JS Plugin (already added from task 04)
- MUST NOT enable `nextjs` plugin — ui is Storybook-rendered, not Next.js
- MUST update `packages/ui/package.json` lint script to use `oxlint`
- MUST run `pnpm --filter @job-tracker/ui run lint` with zero warnings
- MUST run `pnpm --filter @job-tracker/ui run typecheck` and tests
</requirements>

## Subtasks

- [x] 5.1 Verify `.oxlintrc.json` has react and import plugins enabled with proper overrides for ui
- [x] 5.2 Update `packages/ui/package.json` lint script: replace `eslint` with `oxlint`
- [x] 5.3 Run `oxlint` on ui codebase; fix violations or adjust config
- [x] 5.4 Run `tsc --noEmit` and tests (Storybook build) to confirm no breakage
- [ ] 5.5 Commit the changes (auto-commit disabled)

## Implementation Details

The `packages/ui/package.json` lint script changes from:

```
"lint": "eslint . --max-warnings=0 --no-warn-ignored && tsc --noEmit"
```

to:

```
"lint": "oxlint . --max-warnings=0 --no-warn-ignored && tsc --noEmit"
```

The UI package uses:

- `eslint-plugin-react` for JSX rules → native OXC `react` plugin
- `eslint-plugin-react-hooks` → native in OXC `react` plugin
- `eslint-plugin-simple-import-sort` → OXC `import` plugin
- `eslint-plugin-better-tailwindcss` → JS Plugin (same as web, already configured)
- `eslint-plugin-storybook` as devDep → not a lint concern for this migration (knip config has an entry for it)

### Relevant Files

- `packages/ui/package.json` — lint script to update
- `.oxlintrc.json` — ensure ui scope is covered (no additional overrides needed if web config already covers React patterns)

### Dependent Files

- `packages/ui/src/**/*.{ts,tsx}` — lint violations may need fixing

### Related ADRs

- ADR-005: Progressive Migration by App

## Deliverables

- `packages/ui` lint script uses `oxlint`
- Zero lint violations on ui codebase

## Tests

- Verification:
  - [x] `pnpm --filter @job-tracker/ui run lint` exits zero with zero warnings
  - [x] `pnpm --filter @job-tracker/ui run typecheck` passes
  - [x] `pnpm --filter @job-tracker/ui run test` passes
- Test coverage target: N/A (infrastructure migration)
- All checks must pass

## Success Criteria

- UI lint runs entirely via OXC
- Storybook build not affected
- Ready for extension migration (task 06)

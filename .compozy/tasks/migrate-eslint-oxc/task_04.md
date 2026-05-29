---
status: pending
title: Migrate `apps/web` to OXC
type: refactor
complexity: medium
dependencies:
  - task_01
  - task_02
  - task_03
---

# Task 04: Migrate `apps/web` to OXC

## Overview

Migrate `apps/web` from ESLint to OXC. The web app has the most complex plugin requirements — React (components, hooks, compiler, refresh), Next.js, Testing Library, Tailwind CSS, import sorting, unrestricted imports, and `process.env` restrictions. This task enables the react, nextjs, import, and jsx-a11y native plugins, plus configures JS Plugins for react-compiler, better-tailwindcss, and testing-library.

<critical>
- READ ADR-004 for the full plugin mapping table
- REFERENCE TECHSPEC "Build Order (step 3)" and "Integration Points" sections
- FOCUS ON "WHAT" — enable web-specific plugins and update scripts
- TESTS REQUIRED — verify lint output matches baseline
</critical>

<requirements>
- MUST enable `react`, `nextjs`, `import`, and `jsx-a11y` native plugins in `.oxlintrc.json`
- MUST configure JS Plugins for `eslint-plugin-react-compiler`, `eslint-plugin-better-tailwindcss`, and `eslint-plugin-testing-library`
- MUST preserve `no-restricted-properties` for `process.env` in `apps/web/src`
- MUST preserve `no-restricted-imports` for `forwardRef` and `cn()` patterns specific to web
- MUST set `settings.next.rootDir` for the Next.js plugin
- MUST update `apps/web/package.json` lint script to use `oxlint`
- MUST run `pnpm --filter @job-tracker/web run lint` with zero warnings and zero errors
- MUST run `pnpm --filter @job-tracker/web run typecheck` and tests
</requirements>

## Subtasks

- [ ] 4.1 Enable `react`, `nextjs`, `import`, `jsx-a11y` plugins in `.oxlintrc.json`
- [ ] 4.2 Configure JS Plugins for `eslint-plugin-react-compiler`, `eslint-plugin-better-tailwindcss`, `eslint-plugin-testing-library` (verify compatibility)
- [ ] 4.3 Configure Next.js-specific settings: `settings.next.rootDir`, `settings.react.linkComponents`
- [ ] 4.4 Add overrides for `process.env` restrictions in `apps/web/src`
- [ ] 4.5 Add overrides for test files (enable vitest plugin for `*.test.*`, `*.spec.*`)
- [ ] 4.6 Update `apps/web/package.json` lint script: replace `eslint` with `oxlint`
- [ ] 4.7 Run lint on web codebase; fix violations or adjust config
- [ ] 4.8 Run typecheck and tests; commit changes

## Implementation Details

The web app uses all the complex ESLint rules. Key mappings:

| ESLint config block                                       | OXC equivalent                                                         |
| --------------------------------------------------------- | ---------------------------------------------------------------------- |
| `react.configs.flat.recommended` + `jsx-runtime`          | `"plugins": ["react"]` with categories                                 |
| `react-compiler` rules                                    | JS Plugin: `eslint-plugin-react-compiler`                              |
| `react-hooks` rules (`rules-of-hooks`, `exhaustive-deps`) | Native in `react` plugin                                               |
| `react-refresh` rules                                     | Native in `react` plugin                                               |
| `@next/next` recommended + core-web-vitals                | `"plugins": ["nextjs"]`                                                |
| `better-tailwindcss`                                      | JS Plugin: `eslint-plugin-better-tailwindcss`                          |
| `testing-library`                                         | JS Plugin: `eslint-plugin-testing-library` (or vitest plugin override) |
| `no-restricted-properties` for `process.env`              | OXC `no-restricted-properties` rule                                    |
| `no-restricted-syntax` (forwardRef, `cn()`)               | OXC no-restricted-syntax or specific rules                             |
| `globals.browser`                                         | `"env": { "browser": true }`                                           |

Test files override: currently uses `testing-library` flat config for `*.test.*` and `*.spec.*`. In OXC, this becomes an override with `"plugins": ["vitest"]` and vitest rules.

### Relevant Files

- `apps/web/package.json` — lint script to update
- `.oxlintrc.json` — add web-specific plugins, overrides, JS Plugins
- `eslint.config.ts` — reference for web-specific rules (lines 99-179, 182-192, 216-244, 245-284)

### Dependent Files

- `apps/web/src/**/*.{ts,tsx}` — lint violations may need fixing
- `apps/web/src/gql/` — should be ignored by OXC (generated)

### Related ADRs

- ADR-004: Plugin Mapping Strategy
- ADR-005: Progressive Migration by App

## Deliverables

- `apps/web` lint script uses `oxlint`
- React, Next.js, JSX-a11y, import plugins active with correct rules
- JS Plugins for react-compiler, better-tailwindcss, testing-library configured
- Zero lint violations on web codebase

## Tests

- Verification:
  - [ ] `pnpm --filter @job-tracker/web run lint` exits zero with zero warnings
  - [ ] `pnpm --filter @job-tracker/web run typecheck` passes
  - [ ] `pnpm --filter @job-tracker/web run test` passes
  - [ ] React compiler rules still fire correctly via JS Plugin
  - [ ] Tailwind class ordering rules still fire via JS Plugin (or alternative)
  - [ ] `process.env` violations in web/src are still detected
- Test coverage target: N/A (infrastructure migration)
- All checks must pass

## Success Criteria

- Web lint runs entirely via OXC with equivalent or better coverage
- JS Plugins are working (react-compiler, better-tailwindcss, testing-library)
- No regressions in typecheck or test suites
- Ready for ui migration (task 05)

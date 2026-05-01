# View Model Hooks (Web) — Technical Plan

Scope id: `view-model-web-layer` (technical-only spec; product traceability via [P-101]–[P-108] below).

## Objective & acceptance (traceability)

**Objective**

- [P-101] Keep screen rendering thin by moving API-to-display data shaping out of presentational components into dedicated hooks, without changing user-visible behavior.

**In scope**

- [P-102] Apply a consistent view-model boundary for GraphQL-backed screens in `apps/web`: derived lists, formatted fields, flags for empty/loading/error presentation, and props built from query results.
- [P-103] Align refactors with the React Compiler deployment: prefer clear derived values and specialized hooks over scattering manual memoization in components.

**Out of scope**

- [P-104] Changing GraphQL schema, server behavior, or product rules for applications, companies, or compensation.
- [P-105] Introducing a global state library or cross-route client stores solely for view models.

**Acceptance criteria**

- [P-106] After refactor, users see the same labels, ordering, filters, and empty states as before for touched flows; regressions are caught by existing unit and e2e coverage where present.
- [P-107] New or moved presentation logic for API data lives in named hooks (per feature/screen) or shared pure helpers under `utils/` / `*.shared.ts`, not inlined in large page components.
- [P-108] Components that only render UI consume a small, explicit view-model surface (props or a single hook return) instead of duplicating `data?.` chains and ad hoc transforms.

## Context

Screens in `apps/web` combine Apollo query results with inline derivation: `find`/`filter`/`map`/`sort`, formatting helpers (`formatCompensationLine`, `tipTapToPlainText`, stage labels), and UI flags. That logic is harder to test and reuse when it lives inside large page or panel components.

The app targets **React Compiler** (automatic memoization of valid React components and hooks). That reduces the need for manual `useMemo` used only to avoid redundant child re-renders or stabilize object identity for referentially sensitive children.

## Goal

1. Move **API → display** transformations into **specialized hooks** (view models) colocated with the feature module (`modules/<domain>/.../hooks/` or adjacent `useXxxViewModel.ts`).
2. Keep **pure, reusable** formatters and constants in existing `utils/` and `*.shared.ts` files; view-model hooks **call** those functions rather than re-embedding logic.
3. Rely on **React Compiler** for default memoization; use **`useMemo` / `useCallback` only when there is a concrete reason** (see below).

## Scope

- `apps/web/src/modules/**` pages, panels, and route-level containers that call `use*Query` / `use*Mutation` and derive display data.
- Tests and Storybook stories that import moved helpers or hooks (update paths only; behavior unchanged).

## React Compiler and `useMemo`

| Situation                                                                                     | Guidance                                                                                                                                                      |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Derived primitives and simple objects consumed only in JSX of the same component              | Prefer **plain `const` derivations** inside the view-model hook or component. The compiler memoizes where sound.                                              |
| Expensive transformations (large sort/filter, heavy string work)                              | Optional **`useMemo`** with a comment citing **cost**, or extract to a **pure function** in `utils` and call from the hook (compiler still helps downstream). |
| Stable reference required for a **memoized child** or external API that compares by reference | Keep **`useMemo`/`useCallback`** or document why the child cannot rely on compiler guarantees.                                                                |
| Legacy `useMemo` added only to mimic old React optimization                                   | **Remove** during refactor unless one of the rows above applies.                                                                                              |

**Invariant:** Do not add `useMemo` by default when extracting a view-model hook; match team/compiler defaults and eslint rules.

## Detecting Refactor Targets

Use a repeatable inventory before large edits:

1. **Entry points:** files that import `use*Query` / `useLazyQuery` from `@/gql/hooks` or local operations.
2. **Derivation patterns:** `data?.`, `?? []`, `.find(`, `.filter(`, `.map(`, `.sort(`, and formatters applied to query fields.
3. **Split:** **Query/skip/variables** stay in the view-model hook (or a thin `useXxxQueries` if needed). **UI-only state** (modals, drafts, scroll keys) may stay in the page or a separate `useXxxUiState` if separation improves clarity.

Output of inventory: a short table per module (file → hook name → notes).

## Target Shape

- **Naming:** `useApplicationDetailsViewModel`, `useCompaniesListViewModel`, etc., or feature-scoped `useNotesPanelViewModel` when the hook backs a single major panel.
- **Return value:** A single object with stable, named fields for the screen (lists, selected entity, formatted strings, booleans for empty/error). Avoid returning raw `data` unless the view still needs it for mutations.
- **Files:** `modules/<feature>/<area>/hooks/use<Name>ViewModel.ts` (or co-located next to the page if the team prefers minimal depth—pick one convention per module and document in the PR).

## Requirements

- **R1:** View-model hooks may call Apollo hooks and pure helpers; they must not import from `app/` routes (dependency direction remains `app → modules`).
- **R2:** No change to GraphQL operations or variables except when required to fix a bug exposed by extraction (out of scope for this refactor wave unless agreed).
- **R3:** New hooks are typed from generated GraphQL types where applicable; avoid `any`.
- **R4:** Remove redundant `useMemo`/`useCallback` introduced only for manual optimization when React Compiler covers the case; retain only where **R4a** expensive work, **R4b** reference stability contract, or **R4c** eslint/compiler directive requires it.

## Execution Plan

1. **Inventory** — List `use*Query` usages under `modules/` and mark derivation-heavy files (scripted grep + spreadsheet or checklist in the PR).
2. **Pilot** — Extract one view-model hook from a representative screen (e.g. list page with search + derived list, or a details page with multiple derived fields). Validate lint, typecheck, and targeted tests.
3. **Convention note** — In the pilot PR, document hook location, naming, and the React Compiler / `useMemo` policy in the technical spec (this file) if adjustments are needed.
4. **Rollout** — Repeat per submodule (`applications/list`, `applications/details`, `companies/*`) in small PRs to ease review.
5. **Cleanup** — After each merge, drop obsolete inline `useMemo` blocks superseded by the hook + compiler.

## Risks

- **Behavior drift** if derivation order or default values (`??`) change subtly during move — mitigate with tests and side-by-side comparison in dev.
- **Over-large view models** — If a hook exceeds ~150–200 lines, split by concern (queries vs. derived lists vs. formatting).
- **Compiler assumptions** — If a build flag disables the compiler locally, performance may regress until production parity; expensive paths should remain documented.

## Guardrails

- Do not move **mutation-only** orchestration into “view model” unless it is strictly part of display preparation; keep side-effect hooks separate when clarity suffers.
- Prefer **pure functions** for any logic you want to unit test without React; hooks integrate those functions.
- **E2E / smoke:** Run relevant Playwright or manual smoke on touched routes after each batch.

## Implementation inventory (modules)

| File                                                   | Hook                             | Notes                                                                                                                         |
| ------------------------------------------------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `applications/details/page/ApplicationDetailsPage.tsx` | `useApplicationDetailsViewModel` | Apollo `useApplicationQuery` + `useApplicationStageEventsQuery`; `showInitialLoading`, `currentStage` / `currentStageReason`. |
| `applications/details/page/ApplicationNotesPage.tsx`   | same                             | `includeStageEvents: false` to avoid extra query on notes route.                                                              |
| `applications/list/page/ApplicationsPage.tsx`          | `useApplicationsListViewModel`   | Wraps `useQuickFilter` / `useCompanyFilter` + `useApplicationsQuery`.                                                         |
| `companies/list/page/CompaniesPage.tsx`                | `useCompaniesListViewModel`      | List + client search filter + scroll keys; redundant `useMemo` removed per compiler guidance.                                 |
| `companies/details/page/CompanyDetailsPage.tsx`        | `useCompanyDetailsViewModel`     | Companies list + applications by company; mutations and editor draft state remain on the page.                                |

Hook files live under `modules/<feature>/<area>/hooks/use<Name>ViewModel.ts`.

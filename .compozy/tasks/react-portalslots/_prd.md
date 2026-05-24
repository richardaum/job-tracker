# React Portal Slots — PRD

## Summary

Replace ad-hoc React context + manual `createPortal` used to lift job Match tab actions into the shared job details header with **named portal slots** via [`react-portalslots`](https://github.com/beautyfree/react-portalslots). Document the pattern in `.agents/rules/web-ui.md` so Profile (and future detail layouts) can reuse it.

## Problem

`JobDetailsLayout` and `MatchTabContent` currently coordinate header UI through:

- `JobDetailsHeaderProvider` + `JobDetailsHeaderContext`
- A DOM ref (`matchHeaderPortalElement`) and `createPortal` for the Generate/Regenerate button
- `JobDetailsHeaderMatchMenuItems` reading context to render Match items inside the Actions dropdown
- `PreferencesDialog` state owned by the layout

This couples the layout to Match-tab specifics and duplicates a pattern Profile already solves with its own context.

## Goals

1. **Job details (Fase 1):** Match tab owns its header contributions; layout only declares slot targets.
2. **Convention (Fase 2):** Document when/how to use portal slots vs inline `trailing={...}` or Radix overlays.
3. **Profile (Fase 3, optional):** Migrate `ProfileShell` to the same library after Fase 1 merges.

## Non-goals

- Changing Match analysis business logic or GraphQL contracts
- Refactoring unrelated job detail tabs
- Profile migration in the `match-improvement` worktree (separate worktree/PR)

## User stories

| As a…             | I want…                                        | So that…                                                 |
| ----------------- | ---------------------------------------------- | -------------------------------------------------------- |
| User on Match tab | Generate/Regenerate in the page header         | Primary action stays visible while scrolling tab content |
| User on Match tab | View resume / View preferences in Actions menu | Match shortcuts live with other job actions              |
| User on Match tab | Open preferences from a match item card        | Preferences dialog opens without layout-level state      |
| Developer         | A documented slot pattern                      | New detail layouts don't invent custom context providers |

## Functional requirements

### Fase 1 — Job details

1. Add `react-portalslots` to `@job-tracker/web`.
2. Define co-located slots in `job-details-header.slots.ts`:
   - `JobHeaderActions` — Generate/Regenerate button target
   - `JobActionsMenuItems` — Match section inside Actions dropdown
3. `JobDetailsLayout` wraps content in `PortalSlotsProvider` and renders `<JobHeaderActions.Slot />` + `<JobActionsMenuItems.Slot />`.
4. `MatchTabContent` fills both slots and owns `PreferencesDialog` with local `prefsOpen` state.
5. Remove obsolete provider/context/hook files and manual portal ref.
6. Update `MatchTabContent.test.tsx` to use `PortalSlotsProvider` + slot mounts.
7. Verify: targeted unit tests + manual smoke on Match tab.

### Fase 2 — Convention

8. Add section **"Header actions from nested tabs/routes"** to `.agents/rules/web-ui.md`.
9. (Optional) Add keyword index row in root `AGENTS.md`.

### Fase 3 — Profile (deferred)

10. Replace `ProfileHeaderActionsContext` with `PortalSlot('profile-header-actions')` in Profile worktree.

## Risks

| Risk                                                             | Mitigation                                                    |
| ---------------------------------------------------------------- | ------------------------------------------------------------- |
| Portaled menu items inside Radix `DropdownMenu` break focus/open | Test in browser; if broken, keep only Generate button in slot |
| Two worktrees diverge on convention                              | Document on main in Fase 2; implement per worktree            |
| New dependency in monorepo                                       | Justified by Job + Profile (2 real cases)                     |

## Success criteria

- No `JobDetailsHeaderProvider` or manual `createPortal` for job header actions
- `pnpm --filter @job-tracker/web test MatchTabContent` passes
- Manual smoke: header Generate, Actions menu items, preference click opens dialog
- Convention documented in `web-ui.md`

## Worktree / PR scope

- **Fases 1 + 2:** `match-improvement` worktree → ~1 PR
- **Fase 3:** `profile` worktree → separate small PR after merge

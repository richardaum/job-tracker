# Component Token Removal - Tasks

**Spec:** `./spec.md`  
**Design:** `./design.md`  
**Status:** Done

---

## Execution Plan

Sequential by dependency:

```
T01 -> T02 -> T03 -> T04 -> T05 -> T06
```

---

## Task Breakdown

### T01: Usage inventory and baseline evidence

**What:** Capture all current usages of component tokens and ambiguous token-utility aliases.  
**Where:** `packages/ui/src/components/**`, `packages/ui/src/tokens.css`, relevant stories/docs  
**Depends on:** none  
**Requirements:** CTR-01, CTR-05

**Done when:**

- [x] A list of every `var(--component-*)` usage exists
- [x] A list of ambiguous aliases (starting with `gap-*-gap`) exists
- [x] Baseline stories to compare post-migration were identified (`Dialog`, `DropdownMenu`, `Toast`, `Stack`, `Tokens`)

**Tests:** none  
**Gate:** evidence capture completed

---

### T02: Refactor component-local style definitions

**What:** Replace component token usages with local style choices near each component implementation.  
**Where:** At least `Dialog`, `DropdownMenu`, `Toast`, `Stack` (+ any additional hits from T01)  
**Depends on:** T01  
**Requirements:** CTR-01, CTR-03, CTR-05, CTR-06

**Done when:**

- [x] `var(--component-*)` usages are removed from component code
- [x] `Stack` spacing map no longer depends on `gap-*-gap` aliases
- [x] Local style maps/constants are readable and maintain existing component API

**Tests:** unit + visual  
**Gate:** `pnpm --filter @job-tracker/ui test`

---

### T03: Remove component token namespace from source

**What:** Delete `--component-*` definitions and any now-dead references in token files.  
**Where:** `packages/ui/src/tokens.css` (and related token wiring if needed)  
**Depends on:** T02  
**Requirements:** CTR-02, CTR-04

**Done when:**

- [x] `tokens.css` no longer defines `--component-*`
- [x] Semantic + primitive tiers remain intact and coherent
- [x] Dark mode semantic remaps continue to work

**Tests:** build  
**Gate:** `pnpm --filter @job-tracker/ui build`

---

### T04: Documentation realignment

**What:** Update design-system docs and token story to remove component-token tier guidance.  
**Where:** `.specs/features/design-system/{spec.md,design.md}`, `packages/ui/src/stories/Tokens.stories.tsx`  
**Depends on:** T03  
**Requirements:** CTR-07

**Done when:**

- [x] Docs describe two-tier token model + component-local defaults
- [x] Storybook token docs no longer teach component token tier
- [x] Any outdated wording ("semantic/component only") is corrected

**Tests:** visual/docs  
**Gate:** `pnpm --filter @job-tracker/ui test-storybook`

---

### T05: Regression verification

**What:** Validate behavior and visuals did not regress in key UI flows.  
**Where:** `packages/ui` + `apps/web` consuming surfaces  
**Depends on:** T04  
**Requirements:** CTR-06

**Done when:**

- [x] Build and tests pass
- [x] Storybook tests pass
- [ ] Quick manual check on authenticated applications screen confirms no obvious spacing/overlay regressions

**Tests:** build + unit + visual  
**Gate:** `pnpm --filter @job-tracker/ui build && pnpm --filter @job-tracker/ui test && pnpm --filter @job-tracker/ui test-storybook`

---

### T06: Cleanup and rollout notes

**What:** Final cleanup and migration notes for future contributors.  
**Where:** feature docs + optional `.notebook` gotcha note  
**Depends on:** T05  
**Requirements:** CTR-03, CTR-07

**Done when:**

- [x] Search checks confirm no component-token residues
- [x] Migration summary explains new rule of thumb for component defaults
- [x] Follow-up ideas (if any) are captured as deferred improvements

**Tests:** none  
**Gate:** peer-review ready

---

## Deferred Follow-ups

- Standardize whether semantic spacing aliases (`gap-inline-gap`, etc.) should be gradually replaced by scale-native utilities (`gap-2`, `gap-3`, etc.) outside `Stack`.
- Add a lightweight style-lint/search guard to prevent reintroducing `var(--component-*)` in component code.

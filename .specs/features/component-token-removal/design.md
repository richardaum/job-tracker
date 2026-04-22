# Component Token Removal - Design

**Spec:** `./spec.md`  
**Status:** Implemented

---

## Architecture Shift

From:

1. Primitive tokens
2. Semantic tokens
3. Component tokens

To:

1. Primitive tokens (raw values)
2. Semantic tokens (shared intent)
3. Component-local style maps (kept in component files, not global token namespace)

---

## Design Decisions

### DD-01: Remove global component-token namespace

- Delete `--component-*` tokens from `packages/ui/src/tokens.css`
- Keep overlay/backdrop and sizing decisions either:
  - in semantic tokens when broadly reusable, or
  - in local component constants when truly component-specific

### DD-02: Keep semantic tokens as cross-component contract

- Semantic color/spacing/typography tokens remain global and documented
- App-level consistency still flows through semantic naming

### DD-03: Co-locate component defaults

Each component owns its "what value do I use by default?" decision in local code:

- variant maps
- local constants
- CVA/utility composition

This gives direct code-to-value traceability during debugging.

### DD-04: Improve spacing discoverability in `Stack`

`Stack` currently maps to `gap-*-gap` aliases.  
Migration target: readable utilities with immediate scale clarity (for example `gap-2`, `gap-3`, `gap-4`, `gap-6`) while preserving semantic prop names (`inline`, `form`, `card`, `section`).

### DD-05: Documentation alignment

Design-system docs currently state "semantic + component tokens only."  
This must be updated to:

- "components consume semantic tokens and local component definitions"
- "component tokens are retired for this product architecture"

---

## Migration Strategy

1. **Inventory usage**
   - Identify all `var(--component-*)` and component-token-style utility aliases
2. **Replace by locality**
   - For each component usage, move value selection into component-local style definitions
3. **Simplify token source**
   - Remove unused component tokens from token files
4. **Align docs/tests**
   - Update token story and design-system spec references
5. **Verify parity**
   - Build, test, storybook, and spot-check key UI surfaces

---

## Risks and Mitigations

- **Risk:** Loss of consistent spacing/color semantics  
  **Mitigation:** keep semantic token contract unchanged and enforce via lint/search checks.

- **Risk:** Visual regressions in overlays (dialog/dropdown/toast sizing/backdrop)  
  **Mitigation:** dedicated story snapshots and focused visual regression checks.

- **Risk:** Drift to arbitrary values over time  
  **Mitigation:** add explicit rule in docs: local component values must still resolve to either semantic utilities or approved spacing scale values.

---

## Traceability Matrix

| Requirement | Design Response                     |
| ----------- | ----------------------------------- |
| CTR-01      | DD-01 + migration step 2            |
| CTR-02      | DD-01 + migration step 3            |
| CTR-03      | DD-03 + migration step 2            |
| CTR-04      | DD-02                               |
| CTR-05      | DD-04                               |
| CTR-06      | migration step 5 + risk mitigations |
| CTR-07      | DD-05 + migration step 4            |

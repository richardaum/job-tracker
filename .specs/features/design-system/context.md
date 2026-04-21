# Design System — Discuss Context

**Phase:** Discuss → inputs for spec.md
**Date:** 2026-04-21
**Status:** Closed — all decisions captured

---

## Decisions Captured

### DS-CTX-01: Visual Personality

**Decision:** Condensed, light, and friendly.
**Implications:**

- Tight but not cramped spacing — components breathe through typography, not padding
- Rounded corners throughout (friendly signal)
- Subtle borders and shadows — differentiate surfaces with background color, not heavy strokes
- No dense grids or data-heavy tables on mobile
- Color used for meaning, not decoration — keeps the feeling light

### DS-CTX-02: Brand Color

**Decision:** Derived from personality (DS-CTX-01) — not chosen independently.
**Direction:** The personality ("condensed + light + friendly" + Outfit's geometric character + job tracking context) points to **Indigo/Violet** range:

- Professional enough for job application context
- Modern and distinctive without being corporate-cold (avoids pure navy/blue)
- Pairs naturally with Outfit's geometric structure
- Warm enough to feel personal (it's a tool for the candidate, not for HR)
- Proposed starting point: `#4F46E5` (Indigo-600 equivalent) — to be validated visually during Visual Identity execution

### DS-CTX-03: Typography

**Decision:** **Outfit** (Google Fonts)
**Why:** Geometric, clean, structured — personality without impacting readability. More "tool-like" than DM Sans, less corporate than Inter.
**Usage:** Single font family across all text roles. Weight variation (400/500/600/700) handles all hierarchy needs.

### DS-CTX-04: Application List Pattern

**Decision:** Vertical card list as the primary pattern (mobile-first).
**Kanban:** Deferred — if introduced, desktop-only initially; mobile kanban (one column at a time) is a future consideration.
**Implications for components:** `Card` component is the primary building block for the application list. Table pattern is secondary/desktop-only.

### DS-CTX-05: Dark Mode Approach

**Decision:** Light mode first. Dark mode implemented as a second pass after all components are stable in light mode.
**Implication:** CSS variable architecture must be set up correctly from the start (semantic tokens pointing to light primitives by default), so dark mode is just a remapping — not a component rewrite.

### DS-CTX-06: Icon Library

**Decision:** **Phosphor Icons** (`@phosphor-icons/react`)
**Why:** Preferred visual style — more variety and character than Lucide or Heroicons.
**Usage:** Consistent weight across the app — recommended: `regular` for UI icons, `bold` for emphasis/primary actions.

---

## Open Items

- [ ] Brand color final validation: confirm `#4F46E5` (or nearby shade) during Visual Identity T01 execution
- [ ] Kanban layout decision: revisit when Dashboard Overview (M2) is specified

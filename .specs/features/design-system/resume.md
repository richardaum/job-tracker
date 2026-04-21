# Design System — Research Summary

**Goal:** Ground the design system spec decisions in consolidated industry techniques.

---

## Articles Researched

| #   | Title                                                                                                                                                        | Source     | Language        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | --------------- |
| 1   | [How to Build a Design System (Design Systems 102)](https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/)                          | Figma Blog | English         |
| 2   | [Design System: What It Is, Examples, and How to Create It](https://www.softdesign.com.br/blog/design-system-o-que-e-e-como-potencializa-produtos-digitais/) | Softdesign | Portuguese (BR) |
| 3   | [Design Tokens Explained (and How to Build a Design Token System)](https://www.contentful.com/blog/design-token-system/)                                     | Contentful | English         |

Raw article content: [references/](./references/)

---

## Article 1 — Figma Blog: How to Build a Design System

### Core idea

A design system is not just a component library — it is the **shared language between design and engineering**. Before building any component, you must define foundations that everything else references.

### Key techniques

**1. Define design principles first**

- Principles answer the "why" — they guide decisions in ambiguous situations
- Must be actionable: not just inspirational, but with concrete examples
- Example: "Mobile-first" is a principle that affects every layout decision

**2. Build foundations before components**

- Colors, typography, spacing, iconography, accessibility
- Foundations are the base — components only reference foundations
- Components without foundations accumulate inconsistencies rapidly

**3. Audit existing components before creating new ones**

- Map the current product: which visual patterns already exist?
- Identify duplication and divergences
- Prioritize the highest-reuse components first

**4. Documentation as a first-class citizen**

- Documenting "when to use" is as important as "how it works"
- Usage examples reduce misapplication
- Storybook: component + story + usage description + variants

**5. Color rule: 60/30/10**

- 60% neutral colors, 30% primary, 10% secondary/accent
- Applies across light and dark modes

**6. 8-point spacing base**

- Most device breakpoints are divisible by 8
- Spacing scale built on 4px/8px base unit ensures pixel-perfect consistency

---

## Article 2 — Softdesign: Design System Step by Step

### Core idea

A design system is a **product within the product** — it has a roadmap, backlog, versions, and consumers. Treating it as a product (not a task) changes how it is maintained.

### Key techniques

**1. Tokens as the contract between design and code**

- Named tokens make communication unambiguous: `color.primary.500` means the same in Figma and CSS
- Tokens eliminate magic values scattered across the codebase
- Recommended tooling: Style Dictionary (converts token JSON to CSS, iOS, Android)

**2. Token hierarchy: Primitive → Semantic → Component**

```
Primitive:   blue-500 = #3B82F6
Semantic:    color-action-primary = blue-500
Component:   button-background-default = color-action-primary
```

- Primitives: raw palette (must not be used directly in components)
- Semantics: usage intent ("primary action", "error state")
- Component: slot-specific mapping per component

**3. Atomic Design methodology**

- Atoms → Molecules → Organisms → Templates → Pages
- Guarantees modularity, reuse, and easy maintenance
- Start simple, evolve to complex — never the reverse

**4. Centralized documentation**

- One single place for tokens, components, principles, and guidelines
- Storybook is the standard for component-level documentation
- Reduces onboarding time and eliminates repeated questions

**5. Versioning and changelog**

- Design system as a versioned package (semver)
- Breaking changes in major versions — always communicated
- Consumers can pin a version and migrate at their own pace

---

## Article 3 — Contentful: Design Tokens Explained

### Core idea

**Design tokens are not CSS variables** — they are named design decisions that can be transformed into any target (CSS, iOS, Android, etc.). The distinction matters because tokens have semantics, variables do not.

### Key techniques

**1. The Three-Tier Token Architecture**

```
┌─────────────────────────────────────────────────┐
│  TIER 1: PRIMITIVE TOKENS                       │
│  "What values exist?" — raw palette             │
│  color-blue-500: #3B82F6                        │
│  space-4: 16px                                  │
└────────────────────────┬────────────────────────┘
                         │ references
┌────────────────────────▼────────────────────────┐
│  TIER 2: SEMANTIC TOKENS                        │
│  "What does it mean?" — contextual intent       │
│  color-text-primary: {color-neutral-900}        │
│  color-background-error: {color-red-50}         │
└────────────────────────┬────────────────────────┘
                         │ references
┌────────────────────────▼────────────────────────┐
│  TIER 3: COMPONENT TOKENS                       │
│  "Where is it used?" — per-slot mapping         │
│  button-bg-default: {color-action-primary}      │
│  input-border-focus: {color-brand-500}          │
└─────────────────────────────────────────────────┘
```

**2. Tokens as the source of truth for dark mode**

- Light mode: semantic tokens point to light primitives
- Dark mode: the same semantic tokens are remapped to dark primitives
- Components **do not change** — only the semantic token mapping changes
- Result: dark mode is a system property, not a per-component concern

**3. Semantic separation in practice**

- Primitives never appear in component code
- If a component uses `blue-500` directly, there is an architectural problem
- `color-action-primary` → `blue-500` → `#3B82F6` is the correct chain

**4. Modes vs Collections vs Themes**

- **Mode:** a variation of a token's value (e.g., light/dark)
- **Collection:** a group of tokens that share the same modes (e.g., color collection with light/dark modes; typography collection with no modes)
- **Theme:** a complete duplication of all token collections with different values (e.g., brand A vs brand B)

**5. Naming conventions**

- Pattern: `{category}-{property}-{variant}-{state}`
- Examples: `color-text-primary`, `color-background-hover`, `space-component-gap`
- Consistent naming reduces cognitive load across design and engineering

---

## Synthesis: Techniques Applied to Job Tracker

| Technique                                                    | Source             | How it applies                                                       |
| ------------------------------------------------------------ | ------------------ | -------------------------------------------------------------------- |
| 3-tier token architecture (primitive → semantic → component) | Contentful         | CSS variables in `tokens.css` with distinct prefixes per tier        |
| Dark mode via token remapping                                | Contentful         | `[data-theme='dark']` remaps semantics — components stay unchanged   |
| Tailwind as semantic token consumer                          | Figma              | `tailwind.config.ts` maps semantic tokens to utility classes         |
| No magic values in components                                | Softdesign         | Everything via Tailwind utilities referencing tokens                 |
| Storybook as living documentation                            | Figma + Softdesign | Token stories + component stories in `packages/ui`                   |
| Radix UI for accessible behavior                             | Figma              | Behavior primitives (dialogs, dropdowns) without imposed styles      |
| Explicit variants in components                              | Softdesign         | Props `intent`, `size`, `state` — never conditional inline styles    |
| `packages/ui` as versioned package                           | Softdesign         | Consumed by Web (v1) and Chrome Extension (v2) without duplication   |
| 8-point spacing base unit                                    | Figma              | Tailwind default spacing scale (4px base) aligns with this principle |
| Atomic Design progression                                    | Softdesign         | Tokens → primitives → base components → composed patterns            |

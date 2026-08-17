---
status: planned
created: "2026-05-09"
priority: medium
tags:
  - docs
  - ui
  - design-tokens
  - accessibility
---

# Coolors palette → UI tokens (workflow)

**Scope:** Practical workflow to move palettes from [Coolors](https://coolors.co/) into the NewJobTracker UI **without losing consistency or accessibility**. Defines semantic roles, contrast validation, export paths, rollout order for a first theme pass, surface-aware checks, and follow-on token decisions.

**Canonical code alignment:** Semantic tokens and Tailwind/CSS variables live primarily in **`packages/ui`** (**`tokens.css`**, **`theme.css`**) — see **`specs/002-technical-design-system-and-visual-identity/README.md`** (archived baseline for three-tier tokens).

---

## Motivation (**[P-135]**–**[P-139]**)

- **[P-135]** Treat a Coolors palette as **input**, not as “five HEX values pasted everywhere”: reduce to **primary (+ scale), neutrals, optional states** before shipping UI.
- **[P-136]** Assign **semantic roles** (`background`, foreground, borders, primary, muted, destructive, …) **before** implementation so components consume **tokens**, not stray literals.
- **[P-137]** **Validate contrast** on real pairs (especially text ↔ surface, labels ↔ filled controls, muted ↔ card) against agreed minimums (**[T-153]**, tooling in **[T-161]**–**[T-162]**).
- **[P-138]** Shared **palette + naming** across design libraries and repo: one export path, identical semantic labels (**[T-150]**).
- **[P-139]** Theme / token PRs reconcile **surface context** (shell vs card vs inverted overlays) with **component patterns** in **[T-157]**–**[T-160]** before merge.

---

## 1 — Create or pick a palette

- **Generate:** space to cycle suggestions, pin colors, regenerate the rest ([generate](https://coolors.co/generate)).
- **Browse** community palettes ([palettes](https://coolors.co/palettes)).
- **Extract from image** when brand reference exists ([image picker](https://coolors.co/image-picker)).

Outcome: enough colors to derive **primaries, neutrals, and optional semantic states**, not necessarily “use every swatch immediately” (**[P-135]**).

---

## 2 — Semantic roles (not loose colors)

Typical roles (map many swatches/HSL steps into fewer token names):

| Role (examples)               | Typical use                                       |
| ----------------------------- | ------------------------------------------------- |
| Primary                       | Strong CTAs, key links                            |
| Surface                       | Page / card backgrounds                           |
| Border                        | Dividers, outlines                                |
| Foreground / muted-foreground | Body text, secondary copy                         |
| State                         | Success / warning / error when product needs them |

**[T-150]** — Token names in code must match these roles (and project naming: e.g. `--background`, `--primary`, … in **`packages/ui`**).

---

## 3 — Contrast and realistic preview

- **[T-161]** [Contrast Checker](https://coolors.co/contrast-checker) for text/control pairs against chosen minimums.
- **[T-162]** [Palette Visualizer](https://coolors.co/visualizer) (or equivalent) for layout-like preview, not only a color strip.

Adjust **steps within the mapped tokens**, not by adding unrelated swatches (**[P-137]**).

---

## 4 — Export to the stack

From a saved palette, export in a format the pipeline accepts:

| Format       | Typical use                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| **CSS**      | Variables (`--name: …`) → theme file                                                                   |
| **SCSS**     | Same idea for Sass pipelines                                                                           |
| **Tailwind** | [Tailwind-oriented export](https://coolors.co/tailwind) → align with **`theme.extend`** / token bridge |

Then: **rename to repo conventions**, enforce **single SSOT** (CSS vars consumed by Tailwind/components) (**[T-150]**).

---

## 5 — Team flow

- One **shared export** or minimal kit — avoid retyping HEX per ticket (**[P-138]**).
- **Same semantic names** in design tool variables and **`packages/ui`** tokens.

---

## 6 — First theme migration (**≤ six roles**) (**[T-151]**–**[T-152]**)

**Goal:** Use the palette as **reference**, but ship only a **minimal token set** (~heavy neutrals, restrained primary).

1. Export **CSS variables** from Coolors into a scratch snippet (reference only — **palette-source**, not wholesale replace).
2. Map **at most six** palette choices to roles **A–F**:

   | Slot | Semantic role                | Typical palette pick             |
   | ---- | ---------------------------- | -------------------------------- |
   | A    | Page **`background`**        | Lightest neutral                 |
   | B    | Elevated **`card` / panels** | Neutral slightly ≠ A             |
   | C    | **`foreground`** (main text) | Highest contrast neutral         |
   | D    | **`muted-foreground`**       | Softer than C                    |
   | E    | **`border` / dividers**      | Subtle neutral / cool gray       |
   | F    | **`primary` (interaction)**  | Saturated accent, **narrow use** |

   **Rule:** Do **not** add a seventh “accent for variety” until a full primary screen reads cleanly with **A–F** alone (**[P-135]**).

3. **Single theme source** (**[T-150]**): overwrite only variables whose names already exist in the repo; paste chosen HEX/HSL into A–F; remove orphan commented colors that invite copy-paste.
4. Apply **outside → inside** (**[T-152]**): root = background + foreground only; navigation/shell stays **neutral** (primary at most active item/logo — **no** saturated full-width bars); primary button + verified **on-primary** text; secondary actions neutral/outline/muted.
5. **Mandatory contrast pass** before adding more hues: checker on page text, primary label/button, muted on surface (**[T-161]** — adjust token steps only).
6. **Expand backlog-only:** add `destructive`, `accent`, etc. **when** a component needs them; extras stay in the scratch palette until wired (**[T-151]**).
7. Repo hygiene: **`#` / `rgb(`** in JSX should tend toward **zero** outside token definitions (**[T-154]**); prefer semantic classes / vars.

Repeat for alt themes (e.g. dark): **same semantic kit**, different literal values, still one theme file per mode.

---

## 7 — Three surfaces (**[T-153]**)

Contrast depends on **where the pixel sits**. Model at least:

| Surface              | Meaning                                    | Token hint (examples)                  |
| -------------------- | ------------------------------------------ | -------------------------------------- |
| **Shell / chrome**   | Side nav, app chrome, workspace backdrop   | `*-shell`, `*-canvas-chrome`, …        |
| **Elevated surface** | Cards, main reading panels                 | `surface`, `*-raised`, …               |
| **Inverted overlay** | Tooltip, popover, dark float over light UI | `*-tooltip-*`, `foreground-on-inverse` |

**Rule:** For chips, tags, badges, inputs, dividers — ask **which parent surface** applies and run checks **on that background** (**[P-139]**, **[T-153]**).

---

## 8 — After tokens land (**[T-154]**–**[T-160]**)

- **[T-154]** Keep **anchor HEX/HSL** from export; build **50–900-style ramps** from anchors; consumer code uses **aliases**, not duplicated literals.
- **[T-155]** **Field**, **disabled**, and **list-row hover** are **different** intents — **dedicated tokens** tied to surface + expected affordance.
- **[T-156]** On **tinted shells**, “brand-tint + white” hairlines often fail [non-text contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html); add a **structural divider tier** with stronger neutrals where needed, measured on **both** sides of the line.
- **[T-163]** **Shell-context dividers** (sidebar, app chrome) need an explicit luminance check against **`bg-shell`** (≈ `#DCEFF0`, L ≈ 0.83) — picking by name alone misleads:

  | Token                                    | ≈ Hex     | L    | Ratio vs `bg-shell` | Verdict on shell               |
  | ---------------------------------------- | --------- | ---- | ------------------- | ------------------------------ |
  | `border-subtle` (yale-blue 18% in white) | `#D8DFE5` | 0.73 | **1.13 : 1**        | invisible — too washed out     |
  | `border-default` (`neutral-300`)         | `#B8C4D1` | 0.54 | **1.49 : 1**        | subtle but readable            |
  | `border-strong` (`neutral-500`)          | `#64748B` | 0.20 | 4.34 : 1            | hard rule — fragments grouping |

  Rule of thumb: aim for a divider that is a **darker, same-family variation** of the parent surface (cool slate on the cool icy-aqua shell here) rather than a paler tint, so the line gains contrast without introducing a competing hue. A pure neutral that already shares the family of **`text-primary`** (yale-blue) is the safest minimum-token choice; a dedicated **`border-shell`** token built from **`color-mix(in srgb, var(--palette-cerulean) ~28%, var(--semantic-color-bg-shell))`** is acceptable when one bare neutral is not enough across themes (still recompute the ratio per theme). Avoid `border-subtle` on tinted shells — it is intended for white/`bg-surface` contexts and degrades on shell. Concrete reference: **`apps/web/src/modules/navigation/components/Sidebar.tsx`** sits on **`bg-shell`** and uses **`border-default`** for its internal section separators (above the user card and above the bottom links).

- **[T-157]** Small label text: target **≥ 4.5 : 1** (AA body) in light mode; **pastel 50–100 + strong 500** pairs often fail — use **700–950** or **strong neutral/brand foreground** for readable labels.
- **[T-158]** **Short** brand-filled areas (filters, tabs) reusing **medium** brand + light text fail before large CTAs; use **darker pressed/brand** tokens or **dark text on lighter brand**.
- **[T-159]** On **near-white** surfaces, avoid thick **double** strong outlines; prefer **one thin low-opacity halo**; if chips disappear on `#FFF`, use a **tokenized subtle lift** fill.
- **[T-160]** **Icon triggers inside chips**: hover/focus states must resolve against **chip fill** via shared tokens — no one-off HEX in product code.

---

## Summary checklist

1. Palette in Coolors → **roles + states** planned (**[P-135]**–**[P-136]**).
2. **Contrast checker** + **visualizer** on critical pairs (**[P-137]**, **[T-161]**–**[T-162]**).
3. **Export** → normalize → **single token SSOT** (**[T-150]**).
4. **Design + repo share names** (**[P-138]**).
5. **§6 migration** capped at six colors until stable (**[T-151]**–**[T-152]**).
6. **§7 surfaces** × **§8 patterns** in theme PR review (**[P-139]**).

---

## References

Coolors: [coolors.co](https://coolors.co/), [generate](https://coolors.co/generate), [palettes](https://coolors.co/palettes), [contrast checker](https://coolors.co/contrast-checker), [visualizer](https://coolors.co/visualizer), [tailwind](https://coolors.co/tailwind).

**Traceability:** **[P-135]**–**[P-139]**; **[T-150]**–**[T-163]** (§3 tooling: **[T-161]** / **[T-162]**; §8 shell dividers: **[T-163]**).

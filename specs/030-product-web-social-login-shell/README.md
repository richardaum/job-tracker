---
status: completed
created: "2026-05-09"
priority: medium
tags:
  - web
  - auth
  - onboarding
---

# Web: social-login shell (split layout)

> **Status**: completed · **Priority**: medium · **Created**: 2026-05-09

## Motivation

The current **`/login`** surface is minimal (brand row + **`GoogleLoginButton`**). Product wants a richer **marketing-style split layout** inspired by a modern signup reference: **elevated panel** plus **glass / grid** ambiance, while staying **OAuth-first**.

This scope is **web UI + behavior parity** only: **no** email/password credentials, **no** new auth backends in phase one. Decorative content is **explicitly fake** until a later spec wires real summaries or CMS copy.

## Cross-spec context

- **`apps/web`** `src/app/login/page.tsx`: existing **`returnTo`** / **`sanitizeReturnTo`** semantics and **`window.location.assign(`${getApiBaseUrl()}/auth/google?…`)`** remain canonical (**[T-164]**).
- **`specs/029-docs-coolors-palette-to-ui-tokens/README.md`**: public login is a poster child for **token-only** color usage on mixed surfaces (**[P-143]**, **[T-166]**). No stray literals in JSX; glass layers must still meet contrast for any real text (**[P-137]** lineage).
- **`specs/024-technical-api-dev-auth-bypass/README.md`**: **`AUTH_BYPASS_ENABLED`** unchanged; shell must not assume a separate credential path.

## Product outcomes

- **[P-140]** **`/login`** on **wide** viewports reads as a **two-region** composition: (**A**) a **decorative mosaic / grid** of cards and (**B**) a **single focal panel** devoted to signing in—mirroring reference hierarchy without copying unrelated form fields.

- **[P-141]** **Authentication UX is OAuth / social-only** on this route: **no** local username/password controls in phase one.

- **[P-142]** Region **A** is populated from **deterministic fixture data** in the repo (static array or seeded shuffle that is **stable across test runs**, not random **`Math.random()`** per paint). Icons, titles, and blurbs may evoke product value but are explicitly **placeholder** (“lorem-job-tracker”), not GraphQL-backed.

- **[P-143]** Styling aligns with **`@job-tracker/ui`** semantic tokens (**`packages/ui`** theme / Tailwind `@theme`) so light/dark and brand ramps stay coherent with the rest of the app.

- **[P-144]** **Responsive:** below the chosen breakpoint (**`lg`** unless design dictates otherwise), stack into **one column** with readable order—the **social sign-in panel** remains **first/prominent**; the decorative grid **follows or collapses** so mobile users never hunt for login.

- **[P-145]** Redirect behavior is unchanged: authenticated users **`router.replace(safeReturnTo)`**; **Google** initiation preserves **`returnTo`** encoding.

### Social providers policy (phase one)

Shipping backend today exposes **Google** OAuth only. **[P-141]** permits **multiple visible provider buttons** if:

- inactive providers render **`disabled`** (or **`aria-disabled`**) with **truthful labeling** (**“Coming soon”** / vendor name)—**no** dead click that implies a backend exists, **or**

- alternatively, **only Google** is shown until a later spec registers Apple/Microsoft/GitHub/etc. (**smaller UX surface**).

Implementation chose **visible auxiliary providers rendered `disabled`** with **`title`** + **`aria-label`** honest copy (**“Coming soon”**) — cite **[T-167]** below.

## Technical plan

| ID          | Deliverable                                                                                                                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **[T-164]** | Compose the new **`/login`** layout in **`apps/web`**: reuse **`AppBrandMark`**, circular OAuth trigger (**`GoogleLogoIcon`**) wired to **`/auth/google`**, **`useAuthReturnTo`**, **`useCurrentUser`** — thin page shell + **`LoginSpotlightGrid`** / **`LoginSocialPanel`**. |
| **[T-165]** | Isolate mock tile data in **`apps/web`** (for example **`src/modules/auth/login/mockLoginSpotlightTiles.ts`**) exporting a typed **`readonly`** list consumed by grid cards—snapshot-friendly.                                                                                 |
| **[T-166]** | Implement frost /glass cards via **semantic utilities** (`bg-*`, `backdrop-blur-*`, **`border-*`**, **`shadow-*`** from tokens). Avoid HEX/RGB literals in JSX; if a gap exists, extend tokens in **`packages/ui`** in the **same change set**.                                |
| **[T-167]** | Apply the **social provider affordance rule** adopted for **[P-141]** (disabled multi-button vs Google-only)—document the choice at the PR.                                                                                                                                    |
| **[T-168]** | Update **`apps/web`** Vitest (**`login/page.test.tsx`**) for the new landmarks (decorative region + OAuth control); keep redirect tests authoritative.                                                                                                                         |

Optional follow-ups **out of scope** here: Storybook demo of the login shell (**`@job-tracker/ui`** only if primitives become reusable); Playwright screenshot of **`/login`**; replacing fixtures with **`me`-aware** teaser stats.

## Acceptance checklist

Implementation tracks these boxes in PRs (**`[ ]` → `[x]`** when shipped):

### Product (**[P-140]** … **[P-145]**)

- [x] **[P-140]** Split login shell (**grid mosaic + OAuth panel**) on **`lg+`**.
- [x] **[P-141]** No credential form; OAuth/social-first experience only.
- [x] **[P-142]** Mosaic content from **repo fixtures**, stable under test.
- [x] **[P-143]** Colors/borders/type use **semantic theme paths**, aligned with **`029`**.
- [x] **[P-144]** Mobile stack order favors **finding sign-in**.
- [x] **[P-145]** Redirect semantics unchanged (**`safeReturnTo`**, **`/auth/google`** URL).

### Web (**[T-164]** … **[T-168]**)

- [x] **[T-164]** Page wired with existing hooks + Google navigation.
- [x] **[T-165]** Mock tile module extracted and typed.
- [x] **[T-166]** Frost styling without literal color hacks in JSX (radial shell via **`globals.css`** utility using CSS vars only).
- [x] **[T-167]** Provider policy: circular **Google** live; **Facebook** / **Apple** disabled with truthful labels (**Coming soon**).
- [x] **[T-168]** Unit tests updated and green.

Traceability: **[P-140]**–**[P-145]**; **[T-164]**–**[T-168]**.

---
status: inprogress
created: "2026-05-02"
priority: medium
tags: []
---

# Chrome extension (023) — implementation companion

**Primary spec:** `README.md` in this folder (product scope, **Product decisions**).

This file holds **implementation details**, **acceptance criteria**, **validation**, and the **change log** table so the primary README stays under LeanSpec size limits.

**Greenfield:** Implementation is **not** carried forward from earlier experiments. **[T-137]** is the **first** shippable slice on the current tree; deferrals below apply until that slice is **done** on **`main`** (or the agreed integration branch), not “already satisfied” by legacy work.

## Implementation details

### Milestone — minimal testable scaffold (**[T-137]**)

**Intent:** Land **`apps/extension`** with **automated gates** plus a **manual smoke** path **before** importers, cookie bridge (**[P-119]**), or **GraphQL import** flows (**[T-138]** / **[P-124]**). Treat the repo as **starting here** until the **Acceptance criteria** · **[T-137]** checklist is satisfied end-to-end.

- **Workspace:** **`apps/extension`** (**[T-135]**, WXT + Vite) listed in **`pnpm-workspace`**; **Turbo** tasks wired (`build`, `lint`, `typecheck`; **`test`** once Vitest—or agreed equivalent—is added) so **`ci:local`/CI** can run the extension package alongside existing apps—**parity with monorepo conventions**, not a stray folder.
- **Surfaces:** **MV3 manifest** + **popup** (placeholder **`packages/ui`** or bare React OK); **service worker / background** entry **present** (**empty or ping OK**)—proof of lifecycle; **minimal** **`host_permissions`** only if needed for hello-world (avoid blanket **network**/`all_urls` grants).
- **Quality bar:** **`eslint --fix --max-warnings=0 --no-warn-ignored`** (same as root **`lint`** / lint-staged; or documented package carve-out **only if** unavoidable); **TypeScript strict** aligns with **`apps/web`** norms unless the extension template forces scoped exceptions (**document deltas**).
- **Automation:** ≥**1 non-flaky** unit/integration test (**Vitest** suggested)—e.g. pure **URL modality helper** stub, manifest JSON shape sanity, or build-time guard (**no Playwright prerequisite**).
- **Explicitly defer:** **`[P-53]` routers**, **`[P-119]`**, API **`fetch`**, **graphql-sse** wiring (**[T-138]**), side panel wizard—**after** **[T-137]** is green. **`/imports`** shell in **`apps/web`** may ship earlier (**list + detail + New run modal**, hardcoded importers); **GraphQL runs + subscriptions** (**[T-136]**) wire up when API is ready.

### Dev workflow — rebuild & extension reload

MV3 still often needs a **full extension reload** when the service worker or manifest graph changes; popup/side-panel **HMR** covers many edits but not everything.

| Mode                | Command / action                                                                                         | Output folder              | Reload behaviour                                                                                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dev (canonical)** | `pnpm --filter @job-tracker/extension run dev` (**WXT** `wxt`)                                           | **`build/chrome-mv3-dev`** | WXT + Vite **watch + extension reload + React HMR**; load **unpacked once** from **`build/chrome-mv3-dev`**. Optional: `--host` / `--port` ([WXT CLI](https://wxt.dev/guide/essentials/config/cli)). |
| **Prod-like / CI**  | `pnpm --filter @job-tracker/extension run build`                                                         | **`build/chrome-mv3`**     | Production bundle (no dev HMR). Reload the unpacked extension after **`build`** when testing prod output. Turbo **`cache: false`** on extension **`build`** keeps CI bundles fresh.                  |
| **Manual fallback** | `chrome://extensions` → **Reload**                                                                       | —                          | Use when dev reload misses (**new** entry files, some manifest changes, odd service-worker state).                                                                                                   |
| **Optional extras** | Third-party “extension reloader” extensions; scripted Chromium `--load-extension`; **web-ext** (Firefox) | —                          | Not part of the default Job Tracker workflow (**Chromium MV3** first); document here only so engineers know alternatives exist.                                                                      |

### Web · `/imports` (partial — `apps/web`)

- **No tabs:** Single page — **import runs** list + **detail** when a run is selected; **New run** opens a **modal** to choose an importer.
- **Importers (v1 stub):** **Hardcoded** registry in the web app (starts with an **empty** placeholder importer **`RemoteYeah`**). **New run** uses a **combobox** to pick a built-in importer only. **Database**-stored per-user importers (**[P-122]**) are **not wired yet** — no separate “account importers” block in the modal until the API exists.
- **Runs:** Until GraphQL + **[T-136]** land, runs may be **client-held** for UX; replace with persisted rounds and **live** updates when the backend is ready.

### Extension ↔ API transport (**[P-124]**, **[T-138]**)

- **Protocol:** **[graphql-sse](https://github.com/enisdenjo/graphql-sse)** — server streams; extension runs **[D-9]** actions and replies on the same contract (no parallel ad-hoc SSE for the same job).
- **Roles:** **Backend** orchestrates (scrape timing, tabs, sequencing, **[P-115]**). **Extension** = DOM + tabs **executor** only.
- **Web:** **`/imports`** live UI stays **subscriptions** (**[T-136]**, **D-5**) unless product explicitly unifies transports.

### Security — server-driven executor plan (**[P-124]**)

Backend-orchestrated steps (selectors, **`tab.open`**, loops, **`$tiptap`** formatters, **GraphQL-over-SSE** payloads) widen **trust**, **navigator**, **DoS**, and **data-handling** risk unless bounded. Track as:

- **[P-126]** **Navigation governance:** Resolved URLs for **`tab.open`** / templated opens MUST align with importer **allowlists** (**[P-53]** / host permissions)—deny **`javascript:`**, **`blob:`**, **`data:*html`**, **`file:`**, and other non‑HTTP(S) navigations suitable for phishing or drive‑bys unless explicitly out-of-scope and documented; normalize/validate (**origin + path prefixes**) before execution.
- **[P-127]** **Plan trust & shape:** Executable plans MUST be emitted only from trusted server paths (**authZ’d roles**, audited templates); refuse unknown **`action`** kinds and invalid payloads (**JSON Schema** or equivalent); **version** (`v` / `planVersion`) and **pin** importer capability sets so incompatible extension builds reject or no-op—not silent partial execution.
- **[P-128]** **Executor quotas:** HARD caps per run on **opened tabs**, **loop iterations**, **DOM queries**, **timeouts**, **selector result counts**, and **report payload size**—defaults documented; overrun ⇒ fail the run loudly (never unbounded churn).
- **[P-129]** **Captured content hygiene:** Outputs from **`innerHTML`** / **`$tiptap`** MUST pass through documented **sanitize / schema validation / size limits** before persistence or user-visible replay—no unchecked rich text or oversized blobs in **`New`** payloads.
- **[P-130]** **Observability & abuse:** Emit structured failure signals (**selector miss**, quota hit, denied URL) tied to **`importRunId`** server-side for support and anomaly detection—without logging raw **JD** bulk by default.

### Technical ([T-*])

- [T-132] **MV3**; `cookies`; least `host_permissions` (API/app + enumerated board URLs); parity GraphQL (**[P-80]**).
- [T-133] Reuse **`packages/ui`** aligned with **`specs/002-technical-design-system-and-visual-identity`** ([T-1]–[T-4]).
- [T-135] **`apps/extension`**, WXT + Vite.
- [T-136] **Subscriptions** powering **`/imports` live updates** (**D-5**) in **`apps/web`**—schema evolves with backend.
- [T-138] **graphql-sse** server + extension client; schema for **actions** / **results** (API work TBD).

### Integration checklist

- **GraphQL over SSE** (**[T-138]**): authenticated SW stream; **[D-9]** round-trip; align **[P-119]** **`fetch`**.
- Implement **URL router** (Type **L** vs **J**) per **[P-53]** using shared tables (tests for sample LinkedIn list vs view URLs); document each importer’s **parallel vs serialized** behaviour per **[P-115]** (default: user may overlap rounds).
- Validate **cookie + CORS + `SameSite`** across environments resembling prod.
- Enforce **`idempotencyKey`** on import creates; publish server **replay window**/storage policy; for **Type L** document whether each row gets its own key vs batch semantics.
- Treat extension `fetch` as first-class authenticated client (align CSRF / cookie policy docs).
- Store **`Source`/importer** metadata (**D-7**) and persist **job description** (or equivalent) for **`D-8` diff UI**.

### Duplicate pipeline (**D-8**) — engineer-facing

- Write-through **insert** (`New` row always). Link / flag duplicate candidates immediately after or atomically via transaction—pick in data modelling.
- **Normalize** title + company (trim, lowercase, collapse whitespace) for candidate edges.
- **Web-only** comparison wizard; extension never hosts merge UI in v1.
- **[P-119] rejects:** documented token-bridge (**B**) and hybrid (**C**) paths for archive only—**no prod secrets inside bundle**, minimal sensitive `chrome.storage`.

## Acceptance criteria

- **[T-137] Scaffold (first milestone) is DONE when:**
  - **Loads unpacked:** Extension installs via **Chrome → Extensions → Load unpacked** on supported Chromium (**MV3**) **without manifest or SW registration errors**.
  - **Popup smoke:** Opening the **popup** shows a **stable** identity string (package name **or** **`package.json`** version / build id)—proof the UI bundle runs.
  - **Background present:** **`manifest`** references a **service worker / background script** matching WXT output; **cold start** does not throw (**manual devtools check** documented in PR **or** covered by trivial messaging/ping test **if** already wired).
  - **CI gates:** From clean checkout, **`pnpm`/Turbo** tasks for **`apps/extension`** (**lint**, **typecheck**, **test**, **build**) are **wired** (`package.json` + **`turbo`**) and pass—**no orphaned package**.

- [P-110] **`New`** import succeeds for both **Type L** and **Type J** flows even when likely duplicate flagged (**[D-8]**); [P-79] payloads follow API rules.
- [P-113]; [P-61] actionable failures; **never** overwrite owned records without confirmation.
- [P-115], [T-136], [T-138], [P-121], [P-123], [P-119], [P-124], [P-126]–[P-130] as stipulated above.

## Validation

- [T-137] Scaffold: ≥**1 automated test** (**Vitest**/non-flaky) + **turbo-visible** **`lint`/`typecheck`/`test`/`build`** for **`apps/extension`**.
- [T-134] After scaffold: automated tests for happy-path creates (**Type L** batch + **Type J** single) + malformed/unsigned rejection aligning with **[P-83]** and **[P-80]**.

## Log

Canonical product narrative = **`README.md`** (**Product decisions**). Engineer-facing execution detail = this file.

| Date       | Theme               | Capsule                                                                                                                                                                                   |
| ---------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-02 | Core                | **`New`** apps; **[P-119]** cookie auth; **[P-80]** parity; **[P-120]**/`016` separation; security stance                                                                                 |
| 2026-05-02 | Web surface         | **`/imports`** single-page runs list + detail + New run modal; subs **[T-136]** when API ready; importer admin **[P-122]**; **[P-115]** runs                                              |
| 2026-05-02 | Web `/imports` UI   | Hardcoded importer seed **RemoteYeah**; DB importers stubbed; no Live/History/Importers **tabs**                                                                                          |
| 2026-05-02 | Extension chrome    | **Popup** vs **wizard side panel** (**D-2**/ **D-6**); **[P-116]** stance                                                                                                                 |
| 2026-05-02 | Boards + provenance | **D-1** seeds; **`Source`/importer** (**D-7**); **Type L vs J** URL routing (**[P-53]**)                                                                                                  |
| 2026-05-02 | Duplicate policy    | **D-8** persist → **mark** → wizard diff (**JD**) → **user resolves**                                                                                                                     |
| 2026-05-02 | Concurrency         | **Parallel import rounds** (mixed L/J) allowed; **per-source** limits when needed; **user** chooses overlap otherwise (**[P-115]**)                                                       |
| 2026-05-02 | Scaffold            | **[T-137]** minimal **MV3** extension package + turbo/CI gates + smoke load—**before** importers/**[P-119]**/**GraphQL**                                                                  |
| 2026-05-02 | Dev UX              | **Dev workflow — rebuild & extension reload:** **`dev`** vs prod **`build`**; HMR limits; manual Reload; optional third-party / scripted reload                                           |
| 2026-05-02 | Transport + roles   | **[D-9] / [P-124] / [T-138]:** backend orchestrates; extension **executor**; **graphql-sse**; web **`/imports`** **[T-136]** unless unified                                               |
| 2026-05-02 | Plan security       | **[P-126]–[P-130]:** URL/allowlist, plan validation & trust, quotas, `$tiptap`/HTML hygiene, observability                                                                                |
| 2026-05-02 | Executor            | Import-plan + low-level action **`dom.scrollIntoView`** (optional **`scrollIntoView`** options → **`Element.scrollIntoView`**)                                                            |
| 2026-05-02 | Greenfield baseline | Extension **`apps/extension`** and tied integration are **implemented from scratch**; **[T-137]** onward must be re-earned on the current codebase (see primary **`README.md`** · TL;DR). |

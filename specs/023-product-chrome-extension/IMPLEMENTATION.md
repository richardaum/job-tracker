---
status: inprogress
created: "2026-05-02"
priority: medium
tags: []
---

# Chrome extension (023) — implementation companion

**Primary spec:** `README.md` in this folder (product scope, **Product decisions**).

This file records **what the current `apps/extension` tree actually does**, **how it is structured**, **validation / quality gates**, and a **change log**. Product intent and IDs stay in the primary README.

**Greenfield baseline:** Prior experiments do not count toward **[T-137]** / **[T-138]** until acceptance here matches the **current** repo.

## Current implementation snapshot (`apps/extension`)

### Package and tooling

- **Name:** `@job-tracker/extension` (WXT **0.20.x**, Vite, React **19**, TypeScript strict).
- **Scripts:** `dev` / `build` / `package` (zip), `lint` (ESLint **+** `tsc --noEmit`), `typecheck`, `test` (Vitest **node**).
- **Dependencies:** `@job-tracker/ui`, `zod`, `p-limit`, `@tiptap/html` + `@tiptap/starter-kit` (used for **`format: "tiptap"`** on scraped fields — see **Field extraction**).
- **Turbo:** `apps/extension/turbo.json` — `build` has **`cache: false`** and depends on `^build`; build **inputs** include `apps/web/src/app/icon.svg` (icons are rasterized at build time via `sharp` in `wxt.config.ts`).

### Manifest and permissions (`wxt.config.ts`)

- **MV3**; `outDir` **`build`**, folder pattern **`chrome-mv3`** (prod) / **`chrome-mv3-dev`** (dev).
- **Permissions:** `sidePanel`, `scripting`.
- **`host_permissions`:** **`serve` (dev):** `<all_urls>` — convenient for local iteration. **`build` (prod-like):** `https://remoteyeah.com/*`, `https://*.remoteyeah.com/*` only — not yet the full **[P-53]** LinkedIn/Jack allowlist set from the primary README.

### Entrypoints (what ships today)

| Entry                            | Role                                                                                                                                                                                                                                                                                                                       |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`entrypoints/background.ts`**  | Service worker: wires **`MessagingService`**, **`PlanService`** + **`CollectJobsService`** (+ tab helper, template service, parsers). Registers **`chrome.action.onClicked`** → parses bundled **`remoteyeah.plan.json`** and **`planService.execute(plan)`**. Subscribes to **`log.event`** from pages for debug logging. |
| **`entrypoints/dom.content.ts`** | Content script: matches **`*://remoteyeah.com/*`** and **`*://*.remoteyeah.com/*`**. Registers handlers for **`jobs.list`**, **`job.details`**, **`navigate.next.page`**, **`can.navigate.next.page`**. Runs **`DomListenerService`** (list / details / pagination).                                                       |
| **`entrypoints/sidepanel/`**     | React shell loading **`SidePanel`** — component currently **`return null`** (placeholder UI only).                                                                                                                                                                                                                         |

**No dedicated popup entrypoint** is present; the toolbar **action** runs the RemoteYeah collector on click (`chrome.action.onClicked`). There is no separate “popup identity / version badge” UI yet — **see [T-137] alignment** below.

### Plan JSON and parsing

- **Schema:** Zod definitions in **`src/domains/plan/model/schema.ts`**, wired to **`LIMITS`** in **`constants.ts`** (max selectors, field counts, `parallelDetailsTabs` cap **16**, regex pattern size, etc.).
- **Steps:** **`Plan`** = `{ id: uuid, steps[] }` with **`PlanStep`** = `{ id, action }`.
- **Only supported `action.kind`:** **`collect.jobs`** — listing scrape + optional per-row detail tabs + optional **next-button** pagination.
- **Parser:** **`parsePlan` / `parseSerializedPlan`** in **`src/domains/plan/parse/parser.ts`** (`PlanSchema.parse`).
- **Fixture in use:** **`src/domains/plan/fixtures/remoteyeah.plan.json`** (imported statically from the background worker). Companion expected surface rows live in **`remoteyeah.expected.json`** (for offline HTML tests / expectations, not automatically run in CI unless extended).

### End-to-end `collect.jobs` flow

1. User clicks the extension action on a supported host; background runs **`PlanService.execute`**.
2. **`CollectJobsService`** (`src/domains/plan/services/collect-jobs.service.ts`):
   - Resolves the **surface `tabId`** via **`WxtTabService.getCurrentTab()`** (active tab in the current window) — **`input.surfaceUrl` is not yet used to open a dedicated tab** (see **TODO** in source: replace with explicit `openTab`).
   - Loops **up to `MAX_PAGES` (50)** list pages:
     - **`jobs.list`** message to **content** on the surface tab → returns **`Job[]`** rows (plain serializable **`Record<string, unknown>`**).
     - For each row, concurrently opens **detail tabs** capped by **`p-limit(min(parallelDetailsTabs, MAX_TABS))`** (**`MAX_TABS` = 20** in code; schema also caps at **16** — effective limit is **`min(plan, 16, 20)` = 16** from schema).
     - If **`detailsFields`** is empty, skips detail navigation; else reads **`detailUrl`** from **`job[detailsUrlField]`** — if missing, keeps surface row only.
     - Opens tab with **`tabManager.openTab(detailUrl)`**, **`job.details`** on that **`tabId`**, merges payloads, **`closeTab`**.
   - Dedup key: optional **`input.key`** string template (**`{{field}}`** substitutions via **`StringTemplateService`**); else falls back to trimmed detail URL else JSON stringify of row.
   - Pagination: **`can.navigate.next.page`** then **`navigate.next.page`** (content-side **next-button** strategy), **`waitUntilTabComplete`** between pages.
   - Returns a **`Map<string, Job>`** of merged jobs.
3. **`PlanService`** keeps **step outputs in memory**; steps with **`action.scope === "public"`** are exposed in the object returned from **`execute`**.

Cross-boundary payloads are **`chrome.runtime`** / **`chrome.tabs`** messages only — **`MessagingService`** envelopes (`id`, `mode`, `from` / `to`, optional `tabId`, `timestamp`, **`payload`**). Parsed with **Zod** per request kind. **`Element`** / **`Node`** exist only inside the content script implementations.

### Content script DOM services

| Service                                           | Responsibility                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`DomListenerService`**                          | Routes **`ContentActionMessage`** by `kind`.                                                                                                                                                                                                                                                                                                 |
| **`JobsListService`**                             | `querySelector(container)` → `querySelectorAll(item)`; per row, **`scrollIntoView`**, optional delay, per-field **`querySelector`** inside row — **throws** if container/items/element missing or **`validationRegex`** fails on string fields. Populates **`Job`**. **`skipDelay`** on the action skips small timer delays around row work. |
| **`JobDetailsService`**                           | **`document.querySelector`** per detail field — **skips missing elements** and **silently skips** fields that **`getFieldValue` rejects** (`try/catch` per field).                                                                                                                                                                           |
| **`PaginationService`** + **`NextButtonService`** | **Next-button** pagination: locate container + button by partial visible text match, click-or-throw for navigate; visibility check for **`can`** path.                                                                                                                                                                                       |
| **`FieldValueService`**                           | Reads **attribute** or **property** (`innerText`, `textContent`, `value`, **`innerHTML`** on details-only property fields); optional **`validationRegex`** (`RegExp` at parse + runtime); then **`FieldFormatStrategyPicker`** (**passthrough** vs **`tiptap`**) → see below.                                                                |
| **`DefaultTimerService`**                         | Short delays around DOM interactions where not skipped.                                                                                                                                                                                                                                                                                      |
| **`PopupLogService`**                             | Publishes **`log.event`** (**debug**) to **background** (name is legacy; usable from any `"content"` surface without a popup).                                                                                                                                                                                                               |

Rich-text formatting is implemented in **`field-format.strategy.ts`**: **`TiptapFieldFormatStrategy`** calls **`generateJSON`** from **`@tiptap/html`** with **`StarterKit`** — aligned with the web editor story; **`PassthroughFieldFormatStrategy`** keeps raw strings. There is **no** separate `tiptap.service.ts`; logic lives next to **`FieldValueService`**.

### Tab abstraction

- **`WxtTabService`** implements **`TabService`** (`types.ts`): **`getCurrentTab`**, **`openTab`**, **`closeTab`**, **`waitUntilTabComplete`** (**60s** timeout + `tabs.onUpdated` + poll).

---

## Developer workflow — rebuild and reload

MV3 often needs a **full extension reload** when the manifest or worker graph changes; content changes may hot-reload depending on WXT/Vite behavior.

| Mode                | Command                                          | Output folder              | Notes                                                 |
| ------------------- | ------------------------------------------------ | -------------------------- | ----------------------------------------------------- |
| **Dev**             | `pnpm --filter @job-tracker/extension run dev`   | **`build/chrome-mv3-dev`** | Load unpacked once; WXT watches and reloads.          |
| **Prod-like / CI**  | `pnpm --filter @job-tracker/extension run build` | **`build/chrome-mv3`**     | No HMR; reload extension after changing build output. |
| **Manual fallback** | `chrome://extensions` → Reload                   | —                          | Worker stuck, new entrypoints, manifest oddities.     |

Optional third-party reloaders / scripted **`--load-extension`** are outside the default workflow (**Chromium MV3 first**).

---

## Web · `/sources` (`apps/web`) — template-first surface

**Level 1** = source **templates grouped by importer** (section header per importer; **tap any template row** opens that importer in the panel). **Level 2** = **side panel** (**importer-scoped template list** on `md+`; stacked / short column on narrow viewports): each row — **See runs** (opens modal), **Actions** (**Run again**, **Schedule…** — cron + schedule-enabled stored only until server schedules). **Level 3** = **runs modal** for the chosen template (accordions, applications link, unlink, delete run). Creating the first template/run from **New template** selects that importer (**level 2** panel opens when applicable). **RemoteYeah** seed; **[T-136]** subscriptions when backend is ready. This companion does not re-verify web code on each edit — treat **`README.md`** · **Implementation companion** pointer as authoritative for product wording.

---

## Extension ↔ API transport (**[P-124]**, **[T-138]**)

**Not implemented in-tree yet.** Planned direction unchanged: **`graphql-sse`**, backend-orchestrated actions, extension as executor-only. Current extension runs a **local static plan** triggered by **`chrome.action`**, not SSE.

---

## Security — server-driven executor plan (**[P-126]**–**[P-130]**)

Still the **target** once plans stream from the backend. Today’s hazards are narrower (fixed fixture, localhost vs prod **`host_permissions`**, no authenticated `fetch` from the extension worker yet) — but **HTML scraping**, **innerHTML**, and **`tiptap` JSON generation** paths should eventually satisfy **[P-129]** (sanitize/size limits before persistence).

---

## DOM / messaging architecture vs earlier draft

The previous long **phased migration** checklist described a transition from an older “DOM root / micro-op” design. The **current** code already follows the **serializable** pattern in practice:

- **Background** never holds DOM handles; it passes **`tabId`** + **Zod-parsed actions**.
- **Content** owns **`document`** queries.
- **`collect.jobs`** is the first real **step** implementation (analogous to product “surface + details batches”).

Remaining product gaps are mostly **capabilities** (more action kinds), **opening the surface URL explicitly**, **graphql-sse**, **parity host allowlists**, and **structured error/telemetry envelopes** (**[P-126]**–**[P-130]**) rather than renaming services to match the old scaffolding doc.

---

## Integration checklist (forward-looking)

- **GraphQL over SSE** (**[T-138]**); **[P-119]** cookie bridge for SW `fetch`.
- **URL router (Type L / J)** per **[P-53]** and documented **[P-115]** concurrency per importer.
- **Popup / side panel UX** per **D-2** / **D-6** (today: **action click** + **empty side panel**).
- **Idempotency** and duplicate pipeline (**[D-8]**); web wizard remains web-only.

---

## Acceptance criteria (**[T-137]** alignment)

What is **true today:**

- **Loads unpacked** on Chromium MV3 from **`build/chrome-mv3-dev`** / **`chrome-mv3`** without manifest or registration errors (**subject to fixing any local Chromium policy issues**).
- **Background worker** runs (`defineBackground`), installs **`onInstalled`** log line, **`CollectJobsService` + messaging** exercised when the user triggers the flow.
- **CI / monorepo gates:** `lint`, `typecheck`, `test`, `build` are defined on the extension package and participate in **`pnpm`/Turbo** like other apps.

**Gaps vs written [T-137] scaffold bullet list:**

- **Popup smoke with package name / version**: **not implemented** — there is **no popup entrypoint**; version is visible via **Chrome extension details** or **`manifest.version`** (`package.json` **0.0.3**) but **not** in a toolbar popup UI.

Track either a small **toolbar popup React entry** or redefine [T-137] smoke as **sidebar + console / extension management** — until then treat popup UI as **outstanding**.

Broader README criteria (**[P-110]** onward): still future; depend on API, routing, and SSE.

---

## Validation

- **Vitest:** `src/**/*.test.ts` (node). Current coverage includes **`field-value.service.test.ts`** (passthrough vs **`tiptap`** JSON, unknown format error).
- **`passWithNoTests: true`** on the package — add tests as flows stabilize (collect loop, messaging, pagination).

---

## Technical ([T-*]) — reminder

- [T-132] MV3; cookies; least `host_permissions` — **partially** (RemoteYeah-only in prod build config).
- [T-135] `apps/extension` WXT + Vite — **done**.
- [T-136] Web subscriptions for `/sources` — **web/API**.
- [T-138] graphql-sse — **not started** in extension.

---

## Log

Canonical product narrative = **`README.md`**. Engineer-facing **current-behaviour** detail = **this file**.

| Date       | Theme                    | Capsule                                                                                                                                                                             |
| ---------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-02 | Core                     | **`New`** apps; **[P-119]** cookie auth; **[P-80]** parity; **[P-120]**/`016` separation; security stance                                                                           |
| 2026-05-09 | Web `/sources` UX        | **New template** CTA; template **Actions** menu; schedule in modal; list without duplicate importer headings                                                                        |
| 2026-05-02 | Web surface              | **`/sources`** single-page runs list + detail + New run modal; subs **[T-136]** when API ready; importer admin **[P-122]**                                                          |
| 2026-05-02 | Web `/sources` UI        | Hardcoded importer seed **RemoteYeah**; no Live/History/Importers **tabs**                                                                                                          |
| 2026-05-02 | Extension chrome         | **Popup** vs **wizard side panel** (**D-2**/ **D-6**); **[P-116]** stance                                                                                                           |
| 2026-05-02 | Boards + provenance      | **D-1** seeds; **`Source`/importer** (**D-7**); **Type L vs J** URL routing (**[P-53]**)                                                                                            |
| 2026-05-02 | Duplicate policy         | **D-8** persist → **mark** → wizard diff (**JD**) → **user resolves**                                                                                                               |
| 2026-05-02 | Concurrency              | **Parallel source rounds** (**[P-115]**)                                                                                                                                            |
| 2026-05-02 | Scaffold                 | **[T-137]** minimal **MV3** package + turbo/CI gates — **before** full boards / **[P-119]** / GraphQL                                                                               |
| 2026-05-02 | Dev UX                   | **Dev** vs **`build`**; HMR limits; manual Reload                                                                                                                                   |
| 2026-05-02 | Transport + roles        | **[D-9] / [P-124] / [T-138]:** backend orchestrates; extension executor; **graphql-sse**                                                                                            |
| 2026-05-02 | Plan security            | **[P-126]**–**[P-130]:** URL/allowlist, plan validation, quotas, HTML hygiene, observability                                                                                        |
| 2026-05-02 | Greenfield baseline      | Extension **`apps/extension`** implemented from scratch on this tree; **[T-137]** must match **current** checkout                                                                   |
| 2026-05-04 | Plan mapping ownership   | Field mapping stays in plan-shaped config; DOM execution in content script                                                                                                          |
| 2026-05-04 | DOM runtime messaging    | Typed requests to **`dom.content.ts`** instead of `executeScript` batching in the service layer                                                                                     |
| 2026-05-05 | Implementation companion | Rewrote **`IMPLEMENTATION.md`** to describe **actual** architecture: **`collect.jobs`**, messaging, tab limits, **TipTap** format module, **no popup**; **[T-137]** gaps called out |

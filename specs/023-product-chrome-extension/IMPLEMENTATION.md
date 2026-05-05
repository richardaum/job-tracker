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

### DOM serialization boundary (extension executor)

This section defines the extension-side implementation direction for `dom` used by the plan flows (`list.map.surface`, `list.map.details`).

- **No DOM object across boundaries:** Service communication across `plan`, `dom`, `tab`, `timer`, and `tiptap` MUST exchange only serializable payloads. `Element` / `HTMLElement` / `Node` are internal implementation details inside the executor runtime and MUST NOT be part of public service contracts.
- **No persisted DOM context:** Public `dom` contracts MUST NOT expose or persist mutable DOM root handles across calls (no `root`/`queryRoot` push-pop API). Per-call execution context MUST be represented by serializable identifiers only (for example `tabId`, optional `frameId`).
- **`field` ownership in `plan`:** Field mapping/normalization belongs to `plan` (for example `FieldMappingService` under plan services/mappers), not `dom`. `dom` is responsible only for runtime page interaction/extraction execution.
- **No finder fallback:** `@medv/finder` is explicitly out of scope for v1 execution design (including fallback). The architecture MUST NOT rely on generated selectors to re-identify nodes between calls.
- **Batch execution model:** `dom` executes each plan step in one high-level command ("surface batch", "details batch"), instead of exposing micro-operations (query/wait/pick field) as cross-service calls.
- **Service flow (high-level):**
  - `PlanService` orchestrates steps and stores step outputs.
  - `PlanStepRunner` dispatches step action kind.
  - `ListMapSurfaceService` requests one surface batch from `DomExecutorService`, then delegates mapped output shaping to a plan-owned field mapper.
  - `ListMapDetailsService` opens detail tab(s), requests one details batch per item URL, delegates mapped output shaping to a plan-owned field mapper, merges when configured, then closes tab(s).
  - `DomExecutorService` is the sole boundary into runtime DOM access (`direct` or `chrome.scripting` implementation hidden behind the same interface).
  - `FieldMappingService` (owned by `plan`) and `TiptapService` transform already-serialized extraction results (including rich text conversion where requested).
- **Tab context handling:** `tab` integration remains explicit (`openTab`, `closeTab`), and context crossing service boundaries is represented only as serializable execution context identifiers (for example `tabId`), never DOM roots.
- **Error and observability contract:** Batch responses SHOULD include structured failure and telemetry signals (`selector miss`, timeout, quotas/limits, counts, duration, payload size), aligned with [P-126]–[P-130].

#### Acceptance addendum — DOM serialization boundary

- Public service contracts used by plan execution contain no raw DOM object references.
- `list.map.surface` runs as one batch DOM command and returns serializable row payloads.
- `list.map.details` runs as one batch DOM command per detail URL and returns serializable payloads (merged with source row when configured).
- The extension execution path does not use `@medv/finder`.
- Regression tests cover selector miss/timeout and missing detail URL behavior in this batched architecture.

#### Operational rollout checklist (phased)

The rollout below is progressive by design. Automated tests are intentionally deferred to the final phase; until then, keep build/typecheck/lint green and preserve runtime behavior.

**Phase 0 — Preparation and guardrails**

- [ ] Add/confirm migration notes in extension domain services to indicate dual-path transition (legacy DOM API -> batch executor API).
- [ ] Confirm that `023` implementation direction is the active source of truth for this migration.
- [ ] Keep current flow functional while introducing new boundary.

**Done when**

- [ ] Team can identify old vs new execution path without ambiguity.
- [ ] No runtime behavior changed yet; only migration scaffolding/documentation guardrails are in place.

**Phase 1 — Serializable `dom` boundary (new public contract)**

- [ ] Introduce a new high-level `dom` executor contract for step batches (surface/details) and tab context attachment.
- [ ] Remove persisted root APIs from public contracts (`setQueryRoot`, `clearQueryRoot`, and equivalents).
- [ ] Keep legacy `dom` contract temporarily available for compatibility during migration.
- [ ] Ensure the new contract exposes only serializable inputs/outputs.

**Done when**

- [ ] New `dom` contract is callable from plan-layer services.
- [ ] Public contract surface exports no `Element` / `HTMLElement` / `Node`.
- [ ] Public contract surface exposes no persisted DOM root/query-root handle API.
- [ ] No consumer is forced to migrate in the same commit (dual-path period active).

**Phase 2 — `direct-dom` implementation on the new contract**

- [ ] Implement the new batch-oriented executor in `direct-dom`.
- [ ] Keep `chrome-scripting-dom` aligned with the same new contract shape (stub/minimal behavior accepted at this stage).
- [ ] Keep internals free to use DOM objects inside implementation only.

**Done when**

- [ ] `direct-dom` can execute high-level surface/details commands through the new boundary.
- [ ] `chrome-scripting-dom` compiles against the same contract.
- [ ] No DOM object escapes implementation internals.

**Phase 3 — Migrate `list.map.surface` flow**

- [ ] Refactor `ListMapSurfaceService` to call one surface batch command.
- [ ] Replace per-field DOM picking calls with serialized batch result mapping.
- [ ] Keep output shape compatible with existing step memory expectations.

**Done when**

- [ ] Surface flow no longer depends on `querySelector`/`querySelectorAll` across service boundaries.
- [ ] Surface result remains consumable by downstream steps without extra adapters.
- [ ] Manual validation confirms expected row extraction behavior remains stable.

**Phase 4 — Migrate `list.map.details` flow**

- [ ] Refactor `ListMapDetailsService` to call one details batch command per detail URL.
- [ ] Preserve existing semantics for missing URL and `mergeWithItem`.
- [ ] Remove public reliance on query-scope push/pop semantics tied to DOM roots; pass only serializable execution context identifiers to `dom` calls.

**Done when**

- [ ] Details flow no longer passes DOM roots/objects through service boundaries.
- [ ] Details flow no longer depends on `TabManager.getTabRoot` or equivalent DOM-root handoff.
- [ ] Merge and empty-row behavior match previous functional expectations.
- [ ] Manual validation confirms detail extraction + merge behavior across representative pages.

**Phase 5 — plan-owned field mapping + legacy cleanup**

- [ ] Move/define field mapping as a `plan` concern (service or mapper), replacing the old DOM-picking role.
- [ ] Keep field mapping operating on serialized batch results only (including TipTap conversion handling).
- [ ] Remove direct `field -> dom` dependency from public flow.
- [ ] Remove legacy DOM-oriented methods from `dom` public contract once all consumers are migrated.

**Done when**

- [ ] Field mapping is owned by `plan` and operates on serialized extraction payloads only.
- [ ] Plan execution path has no dependency on DOM-oriented legacy methods.
- [ ] Public extension execution path (`plan` orchestrates mapping; `dom` executes extraction) is fully serializable end-to-end.

**Phase 6 — Observability and failure semantics**

- [ ] Add structured batch metadata and failure signaling (`selector miss`, timeout, quota/limit hit, counts, duration).
- [ ] Standardize error envelopes consumed by plan-layer services.
- [ ] Keep telemetry aligned with [P-126]–[P-130] enforcement intent.

**Done when**

- [ ] Surface/details failures are diagnosable without raw DOM object logging.
- [ ] Plan-layer services can branch on structured failures predictably.
- [ ] Basic operator visibility exists for runtime troubleshooting.

**Phase 7 — Tests (final phase by decision)**

- [ ] Add/refresh tests for migrated surface/details flows in batched architecture.
- [ ] Cover at minimum: selector miss, timeout, missing detail URL, merge on/off, serialized output guarantees.
- [ ] Remove any temporary migration-only shims not required post-migration.

**Done when**

- [ ] Test suite assertions validate batched serializable contract behavior.
- [ ] No production execution path depends on temporary migration shims.
- [ ] Migration can be considered complete for `dom` boundary objectives in this spec.

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

| Date       | Theme                  | Capsule                                                                                                                                                                                   |
| ---------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-02 | Core                   | **`New`** apps; **[P-119]** cookie auth; **[P-80]** parity; **[P-120]**/`016` separation; security stance                                                                                 |
| 2026-05-02 | Web surface            | **`/imports`** single-page runs list + detail + New run modal; subs **[T-136]** when API ready; importer admin **[P-122]**; **[P-115]** runs                                              |
| 2026-05-02 | Web `/imports` UI      | Hardcoded importer seed **RemoteYeah**; DB importers stubbed; no Live/History/Importers **tabs**                                                                                          |
| 2026-05-02 | Extension chrome       | **Popup** vs **wizard side panel** (**D-2**/ **D-6**); **[P-116]** stance                                                                                                                 |
| 2026-05-02 | Boards + provenance    | **D-1** seeds; **`Source`/importer** (**D-7**); **Type L vs J** URL routing (**[P-53]**)                                                                                                  |
| 2026-05-02 | Duplicate policy       | **D-8** persist → **mark** → wizard diff (**JD**) → **user resolves**                                                                                                                     |
| 2026-05-02 | Concurrency            | **Parallel import rounds** (mixed L/J) allowed; **per-source** limits when needed; **user** chooses overlap otherwise (**[P-115]**)                                                       |
| 2026-05-02 | Scaffold               | **[T-137]** minimal **MV3** extension package + turbo/CI gates + smoke load—**before** importers/**[P-119]**/**GraphQL**                                                                  |
| 2026-05-02 | Dev UX                 | **Dev workflow — rebuild & extension reload:** **`dev`** vs prod **`build`**; HMR limits; manual Reload; optional third-party / scripted reload                                           |
| 2026-05-02 | Transport + roles      | **[D-9] / [P-124] / [T-138]:** backend orchestrates; extension **executor**; **graphql-sse**; web **`/imports`** **[T-136]** unless unified                                               |
| 2026-05-02 | Plan security          | **[P-126]–[P-130]:** URL/allowlist, plan validation & trust, quotas, `$tiptap`/HTML hygiene, observability                                                                                |
| 2026-05-02 | Executor               | Import-plan + low-level action **`dom.scrollIntoView`** (optional **`scrollIntoView`** options → **`Element.scrollIntoView`**)                                                            |
| 2026-05-02 | Greenfield baseline    | Extension **`apps/extension`** and tied integration are **implemented from scratch**; **[T-137]** onward must be re-earned on the current codebase (see primary **`README.md`** · TL;DR). |
| 2026-05-04 | Plan mapping ownership | Field mapping/normalization is explicitly a **`plan`** responsibility (plan-owned mapper/service), while **`dom`** is restricted to runtime page execution/extraction only.               |
| 2026-05-04 | DOM runtime messaging  | `WxtDomService` now sends typed DOM batch commands to a dedicated content-script runtime (`dom.content.ts`), replacing direct `executeScript` batch execution in the service layer.       |

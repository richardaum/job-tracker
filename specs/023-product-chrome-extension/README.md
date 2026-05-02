---
status: inprogress
created: "2026-05-02"
priority: medium
tags: []
---

# Product scope: chrome-extension

## TL;DR

- **Stack:** MV3 extension in **`apps/extension`** (Vite + Plasmo, `packages/ui`).
- **Boards (**D-1**):** **LinkedIn**, **Jack**, **RemoteYeah** → capture into **`New`** applications.
- **Auth:** Logged-in users only; **zero** extra connect step (**[P-123]**); cookie read **[P-119]** on service-worker GraphQL **`fetch`**.
- **API:** Same **GraphQL** as web (**[P-80]**); **`idempotencyKey`** on create mutations (**D-3**).
- **Modality:** **`Source` + URL** → **list page** vs **single-job deeplink** (**Type L** / **Type J**—see **Product decisions**).
- **Extension UX:** **Popup** + side-panel **mapping wizard** (**D-2**, **D-6**); no third-party DOM injection (**[P-116]**); **latest import round** in popup.
- **Backend ↔ extension transport:** **GraphQL over SSE** using **[graphql-sse](https://github.com/enisdenjo/graphql-sse)** (**[P-124]**, **[T-138]**): the **backend orchestrates**; the extension is a **mere executor** that applies **request actions** from the stream and **returns results** on the same GraphQL-over-SSE contract.
- **Web:** **`/imports`** — **single page** (**D-4**): list of **import runs**, **detail** on selection, **New run** opens importer picker; **live UI** via GraphQL **subscriptions** (**D-5**, **[T-136]**) when wired (separate surface from the extension SSE channel unless later unified).
- **Concurrency (**[P-115]**):** **Type L**/**Type J** runs MAY **overlap** unless an **importer** restricts—otherwise **user** chooses parallelism.
- **Duplicates (**D-8**):** Always **persist** + **mark** (normalized title + company); **web** wizard (**job-description** diff); user **deletes or keeps**.
- **First milestone (**[T-137]**):** Minimal **testable** **`apps/extension`** scaffold (**Implementation details**)—before boards / **GraphQL-over-SSE** (**[T-138]**) / **[P-119]**.
- **Out of scope:** Guest extension, **016** extension spec, REST import, shared importers v1, request-body HMAC beyond parity.

**Traceability:** [P-53], [P-109]–[P-124]; [T-132]–[T-138].

## Objective

- [P-109] Deliver extension-assisted capture from supported boards into **`New`** applications with import summaries in both extension and web (not draft-and-confirm).

## In scope (by ID)

- [P-53], [P-114], [P-115], [P-116], [P-109], [P-124]; detail under **Product decisions** and **Implementation details** · **Extension ↔ API transport**.

## Out of scope

- [P-111], [P-112]; [P-117] in-extension **per-field** review (edit afterward in web).
- [P-118]: **blocking** an import due to suspected duplicate, **silent auto-merge**, or **silent delete** without explicit user consent (versus **Product decisions**: **always persist + mark + web wizard triage**, which **is** in scope).
- Guest extension onboarding; **[P-81]** on this path; **`specs/016-*`** defining extension behaviour (**[P-120]**); cross-user importer sharing in v1 (**[P-122]**); parallel REST (**[P-121]**); auth paths **[P-119] B/C**; **`/imports`** live UI **without** subscriptions (**[T-136]**); HMAC-signed HTTP body beyond parity.

## Product decisions (agreed)

**D-1–D-8** resolved 2026-05-02; **D-9** (GraphQL over SSE + backend-orchestrated executor) added 2026-05-02; embodied below.

- [P-114] Authenticated users only; no guest extension flow.
- [P-53] **Allowlist (**D-1**):** **LinkedIn**, **Jack**, **RemoteYeah** — bind **`host_permissions` / URL path matchers** during implementation. **Learning:** importer inference plus **side-panel wizard** (**D-6**) without injecting UI on board pages. **Import modality** (choose extractors + UX for a run) is **determined from `Source` + active tab URL** (and importer config):
  - **Type L — listing / feed page:** the board presents **many** jobs on one document; one user-triggered **round** imports **multiple** items (each becomes its own **`New`** application unless user narrows selection—selection UX TBD), with **duplicate marking ([D-8]) per saved row**. Examples: **[LinkedIn Jobs search](https://www.linkedin.com/jobs/search)**-style hubs (exact path prefixes per importer).
  - **Type J — single-job deeplink:** URL targets **one** posting (`…/jobs/view/{id}`-style routes differ per vendor); ordinarily **one** application per capture, possibly different field layout than Type L cards. Example pattern: **`https://www.linkedin.com/jobs/view/4404223259`** for LinkedIn (**not** exhaustive—finalize patterns in importer tables).
  - Importers MAY define **overlap** URLs; **routing rules** MUST be deterministic and documented next to **`host_permissions`**. Type L rounds may emit **fine-grained subscription / run progress** events for **N** children creations (**[P-115]**, **[T-136]**).
- [P-121] **GraphQL parity** — no standalone REST import API.
- **[D-7] Provenance:** `Source` (+ importer linkage as **schema.gql** allows).
- [P-122] **Per-user importers** in backend; web list (**validation**, enable/disable); v1 **no** community sharing.
- [P-123] Existing browser login ⇒ **zero** extra linking UX for extension.
- [P-119] **Cookie read (`chrome.cookies`)** → **`Cookie`** header from service-worker `fetch` (API/app hosts + board hosts once enumerated).
- [P-109] Create applications as **`New`** — **no import draft** step.
- [P-115] **Extension:** surface **latest import round** until the next begins (**[P-53]** Type L rounds may aggregate **many** job creates; Type J typically **one**). Persist **runs/rounds** server-side (`run` SHOULD record modality + counts). **Concurrent runs:** Multiple rounds—any mix of **Type L** / **Type J**—MAY run **in parallel**; an importer/source MAY **restrict** parallelism (single-flight, throttling—document next to importer rules); where no such restriction applies, **overlapping** rounds is **the user’s choice**. **Web `/imports` (**D-4**): **no tabs** — one view with a **list of runs** (running + recent), **detail pane** when a run is selected, and **New run** opening a **modal** to pick an **importer** (see **Implementation details** · Web). **Live** updates via thin subscription (**[T-136]** / **D-5**) when backend is connected. Expose **`idempotencyKey`** on import-related creates (**D-3**)—scope **one key per persisted application seed\*\* when batching Type L unless API defines a batch key contract.
- [P-116] **Popup** (**D-2**) for primary actions; **side-panel wizard** (**D-6**) for mapping flows; **no** third-party page injection.
- [P-117] **No** in-extension detailed field review (**D-8 triage stays on web**).
- [P-118] Always **persist** each import (**never block** suspected duplicates). **Mark** candidate dup groups (**normalized title + company**). User resolves via **web wizard** (job-description diff + optional other fields)—**delete surplus** rows or **keep all**. Automated merge/delete without confirmation ⇒ **still out**.
- **[P-80] Extension v1:** session + validated schema + idempotency (**no dedicated body-signature scheme**).
- [P-120] Chrome-extension requirements live **only** in **023**; **`specs/016-*`** excludes extension scope entirely.
- **[D-9] / [P-124] Backend-orchestrated extension, GraphQL over SSE:** Import **logic stays on the server**. The extension holds **GraphQL over SSE** ([**graphql-sse**](https://github.com/enisdenjo/graphql-sse)), **executes** **request actions** from the stream, and **returns** **results**. **Executor (v1):** **selectors**; **open / list / close** tabs; **interact**, **focus**, **type** into elements. More actions via schema evolution; **business rules** server-side.

## Implementation details

### Milestone — minimal testable scaffold (**[T-137]**)

**Intent:** Land **`apps/extension`** with **automated gates** plus a **manual smoke** path **before** importers, cookie bridge (**[P-119]**), or **GraphQL import** flows (**[T-138]** / **[P-124]**).

- **Workspace:** **`apps/extension`** (**[T-135]**, Plasmo + Vite) listed in **`pnpm-workspace`**; **Turbo** tasks wired (`build`, `lint`, `typecheck`; **`test`** once Vitest—or agreed equivalent—is added) so **`ci:local`/CI** can run the extension package alongside existing apps—**parity with monorepo conventions**, not a stray folder.
- **Surfaces:** **MV3 manifest** + **popup** (placeholder **`packages/ui`** or bare React OK); **service worker / background** entry **present** (**empty or ping OK**)—proof of lifecycle; **minimal** **`host_permissions`** only if needed for hello-world (avoid blanket **network**/`all_urls` grants).
- **Quality bar:** **`eslint --fix --max-warnings=0 --no-warn-ignored`** (same as root **`lint`** / lint-staged; or documented package carve-out **only if** unavoidable); **TypeScript strict** aligns with **`apps/web`** norms unless Plasmo template forces scoped exceptions (**document deltas**).
- **Automation:** ≥**1 non-flaky** unit/integration test (**Vitest** suggested)—e.g. pure **URL modality helper** stub, manifest JSON shape sanity, or build-time guard (**no Playwright prerequisite**).
- **Explicitly defer:** **`[P-53]` routers**, **`[P-119]`**, API **`fetch`**, **graphql-sse** wiring (**[T-138]**), side panel wizard—**after** **[T-137]** is green. **`/imports`** shell in **`apps/web`** may ship earlier (**list + detail + New run modal**, hardcoded importers); **GraphQL runs + subscriptions** (**[T-136]**) wire up when API is ready.

### Dev workflow — rebuild & extension reload

MV3 still often needs a **full extension reload** when the service worker or manifest graph changes; popup/side-panel **HMR** covers many edits but not everything.

| Mode                | Command / action                                                                                         | Output folder               | Reload behaviour                                                                                                                                                                                                                                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dev (canonical)** | `pnpm --filter @job-tracker/extension run dev` (**Plasmo** `plasmo dev`)                                 | **`build/chrome-mv3-dev`**  | Plasmo runs a dev server with **watch + live reload + React HMR**; load **unpacked once** from **`build/chrome-mv3-dev`**. Dev installs show a **DEV \|** name prefix and grayscale icon (Plasmo defaults). Optional: `--serve-host` / `--serve-port`, `--hmr-host` / `--hmr-port` ([Plasmo dev](https://docs.plasmo.com/framework/workflows/dev)). |
| **Prod-like / CI**  | `pnpm --filter @job-tracker/extension run build`                                                         | **`build/chrome-mv3-prod`** | No HMR: after each build, hit **Reload** (⟳) on `chrome://extensions` for the unpacked folder. Package **`build`** uses Turbo **`cache: false`** so monorepo **`build`** always runs a fresh Plasmo production bundle.                                                                                                                              |
| **Manual fallback** | `chrome://extensions` → **Reload**                                                                       | —                           | Use when HMR misses (**new** entry files, some manifest changes, odd SW state); Plasmo/GitHub issues occasionally report “edit existing file OK, new file needs reload”.                                                                                                                                                                            |
| **Optional extras** | Third-party “extension reloader” extensions; scripted Chromium `--load-extension`; **web-ext** (Firefox) | —                           | Not part of the default Job Tracker workflow (**Chromium MV3** first); document here only so engineers know alternatives exist.                                                                                                                                                                                                                     |

### Web · `/imports` (partial — `apps/web`)

- **No tabs:** Single page — **import runs** list + **detail** when a run is selected; **New run** opens a **modal** to choose an importer.
- **Importers (v1 stub):** **Hardcoded** registry in the web app (starts with an **empty** placeholder importer **`RemoteYeah`**). **New run** uses a **combobox** to pick a built-in importer only. **Database**-stored per-user importers (**[P-122]**) are **not wired yet** — no separate “account importers” block in the modal until the API exists.
- **Runs:** Until GraphQL + **[T-136]** land, runs may be **client-held** for UX; replace with persisted rounds and **live** updates when the backend is ready.

### Extension ↔ API transport (**[P-124]**, **[T-138]**)

- **Protocol:** **[graphql-sse](https://github.com/enisdenjo/graphql-sse)** — server streams; extension runs **[D-9]** actions and replies on the same contract (no parallel ad-hoc SSE for the same job).
- **Roles:** **Backend** orchestrates (scrape timing, tabs, sequencing, **[P-115]**). **Extension** = DOM + tabs **executor** only.
- **Web:** **`/imports`** live UI stays **subscriptions** (**[T-136]**, **D-5**) unless product explicitly unifies transports.

### Technical ([T-*])

- [T-132] **MV3**; `cookies`; least `host_permissions` (API/app + enumerated board URLs); parity GraphQL (**[P-80]**).
- [T-133] Reuse **`packages/ui`** aligned with **`specs/002-technical-design-system-and-visual-identity`** ([T-1]–[T-4]).
- [T-135] **`apps/extension`**, Vite + Plasmo.
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
  - **Background present:** **`manifest`** references a **service worker / background script** matching Plasmo output; **cold start** does not throw (**manual devtools check** documented in PR **or** covered by trivial messaging/ping test **if** already wired).
  - **CI gates:** From clean checkout, **`pnpm`/Turbo** tasks for **`apps/extension`** (**lint**, **typecheck**, **test**, **build**) are **wired** (`package.json` + **`turbo`**) and pass—**no orphaned package**.

- [P-110] **`New`** import succeeds for both **Type L** and **Type J** flows even when likely duplicate flagged (**[D-8]**); [P-79] payloads follow API rules.
- [P-113]; [P-61] actionable failures; **never** overwrite owned records without confirmation.
- [P-115], [T-136], [T-138], [P-121], [P-123], [P-119], [P-124] as stipulated above.

## Validation

- [T-137] Scaffold: ≥**1 automated test** (**Vitest**/non-flaky) + **turbo-visible** **`lint`/`typecheck`/`test`/`build`** for **`apps/extension`**.
- [T-134] After scaffold: automated tests for happy-path creates (**Type L** batch + **Type J** single) + malformed/unsigned rejection aligning with **[P-83]** and **[P-80]**.

## Log

Canonical text = **Product decisions** + **Implementation details** above.

| Date       | Theme               | Capsule                                                                                                                                                |
| ---------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-05-02 | Core                | **`New`** apps; **[P-119]** cookie auth; **[P-80]** parity; **[P-120]**/`016` separation; security stance                                              |
| 2026-05-02 | Web surface         | **`/imports`** single-page runs list + detail + New run modal; subs **[T-136]** when API ready; importer admin **[P-122]**; **[P-115]** runs           |
| 2026-05-02 | Web `/imports` UI   | Hardcoded importer seed **RemoteYeah**; DB importers stubbed; no Live/History/Importers **tabs**                                                       |
| 2026-05-02 | Extension chrome    | **Popup** vs **wizard side panel** (**D-2**/ **D-6**); **[P-116]** stance                                                                              |
| 2026-05-02 | Boards + provenance | **D-1** seeds; **`Source`/importer** (**D-7**); **Type L vs J** URL routing (**[P-53]**)                                                               |
| 2026-05-02 | Duplicate policy    | **D-8** persist → **mark** → wizard diff (**JD**) → **user resolves**                                                                                  |
| 2026-05-02 | Concurrency         | **Parallel import rounds** (mixed L/J) allowed; **per-source** limits when needed; **user** chooses overlap otherwise (**[P-115]**)                    |
| 2026-05-02 | Scaffold            | **[T-137]** minimal **MV3 Plasmo** package + turbo/CI gates + smoke load—**before** importers/**[P-119]**/**GraphQL**                                  |
| 2026-05-02 | Dev UX              | **Dev workflow — rebuild & extension reload:** Plasmo **`dev`** vs prod **`build`**; HMR limits; manual Reload; optional third-party / scripted reload |
| 2026-05-02 | Transport + roles   | **[D-9] / [P-124] / [T-138]:** backend orchestrates; extension **executor**; **graphql-sse**; web **`/imports`** **[T-136]** unless unified            |

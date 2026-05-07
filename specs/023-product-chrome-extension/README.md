---
status: inprogress
created: "2026-05-02"
priority: medium
tags: []
---

# Product scope: chrome-extension

## TL;DR

- **Implementation baseline:** Extension and related integration (**`apps/extension`**, web **`/imports`**, GraphQL-over-SSE wiring) are treated as **starting from scratch**. Do not assume prior partial implementations, abandoned tooling, or old milestones satisfy **[T-137]**–**[T-138]** until this spec’s acceptance criteria pass on the current codebase.
- **Stack:** MV3 extension in **`apps/extension`** (WXT + Vite + React, `packages/ui`).
- **Boards (**D-1**):** **LinkedIn**, **Jack**, **RemoteYeah** → capture into **`New`** applications.
- **Auth:** Logged-in users only; **zero** extra connect step (**[P-123]**); cookie read **[P-119]** on service-worker GraphQL **`fetch`**.
- **API:** Same **GraphQL** as web (**[P-80]**); **`idempotencyKey`** on create mutations (**D-3**).
- **Modality:** **`Source` + URL** → **list page** vs **single-job deeplink** (**Type L** / **Type J**—see **Product decisions**).
- **Extension UX:** **Popup** + side-panel **mapping wizard** (**D-2**, **D-6**); no third-party DOM injection (**[P-116]**); **latest import round** in popup.
- **Backend ↔ extension transport:** **GraphQL over SSE** using **[graphql-sse](https://github.com/enisdenjo/graphql-sse)** (**[P-124]**, **[T-138]**): the **backend orchestrates**; the extension is a **mere executor** that applies **request actions** from the stream and **returns results** on the same GraphQL-over-SSE contract.
- **Web:** **`/imports`** — **single page** (**D-4**): list of **import runs**, **detail** on selection, **New run** opens importer picker; **live UI** via GraphQL **subscriptions** (**D-5**, **[T-136]**) when wired (separate surface from the extension SSE channel unless later unified).
- **Concurrency (**[P-115]**):** **Type L**/**Type J** runs MAY **overlap** unless an **importer** restricts—otherwise **user** chooses parallelism.
- **Duplicates (**D-8**):** Always **persist** + **mark** (normalized title + company); **web** wizard (**job-description** diff); user **deletes or keeps**.
- **First milestone (**[T-137]**):** Minimal **testable** **`apps/extension`** scaffold (**IMPLEMENTATION.md**), delivered **from the greenfield baseline** (first TL;DR bullet)—before boards / **GraphQL-over-SSE** (**[T-138]**) / **[P-119]**.
- **Out of scope:** Guest extension, **016** extension spec, REST import, shared importers v1, request-body HMAC beyond parity.

**Traceability:** [P-53], [P-109]–[P-130]; [T-132]–[T-138].

## Objective

- [P-109] Deliver extension-assisted capture from supported boards into **`New`** applications with import summaries in both extension and web (not draft-and-confirm).

## In scope (by ID)

- [P-53], [P-114], [P-115], [P-116], [P-109], [P-124]; [P-126]–[P-130] (**Security — server-driven plan**); detail under **Product decisions** and **`IMPLEMENTATION.md`** · **Extension ↔ API transport**.

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
- [P-116] **Popup** (**D-2**) for primary actions; **side-panel wizard** (**D-6**) for mapping flows; **no** third-party page injection. Current popup menu exposes:
  - **Import application** (requests active-tab snapshot from `dom.content` and logs `{ url, innerHTML }` in background console).
  - **Trigger PlanService** (matches prior action-icon click behavior).
- [P-117] **No** in-extension detailed field review (**D-8 triage stays on web**).
- [P-118] Always **persist** each import (**never block** suspected duplicates). **Mark** candidate dup groups (**normalized title + company**). User resolves via **web wizard** (job-description diff + optional other fields)—**delete surplus** rows or **keep all**. Automated merge/delete without confirmation ⇒ **still out**.
- **[P-80] Extension v1:** session + validated schema + idempotency (**no dedicated body-signature scheme**).
- [P-120] Chrome-extension requirements live **only** in **023**; **`specs/016-*`** excludes extension scope entirely.
- **[D-9] / [P-124] Backend-orchestrated extension, GraphQL over SSE:** Import **logic stays on the server**. The extension holds **GraphQL over SSE** ([**graphql-sse**](https://github.com/enisdenjo/graphql-sse)), **executes** **request actions** from the stream, and **returns** **results**. **Executor (v1):** **selectors**; **open / list / close** tabs; **interact**, **focus**, **type**, **scroll into view** for elements. More actions via schema evolution; **business rules** server-side.

## Implementation companion

**Scaffold, web partials, transport/security detail, integration checklist, duplicate pipeline notes, acceptance criteria, validation gates, and the change log** live in **`IMPLEMENTATION.md`** (same folder). Read it alongside this README for execution-level traceability (**[T-137]**–**[T-138]**, **[P-126]**–**[P-130]**).

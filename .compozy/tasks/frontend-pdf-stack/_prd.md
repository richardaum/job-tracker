# PRD: Frontend PDF dependency hygiene

**Feature slug:** `frontend-pdf-stack`

## Workflow context (Compozy)

- **Execution mode:** **A — Single git worktree** — ideation → PRD → TechSpec → tasks → implementation → review → verify happens in one extra checkout; **concrete git worktree path, branch name, and isolation contract** (DB, ports, PM2 namespace, auth bypass for local verify) are defined in `_techspec.md` § **Worktree & runtime environment** and, when used, mirrored in `.compozy/tasks/frontend-pdf-stack/memory/MEMORY.md`.
- **ADR inputs:** Implementers **read and stay consistent with** all files under `.compozy/tasks/frontend-pdf-stack/adrs/` before changing scope.

## Overview

The web app lists several PDF-related packages. Some power **creating** structured resume PDFs; others power **opening and parsing** PDF files for preview and import. **Unused or misleading overlap** increases cognitive load for contributors and inflates the dependency surface **without user benefit**. This initiative removes **accidental** duplication (unused packages and unclear ownership) while keeping **export**, **pre-export preview**, and **PDF import** behaviors stable for job seekers. Primary beneficiaries are **maintainers and release quality**; job seekers benefit indirectly through **fewer regressions** and a **clearer** capability model.

## Goals (testable)

Each goal below is **done** only when its **verification** is satisfied (exact commands, environments, and scenario steps belong in the TechSpec).

1. **G1 — Dependency footprint**  
   **Measure:** Immediately before removals, capture a **baseline** list/count of web-app **direct** dependencies classified as PDF-related in the TechSpec. **Pass:** After Phase 1, that count is **strictly lower** than baseline unless the TechSpec documents a justified exception (e.g. rename-only), with the before/after artifact stored for audit.

2. **G2 — Behavioral parity**  
   **Pass:** All **acceptance scenarios** for **export completion**, **preview trust** (preview matches what the user downloads), and **PDF import success** defined in the TechSpec pass in the **active worktree’s** isolated runtime (no reliance on another checkout’s processes or default dev ports).

3. **G3 — Capability clarity**  
   **Pass:** The TechSpec (or linked handoff) **names** which product capabilities own **structured PDF generation** versus **consume / view / parse existing PDFs**, so new dependencies can be justified without reintroducing accidental overlap.

## User Stories

- As a **job seeker exporting a resume**, I want **the same reliable PDF export and preview** so I can trust what I send to employers.
- As a **job seeker importing content from a PDF**, I want **import to keep working** so I do not lose a shortcut I already depend on.
- As a **maintainer**, I want **only dependencies that earn their place** so reviews and upgrades stay focused.
- As **product/engineering leadership**, I want **predictable scope**—hygiene without sneaking in unrelated PDF features—so delivery stays measurable.

## Core Features

1. **Unused dependency removal**  
   Identify PDF-related packages **not required** for current export, preview, or import flows and remove them from the web app’s dependency list, **after** verification.

2. **Overlap clarification (documentation-only in PRD terms)**  
   Record that **structured resume PDF generation** and **PDF viewing/parsing for preview/import** are **different jobs** that may legitimately coexist client-side; redundancy is **accidental** when both try to solve the **same** user step—here the intent is to eliminate **unused** overlap only.

3. **Regression guardrail expectations**  
   **G2** is the **behavioral bar** for declaring Phase 1 done; exact verification mechanics are **not** duplicated here.

## User Experience

- **Export flow**: User triggers resume PDF export → **same** high-level journey (including pre-export preview where the product already provides it) → **same** perceived outcome (a usable PDF file).
- **Import flow**: User imports from a PDF → **same** practical outcome (content brought into the product as today).
- **No new surfaces**: This initiative does **not** add new PDF menus, settings, or tutorials unless UX copy is needed to explain an unlikely edge case after cleanup (default: **no user-facing changes**).

## Requirements — product and engineering (isolation only where it affects delivery)

- **Client-side PDF work**: PDF viewing and parsing that currently happen in the browser should **remain client-side** for this initiative—no shifting parsing or preview to the server **as part of this PRD**.
- **Privacy posture**: Cleanup must **not** broaden who can see resume or imported PDF content beyond what export/import already imply.
- **Perceived performance**: Opening preview and completing export should remain **acceptable for typical resume lengths**; avoid introducing noticeable new stalls (exact thresholds belong in the TechSpec).
- **Mode A implication for acceptance:** **G2** must be evidenced in the **dedicated worktree** using the DB, ports, and process namespace from the TechSpec—**not** by assuming the default single-checkout dev stack, so parallel work on `main` does not invalidate sign-off.

## Non-Goals (Out of Scope)

- Redesigning resume **layout**, typography, or pagination rules in exported PDFs.
- Replacing the **structured generation** model with HTML snapshot exports—or the reverse—as a **primary** outcome of this initiative.
- New formats beyond PDF for resumes (DOCX, etc.).
- Server-side PDF generation or parsing introduced **only** to shrink browser dependencies (explicitly out of scope per stakeholder preference for client-side work).
- **Experimental** preview mechanisms that trade cross-browser preview parity for dependency count (deferred by explicit approach decision).

## Phased Rollout Plan

### MVP (Phase 1)

- Remove **confirmed-unused** PDF-related packages from the web app.
- Satisfy **G1** and **G2** per TechSpec scenarios and measurement rules.
- **Proceed to Phase 2** only if telemetry/support show **no meaningful regression** in PDF-related error rates or completion proxies (exact metrics in Success Metrics).

### Phase 2

- Optional follow-up: deeper **bundle or lazy-loading** optimizations **without** changing user-visible outcomes—only if Phase 1 succeeds and capacity exists.

### Phase 3

- Optional: revisit **preview-path experiments** (e.g. alternative rendering strategies) **only** under a separate initiative if Phase 1 hygiene still leaves unacceptable cost—**not bundled into this PRD**.

## Success Metrics

- **G1 / dependency count:** Fewer direct PDF-related packages than **documented baseline** after Phase 1.
- **G2 / quality:** Stable or improved PDF-related **error signals** (support volume, client error logs—one primary channel chosen in TechSpec) across **export**, **preview**, and **import**.
- **Delivery:** Initiative completes without rolling back due to **broken export/preview/import** in staging or production.

## Risks and Mitigations

- **Hidden reliance**: A package might appear unused but be referenced dynamically—**mitigate** with staged removal and targeted regression passes on all three flows.
- **Contributor confusion**: Engineers might re-add overlapping libraries—**mitigate** by tying acceptance to **G3** and TechSpec capability boundaries.
- **Scope creep**: Pressure to “standardize on one PDF library” while preserving client-only constraints—**mitigate** by enforcing **Non-Goals** and routing broader consolidation to a future PRD.
- **Wrong runtime sign-off:** Verifying against another checkout’s API/web/PM2 namespace—**mitigate** by enforcing Mode A runtime contract in TechSpec and **G2** evidence.

## Architecture Decision Records

Read and align implementation with:

- [ADR-001: Hygiene-first frontend PDF stack](adrs/adr-001.md) — Remove unused PDF-related packages; keep intentional generate vs view/parse pairing; avoid intentional UX change.

## Open Questions

- Whether **transitive** dependencies introduce redundant PDF assets after direct removals (resolved during TechSpec / implementation).
- Exact **baseline** dependency list snapshot and **post-removal** comparison artifact ownership (engineering process detail).

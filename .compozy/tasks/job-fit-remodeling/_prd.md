# PRD: Job Fit / Profile Match

**Status**: planned · **Priority**: medium · **Created**: 2026-05-11

**Technical specification:** [`_techspec.md`](./_techspec.md) (data model, GraphQL, scoring, persistence, worktree/env contract). · **Canonical product design:** [`specs/032-product-job-fit/design.md`](../../../specs/032-product-job-fit/design.md)

Canonical LeanSpec (frontmatter `tags`, cross-links to `tasks.md` / `design.md`): [`specs/032-product-job-fit/README.md`](../../../specs/032-product-job-fit/README.md).

**Compozy:** Feature slug `job-fit-remodeling`. Execution mode **A — single git worktree** is recorded in [`memory/MEMORY.md`](./memory/MEMORY.md) and in `_techspec.md` § _Worktree & runtime environment_. Read ADRs under [`adrs/`](./adrs/) when present; scope changes that affect architecture should gain an ADR during TechSpec work.

---

## Motivation

Users need to assess how well their profile/resume matches a job description — the classic _fit score_ problem. The core idea:

> Given a job description (JD) as reference, compare the user's profile against each requirement/qualification in the JD. The profile has two sources:
>
> - **Resume** — what the user offers (skills, experience, education).
> - **Preferences** — what the user wants, each with a **weight** (`high` / `low`) indicating its importance (e.g. `"remote only" [high]`, `"equity" [low]`).
>
> Each comparison produces one of three verdicts:
>
> - **Fit** — the source satisfies or exceeds that requirement.
> - **Gap** — the source is missing, weak, or doesn't address that requirement.
> - **Unclear** — it's not clear whether the requirement is met; the JD is ambiguous, the resume is vague, or there's not enough signal.

This spec builds the foundation incrementally:

1. Persist user resumes (1:n) in the database.
2. Provide a UI for creating/editing resumes (manual text via TiptapEditor).
3. Surface a dedicated **Resume & Preferences** page (route `/resumes`), accessible from the sidebar, listing all resumes (layout follows `ApplicationsPage`), each rendered as a card via `ListItemCard`.
4. Define the fit model and a dialog to run analysis: pick a job (via its JD/description), pick a resume (default: most recent), run point-by-point comparison, view fits, gaps, unclear items, and an overall **final score**. The result is **persisted** — each application can have one latest fit analysis; regenerating replaces it.
5. Compute a **final score** that classifies the match as **positive** (green, strong fit), **negative** (red, weak fit), or **neutral** (gray, inconclusive), based on a weighted ratio of fits vs gaps (exact rules in `_techspec.md`).

Future iterations (out of scope here) will add AI-powered analysis, aggregate fit scoring, and per-job comparison pages. The fit data model and resume infrastructure here is a prerequisite for **[P-44]** (AI-generated job insight cards with candidate fit signal and skills gaps — see `specs/012-product-ai-assistance/README.md`).

## Concept (summary)

- The **JD** is decomposed into individual requirements; each is compared against **resume** and **preferences** separately. One JD requirement may match **multiple** resume or preference excerpts (see **FitItem** / `sourceQuotes` in `_techspec.md`).
- **Resume selection:** default to the most recently created/updated resume; user may pick another.
- **UI:** prominent **score badge** with classification, percentage, fit/gap/unclear counts, and tooltip explaining scoring; detailed row-level UI and wireframes live in `design.md` and `_techspec.md`.

## Design

- New sidebar entry **"Resume & Preferences"** (`/resumes`) in the main `navItems` list, alongside Applications, Imports, Companies, etc.
- Icon: `FilesIcon` (or similar document‑related Phosphor icon).
- Screen layout, modals, and component structure: **`specs/032-product-job-fit/design.md`**.

## Goals (testable)

Each goal MUST be demonstrable on the stack defined in `_techspec.md` § _Worktree & runtime environment_ (no “passes against another checkout’s API”).

- **[P-150]** A user can store multiple resumes (1:n) linked to their account. **Verify:** Create ≥2 resumes for the same user via UI or API; both appear in list queries and survive reload.
- **[P-151]** The user can list all their resumes on a `/resumes` page that follows the `ApplicationsPage` layout. **Verify:** `/resumes` matches list layout/empties/skeleton patterns of Applications; navigation from sidebar works.
- **[P-152]** Each resume is displayed as a card using `ListItemCard`, showing title, summary, and timestamp. **Verify:** Inspect cards for required fields; empty and populated states both render.
- **[P-153]** The user can create a resume by typing directly in a `TipTapEditor`. **Verify:** New resume flow persists body edited in TipTap; reload shows saved HTML/text.
- **[P-154]** The user can edit the title and content of an existing resume. **Verify:** Update title/body; API/UI reflect changes after save and refresh.
- **[P-155]** The user can delete a resume. **Verify:** Delete removes row from list and subsequent fetch; no orphan references break the app.
- **[P-156]** The user can run a fit analysis between an application's JD/description and their most recent resume (or a selected one). **Verify:** Open fit flow from application detail; default resume is most recently updated; alternate selection changes inputs; analysis completes.
- **[P-157]** Each FitItem shows a verdict (`fit`, `gap`, or `unclear`), a source label (`resume` or `preference`), a literal **JD quote**, and matching **source quote(s)** — no paraphrasing. **Verify:** Spot-check items: `jdQuote` and `sourceQuotes` are substrings of stored JD/resume/preference text (or gaps have empty `sourceQuotes` as specified).
- **[P-158]** The user can add user-level preferences (not per-resume), each with a free‑text description and a **weight** (`high` or `low`). **Verify:** CRUD or list+edit preferences from UI; persisted user-level model.
- **[P-159]** Preferences are analysed alongside resume content in the fit dialog, each producing their own FitItems with fit/gap/unclear verdicts. **Verify:** Generated analysis includes `source = preference` items when preferences exist.
- **[P-160]** Each preference FitItem displays its weight, and the summary bar supports filtering/grouping by weight. **Verify:** UI shows weight on preference rows; filters change visible subset.
- **[P-161]** The fit dialog shows an overall **final score** — a badge with classification (positive/green, negative/red, neutral/gray) based on a weighted ratio of fits vs gaps, using the defined thresholds. **Verify:** Known fixture of FitItems yields expected class and color; tooltip/copy matches scoring rules in `_techspec.md`.
- **[P-162]** The user can regenerate a fit analysis from the fit dialog; each regeneration replaces the previous result for that application. **Verify:** Second run overwrites prior payload for same `applicationId`; UI shows latest only.

See [`specs/032-product-job-fit/tasks.md`](../../../specs/032-product-job-fit/tasks.md) for the detailed execution plan.

## Acceptance checklist

Gate before merge: every box below MUST be checked in the **same** worktree/runtime as `_techspec.md` § _Worktree & runtime environment_. Each row traces to a **Goal (testable)** ID where applicable.

- [ ] User can CRUD resumes via API.
- [ ] `/resumes` page renders a list of ResumeCards with empty state and loading skeleton.
- [ ] Resume editor (page at `/resumes/[id]`) supports TipTap manual editing.
- [ ] Preferences dialog accessible from the resumes list page via "Preferences" button in the action bar, with bullet‑list (add/remove, single‑scope text, weight toggle high/low per item).
- [ ] Fit dialog opens from the application detail page with resume selector (default: most recent), "Generate" / "Regenerate" button, and fit results area.
- [ ] Fit dialog shows empty state when no analysis exists yet; "Generate" triggers computation and persists the result.
- [ ] Each FitItem shows: verdict badge (`fit`/`gap`/`unclear`), source badge (`resume`/`preference`), literal **JD quote** as blockquote, literal **source quote(s)** as blockquote.
- [ ] Gaps show no source quotes; unclear items show the vague passage.
- [ ] Preferences items are separate FitItems with `source = preference`, interleaved or filterable in the list.
- [ ] Summary bar shows fit/gap/unclear counts, with optional grouping by weight.
- [ ] Source filter toggle (all / resume‑only / preference‑only), plus weight filter (`high` / `low` / all).
- [ ] Final score badge visible at the top of the fit dialog, color‑coded (green/gray/red), with classification label, percentage, and item counts.
- [ ] Score respects preference weights and unclear‑majority override.

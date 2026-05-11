---
status: planned
created: "2026-05-11"
priority: medium
tags:
  - api
  - web
  - database
  - resume
  - fit
---

# Job Fit / Profile Match

> **Status**: planned · **Priority**: medium · **Created**: 2026-05-11

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
5. Compute a **final score** that classifies the match as **positive** (green, strong fit), **negative** (red, weak fit), or **neutral** (gray, inconclusive), based on a weighted ratio of fits vs gaps.

Future iterations (out of scope here) will add AI-powered analysis, aggregate fit scoring, and per-job comparison pages. The fit data model and resume infrastructure here is a prerequisite for **[P-44]** (AI-generated job insight cards with candidate fit signal and skills gaps — see `specs/012-product-ai-assistance/README.md`).

## Concept: Fit analysis

### Mental model

The fit analysis compares the **JD** against **two sources** from the user:

| Source          | Role         | What it expresses                                                             |
| --------------- | ------------ | ----------------------------------------------------------------------------- |
| **Resume**      | What I offer | Skills, experience, education                                                 |
| **Preferences** | What I want  | Deal‑breakers, working style, tech preferences, each with `high`/`low` weight |

Each requirement from the JD is compared against **both** sources. A given item can be a **fit** for one source and a **gap** for another.

```
JD (reference)                       User profile (two sources)
─────────────────────                ─────────────────────────────
Requirement A  ─── resume ──▶  matches? → Fit
Requirement B  ─── resume ──▶  missing?  → Gap
Requirement C  ─── resume ──▶  vague?    → Unclear
Requirement D  ─── pref  ──▶  matches?  → Fit  (e.g. "remote")
Requirement E  ─── pref  ──▶  missing?  → Gap  (e.g. "no on‑call")
```

- The **JD** is decomposed into individual requirements/qualifications (tech stack, years of experience, soft skills, education, domain knowledge).
- Each requirement is compared against **resume content** and **preferences** separately.
- **Fit** — the source addresses the requirement acceptably.
- **Gap** — the source does not address it, underdelivers, or is silent on it.
- **Unclear** — the JD is ambiguous, the source is vague, or there's insufficient signal to decide.

### FitItem

Each comparison result is a **FitItem**. Every verdict is anchored in **real quotes** — no paraphrasing.

| Field          | Type      | Notes                                                                                                                                                                                 |
| -------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `requirement`  | `text`    | High‑level label for what the JD asks ("5+ years React")                                                                                                                              |
| `source`       | `enum`    | `resume` or `preference`                                                                                                                                                              |
| `weight`       | `enum?`   | `high` or `low` — only present when `source = preference`. Signals how much this item influences the aggregate score.                                                                 |
| `verdict`      | `enum`    | `fit`, `gap`, or `unclear`                                                                                                                                                            |
| `jdQuote`      | `text`    | **Literal excerpt** from the JD that states this requirement. Always present — the ground truth.                                                                                      |
| `sourceQuotes` | `[text!]` | **Literal excerpt(s)** from the resume or preference that support the verdict. Empty for gaps (nothing to quote). For fits: the line(s) that matched. For unclear: the vague passage. |
| `suggestion`   | `text?`   | How to fill a gap or clarify an unclear item                                                                                                                                          |

> **Why real quotes?** The user needs to see _exactly_ what text triggered the match. Summaries hide detail. Quotes make the analysis auditable: the user can verify "yes, my resume really says that" or "the JD really requires this".

### Resume selection

When running a fit analysis:

- **Default**: the most recently created/updated resume for the authenticated user.
- The user may override and pick any other resume from their list.

### Final score

The fit analysis produces an overall **final score** — a single classification of the match.

#### Weighted point system

Each FitItem contributes points toward the total:

| Item                          | Points |
| ----------------------------- | ------ |
| Resume fit                    | +1     |
| Resume gap                    | −1     |
| Preference fit (weight: low)  | +1     |
| Preference fit (weight: high) | +2     |
| Preference gap (weight: low)  | −1     |
| Preference gap (weight: high) | −2     |
| Unclear (any source)          | 0      |

**Score ratio** = `total points / max possible points` × 100, where max possible points assumes all items are high‑weight fits.

Alternatively, when no preference items exist, the max is simply the item count. This normalises the score to a percentage regardless of list size.

#### Classification thresholds

| Class        | Threshold                                          | Color    | Meaning                                         |
| ------------ | -------------------------------------------------- | -------- | ----------------------------------------------- |
| **Positive** | score ratio ≥ **65%**                              | 🟢 Green | Strong match — most requirements are met.       |
| **Neutral**  | 35% < score < 65%, OR unclear items > 50% of total | ⚪ Gray  | Inconclusive — close call or too many unknowns. |
| **Negative** | score ratio ≤ **35%**                              | 🔴 Red   | Weak match — significant gaps vs requirements.  |

- If unclear items account for more than half of all items, the result is **always neutral** regardless of score — there isn't enough signal.
- The threshold values (65% / 35%) are the initial defaults and may be tuned after user feedback.

#### UI treatment

A prominent **score badge** at the top of the fit modal:

```
┌────────────────────────────────┐
│  🟢 Strong fit    Score: 78%  │  ← green background
│  12 fits · 3 gaps · 2 unclear │
└────────────────────────────────┘
```

- Badge color follows the classification (green / gray / red).
- Tooltip explains the scoring logic on hover.

### Persistence

Each fit analysis is persisted to the database:

- **1:1 with Application** — one application has at most one latest fit analysis (`applicationId` unique constraint).
- **Replace on regenerate** — clicking "Generate" / "Regenerate" runs the analysis and upserts the result, replacing any previous analysis for that application.
- **FitItem** objects stored as a JSONB array on the `FitAnalysis` entity — always fetched together, never queried independently.
- The UI always reads the persisted fit first; only the "Generate" button triggers a new computation.

## Design

- New sidebar entry **"Resume & Preferences"** (`/resumes`) in the main `navItems` list, alongside Applications, Imports, Companies, etc.
- Icon: `FilesIcon` (or similar document‑related Phosphor icon).
- See detailed design in [`design.md`](./design.md).

## Product outcomes

- **[P-150]** A user can store multiple resumes (1:n) linked to their account.
- **[P-151]** The user can list all their resumes on a `/resumes` page that follows the `ApplicationsPage` layout.
- **[P-152]** Each resume is displayed as a card using `ListItemCard`, showing title, summary, and timestamp.
- **[P-153]** The user can create a resume by typing directly in a `TipTapEditor`.
- **[P-154]** The user can edit the title and content of an existing resume.
- **[P-155]** The user can delete a resume.
- **[P-156]** The user can run a fit analysis between an application's JD/description and their most recent resume (or a selected one).
- **[P-157]** Each FitItem shows a verdict (`fit`, `gap`, or `unclear`), a source label (`resume` or `preference`), a literal **JD quote**, and matching **source quote(s)** — no paraphrasing.
- **[P-158]** The user can add user-level preferences (not per-resume), each with a free‑text description and a **weight** (`high` or `low`).
- **[P-159]** Preferences are analysed alongside resume content in the fit dialog, each producing their own FitItems with fit/gap/unclear verdicts.
- **[P-160]** Each preference FitItem displays its weight, and the summary bar supports filtering/grouping by weight.
- **[P-161]** The fit dialog shows an overall **final score** — a badge with classification (positive/green, negative/red, neutral/gray) based on a weighted ratio of fits vs gaps, using the defined thresholds.
- **[P-162]** The user can regenerate a fit analysis from the fit dialog; each regeneration replaces the previous result for that application.

## Technical plan

| ID          | Deliverable                                                                                                                                                                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[T-175]** | Create **`Resume`** TypeORM entity + migration (`id`, `userId`, `title`, `content` jsonb, timestamps). Preferences are handled separately (user-level).                                                                                                   |
| **[T-176]** | Add GraphQL **`Query.resumes`**, **`Mutation.createResume`**, **`Mutation.updateResume`**, **`Mutation.deleteResume`** to the API. No preferences in resume mutations.                                                                                    |
| **[T-177]** | Create **`/resumes`** page shell in **`apps/web`** following `ApplicationsPage` layout pattern.                                                                                                                                                           |
| **[T-178]** | Build **`ResumeCard`** component using `ListItemCard` (title, actions, meta, description).                                                                                                                                                                |
| **[T-179]** | Build **Resume editor** (page at `/resumes/[id]`) with title input, PDF import, `TipTapEditor` for manual editing.                                                                                                                                        |
| **[T-180]** | Wire GraphQL hooks for list/create/update/delete operations.                                                                                                                                                                                              |
| **[T-181]** | Unit tests: API resolver + service, web page render, card rendering, editor interactions (PDF import path, TipTap content).                                                                                                                               |
| **[T-182]** | Build **FitDialog** component — opened from the application detail page, with resume selector dropdown, "Generate" / "Regenerate" button, and fit results area. Empty state when no fit exists yet.                                                       |
| **[T-183]** | Add **`Mutation.generateApplicationFit(applicationId: UUID!, resumeId: UUID): FitAnalysis!`** (runs analysis, persists, returns the result) and **`Query.applicationFit(applicationId: UUID!): FitAnalysis`** (returns the latest persisted fit or null). |
| **[T-184]** | Wire GraphQL hooks for the fit dialog (query + mutation).                                                                                                                                                                                                 |
| **[T-185]** | Unit tests for fit dialog, FitItem rendering (fit/gap/unclear badges, source badge, JD quote, source quotes, suggestion), resume selector, generate/regenerate flow.                                                                                      |
| **[T-186]** | Add `UserPreferences` entity + migration (`userId` unique, `items` jsonb `[{text, weight}]`) + GraphQL `Query.userPreferences` and `Mutation.updateUserPreferences`.                                                                                      |
| **[T-187]** | Build **Preferences dialog** on the resumes list page: bullet‑list with add/remove, single‑scope text input, and weight toggle (`high`/`low`) per item.                                                                                                   |
| **[T-188]** | Unit tests for preferences CRUD and rendering in the preferences dialog (including weight toggle).                                                                                                                                                        |
| **[T-189]** | Display weight badge on preference FitItems in the fit dialog; add weight filter to the source filter pills.                                                                                                                                              |
| **[T-190]** | Implement scoring logic: point system, score ratio, classification with 65%/35% thresholds, unclear‑majority override.                                                                                                                                    |
| **[T-191]** | Build **final score badge** component at the top of the fit dialog — color‑coded, shows classification label + score percentage + item counts.                                                                                                            |
| **[T-192]** | Create **`FitAnalysis`** TypeORM entity + migration (`id`, `applicationId` unique, `resumeId`, `scoreRatio`, `classification`, `fitCount`, `gapCount`, `unclearCount`, `items` jsonb `[FitItem]`, timestamps).                                            |

## Acceptance checklist

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

# Design — Job Fit / Profile Match

> Detailed design for `specs/032-product-job-fit/README.md`.

## Design

### Data model: Resume

A **Resume** belongs to a single user. One user may have many resumes (e.g. different versions for different profiles).

| Field       | Type        | Notes                                                |
| ----------- | ----------- | ---------------------------------------------------- |
| `id`        | `uuid`      | PK                                                   |
| `userId`    | `uuid`      | FK → `users.id`, NOT NULL                            |
| `title`     | `text`      | User-given label ("Senior backend", "General", etc.) |
| `content`   | `jsonb`     | TipTap document JSON (rich text body)                |
| `createdAt` | `timestamp` | Auto                                                 |
| `updatedAt` | `timestamp` | Auto                                                 |

- **1:n** — `User → Resume` via `userId`.
- **`content`** stores the full rich-text body as a TipTap document, matching the existing pattern used in notes and descriptions.
- Preferences are **user-level** (see User Preferences below), not per-resume.
- Soft deletes may be added later; for now, hard deletes are acceptable.

### Data model: User Preferences

Preferences are **user-level** — one user has one set of preferences shared across fit analyses.

| Field       | Type        | Notes                                                |
| ----------- | ----------- | ---------------------------------------------------- |
| `id`        | `uuid`      | PK                                                   |
| `userId`    | `uuid`      | FK → `users.id`, **UNIQUE** (1:1), NOT NULL          |
| `items`     | `jsonb`     | Array of `{ text: string, weight: "high" \| "low" }` |
| `createdAt` | `timestamp` | Auto                                                 |
| `updatedAt` | `timestamp` | Auto                                                 |

- **1:1** — `User → Preferences` via `userId` UNIQUE.
- Edited from the **resumes list page** via a modal ("Preferences" button next to "Add resume").

### Data model: FitAnalysis

A **FitAnalysis** belongs to one application. Each application has at most one latest fit analysis — regenerating upserts it.

| Field            | Type        | Notes                                                                     |
| ---------------- | ----------- | ------------------------------------------------------------------------- |
| `id`             | `uuid`      | PK                                                                        |
| `applicationId`  | `uuid`      | FK → `applications.id`, **UNIQUE** (1:1 enforcement), NOT NULL            |
| `resumeId`       | `uuid`      | FK → `resumes.id`, NOT NULL                                               |
| `scoreRatio`     | `float`     | Computed score ratio (0–100)                                              |
| `classification` | `enum`      | `positive`, `neutral`, `negative`                                         |
| `fitCount`       | `int`       | Count of `fit` items                                                      |
| `gapCount`       | `int`       | Count of `gap` items                                                      |
| `unclearCount`   | `int`       | Count of `unclear` items                                                  |
| `items`          | `jsonb`     | Array of `FitItem` objects (verdicts, quotes, source, weight, suggestion) |
| `createdAt`      | `timestamp` | Auto — reset on regenerate                                                |
| `updatedAt`      | `timestamp` | Auto                                                                      |

- **1:1** — `Application → FitAnalysis` via `applicationId` UNIQUE.
- **`items`** stores the full list of `FitItem` objects as JSONB, each matching the FitItem schema from the spec (requirement, source, weight?, verdict, jdQuote, sourceQuotes, suggestion).
- **Counts** (`fitCount`, `gapCount`, `unclearCount`) are denormalized for quick badge display without parsing JSONB.
- **`scoreRatio` + `classification`** are denormalized from the scoring logic, stored at write time.
- The `applicationId` UNIQUE constraint means a second `generateApplicationFit` call for the same application deletes the old row and inserts the new one (upsert via DELETE + INSERT, or ON CONFLICT UPDATE).

#### FitItem (JSONB shape)

Stored in the `items` array:

| Field          | Type       | Notes                                           |
| -------------- | ---------- | ----------------------------------------------- |
| `requirement`  | `string`   | Label for what the JD asks                      |
| `source`       | `string`   | `"resume"` or `"preference"`                    |
| `weight`       | `string?`  | `"high"` or `"low"` — only for preference items |
| `verdict`      | `string`   | `"fit"`, `"gap"`, or `"unclear"`                |
| `jdQuote`      | `string`   | Literal excerpt from the JD                     |
| `sourceQuotes` | `string[]` | Literal excerpt(s) from resume/preference       |
| `suggestion`   | `string?`  | How to fill a gap or clarify an unclear item    |

### API

#### Resume CRUD

- **`Query.resumes`** — list all resumes for the authenticated user.
- **`Mutation.createResume(title: String!, content: JSON!)`** — create a new resume with TipTap content.
- **`Mutation.updateResume(id: UUID!, title: String, content: JSON)`** — update title and/or content.
- **`Mutation.deleteResume(id: UUID!)`** — delete a resume.
- **`Resume`** GraphQL type exposing `id`, `title`, `content`, `createdAt`, `updatedAt`.

All mutations scoped to the authenticated user. The `content` field accepts and returns a TipTap JSON document (same as notes).

#### User Preferences

- **`Query.userPreferences: [Preference!]!`** — list user's preferences (items array).
- **`Mutation.updateUserPreferences(items: [PreferenceInput!]!)`** — replace the user's preferences (upsert by `userId`).
- **`PreferenceInput { text: String!, weight: WeightEnum! }`**, `WeightEnum` is `HIGH` | `LOW`.
- **`Preference`** GraphQL type: `{ text: String!, weight: WeightEnum! }`.

#### Fit Analysis

- **`Mutation.generateApplicationFit(applicationId: UUID!, resumeId: UUID!): FitAnalysis!`** — runs the fit analysis (decompose JD, compare against resume + preferences, compute score), persists the `FitAnalysis` (replacing any previous one for the same application via `applicationId` UNIQUE upsert), and returns the result.
- **`Query.applicationFit(applicationId: UUID!): FitAnalysis`** — returns the latest persisted fit analysis for the given application, or `null` if none exists yet.
- **`FitAnalysis`** GraphQL type exposing all fields from the entity above.
- **`FitItem`** GraphQL type (derived from JSONB items): `requirement`, `source`, `weight`, `verdict`, `jdQuote`, `sourceQuotes`, `suggestion`.

### Sidebar entry

- Add **"Resumes"** to the main `navItems` array in `apps/web/src/modules/navigation/components/Sidebar.tsx`.
- Route: `/resumes`.
- Icon: `FilesIcon` (from `@phosphor-icons/react`), placed between "Draft applications" and "Imports".

### UI: Resumes Page (`/resumes`)

#### Layout

Follows the **`ApplicationsPage`** layout pattern exactly:

```
┌─────────────────────────────────────────────┐
│  Action bar                                  │
│  [SearchInput]       [Preferences] [Add Resume]
├─────────────────────────────────────────────┤
│  Quick filters (future) or none initially    │
├─────────────────────────────────────────────┤
│  Scrollable content area                      │
│  ┌───────────────────────────────────────┐   │
│  │ ResumeCard (ListItemCard)            │   │
│  ├───────────────────────────────────────┤   │
│  │ ResumeCard (ListItemCard)            │   │
│  ├───────────────────────────────────────┤   │
│  │ ResumeCard (ListItemCard)            │   │
│  └───────────────────────────────────────┘   │
│  (empty → EmptyState)                        │
└─────────────────────────────────────────────┘
```

- Full-height flex column (`h-full flex-col`).
- Action bar: search on the left, "Preferences" (secondary button) + "Add resume" (primary button) on the right.
- "Preferences" opens a modal to edit user-level preferences (weighted deal-breakers, working style, tech preferences).
- Content area: `flex-1 overflow-auto`, `p-4 sm:p-6`.
- List as `<Stack gap="sm">` of `<ResumeCard>` items.
- Loading skeleton (reuse pattern from `ApplicationsListSkeleton` but adapted for resumes).
- Empty state with a "No resumes yet" message.

#### ResumeCard

A **`ListItemCard`** compound component:

- **Title**: Resume title (editable inline or links to detail view — TBD in later spec).
- **Actions**: Edit, Delete.
- **Meta**: Character/word count, `updatedAt` timestamp.
- **Description**: Plain-text preview (first ~120 chars of the content) — uses the existing `tipTapToPlainText` utility.

#### Resume Editor (page at `/resumes/[id]`)

The editor is a full page (not a dialog), opened via "Add resume" or clicking a resume card.

**Header bar** (shrink-0, always visible):

```
Back to resumes          [Save] [Actions ▼]
────────────────────────────────────────────
Title: [_____________________________]
```

- **Save** button in the header actions row, disabled when no changes exist. Avoid save buttons inside tabs or at the page bottom.
- **Actions** dropdown with "Delete resume" option.

**Body** — single tab layout:

1. **Title field** — large text input just below the header, styled as a heading.
2. **Resume content** — full `TipTapEditor` instance (`fillHeight`), same as `DescriptionEditor`, filling the entire body area.

> Preferences are **user-level** (not per-resume) and edited via the "Preferences" button on the resumes list page — see below. 4. **Save** — Save button in the **header actions bar** (always visible), next to the "Actions" dropdown. Disabled when no changes exist. Avoid save buttons at the bottom of the page or inside individual tabs. Persists via `createResume` / `updateResume`.

### UI: Fit Analysis Modal

Opened from the application detail page (trigger button in the action bar or a dedicated "Fit analysis" button). Renders inside a `Dialog` overlay — no dedicated route.

On open, the modal fetches the existing `applicationFit` (query). The content depends on state:

#### No fit exists yet (empty state)

```
┌─────────────────────────────────────────────┐
│  Fit Analysis                    [×] close   │
├─────────────────────────────────────────────┤
│  No analysis yet                            │
│  Select a resume and generate a fit         │
│  analysis to see how your profile matches   │
│  this job description.                      │
│                                             │
│  Resume: [Dropdown ▼]                       │
│                                             │
│  [Generate fit analysis]                    │
└─────────────────────────────────────────────┘
```

#### Fit exists (showing results)

```
┌─────────────────────────────────────────────┐
│  Fit Analysis             [Regenerate] [×]  │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐  │
│  │  🟢 Strong fit    Score: 78%         │  │
│  │  12 fits · 3 gaps · 2 unclear        │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Resume: [Dropdown ▼]      (last analysis)  │
│                                             │
│  Summary: 12 fits  3 gaps  2 unclear        │
│  Filters: [All] [Resume] [Pref] [High] [Low]│
│                                             │
│  ┌─ FitItem ────────────────────────────┐   │
│  │  ✅ Fit · resume                     │   │
│  │  "5+ years React experience"          │   │
│  │  > "Built 3 React apps at Acme"      │   │
│  └──────────────────────────────────────┘   │
│  ┌─ FitItem ────────────────────────────┐   │
│  │  ❌ Gap · resume                     │   │
│  │  "Experience with GraphQL"           │   │
│  │  Suggestion: add a GraphQL side       │   │
│  │  project or highlight any exposure   │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

#### Key behaviours

- **Resume selector** — dropdown showing the user's resumes, defaulting to the most recent. Changing the selection does **not** auto-regenerate; the user must click "Generate" / "Regenerate" explicitly.
- **"Generate fit analysis"** — visible when no fit exists yet. Label: "Generate fit analysis".
- **"Regenerate"** — visible when a fit already exists. Label: "Regenerate".
- **Loading state** — button shows a spinner and is disabled while the mutation runs.
- **On success** — modal updates with the new fit results (button returns to "Regenerate").

#### Modal sections (when fit exists)

1. **Final score badge** — prominent card at the very top:
   - **Classification label**: "Strong fit" / "Inconclusive" / "Weak fit".
   - **Score percentage** (e.g. "78%").
   - **Color**: green / gray / red background.
   - **Breakdown row**: `X fits · Y gaps · Z unclear`.
   - Tooltip with scoring logic summary.
2. **Resume selector** — dropdown showing the user's resumes, defaulting to the most recent. Label: "Compare against".
3. **Summary bar** — `X fits, Y gaps, Z unclear` at the top.
4. **Source filter** — toggle/pills to show all, resume‑only, preference‑only, and weight filter (`high` / `low`).

### UI: Preferences Modal

Opened from the resumes list page via the "Preferences" button in the action bar.

```
┌──────────────────────────────────────────────┐
│  Preferences                       [×] close  │
├──────────────────────────────────────────────┤
│                                              │
│  • [________________________] [High ▼] [✕]  │
│  • [________________________] [Low  ▼] [✕]  │
│                                              │
│  [+ Add preference]                          │
│                                              │
│  [Save]                                      │
└──────────────────────────────────────────────┘
```

- Each preference is a bullet item with:
  - **Text input** — single‑scope free text.
  - **Weight dropdown** — `DropdownMenu` from `@job-tracker/ui`. Trigger shows current weight label with colored icon:
    - `High` — green `ArrowUpIcon` + label.
    - `Low` — gray `ArrowDownIcon` + label.
  - Default when added: `Low`.
  - **Remove button**.
- "Add preference" appends a new empty item.
- **Save** persists via `updateUserPreferences`.
- Uses `Dialog` from `@job-tracker/ui`.

5. **Fit results** — list of `FitItem` cards, each showing:
   - **Verdict badge** (`fit` / `gap` / `unclear`), color‑coded.
   - **Source badge** (`resume` or `preference`).
   - **Weight badge** (`high` / `low`) — only for preference items.
   - **JD quote** — the literal excerpt from the job description that states the requirement, rendered as a blockquote.
   - **Source quote(s)** — the literal excerpt(s) from the resume or preference that triggered the verdict, rendered as a blockquote. For gaps, this section is absent (nothing to quote). For unclear, the vague passage is shown.
   - **Suggestion** (for gaps / unclear): what could fill or clarify it.

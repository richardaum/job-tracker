# Feature Map — Job Tracker

> User-facing features only. Each entry references the spec and describes the feature in one sentence.

## 1. Auth & Account

- **Google OAuth + JWT** (`specs/001`) — built — Login via Google, JWT issuance, auth guards, and per-owner data isolation.
  - **Dev bypass** (`specs/024`) — built — `AUTH_BYPASS_ENABLED` flag for development without Google OAuth.
  - **Social login shell** (`specs/030`) — built — `/login` page with frost-grid layout and OAuth panel (Google, Facebook, Apple).

## 2. Jobs

- **Job CRUD** (`specs/001`) — built — Create, edit, list, and delete jobs with title, company, description, URLs, source, tags, and salary.
  - **Quick filters** — built — Filter the list by INCOMING, ACTIVE, APPLIED, NEW, or DUPLICATED with one click.
  - **Text search** — built — Search across all jobs by any field.
  - **Filter by company or source run** — built — Scope the list to a specific company or a specific source batch.
  - **Inline editing** — built — Click any field (title, company, URLs, source, salary, tags, description) on the detail page to edit it in place.
  - **URLs management** — built — Add and remove multiple job posting URLs per job.
  - **Tags** — built — Add and remove tags on any job for lightweight categorization.
  - **Location & work region** (`specs/036`) — built — Free-text fields for job base location (e.g. "São Paulo, SP") and permitted work geography (e.g. "Brazil", "Latam", "Anywhere").
    - **Detail page inline edit with AI inference** — built — Edit location and work region inline via dialog; SparkleIcon button infers both fields from the job description via AI.
    - **List page quick-edit** — built — Location and work region inputs in the quick-edit dialog.
  - **Duplicate detection** — built — Automatically detect and mark duplicates (same role + company within 30 days) with a DUPLICATED stage.
  - **AI create v2** (`specs/027`) — in_progress — Paste a JD and let AI extract fields, detect duplicates, and batch-convert into jobs.
- **Stage timeline** (`specs/014`, `specs/020`) — built — Track every stage transition (Applied → Recruiter Screen → Technical → etc.) with reason and scheduled date.
- **Rich-text notes** (`specs/014`, `specs/020`) — built — Write formatted notes per job via TipTap, safe against concurrent edits.
  - **Voice-to-text dictation** — built — Dictate notes by speech instead of typing.
  - **Save description as PDF** — built — Export the job description to a PDF file.
- **Structured salary** (`specs/013`, `specs/019`) — built — Store expected pay range (min/max, currency, period) per job.

## 3. Draft Jobs

- **Draft management** (`specs/027`, `specs/035`) — built — View, search, and manage collected-but-unconverted JDs in the draft inbox.
  - **Import from paste** (`specs/027`) — built — Paste a JD (Ctrl+V) anywhere in the app to create a draft from clipboard content.
  - **Convert to job** (`specs/027`) — built — AI extracts title, company, description, salary, and tags; detects duplicates and resolves conflicts (replace vs. keep).
  - **Auto-convert** (`specs/027`) — built — Pass `?autoConvert=true` to auto-convert a draft on page load.
  - **Linked job** — built — See which job a draft is linked to, or convert unlinked drafts.

## 4. Companies

- **Company registry** (`specs/001`) — built — Browse, search, and manage companies with AI-generated descriptions.
  - **Company detail** — built — View all jobs linked to a company in one place.
  - **AI description** — built — Auto-generate or rewrite a company description from its name.

## 5. Sources

- **Source templates + runs** (`specs/035`) — built — Schedule recurring imports from job platforms; each run creates a batch of draft jobs.
  - **Extension integration** (`specs/023`, `specs/035`) — built — Collect JDs from RemoteYeah, LinkedIn, Ashby, Lever, and Micro1 directly via the browser extension.
  - **Schedule management** (`specs/035`) — built — View, edit cron schedules, rerun, and delete source templates from the `/sources` page.
  - **Detach jobs** — built — Unlink jobs from an import run while keeping the jobs themselves.
  - **Clear all runs** — built — Wipe the entire import run history in one action.

## 6. Job Fit / Profile Match

- **Resumes** (`specs/032`) — built — Store one or more resumes with a TipTap editor; mark one as default for match analyses.
  - **Preferences** (`specs/032`) — built — Set weighted preferences (e.g., "remote-first", "equity") to guide match scoring.
- **Match analysis** (`specs/032`) — built — Compare a JD against your resume and preferences, get a score, classification, and per-item match/gap/unclear verdicts.
  - **Job Match tab** (`specs/032`) — built — Tabs at `/jobs/[id]`, `/description`, `/source`, `/match`, `/notes`, `/history`; desktop notes full page at `/jobs/[id]/notes/focus`; side panel uses `?s=notes|history`.
  - **Draft match** (`specs/032`) — built — Run match analysis on unconverted drafts before deciding to apply.

## 7. Dashboard & Search

- **Pipeline dashboard** (`specs/015`) — planned — See stage distribution at a glance with pipeline metrics and cards.
  - **Advanced search & filters** (`specs/015`) — planned — Full-text search combined with multi-dimensional filtering (company, stage, date, tags, salary range).

## 8. Tools

- **Salary calculator** (`specs/025`, `specs/026`) — built — Convert between periods (year/month/hour) and currencies at `/tools/salary-calculator`.

## 9. Real-time UI Updates

- **Live status updates** — planned — See job changes reflected instantly without refreshing the page. Examples: AI summary finishes generating and appears on screen; stage transition updates across all views; import run progress shows in real time.

## 10. Chrome Extension

- **Collect Jobs** (`specs/023`) — built — One-click collect: paginates job listings, opens detail tabs in parallel, extracts fields, and sends to the app.
  - **Multi-platform content script** (`specs/023`) — built — Extracts job data from LinkedIn, Ashby, Lever, Micro1, and RemoteYeah automatically.
  - **Source run events** (`specs/023`) — built — See import progress in real time via SSE push events.
  - **Context menu** (`specs/023`) — built — Right-click any page to import a single job listing.
  - **Popup UI** (`specs/023`) — pending — Quick-status popup showing extension state and execution logs.
  - **Side-panel mapping** (`specs/023`) — pending — Visual wizard to map DOM selectors when adding support for a new job platform.

## 11. AI Assistance

- **AI company description** (`specs/001`) — built — Auto-generate a company description from its name.
  - **AI note generation** (`specs/014`) — built — Auto-structure a free-form note into a well-organized summary, or improve existing notes.
  - **Text rewrite & restructure** (`specs/012`) — built — Rewrite or reformat raw JD text for consistent reading.
  - **AI insights cards** (`specs/012`) — planned — Get proactive suggestions on the pipeline (e.g., "follow up with X", "salary seems low for Y").
  - **AI job summary** (`specs/037`) — planned — Generate a concise rich-text summary of a job's fields, description, notes, and stage history. Displayed as a full-width card at the top of the detail page. Fire-and-forget async generation with SSE push notification.

## 12. Multilingual

- **i18n** (`specs/017`) — planned — Switch between English and Brazilian Portuguese, with locale-based routes and a governed dictionary.

## 13. Settings

- **Settings screen** (`specs/031`) — planned — Configure app behavior (e.g., duplicate-detection window) from `/settings`.

## 14. LGPD / Compliance

- **LGPD** (`specs/033`) — planned — Consent management, data export, account deletion, and privacy page to comply with Brazilian data protection law.

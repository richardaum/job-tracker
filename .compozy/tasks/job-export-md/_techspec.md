# TechSpec: Export Job as Markdown

## Executive Summary

Add an "Export as Markdown" item to the job details Actions dropdown. On click, the component fetches notes and stage events on demand, combines them with the already-loaded job data, formats everything as Markdown, and triggers a browser download. No backend changes, no new API endpoints. The feature is entirely client-side, adding one component file and one utility file.

**Primary trade-off:** Fetching notes and stage events on demand avoids wasteful GraphQL queries on page load but introduces a brief loading delay on export. The loading state on the menu item keeps the UX acceptable.

## System Architecture

### Component Overview

- **`ExportJobMdMenuItem`** (`apps/web/src/modules/jobs/details/components/ExportJobMdMenuItem.tsx`)
  - Renders a `<DropdownMenuItem>` with "Export as Markdown" label.
  - Accepts `jobId` and `job` (the `Job` query result) as props.
  - On click, uses Apollo's `useLazyQuery` to fetch `JobNotes` and `JobStageEvents`.
  - Calls a pure utility to generate the Markdown string and trigger the download.
  - Shows a loading state while fetching.

- **`export-job-md.ts`** (`apps/web/src/modules/jobs/details/utils/export-job-md.ts`)
  - Pure function `formatJobAsMarkdown(job, notes, stageEvents): string` — no side effects.
  - Utility function `downloadMarkdown(content: string, filename: string): void` — creates blob and triggers download.
  - Slugify helper for the filename.

### Data Flow

1. User clicks "Export as Markdown" in Actions dropdown.
2. `ExportJobMdMenuItem` sets loading state, fires `fetchNotes()` and `fetchStageEvents()` in parallel via `Promise.all`.
3. Both queries resolve with full data.
4. `formatJobAsMarkdown()` produces the Markdown string.
5. `downloadMarkdown()` creates a `Blob('text/markdown')`, generates an object URL, clicks a hidden `<a>`, revokes the URL.
6. Menu item returns to idle state.

## Implementation Design

### Core Interfaces

```ts
// export-job-md.ts
interface ExportJobData {
  job: JobQuery["job"];
  notes: JobNotesQuery["jobNotes"];
  stageEvents: JobStageEventsQuery["jobStageEvents"];
}

function formatJobAsMarkdown(data: ExportJobData): string;
function downloadMarkdown(content: string, filename: string): void;
function slugifyFileName(title: string | null | undefined, company: string | null | undefined, id: string): string;
```

### Data Models

No new data models. The export consumes existing GraphQL types:

| Source        | Query                          | Key Fields                                                                                                                                                                                       |
| ------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@/gql/hooks` | `useJobQuery` (already loaded) | `job.id`, `title`, `company.name`, `description`, `urls`, `source`, `salary`, `tags`, `location`, `workRegion`, `summary`, `htmlContent`, `currentStage`, `currentStageAt`, `createdAt`, `match` |
| `@/gql/hooks` | `useJobNotesLazyQuery`         | `jobNotes.id`, `content`, `createdAt`                                                                                                                                                            |
| `@/gql/hooks` | `useJobStageEventsLazyQuery`   | `jobStageEvents.id`, `fromStage`, `toStage`, `reason`, `createdAt`                                                                                                                               |

### API Endpoints

None. Data comes from existing GraphQL queries.

## Impact Analysis

| Component              | Impact Type | Description                                                     | Required Action                           |
| ---------------------- | ----------- | --------------------------------------------------------------- | ----------------------------------------- |
| `JobDetailsLayout.tsx` | Modified    | Add `ExportJobMdMenuItem` inside Actions dropdown               | Import + mount component before separator |
| `details/components/`  | New         | `ExportJobMdMenuItem.tsx` — menu item with fetch + export logic | Create file                               |
| `details/utils/`       | New         | `export-job-md.ts` — Markdown format + download utilities       | Create file                               |

## Testing Approach

### Unit Tests

- `formatJobAsMarkdown()`: test with full data, missing/null fields, empty notes/events.
- `slugifyFileName()`: test with various title formats (special chars, null, empty).
- `downloadMarkdown()`: test that blob is created with correct MIME type.

### Integration Tests

- No integration tests needed. The component is a pure composition of existing GraphQL queries and pure functions.

## Development Sequencing

### Build Order

1. **`export-job-md.ts` utility** — pure functions: `formatJobAsMarkdown`, `downloadMarkdown`, `slugifyFileName`. No dependencies. Testable immediately.
2. **`ExportJobMdMenuItem.tsx` component** — depends on step 1. Imports generated hooks for lazy queries, renders the menu item, handles loading state and click.
3. **`JobDetailsLayout.tsx` wiring** — depends on step 2. Import and mount `ExportJobMdMenuItem` in the Actions dropdown, before the separator (before "Remove").

### Technical Dependencies

- None. All GraphQL queries (`Job`, `JobNotes`, `JobStageEvents`) already exist in `jobs.graphql` and have generated hooks.

## Monitoring and Observability

No changes needed. The feature is purely client-side with no backend impact.

## Technical Considerations

### Key Decisions

| Decision            | Choice                               | Rationale                                       |
| ------------------- | ------------------------------------ | ----------------------------------------------- |
| Fetch timing        | On-demand via `useLazyQuery`         | Avoids fetching notes/events on every page load |
| File structure      | Separate component + utility         | SRP, testability, clean layout                  |
| Markdown generation | Pure function with template literals | No external library needed; trivial format      |
| Menu placement      | Layout-owned item (not slot)         | Export is universal across all tabs             |
| Download mechanism  | `Blob` + `URL.createObjectURL`       | Standard browser API, no library needed         |

### Known Risks

- **Large notes cause delay**: If a job has many notes, the query and markdown generation may lag briefly. Mitigation: show a loading spinner on the menu item. Acceptable for a non-blocking utility action.

## Architecture Decision Records

- [ADR-001: Direct Markdown Export from Actions Dropdown](adrs/adr-001.md) — One-click download from Actions dropdown, client-side generation, no preview dialog.
- [ADR-002: On-Demand Fetch with Export Component](adrs/adr-002.md) — Lazy-fetch notes and stage events on export click; dedicated component for SRP.

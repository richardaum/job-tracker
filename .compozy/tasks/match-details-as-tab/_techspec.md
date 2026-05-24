# TechSpec: Match Details as Job Detail Tab

## Executive Summary

Move match analysis from a standalone page (`/matches/[id]`) into a dedicated tab inside the job detail page (`/jobs/[id]`). The Match tab lives in the main-column `TabsList` alongside Overview, Description, and Source content. Match-specific actions (Generate, Delete) stay in a toolbar within the tab — the job header drops its "Match analysis" button. Legacy URLs `/matches/[id]` get a permanent 308 redirect to `/jobs/[id]/match`. The `/matches` list route and all standalone match page components are deleted.

**Primary trade-off:** The `MatchTabContent` component runs its own `useJobMatchQuery` and SSE subscription independently from the parent `JobDetailsPage`, giving it isolated loading/error/refetch lifecycle at the cost of a second Apollo query for the same entity.

## System Architecture

### Component Overview

```
JobDetailsPage
├── BackToLink ("Back to jobs")
├── Header (Heading + StatusBadge + Actions dropdown [−Match analysis])
├── Body (desktop: CSS Grid [1fr + 360px]; mobile: single Tabs)
│   ├── Main Column Tabs
│   │   ├── Overview → OverviewTabContent → MatchAnalysisField (summary, links to Match tab)
│   │   ├── Description → DescriptionTabContent
│   │   ├── Source content → SourceContentTabContent (conditional)
│   │   └── Match (NEW) → MatchTabContent
│   │       ├── Toolbar: Generate/Regenerate + Actions dropdown (View resume, Prefs, Delete)
│   │       ├── MatchStatusBadge
│   │       ├── Verdict filter tabs (All / Fits / Gaps / Unclear) + MatchClassification badge
│   │       └── Masonry grid of MatchItemCards
│   └── Side Column (360px, desktop only)
│       └── ActivitySidePanel (Notes + History)
└── MatchWizardDialog (shared, opened from Match tab or empty state)
```

**Data flow:** `JobDetailsPage` fetches `useJobQuery` (includes `job.match` for Overview summary). `MatchTabContent` fetches `useJobMatchQuery(jobId)` independently. `MatchWizardDialog` calls `generateJobMatch` mutation and triggers SSE on completion.

**External interactions:** SSE endpoint `/matches/:id/stream` for `match_status_changed` events. GraphQL queries `Job`, `JobMatch`. Mutations: `generateJobMatch`, `deleteMatchAnalysis`.

## Implementation Design

### Core Interfaces

```ts
// apps/web/src/modules/jobs/details/components/MatchTabContent.tsx

interface MatchTabContentProps {
  jobId: string;
}

// Returns null if no match; renders full match UI otherwise.
// Manages its own useJobMatchQuery, SSE, filter state, and dialogs.
export function MatchTabContent({ jobId }: MatchTabContentProps): ReactNode;
```

```ts
// apps/web/src/app/(authenticated)/jobs/[id]/match/page.tsx

interface MatchPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Renders JobDetailsPage with defaultValue="match" on the Tabs.
export default function JobMatchPage({ params }: MatchPageProps): ReactNode;
```

### Data Models

No new GraphQL types or DB changes. Existing types reused:

| Type                 | Source           | Usage                                                |
| -------------------- | ---------------- | ---------------------------------------------------- |
| `MatchAnalysisType`  | `schema.gql:82`  | `useJobMatchQuery` result and `MatchTabContent` data |
| `MatchItemType`      | `schema.gql:54`  | `MatchItemCard` props                                |
| `JobType.match`      | `schema.gql:140` | `MatchAnalysisField` in Overview (parent query)      |
| `GenerateMatchInput` | `schema.gql:425` | `MatchWizardDialog` → `onGenerate(resumeId)`         |

### Routes

| Route              | Method       | Description                                        |
| ------------------ | ------------ | -------------------------------------------------- |
| `/jobs/[id]/match` | GET          | Renders JobDetailsPage with Match tab pre-selected |
| `/matches/[id]`    | 308 Redirect | Permanently redirects to `/jobs/[id]/match`        |

The `/matches` list route is removed.

## Integration Points

### Next.js Redirect

Add to `apps/web/config/legacy-route-redirects.ts`:

```ts
{ source: "/matches/:id", destination: "/jobs/:id/match", permanent: true },
```

`permanent: true` produces HTTP 308. Next.js applies redirects before page rendering — no server-side match lookup needed.

### SSE Streaming

`MatchTabContent` subscribes to `GET /matches/:id/stream` with event name `match_status_changed`. On `COMPLETED` or `FAILED` status, it calls `refetch()` on the `useJobMatchQuery`. The `matchId` is derived from the query result (not props), so the subscription only starts when match data exists.

### GraphQL Mutations

| Mutation              | Caller                                        | Cache Strategy                                                                                                                                             |
| --------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generateJobMatch`    | `MatchTabContent` (via wizard → `onGenerate`) | Natural cache update — mutation returns `MatchAnalysisType`                                                                                                |
| `deleteMatchAnalysis` | `MatchTabContent` (delete dialog)             | `refetchQueries: ["Job"]` — forces parent `useJobQuery` refetch, clearing `job.match`. **TODO: revisit refetch strategy for more surgical cache eviction** |

## Impact Analysis

| Component                   | Impact Type | Description and Risk                                                                                                                                               | Required Action                                                                                                                              |
| --------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `JobDetailsPage`            | Modified    | Add Match tab trigger + content; remove "Match analysis" from header dropdown; change `handleGenerateMatch` to select tab instead of navigating to `/matches/[id]` | Edit `apps/web/src/modules/jobs/details/page/JobDetailsPage.tsx`                                                                             |
| `MatchTabContent`           | New         | Full match analysis UI as tab content: query, SSE, filters, grid, empty states, toolbar, dialogs                                                                   | Create `apps/web/src/modules/jobs/details/components/MatchTabContent.tsx`                                                                    |
| `JobMatchPage` (route)      | New         | Next.js App Router page at `/jobs/[id]/match` rendering `JobDetailsPage` with `defaultValue="match"`                                                               | Create `apps/web/src/app/(authenticated)/jobs/[id]/match/page.tsx`                                                                           |
| `MatchAnalysisPage`         | Deprecated  | Standalone match detail page — deleted entirely                                                                                                                    | Delete `apps/web/src/app/(authenticated)/matches/[id]/page.tsx` and `apps/web/src/modules/match-analyses/details/page/MatchAnalysisPage.tsx` |
| `MatchAnalysesPage`         | Deprecated  | Standalone match list page — deleted entirely                                                                                                                      | Delete `apps/web/src/app/(authenticated)/matches/page.tsx` and `apps/web/src/modules/match-analyses/list/page/MatchAnalysesPage.tsx`         |
| `MatchAnalysisField`        | Modified    | Overview link target changes from `/matches/${match.id}` to `/jobs/[id]/match`                                                                                     | Edit `apps/web/src/modules/jobs/details/components/MatchAnalysisField.tsx`                                                                   |
| `Sidebar`                   | Modified    | Remove `{ href: "/matches", label: "Matches", icon: SparkleIcon }` from `navItems`                                                                                 | Edit `apps/web/src/modules/navigation/components/Sidebar.tsx`                                                                                |
| `legacy-route-redirects.ts` | Modified    | Add `/matches/:id` → `/jobs/:id/match` permanent redirect                                                                                                          | Edit `apps/web/config/legacy-route-redirects.ts`                                                                                             |
| `MatchWizardDialog`         | Unchanged   | Shared component used by both old page and new tab — stays in place                                                                                                | None                                                                                                                                         |
| `MatchItemCard`             | Unchanged   | Shared card component — imported by `MatchTabContent`                                                                                                              | None                                                                                                                                         |
| `MatchStatusBadge`          | Unchanged   | Shared badge component                                                                                                                                             | None                                                                                                                                         |
| `MatchClassification`       | Unchanged   | Shared classification component                                                                                                                                    | None                                                                                                                                         |
| `useJobDetailsViewModel`    | Unchanged   | No match SSE added — SSE stays in `MatchTabContent`                                                                                                                | None                                                                                                                                         |

## Testing Approach

### Unit Tests

- `MatchTabContent`: empty states (no match, processing, failed), filter logic (`all`/Fits/Gaps/Unclear), toolbar actions visibility based on match state
- `MatchAnalysisField`: link target change (`/jobs/[id]/match` instead of `/matches/[id]`)
- `Sidebar`: nav item list no longer includes Matches; active state on `/jobs` routes still works
- `legacy-route-redirects`: ensure `/matches/:id` redirect entry present with `permanent: true`

### Integration Tests

- Full flow: navigate to `/jobs/[id]` → click Match tab → verify masonry grid renders → filter by "Gaps" → verify filtered items
- Generate flow: open Match tab on job with no match → click Generate → wizard opens → select resume → generate → SSE fires → tab refreshes with match data
- Delete flow: open Match tab with match → Actions → Remove → confirm → tab shows empty state; switch to Overview → verify "Not analyzed"
- Redirect flow: navigate to `/matches/[id]` → receive 308 → land on `/jobs/[id]/match` with Match tab active
- Mobile: verify Match tab appears in mobile TabsList; all content accessible

### Environment

- Vitest with jsdom for unit tests
- Playwright for integration tests (existing `apps/web/e2e/` infrastructure)
- Apollo `MockedProvider` for GraphQL-dependent unit tests

## Development Sequencing

### Build Order

1. **Remove "Match analysis" from JobDetailsPage header** — drop the `DropdownMenuItem` at line 221-232 and related `handleGenerateMatch` navigation logic. No dependencies.
2. **Update `MatchAnalysisField` link target** — change `router.push(`/matches/${match.id}`)` to `router.push(`/jobs/${jobId}/match`)`. Must receive `jobId` (already in props). No dependencies.
3. **Remove Matches from Sidebar** — delete line 32 from `navItems` array. No dependencies.
4. **Create `MatchTabContent` component** — depends on steps 1-2 (header and field no longer point to old routes). Implements full match UI: `useJobMatchQuery`, SSE, verdict filters, masonry grid, toolbar with Generate/Delete, empty states, wizard dialog.
5. **Create `/jobs/[id]/match` route** — depends on step 4 (component exists). Follows `/jobs/[id]/notes` pattern: page renders `JobDetailsPage` with `defaultValue="match"`.
6. **Add Match tab to JobDetailsPage** — depends on steps 4-5. Add `TabsTrigger` and `TabsContent` for `value="match"` in both desktop and mobile layouts.
7. **Add redirect `/matches/[id]` → `/jobs/[id]/match`** — depends on step 5 (target route exists). Add to `legacy-route-redirects.ts`.
8. **Delete standalone match routes and pages** — depends on steps 6-7 (new tab and redirect are in place). Delete route files under `app/(authenticated)/matches/` and page components.
9. **Codegen and cleanup** — run `pnpm --filter @job-tracker/web run codegen`, `pnpm fix:imports`, `pnpm lint`, `pnpm typecheck`, `pnpm test`. Verify zero dead imports via `pnpm knip`.

### Technical Dependencies

- No infrastructure changes required
- No new packages or external services
- Must verify `MatchWizardDialog` callers after step 1 (removing `handleGenerateMatch` from `JobDetailsPage` — the wizard still needs a generation handler, which moves into `MatchTabContent`)

## Monitoring and Observability

- **Key metrics:** 308 redirect hit rate (via Next.js server logs). Zero 404s on `/matches/*` after deploy confirms redirect coverage.
- **Log events:** SSE `match_status_changed` events — verify they still fire and trigger refetch inside `MatchTabContent`.
- **Alerting:** Standard API error alerting covers `generateJobMatch` and `deleteMatchAnalysis` mutations. No new thresholds.

## Technical Considerations

### Key Decisions

- **Decision:** Match tab uses independent `useJobMatchQuery` instead of reusing parent's `job.match`. **Rationale:** Decouples loading/error states; allows lazy loading only when tab is active; isolates SSE refetch. **Trade-off:** Two Apollo queries for same entity. **Alternative rejected:** Reusing parent cache — would couple tab rendering to job query lifecycle.
- **Decision:** SSE listener lives inside `MatchTabContent`, not `JobDetailsPage`. **Rationale:** Subscription lifecycle matches component mount/unmount; no wasted connection when tab is inactive. **Trade-off:** Overview `MatchAnalysisField` won't auto-refresh on SSE if user is on Overview tab. Mitigated by `cache-and-network` fetch policy. **Alternative rejected:** Placing SSE in view-model — couples match concerns into job orchestrator.
- **Decision:** Delete all standalone match routes and page components, build `MatchTabContent` from scratch. **Rationale:** Page structure (header, BackToLink, page-level error states) doesn't map to tab content. Reusable sub-components (`MatchItemCard`, `MatchWizardDialog`) stay. **Trade-off:** Must verify no broken imports remain. **Alternative rejected:** Gradual extraction — unnecessary ceremony for a straight port.

### Known Risks

| Risk                                                                | Likelihood | Mitigation                                                                                                                   |
| ------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `MatchWizardDialog` import chain breaks after deleting old pages    | Low        | Wizard lives in `details/components/` and is imported directly by `MatchTabContent`; no transitive dep on page files         |
| Sidebar active state breaks for `/jobs` routes                      | Low        | Active check is `pathname.startsWith(href)` — `/jobs/*` still matches `/jobs`                                                |
| Mobile layout breaks with 5 tabs (was 5, now 6 with Match)          | Medium     | Match tab in mobile `TabsList` uses `flex-wrap` (existing pattern). Tab labels are short (1-2 words). Test on 375px viewport |
| `knip` flags `MatchAnalysisPage` imports as dead code after removal | Low        | Delete the files — knip only flags unused exports in existing files                                                          |
| Browser caches old `/matches` redirects as 301 (now 308)            | Low        | Using 308 from the start. If this were a migration from 301, we'd need cache-busting; not applicable here                    |

## Architecture Decision Records

- [ADR-001: Match as Dedicated Main-Column Tab](adrs/adr-001.md) — Match tab lives in main column TabsList with its own toolbar, not in the side panel
- [ADR-002: Independent Data Fetching for MatchTabContent](adrs/adr-002.md) — `MatchTabContent` uses its own `useJobMatchQuery(jobId)`, decoupled from parent's `useJobQuery`
- [ADR-003: SSE Ownership in MatchTabContent](adrs/adr-003.md) — SSE listener for `match_status_changed` lives inside the tab component, not the page view-model
- [ADR-004: Full Removal of Standalone Match Routes and Pages](adrs/adr-004.md) — Delete all `/matches` route files and page components; build `MatchTabContent` from scratch

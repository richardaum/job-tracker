# TechSpec: Quick Filter Count Badges

## Executive Summary

Add a new GraphQL query `quickFilterCounts(company, runId): [FilterCount!]!` that returns counts per quick filter key. A single aggregate SQL query (COUNT + CASE) computes all 7 counts in one database round-trip. The front-end `QuickFilters` component renders `{label} ({count})` inline in each `FilterChip` string, hiding the badge when count is 0. The existing `jobs` query stays completely unchanged — zero migration cost.

**Primary trade-off:** Two independent queries instead of one wrapper — counts are fetched in a separate round-trip and must be explicitly refetched after mutations that change job counts.

## System Architecture

### Component Overview

| Component                            | Location                                                     | Responsibility                                                |
| ------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------- |
| `FilterCountType`                    | `apps/api/src/domains/jobs/filter-count.type.ts`             | GraphQL type: `{ key: ApplicationQuickFilter!, count: Int! }` |
| `JobsListQuery.countByQuickFilter()` | `apps/api/src/domains/jobs/jobs-list.query.ts`               | SQL aggregate query — 7 counts in one round-trip              |
| `JobsResolver.quickFilterCounts()`   | `apps/api/src/domains/jobs/jobs.resolver.ts`                 | New resolver method, same auth guards                         |
| `QuickFilters`                       | `apps/web/src/modules/jobs/list/components/QuickFilters.tsx` | Uses new hook, renders chips with count badges                |
| `FilterChip`                         | `packages/ui/src/components/FilterChip/FilterChip.tsx`       | Unchanged — count rendered inline in children                 |
| `quick-filter-counts.graphql`        | `apps/web/src/graphql/quick-filter-counts.graphql`           | New GraphQL operation                                         |

### Data Flow

```
Browser → Apollo (quickFilterCounts query) → GraphQL → JobsResolver
                                                              │
                                                              └─ JobsListQuery.countByQuickFilter()
                                                              ↓
                                                     [FilterCount!]!
                                                              ↓
                                                   QuickFilters maps to chips
                                                   renders "Label (N)"
```

The `jobs` list query is unchanged and runs independently.

## Implementation Design

### Core Interfaces

```typescript
// apps/api/src/domains/jobs/filter-count.type.ts
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { ApplicationQuickFilterEnum } from "./job-quick-filter.enum";

@ObjectType()
export class FilterCountType {
  @Field(() => ApplicationQuickFilterEnum)
  key: ApplicationQuickFilterEnum;

  @Field(() => Int)
  count: number;
}
```

```graphql
# New query (added to schema.gql)
type Query {
  quickFilterCounts(company: String, runId: ID): [FilterCount!]!
}
```

### Data Models

```graphql
type FilterCount {
  key: ApplicationQuickFilter!
  count: Int!
}
```

```typescript
// Backend DTO
interface FilterCount {
  key: ApplicationQuickFilterEnum;
  count: number;
}

// Front-end hook return
interface UseQuickFilterCountsResult {
  filterCounts: FilterCount[];
  loading: boolean;
  refetch: () => Promise<...>;
}
```

### API Endpoints

| Method                    | Path                                | Description                                              |
| ------------------------- | ----------------------------------- | -------------------------------------------------------- |
| `Query.quickFilterCounts` | `quickFilterCounts(company, runId)` | Returns all 7 filter counts. Same auth guards as `jobs`. |
| `Query.jobs`              | `jobs(filter, company, runId)`      | Unchanged — still returns `[JobType!]!`.                 |

## Integration Points

None. This feature is entirely contained within the existing `apps/api` and `apps/web` packages.

## Impact Analysis

| Component                                                                                  | Impact Type | Description                                           | Action                     |
| ------------------------------------------------------------------------------------------ | ----------- | ----------------------------------------------------- | -------------------------- |
| `apps/api/src/domains/jobs/filter-count.type.ts`                                           | New         | `@ObjectType()` class                                 | Create file                |
| `apps/api/src/domains/jobs/jobs-list.query.ts`                                             | Modified    | Add `countByQuickFilter()` method                     | Add aggregate query        |
| `apps/api/src/domains/jobs/jobs.resolver.ts`                                               | Modified    | Add `quickFilterCounts()` resolver method             | Add new @Query method      |
| `apps/api/src/schema.gql`                                                                  | Regenerated | Adds `FilterCount` type and `quickFilterCounts` query | Regenerate via API restart |
| `apps/web/src/graphql/quick-filter-counts.graphql`                                         | New         | GraphQL operation definition                          | Create file                |
| `apps/web/src/gql/`                                                                        | Regenerated | Codegen adds `useQuickFilterCountsQuery` hook         | Run codegen                |
| `apps/web/src/modules/jobs/list/components/QuickFilters.tsx`                               | Modified    | Use new hook, render count badges                     | Edit component             |
| List-page mutation components (DeleteJobDialog, JobQuickEditDialog, PasteListenerProvider) | Modified    | Add `QuickFilterCountsDocument` to `refetchQueries`   | 3 minor edits              |
| `apps/web/src/modules/jobs/list/hooks/useJobsListViewModel.ts`                             | Unchanged   | No change needed                                      | None                       |
| `apps/web/src/graphql/jobs.graphql`                                                        | Unchanged   | No change needed                                      | None                       |
| `packages/ui/src/components/FilterChip/FilterChip.tsx`                                     | Unchanged   | Count rendered inline in children                     | None                       |
| All existing callers of `data.jobs`                                                        | Unchanged   | No migration needed                                   | None                       |

## Testing Approach

### Unit Tests

| Test                               | File                      | What to test                                                                                                             |
| ---------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `JobsListQuery.countByQuickFilter` | `jobs-list.query.spec.ts` | Returns correct counts per filter key; respects user/company/runId scoping                                               |
| `JobsResolver.quickFilterCounts`   | `jobs.resolver.spec.ts`   | Delegates to service, returns correct type                                                                               |
| `QuickFilters`                     | `QuickFilters.test.tsx`   | Count badge renders when count > 0; badge hidden when count = 0; chip click still toggles filter; refetch after mutation |

### Integration Tests

- Verify `quickFilterCounts` GraphQL query returns expected shape and correct counts
- Verify count accuracy against known database state

## Development Sequencing

### Build Order

1. **Backend types + query** — Create `FilterCountType`, add `countByQuickFilter()` to `JobsListQuery` (no dependencies)
2. **Backend resolver** — Add `quickFilterCounts()` resolver method (depends on step 1)
3. **Regenerate schema** — `pm2 restart api` writes `schema.gql` (depends on step 2)
4. **Frontend codegen** — `pnpm --filter @job-tracker/web run codegen` (depends on step 3)
5. **Frontend GraphQL operation** — Create `quick-filter-counts.graphql` (depends on step 4)
6. **Frontend QuickFilters** — Use `useQuickFilterCountsQuery`, render count badges (depends on step 5)
7. **List-page mutations** — Add `QuickFilterCountsDocument` to `refetchQueries` in 3 components (depends on step 5)

### Technical Dependencies

- No external dependencies.

## Monitoring and Observability

None required. Counts are fetched via a lightweight aggregate query — negligible overhead.

## Technical Considerations

### Key Decisions

| Decision          | Chosen Approach                                | Rationale                           | Alternatives Rejected                 |
| ----------------- | ---------------------------------------------- | ----------------------------------- | ------------------------------------- |
| API shape         | Separate `quickFilterCounts` query             | Zero migration, independent caching | Wrapper type (breaks 13+ callers)     |
| Count computation | Single aggregate SQL (COUNT + CASE)            | One database round-trip             | 7 individual COUNT queries            |
| Badge rendering   | Inline string in `FilterChip` children         | No prop change, simplest            | `count` prop, `<Badge>` sub-component |
| Refetch strategy  | Add to `refetchQueries` on list-page mutations | Immediate updates on list page      | Full real-time (overengineered)       |

### Known Risks

| Risk                                         | Likelihood | Mitigation                                                                                               |
| -------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| Stale counts on detail-page mutations        | Medium     | `cache-and-network` refetches on navigation back to list; add explicit refetch if users report staleness |
| Aggregate query duplicates filter predicates | Medium     | Extract shared logic into helpers if drift becomes an issue                                              |

## Architecture Decision Records

- [ADR-001: Static Count Badges for Quick Filters](adrs/adr-001.md) — Static count badges on all chips, hide at 0, refresh on load + mutations, fixed filter order.
- [ADR-002: Separate GraphQL Query for Filter Counts](adrs/adr-002.md) — New `quickFilterCounts` independent query instead of wrapper type.
- [ADR-003: Single Aggregate Query for Filter Counts](adrs/adr-003.md) — One SQL query (COUNT + CASE) computes all 7 filter counts in one round-trip.

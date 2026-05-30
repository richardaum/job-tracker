# TechSpec: Scan Plan Stop Conditions

## Executive Summary

Add `boardType` (mandatory) to the Plan document and `stopWhen` (mandatory) with parameter fields to the SourceTemplate. The extension reads board type from the plan and stop config from the source run data, then applies the selected stop strategy during scan execution. Stop strategies include CatchUp (consecutive duplicates, sequential only), FirstRunMaxPages (cap on early runs), and OlderThan (job age threshold, requires `publishedAt` in the plan).

**Primary trade-off:** stop conditions move to the SourceTemplate, adding a schema change and requiring the extension to receive stop config from the source run API. This adds complexity but enables per-user customization and first-run handling.

## System Architecture

### Component Overview

| Component                       | Role                        | Change                                                      |
| ------------------------------- | --------------------------- | ----------------------------------------------------------- |
| `PlanSchema` (Zod)              | Validate plan document      | Add mandatory `boardType`, drop `stopWhen` fields           |
| `plan.entity.ts`                | DB entity for plans         | — (boardType stays in document JSONB)                       |
| `source-template.entity.ts`     | DB entity for templates     | Add `config` JSONB column                                   |
| `source-run.type.ts`            | GraphQL type for runs       | Add stop config fields (from template)                      |
| `SourceTemplateService`         | CRUD templates              | Validate stop config, cross-validate OlderThan against plan |
| `CollectJobsService`            | Page-by-page collection     | Receive boardType + stop config, apply stop logic           |
| `isJobDuplicate` query (server) | Lightweight duplicate check | New GraphQL query                                           |
| `ApiService` (extension)        | GraphQL client              | New `isJobDuplicate()` method                               |
| Admin Plan UI (web)             | Create/edit plans           | Mandatory boardType dropdown                                |
| User Template UI (web)          | Create/edit templates       | Stop condition + parameter fields                           |

### Data Flow

```
SourceTemplate → create/update:
  1. User selects stopWhen + parameters
  2. Server validates: CatchUp → needs catchUpThreshold; FirstRunMaxPages → needs maxPages; OlderThan → needs olderThanDays + plan has publishedAt
  3. Saves to template's config JSONB

SourceRun → execute:
  1. Extension queries pending runs → receives stop config from SourceRun
  2. Extension loads plan → reads boardType + publishedAt presence (for OlderThan)
  3. CollectJobsService receives both and applies stop logic per page
```

## Implementation Design

### Core Interfaces

**Plan schema** — `boardType` mandatory:

```typescript
export const PlanSchema = z
  .object({
    id: z.uuid(),
    steps: z.array(PlanStepSchema).max(LIMITS.planSteps),
    boardType: z.enum(["Sequential", "NonSequential"]),
  })
  .strict()
  .describe("Strict JSON plan");
```

**SourceTemplate config** — stop conditions:

```typescript
export const SourceTemplateConfigSchema = z
  .object({
    stopWhen: z.enum(["CatchUp", "FirstRunMaxPages", "OlderThan"]),
    catchUpThreshold: z.number().int().positive().optional(),
    maxPages: z.number().int().positive().optional(),
    olderThanDays: z.number().int().positive().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.stopWhen === "CatchUp" && !data.catchUpThreshold) {
      ctx.addIssue({
        code: "custom",
        path: ["catchUpThreshold"],
        message: "Required when stopWhen is CatchUp",
      });
    }
    if (data.stopWhen === "FirstRunMaxPages" && !data.maxPages) {
      ctx.addIssue({
        code: "custom",
        path: ["maxPages"],
        message: "Required when stopWhen is FirstRunMaxPages",
      });
    }
    if (data.stopWhen === "OlderThan" && !data.olderThanDays) {
      ctx.addIssue({
        code: "custom",
        path: ["olderThanDays"],
        message: "Required when stopWhen is OlderThan",
      });
    }
  });
```

**Extension execution context:**

```typescript
export type PlanExecuteOptions = {
  surfaceUrl: string;
  onJobCollected?: (job: Job) => Promise<{ duplicate: boolean } | void>;
  boardType: "Sequential" | "NonSequential";
  stopWhen?: "CatchUp" | "FirstRunMaxPages" | "OlderThan";
  catchUpThreshold?: number;
  maxPages?: number;
  olderThanDays?: number;
  publishedAtField?: string; // name of the surface field holding publish date
};
```

**CollectJobsService stop logic:**

```typescript
let consecutiveDuplicates = 0;

for (let iteration = 1; iteration <= MAX_PAGES; iteration += 1) {
  // ... collect surface list, extract details, onJobCollected ...

  // Check stop conditions after processing this page
  if (shouldStopAfterPage(iteration, options, consecutiveDuplicates)) {
    logService.info("collect-jobs:stop-condition-met", { iteration, ... });
    break;
  }

  // Navigate to next page
  const canNavigate = await this.paginationMessaging.canNavigateToNextPage(...);
  if (!canNavigate) break;
  // ... navigate ...
}

function shouldStopAfterPage(page: number, opts: PlanExecuteOptions, consecutiveDupes: number): boolean {
  switch (opts.stopWhen) {
    case "CatchUp":
      return opts.boardType === "Sequential" && consecutiveDupes >= (opts.catchUpThreshold ?? Infinity);
    case "FirstRunMaxPages":
      return page >= (opts.maxPages ?? 1);
    case "OlderThan":
      // checked per-job: if the current page's first job (newest) is older than threshold, stop
      // implements per-page with first-job check
      return opts.publishedAtField != null && isPageExclusivelyOlder(page, opts.olderThanDays);
    default:
      return false;
  }
}
```

### Data Models

**SourceTemplate — new `config` JSONB column:**

```typescript
// apps/api/src/database/entities/source-template.entity.ts
@Column({ type: "jsonb", nullable: true })
config?: Record<string, unknown>;
```

Document shape:

```json
{ "stopWhen": "CatchUp", "catchUpThreshold": 5 }
```

### API Endpoints

**New GraphQL query:**

```graphql
query IsJobDuplicate($company: String!, $title: String!) {
  isJobDuplicate(company: $company, title: $title)
}
```

Returns `Boolean!`. Server resolves company name → companyId, then runs the same check as `JobDuplicateService` using the authenticated user's settings (`duplicateWindowDays`).

**SourceRun type — new stop config fields:**

```graphql
type SourceRunType {
  id: ID!
  planId: ID!
  surfaceUrl: String!
  status: SourceRunStatus!
  # stop config (from template)
  stopWhen: StopWhen
  catchUpThreshold: Int
  maxPages: Int
  olderThanDays: Int
}
```

## Integration Points

None. The `isJobDuplicate` query and stop config validation are internal to the API.

## Impact Analysis

| Component                                                          | Impact   | Description                                            | Action                             |
| ------------------------------------------------------------------ | -------- | ------------------------------------------------------ | ---------------------------------- |
| `apps/api/src/domains/sources/source-template.entity.ts`           | Modified | Add `config` JSONB column                              | Migration                          |
| `apps/api/src/domains/sources/source-run.type.ts`                  | Modified | Add stop config fields                                 | Add fields populated from template |
| `apps/api/src/domains/sources/sources.service.ts`                  | Modified | Validate stop config, cross-validate OlderThan         | Add validation                     |
| `apps/api/src/domains/jobs/job-duplicate.service.ts`               | Modified | New `checkDuplicate` method                            | Add company-name-based check       |
| `apps/api/src/domains/jobs/jobs.resolver.ts`                       | Modified | `isJobDuplicate` query                                 | New resolver                       |
| `apps/api/src/database/migrations/`                                | New      | Add `config` column to `source_templates`              | Migration                          |
| `apps/extension/src/domains/plan/model/schema.ts`                  | Modified | Add mandatory `boardType`, remove stopWhen             | Update PlanSchema                  |
| `apps/extension/src/domains/plan/model/types.ts`                   | Modified | Update `Plan` type                                     | Auto via z.infer                   |
| `apps/extension/src/domains/plan/plan-execute-options.ts`          | Modified | Add all scan config fields                             | Update type                        |
| `apps/extension/src/domains/plan/services/collect-jobs.service.ts` | Modified | Apply all three stop strategies                        | Counter + break logic              |
| `apps/extension/src/domains/sources/source-run-events.service.ts`  | Modified | Read stop config from run data, pass to collector      | Update callback                    |
| `apps/extension/src/domains/api/api.service.ts`                    | Modified | Add `isJobDuplicate()`                                 | New method                         |
| `apps/extension/src/domains/sources/source-run-plan.ts`            | Modified | Pass boardType to execute                              | Update                             |
| `apps/extension/src/domains/plan/fixtures/`                        | Modified | Add boardType to fixtures                              | Update JSONs                       |
| `apps/web/src/modules/sources/`                                    | Modified | Plan UI: mandatory boardType; Template UI: stop config | New form fields                    |

## Testing Approach

### Unit Tests

- `SourceTemplateConfigSchema`: validate all three stop conditions with required/optional params
- `CollectJobsService`: mock onJobCollected, verify each stop strategy breaks correctly
- `isJobDuplicate`: mock JobDuplicateService

### Integration Tests

- `isJobDuplicate` query against real DB: verify false positives/negatives
- Create template with invalid stop config (CatchUp without threshold) → rejected
- Create template with OlderThan but plan lacks publishedAt → rejected

## Development Sequencing

### Build Order

1. **Server: migration** — add `config` JSONB column to `source_templates`. No dependencies.

2. **Server: `isJobDuplicate` query** — `JobDuplicateService.checkDuplicate` + resolver. Depends on nothing (no config).

3. **Server: SourceTemplate stop validation** — validate config on create/update. Cross-validate OlderThan against plan's surfaceFields. Depends on step 1.

4. **Server: SourceRun stop config fields** — add stop config to `SourceRunType`, populated from template. Depends on step 1.

5. **Extension: Plan schema** — add mandatory `boardType`, remove stopWhen fields. No dependencies.

6. **Extension: `isJobDuplicate` GraphQL op + ApiService** — new `.graphql` file, codegen, ApiService method. Depends on step 2.

7. **Extension: SourceRun stop config** — read stop config from API response, pass to `PlanExecuteOptions`. Depends on step 4.

8. **Extension: CollectJobsService stop logic** — apply all three strategies. Depends on steps 5, 6, 7.

9. **Extension: Plan fixtures** — add boardType to fixture JSONs. Depends on step 5.

10. **Web: Admin Plan UI** — mandatory boardType dropdown. Depends on step 5.

11. **Web: User Template UI** — stop condition and parameter fields. Depends on step 1 (config column exists).

### Technical Dependencies

None. All changes are internal to the monorepo.

## Monitoring and Observability

- Log stop reason on every scan completion: `{ stopCondition: "CatchUp" | "FirstRunMaxPages" | "OlderThan" | "noMorePages", consecutiveDuplicates?, pagesScanned: number }`
- Track scan duration and pages scanned per template for success metrics

## Technical Considerations

### Key Decisions

- **`boardType` on Plan, `stopWhen` on SourceTemplate** — clear ownership separation. ADR-001.
- **Dedicated `isJobDuplicate` query** over mutation response. Clean read-before-write pattern. ADR-002.
- **JSONB `config` column** on `source_templates` — flexible for future stop conditions without schema migrations.
- **FirstRunMaxPages count-based** (total runs) rather than time-based — avoids edge cases with inactive templates.

### Known Risks

- **SourceRun API latency**: adding stop config fields to SourceRunType increases the query payload slightly. Negligible impact.
- **OlderThan validation**: cross-document validation (template config + plan surfaceFields) adds complexity. Mitigation: validate on template create/update only, not on every scan.
- **FirstRunMaxPages semantics**: "how many early runs use FirstRunMaxPages?" Proposed: a `firstRunMaxPagesCount` field (default 3) controls how many initial runs use this strategy before switching to the template's other behavior. Or FirstRunMaxPages is used alone. The MVP can keep it simple: when stopWhen=FirstRunMaxPages, ALWAYS stop after maxPages. User switches strategy once they have enough data.

## Architecture Decision Records

- [ADR-001: Board type in Plan document JSONB; stop conditions in SourceTemplate](adrs/adr-001.md)
- [ADR-002: Extension-driven duplicate check via dedicated GraphQL query](adrs/adr-002.md)

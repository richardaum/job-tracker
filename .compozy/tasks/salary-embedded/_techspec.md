# TechSpec: Salary TypeORM Embedded Refactor

## Executive Summary

Consolidate 4 flat salary columns (`salaryMinCents`, `salaryMaxCents`, `salaryCurrency`, `salaryPeriod`) on `JobEntity` into a single `SalaryEmbedded` TypeORM embedded class with co-located validation. The embedded becomes the canonical source of truth for salary data shape, replacing the `SalaryColumns` flat type throughout the API.

Key decisions (see ADRs): embedded carries `class-validator` decorators + `validate()`/`normalize()` methods (ADR-001); GraphQL inputs become nested via `JobSalaryInput`; `SalaryResolver` is removed in favor of direct TypeGraphQL exposure; the `salary` field becomes nullable on GraphQL output (ADR-002).

Primary trade-off: removing the `@ResolveField` resolver and making salary nullable simplifies the codebase but changes the GraphQL contract (`JobSalary!` → `JobSalary`), requiring frontend adjustments.

## System Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Database: jobs table (unchanged)                                 │
│  salary_min_cents | salary_max_cents | salary_currency            │
│  | salary_period                                                  │
├─────────────────────────────────────────────────────────────────┤
│  SalaryEmbedded (new)                                             │
│  @Column() minCents, maxCents, currency, period                   │
│  + class-validator + validate() + normalize()                     │
├─────────────────────────────────────────────────────────────────┤
│  JobEntity                                                        │
│  @Column(() => SalaryEmbedded, { prefix: "salary" })              │
│  salary?: SalaryEmbedded | null                                   │
│  @Field(() => JobSalaryType, { nullable: true })                  │
│  salary?: JobSalaryType | null  (GraphQL)                         │
├─────────────────────────────────────────────────────────────────┤
│  SalaryService (refactored)                                       │
│  getCreateSalary(input) → SalaryEmbedded                          │
│  getUpdateSalary(current, input) → SalaryEmbedded | null          │
│  Delegates validation to SalaryEmbedded.validate()                │
├─────────────────────────────────────────────────────────────────┤
│  JobsService / JobsRepository / DraftNormalization                │
│  All consume SalaryEmbedded instead of flat salary keys            │
└─────────────────────────────────────────────────────────────────┘
```

Data flow: GraphQL input (`JobSalaryInput`) → `JobsResolver` → `JobsService.create()` (flat `CreateDto`) → `SalaryService.getCreateSalary()` → `SalaryEmbedded` → `JobsRepository.create()` → TypeORM persists 4 columns with `salary` prefix.

### Deleted Components

- `SalaryResolver` (`salary/salary.resolver.ts`) — field mapping no longer needed
- `SalaryColumns` type (`salary/salary.schema.ts`) — replaced by `SalaryEmbedded`
- `SalaryInput` type — replaced by `JobSalaryInput` (GraphQL) + inline shape in `SalaryService`

## Implementation Design

### Core Interfaces

```ts
// apps/api/src/database/embeddeds/salary.embedded.ts
export class SalaryEmbedded {
  @Column({ type: "integer", nullable: true })
  minCents!: number | null;

  @Column({ type: "integer", nullable: true })
  maxCents!: number | null;

  @Column({ type: "text", nullable: true })
  currency!: string | null;

  @Column({
    type: "enum",
    enum: SalaryPeriodEnum,
    enumName: "salary_period",
    nullable: true,
  })
  period!: SalaryPeriodEnum | null;

  validate(): void {
    /* cross-field rules */
  }
  normalize(): void {
    /* trim + uppercase currency */
  }
}
```

```ts
// JobSalaryInput — new @InputType()
@InputType("JobSalary")
export class JobSalaryInput {
  @Field(() => Int, { nullable: true })
  minCents!: number | null;

  @Field(() => Int, { nullable: true })
  maxCents!: number | null;

  @Field(() => String, { nullable: true })
  currency!: string | null;

  @Field(() => SalaryPeriodEnum, { nullable: true })
  period!: SalaryPeriodEnum | null;
}
```

```ts
// SalaryService — refactored signatures
@Injectable()
export class SalaryService {
  getCreateSalary(input: JobSalaryInput): SalaryEmbedded {
    /* ... */
  }
  getUpdateSalary(current: Job, input: JobSalaryInput): SalaryEmbedded | null {
    /* ... */
  }
}
```

### Data Models

**Entity change** — `JobEntity` replaces 4 flat `@Column()` blocks:

```ts
// Before: 4 flat columns
@Column({ name: "salary_min_cents", type: "integer", nullable: true })
salaryMinCents!: number | null;
// ... (3 more)

// After: 1 embedded
@Column(() => SalaryEmbedded, { prefix: "salary" })
@Field(() => JobSalaryType, { nullable: true })
salary?: SalaryEmbedded | null;
```

**Column names preserved**: TypeORM prefix `salary` + embedded field names produce `salary_min_cents`, `salary_max_cents`, `salary_currency`, `salary_period` — identical to current DB schema. No migration needed.

**Repo DTOs** — `CreateJobRepoDto` drops salary keys from `Pick<>`, adds `salary`:

```ts
// Before
export type CreateJobRepoDto = Pick<
  NewJob,
  | "title"
  | "companyId"
  | "description"
  | "urls"
  | "source"
  | "salaryMinCents"
  | "salaryMaxCents"
  | "salaryCurrency"
  | "salaryPeriod"
  | "tags"
  | "location"
  | "workRegion"
> & { draftJobId?: string | null; sourceRunId?: string | null };

// After
export type CreateJobRepoDto = Pick<
  NewJob,
  "title" | "companyId" | "description" | "urls" | "source" | "tags" | "location" | "workRegion"
> & {
  salary?: SalaryEmbedded;
  draftJobId?: string | null;
  sourceRunId?: string | null;
};
```

**Service DTOs** — `CreateDto` replaces 4 flat salary fields with `salary?: JobSalaryInput`:

```ts
type CreateDto = {
  title: string;
  company: string;
  companyId?: string | null;
  description?: string | null;
  urls?: string[] | null;
  source?: ApplicationSourceEnum | null;
  salary?: JobSalaryInput;
  tags?: string[] | null;
  location?: string | null;
  workRegion?: string | null;
  draftJobId?: string | null;
  sourceRunId?: string | null;
};
```

**Normalized extraction** — `NormalizedDraftExtraction` uses `SalaryEmbedded` instead of 4 flat fields:

```ts
export type NormalizedDraftExtraction = {
  title: string;
  company: string;
  description: string | null;
  salary: SalaryEmbedded;
  tags: string[];
  location: string | null;
  workRegion: string | null;
};
```

**GraphQL inputs** — `CreateJobInput` and `UpdateJobInput` replace 4 flat `@Field` decorators:

```ts
// Before: 4 @Field() decorators
@Field(() => Int, { nullable: true }) salaryMinCents?: number | null;
// ... (3 more)

// After: 1 nested field
@Field(() => JobSalaryInput, { nullable: true })
salary?: JobSalaryInput;
```

**GraphQL output** — `JobType.salary` changes from `JobSalary!` to `JobSalary` (nullable). Delivered by `@Field` decorator on entity property, not by resolver.

### API Endpoints

This refactor does not introduce new API endpoints. Existing GraphQL queries and mutations maintain the same names:

| Operation                                              | Change                                             |
| ------------------------------------------------------ | -------------------------------------------------- |
| `query { jobs { salary { minCents } } }`               | Output type: `JobSalary!` → `JobSalary` (nullable) |
| `mutation { createJob(salary: { minCents: 100000 }) }` | Input shape: 4 flat args → 1 nested `salary` arg   |
| `mutation { updateJob(salary: { minCents: 100000 }) }` | Input shape: same change                           |
| `query { job(id) { salary { minCents } } }`            | Output: same change as list                        |

## Integration Points

None. This is an internal refactor within `apps/api`. No external service integration.

## Impact Analysis

| Component                             | Impact Type | Description and Risk                                                                                        | Required Action                                                                |
| ------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `SalaryEmbedded` (new)                | new         | New embedded class. Low risk — isolated.                                                                    | Implement column decorators + validation + normalize                           |
| `JobSalaryInput` (new)                | new         | New GraphQL input type. Low risk.                                                                           | Implement `@InputType` with 4 fields                                           |
| `JobEntity`                           | modified    | Replace 4 `@Column` with 1 embedded. Medium risk — TypeORM column name mismatch possible.                   | Add `@Field` decorator for GraphQL exposure                                    |
| `SalaryService`                       | modified    | Returns `SalaryEmbedded` instead of flat. Validates via embedded.                                           | Refactor `getCreateSalary`, `getUpdateSalary`, remove `assertValidSalaryState` |
| `SalaryResolver`                      | deprecated  | Removed. Low risk — no behavioral change.                                                                   | Delete file                                                                    |
| `CreateJobInput`                      | modified    | 4 flat `@Field` → 1 nested `salary`. Medium risk — codegen changes propagate to frontend.                   | Replace decorators                                                             |
| `UpdateJobInput`                      | modified    | Same as CreateJobInput.                                                                                     | Same                                                                           |
| `JobsRepository`                      | modified    | `CreateJobRepoDto` / `UpdateJobRepoDto` use `salary?: SalaryEmbedded`. Low risk.                            | Update `Pick<>`                                                                |
| `JobsService`                         | modified    | `CreateDto`/`UpdateDto` use `salary?: JobSalaryInput`. `processDraftConversion` consumes normalized salary. | Update DTOs, `create()` spread, conversion flow                                |
| `DraftExtractionNormalizationService` | modified    | `NormalizedDraftExtraction` uses `SalaryEmbedded`. `normalizeDraftSalaryFields` returns `SalaryEmbedded`.   | Update type and normalization logic                                            |
| `SummaryService`                      | modified    | Accesses `app.salary?.minCents` instead of `app.salaryMinCents`.                                            | Update field accessors                                                         |
| `salary.schema.ts`                    | modified    | Remove `SalaryColumns`, `SalaryInput` types. Keep `SalaryPeriodEnum`.                                       | Clean up dead types                                                            |
| `salary.service.spec.ts`              | modified    | Tests updated for `SalaryEmbedded` return type.                                                             | Update test assertions                                                         |
| `jobs.service.spec.ts`                | modified    | `makeJob()` uses `salary: null` instead of 4 flat nulls.                                                    | Update mock factories                                                          |
| `jobs.resolver.spec.ts`               | modified    | `mockJob` uses `salary: null`.                                                                              | Update mock                                                                    |
| `schema.gql`                          | modified    | `JobType.salary: JobSalary` (nullable). Inputs use nested salary.                                           | Regenerate schema                                                              |
| `apps/web/src/gql/`                   | modified    | Codegen output changes (input types, nullable salary).                                                      | Run codegen after schema update                                                |

## Testing Approach

### Unit Tests

**`SalaryEmbedded.validate()`** — add new test suite (`salary.embedded.spec.ts`):

- No amount set → passes (empty salary is valid)
- Amount without currency/period → throws
- Currency not ISO 4217 → throws
- Negative cents → throws
- minCents > maxCents → throws
- Valid salary → passes

**`SalaryEmbedded.normalize()`**:

- Lowercase currency → uppercase
- Trailing whitespace → trimmed
- Null currency → stays null

**`SalaryService`** — update existing `salary.service.spec.ts`:

- `getCreateSalary` returns `SalaryEmbedded` instance instead of flat object
- `getUpdateSalary` merge behavior unchanged, returns `SalaryEmbedded | null`

**`JobsService` / `JobsResolver`** — update mock factories:

- Replace 4 flat salary nulls with `salary: null`

### Integration Tests

- Verify TypeORM generates correct column names (`salary_min_cents`, etc.) by checking SQL logs or inspecting DB after create
- Verify `createJob` mutation with nested salary input persists correctly
- Verify `updateJob` mutation with nested salary input merges correctly
- Verify `jobs` query returns null for salary when not set

## Development Sequencing

### Build Order

1. **Create `SalaryEmbedded`** — no dependencies. Implement `apps/api/src/database/embeddeds/salary.embedded.ts` with `@Column` decorators, `class-validator`, `validate()`, and `normalize()`.

2. **Create `JobSalaryInput`** — no dependencies. Implement `@InputType` in `apps/api/src/domains/jobs/salary/`.

3. **Update `JobEntity`** — depends on step 1. Replace 4 flat `@Column` with embedded. Add `@Field` decorator for GraphQL exposure.

4. **Delete `SalaryResolver`** — depends on step 3. Remove `salary/salary.resolver.ts` and its registration in `SalaryModule`.

5. **Update `SalaryService`** — depends on steps 1, 2. Refactor to return `SalaryEmbedded`. Delegate validation to embedded.

6. **Update `salary.schema.ts`** — depends on step 5. Remove `SalaryColumns` and `SalaryInput` types.

7. **Update `CreateJobInput` and `UpdateJobInput`** — depends on step 2. Replace 4 flat `@Field` decorators with nested `salary`.

8. **Update `JobsRepository`** — depends on step 1. Update `CreateJobRepoDto`/`UpdateJobRepoDto`.

9. **Update `JobsService`** — depends on steps 2, 5, 7, 8. Update `CreateDto`/`UpdateDto`, `create()` method, `processDraftConversion()`.

10. **Update `DraftExtractionNormalizationService`** — depends on step 1. Update `NormalizedDraftExtraction` type and normalization logic.

11. **Update `SummaryService`** — depends on step 3. Update salary field accessors.

12. **Update spec files** — depends on all previous steps. Update mock factories and test assertions.

13. **Regenerate GraphQL schema + codegen** — depends on steps 2, 3, 4, 7.
    - `pm2 restart api` (generates `schema.gql`)
    - `pnpm --filter @job-tracker/web run codegen`

14. **Update frontend** — depends on step 13. Adjust components for nullable `salary` + nested input shape.

15. **Validation** — depends on all steps. Run `pnpm typecheck`, `pnpm lint`, `pnpm test`.

### Technical Dependencies

- `@Column(() => SalaryEmbedded, { prefix: "salary" })` requires TypeORM embedded support (already in project)
- `@Field` on embedded property requires TypeGraphQL to resolve nested types (supported)
- Zod schema in `draft-extraction.schema.ts` already nests salary — no change needed

## Monitoring and Observability

No new metrics or alerts. Existing logs in `SalaryService` and `JobsService` continue as before.

## Technical Considerations

### Key Decisions

- **Decision**: Embedded with `class-validator` (ADR-001). **Rationale**: Single source of truth for validation. **Trade-off**: Deviates from existing pure-data embeddeds.
- **Decision**: Nested GraphQL inputs (ADR-002). **Rationale**: Aligned with embedded shape, eliminates duplication. **Trade-off**: GraphQL schema change requires frontend updates.
- **Decision**: Remove `SalaryResolver` (ADR-002). **Rationale**: TypeGraphQL can expose embedded directly. **Trade-off**: Loses non-null contract.
- **Decision**: Nullable `salary` on GraphQL (ADR-002). **Rationale**: Natural mapping from nullable entity field. **Trade-off**: Consumer code uses `?.` everywhere.

### Known Risks

| Risk                                                   | Likelihood | Mitigation                                                                                            |
| ------------------------------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------- |
| TypeORM prefix produces wrong column names             | Low        | Verify with SQL logging or integration test; prefix `salary` + field `min_cents` → `salary_min_cents` |
| `@Field` on embedded property fails to resolve         | Low        | TypeGraphQL supports nested types; if issues arise, keep a minimal `@ResolveField`                    |
| Frontend codegen breaks on nullable salary             | Medium     | Review generated types; add optional chaining in components that access `job.salary`                  |
| ~14 files to touch, high chance of missing a reference | Medium     | Typecheck catches all type mismatches; run `pnpm typecheck` after each step                           |

## Architecture Decision Records

- [ADR-001: SalaryEmbedded with validation via class-validator](adrs/adr-001.md) — Single source of truth for salary shape and validation
- [ADR-002: API Surface Changes for Salary Embedded](adrs/adr-002.md) — Nested GraphQL inputs, resolver removal, nullable salary, embedded in repo DTOs

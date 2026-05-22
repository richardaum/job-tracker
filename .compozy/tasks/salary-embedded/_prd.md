# PRD: Salary TypeORM Embedded

## Overview

Consolidate the 4 flat salary columns on `JobEntity` into a single `SalaryEmbedded` TypeORM embedded class. Currently `salaryMinCents`, `salaryMaxCents`, `salaryCurrency`, and `salaryPeriod` are defined inline on the entity, validated in `SalaryService`, and mapped to GraphQL in `SalaryResolver`. This creates duplication: the same 4-field shape is defined in the entity, the Zod/schema types, the service, and the resolver.

A `SalaryEmbedded` class becomes the single source of truth for salary data shape and validation, following the existing `AsyncMetadataEmbedded` pattern already used for `summaryMetadata` and `generationMetadata`.

## Goals

- **Single shape definition**: `SalaryEmbedded` defines the 4 salary columns once — entity, service, resolver, and GraphQL type all derive from it.
- **Co-located validation**: `class-validator` decorators + cross-field validation live on the embedded class, not scattered across a separate service.
- **Zero DB migration**: TypeORM prefix `salary` produces the same column names (`salary_min_cents`, etc.). Schema is unchanged.
- **Thinner SalaryService**: `SalaryService` delegates validation to the embedded instead of duplicating logic.
- **Consistent pattern**: Aligns with existing embeddeds (`AsyncMetadataEmbedded`, `ConversionMetadataEmbedded`).

## User Stories

- As a developer, I want salary fields defined in one place so I don't need to update 5 files when the salary shape changes.
- As a developer, I want `job.salary.minCents` instead of `job.salaryMinCents` for better grouping and autocomplete.
- As a developer, I want `SalaryEmbedded.validate()` to work in any context (NestJS DTO, scripts, tests), not just inside `SalaryService`.

## Core Features

1. **`SalaryEmbedded` class** — `apps/api/src/database/embeddeds/salary.embedded.ts`
   - 4 `@Column()` fields: `minCents`, `maxCents`, `currency`, `period`
   - `class-validator` decorators on each field (`@IsOptional`, `@IsInt`, `@Min(0)`, `@Matches(...)`)
   - `validate(): void` method for cross-field rules (amount → requires currency+period, min ≤ max)
   - `normalize(): void` for trimming/uppercasing currency

2. **`JobEntity` update** — replace 4 flat `@Column()` declarations with:

   ```ts
   @Column(() => SalaryEmbedded, { prefix: "salary" })
   salary?: SalaryEmbedded;
   ```

3. **`SalaryService` refactor** — delegate `assertValidSalaryState()` and `rowAfterValidation()` to `SalaryEmbedded.validate()` and `SalaryEmbedded.normalize()`.

4. **Type alignment** — `SalaryInput` and `SalaryColumns` derive from the embedded shape. `SalaryResolver.salary()` field resolver uses `salary` property directly.

5. **All consumers updated** — ~154 references across jobs service, summary service, specs, inputs migrate from `entity.salaryMinCents` to `entity.salary?.minCents`.

## User Experience

No user-facing changes. This is a pure code-level refactoring. The GraphQL API (`JobSalary` type) and REST endpoints remain identical. All validation error messages stay the same.

## Non-Goals

- Adding new salary fields (e.g., `salaryText`, `salaryEquity`)
- Changing validation rules
- DB migration or column rename
- Frontend changes (web already uses `JobSalary` GraphQL type, not entity fields directly)
- Removing `SalaryService` — it stays as the NestJS injectable, just thinner

## Phased Rollout Plan

**Single phase** — all changes are in `apps/api` and can be deployed atomically:

1. Create `SalaryEmbedded` class with columns + validation
2. Update `JobEntity` to use the embedded
3. Refactor `SalaryService` to delegate to embedded
4. Update `SalaryResolver`, `SalaryInput`, `SalaryColumns`, and all consumers
5. Run `typecheck` + `lint` + `test` → zero regressions
6. Deploy

## Success Metrics

- `JobEntity` salary definition down from 4 `@Column()` blocks to 1 `@Column(() => ...)` block
- `SalaryService` line count reduced (validation logic moves to embedded)
- All existing tests pass without modification to assertions
- `typecheck` passes with zero errors
- GraphQL schema unchanged (`schema.gql` diff empty for salary types)

## Risks and Mitigations

| Risk                                                             | Mitigation                                                                 |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Breaking change across ~154 references                           | Systematic search-and-replace; typecheck catches all mismatches            |
| `class-validator` validation behavior differs from manual checks | Run existing `SalaryService` test suite; add tests for embedded validation |
| TypeORM prefix + naming strategy mismatch                        | Verify generated column names via `typeorm logging` or integration test    |

## Architecture Decision Records

- [ADR-001](./adrs/adr-001.md) — SalaryEmbedded with validation via class-validator

## Open Questions

- None.

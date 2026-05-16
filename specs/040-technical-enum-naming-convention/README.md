---
status: in-progress
created: 2026-05-16
priority: medium
tags:
  - api
  - refactor
  - convention
  - graphql
---

# Technical Scope: enum-naming-convention

> **Status**: active · **Priority**: medium · **Created**: 2026-05-16

## Objective

Standardize TypeScript enum identifiers across `apps/api` to use the `Enum` suffix consistently, and ensure GraphQL schema names strip the suffix per existing dominant convention.

## Motivation

Of 11 GraphQL-registered enums, 6 use the `Enum` suffix in TypeScript while 5 don't — an inconsistency without technical reason. One enum (`WeightEnum`) also keeps the `Enum` suffix in its GraphQL name, going against the convention used by every other enum of stripping it.

A single consistent convention reduces cognitive overhead, makes imports self-documenting (you know `FooEnum` is an enum), and avoids confusion in code review.

## Audit

### Current State

| TS identifier                      | File                                                        | GraphQL name                         | Issue                               |
| ---------------------------------- | ----------------------------------------------------------- | ------------------------------------ | ----------------------------------- |
| `ApplicationStageEnum`             | `application-stage.enum.ts`                                 | `"ApplicationStage"`                 | ✅                                  |
| `SourceRunStatusEnum`              | `source-run-status.enum.ts`                                 | `"SourceRunStatus"`                  | ✅                                  |
| `SourceRunEventTypeEnum`           | `source-run-event-type.enum.ts`                             | `"SourceRunEventType"`               | ✅                                  |
| `ApplicationQuickFilterEnum`       | `application-quick-filter.enum.ts`                          | (no suffix)                          | ✅                                  |
| `SalaryPeriodEnum`                 | `salary-period.enum.ts`                                     | `"SalaryPeriod"`                     | ✅                                  |
| `WeightEnum`                       | `weight.enum.ts`                                            | `"WeightEnum"`                       | ❌ GraphQL name keeps `Enum` suffix |
| `ApplicationSource`                | `application-source.enum.ts`                                | `"ApplicationSource"`                | ❌ TS missing `Enum` suffix         |
| `AsyncMetadataStatus`              | `async-metadata.type.ts`                                    | `"AsyncMetadataStatus"`              | ❌ TS missing `Enum` suffix         |
| `FitAnalysisStatus`                | `fit-analysis.entity.ts` / `fit-analysis.type.ts`           | `"FitAnalysisStatus"`                | ❌ TS missing `Enum` suffix         |
| `DraftApplicationConversionStatus` | `draft-application.entity.ts` / `draft-application.type.ts` | `"DraftApplicationConversionStatus"` | ❌ TS missing `Enum` suffix         |
| `RequirementType`                  | `fit-analysis.entity.ts` / `fit-item.type.ts`               | `"RequirementType"`                  | ❌ TS missing `Enum` suffix         |

### Convention

- **TypeScript**: `PascalCase` name + `Enum` suffix (`FooEnum`)
- **GraphQL** (in `registerEnumType`): same name without `Enum` suffix (`{ name: "Foo" }`)

## Changes

### Phase 1 — Standardize TS identifiers (no schema breakage)

Rename 5 enums to add `Enum` suffix. GraphQL names stay the same — `schema.gql` unchanged, no codegen needed.

| Old                                | New                                    | Where defined                                                  | `registerEnumType` line |
| ---------------------------------- | -------------------------------------- | -------------------------------------------------------------- | ----------------------- |
| `ApplicationSource`                | `ApplicationSourceEnum`                | `application-source.enum.ts`                                   | L11                     |
| `AsyncMetadataStatus`              | `AsyncMetadataStatusEnum`              | `async-metadata.type.ts`                                       | L8                      |
| `FitAnalysisStatus`                | `FitAnalysisStatusEnum`                | `fit-analysis.entity.ts` + `fit-analysis.type.ts` L16          | L16                     |
| `DraftApplicationConversionStatus` | `DraftApplicationConversionStatusEnum` | `draft-application.entity.ts` + `draft-application.type.ts` L5 | L5                      |
| `RequirementType`                  | `RequirementTypeEnum`                  | `fit-analysis.entity.ts` + `fit-item.type.ts` L9               | L9                      |

### Phase 2 — Fix `WeightEnum` GraphQL name (schema breakage)

- `registerEnumType(WeightEnum, { name: "WeightEnum" })` → `{ name: "Weight" }`
- `schema.gql` changes: `enum WeightEnum` → `enum Weight`, field type `WeightEnum!` → `Weight!`
- Requires codegen regeneration
- Web + extension generated files (`graphql.ts`, `hooks.ts`, `sdk.ts`) update automatically
- Manual updates in `apps/web/src/modules/` files that reference `WeightEnum` directly

## Tasks

- [T-265] Rename `ApplicationSource` → `ApplicationSourceEnum` + update all usages
- [T-266] Rename `AsyncMetadataStatus` → `AsyncMetadataStatusEnum` + update all usages
- [T-267] Rename `FitAnalysisStatus` → `FitAnalysisStatusEnum` + update entity and type imports
- [T-268] Rename `DraftApplicationConversionStatus` → `DraftApplicationConversionStatusEnum` + update entity and type imports
- [T-269] Rename `RequirementType` → `RequirementTypeEnum` + update entity and type imports
- [T-270] Fix `WeightEnum` GraphQL name → `"Weight"`, regenerate codegen, update client refs

## Risks and Mitigations

- [T-271] Phase 2 is a **breaking schema change** — any persisted GraphQL query using `WeightEnum` will fail until clients regenerate. Mitigation: coordinate codegen regeneration with client deploys; since web and extension are in the same monorepo, a single commit handles both.
- [T-272] Phase 1 renames affect entity files imported by tests and resolvers — need `git grep` of the old name across the full repo to catch all references. Mitigation: use `replaceAll` across each affected file and verify with `git diff --stat`.

## Validation

- [T-273] `pnpm lint` and `pnpm typecheck` pass in `apps/api` and `apps/web`
- [T-274] `pnpm test` passes in affected packages
- [T-275] `schema.gql` regenerated and reviewed for correctness (Phase 2 only)
- [T-276] `pnpm leanspec:validate` passes

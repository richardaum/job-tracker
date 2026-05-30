---
status: completed
title: "Server: SourceTemplate stop validation + SourceRun config"
type: api
complexity: medium
dependencies:
  - task_01
---

# Task 03: Server: SourceTemplate stop validation + SourceRun config

## Overview

Add server-side validation for SourceTemplate stop config and surface the config fields through the SourceRun GraphQL type so the extension receives them when fetching runs.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST validate stop config on SourceTemplate create and update (Zod schema matching `SourceTemplateConfigSchema`)
- MUST cross-validate `stopWhen: OlderThan`: load the Plan and verify `publishedAt` exists in `surfaceFields`
- MUST add stop config fields to `SourceRunType` (populated from the template at query time)
- MUST reject create/update with invalid config via `BadRequestException` or similar
- MUST NOT expose raw validation errors to the client; use structured error responses

## Subtasks

- [x] 03.1 Add `SourceTemplateConfigSchema` validation (mirrored from extension's Zod or server-side)
- [x] 03.2 Add validation in `SourcesService` for create/update template
- [x] 03.3 Implement cross-validation for OlderThan: check plan's surfaceFields for `publishedAt`
- [x] 03.4 Add stop config fields to `SourceRunType` (populated from template)
- [x] 03.5 Update `source-runs.repository.ts` or service to populate stop config
- [x] 03.6 Write unit + integration tests

## Implementation Details

See TechSpec "Core Interfaces: SourceTemplateConfigSchema" for the exact validation shape. The cross-validation for OlderThan checks the Plan's `document` JSONB for a surface field with `key: "publishedAt"`.

### Relevant Files

- `apps/api/src/domains/sources/sources.service.ts` — validate config on create/update
- `apps/api/src/domains/sources/source-run.type.ts` — add stop config fields
- `apps/api/src/domains/sources/create-source-template.input.ts` — accept config input
- `apps/api/src/domains/sources/update-source-template.input.ts` — accept config input
- `apps/api/src/domains/sources/sources.repository.ts` — join template config to runs (if needed)

### Dependent Files

- `apps/extension/src/domains/sources/gql/graphql.ts` — codegen will update SourceRunType
- `apps/web/src/gql/hooks/` — codegen will update

## Deliverables

- Stop config validation on create/update
- Cross-validation for OlderThan
- SourceRun type with stop config fields
- Unit + integration tests
- Test coverage >=80%

## Tests

- [x] Create template with valid CatchUp config → success
- [x] Create template with CatchUp but no threshold → rejected
- [x] Create template with OlderThan but plan lacks publishedAt → rejected
- [x] Create template with OlderThan and plan has publishedAt → success
- [x] SourceRun query returns stop config fields
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- Invalid stop configs rejected at API level with clear errors
- SourceRun API returns stop config to the extension

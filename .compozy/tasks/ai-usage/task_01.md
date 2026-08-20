---
status: completed
title: Create AI usage persistence and query
type: api
complexity: high
dependencies: []
---

# Create AI usage persistence and query

## Overview

Create the durable usage-record model and the authenticated API surface that returns a user's 30-day totals split between Personal Key and Trial. This establishes the trusted read model required before callers can record measured usage.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON WHAT — keep the domain focused on durable records and aggregation
- MINIMIZE CODE — no unneeded provider integrations
- TESTS REQUIRED — every deliverable needs coverage
</critical>

<requirements>
1. MUST persist user-scoped source, input, output, total tokens, and completion time.
2. MUST provide a protected GraphQL summary for the preceding 30 days with personal-key and trial totals plus calls.
3. MUST return the existing trial-call allowance data without changing its behavior.
4. MUST create and register a reversible TypeORM migration and an aggregation index.
5. MUST never persist or expose API keys, prompts, or OpenAI payloads.
</requirements>

## Subtasks

- [ ] Create the source enum and usage-record entity.
- [ ] Add a registered migration and database entity registry entry.
- [ ] Implement thin persistence and aggregate reads.
- [ ] Implement the service, GraphQL types, resolver, and module.
- [ ] Cover aggregation, user isolation, and GraphQL authorization.

## Implementation Details

See TechSpec “Data Models” and “API Endpoints.” The new API domain must follow Nest module and thin repository conventions.

### Relevant Files

- `apps/api/src/database/entities/user-setting.entity.ts` — user-owned settings pattern.
- `apps/api/src/database/migrations/index.ts` — migration registration.
- `apps/api/src/domains/settings/settings.resolver.ts` — protected resolver pattern.

### Dependent Files

- `apps/api/src/lib/ai/ai-base.service.ts` — records through this domain in task 02.
- `apps/web/src/graphql/ai-usage.graphql` — queries this API in task 03.

### Related ADRs

- [ADR-001: Provide an in-app OpenAI usage panel](adrs/adr-001.md)
- [ADR-002: Record Job Tracker token usage at the AI boundary](adrs/adr-002.md)

## Deliverables

- Usage entity, enum, migration, module, repository, service, resolver, and GraphQL types.
- Unit and integration coverage for the new API.

## Tests

- Unit tests: aggregation separates sources, computes total calls, and excludes records older than 30 days.
- Unit tests: empty data returns zero-valued totals.
- Integration tests: authenticated `aiUsage` only returns the caller's records.
- Integration tests: migration applies successfully.
- Test coverage target: >=80%.

## Success Criteria

- The API returns exact, user-scoped 30-day aggregates.
- Migration and affected API tests pass.

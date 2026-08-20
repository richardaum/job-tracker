---
status: completed
title: Build the Profile AI Usage tab
type: web
complexity: medium
dependencies:
  - task_01
  - task_02
---

# Build the Profile AI Usage tab

## Overview

Add the new AI Usage primary Profile tab and render separate Personal OpenAI Key Usage and AI Trial Usage areas. Each area presents total, input, output, and calls for the last 30 days; the trial area also shows the current allowance and calls remaining.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON WHAT — render the approved metrics and states
- MINIMIZE CODE — reuse existing Profile shell and UI primitives
- TESTS REQUIRED — every deliverable needs coverage
</critical>

<requirements>
1. MUST add `/profile/ai-usage` as a top-level Profile tab using the existing shell pattern.
2. MUST query the authenticated `aiUsage` API through generated GraphQL hooks.
3. MUST render separate personal-key and AI Trial areas with total, input, output, and calls.
4. MUST show trial calls used, limit, and remaining without merging them into token totals.
5. MUST load automatically and provide a manual Refresh control with accessible loading and empty states.
</requirements>

## Subtasks

- [x] Add the GraphQL operation and regenerate generated client artifacts.
- [x] Add the Profile route and shell tab mapping.
- [x] Build a thin view-model and separate usage-area components.
- [x] Render loading, zero-data, no-key, and refresh states.
- [x] Add route, rendering, and refresh tests.

## Implementation Details

See TechSpec “System Architecture” and “API Endpoints.” Follow the ProfileShell primary-tab and GraphQL view-model rules.

### Relevant Files

- `apps/web/src/modules/profile/layout/page/ProfileShell.tsx` — primary Profile tab routing.
- `apps/web/src/graphql/settings.graphql` — GraphQL operation style.
- `apps/web/src/modules/profile/settings/page/SettingsTabPage.tsx` — Profile area and loading-state conventions.

### Dependent Files

- `apps/api/src/domains/ai-usage/ai-usage.resolver.ts` — query supplied by tasks 01–02.
- `apps/web/src/gql/` — regenerated artifacts; never hand edit.

### Related ADRs

- [ADR-001: Provide an in-app OpenAI usage panel](adrs/adr-001.md)
- [ADR-002: Record Job Tracker token usage at the AI boundary](adrs/adr-002.md)

## Deliverables

- Profile route, tab entry, GraphQL operation, view-model, components, and tests.
- Regenerated GraphQL client files.

## Tests

- Unit tests: renders both source areas with all four metrics.
- Unit tests: calculates and renders remaining trial calls.
- Unit tests: refresh invokes the query refetch path and exposes loading state.
- Unit tests: missing personal-key and zero-data states are clear.
- Integration tests: ProfileShell routes the AI Usage tab correctly.
- Test coverage target: >=80%.

## Success Criteria

- Profile users can reach and refresh a clear, separated AI Usage view.
- Web tests and generated GraphQL typechecks pass.

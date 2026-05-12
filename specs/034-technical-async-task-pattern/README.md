---
status: planned
created: 2026-05-12
priority: high
tags:
  - api
  - async
  - architecture
created_at: 2026-05-12T18:40:00.000000Z
updated_at: 2026-05-12T18:40:00.000000Z
---

# Technical Scope: async-task-pattern

> **Status**: draft · **Priority**: high · **Created**: 2026-05-12

## Objective

Define a generic "fire-and-forget" pattern for asynchronous background tasks in the monorepo. This pattern ensures consistency when handling long-running operations (like AI analysis, external sync, or heavy computations) that should not block the initial GraphQL mutation response.

## Context

Operations that take more than a few hundred milliseconds (e.g., AI calls taking 3-10s) shouldn't hold the HTTP connection open. Instead, we use a pattern where:

1. The mutation initializes a record with a `processing` status and returns immediately.
2. The server continues the work in a background process (fire-and-forget).
3. The client polls the status until it reaches a terminal state (`completed` or `failed`).

## Generic Requirements (Pattern)

- [T-207] **Persistence Layer**:
  - Add a status enum (e.g., `processing`, `completed`, `failed`) to the relevant entity.
  - Add an optional `error` text column for failure details.
  - Provide a migration for the new columns and enums.
- [T-208] **GraphQL Schema**:
  - Expose the status enum and error message in the GraphQL types.
  - Register the enum globally if needed.
- [T-209] **Background Execution (Service)**:
  - Mutation-facing method: Creates/updates the entity to `processing`, saves, triggers the background work via `void` (fire-and-forget), and returns the record immediately.
  - Worker method: Performs the actual work (e.g., AI calls) wrapped in `tryRun()` or a try/catch. Updates the entity to `completed` or `failed` based on the outcome.
- [T-210] **Query Readiness**:
  - Ensure the relevant queries return the latest status and error information to support client-side polling.
- [T-211] **Frontend Polling**:
  - Implement a polling mechanism (e.g., `useQuery` with `pollInterval` or a `useEffect` timer) that triggers while the status is `processing`.
  - Provide visual feedback (e.g., loading spinner or progress indicator).
- [T-212] **Stale State Protection**:
  - **Recovery**: Implement an `onModuleInit` hook in the service to reset any records stuck in `processing` after a server restart.
  - **Concurrency**: Use atomic updates (e.g., `.update({ id, status: 'processing' }, { status: 'completed' })`) or a `revision` column to ensure background workers don't overwrite newer manual changes or other worker attempts.

## First Implementation: Fit Analysis

The first application of this pattern is the Fit Analysis generation:

- **Persistence**: `FitAnalysisEntity` gains `status: FitAnalysisStatus` and `error: string?`.
- **Service**: `FitAnalysisService.generate()` splits into:
  - `generate()`: Sets `PROCESSING`, saves, fires `generateInBackground()`, returns entity.
  - `generateInBackground()`: Performs AI `extractResumeFitItems` + `extractPreferenceFitItems`, updates to `COMPLETED` or `FAILED`.
- **GraphQL**: `FitAnalysisType` exposes `status` and `error`.
- **Frontend**: `FitAnalysisPage` polls `applicationFit` until `status !== 'processing'`.

## Modus Operandi

Follow the **fire-and-forget pattern** established in `apps/`:

1. **Non-blocking**: The background method must be called without `await` (e.g., `void this.work()`) to return the response to the client immediately.
2. **Resilience**: Use `tryRun()` for all external integrations (AI providers, external APIs) to ensure the background task doesn't crash the worker thread and accurately records failures.
3. **Legacy Data**: When adding status to existing entities, default to `completed` for legacy records to maintain backward compatibility.

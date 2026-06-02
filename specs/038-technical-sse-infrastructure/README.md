---
status: completed
created: 2026-05-15
migrated: 2026-05-25
priority: high
tags:
  - api
  - web
  - realtime
  - graphql
---

# Technical Scope: sse-infrastructure

> **Status**: completed · **Priority**: high · **Created**: 2026-05-15 · **Migrated**: 2026-05-25

## Objective

Real-time push notifications for long-running background tasks (summary generation, match analysis, fill jobs). Originally delivered via raw NestJS `@Sse()` + browser `EventSource`. Migrated to **GraphQL Subscription** over the existing Apollo + `graphql-sse` middleware for consistency with the project's real-time event pattern.

## Context

The fire-and-forget pattern (summary generation, match analysis, job fill) requires the frontend to detect when a background task finishes. Polling was wasteful (~20 requests/minute per active detail page). SSE solves this with push delivery.

The original implementation used raw `@Sse()` controller + `EventSource` browser API. This was migrated to GraphQL Subscription to consolidate all real-time events under a single transport (`graphql-sse`) and eliminate the dedicated SSE infrastructure (`useEventSource`, `event-source-pool`, separate `/jobs/:id/stream` endpoint).

## Implemented

### Backend

- **GraphQL Subscriptions** (`jobs-events.resolver.ts`):
  - `jobSummaryStatusChanged(jobId: ID!)` — `SummaryStatusChanged` events filtered by jobId + userId
  - `jobFillStatusChanged(jobId: ID!)` — `FillJobRequested | FillJobCompleted | FillJobFailed` events
  - `jobMatchStatusChanged(jobId: ID!)` — `JobMatchStatusChanged` events (forwarded from `MatchAnalysisEventBus`)
- **EventBus base class** (`lib/domain-event.ts`): Added `events()` returning `AsyncIterable<DomainEvent>` via RxJS `Subject`, eliminating duplicate bridge implementations
- **Job events** (`job.events.ts`): `DomainEvent` subclasses (`SummaryStatusChanged`, `FillJobRequested`, etc.) emitted via `JobEventBus.emit()`

### Frontend

- **Apollo subscription hooks** replacing raw `EventSource`:
  - `useJobSummaryStatusChangedSubscription({ variables: { jobId }, onData })` in `useJobDetailsViewModel`
  - `useJobFillStatusChangedSubscription({ variables: { jobId }, onData })` in `useJobDetailsViewModel`
  - `useJobMatchStatusChangedSubscription({ variables: { jobId }, onData })` in `useJobMatchStatus`
- Generated via `pnpm --filter @job-tracker/web run codegen` from `.graphql` subscription operations

### Removed

- `JobsSseController` (`@Sse(':id/stream')` endpoint)
- `useEventSource` hook + `event-source-pool` utility
- `match-sse-test-utils.ts` (replaced with `match-sub-test-utils.ts`)

## Convention

Single mechanism for real-time events: **GraphQL Subscription** over `graphql-sse`. Do not add raw `@Sse()` controllers, `EventSource`, or `useEventSource` hooks. See `.agents/rules/backend/architecture.md` § Real-time events.

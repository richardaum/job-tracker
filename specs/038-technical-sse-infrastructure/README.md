---
status: planned
created: 2026-05-15
priority: high
tags:
  - api
  - web
  - realtime
---

# Technical Scope: sse-infrastructure

> **Status**: planned · **Priority**: high · **Created**: 2026-05-15

## Objective

Replace Apollo GraphQL polling with Server-Sent Events (SSE) for real-time updates on long-running background tasks (summary generation, match analysis, etc.). SSE delivers push notifications from server to client when a job changes, eliminating wasteful 3-second poll cycles.

## Context

The current fire-and-forget pattern ([spec 034](./034-technical-async-task-pattern/README.md)) relies on frontend polling every 3s to detect when a background task finishes. This works but generates ~20 requests/minute per active detail page — most of which return no new data. SSE gives us instant delivery with zero wasted requests:

- **Push, not pull**: server sends a single `data` event when `JOB_UPDATED` fires
- **User-scoped**: events are filtered server-side by `userId` so client only receives events for jobs they own
- **Auto-reconnect**: `EventSource` reconnects natively on connection loss
- **No new dependencies**: `EventSource` is a Web API; NestJS `@Sse()` is built-in

## In Scope

- [T-243] **SSE Controller**: New NestJS REST controller at `GET /jobs/:id/stream` with `@Sse()` decorator, guarded by `JwtAuthGuard`, subscribes to `JobEventBus`
- [T-244] **User-scoped filtering**: SSE stream only emits events where both `jobId` and `userId` match the authenticated user
- [T-245] **Clean teardown**: Controller unsubscribes from `JobEventBus` when client disconnects (Observable teardown)
- [T-246] **useEventSource hook**: Generic React hook that opens an `EventSource` connection and calls a callback on each message
- [T-247] **Polling removal (summary)**: Replace `usePoll` + Apollo `startPolling`/`stopPolling` in `OverviewTabContent` with SSE-driven `refetch`
- [T-248] **API base URL utility**: Expose `getApiBaseUrl()` for constructing SSE endpoint URLs client-side

## Out of Scope

- Replacing all existing polling in the app — only summary polling is replaced here
- GraphQL subscriptions or WebSocket — SSE is lighter and sufficient for one-directional events
- Fallback to polling if SSE fails — `EventSource` auto-reconnect is sufficient
- SSE for other domains (match analysis, import runs) — future work, same pattern applies

## Technical Tasks

### API: Event Bus

- [T-245.1] **Add `removeJobUpdatedListener`**: `JobEventBus` needs an `off()` method so the controller can clean up listeners when a client disconnects. Without this, every SSE connection leaks a listener.

### API: SSE Controller

- [T-243.1] **Create `JobsSseController`**: New `@Controller('jobs')` with a single `@Sse(':id/stream')` method. Guards: `JwtAuthGuard`. Constructor injects `JobEventBus`.
- [T-243.2] **Observable factory**: Returns `new Observable<{ data: { jobId: string } }>` that subscribes to `JobEventBus.onJobUpdated`, filters by `jobId` and `userId`, emits `observer.next({ data })`, and cleans up on teardown.
- [T-243.3] **Module registration**: Add `JobsSseController` to `providers` (or `controllers`) in `JobsModule`.

### Web: SSE Hook

- [T-246.1] **Create `useEventSource`**: Hook file at `apps/web/src/hooks/useEventSource.ts`. Accepts `url: string | null` and `onMessage: () => void`. Opens `new EventSource(url, { withCredentials: true })` when `url` is non-null. Closes on unmount or URL change.

### Web: Remove Polling for Summary

- [T-247.1] **Expose `refetch` in view model**: Add `refetch` to `useJobDetailsViewModel`'s return value (already available from `useQuery`, just not exposed).
- [T-247.2] **Pass `refetch` to `OverviewTabContent`**: Replace `startPolling`/`stopPolling` props with a single `refetch` callback. Update `JobDetailsPage` to pass `refetch` instead.
- [T-247.3] **Switch to SSE in component**: In `OverviewTabContent`, remove `usePoll(...)` call. Import `useEventSource` and `getApiBaseUrl`. Construct SSE URL and connect. Call `refetch` on each SSE message.

## Modus Operandi

1. **User-scoped by design**: The controller filters events by `req.user.userId` (set by JWT strategy). Even if the client listens to a different job ID's stream, they only receive events for jobs they own.
2. **Auto-reconnect with no fallback**: `EventSource` reconnects automatically on disconnection. If auth fails (e.g., expired token), the browser will retry and the API returns 401 — the client won't receive events until re-authenticated. No polling fallback v1.
3. **Event as trigger, not data carrier**: SSE events carry only `{ jobId }`. The FE calls `refetch()` to get fresh data from Apollo. This keeps the SSE contract minimal and avoids stale data in the event payload.
4. **One endpoint per job**: Clients subscribe per job detail page (`/jobs/:id/stream`). The detail page component opens the connection on mount and closes on unmount.

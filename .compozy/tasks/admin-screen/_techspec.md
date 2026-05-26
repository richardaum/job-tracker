# TechSpec: Admin Screen

**Feature slug:** `admin-screen`
**PRD:** _(none — spec derived from existing implementation)_

## Executive Summary

Add an authenticated **Admin** area in the web app to monitor the Chrome extension and, later, aggregate system metrics. The shell ships with two primary tabs — **Extension** (default) and **Overview** — and nested sub-tabs on Extension (**Status | Events**).

**Current state:**

- **Connection status** — live via Web Bridge (`window.postMessage` ping/pong).
- **Authentication metric** — live from bridge pong (`authStatus`, `authenticatedEmail` resolved by extension background via GraphQL `me`).
- **Active events card + Events tab** — live merged feed from `sourceRuns` + `extensionActivityEvents` (query, poll, subscriptions). Includes source-run state and extension activity log rows.
- **Extension activity log** — extension reports fine-grained steps via `reportExtensionActivity`; persisted in `extension_activity_events`.

**Primary trade-off:** Connection health and extension auth use a lightweight postMessage bridge (no server audit trail). Source-run state and extension activity use GraphQL on the web app (with SSE subscriptions). `/sources` stays template-scoped; Admin Events is global.

## System Architecture

### Component Overview

```
AdminShell (layout)
├── DetailPageHeader
│   ├── BackToLink → /jobs
│   └── Heading "Admin"
├── Primary Tabs (route-driven)
│   ├── Extension → /admin
│   └── Overview → /admin/overview
├── AdminSubTabs.Slot (portal — nested tabs from child page)
└── {children}

ExtensionTabPage (/admin)
├── AdminSubTabs → Status | Events (local state)
├── Status panel
│   ├── ExtensionConnectionMetricCard     ← live (useExtensionConnectionStatus)
│   ├── Authentication metric card        ← live (bridge pong + extension-auth.display)
│   ├── Active events metric card         ← live (useExtensionEventsViewModel.inFlightCount)
│   └── ExtensionConnectionDetailsCard    ← live when connected
└── Events panel
    └── ExtensionEventRow list            ← live source runs (useExtensionEventsViewModel)

OverviewTabPage (/admin/overview)
└── Placeholder copy
```

### Web Bridge Data Flow

```
Web (useExtensionConnectionStatus)
  │ window.postMessage(PING) on mount / Retry
  ▼
Content Script (WebBridgeService)
  │ chrome.runtime.sendMessage({ kind: "admin.get-status", refreshAuth? })
  ▼
Background (AdminExtensionStatusService)
  │ { extensionVersion, browser, lastHeartbeatAt, webAppOrigin, authStatus, authenticatedEmail }
  ▼
Content Script
  │ window.postMessage(PONG)
  ▼
Web (message listener → status "connected")
```

**Stale detection:** No pong within `EXTENSION_BRIDGE_PROBE_TIMEOUT_MS` (5_000 ms) → `disconnected`. Retry clears auth fields and sends a ping with `refreshAuth: true`.

### Source Run Events Data Flow

```
Web (useExtensionEventsViewModel)
  │ useAdminSourceRunsListQuery (poll 5s)
  │ useAdminSourceRunEventsSubscription → refetch on new run
  ▼
Apollo Client (HTTP + graphql-sse split link)
  ▼
API
  │ Query sourceRuns
  │ Subscription sourceRunEvents (SOURCE_RUN_CREATED)
  ▼
Web maps runs → ExtensionSourceRunEvent rows
  ├── Events tab (sorted by startedAt desc)
  └── Active events card (count RUNNING + IN_PROGRESS)
```

**Scope vs `/sources`:** `/sources` shows runs per template (operational). Admin Events shows a **global** source-run feed for monitoring. Same API data, different scope.

## Implementation Design

### Core Interfaces

```ts
// apps/web/src/modules/admin/extension/lib/extension-bridge.protocol.ts

export type ExtensionBridgePing = {
  type: "JOB_TRACKER_EXTENSION_PING";
  source: "job-tracker-extension-bridge";
  requestId: string;
  refreshAuth?: boolean;
};

export type ExtensionBridgePong = {
  type: "JOB_TRACKER_EXTENSION_PONG";
  source: "job-tracker-extension-bridge";
  requestId: string;
  extensionVersion: string;
  browser: string;
  lastHeartbeatAt: string;
  webAppOrigin: string;
  authStatus: "authenticated" | "unauthenticated";
  authenticatedEmail: string | null;
};
```

```ts
// apps/web/src/modules/admin/extension/hooks/useExtensionConnectionStatus.ts

export type ExtensionConnectionViewModel = {
  status: "checking" | "connected" | "disconnected";
  extensionVersion: string | null;
  browser: string | null;
  lastHeartbeatAt: string | null;
  webAppOrigin: string | null;
  authStatus: "authenticated" | "unauthenticated" | null;
  authenticatedEmail: string | null;
  retry: () => void;
};
```

```ts
// apps/web/src/modules/admin/extension/lib/extension-events.display.ts

export type ExtensionSourceRunEvent = {
  id: string;
  type: SourceRunEventType; // SOURCE_RUN_CREATED
  status: SourceRunStatus; // RUNNING | IN_PROGRESS | COMPLETED | FAILED
  occurredAt: string; // run.startedAt
  summary: string; // sourceProfile · surfaceUrl
};
```

```ts
// apps/web/src/modules/admin/extension/hooks/useExtensionEventsViewModel.ts

export function useExtensionEventsViewModel(): {
  events: ExtensionSourceRunEvent[];
  inFlightCount: number;
  error: unknown;
  showInitialLoading: boolean;
  refetch: () => Promise<unknown>;
};
```

```ts
// apps/extension/src/domains/web-bridge/admin-extension-status.service.ts

export type AdminGetStatusMessage = {
  kind: "admin.get-status";
  webAppOrigin: string;
  refreshAuth?: boolean;
};
```

### GraphQL Operations

**File:** `apps/web/src/graphql/admin-extension-events.graphql`

- `AdminSourceRunsList` → `sourceRuns`
- `AdminSourceRunEvents` → subscription `sourceRunEvents`

**Apollo transport:** `apps/web/src/lib/make-apollo-client.ts` routes subscriptions to `graphql-sse/stream` via `createGraphqlSseLink`.

### Routes

| Route             | Tab       | Description                                     |
| ----------------- | --------- | ----------------------------------------------- |
| `/admin`          | Extension | Extension monitoring (Status / Events sub-tabs) |
| `/admin/overview` | Overview  | Placeholder for future aggregate metrics        |

### Protocol Constants

| Constant                            | Value                          |
| ----------------------------------- | ------------------------------ |
| `EXTENSION_BRIDGE_SOURCE`           | `job-tracker-extension-bridge` |
| `EXTENSION_BRIDGE_PROBE_TIMEOUT_MS` | 5_000 ms                       |
| `SOURCE_RUN_POLL_INTERVAL_MS`       | 5_000 ms                       |
| Content-script match pattern        | `http://localhost/*` (no port) |

### Active Events Semantics

Counts source runs with status **`RUNNING`** or **`IN_PROGRESS`**. Derived from the same list that powers the Events tab — not a separate data source.

## Integration Points

### Sidebar Navigation

`Sidebar.tsx` adds `{ href: "/admin", label: "Admin", icon: GaugeIcon }` to `navItems`.

### Extension Content Script

- **File:** `apps/extension/entrypoints/web-bridge.content.ts`
- **Match:** `toWebAppMatchPattern(WXT_PUBLIC_WEB_URL)` → `http://localhost/*`
- **Guard:** `WebBridgeService` only responds when `window.location.origin === expectedWebAppOrigin`

### Extension Background Handler

Registered in `background.ts`:

```ts
"admin.get-status": (message) =>
  adminExtensionStatusService.handleGetStatusMessage(message),
```

Returns manifest version, `navigator.userAgent`, ISO timestamp, `webAppOrigin`, and auth snapshot from `apiService.meEmail()`.

### Portal Sub-Tabs

`AdminSubTabs = PortalSlot("admin-sub-tabs")` lets `ExtensionTabPage` render nested tabs into the shell header row without prop drilling.

## Impact Analysis

| Component                         | Impact Type | Description                                            |
| --------------------------------- | ----------- | ------------------------------------------------------ |
| `AdminShell`                      | New         | Primary tab shell, route sync, `AdminSubTabs.Slot`     |
| `ExtensionTabPage`                | New         | Status + Events UI; bridge + source-run telemetry live |
| `OverviewTabPage`                 | New         | Placeholder only                                       |
| `useExtensionConnectionStatus`    | New         | Ping/pong hook with stale detection + auth fields      |
| `useExtensionEventsViewModel`     | New         | Source runs query + subscription for Events tab + card |
| `extension-events.display`        | New         | Run → event row mapping, in-flight count helpers       |
| `extension-auth.display`          | New         | Auth metric labels/colors from bridge state            |
| `extension-bridge.protocol` (web) | New         | Shared message types and guards                        |
| `admin-extension-events.graphql`  | New         | Admin source-run query + subscription                  |
| `create-graphql-sse-link` (web)   | New         | Apollo SSE link for GraphQL subscriptions              |
| `make-apollo-client` (web)        | Modified    | Split HTTP vs SSE by operation type                    |
| `WebBridgeService` (extension)    | New         | Content-script ping responder                          |
| `AdminExtensionStatusService`     | New         | Background status + auth provider                      |
| `web-bridge.content.ts`           | New         | WXT content script entry                               |
| `Sidebar`                         | Modified    | Admin nav item                                         |
| `background.ts`                   | Modified    | `admin.get-status` handler                             |

## Testing Approach

### Unit Tests (existing)

- `useExtensionConnectionStatus.test.ts` — ping send, pong handling, stale → disconnected, retry
- `extension-bridge.protocol.test.ts` (web + extension) — type guards, match pattern
- `extension-auth.display.test.ts` — auth metric labels/colors
- `extension-events.display.test.ts` — run mapping, sort, in-flight count
- `admin-extension-status.service.test.ts` — status payload shape
- `runtime-message-listener.test.ts` — synchronous `sendResponse` for admin handler

### Integration Tests (future)

- Extension installed + web on matching origin → Status shows Connected within probe timeout
- Extension disabled/uninstalled → Disconnected + Retry
- Source run created → appears in Events tab; Active events increments while RUNNING/IN_PROGRESS
- Extension activity log (Phase 2) — import manual, auth refresh, plan steps

### Environment

- Vitest + jsdom for web hook/protocol/display tests
- Node env for extension protocol/service tests

## Development Sequencing

### Build Order (as implemented)

1. **Web bridge protocol** — shared ping/pong types and guards (web + extension).
2. **Extension content script + background handler** — responds to pings with status payload.
3. **`useExtensionConnectionStatus` hook** — ping/pong + stale detection.
4. **AdminShell + routes** — `/admin`, `/admin/overview`, Sidebar link.
5. **Extension tab UI (Status + Events)** — layout + sub-tabs.
6. **Overview placeholder** — no data dependencies.
7. **Bridge auth wiring** — `authStatus` / `authenticatedEmail` in pong; `extension-auth.display`.
8. **Source-run events wiring** — GraphQL query + SSE subscription; `useExtensionEventsViewModel`; Events tab + Active events card.

### Remaining Work (Phase 3+)

9. **Overview metrics** — GraphQL queries or subscriptions for aggregate stats.
10. **Role guard** — restrict `/admin` to `admin` role if product requires it.

## Monitoring and Observability

- **Connection health:** Derivable from admin UI state (`connected` vs `disconnected` during manual QA).
- **Source-run activity:** Visible in Admin Events tab and Active events card from API state.
- **Bridge failures:** Silent drop when background `sendMessage` fails — no user-visible error beyond Disconnected.
- **Extension activity audit trail:** Not available until Phase 2 activity log.

## Technical Considerations

### Key Decisions

- **Decision:** Client-side postMessage bridge for connection status and extension auth snapshot. **Rationale:** Zero API changes for bridge; works with MV3 content script injection. **Trade-off:** No server audit trail for bridge probes.
- **Decision:** Source-run telemetry via GraphQL on the web app (not proxied through extension). **Rationale:** Reuses existing `sourceRuns` / `sourceRunEvents`; Admin works without extension connected. **Trade-off:** Does not show extension-internal steps until activity log.
- **Decision:** Primary tabs route-driven; Extension sub-tabs local state via portal slot. **Rationale:** Matches detail-page tab patterns; sub-tabs don't need deep links yet.
- **Decision:** Admin Events and `/sources` share API data but differ in scope. **Rationale:** Avoid duplicate UIs — global monitoring vs per-template operations.

### Known Risks

| Risk                                              | Likelihood | Mitigation                                                       |
| ------------------------------------------------- | ---------- | ---------------------------------------------------------------- |
| Content script not injected (stale dev build)     | Medium     | Document WXT rebuild; verify `web-bridge.js` in extension output |
| `localhost` port mismatch vs `WXT_PUBLIC_WEB_URL` | Medium     | Origin guard in `WebBridgeService`; match pattern without port   |
| SSE subscription drops silently                   | Medium     | 5s poll on `sourceRuns` as fallback; Refresh refetches           |
| Status updates lag subscription                   | Low        | Poll picks up IN_PROGRESS/COMPLETED/FAILED after create event    |
| No auth guard on `/admin`                         | Low        | Add role check in Phase 3 if required                            |

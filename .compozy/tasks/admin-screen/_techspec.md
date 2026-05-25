# TechSpec: Admin Screen

**Feature slug:** `admin-screen`
**PRD:** _(none — spec derived from existing implementation)_

## Executive Summary

Add an authenticated **Admin** area in the web app to monitor the Chrome extension and, later, aggregate system metrics. The shell ships with two primary tabs — **Extension** (default) and **Overview** — and nested sub-tabs on Extension (**Status | Events**).

**Current state:** Extension **connection status is live** via a client-side Web Bridge (`window.postMessage` ping/pong between web and extension content script). **Authentication, active-event counts, and the events feed are mocked** pending backend or extension-side wiring.

**Primary trade-off:** Connection health uses a lightweight postMessage bridge (no GraphQL, no SSE) for fast iteration and zero API changes. Event telemetry will require a separate transport (extension runtime events, GraphQL subscription, or SSE) in a follow-up phase.

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
│   ├── Authentication metric card        ← mock
│   ├── Active events metric card         ← mock
│   └── ExtensionConnectionDetailsCard    ← live when connected
└── Events panel
    └── ExtensionEventRow list            ← mock feed

OverviewTabPage (/admin/overview)
└── Placeholder copy
```

### Web Bridge Data Flow

```
Web (useExtensionConnectionStatus)
  │ window.postMessage(PING) every 5s
  ▼
Content Script (WebBridgeService)
  │ chrome.runtime.sendMessage({ kind: "admin.get-status" })
  ▼
Background (AdminExtensionStatusService)
  │ { extensionVersion, browser, lastHeartbeatAt, webAppOrigin }
  ▼
Content Script
  │ window.postMessage(PONG)
  ▼
Web (message listener → status "connected")
```

**Stale detection:** No pong within 15s → `disconnected`. Retry resets state and sends an immediate ping.

## Implementation Design

### Core Interfaces

```ts
// apps/web/src/modules/admin/extension/lib/extension-bridge.protocol.ts

export type ExtensionBridgePing = {
  type: "JOB_TRACKER_EXTENSION_PING";
  source: "job-tracker-extension-bridge";
  requestId: string;
};

export type ExtensionBridgePong = {
  type: "JOB_TRACKER_EXTENSION_PONG";
  source: "job-tracker-extension-bridge";
  requestId: string;
  extensionVersion: string;
  browser: string;
  lastHeartbeatAt: string;
  webAppOrigin: string;
};
```

```ts
// apps/web/src/modules/admin/extension/hooks/useExtensionConnectionStatus.ts

export type ExtensionConnectionStatus =
  | "checking"
  | "connected"
  | "disconnected";

export type ExtensionConnectionViewModel = {
  status: ExtensionConnectionStatus;
  extensionVersion: string | null;
  browser: string | null;
  lastHeartbeatAt: string | null;
  webAppOrigin: string | null;
  retry: () => void;
};
```

```ts
// apps/extension/src/domains/web-bridge/admin-extension-status.service.ts

export type AdminGetStatusMessage = {
  kind: "admin.get-status";
  webAppOrigin: string;
};
```

### Routes

| Route             | Tab       | Description                                     |
| ----------------- | --------- | ----------------------------------------------- |
| `/admin`          | Extension | Extension monitoring (Status / Events sub-tabs) |
| `/admin/overview` | Overview  | Placeholder for future aggregate metrics        |

### Protocol Constants

| Constant                     | Value                                      |
| ---------------------------- | ------------------------------------------ |
| `EXTENSION_BRIDGE_SOURCE`    | `job-tracker-extension-bridge`             |
| Ping interval                | 5_000 ms                                   |
| Stale threshold              | 15_000 ms                                  |
| Content-script match pattern | `http://localhost/*` (no port in hostname) |

### Mock Data (to be replaced)

`ExtensionTabPage` defines `MOCK_EXTENSION_SNAPSHOT` with:

- `authStatus`: `"authenticated" | "unauthenticated"`
- `authenticatedEmail`: string | null
- `events[]`: `{ id, type, status, occurredAt, summary }`

Event types: `SOURCE_RUN_CREATED`, `IMPORT_JOB`, `AUTH_REFRESH`.
Event statuses: `processing`, `queued`, `completed`, `failed`.

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

Returns manifest version, `navigator.userAgent`, ISO timestamp, and `webAppOrigin`.

### Portal Sub-Tabs

`AdminSubTabs = PortalSlot("admin-sub-tabs")` lets `ExtensionTabPage` render nested tabs into the shell header row without prop drilling.

## Impact Analysis

| Component                         | Impact Type | Description                                        |
| --------------------------------- | ----------- | -------------------------------------------------- |
| `AdminShell`                      | New         | Primary tab shell, route sync, `AdminSubTabs.Slot` |
| `ExtensionTabPage`                | New         | Status + Events UI; connection live, rest mocked   |
| `OverviewTabPage`                 | New         | Placeholder only                                   |
| `useExtensionConnectionStatus`    | New         | Ping/pong hook with stale detection                |
| `extension-bridge.protocol` (web) | New         | Shared message types and guards                    |
| `WebBridgeService` (extension)    | New         | Content-script ping responder                      |
| `AdminExtensionStatusService`     | New         | Background status provider                         |
| `web-bridge.content.ts`           | New         | WXT content script entry                           |
| `Sidebar`                         | Modified    | Admin nav item                                     |
| `background.ts`                   | Modified    | `admin.get-status` handler                         |

## Testing Approach

### Unit Tests (existing)

- `useExtensionConnectionStatus.test.ts` — ping send, pong handling, stale → disconnected, retry
- `extension-bridge.protocol.test.ts` (web + extension) — type guards, match pattern
- `admin-extension-status.service.test.ts` — status payload shape
- `runtime-message-listener.test.ts` — synchronous `sendResponse` for admin handler

### Integration Tests (future)

- Extension installed + web on matching origin → Status shows Connected within 5s
- Extension disabled/uninstalled → Disconnected + Retry
- Events feed renders real events after Phase 2 wiring

### Environment

- Vitest + jsdom for web hook/protocol tests
- Node env for extension protocol/service tests

## Development Sequencing

### Build Order (as implemented)

1. **Web bridge protocol** — shared ping/pong types and guards (web + extension). No dependencies.
2. **Extension content script + background handler** — depends on step 1. Responds to pings with status payload.
3. **`useExtensionConnectionStatus` hook** — depends on step 1. Sends pings, tracks connection state.
4. **AdminShell + routes** — depends on step 3 for Extension tab wiring. Adds `/admin`, `/admin/overview`, Sidebar link.
5. **Extension tab UI (Status + Events)** — depends on steps 3–4. Connection cards live; auth/events mocked.
6. **Overview placeholder** — depends on step 4. No data dependencies.

### Remaining Work (Phase 2+)

7. **Replace auth mock** — wire to `useCurrentUser` and/or extension cookie validation. Depends on step 5.
8. **Replace events mock** — subscribe to real extension/API event stream. Depends on step 5 + transport decision (extension runtime vs GraphQL/SSE).
9. **Overview metrics** — GraphQL queries or subscriptions for aggregate stats. Depends on step 6 + API design.
10. **Role guard** — restrict `/admin` to `admin` role if product requires it. Depends on step 4.

## Monitoring and Observability

- **Connection health:** Derivable from admin UI state (`connected` vs `disconnected` ratio during manual QA).
- **Bridge failures:** Silent drop when background `sendMessage` fails — no user-visible error beyond Disconnected. Consider debug logging in extension background for support.
- **No server-side metrics** until events feed is wired to API.

## Technical Considerations

### Key Decisions

- **Decision:** Client-side postMessage bridge for connection status. **Rationale:** Zero API changes; works with MV3 content script injection. **Trade-off:** No server audit trail. **Alternative rejected:** GraphQL query proxied through extension — heavier, couples admin to API auth in extension.
- **Decision:** Primary tabs route-driven; Extension sub-tabs local state via portal slot. **Rationale:** Matches `ProfileShell` / detail-page tab patterns; sub-tabs don't need deep links yet. **Alternative rejected:** Nested routes (`/admin/extension/status`) — premature for two sub-tabs.
- **Decision:** Mock auth and events while shipping connection UI. **Rationale:** Unblocks layout and bridge validation. **Trade-off:** Admin screen shows synthetic data until Phase 2.

### Known Risks

| Risk                                              | Likelihood | Mitigation                                                       |
| ------------------------------------------------- | ---------- | ---------------------------------------------------------------- |
| Content script not injected (stale dev build)     | Medium     | Document WXT rebuild; verify `web-bridge.js` in extension output |
| `localhost` port mismatch vs `WXT_PUBLIC_WEB_URL` | Medium     | Origin guard in `WebBridgeService`; match pattern without port   |
| Mock data mistaken for production                 | Medium     | Label events panel "Live feed preview"; remove mock before GA    |
| No auth guard on `/admin`                         | Low        | Add role check in Phase 3 if required                            |

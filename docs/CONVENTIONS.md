# Conventions

## Component Architecture

### 1) Controllable component state

Use `apps/web/src/modules/applications/shared/hooks/useControllableState.ts` whenever a component can be used in both controlled and uncontrolled modes (i.e., it supports `value` + `onChange` and also a local `defaultValue` fallback).

### 2) Dialogs in dedicated files

Implement dialogs in dedicated component files instead of inline definitions inside page/panel components. This keeps dialog context isolated and allows reuse when the same flow is needed in other screens.

### 3) `aiActions` should be inline literals

When passing `aiActions` to `TipTapEditor`, prefer a literal array directly in props (for example, `aiActions={[actionA, actionB]}`) instead of creating a separate `const` variable used only for that prop.

### 4) Isolate clear-scope implementations

If an implementation has a clear and specific objective, it should be attempted in isolation. Prefer extracting this logic into a dedicated hook (when using React hooks) or a dedicated function, ideally in a separate file.

## Data Consistency

### 5) Refresh list views after create/delete mutations

When a mutation creates or deletes list-backed entities (for example, applications or companies), always refetch the corresponding list query and set `awaitRefetchQueries: true` so the list is updated before success flows continue (toast, dialog close, or redirect).

## Development Environment

### 6) Mobile debug mode networking (Cursor)

When debugging web flows from a mobile device (for example Android/iOS via ngrok), avoid direct client calls to `127.0.0.1` for debug ingestion. In this scenario, mobile browsers cannot reach the local loopback of the development machine, and HTTPS pages may block mixed-content requests to local HTTP endpoints.

Use a same-origin debug route in `apps/web` (for example `"/__debug_ingest"`) that is proxied/re-written by Next.js only in development. Configure the rewrite destination from environment-derived host information (project allowlisted env vars) instead of hardcoding production behavior. Keep debug ingestion disabled when the destination cannot be resolved.

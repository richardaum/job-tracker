# Content-script architecture (phase 2 reference)

## Goal

Document a future evolution path for the extension DOM executor: migrate from
`chrome.scripting.executeScript` function injection to a content-script runtime
with typed message passing.

This is a follow-up option to the current phase-1 refactor (single injected
runner), not an immediate migration requirement.

## High-level design

- Keep `DomService` as the stable domain boundary (`runSurfaceBatch`,
  `runDetailsBatch`).
- Move DOM interaction helpers (`delay`, `waitForSelector`, `extractFieldValue`,
  extraction loops) into a dedicated `DomRuntimeService` running in a content
  script.
- Use typed extension messages as transport between background/service-layer
  code and the content-script runtime.

## Runtime flow

1. Extension opens or targets a tab (`tabId` is the serializable context).
2. Extension ensures page readiness (tab update + runtime wait selector inside
   content script).
3. Extension sends command message:
   - `DOM_RUN_SURFACE`
   - `DOM_RUN_DETAILS`
4. Content script executes batch extraction in-page and replies with structured
   serializable payload or structured error.
5. Caller maps/merges results in `plan` services (`FieldMappingService`,
   `ListMapSurfaceService`, `ListMapDetailsService`).

## Proposed message contract

- `DomCommand`:
  - `{ type: "DOM_RUN_SURFACE", payload: DomSurfaceBatchInput }`
  - `{ type: "DOM_RUN_DETAILS", payload: DomDetailsBatchInput }`
- `DomResponse`:
  - success: `{ ok: true, data: DomBatchRow[] | DomBatchRow }`
  - failure: `{ ok: false, error: string, code?: string, meta?: object }`

## Why this phase exists

- Removes serialization constraints of `executeScript(func)`.
- Enables real shared modules for DOM helpers and runtime logic.
- Improves observability, retry semantics, and error envelopes.
- Better foundation for multi-step execution in long-running tabs.

## Migration notes

- Keep phase-1 runner as a safe baseline while introducing content script path.
- Introduce dual-path compatibility first, then flip default path once stable.
- Ensure manifest permissions and host matching are explicit and least-privilege.
- Maintain serializable-only contracts at service boundaries.

## Risks and mitigations

- Content script not available in target tab:
  - mitigate with deterministic load strategy and clear error code.
- Navigation timing / SPA hydration races:
  - keep `waitForSelector` with bounded timeout inside runtime.
- Permission drift:
  - keep host permissions scoped and documented per importer target.

## Non-goals for this note

- This file does not define final folder layout or all implementation tasks.
- This file does not replace the primary spec narrative in `README.md`.
- This file does not change current acceptance criteria by itself.

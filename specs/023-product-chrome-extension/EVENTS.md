# Extension Import Events Plan (TODO)

Goal: deliver import-run event streaming to the extension with single-consumer claiming, while keeping the design small and extensible.

## How we execute

- Complete one step at a time.
- After each step: run verification, report results, and resync this plan if needed.
- Do not start the next step until the previous step is verified.
- After verification, commit the changes to the codebase.

## TODO Checklist

- [x] **Step 1 - Define contract (schema-first)**
  - Add import event envelope in GraphQL (import-domain scoped):
    - `ImportRunEventType` (e.g. `IMPORT_RUN_CREATED`)
    - `ImportRunEvent` payload: `type`, `occurredAt`, `run`
    - `importRunEvents` subscription
  - Add atomic claim mutation contract:
    - `claimImportRun(id: ID!): ImportRunType` (nullable on claim failure) OR explicit claim payload.
  - Keep existing run status lifecycle and transition rules.
  - **Verify:** schema compiles and generated `apps/api/src/schema.gql` contains new types/fields.
  - **Resync:** confirm naming before implementation.

- [x] **Step 2 - API event publisher abstraction (minimal)**
  - Add a tiny imports-domain publisher interface (`publish(event)`).
  - Provide one concrete implementation backed by in-memory pub/sub.
  - Update imports service to publish via abstraction (not direct pub/sub calls).
  - **Verify:** imports service tests pass and publish path is covered.
  - **Resync:** include `userId` in the internal domain event envelope for subscription filtering; keep GraphQL payload unchanged.

- [x] **Step 3 - API subscription resolver**
  - Implement `importRunEvents` subscription resolver.
  - Scope events by authenticated `userId`.
  - Emit `IMPORT_RUN_CREATED` from `createImportRun` after persistence.
  - **Verify:** resolver tests confirm user scoping and payload shape.
  - **Resync:** confirmed `IMPORT_RUN_CREATED` naming and user-scoped filtering at subscription path.

- [x] **Step 4 - Atomic claim implementation**
  - Add repository compare-and-swap update:
    - Claim only when `status = RUNNING` (single statement with return value).
  - Implement service + resolver `claimImportRun`.
  - Ensure claim failure does not throw for normal contention (returns null/false).
  - **Verify:** concurrent claim test proves exactly one winner.
  - **Resync:** validate API response shape for extension ergonomics.

- [x] **Step 5 - Extension GraphQL operations + client wiring**
  - Add extension GraphQL docs for:
    - `importRunEvents` subscription
    - `claimImportRun` mutation
  - Regenerate extension gql artifacts.
  - Add background subscription client (SSE transport) and lifecycle handling.
  - **Verify:** extension builds/types pass; subscription connects in local dev.
  - **Resync:** confirm transport behavior and reconnect expectations.

- [ ] **Step 6 - Extension event router + execution flow**
  - Add simple event router (`switch(event.type)`).
  - For `IMPORT_RUN_CREATED`:
    - Attempt `claimImportRun`
    - Continue only on successful claim
    - Update status `IN_PROGRESS -> COMPLETED|FAILED`
  - Ignore unknown events safely (forward compatible).
  - **Verify:** local run with two extension instances shows one claimant executes.
  - **Resync:** review status transitions and failure handling.

- [x] **Step 7 - Recovery behavior (minimal viable)**
  - On extension startup, query outstanding `RUNNING` runs and attempt claim.
  - Keep lease/heartbeat recovery out of scope for now.
  - API safety net: stale `IN_PROGRESS` runs are automatically reset to `RUNNING` on API startup, and stale `IN_PROGRESS` can be reclaimed by `claimImportRun`.
  - **Verify:** startup recovery picks available runs once.
  - **Resync:** decide if stale `IN_PROGRESS` policy is needed next.

- [ ] **Step 8 - End-to-end validation and cleanup**
  - Run targeted API tests + extension checks.
  - Ensure schema/codegen outputs are committed and consistent.
  - Document final behavior and known limits in spec docs if needed.
  - **Verify:** all checks green for touched areas.
  - **Resync:** publish final follow-up TODOs (if any).

## Explicitly out of scope (for now)

- Global cross-domain event bus.
- External brokers (Redis/Kafka/SQS).
- Complex delivery guarantees (retries, dedup stores, leasing system).

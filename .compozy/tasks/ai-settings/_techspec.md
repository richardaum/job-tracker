# TechSpec: AI Settings — Per-User OpenAI Key and AI Toggle

**Status**: planned · **Created**: 2026-07-30 · **PRD**: [\_prd.md](./_prd.md)

## Executive Summary

Move OpenAI key ownership from a single server-wide environment variable to a per-user, encrypted-at-rest column on the existing `UserSettingEntity`, with a 50-call trial quota on the shared system key before a personal key is required. All gating (toggle state, key presence, trial quota) is enforced in one place — `AiBaseService.callAi()` — so every one of the 9 AI-consuming services inherits correct behavior automatically instead of requiring per-call-site checks. The frontend mirrors this with a single Apollo error link that catches AI-blocked GraphQL errors anywhere in the app and opens one shared dialog, rather than per-component error handling.

The primary trade-off: centralizing gating in `AiBaseService.callAi()` requires changing its `CallAiOptions` signature (adding a required `userId`) across all 9 subclasses, a wider one-time diff than a guard-based approach would need — but it makes the check unavoidable for any future AI feature that extends `AiBaseService`, rather than opt-in per resolver.

## System Architecture

### Component Overview

- **`AiAccessService`** (new) — resolves the effective OpenAI key for a user (personal key, decrypted, or system key while consuming trial quota) and throws a `GraphQLError` with a distinguishing `extensions.code` when blocked. Owns all gating logic in one place.
- **`EncryptedColumnTransformer`** (new) — TypeORM `ValueTransformer` performing AES-256-GCM encrypt/decrypt for the `openaiApiKeyEncrypted` column, using a master key from `apiEnv.SETTINGS_ENCRYPTION_KEY`.
- **`AiBaseService`** (modified) — `callAi()` now requires `userId` in `CallAiOptions` and calls `AiAccessService.resolveClientKey()` before constructing the OpenAI client, instead of `OpenAIClient.getClient()` reading only the system key.
- **`OpenAIClient`** (modified) — gains a method to build a request-scoped client from an arbitrary key (personal or system), replacing its current single-instance-at-construction model.
- **`SettingsResolver` / `SettingsService`** (modified) — `UpdateSettingsInput` gains `aiEnabled`; two new mutations, `saveOpenAiKey` and `removeOpenAiKey`, handle key lifecycle (the former validates against `GET /v1/models` before persisting).
- **Frontend `aiBlockedLink`** (new Apollo Link) — inspects `extensions.code` on every GraphQL response; on an AI-blocked code, opens `AiBlockedDialog` with the matching message and a link to `/profile/settings`.
- **Frontend `SettingsTabPage`** (modified) — gains an OpenAI key field (masked, save/replace/remove) and an AI-enabled `Switch`, following the existing `SettingCard` patterns. Once `hasOpenAiKey` is true, a lock icon with a tooltip ("stored encrypted, used only for your own requests") renders next to the field — a static UI element driven by the existing `hasOpenAiKey` boolean, no new query or state.
- **Frontend `Sidebar`** (modified) — renders a trial-quota trackbar, sourced from `UserSetting.trialCallsUsed` / `trialCallsLimit`, hidden once `hasOpenAiKey` is true.

### Data Flow

1. A resolver (e.g., `askQuestion` in `ai-chat.resolver.ts`) calls its service, which extends `AiBaseService` and calls `callAi({ ..., userId })`.
2. `callAi()` calls `AiAccessService.resolveClientKey(userId)`, which reads `UserSettingEntity`, checks `aiEnabled`, then either decrypts the stored key or atomically consumes trial quota against the system key.
3. On success, `callAi()` builds an `OpenAI` client from the resolved key and proceeds exactly as today.
4. On failure, `resolveClientKey()` throws a `GraphQLError` with `extensions.code` set to `AI_DISABLED_BY_USER` or `AI_KEY_REQUIRED`; this propagates unmodified through the existing `graphqlFormatError` pass-through (it is not a `NotFoundException`/`ForbiddenException`, so it isn't masked).
5. The frontend Apollo error link matches the code and opens `AiBlockedDialog`, independent of which of the 9 components triggered the call.

## Implementation Design

### Core Interfaces

Gating resolution — the single choke point, using an atomic conditional increment to avoid a race where concurrent requests both pass a stale quota check:

```typescript
@Injectable()
export class AiAccessService {
  constructor(
    @InjectRepository(UserSettingEntity) private readonly settings: Repository<UserSettingEntity>,
    private readonly encryption: EncryptionService,
  ) {}

  async resolveClientKey(userId: string): Promise<string> {
    const setting = await this.settings.findOneByOrFail({ userId });
    if (!setting.aiEnabled) {
      throw new GraphQLError("AI is turned off for your account.", { extensions: { code: "AI_DISABLED_BY_USER" } });
    }
    if (setting.openaiApiKeyEncrypted) {
      return this.encryption.decrypt(setting.openaiApiKeyEncrypted);
    }
    const { affected } = await this.settings
      .createQueryBuilder()
      .update(UserSettingEntity)
      .set({ trialCallsUsed: () => '"trial_calls_used" + 1' })
      .where("user_id = :userId AND trial_calls_used < :limit", { userId, limit: apiEnv.TRIAL_AI_CALL_LIMIT })
      .execute();
    if (!affected) {
      throw new GraphQLError("Your AI trial is over — add your own OpenAI key.", {
        extensions: { code: "AI_KEY_REQUIRED" },
      });
    }
    return apiEnv.OPENAI_API_KEY!;
  }
}
```

`CallAiOptions` and `callAi()` changes (additive, no change to existing response-format branches):

```typescript
export type CallAiOptions = (/* existing union members */ { /* ... */ }) & { userId: string };

async callAi(opts: CallAiOptions): Promise<unknown> {
  const key = await this.aiAccess.resolveClientKey(opts.userId);
  const client = this.openAIClient.getClientFor(key);
  // ...unchanged switch on opts.responseFormat
}
```

Field-level encryption transformer:

```typescript
export class EncryptedColumnTransformer implements ValueTransformer {
  to(value: string | null): string | null {
    if (!value) return value;
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", masterKey(), iv);
    const enc = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString("base64");
  }
  from(value: string | null): string | null {
    if (!value) return value;
    const raw = Buffer.from(value, "base64");
    const [iv, tag, data] = [raw.subarray(0, 12), raw.subarray(12, 28), raw.subarray(28)];
    const decipher = createDecipheriv("aes-256-gcm", masterKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  }
}
```

### Data Models

`UserSettingEntity` additions (`apps/api/src/database/entities/user-setting.entity.ts`):

| Column                     | Type           | Default | Notes                                                                                                                                                                  |
| -------------------------- | -------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ai_enabled`               | boolean        | `true`  | Independent manual toggle; matches current behavior (AI available) until the user opts out                                                                             |
| `openai_api_key_encrypted` | text, nullable | `null`  | AES-256-GCM ciphertext via `EncryptedColumnTransformer`; never returned raw over GraphQL                                                                               |
| `trial_calls_used`         | int            | `0`     | Consumed atomically by `AiAccessService`; existing rows get `0` from the column default, granting every current user a fresh 50-call trial at launch (PRD requirement) |

GraphQL `UserSetting` type additions (`apps/api/src/domains/settings/user-setting.type.ts`):

```graphql
type UserSetting {
  # ...existing fields
  aiEnabled: Boolean!
  hasOpenAiKey: Boolean! # computed from openaiApiKeyEncrypted != null; raw key never exposed
  trialCallsUsed: Int!
  trialCallsLimit: Int! # apiEnv.TRIAL_AI_CALL_LIMIT, surfaced for the sidebar trackbar
}

input UpdateSettingsInput {
  # ...existing fields
  aiEnabled: Boolean
}
```

New environment variables (`apps/api/src/env/server.ts`, zod schema, same pattern as `AUTH_BYPASS_ENABLED`):

- `SETTINGS_ENCRYPTION_KEY` (string, required, 32-byte key for AES-256-GCM master key)
- `TRIAL_AI_CALL_LIMIT` (number, default `50`)

### API Endpoints (GraphQL)

| Operation                                     | Type     | Description                                                                                                                                   |
| --------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                                    | Query    | Existing; response now includes `aiEnabled`, `hasOpenAiKey`, `trialCallsUsed`, `trialCallsLimit`                                              |
| `updateSettings(input: UpdateSettingsInput!)` | Mutation | Existing; accepts optional `aiEnabled` alongside current fields                                                                               |
| `saveOpenAiKey(key: String!)`                 | Mutation | New; validates via `GET /v1/models` against the provided key before persisting encrypted. Throws `AI_KEY_INVALID` on validation failure       |
| `removeOpenAiKey`                             | Mutation | New; clears `openai_api_key_encrypted`. Does not touch `aiEnabled` or `trial_calls_used` (ADR-002/PRD: key and toggle are independent states) |

Error codes surfaced via `extensions.code` (new, no existing precedent — see ADR-003/004):

- `AI_DISABLED_BY_USER` — toggle is off
- `AI_KEY_REQUIRED` — toggle on, no personal key, trial quota exhausted
- `AI_KEY_INVALID` — `saveOpenAiKey` validation call failed

## Integration Points

- **OpenAI API** — `GET /v1/models` used for save-time key validation (no token cost); existing `chat.completions.parse` / `responses.create` calls unchanged except the client is now built per-request from the resolved key instead of once at app startup.

## Impact Analysis

| Component                                                                                                                    | Impact Type | Description and Risk                                                                          | Required Action                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `UserSettingEntity`                                                                                                          | Modified    | 3 new columns; low risk, additive migration                                                   | Add migration, update entity                                                           |
| `AiBaseService.callAi()`                                                                                                     | Modified    | Signature change (`userId` required); every subclass call site must pass it                   | Update `CallAiOptions` and all 9 call sites                                            |
| `OpenAIClient`                                                                                                               | Modified    | No longer builds a single client at construction; gains `getClientFor(key)`                   | Refactor construction logic                                                            |
| 9 AI services (chat, notes, match, draft-extraction, summary, company-description, rewrite, restructure, location-inference) | Modified    | Each passes `userId` into `callAi()`; no gating logic added here (lives in `AiAccessService`) | Thread `userId` from existing resolver context                                         |
| `SettingsResolver` / `SettingsService`                                                                                       | Modified    | New mutations, extended input                                                                 | Implement `saveOpenAiKey`, `removeOpenAiKey`; extend `updateSettings`                  |
| `apiEnv` (`env/server.ts`)                                                                                                   | Modified    | 2 new required/optional env vars                                                              | Add `SETTINGS_ENCRYPTION_KEY`, `TRIAL_AI_CALL_LIMIT`; update `.env.example` and CI env |
| `SettingsTabPage.tsx`                                                                                                        | Modified    | New key field + toggle, reusing `SettingCard` pattern                                         | Add field, mutations, optimistic updates                                               |
| `Sidebar.tsx`                                                                                                                | Modified    | New trackbar block                                                                            | Add conditional render based on `hasOpenAiKey`                                         |
| Apollo client setup (`apps/web`)                                                                                             | Modified    | New error link                                                                                | Add `aiBlockedLink` to the link chain                                                  |
| `AiBlockedDialog`                                                                                                            | New         | Built on `packages/ui` `Dialog`                                                               | New component + shared open/close state                                                |
| `apps/web/src/graphql/**` + codegen                                                                                          | Modified    | New `.graphql` operation files for `saveOpenAiKey`/`removeOpenAiKey`                          | Add operations, run codegen                                                            |

## Testing Approach

### Unit Tests

- `AiAccessService.resolveClientKey`: toggle off → `AI_DISABLED_BY_USER`; personal key present → returns decrypted key, no quota mutation; no key + quota remaining → increments `trialCallsUsed`, returns system key; no key + quota exhausted → `AI_KEY_REQUIRED`, no increment beyond limit.
- `EncryptedColumnTransformer`: round-trip encrypt/decrypt equality; distinct ciphertext for the same plaintext across calls (random IV); decrypt failure on tampered ciphertext (auth tag mismatch).
- `saveOpenAiKey` resolver: rejects on `models.list()` failure without persisting; accepts and encrypts on success.

### Integration Tests

- `AiBaseService.callAi()` end-to-end with a mocked `OpenAIClient`: confirms gating runs before any OpenAI call is attempted for each of the three blocked states.
- One representative AI service (e.g., `summary-ai.service.ts`) exercised through its resolver to confirm `userId` threading and that a real GraphQL error with the correct `extensions.code` reaches the response.
- `settings` query / `updateSettings` mutation: confirm `aiEnabled`, `hasOpenAiKey`, `trialCallsUsed`, `trialCallsLimit` round-trip correctly and the raw key is never present in any response.
- Existing `SettingsTabPage` test suite extended to cover the new field and toggle following its established optimistic-update test patterns.
- Frontend: `aiBlockedLink` unit test asserting each of the 3 error codes opens the dialog with the matching copy, and non-AI errors pass through untouched.

## Development Sequencing

### Build Order

1. Add `SETTINGS_ENCRYPTION_KEY` and `TRIAL_AI_CALL_LIMIT` to `apiEnv` — no dependencies.
2. Migration adding `ai_enabled`, `openai_api_key_encrypted`, `trial_calls_used` to `user_settings` — no dependencies.
3. `EncryptedColumnTransformer` + wire onto `UserSettingEntity.openaiApiKeyEncrypted` — depends on step 1 (master key) and step 2 (column).
4. `AiAccessService` (gating + key resolution) — depends on step 3 (decrypt) and step 2 (entity columns).
5. `OpenAIClient.getClientFor(key)` — no dependency on steps 1–4, can proceed in parallel.
6. Update `AiBaseService.callAi()` to require `userId`, call `AiAccessService`, use `getClientFor` — depends on steps 4 and 5.
7. Thread `userId` through all 9 AI service call sites — depends on step 6.
8. GraphQL: extend `UserSetting` type, `UpdateSettingsInput`, add `saveOpenAiKey`/`removeOpenAiKey` mutations — depends on step 2 (columns) and step 4 (for key validation reuse, if any); independent of step 7.
9. Frontend codegen run to generate typed hooks for new operations — depends on step 8.
10. `SettingsTabPage.tsx`: key field + AI toggle — depends on step 9.
11. `aiBlockedLink` + `AiBlockedDialog` — depends on step 9 (needs the error codes defined server-side, step 8).
12. `Sidebar.tsx` trackbar — depends on step 9 (needs `trialCallsUsed`/`trialCallsLimit`/`hasOpenAiKey` in codegen'd types).

### Technical Dependencies

- `SETTINGS_ENCRYPTION_KEY` must be generated and set in every environment (local `.env`, CI, staging, production) before step 3 can run against real data; missing it should fail fast at boot via the zod schema, not at first key-save attempt.

## Monitoring and Observability

- Log every gating denial (`AI_DISABLED_BY_USER`, `AI_KEY_REQUIRED`) with `userId` and reason at `warn` level from `AiAccessService`, to track trial-to-key conversion and toggle-off adoption.
- Log `saveOpenAiKey` validation failures (without logging the key itself) to catch unexpected OpenAI API issues distinct from genuinely invalid keys.
- Track trial quota exhaustion rate post-launch (PRD Risk: "existing users all hit trial exhaustion around the same time") — a spike right after launch is expected and not itself an alert condition, but sustained high exhaustion-to-abandonment should be watched.

## Technical Considerations

### Key Decisions

See [ADR-002](./adrs/adr-002.md) (server-side encrypted key storage vs. client-side/KMS), [ADR-003](./adrs/adr-003.md) (centralized gating in `AiBaseService.callAi()` vs. per-resolver guards), and [ADR-004](./adrs/adr-004.md) (centralized frontend error handling vs. per-component).

- **Decision**: Trial quota (`TRIAL_AI_CALL_LIMIT`) is an env var, not a runtime-configurable DB value. **Rationale**: matches the existing `apiEnv` pattern for operational flags; this project's deploy cycle is fast enough that a redeploy to adjust it is not a meaningful cost. **Trade-off**: cannot be tuned without a deploy. **Alternative rejected**: a DB-backed config table, deferred as unnecessary complexity for a single tunable integer.
- **Decision**: Key validation on save uses `GET /v1/models` rather than a real completion call. **Rationale**: zero token cost, confirms authentication works. **Trade-off**: does not confirm the key has access to the specific model configured in `OPENAI_MODEL` — a key valid for `/v1/models` but lacking access to a specific model would still pass validation and only fail on first real use.
- **Decision**: `trial_calls_used` is incremented atomically _before_ the OpenAI call executes, and is never decremented if that call subsequently fails (network error, timeout, OpenAI-side error). **Rationale**: keeps the increment a single atomic statement with no distributed transaction spanning the database and an external HTTP call, and no second write path to test; OpenAI-side failures after a successful gating check are rare enough not to justify the complexity. **Trade-off**: a user can lose a trial call to a transient OpenAI failure that wasn't their fault. **Alternatives rejected**: refunding via a second (unconditional) decrement on confirmed failure — safe but adds a second write path per failure; charging only on confirmed success — avoids ever refunding, but turns the pre-call quota check into a plain read instead of an atomic reservation, allowing concurrent bursts from the same user to briefly exceed the quota at the operator's expense.

### Known Risks

- **Trial quota race condition**: mitigated by the atomic conditional `UPDATE ... WHERE trial_calls_used < limit` in `AiAccessService`, avoiding the read-then-write race a naive read-check-increment would have.
- **Master key management**: `SETTINGS_ENCRYPTION_KEY` has no rotation mechanism in this phase. Rotating it requires a manual re-encryption migration of all `openai_api_key_encrypted` rows — acceptable for MVP, flagged for Phase 2 if key rotation becomes a requirement.
- **`CallAiOptions` signature change**: touches all 9 call sites in one PR; mitigated by TypeScript's compiler catching every missed call site at build time (adding a required field breaks compilation until every caller is updated).

## Architecture Decision Records

- [ADR-001: Single-Phase Delivery](./adrs/adr-001.md) — ship key management, trial quota, manual toggle, and modal gating together in one MVP.
- [ADR-002: Server-Side Encrypted Storage of Per-User OpenAI Key](./adrs/adr-002.md) — AES-256-GCM column transformer with an env-var master key, over client-side localStorage or a managed KMS.
- [ADR-003: Centralized AI Gating in AiBaseService.callAi()](./adrs/adr-003.md) — single choke-point enforcement over per-resolver guards.
- [ADR-004: Centralized Frontend AI-Blocked Handling via Apollo Error Link](./adrs/adr-004.md) — global error interception over per-component try/catch.

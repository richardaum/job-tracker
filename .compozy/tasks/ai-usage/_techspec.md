# TechSpec: AI Usage

## Executive Summary

Add an `AiUsageModule` that persists one record for every successful OpenAI request made by Job Tracker. Each record contains the user, source (`PersonalKey` or `Trial`), input tokens, output tokens, total tokens, and timestamp.

A new authenticated GraphQL query aggregates the last 30 days into two separate totals: Personal OpenAI Key Usage and AI Trial Usage. Profile → AI Usage renders those areas with total tokens, input tokens, output tokens, calls, the existing trial-call allowance, and a Refresh control.

**Primary trade-off:** usage starts being measured at deployment. Earlier requests cannot be reconstructed truthfully.

## System Architecture

### Component Overview

```text
AI feature request
  ├─ AiBaseService / AiChatGenerationService
  ├─ AiAccessService resolves PersonalKey or Trial
  ├─ OpenAI response supplies token usage
  └─ AiUsageService records source-specific usage
       └─ ai_usage_records

Profile → AI Usage
  └─ aiUsage GraphQL query
       └─ last-30-days aggregates by source
```

`AiUsageModule` owns the entity, repository, service, types, and resolver. `LibAiModule` imports it to record usage at the shared AI boundary. The web client uses only the authenticated GraphQL query.

## Implementation Design

### Core Interfaces

```typescript
export enum AiUsageSourceEnum {
  PersonalKey = "PersonalKey",
  Trial = "Trial",
}

export type AiTokenUsage = { inputTokens: number; outputTokens: number; totalTokens: number };

export class AiUsageService {
  record(userId: string, source: AiUsageSourceEnum, usage: AiTokenUsage): Promise<void>;
  getSummary(userId: string): Promise<AiUsageSummary>;
}
```

### Data Models

`ai_usage_records` has a generated text ID, `user_id`, `source`, `input_tokens`, `output_tokens`, `total_tokens`, and `created_at`. A `(user_id, source, created_at)` index supports the rolling aggregate. No API key, prompt, response content, or raw provider payload is persisted.

`AiUsageSummary` has `personalKey` and `trial` totals, each with input, output, total, and calls. It additionally returns `trialCallsUsed` and `trialCallsLimit` from existing settings.

### API Endpoints

| Operation                  | Description                                                                       |
| -------------------------- | --------------------------------------------------------------------------------- |
| `aiUsage: AiUsageSummary!` | Returns the authenticated user's last-30-days Job Tracker usage, split by source. |

The resolver uses the existing JWT and user-role guards and delegates to `AiUsageService`.

## Integration Points

OpenAI token usage comes from successful Chat Completions, Responses, and the final usage chunk of streaming Chat Completions. The `AiAccessService` returns an access object containing the key and source, preserving its current atomic trial-call increment. Missing usage payloads are not recorded and do not change the original AI feature result.

## Impact Analysis

| Component                       | Impact Type | Description and Risk                             | Required Action                                         |
| ------------------------------- | ----------- | ------------------------------------------------ | ------------------------------------------------------- |
| `apps/api/src/database`         | modified    | New durable usage records; medium migration risk | Add entity, index, migration, registries                |
| `apps/api/src/domains/ai-usage` | new         | Authenticated aggregation surface                | Add module, repository, service, resolver, types        |
| `apps/api/src/lib/ai`           | modified    | Shared instrumentation reaches most calls        | Resolve source and persist usage only after success     |
| `apps/api/src/domains/ai-chat`  | modified    | Bypasses the base service                        | Capture title and stream usage                          |
| `apps/web/src/modules/profile`  | modified    | New primary Profile tab                          | Add route, view-model, presentational components, tests |
| `apps/web/src/graphql`          | modified    | Generated query types                            | Add operation and regenerate hooks                      |

## Testing Approach

### Unit Tests

- Aggregate by source and enforce an inclusive 30-day start boundary.
- Verify source resolution preserves personal-key and trial behavior.
- Verify successful Chat Completions, Responses, title completions, and streams record exact usage.
- Verify missing usage does not create misleading records or fail the original request.

### Integration Tests

- Query `aiUsage` through GraphQL as an authenticated user and verify no cross-user records appear.
- Apply the migration against the test database.
- Exercise the Profile AI Usage tab's loading, empty, refresh, and trial states.

## Development Sequencing

### Build Order

1. Create the usage database model, migration, and aggregation service — no dependencies.
2. Extend the AI access boundary to return the usage source — depends on step 1.
3. Instrument all AI call paths — depends on steps 1 and 2.
4. Add the authenticated GraphQL query and regenerate the web client — depends on steps 1 through 3.
5. Build the Profile subtab and tests — depends on step 4.

### Technical Dependencies

- The existing OpenAI SDK response types must expose usage for successful calls.
- API schema regeneration must precede web GraphQL code generation.

## Monitoring and Observability

- Log a source and request path when a successful provider response lacks usage, without logging keys, prompts, or responses.
- Track application errors from the aggregation query through existing API error reporting.

## Technical Considerations

### Key Decisions

- **Record at the AI boundary:** covers shared callers consistently; explicit chat instrumentation covers its direct calls.
- **Use one immutable record per successful call:** enables correct rolling aggregation and source separation.
- **Do not backfill:** no safe source exists for historical Job Tracker request usage.

### Known Risks

- Stream usage requires `include_usage`; tests must cover the final chunk.
- A user could replace a personal key; source-specific records intentionally remain historical usage for the personal-key category rather than a particular key fingerprint.

## Architecture Decision Records

- [ADR-001: Provide an in-app OpenAI usage panel](adrs/adr-001.md) — Separates personal-key and AI Trial Job Tracker usage.
- [ADR-002: Record Job Tracker token usage at the AI boundary](adrs/adr-002.md) — Uses durable, source-specific records for exact rolling totals.

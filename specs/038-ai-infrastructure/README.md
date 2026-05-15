---
status: completed
created: 2026-05-15
priority: high
tags:
  - api
  - ai
  - architecture
created_at: 2026-05-15T18:36:25.524694Z
updated_at: 2026-05-15T18:36:25.524694Z
---

# Technical Scope: ai-infrastructure

> **Status**: planned · **Priority**: high · **Created**: 2026-05-15

## Objective

Refactor the AI layer in `apps/api` to eliminate dependency violations, remove code duplication, and align module boundaries with domain ownership. The migration consolidates shared infrastructure into `lib/ai/`, moves domain-specific AI logic into per-domain subdirectories, and removes the orphan `domains/application-ai/` and `domains/ai/` modules.

## Motivation

Four structural problems exist today:

| #   | Problem                                                                                                                                                                             | Impact                                                                                                                                     |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `openai.service.ts` lives inside `domains/application-ai/` but is consumed by every AI service across the API                                                                       | Dependency direction violation — `company-ai`, `note-ai`, `fit-analysis`, and `domains/ai/` all import from a module that is not the owner |
| 2   | `OpenAIService` is instantiated in **two** separate modules (`ApplicationAiModule` and `CompanyAiModule`)                                                                           | Two singleton instances, defeating NestJS DI guarantees                                                                                    |
| 3   | The same calling pattern (`tryRun → openai.chat → parse → throw`) is manually repeated across 5 services                                                                            | ~15 lines of identical boilerplate per method, ~40+ lines total                                                                            |
| 4   | `domains/ai/` is a pseudo-domain — it contains generic text utilities (`rewriteTextAsSingleParagraph`, `restructureJobDescription`) with no domain entity, repository, or lifecycle | Misleading module boundary; the code is shared infra, not a domain                                                                         |

## Design

### D1: Subdomains `X/ai/` over top-level `X-ai/`

AI logic that serves a single domain lives in a `domains/{X}/ai/` subdirectory. This keeps co-located what changes together, and avoids orphan modules when a domain is removed.

```
domains/applications/
├── ai/               ← NEW: Application inference logic only
└── applications.service.ts

domains/draft-applications/
├── ai/               ← NEW: Draft extraction logic
└── draft-applications.service.ts
```

### D2: Shared infra in `lib/ai/`

The OpenAI client, base service, prompt renderer, and truly generic utilities live in a flat `lib/ai/` module. Every domain AI service depends on `lib/ai/`, never on another domain.

```
lib/ai/
├── openai.client.ts
├── ai-base.service.ts
├── prompt-renderer.service.ts
├── rewrite-text.service.ts
├── restructure-jd.service.ts
├── location-inference.service.ts
├── location-inference.schema.ts
├── location-inference.templates.ts
└── index.ts
```

### D3: Location inference in `lib/ai/`, not a domain

`LocationInferenceService` is used by both `draft-applications` and `applications`. Placing it in a domain would create cross-domain dependency. As a pure text-in/text-out utility scoped to AI infra, it belongs in `lib/ai/`.

### D4: Separate AI service per domain, not monolithic

Each domain keeps its own dedicated AI service (e.g., `draft-extraction.service.ts`, `company-description.service.ts`). This is justified because:

- Each domain has unique prompt templates, schemas, and post-processing
- Prompts evolve at different cadences per domain
- Separating concerns avoids a single bloated `AiService` with conditional paths

## Target structure

```
apps/api/src/
├── lib/ai/                              ← NEW: shared AI infrastructure
│   ├── openai.client.ts                 ← from application-ai/openai.service.ts
│   ├── ai-base.service.ts               ← NEW
│   ├── prompt-renderer.service.ts       ← NEW (wraps TemplateService)
│   ├── rewrite-text.service.ts          ← from domains/ai/ai.service.ts (method)
│   ├── restructure-jd.service.ts        ← from domains/ai/ai.service.ts (method)
│   ├── location-inference.service.ts    ← from application-ai/application-ai.service.ts
│   ├── location-inference.schema.ts     ← from application-ai/
│   ├── location-inference.templates.ts  ← from application-ai/
│   ├── lib-ai.module.ts                 ← NEW
│   └── index.ts
│
├── domains/draft-applications/
│   ├── ai/                              ← NEW subdomain
│   │   ├── draft-extraction.schema.ts   ← from application-ai/
│   │   ├── draft-extraction.model.ts    ← from application-ai/
│   │   ├── draft-extraction.templates.ts← from application-ai/
│   │   ├── draft-extraction.types.ts    ← from application-ai/
│   │   ├── draft-extraction-normalization.service.ts ← from application-ai/
│   │   └── draft-extraction.service.ts  ← rename of ApplicationAiService
│   ├── draft-applications.service.ts
│   ├── draft-applications.resolver.ts
│   └── draft-applications.module.ts
│
├── domains/applications/
│   ├── ai/
│   │   ├── application-inference.service.ts ← NEW (thin facade if needed)
│   │   └── summary-ai.service.ts            ← from application-ai/ + rename SummaryAiService
│   ├── applications.service.ts
│   ├── applications.module.ts
│   ├── summary.service.ts                   ← untouched (orchestration, not AI)
│   └── summary-event.listener.ts            ← untouched (event trigger)
│
├── domains/companies/
│   ├── ai/
│   │   └── company-description.service.ts ← rename of CompanyAiService
│   ├── companies.service.ts
│   └── companies.module.ts
│
├── domains/notes/
│   ├── ai/
│   │   └── note-generation.service.ts   ← rename of NoteAiService
│   ├── notes.service.ts
│   └── notes.module.ts
│
└── domains/fit-analysis/                ← unchanged (already proper domain)
    └── fit-analysis-ai.service.ts
```

### Removed

- `domains/application-ai/` — fully dissolved into `lib/ai/` and `domains/draft-applications/ai/`
- `domains/ai/` — dissolved into `lib/ai/`
- `CompanyAiModule` providers: `[OpenAIService]` duplicate — removed once `openai.client.ts` moves to `lib/ai/`

## Plan

### Phase 1 — `lib/ai/` shared infrastructure

- [T-243] **OpenAIClient**: Extract `openai.service.ts` from `domains/application-ai/` into `lib/ai/openai.client.ts`. Export `OpenAIClient` (same interface — `getClient(): OpenAI`). This class has no NestJS module dependency — it can be imported and provided by any module.

- [T-244] **AiBaseService**: Create `lib/ai/ai-base.service.ts` with a generic `callAi<T>(opts: CallAiOptions<T>): Promise<T>` method that:
  - Renders system/user templates via `PromptRendererService` (see [T-245])
  - Calls `OpenAIClient.getClient()` with the chosen API format
  - Handles `tryRun` + error wrapping into `BadRequestException`
  - Supports three calling conventions via `CallAiOptions.responseFormat`:
    - `zod-response` → `chat.completions.create` with `zodResponseFormat`
    - `json-schema` → `responses.create` with `text.format.json_schema`
    - `json-schema-with-web-search` → `responses.create` with `text.format.json_schema` + `web_search` tool

  ```typescript
  type CallAiOptions<T> = {
    systemTemplate: string;
    userTemplate: string;
    vars: Record<string, unknown>;
    schema: z.ZodType<T>;
    responseFormat:
      | "zod-response"
      | "json-schema"
      | "json-schema-with-web-search";
    model?: string; // defaults to OPENAI_MODEL env
  };
  ```

- [T-245] **PromptRendererService**: Create `lib/ai/prompt-renderer.service.ts` that wraps the existing `TemplateService` from the shared template module. All AI domain services use this instead of injecting `TemplateService` directly.

- [T-246] **RewriteTextService**: Extract `rewriteTextAsSingleParagraph` from `domains/ai/ai.service.ts` into `lib/ai/rewrite-text.service.ts`. Extends `AiBaseService`. Temperature 0.1, uses `zod-response` format.

- [T-247] **RestructureJDService**: Extract `restructureJobDescription` from `domains/ai/ai.service.ts` into `lib/ai/restructure-jd.service.ts`. Extends `AiBaseService`. Temperature 0.1, uses `zod-response` format.

- [T-248] **LocationInferenceService**: Extract location/work-region inference from `domains/application-ai/application-ai.service.ts` into `lib/ai/location-inference.service.ts`, carrying `.schema.ts` and `.templates.ts` alongside. Two methods:

  ```typescript
  inferLocation(descriptionPlainText: string): Promise<string | null>
  inferWorkRegion(descriptionPlainText: string): Promise<string | null>
  ```

  Extends `AiBaseService`. Uses `zod-response` format with `locationInferenceSchema`/`workRegionInferenceSchema`.

- [T-249] **LibAiModule**: Create `lib/ai/lib-ai.module.ts` that:
  - `imports: [TemplateModule]`
  - `providers: [OpenAIClient, PromptRendererService, AiBaseService, RewriteTextService, RestructureJDService, LocationInferenceService]`
  - `exports: [same list]` — any module that needs AI infra imports `LibAiModule`

### Phase 2 — Domain AI services

- [T-250] **Draft-extraction service**: Move remaining `application-ai/` files into `domains/draft-applications/ai/`:
  - `draft-extraction.schema.ts`, `draft-extraction.model.ts`, `draft-extraction.templates.ts`, `draft-extraction.types.ts` — moved as-is
  - `draft-extraction-normalization.service.ts` — moved as-is
  - `application-ai.service.ts` → **rename** to `draft-applications/ai/draft-extraction.service.ts` (`DraftExtractionService`)
    - `ApplicationAiService.extractFromDraft` → `DraftExtractionService.extract`
    - Now extends `AiBaseService` and uses `callAi()` instead of raw `OpenAIClient.getClient()`
    - Still consumes `PromptRendererService`, `DraftExtractionNormalizationService`
    - Still imports `LocationInferenceService` from `lib/ai/` for location/work-region fields

- [T-251] **Company-description service**: Rename `CompanyAiService` to `domains/companies/ai/company-description.service.ts` (`CompanyDescriptionService`). Extends `AiBaseService`. Uses `json-schema-with-web-search` response format. Remove `OpenAIService` from `CompanyAiModule providers` — now sourced from `LibAiModule`.

- [T-252] **Note-generation service**: Rename `NoteAiService` to `domains/notes/ai/note-generation.service.ts` (`NoteGenerationService`). Extends `AiBaseService`. Uses `zod-response` format.

- [T-253] **Fit-analysis-ai service**: Rename `FitAnalysisAiService` to `FitAnalysisAiService` (name stays, but now extends `AiBaseService` instead of injecting `OpenAIService` directly). Uses `zod-response` format.

- [T-263] **Summary-ai service**: Move `summary-ai.service.ts` from `application-ai/` into `domains/applications/ai/summary-ai.service.ts`. Now extends `AiBaseService`. Uses `json-schema` response format (same as today's `response_format: json_schema`). `SummaryService` (in `applications/`) continues to consume it — now via intra-domain import instead of cross-domain import.

### Phase 3 — Module wiring

- [T-254] **Draft-applications module**: Create or update `domains/draft-applications/draft-applications.module.ts` to:
  - `imports: [LibAiModule, TypeOrmModule.forFeature([DraftApplicationEntity]), ...]`
  - `providers: [DraftExtractionNormalizationService, DraftExtractionService, ...]`
  - `exports: [...]`

- [T-255] **Applications module**: Update `domains/applications/applications.module.ts`:
  - Replace `ApplicationAiModule` import with `LibAiModule`
  - Remove `CompanyAiModule` import — now imports `LibAiModule` which provides basic infra
  - Add `SummaryAiService` to local `providers` (moved into `applications/ai/`)
  - Applications that still need location inference call `LocationInferenceService` directly

- [T-256] **Companies module**: Update `domains/companies/companies.module.ts`:
  - Replace `CompanyAiModule` with inline providers + import `LibAiModule`
  - `providers: [CompanyDescriptionService]`
  - Remove the duplicate `OpenAIService` provider

- [T-257] **Notes module**: Update `domains/notes/notes.module.ts`:
  - Replace `NoteAiModule` with inline providers + import `LibAiModule`
  - `providers: [NoteGenerationService]`

- [T-258] **Fit-analysis module**: Update `domains/fit-analysis/fit-analysis.module.ts`:
  - Replace `ApplicationAiModule` with `LibAiModule`
  - Keep `FitAnalysisAiService` in providers

- [T-259] **Remove orphan modules**: Delete `domains/application-ai/` and `domains/ai/` directories after confirming no remaining imports. Update `app.module.ts` accordingly.

### Phase 4 — Cleanup

- [T-260] **Update tests**: Adjust imports in all affected `*.spec.ts` files to point to new locations. No behavioral changes expected.
- [T-261] **Update schema.gql**: Confirm no GraphQL schema changes needed (all public names stay the same).
- [T-262] **Verify no remaining circular deps**: Run a dependency check to confirm no domain imports from another domain's `ai/` subdirectory (should only import from `lib/ai/`).

## Test

- Each spec (test files) continues to pass after migration
- No behavioral changes — all AI calls produce same output for same input
- Verify `pnpm lint` and `pnpm typecheck` pass in `apps/api`
- Verify `pnpm test` passes for all AI-related specs

## Risk assessment

| Risk                                                                                                       | Likelihood | Mitigation                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `AiBaseService` abstraction doesn't fit all three calling conventions                                      | Medium     | Accept `CallAiOptions.responseFormat` as a union. Each format branch is explicit in the lib — no conditional chains leak into domain code. |
| Merge conflicts with in-flight AI work                                                                     | Low        | Migration is additive until Phase 4. Existing files remain importable until the very end.                                                  |
| `CompanyAiModule` had a sibling OpenAIService instance — new singleton changes behavior                    | Low        | The old duplicate was a bug, not a feature. Tests verify same behavior.                                                                    |
| Location inference is called in two places (draft extraction + application queries) — import chain changes | Low        | Extracted to `lib/ai/` with a single class; both consumers import from same place.                                                         |

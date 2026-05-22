---
status: draft
created: 2026-05-15
priority: medium
tags:
  - api
  - web
  - ai
  - data-model
created_at: 2026-05-15T12:00:00.000000Z
updated_at: 2026-05-15T12:00:00.000000Z
---

# Product Scope: job-summary

> **Status**: active · **Priority**: medium · **Created**: 2026-05-15

## Objective

Add an AI-generated **summary** field to each job — a rich-text paragraph synthesizing the job's Fields, Description, Notes, and Stage events into a concise overview. Displayed as a full-width card at the top of the job detail page, above all other fields. Generation follows the fire-and-forget async pattern defined in **`specs/034-technical-async-task-pattern/README.md`**.

## Context

Reviewing a job detail page requires the user to piece together information spread across multiple sections: the job description, custom fields, notes, and stage history. There is no single place that distills the essential facts about the role. An AI-generated summary fills this gap — one glance at the top of the page tells the user what the job is about without scanning every section.

## Product Outcomes

- [P-180] **AI Summary on Job**: Each job stores an optional `summary` field (TipTap JSON string) that the user can generate on demand via the async pattern.
- [P-181] **Regenerate Summary**: The summary block shows an inline "Regenerate" button that triggers a new async generation against the latest job data.
- [P-182] **Rich Text Rendering**: The summary is rendered as read-only rich text (TipTap content) matching the styling of Description and Notes.
- [P-183] **Full-Width Placement**: The summary card sits above all other fields in the Overview tab, spanning the full width.
- [P-184] **Retroactive Backfill**: A script fills summaries for all existing jobs in `Active` / `Applied` stages, processing them in batches.
- [P-185] **Progressive Regeneration**: Every call to `updateJob` automatically triggers a fresh async summary generation.

## Technical Tasks

### Data Model

- [T-227] **Database Migration**: Add `summary` (text, nullable), `summaryStatus` (enum: `processing`, `completed`, `failed`, default `completed` for legacy), and `summaryError` (text, nullable) columns to the `jobs` table.
- [T-228] **TypeORM Entity**: Add `summary`, `summaryStatus`, `summaryError` columns to `JobEntity`.

### GraphQL & API

- [T-229] **GraphQL Schema**: Add `summary`, `summaryStatus`, `summaryError` to `JobType`. Add `summaryStatus` enum type. Add `generateJobSummary(jobId: ID!): JobType!` mutation (triggers fire-and-forget, returns job immediately with `PROCESSING` status).
- [T-230] **NestJS Resolver & DTOs**: Add fields to `JobType`, `UpdateJobInput` decorators; pass through in `update()`.
- [T-233] **Web GraphQL Operations**: Update `jobs.graphql` queries and mutations to cover `summary`, `summaryStatus`, `summaryError`.

### Async Generation (per spec 034)

- [T-231] **Fire-and-Forget Service**: Split generation into:
  - `generateSummary(jobId)`: Sets `summaryStatus = PROCESSING`, clears `summaryError`, saves, emits event that triggers `processSummaryGeneration()`, returns the job immediately.
  - `processSummaryGeneration(jobId)`: Gathers Fields, Description (plain text via `tipTapToPlainText`), Notes (newest first), Stage events, and current stage into a single OpenAI prompt. On success stores TipTap JSON in `summary` with `summaryStatus = COMPLETED`. On failure stores error in `summaryError` with `summaryStatus = FAILED`.
- [T-241] **Summary Event Listener**: Create `SummaryEventListener` that subscribes to `JobUpdatedEvent` via `JobEventBus`. On event, if stage is `Active` or `Applied` and `summaryStatus !== PROCESSING`, calls `SummaryService.generateSummary()`. Registered in the module providers.
- [T-232] **Prompt Context**: Include title, company name, description plain text, custom fields (key-value), notes (newest first), stage history, and current stage. Instruct the model to produce a concise 2-4 sentence paragraph in TipTap JSON format.
- [T-236] **Stale State Protection** ([T-212]): Add `onModuleInit` hook to reset stuck `PROCESSING` records to `FAILED` on server restart. Use atomic update for concurrency.

### Web UI

- [T-234] **Detail Page UI**: Render summary at the top of `OverviewTabContent` using `TipTapContent` for read-only rich text display. While `summaryStatus === PROCESSING`, show a loading indicator (skeleton/spinner) in place of the summary.
- [T-235] **Regenerate & SSE (replaces polling)**: Wire the `ArrowsClockwiseIcon` button to call `generateJobSummary` mutation. Replace Apollo polling with SSE push (per [spec 038](./038-technical-sse-infrastructure/README.md)) — the frontend subscribes to `GET /jobs/:id/stream` and refetches the job on each event. Disable the button during processing.

### Retroactive Backfill

- [T-237] **Backfill Script**: Create a CLI script (e.g., `scripts/backfill-job-summaries.mjs`) that:
  - Queries all jobs with `currentStage IN ('Active', 'Applied')` and `summaryStatus IS DISTINCT FROM 'processing'`.
  - For each job, calls `generateSummary` (fire-and-forget) — or directly invokes the service method in batches.
  - Logs progress and errors to stdout.
  - Can be run via `pnpm backfill:summaries`.
- [T-238] **Backfill Idempotency**: Skip jobs that already have `summaryStatus = COMPLETED` with a non-null `summary`. Respect a dry-run flag (`--dry-run`).

### Event Bus

- [T-239] **Extend JobEventBus**: Add `JobUpdatedEvent` type (`jobId`, `userId`) and `emitJobUpdated(jobId, userId)` method.
- [T-240] **Wire Event in Update Service**: `JobsService.update()` calls `this.eventBus.emitJobUpdated(id, userId)` after a successful save. No direct dependency on summary logic.
- [T-242] **Update Guard**: Listener skips if stage is not `Active`/`Applied` or `summaryStatus === PROCESSING`.

## Modus Operandi

1. **Async generation** ([spec 034](./034-technical-async-task-pattern/README.md)): The summary mutation never blocks — it sets `PROCESSING`, fires background work, and returns immediately. The frontend receives a push notification via SSE when the summary status changes (per [spec 038](./038-technical-sse-infrastructure/README.md)). This prevents the ~3-10s OpenAI call from holding the HTTP connection.
2. **TipTap JSON throughout**: The summary is stored and returned as TipTap JSON, consistent with `description` and `notes` content. The web layer renders it via `TipTapContent` (read-only).
3. **Prompt context**: The AI prompt includes the job's title, company name, description (plain text), all custom fields (key-value pairs), notes (newest first), stage history, and current stage.
4. **Event-driven progressive regeneration**: `JobsService.update()` emits `JobUpdatedEvent` via the existing `JobEventBus`. A dedicated `SummaryEventListener` consumes the event, checks the stage guard, and triggers generation. This keeps `JobsService` free of summary logic and makes it easy to add other side-effects (audit, webhooks) later — just another listener.
5. **Retroactive + Progressive**: A one-time script backfills existing Active/Applied jobs in batches. After that, every `updateJob` call triggers the event bus, keeping summaries fresh as the user adds notes, changes stages, or edits fields.
6. **Stale state protection**: On server restart, any records stuck in `PROCESSING` are reset to `FAILED`. Atomic updates prevent concurrent workers from overwriting each other.

# Async Task Pattern Reference

> Canonical reference for fire-and-forget async tasks using `AsyncTaskMeta` JSONB.

**Scope boundary**: `AsyncTaskMeta` carries **only** processing state — status, error, timestamp. The actual output/result (summary content, fit items, etc.) stays in its **own column** (text, jsonb, etc.). Never inline business data inside `AsyncTaskMeta`.

**Field naming**: use `{prefix}Metadata` — e.g., `summaryMetadata`, `conversionMetadata`. For standalone entities, just `metadata`.

## [T-213] Type Definition

```typescript
// packages/shared or apps/api/src/common
export interface AsyncTaskMeta {
  status: "processing" | "completed" | "failed";
  error?: string;
  generatedAt?: string; // ISO 8601 — JSONB stores as string
}
```

GraphQL enum + type (defined once, reused everywhere):

```typescript
import { registerEnumType } from "@nestjs/graphql";

export enum TaskStatus {
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}
registerEnumType(TaskStatus, { name: "TaskStatus" });
```

```graphql
enum TaskStatus {
  PROCESSING
  COMPLETED
  FAILED
}

type AsyncTaskMeta {
  status: TaskStatus!
  error: String
  generatedAt: DateTime
}
```

## [T-214] Entity Mapping

**A. Inline on existing entity** — use prefix matching the domain:

```typescript
@Column({ type: "jsonb", nullable: true })
summaryMetadata!: AsyncTaskMeta | null; // null = never requested
```

Column naming: `summary_metadata`, `conversion_metadata`.

**B. Standalone entity** — no prefix, non-null with default:

```typescript
@Column({ type: "jsonb", default: { status: "completed" } })
metadata!: AsyncTaskMeta;
```

Default `{ status: "completed" }` for backward compat with existing records.

## [T-215] Initial Mutation (Setting to Processing)

```typescript
entity.summaryMetadata = { status: "processing" };
// or for standalone:
entity.metadata = { status: "processing" };
await this.repo.save(entity);
```

## [T-216] Atomic Status Update

Background workers **must** guard against stale transitions. Use `QueryBuilder` with JSONB `||` operator:

```typescript
async updateMetadata(
  where: { id: string; userId?: string },
  expectedStatus: TaskStatus,
  patch: Partial<AsyncTaskMeta>,
  column: string = "metadata",
): Promise<boolean> {
  const qb = this.repo
    .createQueryBuilder()
    .update()
    .set({
      [column]: () =>
        `"${column}" || '${JSON.stringify(patch)}'::jsonb`,
    })
    .where(`"id" = :id AND "${column}"->>'status' = :expected`, {
      id: where.id,
      expected: expectedStatus,
    });

  if (where.userId) {
    qb.andWhere(`"user_id" = :userId`, { userId: where.userId });
  }

  const result = await qb.execute();
  return (result.affected ?? 0) > 0;
}
```

For inline fields, pass column name: `updateMetadata({ id }, processing, patch, "summary_metadata")`.

## [T-217] Service Pattern

```typescript
// Mutation-facing — fast, non-blocking
async generate(id: string, userId: string): Promise<Entity> {
  // 1. Validate inputs
  // 2. Set metadata = { status: "processing" }
  // 3. Persist
  // 4. Fire background — never await
  void this.generateInBackground(entity.id, userId);
  // 5. Return immediately
  return entity;
}

// Background — resilient, atomic
private async generateInBackground(
  id: string,
  userId: string,
): Promise<void> {
  const [err] = await tryRun(async () => {
    // ... actual async work ...

    const ok = await this.repo.updateMetadata(
      { id, userId },
      "processing" as TaskStatus,
      {
        status: TaskStatus.COMPLETED,
        generatedAt: new Date().toISOString(),
        error: undefined,
      },
    );
    if (!ok) {
      this.logger.warn(`[${id}] Race — already transitioned`);
    }
  });

  if (err) {
    this.logger.error(`[${id}] Background failed`, err);
    await this.repo.updateMetadata(
      { id, userId },
      "processing" as TaskStatus,
      {
        status: TaskStatus.FAILED,
        error: err instanceof Error ? err.message : "Unknown error",
      },
    );
  }
}
```

## [T-218] Stale State Recovery

Service `OnModuleInit`:

```typescript
@Injectable()
export class MyService implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    const count = await this.repo.resetStaleProcessing();
    if (count > 0) {
      this.logger.warn(`Recovered ${count} stale records`);
    }
  }
}
```

Repository:

```typescript
async resetStaleProcessing(): Promise<number> {
  const result = await this.repo
    .createQueryBuilder()
    .update()
    .set({
      metadata: () =>
        `'{"status": "failed", "error": "Interrupted by server restart"}'::jsonb`,
    })
    .where(`"metadata"->>'status' = :processing`, {
      processing: "processing",
    })
    .execute();
  return result.affected ?? 0;
}
```

For inline fields, replace `"metadata"` with the actual column name (e.g., `"summary_metadata"`).

## [T-219] Guard: Skip Duplicate Processing

```typescript
if (entity.metadata?.status === "processing") {
  this.logger.warn(`Already processing, skipping`);
  return;
}
```

## [T-220] GraphQL Schema

Entity type exposes `AsyncTaskMeta`:

```graphql
type ApplicationType {
  summary: String
  summaryMetadata: AsyncTaskMeta
}

type FitAnalysisType {
  metadata: AsyncTaskMeta!
  # ... domain fields ...
}
```

## [T-221] Frontend Polling

Two display patterns:

**A. Inline field** — display task status directly:

```
Processing → spinner + "Generating..."
Failed     → red text + metadata.error
Completed  → content + "Generated at [metadata.generatedAt]"
```

**B. Detail page** — poll while processing:

```typescript
const metadata = data?.fit?.metadata;
const isProcessing = metadata?.status === TaskStatus.Processing;

usePoll({ startPolling, stopPolling }, isProcessing, 3000);
```

Base polling hook (`apps/web/src/hooks/usePoll.ts`):

```typescript
export function usePoll(
  controls: PollControls | undefined,
  shouldPoll: boolean,
  intervalMs: number,
) {
  useEffect(() => {
    if (shouldPoll && controls?.startPolling && controls?.stopPolling) {
      controls.startPolling(intervalMs);
      return () => controls.stopPolling!();
    }
    controls?.stopPolling?.();
  }, [shouldPoll, controls, intervalMs]);
}
```

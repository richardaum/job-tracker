# How to Add a New JobStage

When you need to add a new state for `JobStage`, follow these steps:

## 1. Update the TypeScript Enum

**File:** `apps/api/src/domains/jobs/job-stage.enum.ts`

Add the new value to the enum. Order matters (pipeline flow):

```typescript
export enum ApplicationStageEnum {
  NEW = "new",
  APPLIED = "applied",
  RECRUITER_SCREEN = "recruiter_screen",
  TECHNICAL = "technical",
  CULTURAL_FIT = "cultural_fit", // <-- new
  OFFER = "offer",
  REJECTED = "rejected",
  DUPLICATED = "duplicated",
}
```

## 2. Update the TypeORM Entity

**File:** `apps/api/src/database/entities/job-stage-event.entity.ts`

Update **both** the `enum:` arrays and the union types for `fromStage` and `toStage`:

```typescript
enum: [
  "new",
  "applied",
  "recruiter_screen",
  "technical",
  "cultural_fit",  // <-- new
  "offer",
  "rejected",
  "duplicated",
],
```

And the union types:

```typescript
fromStage!:
  | "new"
  | "applied"
  | "recruiter_screen"
  | "technical"
  | "cultural_fit"  // <-- new
  | "offer"
  | "rejected"
  | "duplicated"
  | null;
```

## 3. Create PostgreSQL Migration

**Directory:** `apps/api/src/database/migrations/`

### 3.1 Create the migration file

Create a migration following the pattern `1763300001000-add-job-stage-cultural-fit.ts`:

```typescript
import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddJobStageCulturalFit1763300001000 implements MigrationInterface {
  name = "AddJobStageCulturalFit1763300001000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TYPE "public"."application_stage" ADD VALUE IF NOT EXISTS 'cultural_fit';
`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
```

### 3.2 Register the migration in index.ts (CRITICAL!)

**File:** `apps/api/src/database/migrations/index.ts`

Add the migration in **two places**:

1. Import statement at the top
2. `migrations` array export (in chronological order)

```typescript
// 1. Import
import { AddJobStageCulturalFit1763300001000 } from "./1763300001000-add-job-stage-cultural-fit";

// 2. Add to array (keep chronological order by timestamp)
export const migrations = [
  // ...
  AddJobStageDuplicated1763300000000,
  AddJobStageCulturalFit1763300001000, // <-- new
  AddApplicationSourceRemoteyeah1763400000000,
  // ...
];
```

**Note:** If you skip this step, the migration will never run. See `apps/api/src/database/migrations/MIGRATIONS.md` for more details.

## 4. Update UI Components (Frontend)

There are **3 identical `stageOptions` arrays** and **2 color switches** that need updating.

### 4.1 Add to `stageOptions` arrays (3 files)

Add the new stage between `Technical` and `Offer`:

```typescript
const stageOptions: Array<{ value: JobStage; label: string }> = [
  { value: JobStage.New, label: "New" },
  { value: JobStage.Duplicated, label: "Duplicated" },
  { value: JobStage.Applied, label: "Applied" },
  { value: JobStage.RecruiterScreen, label: "Recruiter Screen" },
  { value: JobStage.Technical, label: "Technical" },
  { value: JobStage.CulturalFit, label: "Cultural Fit" }, // <-- new
  { value: JobStage.Offer, label: "Offer" },
  { value: JobStage.Rejected, label: "Rejected" },
];
```

**Files to update:**

- `apps/web/src/modules/jobs/details/components/HistoryPanel.tsx`
- `apps/web/src/modules/jobs/list/components/JobTrackingPanel.tsx`
- `apps/web/src/modules/jobs/details/components/UpdateStatusAction.tsx`

### 4.2 Add badge intent color

**File:** `apps/web/src/modules/jobs/shared/components/StatusBadge.tsx`

Add a case for the new stage in `getStageBadgeIntent()`:

```typescript
function getStageBadgeIntent(stage: JobStage) {
  switch (stage) {
    case JobStage.Offer:
      return "success" as const;
    case JobStage.Rejected:
      return "error" as const;
    case JobStage.Technical:
      return "info" as const;
    case JobStage.CulturalFit: // <-- new
      return "info" as const;
    case JobStage.RecruiterScreen:
      return "warning" as const;
    case JobStage.Duplicated:
      return "warning" as const;
    default:
      return "default" as const;
  }
}
```

### 4.3 Add timeline dot color (2 files)

Add a case for the new stage in `getStageTimelineDotColor()`:

```typescript
function getStageTimelineDotColor(stage: JobStage) {
  switch (stage) {
    case JobStage.Offer:
      return "text-text-success";
    case JobStage.Rejected:
      return "text-text-error";
    case JobStage.RecruiterScreen:
      return "text-text-warning";
    case JobStage.Technical:
      return "text-text-brand";
    case JobStage.CulturalFit: // <-- new
      return "text-text-brand";
    case JobStage.Duplicated:
      return "text-text-warning";
    default:
      return "text-text-secondary";
  }
}
```

**Files to update:**

- `apps/web/src/modules/jobs/shared/components/StageTimeline.tsx`
- `apps/web/src/modules/jobs/details/utils/job-details.shared.ts`

## 5. Run Codegen

### Generate schema.gql (API)

```bash
pnpm --filter @job-tracker/api run build
```

### Generate frontend hooks

```bash
pnpm --filter @job-tracker/web run codegen
```

## Quick Summary

| Step | File/Directory                                                       | Action                                  |
| ---- | -------------------------------------------------------------------- | --------------------------------------- |
| 1    | `job-stage.enum.ts`                                                  | Add enum value                          |
| 2    | `job-stage-event.entity.ts`                                          | Update arrays and union types           |
| 3.1  | `migrations/*.ts`                                                    | Create ALTER TYPE migration             |
| 3.2  | `migrations/index.ts`                                                | **Register migration (critical!)**      |
| 4.1  | `HistoryPanel.tsx`, `JobTrackingPanel.tsx`, `UpdateStatusAction.tsx` | Add to `stageOptions` arrays (x3)       |
| 4.2  | `StatusBadge.tsx`                                                    | Add badge intent color switch case      |
| 4.3  | `StageTimeline.tsx`, `job-details.shared.ts`                         | Add timeline dot color switch case (x2) |
| 5    | Codegen                                                              | Run api build + web codegen             |

## Notes

- PostgreSQL doesn't allow easily dropping enum values, so `down()` is no-op
- `schema.gql` is auto-generated by NestJS GraphQL when you build/run the API
- Frontend hooks (`apps/web/src/gql/hooks.ts`) are generated via `pnpm --filter @job-tracker/web run codegen`
- **Always** register migrations in `index.ts` — unregistered migrations never execute
- The `stageOptions` arrays and `getStageTimelineDotColor` functions are duplicated; update all copies

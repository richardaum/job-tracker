# How to Add a New ApplicationStage

When you need to add a new state for `ApplicationStage`, follow these steps:

## 1. Update the TypeScript Enum

**File:** `apps/api/src/domains/applications/application-stage.enum.ts`

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

**File:** `apps/api/src/database/entities/application-stage-event.entity.ts`

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

Create a migration following the pattern `1763300001000-add-application-stage-cultural-fit.ts`:

```typescript
import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddApplicationStageCulturalFit1763300001000 implements MigrationInterface {
  name = "AddApplicationStageCulturalFit1763300001000";

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
import { AddApplicationStageCulturalFit1763300001000 } from "./1763300001000-add-application-stage-cultural-fit";

// 2. Add to array (keep chronological order by timestamp)
export const migrations = [
  // ...
  AddApplicationStageDuplicated1763300000000,
  AddApplicationStageCulturalFit1763300001000, // <-- new
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
const stageOptions: Array<{ value: ApplicationStage; label: string }> = [
  { value: ApplicationStage.New, label: "New" },
  { value: ApplicationStage.Duplicated, label: "Duplicated" },
  { value: ApplicationStage.Applied, label: "Applied" },
  { value: ApplicationStage.RecruiterScreen, label: "Recruiter Screen" },
  { value: ApplicationStage.Technical, label: "Technical" },
  { value: ApplicationStage.CulturalFit, label: "Cultural Fit" }, // <-- new
  { value: ApplicationStage.Offer, label: "Offer" },
  { value: ApplicationStage.Rejected, label: "Rejected" },
];
```

**Files to update:**

- `apps/web/src/modules/applications/details/components/HistoryPanel.tsx`
- `apps/web/src/modules/applications/list/components/ApplicationTrackingPanel.tsx`
- `apps/web/src/modules/applications/details/components/UpdateStatusAction.tsx`

### 4.2 Add badge intent color

**File:** `apps/web/src/modules/applications/shared/components/StatusBadge.tsx`

Add a case for the new stage in `getStageBadgeIntent()`:

```typescript
function getStageBadgeIntent(stage: ApplicationStage) {
  switch (stage) {
    case ApplicationStage.Offer:
      return "success" as const;
    case ApplicationStage.Rejected:
      return "error" as const;
    case ApplicationStage.Technical:
      return "info" as const;
    case ApplicationStage.CulturalFit: // <-- new
      return "info" as const;
    case ApplicationStage.RecruiterScreen:
      return "warning" as const;
    case ApplicationStage.Duplicated:
      return "warning" as const;
    default:
      return "default" as const;
  }
}
```

### 4.3 Add timeline dot color (2 files)

Add a case for the new stage in `getStageTimelineDotColor()`:

```typescript
function getStageTimelineDotColor(stage: ApplicationStage) {
  switch (stage) {
    case ApplicationStage.Offer:
      return "text-text-success";
    case ApplicationStage.Rejected:
      return "text-text-error";
    case ApplicationStage.RecruiterScreen:
      return "text-text-warning";
    case ApplicationStage.Technical:
      return "text-text-brand";
    case ApplicationStage.CulturalFit: // <-- new
      return "text-text-brand";
    case ApplicationStage.Duplicated:
      return "text-text-warning";
    default:
      return "text-text-secondary";
  }
}
```

**Files to update:**

- `apps/web/src/modules/applications/shared/components/StageTimeline.tsx`
- `apps/web/src/modules/applications/details/utils/application-details.shared.ts`

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

| Step | File/Directory                                                               | Action                                  |
| ---- | ---------------------------------------------------------------------------- | --------------------------------------- |
| 1    | `application-stage.enum.ts`                                                  | Add enum value                          |
| 2    | `application-stage-event.entity.ts`                                          | Update arrays and union types           |
| 3.1  | `migrations/*.ts`                                                            | Create ALTER TYPE migration             |
| 3.2  | `migrations/index.ts`                                                        | **Register migration (critical!)**      |
| 4.1  | `HistoryPanel.tsx`, `ApplicationTrackingPanel.tsx`, `UpdateStatusAction.tsx` | Add to `stageOptions` arrays (x3)       |
| 4.2  | `StatusBadge.tsx`                                                            | Add badge intent color switch case      |
| 4.3  | `StageTimeline.tsx`, `application-details.shared.ts`                         | Add timeline dot color switch case (x2) |
| 5    | Codegen                                                                      | Run api build + web codegen             |

## Notes

- PostgreSQL doesn't allow easily dropping enum values, so `down()` is no-op
- `schema.gql` is auto-generated by NestJS GraphQL when you build/run the API
- Frontend hooks (`apps/web/src/gql/hooks.ts`) are generated via `pnpm --filter @job-tracker/web run codegen`
- **Always** register migrations in `index.ts` — unregistered migrations never execute
- The `stageOptions` arrays and `getStageTimelineDotColor` functions are duplicated; update all copies

# Migrations

## Important: Always update `index.ts`

This project uses a **manual migration index**. Every new migration file **must** be added to `index.ts` in two places:

1. **Import statement** at the top
2. **`migrations` array** export

### Example

When you create `1763300001000-add-application-stage-cultural-fit.ts`:

**Step 1 — Add import:**

```typescript
import { AddApplicationStageCulturalFit1763300001000 } from "./1763300001000-add-application-stage-cultural-fit";
```

**Step 2 — Add to `migrations` array (in chronological order):**

```typescript
export const migrations = [
  // ...
  AddApplicationStageDuplicated1763300000000,
  AddApplicationStageCulturalFit1763300001000, // <-- new
  AddApplicationSourceRemoteyeah1763400000000,
  // ...
];
```

### Order matters

Migrations are executed in the order they appear in the `migrations` array. Always insert new migrations in **chronological order** based on their timestamp prefix.

### Conventions

- File name pattern: `{timestamp}-{kebab-case-description}.ts`
- Class name pattern: `{PascalCaseDescription}{Timestamp}`
- Class `name` property must match the class name exactly

### Running migrations

```bash
pnpm --filter @job-tracker/api run db:migrate
```

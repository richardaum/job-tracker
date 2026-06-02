# Database

In dev, PostgreSQL runs inside Docker on port 3101. Connection settings are in `.env` (`DATABASE_URL`). Tools like DBeaver connect via `localhost:3101`.

## Entity conventions

- File: `apps/api/src/database/entities/{name}.entity.ts`
- Decorator: `@Entity({ name: "snake_case_plural" })`
- Primary key: `@PrimaryColumn({ type: "text" }) id!: string` (UUID)
- Column name: `@Column({ name: "snake_case", ... })` — explicit `name` for non-trivial field names
- Timestamps: `@CreateDateColumn()` / `@UpdateDateColumn()` (auto-set, no `name` needed)

```ts
@Entity({ name: "users" })
export class UserEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "avatar_url", type: "text", nullable: true })
  avatarUrl!: string | null;

  @Column({ type: "enum", enum: RoleEnum, enumName: "role", default: RoleEnum.User })
  role!: RoleEnum;

  @Column({ type: "boolean", default: true })
  active!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
```

| Pattern | Convention |
|---|---|
| Booleans | `@Column({ type: "boolean", default: true })` |
| Enums | `@Column({ type: "enum", enum: XEnum, enumName: "snake_case" })` |
| Arrays | `@Column({ type: "text", array: true, default: () => "ARRAY[]::text[]" })` |
| Nullable | `{ nullable: true }` — TS type `T \| null` |
| Relations | `@ManyToOne(() => Entity) @JoinColumn({ name: "fk_snake_case" })` |
| Embedded | `@Column(() => EmbeddedClass, { prefix: "prefix" })` |

## Embedded columns

Reusable column groups at `apps/api/src/database/embeddeds/`:

```ts
export class SalaryEmbedded {
  @Column({ name: "salary_min", type: "integer", nullable: true })
  min!: number | null;

  @Column({ name: "salary_max", type: "integer", nullable: true })
  max!: number | null;

  @Column({ name: "salary_currency", type: "text", nullable: true })
  currency!: string | null;
}
```

Usage: `@Column(() => SalaryEmbedded, { prefix: "salary" })`

## Async task JSONB metadata

Fields named `{action}Metadata` (e.g. `summaryMetadata`, `conversionMetadata`, `generationMetadata`) are JSONB columns carrying `AsyncMetadata` (`{ status, error?, generatedAt? }`).

| Rule | Detail |
|---|---|
| `null` semantics | `metadata IS NULL` = task never requested. Sibling data column must also be `NULL`. |
| `NOT NULL` pairing | If data column is populated, metadata must NOT be `NULL` (status = `COMPLETED`, `generatedAt` set). |
| Backfill coverage | Migrations for legacy data must handle both: (a) metadata exists with `generatedAt IS NULL`, and (b) data populated but metadata still `NULL`. |
| Atomic updates | Background workers use `QueryBuilder` with JSONB `\|\|` operator and optimistic concurrency (`WHERE metadata->>'status' = expectedStatus`). |
| Stale recovery | Services implement `OnModuleInit` to reset lingering `PROCESSING` records to `FAILED` on startup. |

Canonical spec: `specs/034-technical-async-task-pattern/PATTERN.md`.

## Migrations

When changes affect data models (entities, columns, types, indices, enums), create a TypeORM migration — never raw SQL or `synchronize`.

### File conventions

- Location: `apps/api/src/database/migrations/`
- Naming: `{timestamp}-{kebab-case-description}.ts`
- Class: `{PascalCaseDescription}{Timestamp}` — must match `name` property

### Registration

Every migration must be registered in `apps/api/src/database/migrations/index.ts`:

1. **Import** at top: `import { XxxDesc1767000000000 } from "./1767000000000-xxx-desc";`
2. **Add** to `migrations` array in chronological order by timestamp

### Run

```bash
pnpm --filter @job-tracker/api run db:migrate
```

## Canonical references

- `apps/api/src/database/migrations/MIGRATIONS.md` — detailed migration guide
- `apps/api/src/database/migrations/index.ts` — registration
- `apps/api/src/database/entities/user.entity.ts` — simple entity
- `apps/api/src/database/entities/job.entity.ts` — complex entity with embedded/relations
- `apps/api/src/database/embeddeds/salary.embedded.ts` — embedded example

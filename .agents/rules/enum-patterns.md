# Enum Patterns

## Convention

- **TypeScript**: `PascalCase` + `Enum` suffix (`FooEnum`)
- **GraphQL**: `registerEnumType(FooEnum, { name: "Foo" })` — strip the `Enum` suffix
- **Values**: PascalCase strings, matching the member key (`Draft = "Draft"`)

## End-to-end flow

When a `text` column or `String` GraphQL field needs to become an enum:

### 1. Backend — define the enum

```ts
import { registerEnumType } from "@nestjs/graphql";

export enum FooEnum {
  Bar = "Bar",
  Baz = "Baz",
}

registerEnumType(FooEnum, { name: "Foo" });
```

### 2. DB — handle existing data

- **PG column**: migration with `CREATE TYPE` + `ALTER COLUMN ... USING CASE`, or `ALTER TYPE ... RENAME VALUE` for existing values (see template below)
- **JSONB field**: datafix script (NestJS DI, `--dry-run`, no raw SQL) **before** changing TS types

### 3. Backend — wire the enum

- Entity column: `@Column({ type: "enum", enum: FooEnum, enumName: "foo" })`
- GraphQL type/input: `@Field(() => FooEnum)`
- Service, scoring, specs: replace string literals with `FooEnum.*`

### 4. Schema → codegen

```bash
pm2 restart api          # regenerates schema.gql
pnpm --filter @job-tracker/web run codegen
```

### 5. Frontend — replace strings

```ts
// Before
if (field === "bar") { ... }
// After
if (field === FooEnum.Bar) { ... }
```

Import from `@/gql/hooks`.

## Migration template (PG column)

```ts
await queryRunner.query(`CREATE TYPE "foo" AS ENUM ('Bar', 'Baz')`);
await queryRunner.query(
  `ALTER TABLE "t" ALTER COLUMN "c" SET DATA TYPE "foo" USING CASE "c"
    WHEN 'bar' THEN 'Bar'::"foo"
    ELSE INITCAP("c")::"foo"
  END`
);
```

To rename an existing enum value in PostgreSQL 10+: `ALTER TYPE "foo" RENAME VALUE 'old' TO 'new'`.

Register in `apps/api/src/database/migrations/index.ts`.

## Datafix template (JSONB column)

Create `apps/api/scripts/fix-<field>-casing.ts`. Follow `fix-normalize-enum-casing.ts` pattern. Support `--dry-run`. Use repositories, never raw SQL.

## Checklist

- [ ] Query DB for all distinct values — never assume only documented values exist
- [ ] Enum values are PascalCase (matching the member key)
- [ ] `registerEnumType` with correct GraphQL name (no `Enum` suffix)
- [ ] PG: migration | JSONB: datafix (`--dry-run` first)
- [ ] Update entity, type, service, scoring, specs
- [ ] `pm2 restart api` → `schema.gql` contains new enum
- [ ] `pnpm --filter @job-tracker/web run codegen`
- [ ] Replace string literals in web with codegen enum
- [ ] `typecheck` + `lint` + `test`

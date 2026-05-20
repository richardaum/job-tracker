# Enum Patterns

## Convention

- **TypeScript**: `PascalCase` + `Enum` suffix (`FooEnum`)
- **GraphQL**: `registerEnumType(FooEnum, { name: "Foo" })` — strip the `Enum` suffix
- **Values**: UPPERCASE strings (`MANUAL = "MANUAL"`), matching PostgreSQL enum labels

## End-to-end flow

When a `text` column or `String` GraphQL field needs to become an enum:

### 1. Backend — define the enum

```ts
import { registerEnumType } from "@nestjs/graphql";

export enum FooEnum {
  BAR = "BAR",
  BAZ = "BAZ",
}

registerEnumType(FooEnum, { name: "Foo" });
```

### 2. DB — handle existing data

- **PG column**: migration with `CREATE TYPE` + `ALTER COLUMN ... USING CASE` (see template below)
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
if (field === Foo.Bar) { ... }
```

Import from `@/gql/hooks`.

## Migration template (PG column)

```ts
await queryRunner.query(`CREATE TYPE "foo" AS ENUM ('BAR', 'BAZ')`);
await queryRunner.query(
  `ALTER TABLE "t" ALTER COLUMN "c" SET DATA TYPE "foo" USING CASE "c"
    WHEN 'bar' THEN 'BAR'::"foo"
    ELSE UPPER("c")::"foo"
  END`
);
```

Register in `apps/api/src/database/migrations/index.ts`.

## Datafix template (JSONB column)

Create `apps/api/scripts/fix-<field>-casing.ts`. Follow `fix-normalize-enum-casing.ts` pattern. Support `--dry-run`. Use repositories, never raw SQL.

## Checklist

- [ ] Query DB for all distinct values — never assume only documented values exist
- [ ] Enum values are UPPERCASE
- [ ] `registerEnumType` with correct GraphQL name (no `Enum` suffix)
- [ ] PG: migration | JSONB: datafix (`--dry-run` first)
- [ ] Update entity, type, service, scoring, specs
- [ ] `pm2 restart api` → `schema.gql` contains new enum
- [ ] `pnpm --filter @job-tracker/web run codegen`
- [ ] Replace string literals in web with codegen enum
- [ ] `typecheck` + `lint` + `test`

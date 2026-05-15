# Standalone Scripts

Scripts under `apps/api/src/scripts/` that need DB + external API calls (e.g. backfill).

**Use `ts-node` + NestJS DI** — `ts-node` handles NestJS decorator metadata correctly (unlike `tsx`, which cannot resolve it reliably, especially with circular module deps like `NotesModule` ↔ `ApplicationModule`).

## Pattern

Define a local module in the script importing only what's needed, then boot via `NestFactory.createApplicationContext`:

```ts
import "reflect-metadata";
import "dotenv/config";

import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { SomeEntity } from "@api/database/entities/some.entity";
import { SomeService } from "@api/domains/some/some.service";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...buildDataSourceOptions(process.env.DATABASE_URL!),
    }),
    TypeOrmModule.forFeature([SomeEntity]),
  ],
  providers: [SomeService],
})
class ScriptModule {}

async function main() {
  const app = await NestFactory.createApplicationContext(ScriptModule, {
    logger: ["error", "warn"], // keep output clean
  });

  const em = app.get(EntityManager);
  const service = app.get(SomeService);

  // raw SQL via em.query(...)
  // or typed repos via em.getRepository(SomeEntity)
  // or full NestJS service methods

  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

## Run

```sh
ts-node -r tsconfig-paths/register --project tsconfig.json src/scripts/<script>.ts
```

Add to `apps/api/package.json` scripts for convenience, e.g.:

```json
"backfill:summaries": "ts-node -r tsconfig-paths/register --project tsconfig.json src/scripts/backfill-summaries.ts"
```

`tsconfig-paths/register` is needed so `ts-node` resolves `@api/` path aliases. Both packages are already in `devDependencies`.

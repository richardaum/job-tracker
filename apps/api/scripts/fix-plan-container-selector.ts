import "reflect-metadata";
import "dotenv/config";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { PlanEntity } from "@api/database/entities/plan.entity";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";

const DRY_RUN = process.argv.includes("--dry-run");

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...buildDataSourceOptions(process.env.DATABASE_URL!) }),
    TypeOrmModule.forFeature([PlanEntity]),
  ],
})
class ScriptModule {}

function walkDocument(obj: unknown, path: string, changes: string[]): void {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      walkDocument(obj[i], `${path}[${i}]`, changes);
    }
  } else if (obj != null && typeof obj === "object") {
    const record = obj as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      if (key === "containerSector") {
        record.containerSelector = record.containerSector;
        delete record.containerSector;
        changes.push(`${path}.containerSector → containerSelector`);
      } else {
        walkDocument(record[key], `${path}.${key}`, changes);
      }
    }
  }
}

async function main(): Promise<void> {
  const ctx = await NestFactory.createApplicationContext(ScriptModule, { logger: false });
  const em = ctx.get(EntityManager);

  const prefix = DRY_RUN ? "[DRY-RUN] " : "";

  const plans = await em.find(PlanEntity);
  let totalOk = 0;

  for (const plan of plans) {
    const changes: string[] = [];
    walkDocument(plan.document, "document", changes);
    if (changes.length === 0) continue;

    console.log(`${prefix}Plan ${plan.id} ("${plan.displayName}"):`);
    for (const c of changes) {
      console.log(`  ${prefix}  ${c}`);
    }

    totalOk++;
    if (!DRY_RUN) {
      await em.save(PlanEntity, plan);
    }
  }

  console.log(`\n${prefix}Done. ${totalOk} plan(s) updated.`);
  await ctx.close();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

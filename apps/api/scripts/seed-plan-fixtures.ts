import "reflect-metadata";
import "dotenv/config";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { PlanEntity } from "@api/database/entities/plan.entity";
import remoteyeahFixture from "@api/domains/sources/fixtures/remoteyeah.plan.json";
import telegramFixture from "@api/domains/sources/fixtures/telegram-jsgurujobs.plan.json";
import { PlanRepository } from "@api/domains/sources/plan.repository";
import type { ExecutorPlanDocument } from "@api/domains/sources/plan.types";
import { tryRun } from "@job-tracker/try-run";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";

const PLANS_TO_SEED: Array<{
  displayName: string;
  document: ExecutorPlanDocument;
}> = [
  {
    displayName: "RemoteYeah",
    document: remoteyeahFixture as ExecutorPlanDocument,
  },
  {
    displayName: "Telegram JSGuruJobs",
    document: telegramFixture as ExecutorPlanDocument,
  },
];

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...buildDataSourceOptions(process.env.DATABASE_URL!),
    }),
    TypeOrmModule.forFeature([PlanEntity]),
  ],
  providers: [PlanRepository],
})
class SeedPlansModule {}

async function main() {
  const ctx = await NestFactory.createApplicationContext(SeedPlansModule);
  const repo = ctx.get(PlanRepository);
  const dryRun = process.argv.includes("--dry-run");

  for (const plan of PLANS_TO_SEED) {
    if (dryRun) {
      console.log(`[DRY-RUN] Would create plan: "${plan.displayName}"`);
      continue;
    }

    const [error, created] = await tryRun(repo.create(plan));
    if (error) {
      console.error(`[ERROR] "${plan.displayName}":`, error);
    } else {
      console.log(`[CREATED] "${plan.displayName}" (id=${created.id})`);
    }
  }

  await ctx.close();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

import "reflect-metadata";
import "dotenv/config";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { PlanEntity } from "@api/database/entities/plan.entity";
import { UserEntity } from "@api/database/entities/user.entity";
import remoteyeahFixture from "@api/domains/sources/fixtures/remoteyeah.plan.json";
import telegramFixture from "@api/domains/sources/fixtures/telegram-jsgurujobs.plan.json";
import { PlanRepository } from "@api/domains/sources/plan.repository";
import type { ExecutorPlanDocument } from "@api/domains/sources/plan.types";
import { tryRun } from "@job-tracker/try-run";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

const PLANS_TO_SEED: Array<{ displayName: string; document: ExecutorPlanDocument }> = [
  { displayName: "RemoteYeah", document: remoteyeahFixture as ExecutorPlanDocument },
  { displayName: "Telegram JSGuruJobs", document: telegramFixture as ExecutorPlanDocument },
];

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...buildDataSourceOptions(process.env.DATABASE_URL!) }),
    TypeOrmModule.forFeature([PlanEntity, UserEntity]),
  ],
  providers: [PlanRepository],
})
class SeedPlansModule {}

async function main() {
  const ctx = await NestFactory.createApplicationContext(SeedPlansModule);
  const dataSource = ctx.get(DataSource);
  const repo = ctx.get(PlanRepository);
  const userRepo = dataSource.getRepository(UserEntity);
  const dryRun = process.argv.includes("--dry-run");
  const userEmail = process.env.DEV_AUTH_BYPASS_EMAIL;

  if (!userEmail) {
    console.error("DEV_AUTH_BYPASS_EMAIL is required in .env");
    process.exit(1);
  }

  const user = await userRepo.findOneBy({ email: userEmail });
  if (!user) {
    console.error(`User not found for email: ${userEmail}`);
    process.exit(1);
  }

  console.log(`Seeding plans for user: ${user.email} (${user.id})`);

  const planRepo = dataSource.getRepository(PlanEntity);

  for (const plan of PLANS_TO_SEED) {
    const existing = await planRepo.findOneBy({ displayName: plan.displayName, userId: user.id });

    if (existing) {
      if (dryRun) {
        console.log(`[DRY-RUN] Would update plan: "${plan.displayName}" (id=${existing.id})`);
        continue;
      }

      const [error] = await tryRun(repo.update(existing.id, user.id, { document: plan.document }));
      if (error) {
        console.error(`[ERROR] updating "${plan.displayName}":`, error);
      } else {
        console.log(`[UPDATED] "${plan.displayName}" (id=${existing.id})`);
      }
    } else {
      if (dryRun) {
        console.log(`[DRY-RUN] Would create plan: "${plan.displayName}"`);
        continue;
      }

      const [error, created] = await tryRun(repo.create({ ...plan, userId: user.id }));
      if (error) {
        console.error(`[ERROR] creating "${plan.displayName}":`, error);
      } else {
        console.log(`[CREATED] "${plan.displayName}" (id=${created.id})`);
      }
    }
  }

  await ctx.close();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

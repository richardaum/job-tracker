import "reflect-metadata";
import "dotenv/config";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";
import { DraftApplicationEntity } from "@api/database/entities/draft-application.entity";
import { FitAnalysisEntity } from "@api/database/entities/fit-analysis.entity";
import { ResumeEntity } from "@api/database/entities/resume.entity";
import { UserEntity } from "@api/database/entities/user.entity";
import { WorkPreferencesEntity } from "@api/database/entities/work-preferences.entity";
import { ApplicationEventBus } from "@api/domains/applications/application-event.bus";
import { ApplicationQuickFilterEnum } from "@api/domains/applications/application-quick-filter.enum";
import { ApplicationRepository } from "@api/domains/applications/applications.repository";
import { DraftApplicationsRepository } from "@api/domains/draft-applications/draft-applications.repository";
import { FitAnalysisRepository } from "@api/domains/fit-analysis/fit-analysis.repository";
import { FitAnalysisService } from "@api/domains/fit-analysis/fit-analysis.service";
import { FitAnalysisAiService } from "@api/domains/fit-analysis/fit-analysis-ai.service";
import { FitAnalysisEventBus } from "@api/domains/fit-analysis/fit-analysis-event.bus";
import { FitAnalysisEventListener } from "@api/domains/fit-analysis/fit-analysis-event.listener";
import { ResumeRepository } from "@api/domains/resumes/resumes.repository";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { LibAiModule } from "@api/lib/ai";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";

function parseArgs(): {
  active: boolean;
  email: string;
  resumeId?: string;
  dryRun: boolean;
} {
  const args = process.argv.slice(2);
  const parsed = {
    active: false,
    email: "",
    resumeId: undefined as string | undefined,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--active") {
      parsed.active = true;
    } else if (arg === "-e" || arg === "--email") {
      parsed.email = args[++i]!;
    } else if (arg === "-r" || arg === "--resume-id") {
      parsed.resumeId = args[++i]!;
    } else if (arg === "--dry-run") {
      parsed.dryRun = true;
    }
  }

  if (!parsed.email) {
    console.error(
      "Usage: tsx scripts/fix-fit-analysis.ts [--dry-run] [--active] -e <email> [-r <resume-id>]",
    );
    process.exit(1);
  }

  return parsed;
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...buildDataSourceOptions(process.env.DATABASE_URL!),
    }),
    TypeOrmModule.forFeature([
      ApplicationEntity,
      ApplicationStageEventEntity,
      DraftApplicationEntity,
      FitAnalysisEntity,
      ResumeEntity,
      UserEntity,
      WorkPreferencesEntity,
    ]),
    LibAiModule,
  ],
  providers: [
    ApplicationEventBus,
    ApplicationRepository,
    DraftApplicationsRepository,
    FitAnalysisEventBus,
    FitAnalysisRepository,
    FitAnalysisAiService,
    FitAnalysisService,
    FitAnalysisEventListener,
    ResumeRepository,
  ],
})
class ScriptModule {}

async function main() {
  const {
    active: activeOnly,
    email,
    resumeId: explicitResumeId,
    dryRun,
  } = parseArgs();

  process.stdout.write("Booting NestJS...\n");
  const app = await NestFactory.createApplicationContext(ScriptModule, {
    logger: ["error", "warn"],
  });

  const em = app.get(EntityManager);
  const fitRepo = app.get(FitAnalysisRepository);
  const resumeRepo = app.get(ResumeRepository);
  const applicationRepo = app.get(ApplicationRepository);
  const fitService = app.get(FitAnalysisService);

  const user = await em.getRepository(UserEntity).findOne({ where: { email } });
  if (!user) {
    console.error(`User not found: ${email}`);
    await app.close();
    process.exit(1);
  }
  const userId = user.id;
  console.log(`User: ${user.name} (${user.id})`);

  let resumeId = explicitResumeId;
  if (!resumeId) {
    const defaultResume = await resumeRepo.findDefaultByUserId(userId);
    if (defaultResume) {
      resumeId = defaultResume.id;
      console.log(
        `Using default resume: "${defaultResume.title}" (${resumeId})`,
      );
    } else {
      const resumes = await resumeRepo.findAllByUserId(userId);
      if (resumes.length === 0) {
        console.error(
          "No resumes found. Create one via the web UI or pass --resume-id.",
        );
        await app.close();
        process.exit(1);
      }
      resumeId = resumes[0]!.id;
      console.log(
        `No default resume. Using most recent: "${resumes[0]!.title}" (${resumeId})`,
      );
    }
  } else {
    const resume = await em
      .getRepository(ResumeEntity)
      .findOne({ where: { id: resumeId } });
    if (!resume || resume.userId !== userId) {
      console.error(`Resume not found: ${resumeId}`);
      await app.close();
      process.exit(1);
    }
    console.log(`Using resume: "${resume.title}" (${resumeId})`);
  }

  const allApps = activeOnly
    ? await applicationRepo.findAllByUserId(
        userId,
        ApplicationQuickFilterEnum.ACTIVE,
      )
    : await applicationRepo.findAllByUserId(userId);

  const appsToProcess = allApps.filter(
    (a) => a.description?.trim() && a.description.length > 0,
  );

  if (appsToProcess.length === 0) {
    console.log("No applications with job descriptions found.");
    await app.close();
    return;
  }

  console.log(
    `\nFound ${allApps.length} applications, ${appsToProcess.length} with descriptions.\n`,
  );

  const skipResults = await Promise.all(
    appsToProcess.map(async (app) => {
      const existing = await fitRepo.findByApplicationId(app.id);
      const skip =
        existing?.generationMetadata?.status ===
        AsyncMetadataStatusEnum.COMPLETED;
      if (skip) console.log(`  SKIP  ${app.title} — fit already completed`);
      return { app, skip };
    }),
  );

  const toGenerate = skipResults
    .filter((r) => !r.skip)
    .map((r) => ({
      id: r.app.id,
      title: r.app.title,
      companyName: r.app.company?.name ?? "(unknown)",
    }));

  if (toGenerate.length === 0) {
    console.log("\nAll applications already have completed fit analysis.");
    await app.close();
    return;
  }

  if (dryRun) {
    console.log(
      `\n[DRY-RUN] Would trigger fit analysis for ${toGenerate.length} applications:\n`,
    );
    for (const app of toGenerate) {
      console.log(`  ${app.title} @ ${app.companyName}`);
    }
    console.log("\n[DRY-RUN] No analyses were generated.");
    await app.close();
    return;
  }

  console.log(
    `\nTriggering fit analysis for ${toGenerate.length} applications...\n`,
  );

  const triggered = new Set<string>();
  const concurrency = 5;
  const chunks: (typeof toGenerate)[] = [];
  for (let i = 0; i < toGenerate.length; i += concurrency) {
    chunks.push(toGenerate.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    const results = await Promise.allSettled(
      chunk.map(async (app) => {
        await fitService.generate(app.id, resumeId, userId);
        return app;
      }),
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        triggered.add(result.value.id);
        console.log(
          `  QUEUE ${result.value.title} @ ${result.value.companyName}`,
        );
      } else {
        console.error(`  FAIL  ${result.reason.message}`);
      }
    }
  }

  if (triggered.size === 0) {
    console.log("\nNo analyses were triggered.");
    await app.close();
    return;
  }

  console.log(`\nWaiting for ${triggered.size} analyses to complete...\n`);

  const completed = new Set<string>();
  const failed = new Set<string>();

  while (completed.size + failed.size < triggered.size) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    process.stdout.write(".");

    for (const id of triggered) {
      if (completed.has(id) || failed.has(id)) continue;

      const entity = await fitRepo.findByApplicationId(id);
      if (!entity) continue;

      if (
        entity.generationMetadata?.status === AsyncMetadataStatusEnum.COMPLETED
      ) {
        completed.add(id);
      } else if (
        entity.generationMetadata?.status === AsyncMetadataStatusEnum.FAILED
      ) {
        failed.add(id);
      }
    }
  }

  console.log("\n\n=== Summary ===\n");

  for (const app of toGenerate) {
    const entity = await fitRepo.findByApplicationId(app.id);
    if (!entity) {
      console.log(`  ${app.title} @ ${app.companyName}: UNKNOWN`);
      continue;
    }
    const meta = entity.generationMetadata;
    if (meta?.status === AsyncMetadataStatusEnum.COMPLETED) {
      const scorePct =
        entity.scoreRatio != null ? `${Math.round(entity.scoreRatio)}%` : "N/A";
      console.log(
        `  OK    ${app.title} @ ${app.companyName} — ${scorePct} (${entity.classification ?? "N/A"})`,
      );
    } else if (meta?.status === AsyncMetadataStatusEnum.FAILED) {
      console.log(
        `  FAIL  ${app.title} @ ${app.companyName} — ${meta.error ?? "Unknown error"}`,
      );
    } else {
      console.log(
        `  ?     ${app.title} @ ${app.companyName}: status=${meta?.status ?? "null"}`,
      );
    }
  }

  const successCount = completed.size;
  const failedCount = failed.size;
  console.log(
    `\nDone. ${successCount} succeeded, ${failedCount} failed out of ${triggered.size}.`,
  );
  await app.close();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

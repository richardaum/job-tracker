import "reflect-metadata";

import { resolve } from "node:path";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";
import { DraftApplicationEntity } from "@api/database/entities/draft-application.entity";
import {
  FitAnalysisEntity,
  FitAnalysisStatus,
} from "@api/database/entities/fit-analysis.entity";
import { ResumeEntity } from "@api/database/entities/resume.entity";
import { UserEntity } from "@api/database/entities/user.entity";
import { UserPreferencesEntity } from "@api/database/entities/user-preferences.entity";
import { ApplicationQuickFilterEnum } from "@api/domains/applications/application-quick-filter.enum";
import { ApplicationRepository } from "@api/domains/applications/applications.repository";
import { DraftApplicationsRepository } from "@api/domains/draft-applications/draft-applications.repository";
import { FitAnalysisRepository } from "@api/domains/fit-analysis/fit-analysis.repository";
import { FitAnalysisService } from "@api/domains/fit-analysis/fit-analysis.service";
import { FitAnalysisAiService } from "@api/domains/fit-analysis/fit-analysis-ai.service";
import { FitAnalysisEventBus } from "@api/domains/fit-analysis/fit-analysis-event.bus";
import { TemplateService } from "@api/domains/shared/template/template.service";
import { OpenAIClient, PromptRendererService } from "@api/lib/ai";
import { tryRun } from "@job-tracker/try-run";
import { config } from "dotenv";
import type { FindOptionsOrder, FindOptionsWhere } from "typeorm";
import { DataSource } from "typeorm";

config({ path: resolve(process.cwd(), ".env") });

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed: { active: boolean; email: string; resumeId?: string } = {
    active: false,
    email: "",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--active") {
      parsed.active = true;
    } else if (arg === "-e" || arg === "--email") {
      parsed.email = args[++i]!;
    } else if (arg === "-r" || arg === "--resume-id") {
      parsed.resumeId = args[++i]!;
    }
  }

  if (!parsed.email) {
    console.error(
      "Usage: tsx scripts/run-fit-analysis.ts --active -e <email> [-r <resume-id>]",
    );
    process.exit(1);
  }

  return parsed;
}

async function main() {
  const { active: activeOnly, email, resumeId: explicitResumeId } = parseArgs();

  console.log("Connecting to database...");
  const dataSource = new DataSource({
    ...buildDataSourceOptions(process.env.DATABASE_URL!),
  });

  await dataSource.initialize();
  console.log("Connected.");

  const userRepo = dataSource.getRepository(UserEntity);
  const resumeEntityRepo = dataSource.getRepository(ResumeEntity);
  const applicationOrmRepo = dataSource.getRepository(ApplicationEntity);
  const stageEventRepo = dataSource.getRepository(ApplicationStageEventEntity);
  const preferencesRepo = dataSource.getRepository(UserPreferencesEntity);
  const fitEntityRepo = dataSource.getRepository(FitAnalysisEntity);

  const user = await userRepo.findOne({ where: { email } });
  if (!user) {
    console.error(`User not found: ${email}`);
    await dataSource.destroy();
    process.exit(1);
  }
  const userId = user.id;
  console.log(`User: ${user.name} (${user.id})`);

  let resumeId = explicitResumeId;
  if (!resumeId) {
    const resumeQuery: FindOptionsWhere<ResumeEntity> = {
      userId,
      isDefault: true,
    };
    const defaultResume = await resumeEntityRepo.findOne({
      where: resumeQuery,
    });
    if (defaultResume) {
      resumeId = defaultResume.id;
      console.log(
        `Using default resume: "${defaultResume.title}" (${resumeId})`,
      );
    } else {
      const fallbackQuery: FindOptionsWhere<ResumeEntity> = { userId };
      const fallbackOrder: FindOptionsOrder<ResumeEntity> = {
        updatedAt: "DESC",
      };
      const mostRecent = await resumeEntityRepo.findOne({
        where: fallbackQuery,
        order: fallbackOrder,
      });
      if (!mostRecent) {
        console.error(
          "No resumes found. Create one via the web UI or pass --resume-id.",
        );
        await dataSource.destroy();
        process.exit(1);
      }
      resumeId = mostRecent.id;
      console.log(
        `No default resume. Using most recent: "${mostRecent.title}" (${resumeId})`,
      );
    }
  } else {
    const resume = await resumeEntityRepo.findOne({ where: { id: resumeId } });
    if (!resume || resume.userId !== userId) {
      console.error(`Resume not found: ${resumeId}`);
      await dataSource.destroy();
      process.exit(1);
    }
    console.log(`Using resume: "${resume.title}" (${resumeId})`);
  }

  const applicationRepo = new ApplicationRepository(
    applicationOrmRepo,
    stageEventRepo,
  );

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
    await dataSource.destroy();
    return;
  }

  console.log(
    `\nFound ${allApps.length} applications, ${appsToProcess.length} with descriptions.\n`,
  );

  const fitRepo = new FitAnalysisRepository(fitEntityRepo);
  const draftRepo = new DraftApplicationsRepository(
    dataSource.getRepository(DraftApplicationEntity),
    applicationOrmRepo,
  );

  const templateService = new TemplateService();
  const promptRendererService = new PromptRendererService(templateService);
  const openAIClient = new OpenAIClient();
  const fitAiService = new FitAnalysisAiService(
    openAIClient,
    promptRendererService,
  );

  const fitService = new FitAnalysisService(
    fitRepo,
    fitAiService,
    applicationRepo,
    draftRepo,
    {} as FitAnalysisEventBus,
    resumeEntityRepo,
    preferencesRepo,
  );

  // Parallel skip check
  const skipResults = await Promise.all(
    appsToProcess.map(async (app) => {
      const existing = await fitRepo.findByApplicationId(app.id);
      const skip = existing?.status === FitAnalysisStatus.COMPLETED;
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
    await dataSource.destroy();
    return;
  }

  console.log(
    `\nTriggering fit analysis for ${toGenerate.length} applications...\n`,
  );

  // Parallel generate with concurrency limit
  const triggered = new Set<string>();
  const concurrency = 5;
  const chunks: (typeof toGenerate)[] = [];
  for (let i = 0; i < toGenerate.length; i += concurrency) {
    chunks.push(toGenerate.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    const results = await Promise.allSettled(
      chunk.map(async (app) => {
        const [err] = await tryRun(
          fitService.generate(app.id, resumeId, userId),
        );
        if (err) throw err;
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
    await dataSource.destroy();
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

      if (entity.status === FitAnalysisStatus.COMPLETED) {
        completed.add(id);
      } else if (entity.status === FitAnalysisStatus.FAILED) {
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
    if (entity.status === FitAnalysisStatus.COMPLETED) {
      const scorePct =
        entity.scoreRatio != null ? `${Math.round(entity.scoreRatio)}%` : "N/A";
      console.log(
        `  OK    ${app.title} @ ${app.companyName} — ${scorePct} (${entity.classification ?? "N/A"})`,
      );
    } else if (entity.status === FitAnalysisStatus.FAILED) {
      const errorMsg = entity.error ?? "Unknown error";
      console.log(`  FAIL  ${app.title} @ ${app.companyName} — ${errorMsg}`);
    } else {
      console.log(
        `  ?     ${app.title} @ ${app.companyName}: status=${entity.status}`,
      );
    }
  }

  const successCount = completed.size;
  const failedCount = failed.size;
  console.log(
    `\nDone. ${successCount} succeeded, ${failedCount} failed out of ${triggered.size}.`,
  );
  await dataSource.destroy();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

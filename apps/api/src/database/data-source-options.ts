import type { DataSourceOptions } from "typeorm";

import { AiConversationEntity } from "./entities/ai-conversation.entity";
import { AiMessageEntity } from "./entities/ai-message.entity";
import { AiUsageRecordEntity } from "./entities/ai-usage-record.entity";
import { CompanyEntity } from "./entities/company.entity";
import { ExchangeRateEntity } from "./entities/exchange-rate.entity";
import { ExtensionActivityEventEntity } from "./entities/extension-activity-event.entity";
import { JobEntity } from "./entities/job.entity";
import { JobNoteEntity } from "./entities/job-note.entity";
import { JobStageEventEntity } from "./entities/job-stage-event.entity";
import { MatchAnalysisEntity } from "./entities/match-analysis.entity";
import { PlanEntity } from "./entities/plan.entity";
import { ResumeEntity } from "./entities/resume.entity";
import { SourceRunEntity } from "./entities/source-run.entity";
import { SourceTemplateEntity } from "./entities/source-template.entity";
import { UserEntity } from "./entities/user.entity";
import { UserSettingEntity } from "./entities/user-setting.entity";
import { UserTourProgressEntity } from "./entities/user-tour-progress.entity";
import { WorkPreferencesEntity } from "./entities/work-preferences.entity";
import { migrations } from "./migrations";
import { SnakeCaseNamingStrategy } from "./naming-strategy";
import { UuidGenerateSubscriber } from "./subscribers/uuid-generate.subscriber";

export const apiEntities = [
  AiConversationEntity,
  AiMessageEntity,
  AiUsageRecordEntity,
  UserEntity,
  JobEntity,
  JobStageEventEntity,
  JobNoteEntity,
  CompanyEntity,
  PlanEntity,
  SourceRunEntity,
  SourceTemplateEntity,
  ExtensionActivityEventEntity,
  ResumeEntity,
  ExchangeRateEntity,
  MatchAnalysisEntity,
  WorkPreferencesEntity,
  UserSettingEntity,
  UserTourProgressEntity,
];

export const apiSubscribers = [UuidGenerateSubscriber];

export const apiMigrations = migrations;

export function buildDataSourceOptions(
  databaseUrl: string,
  opts?: { ssl?: boolean },
): DataSourceOptions & { autoLoadEntities?: boolean } {
  return {
    type: "postgres",
    url: databaseUrl,
    entities: apiEntities,
    subscribers: apiSubscribers,
    migrations: apiMigrations,
    namingStrategy: new SnakeCaseNamingStrategy(),
    migrationsTableName: "typeorm_migrations",
    synchronize: false,
    migrationsRun: false,
    /**
     * Default TypeORM `"all"` rejects any migration that sets `MigrationInterface.transaction`
     * (`ForbiddenTransactionModeOverrideError`). `IntegrateDraftIntoJobs1767800000000` must use
     * `transaction: false` because PostgreSQL does not allow using a new enum label in the same
     * transaction as `ALTER TYPE ... ADD VALUE`. `"each"` runs other migrations wrapped per file
     * and honours per-migration overrides.
     */
    migrationsTransactionMode: "each",
    logging: false,
    ...(opts?.ssl ? { ssl: { rejectUnauthorized: false } } : {}),
  };
}

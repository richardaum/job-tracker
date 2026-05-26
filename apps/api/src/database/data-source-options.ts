import type { DataSourceOptions } from "typeorm";

import { CompanyEntity } from "./entities/company.entity";
import { ExchangeRateEntity } from "./entities/exchange-rate.entity";
import { ExtensionActivityEventEntity } from "./entities/extension-activity-event.entity";
import { JobEntity } from "./entities/job.entity";
import { JobNoteEntity } from "./entities/job-note.entity";
import { JobStageEventEntity } from "./entities/job-stage-event.entity";
import { MatchAnalysisEntity } from "./entities/match-analysis.entity";
import { ResumeEntity } from "./entities/resume.entity";
import { SourceRunEntity } from "./entities/source-run.entity";
import { SourceTemplateEntity } from "./entities/source-template.entity";
import { UserEntity } from "./entities/user.entity";
import { UserAccountEntity } from "./entities/user-account.entity";
import { UserSettingEntity } from "./entities/user-setting.entity";
import { WorkPreferencesEntity } from "./entities/work-preferences.entity";
import { migrations } from "./migrations";
import { SnakeCaseNamingStrategy } from "./naming-strategy";
import { UuidGenerateSubscriber } from "./subscribers/uuid-generate.subscriber";

export const apiEntities = [
  UserEntity,
  UserAccountEntity,
  JobEntity,
  JobStageEventEntity,
  JobNoteEntity,
  CompanyEntity,
  SourceRunEntity,
  SourceTemplateEntity,
  ExtensionActivityEventEntity,
  ResumeEntity,
  ExchangeRateEntity,
  MatchAnalysisEntity,
  WorkPreferencesEntity,
  UserSettingEntity,
];

export const apiSubscribers = [UuidGenerateSubscriber];

export const apiMigrations = migrations;

export function buildDataSourceOptions(
  databaseUrl: string,
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
  };
}

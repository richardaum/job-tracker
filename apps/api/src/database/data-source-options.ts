import type { DataSourceOptions } from "typeorm";

import { CompanyEntity } from "./entities/company.entity";
import { ExchangeRateEntity } from "./entities/exchange-rate.entity";
import { JobEntity } from "./entities/job.entity";
import { JobNoteEntity } from "./entities/job-note.entity";
import { JobStageEventEntity } from "./entities/job-stage-event.entity";
import { MatchAnalysisEntity } from "./entities/match-analysis.entity";
import { ResumeEntity } from "./entities/resume.entity";
import { SourceRunEntity } from "./entities/source-run.entity";
import { SourceTemplateEntity } from "./entities/source-template.entity";
import { UserEntity } from "./entities/user.entity";
import { WorkPreferencesEntity } from "./entities/work-preferences.entity";
import { migrations } from "./migrations";
import { SnakeCaseNamingStrategy } from "./naming-strategy";
import { UuidGenerateSubscriber } from "./subscribers/uuid-generate.subscriber";

export const apiEntities = [
  UserEntity,
  JobEntity,
  JobStageEventEntity,
  JobNoteEntity,
  CompanyEntity,
  SourceRunEntity,
  SourceTemplateEntity,
  ResumeEntity,
  ExchangeRateEntity,
  MatchAnalysisEntity,
  WorkPreferencesEntity,
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
    logging: false,
  };
}

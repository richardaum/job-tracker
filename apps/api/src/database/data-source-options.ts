import type { DataSourceOptions } from "typeorm";

import { ApplicationEntity } from "./entities/application.entity";
import { ApplicationNoteEntity } from "./entities/application-note.entity";
import { ApplicationStageEventEntity } from "./entities/application-stage-event.entity";
import { CompanyEntity } from "./entities/company.entity";
import { DraftApplicationEntity } from "./entities/draft-application.entity";
import { ExchangeRateEntity } from "./entities/exchange-rate.entity";
import { FitAnalysisEntity } from "./entities/fit-analysis.entity";
import { ResumeEntity } from "./entities/resume.entity";
import { SourceRunEntity } from "./entities/source-run.entity";
import { SourceTemplateEntity } from "./entities/source-template.entity";
import { UserEntity } from "./entities/user.entity";
import { UserPreferencesEntity } from "./entities/user-preferences.entity";
import { migrations } from "./migrations";

export const apiEntities = [
  UserEntity,
  ApplicationEntity,
  ApplicationStageEventEntity,
  ApplicationNoteEntity,
  CompanyEntity,
  SourceRunEntity,
  SourceTemplateEntity,
  ResumeEntity,
  DraftApplicationEntity,
  ExchangeRateEntity,
  FitAnalysisEntity,
  UserPreferencesEntity,
];

export const apiMigrations = migrations;

export function buildDataSourceOptions(
  databaseUrl: string,
): DataSourceOptions & { autoLoadEntities?: boolean } {
  return {
    type: "postgres",
    url: databaseUrl,
    entities: apiEntities,
    migrations: apiMigrations,
    migrationsTableName: "typeorm_migrations",
    synchronize: false,
    migrationsRun: false,
    logging: false,
  };
}

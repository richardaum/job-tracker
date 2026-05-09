import type { DataSourceOptions } from "typeorm";

import { ApplicationEntity } from "./entities/application.entity";
import { ApplicationNoteEntity } from "./entities/application-note.entity";
import { ApplicationStageEventEntity } from "./entities/application-stage-event.entity";
import { CompanyEntity } from "./entities/company.entity";
import { DraftApplicationEntity } from "./entities/draft-application.entity";
import { ExchangeRateCacheEntity } from "./entities/exchange-rate-cache.entity";
import { ImportRunEntity } from "./entities/import-run.entity";
import { ImportTemplateEntity } from "./entities/import-template.entity";
import { UserEntity } from "./entities/user.entity";
import { migrations } from "./migrations";

export const apiEntities = [
  UserEntity,
  ApplicationEntity,
  ApplicationStageEventEntity,
  ApplicationNoteEntity,
  CompanyEntity,
  ImportRunEntity,
  ImportTemplateEntity,
  DraftApplicationEntity,
  ExchangeRateCacheEntity,
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

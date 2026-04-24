import type { DataSourceOptions } from "typeorm";

import { migrations } from "./migrations";
import { ApplicationEntity } from "./entities/application.entity";
import { ApplicationNoteEntity } from "./entities/application-note.entity";
import { ApplicationStageEventEntity } from "./entities/application-stage-event.entity";
import { UserEntity } from "./entities/user.entity";
import { CompanyEntity } from "./entities/company.entity";

export const apiEntities = [
  UserEntity,
  ApplicationEntity,
  ApplicationStageEventEntity,
  ApplicationNoteEntity,
  CompanyEntity,
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

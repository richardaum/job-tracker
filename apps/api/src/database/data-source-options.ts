import type { DataSourceOptions } from "typeorm";

import { Baseline1746009600000 } from "./migrations/1746009600000-baseline";
import { AddApplicationSalaryColumns1747000000000 } from "./migrations/1747000000000-add-application-salary-columns";
import { ApplicationEntity } from "./entities/application.entity";
import { ApplicationNoteEntity } from "./entities/application-note.entity";
import { ApplicationStageEventEntity } from "./entities/application-stage-event.entity";
import { UserEntity } from "./entities/user.entity";

export const apiEntities = [
  UserEntity,
  ApplicationEntity,
  ApplicationStageEventEntity,
  ApplicationNoteEntity,
];

export const apiMigrations = [
  Baseline1746009600000,
  AddApplicationSalaryColumns1747000000000,
];

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

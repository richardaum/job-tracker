import { serverEnv } from "@api/env/server";

import { buildDataSourceOptions } from "./data-source-options";

/**
 * Apply pending SQL migrations when the Nest `DataSource` initializes so a plain
 * `nest start` (without a prior `pnpm run db:migrate`) cannot drift from entities
 * (for example missing `applications.salary_min_cents`).
 *
 * CLI scripts (`run-migrations`, `mark-migrations-applied`) keep `migrationsRun: false`
 * in `buildDataSourceOptions` and control execution explicitly.
 */
export const databaseModuleOptions = {
  ...buildDataSourceOptions(serverEnv.DATABASE_URL),
  migrationsRun: true,
};

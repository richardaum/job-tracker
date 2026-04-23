import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ObservabilityModule } from "@api/observability/observability.module";

import { DatabasePoolHookService } from "./database-pool-hook.service";
import { databaseModuleOptions } from "./database-module-options";

@Module({
  imports: [
    ObservabilityModule,
    TypeOrmModule.forRoot({ ...databaseModuleOptions }),
  ],
  providers: [DatabasePoolHookService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

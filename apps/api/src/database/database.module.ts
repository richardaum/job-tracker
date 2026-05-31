import { ObservabilityModule } from "@api/observability/observability.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { databaseModuleOptions } from "./database-module-options";
import { DatabasePoolHookService } from "./database-pool-hook.service";

@Module({
  imports: [ObservabilityModule, TypeOrmModule.forRoot({ ...databaseModuleOptions })],
  providers: [DatabasePoolHookService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

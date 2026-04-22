import { Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { ObservabilityModule } from "@api/observability/observability.module";

@Module({
  imports: [ObservabilityModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}

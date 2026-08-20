import { AiUsageRecordEntity } from "@api/database/entities/ai-usage-record.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { SettingsModule } from "@api/domains/settings/settings.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AiUsageRepository } from "./ai-usage.repository";
import { AiUsageResolver } from "./ai-usage.resolver";
import { AiUsageService } from "./ai-usage.service";

@Module({
  imports: [TypeOrmModule.forFeature([AiUsageRecordEntity]), AuthModule, SettingsModule],
  providers: [AiUsageRepository, AiUsageService, AiUsageResolver],
  exports: [AiUsageService],
})
export class AiUsageModule {}

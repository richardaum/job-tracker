import { DatabaseModule } from "@api/database/database.module";
import { ApplicationEntity } from "@api/database/entities/application.entity";
import { DraftApplicationEntity } from "@api/database/entities/draft-application.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { LibAiModule } from "@api/lib/ai";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DraftExtractionService } from "./ai/draft-extraction.service";
import { DraftExtractionNormalizationService } from "./ai/draft-extraction-normalization.service";
import { DraftApplicationsRepository } from "./draft-applications.repository";
import { DraftApplicationsResolver } from "./draft-applications.resolver";
import { DraftApplicationsService } from "./draft-applications.service";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([DraftApplicationEntity, ApplicationEntity]),
    AuthModule,
    LibAiModule,
  ],
  providers: [
    DraftApplicationsRepository,
    DraftApplicationsService,
    DraftApplicationsResolver,
    DraftExtractionNormalizationService,
    DraftExtractionService,
  ],
  exports: [
    DraftApplicationsService,
    DraftApplicationsRepository,
    DraftExtractionNormalizationService,
    DraftExtractionService,
  ],
})
export class DraftApplicationsModule {}

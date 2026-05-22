import { DatabaseModule } from "@api/database/database.module";
import { JobEntity } from "@api/database/entities/job.entity";
import { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { CompaniesModule } from "@api/domains/companies/companies.module";
import { LibAiModule } from "@api/lib/ai";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DraftExtractionService } from "./ai/draft-extraction.service";
import { DraftExtractionNormalizationService } from "./ai/draft-extraction-normalization.service";
import { DraftJobEventBus } from "./draft-job-event.bus";
import { DraftJobsRepository } from "./draft-jobs.repository";
import { DraftJobsService } from "./draft-jobs.service";

/**
 * Services used by JobsModule and SSE without registering draft GraphQL resolvers.
 * Full `DraftJobsModule` adds `DraftJobsResolver` + SSE controller on top of this core.
 */
@Module({
  imports: [
    DatabaseModule,
    CompaniesModule,
    TypeOrmModule.forFeature([JobEntity, JobStageEventEntity]),
    AuthModule,
    LibAiModule,
  ],
  providers: [
    DraftJobEventBus,
    DraftJobsRepository,
    DraftJobsService,
    DraftExtractionNormalizationService,
    DraftExtractionService,
  ],
  exports: [
    DraftJobEventBus,
    DraftJobsService,
    DraftJobsRepository,
    DraftExtractionNormalizationService,
    DraftExtractionService,
  ],
})
export class DraftJobsCoreModule {}

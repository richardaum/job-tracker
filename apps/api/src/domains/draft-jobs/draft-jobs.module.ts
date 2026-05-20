import { DatabaseModule } from "@api/database/database.module";
import { DraftJobEntity } from "@api/database/entities/draft-job.entity";
import { JobEntity } from "@api/database/entities/job.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { LibAiModule } from "@api/lib/ai";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DraftExtractionService } from "./ai/draft-extraction.service";
import { DraftExtractionNormalizationService } from "./ai/draft-extraction-normalization.service";
import { DraftJobEventBus } from "./draft-job-event.bus";
import { DraftJobsRepository } from "./draft-jobs.repository";
import { DraftJobsResolver } from "./draft-jobs.resolver";
import { DraftJobsService } from "./draft-jobs.service";
import { DraftJobsSseController } from "./draft-jobs-sse.controller";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([DraftJobEntity, JobEntity]),
    AuthModule,
    LibAiModule,
  ],
  controllers: [DraftJobsSseController],
  providers: [
    DraftJobEventBus,
    DraftJobsRepository,
    DraftJobsService,
    DraftJobsResolver,
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
export class DraftJobsModule {}

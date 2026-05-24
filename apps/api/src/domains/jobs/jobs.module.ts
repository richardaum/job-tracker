import { DatabaseModule } from "@api/database/database.module";
import { CompanyEntity } from "@api/database/entities/company.entity";
import { JobEntity } from "@api/database/entities/job.entity";
import { JobNoteEntity } from "@api/database/entities/job-note.entity";
import { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";
import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { CompaniesModule } from "@api/domains/companies/companies.module";
import { SettingsModule } from "@api/domains/settings/settings.module";
import { LibAiModule } from "@api/lib/ai";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DraftExtractionService } from "./ai/draft-extraction.service";
import { DraftExtractionNormalizationService } from "./ai/draft-extraction-normalization.service";
import { FillJobEventListener } from "./fill-job-event.listener";
import { JobAsyncMetadataRepository } from "./job-async-metadata.repository";
import { JobEventBus } from "./job-event.bus";
import { JobFillPersistence } from "./job-fill.persistence";
import { JobStageEventsRepository } from "./job-stage-events.repository";
import { JobsRepository } from "./jobs.repository";
import { JobsResolver } from "./jobs.resolver";
import { JobsService } from "./jobs.service";
import { JobsListQuery } from "./jobs-list.query";
import { JobsSseController } from "./jobs-sse.controller";
import { SalaryModule } from "./salary/salary.module";
import { SummaryService } from "./summary/summary.service";
import { SummaryAiService } from "./summary/summary-ai.service";
import { SummaryEventListener } from "./summary/summary-event.listener";
import { TagsModule } from "./tags/tags.module";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([
      JobEntity,
      JobNoteEntity,
      JobStageEventEntity,
      CompanyEntity,
      SourceRunEntity,
    ]),
    AuthModule,
    CompaniesModule,
    SettingsModule,
    LibAiModule,
    SalaryModule,
    TagsModule,
  ],
  controllers: [JobsSseController],
  providers: [
    JobEventBus,
    JobsRepository,
    JobStageEventsRepository,
    JobAsyncMetadataRepository,
    JobsListQuery,
    JobFillPersistence,
    DraftExtractionNormalizationService,
    DraftExtractionService,
    JobsService,
    JobsResolver,
    FillJobEventListener,
    SummaryEventListener,
    SummaryService,
    SummaryAiService,
  ],
  exports: [
    JobsService,
    JobsRepository,
    JobEventBus,
    DraftExtractionNormalizationService,
    DraftExtractionService,
  ],
})
export class JobsModule {}

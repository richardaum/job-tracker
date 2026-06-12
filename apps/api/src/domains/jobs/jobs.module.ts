import { DatabaseModule } from "@api/database/database.module";
import { CompanyEntity } from "@api/database/entities/company.entity";
import { JobEntity } from "@api/database/entities/job.entity";
import { JobNoteEntity } from "@api/database/entities/job-note.entity";
import { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";
import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { CompaniesModule } from "@api/domains/companies/companies.module";
import { NotesModule } from "@api/domains/notes/notes.module";
import { SettingsModule } from "@api/domains/settings/settings.module";
import { LibAiModule } from "@api/lib/ai";
import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DraftExtractionService } from "./ai/draft-extraction.service";
import { DraftExtractionNormalizationService } from "./ai/draft-extraction-normalization.service";
import { FillJobEventListener } from "./fill-job-event.listener";
import { JobAutomaticFillService } from "./job-automatic-fill.service";
import { JobDuplicateService } from "./job-duplicate.service";
import { JobEventBus } from "./job-event.bus";
import { JobStageEventsRepository } from "./job-stage-events.repository";
import { JobsRepository } from "./jobs.repository";
import { JobsResolver } from "./jobs.resolver";
import { JobsService } from "./jobs.service";
import { JobsEventsResolver } from "./jobs-events.resolver";
import { JobsListQuery } from "./jobs-list.query";
import { KeywordBlockerService } from "./keyword-blocker.service";
import { SalaryModule } from "./salary/salary.module";
import { JobSummaryService } from "./summary/job-summary.service";
import { SummaryAiService } from "./summary/summary-ai.service";
import { SummaryEventListener } from "./summary/summary-event.listener";
import { TagsModule } from "./tags/tags.module";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([JobEntity, JobNoteEntity, JobStageEventEntity, CompanyEntity, SourceRunEntity]),
    AuthModule,
    CompaniesModule,
    SettingsModule,
    LibAiModule,
    SalaryModule,
    TagsModule,
    forwardRef(() => NotesModule),
  ],
  controllers: [],
  providers: [
    JobEventBus,
    JobsRepository,
    JobStageEventsRepository,
    JobsListQuery,
    JobDuplicateService,
    DraftExtractionNormalizationService,
    DraftExtractionService,
    JobsService,
    JobAutomaticFillService,
    JobsResolver,
    JobsEventsResolver,
    FillJobEventListener,
    SummaryEventListener,
    JobSummaryService,
    SummaryAiService,
    KeywordBlockerService,
  ],
  exports: [
    JobsService,
    JobsRepository,
    JobStageEventsRepository,
    JobEventBus,
    DraftExtractionNormalizationService,
    DraftExtractionService,
  ],
})
export class JobsModule {}

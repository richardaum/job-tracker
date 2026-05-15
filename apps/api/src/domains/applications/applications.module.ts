import { DatabaseModule } from "@api/database/database.module";
import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationNoteEntity } from "@api/database/entities/application-note.entity";
import { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";
import { CompanyEntity } from "@api/database/entities/company.entity";
import { FitAnalysisEntity } from "@api/database/entities/fit-analysis.entity";
import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { CompaniesModule } from "@api/domains/companies/companies.module";
import { DraftApplicationsModule } from "@api/domains/draft-applications/draft-applications.module";
import { LibAiModule } from "@api/lib/ai";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ApplicationEventBus } from "./application-event.bus";
import { ApplicationRepository } from "./applications.repository";
import { ApplicationResolver } from "./applications.resolver";
import { ApplicationService } from "./applications.service";
import { ApplicationsSseController } from "./applications-sse.controller";
import { DraftConversionEventListener } from "./draft-conversion-event.listener";
import { SalaryModule } from "./salary/salary.module";
import { SummaryService } from "./summary/summary.service";
import { SummaryAiService } from "./summary/summary-ai.service";
import { SummaryEventListener } from "./summary/summary-event.listener";
import { TagsModule } from "./tags/tags.module";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([
      ApplicationEntity,
      ApplicationNoteEntity,
      ApplicationStageEventEntity,
      CompanyEntity,
      FitAnalysisEntity,
      SourceRunEntity,
    ]),
    AuthModule,
    CompaniesModule,
    DraftApplicationsModule,
    LibAiModule,
    SalaryModule,
    TagsModule,
  ],
  controllers: [ApplicationsSseController],
  providers: [
    ApplicationEventBus,
    ApplicationRepository,
    ApplicationService,
    ApplicationResolver,
    DraftConversionEventListener,
    SummaryEventListener,
    SummaryService,
    SummaryAiService,
  ],
  exports: [ApplicationService, ApplicationRepository, ApplicationEventBus],
})
export class ApplicationModule {}

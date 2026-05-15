import { DatabaseModule } from "@api/database/database.module";
import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationNoteEntity } from "@api/database/entities/application-note.entity";
import { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";
import { CompanyEntity } from "@api/database/entities/company.entity";
import { FitAnalysisEntity } from "@api/database/entities/fit-analysis.entity";
import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { ApplicationAiModule } from "@api/domains/application-ai/application-ai.module";
import { AuthModule } from "@api/domains/auth/auth.module";
import { CompaniesModule } from "@api/domains/companies/companies.module";
import { CompanyAiModule } from "@api/domains/company-ai/company-ai.module";
import { DraftApplicationsModule } from "@api/domains/draft-applications/draft-applications.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ApplicationEventBus } from "./application-event.bus";
import { ApplicationRepository } from "./applications.repository";
import { ApplicationResolver } from "./applications.resolver";
import { ApplicationService } from "./applications.service";
import { ApplicationsSseController } from "./applications-sse.controller";
import { SalaryService } from "./salary.service";
import { SummaryService } from "./summary.service";
import { SummaryEventListener } from "./summary-event.listener";
import { TagService } from "./tag.service";

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
    ApplicationAiModule,
    CompanyAiModule,
    DraftApplicationsModule,
  ],
  controllers: [ApplicationsSseController],
  providers: [
    ApplicationEventBus,
    ApplicationRepository,
    ApplicationService,
    ApplicationResolver,
    SalaryService,
    SummaryEventListener,
    SummaryService,
    TagService,
  ],
  exports: [ApplicationService, ApplicationRepository, ApplicationEventBus],
})
export class ApplicationModule {}

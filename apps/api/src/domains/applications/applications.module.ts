import { DatabaseModule } from "@api/database/database.module";
import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";
import { CompanyEntity } from "@api/database/entities/company.entity";
import { ApplicationAiModule } from "@api/domains/application-ai/application-ai.module";
import { AuthModule } from "@api/domains/auth/auth.module";
import { CompaniesModule } from "@api/domains/companies/companies.module";
import { CompanyAiModule } from "@api/domains/company-ai/company-ai.module";
import { DraftApplicationsModule } from "@api/domains/draft-applications/draft-applications.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ApplicationRepository } from "./applications.repository";
import { ApplicationResolver } from "./applications.resolver";
import { ApplicationService } from "./applications.service";
import { SalaryService } from "./salary.service";
import { TagService } from "./tag.service";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([
      ApplicationEntity,
      ApplicationStageEventEntity,
      CompanyEntity,
    ]),
    AuthModule,
    CompaniesModule,
    ApplicationAiModule,
    CompanyAiModule,
    DraftApplicationsModule,
  ],
  providers: [
    ApplicationRepository,
    ApplicationService,
    ApplicationResolver,
    SalaryService,
    TagService,
  ],
  exports: [ApplicationService],
})
export class ApplicationModule {}

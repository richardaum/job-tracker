import { ApplicationEntity } from "@api/database/entities/application.entity";
import { CompanyEntity } from "@api/database/entities/company.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { LibAiModule } from "@api/lib/ai";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CompanyDescriptionService } from "./ai/company-description.service";
import { CompanyRepository } from "./companies.repository";
import { CompaniesResolver } from "./companies.resolver";
import { CompanyService } from "./companies.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyEntity, ApplicationEntity]),
    AuthModule,
    LibAiModule,
  ],
  providers: [
    CompanyRepository,
    CompanyService,
    CompaniesResolver,
    CompanyDescriptionService,
  ],
  exports: [CompanyService, CompanyDescriptionService],
})
export class CompaniesModule {}

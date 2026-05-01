import { ApplicationEntity } from "@api/database/entities/application.entity";
import { CompanyEntity } from "@api/database/entities/company.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CompanyRepository } from "./companies.repository";
import { CompaniesResolver } from "./companies.resolver";
import { CompanyService } from "./companies.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyEntity, ApplicationEntity]),
    AuthModule,
  ],
  providers: [CompanyRepository, CompanyService, CompaniesResolver],
  exports: [CompanyService],
})
export class CompaniesModule {}

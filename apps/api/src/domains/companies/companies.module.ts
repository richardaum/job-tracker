import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CompanyEntity } from "@api/database/entities/company.entity";
import { ApplicationEntity } from "@api/database/entities/application.entity";
import { CompanyRepository } from "./companies.repository";
import { CompanyService } from "./companies.service";
import { CompaniesResolver } from "./companies.resolver";
import { AuthModule } from "@api/domains/auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyEntity, ApplicationEntity]),
    AuthModule,
  ],
  providers: [CompanyRepository, CompanyService, CompaniesResolver],
  exports: [CompanyService],
})
export class CompaniesModule {}

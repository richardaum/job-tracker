import { ResumeEntity } from "@api/database/entities/resume.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ResumeRepository } from "./resumes.repository";
import { ResumeResolver } from "./resumes.resolver";
import { ResumeService } from "./resumes.service";

@Module({
  imports: [TypeOrmModule.forFeature([ResumeEntity]), AuthModule],
  providers: [ResumeRepository, ResumeService, ResumeResolver],
  exports: [ResumeRepository, ResumeService],
})
export class ResumesModule {}

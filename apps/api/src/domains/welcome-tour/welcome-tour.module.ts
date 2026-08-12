import { UserTourProgressEntity } from "@api/database/entities/user-tour-progress.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TourProgressRepository } from "./tour-progress.repository";
import { TourProgressResolver } from "./tour-progress.resolver";
import { TourProgressService } from "./tour-progress.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserTourProgressEntity]), AuthModule],
  providers: [TourProgressRepository, TourProgressService, TourProgressResolver],
})
export class WelcomeTourModule {}

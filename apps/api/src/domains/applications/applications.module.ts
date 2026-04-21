import { Module } from "@nestjs/common";
import { DatabaseModule } from "@api/database/database.module";
import { ApplicationRepository } from "./applications.repository";
import { ApplicationService } from "./applications.service";
import { ApplicationResolver } from "./applications.resolver";

@Module({
  imports: [DatabaseModule],
  providers: [ApplicationRepository, ApplicationService, ApplicationResolver],
})
export class ApplicationModule {}

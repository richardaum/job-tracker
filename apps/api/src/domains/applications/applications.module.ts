import { Module } from "@nestjs/common";
import { DatabaseModule } from "@api/database/database.module";
import { AuthModule } from "@api/domains/auth/auth.module";
import { ApplicationRepository } from "./applications.repository";
import { ApplicationService } from "./applications.service";
import { ApplicationResolver } from "./applications.resolver";

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [ApplicationRepository, ApplicationService, ApplicationResolver],
})
export class ApplicationModule {}

import { Module } from "@nestjs/common";
import { DatabaseModule } from "@api/database/database.module";
import { AuthModule } from "@api/domains/auth/auth.module";
import { UsersModule } from "@api/domains/users/users.module";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { ApplicationRepository } from "./applications.repository";
import { ApplicationService } from "./applications.service";
import { ApplicationResolver } from "./applications.resolver";

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  providers: [
    ApplicationRepository,
    ApplicationService,
    ApplicationResolver,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class ApplicationModule {}

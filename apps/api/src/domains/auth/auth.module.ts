import { GoogleAuthGuard } from "@api/domains/auth/google-auth.guard";
import { UsersModule } from "@api/domains/users/users.module";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { AuthController } from "./auth.controller";
import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";
import { AuthUserAccessService } from "./auth-user-access.service";
import { DevAuthBypassService } from "./dev-auth-bypass.service";
import { GoogleStrategy } from "./google.strategy";
import { JwtStrategy } from "./jwt.strategy";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RoleService } from "./role.service";
import { RolesGuard } from "./roles.guard";

@Module({
  imports: [UsersModule, PassportModule.register({ session: false }), JwtModule.register({})],
  providers: [
    GoogleStrategy,
    JwtStrategy,
    JwtAuthGuard,
    GoogleAuthGuard,
    RolesGuard,
    AuthService,
    AuthUserAccessService,
    DevAuthBypassService,
    RoleService,
    AuthResolver,
  ],
  controllers: [AuthController],
  exports: [
    JwtAuthGuard,
    RolesGuard,
    DevAuthBypassService,
    AuthService,
    AuthUserAccessService,
    RoleService,
    UsersModule,
  ],
})
export class AuthModule {}

import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "@api/domains/users/users.module";
import { GoogleStrategy } from "./google.strategy";
import { JwtStrategy } from "./jwt.strategy";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { AuthResolver } from "./auth.resolver";
import { GoogleAuthGuard } from "@api/domains/auth/google-auth.guard";
import { DevAuthBypassService } from "./dev-auth-bypass.service";

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ session: false }),
    JwtModule.register({}),
  ],
  providers: [
    GoogleStrategy,
    JwtStrategy,
    JwtAuthGuard,
    GoogleAuthGuard,
    RolesGuard,
    AuthService,
    DevAuthBypassService,
    AuthResolver,
  ],
  controllers: [AuthController],
  exports: [JwtAuthGuard, RolesGuard, DevAuthBypassService, UsersModule],
})
export class AuthModule {}

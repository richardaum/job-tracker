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

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({})],
  providers: [
    GoogleStrategy,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    AuthService,
    AuthResolver,
  ],
  controllers: [AuthController],
})
export class AuthModule {}

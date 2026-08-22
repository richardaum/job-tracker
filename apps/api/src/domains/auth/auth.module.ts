import { RegistrationsResolver } from "@api/domains/users/registrations.resolver";
import { UsersModule } from "@api/domains/users/users.module";
import { Module } from "@nestjs/common";

import { AuthResolver } from "./auth.resolver";
import { BetterAuthAccountRepository } from "./better-auth-account.repository";
import { BetterAuthUserProvisioner } from "./better-auth-user-provisioner";
import { BetterAuthUserFieldsResolver } from "./better-auth-user-fields.resolver";
import { DevAuthBypassService } from "./dev-auth-bypass.service";
import { RoleService } from "./role.service";
import { RolesGuard } from "./roles.guard";
import { SessionAuthGuard } from "./session-auth.guard";

@Module({
  imports: [UsersModule],
  providers: [
    SessionAuthGuard,
    RolesGuard,
    DevAuthBypassService,
    RoleService,
    BetterAuthAccountRepository,
    BetterAuthUserProvisioner,
    BetterAuthUserFieldsResolver,
    AuthResolver,
    RegistrationsResolver,
  ],
  exports: [SessionAuthGuard, RolesGuard, DevAuthBypassService, RoleService, UsersModule],
})
export class AuthModule {}

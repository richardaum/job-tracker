import { UserService } from "@api/domains/users/users.service";
import { AfterCreate, DatabaseHook } from "@thallesp/nestjs-better-auth";
import { Injectable } from "@nestjs/common";

type BetterAuthUser = { id: string; email: string; name: string; image?: string | null };

/** Creates the domain user after Better Auth persists a first-time OAuth user. */
@DatabaseHook()
@Injectable()
export class BetterAuthUserProvisioner {
  constructor(private readonly userService: UserService) {}

  @AfterCreate("user")
  async provision(user: BetterAuthUser | null): Promise<void> {
    if (!user) return;
    await this.userService.findOrCreateFromBetterAuth({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.image ?? null,
    });
  }
}

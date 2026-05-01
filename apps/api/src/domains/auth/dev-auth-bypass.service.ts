import type { User } from "@api/domains/users/users.schema";
import { UserService } from "@api/domains/users/users.service";
import { AUTH_BYPASS_ENABLED, DEV_AUTH_BYPASS_EMAIL } from "@api/env/server";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class DevAuthBypassService {
  private readonly logger = new Logger(DevAuthBypassService.name);
  private hasLoggedEnabledState = false;

  constructor(private readonly userService: UserService) {}

  isEnabled(): boolean {
    if (AUTH_BYPASS_ENABLED && !this.hasLoggedEnabledState) {
      this.logger.warn(
        `Dev auth bypass is ENABLED for ${DEV_AUTH_BYPASS_EMAIL}.`,
      );
      this.hasLoggedEnabledState = true;
    }

    return AUTH_BYPASS_ENABLED;
  }

  async getBypassUser(): Promise<User> {
    const existingByEmail = await this.userService.findByEmail(
      DEV_AUTH_BYPASS_EMAIL,
    );
    if (existingByEmail) {
      return existingByEmail;
    }

    return this.userService.findOrCreateFromGoogle({
      googleId: "dev-bypass-richard-lopes",
      email: DEV_AUTH_BYPASS_EMAIL,
      name: "Richard Lopes",
      avatarUrl: null,
    });
  }
}

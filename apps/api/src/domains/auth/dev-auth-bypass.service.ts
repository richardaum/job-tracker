import type { User } from "@api/domains/users/users.schema";
import { UserService } from "@api/domains/users/users.service";
import { serverEnv } from "@api/env/server";
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";

@Injectable()
export class DevAuthBypassService {
  private readonly logger = new Logger(DevAuthBypassService.name);
  private hasLoggedEnabledState = false;

  constructor(private readonly userService: UserService) {}

  isEnabled(): boolean {
    if (serverEnv.AUTH_BYPASS_ENABLED && !this.hasLoggedEnabledState) {
      this.logger.warn(
        `Dev auth bypass is ENABLED for ${serverEnv.DEV_AUTH_BYPASS_EMAIL}.`,
      );
      this.hasLoggedEnabledState = true;
    }

    return serverEnv.AUTH_BYPASS_ENABLED;
  }

  async getBypassUser(): Promise<User> {
    const email = serverEnv.DEV_AUTH_BYPASS_EMAIL;
    if (!email) {
      throw new InternalServerErrorException(
        "DEV_AUTH_BYPASS_EMAIL is required when auth bypass is enabled.",
      );
    }

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new InternalServerErrorException(
        `Auth bypass user not found for email: ${email}`,
      );
    }

    return user;
  }
}

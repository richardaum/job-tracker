import type { User } from "@api/domains/users/users.schema";
import { UserService } from "@api/domains/users/users.service";
import { apiEnv } from "@api/env/server";
import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";

@Injectable()
export class DevAuthBypassService {
  private readonly logger = new Logger(DevAuthBypassService.name);
  private hasLoggedEnabledState = false;

  constructor(private readonly userService: UserService) {}

  isEnabled(): boolean {
    if (apiEnv.NODE_ENV === "production") {
      return false;
    }

    if (apiEnv.AUTH_BYPASS_ENABLED && !this.hasLoggedEnabledState) {
      this.logger.warn(`Dev auth bypass is ENABLED for ${this.maskEmail(apiEnv.DEV_AUTH_BYPASS_EMAIL)}.`);
      this.hasLoggedEnabledState = true;
    }

    return apiEnv.AUTH_BYPASS_ENABLED;
  }

  async getBypassUser(): Promise<User> {
    const email = apiEnv.DEV_AUTH_BYPASS_EMAIL;
    if (!email) {
      throw new InternalServerErrorException("DEV_AUTH_BYPASS_EMAIL is required when auth bypass is enabled.");
    }

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new InternalServerErrorException(`Auth bypass user not found for email: ${this.maskEmail(email)}`);
    }

    return user;
  }

  private maskEmail(email: string | undefined): string {
    if (!email) return "(none)";
    const [local, domain] = email.split("@");
    if (!domain) return "(invalid email)";
    return `${local[0]}***@${domain[0]}***.${domain.split(".").pop() ?? "***"}`;
  }
}

import { BadRequestException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PostHogService } from "@api/domains/feature-flags/posthog.service";

import { RegistrationEmailService } from "./registration-email.service";
import { RoleEnum } from "./role.enum";
import { UserStatusEnum } from "./user-status.enum";
import { UserRepository } from "./users.repository";
import type { User } from "./users.schema";

const AUTO_ACCEPT_REGISTER_FLAG = "auto-accept-register-enabled";
const AUTO_ACCEPT_REGISTER_DISTINCT_ID = "system";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly postHogService: PostHogService,
    private readonly registrationEmailService?: RegistrationEmailService,
  ) {}

  async listAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async listRegistrations(status?: UserStatusEnum, search?: string): Promise<User[]> {
    const users = await this.userRepository.findAll();
    const statusFiltered = status
      ? users.filter((user) => user.status === status)
      : users.filter((user) => user.status !== UserStatusEnum.Deactivated);

    const normalizedSearch = search?.trim().toLowerCase();
    if (!normalizedSearch) return statusFiltered;

    return statusFiltered.filter(
      (user) =>
        user.name.toLowerCase().includes(normalizedSearch) || user.email.toLowerCase().includes(normalizedSearch),
    );
  }

  async approveRegistration(userId: string): Promise<User> {
    const user = await this.transitionRegistration(userId, UserStatusEnum.Active);
    await this.registrationEmailService?.notifyUserOfApprovedRegistration(user);
    return user;
  }

  async rejectRegistration(userId: string): Promise<User> {
    return this.transitionRegistration(userId, UserStatusEnum.Rejected);
  }

  async resendApprovalEmail(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user || user.status !== UserStatusEnum.Active) {
      throw new BadRequestException("Only active users can have their approval email resent.");
    }

    await this.registrationEmailService?.resendApprovedRegistrationEmail(user);
    return user;
  }

  private async transitionRegistration(userId: string, nextStatus: UserStatusEnum): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user || user.status !== UserStatusEnum.Pending) {
      throw new BadRequestException("Only pending registrations can be approved or rejected.");
    }

    await this.userRepository.setStatus(userId, nextStatus);
    return { ...user, status: nextStatus };
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /** Better Auth persists its user first; this hook creates the matching domain profile. */
  async findOrCreateFromBetterAuth(profile: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  }): Promise<User> {
    const byId = await this.findById(profile.id);
    if (byId) return byId;

    const byEmail = await this.findByEmail(profile.email);
    if (byEmail) {
      return byEmail;
    }

    const status = await this.resolveNewUserStatus(profile.email);
    const user = await this.userRepository.insertUser({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      role: RoleEnum.User,
      status,
    });
    if (user.status === UserStatusEnum.Pending) {
      await this.registrationEmailService?.notifyAdminsOfPendingRegistration(user);
    }
    return user;
  }

  private async resolveNewUserStatus(email: string): Promise<UserStatusEnum> {
    const autoAcceptEnabled = await this.postHogService.isFeatureEnabled(
      AUTO_ACCEPT_REGISTER_FLAG,
      AUTO_ACCEPT_REGISTER_DISTINCT_ID,
    );
    if (autoAcceptEnabled) {
      return UserStatusEnum.Active;
    }

    const previouslyApproved = await this.userRepository.findByEmail(email);
    if (previouslyApproved?.status === UserStatusEnum.Active) {
      return UserStatusEnum.Active;
    }

    return UserStatusEnum.Pending;
  }

  async deactivateUser(id: string): Promise<void> {
    await this.userRepository.setStatus(id, UserStatusEnum.Deactivated);
  }

  async removeUserByAdmin(adminId: string, userId: string): Promise<User> {
    if (adminId === userId) {
      throw new BadRequestException("Use account settings to deactivate your own account.");
    }

    const user = await this.userRepository.findById(userId);
    if (!user || user.status === UserStatusEnum.Deactivated) {
      throw new BadRequestException("User not found or already deactivated.");
    }

    await this.userRepository.setStatus(userId, UserStatusEnum.Deactivated);
    return { ...user, status: UserStatusEnum.Deactivated };
  }

  async validateActiveUser(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      this.logger.warn(`auth denied userId=${userId} reason=user_not_found`);
      throw new UnauthorizedException();
    }
    if (user.status !== UserStatusEnum.Active) {
      this.logger.warn(`auth denied userId=${userId} reason=user_inactive`);
      // @nestjs/apollo's auto HTTP-to-GraphQL transform (apollo-base.driver.js) only recognizes
      // this as an HTTP exception, and copies the body into extensions.originalError, when
      // response.statusCode is present. A custom object body does NOT get statusCode injected
      // automatically (that only happens for a string body) — omitting it here silently fell
      // through to a generic INTERNAL_SERVER_ERROR with no userStatus reaching the client.
      throw new UnauthorizedException({ statusCode: 401, message: "Account not active", userStatus: user.status });
    }
    return user;
  }
}

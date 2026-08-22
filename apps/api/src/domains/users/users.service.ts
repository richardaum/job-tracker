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

  async listRegistrations(status?: UserStatusEnum): Promise<User[]> {
    const users = await this.userRepository.findAll();
    return status ? users.filter((user) => user.status === status) : users;
  }

  async approveRegistration(userId: string): Promise<User> {
    const user = await this.transitionRegistration(userId, UserStatusEnum.Active);
    await this.registrationEmailService?.notifyUserOfApprovedRegistration(user);
    return user;
  }

  async rejectRegistration(userId: string): Promise<User> {
    return this.transitionRegistration(userId, UserStatusEnum.Rejected);
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

  async validateActiveUser(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      this.logger.warn(`auth denied userId=${userId} reason=user_not_found`);
      throw new UnauthorizedException();
    }
    if (user.status !== UserStatusEnum.Active) {
      this.logger.warn(`auth denied userId=${userId} reason=user_inactive`);
      throw new UnauthorizedException();
    }
    return user;
  }
}

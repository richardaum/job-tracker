import { randomUUID } from "node:crypto";

import { BadRequestException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";

import { PostHogService } from "@api/domains/feature-flags/posthog.service";

import { ActiveUserCacheService } from "./active-user-cache.service";
import { AuthProviderEnum } from "./auth-provider.enum";
import { RoleEnum } from "./role.enum";
import { UserStatusEnum } from "./user-status.enum";
import { UserRepository } from "./users.repository";
import type { NewUser, User } from "./users.schema";

const AUTO_ACCEPT_REGISTER_FLAG = "auto-accept-register-enabled";
const AUTO_ACCEPT_REGISTER_DISTINCT_ID = "system";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly activeUserCache: ActiveUserCacheService,
    private readonly postHogService: PostHogService,
  ) {}

  async listAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async listRegistrations(status?: UserStatusEnum): Promise<User[]> {
    const users = await this.userRepository.findAll();
    return status ? users.filter((user) => user.status === status) : users;
  }

  async approveRegistration(userId: string): Promise<User> {
    return this.transitionRegistration(userId, UserStatusEnum.Active);
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

  /** Google Passport profile → persisted OAuth identity */
  async findOrCreateFromGoogle(profile: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  }): Promise<User> {
    return this.upsertFromProvider({
      providerName: AuthProviderEnum.Google,
      providerAccountId: profile.googleId,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
    });
  }

  async upsertFromProvider(profile: NewUser): Promise<User> {
    return this.userRepository.manager.transaction(async (em) => {
      const existingLink = await this.userRepository.findAccountByProvider(
        profile.providerName,
        profile.providerAccountId,
        em,
      );

      if (existingLink) {
        return this.userRepository.saveUser(
          { id: existingLink.userId, email: profile.email, name: profile.name, avatarUrl: profile.avatarUrl },
          em,
        );
      }

      const userId = randomUUID();
      const status = await this.resolveNewUserStatus(profile.email);
      const user = await this.userRepository.insertUser(
        {
          id: userId,
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          role: profile.role ?? RoleEnum.User,
          status,
        },
        em,
      );
      await this.userRepository.insertAccount(
        { id: randomUUID(), userId, providerName: profile.providerName, providerAccountId: profile.providerAccountId },
        em,
      );
      return user;
    });
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

  async incrementTokenVersion(id: string): Promise<void> {
    await this.userRepository.incrementTokenVersion(id);
    this.activeUserCache.invalidate(id);
  }

  async setRefreshJti(id: string, jti: string | null): Promise<void> {
    await this.userRepository.setRefreshJti(id, jti);
    this.activeUserCache.invalidate(id);
  }

  async deactivateUser(id: string): Promise<void> {
    await this.userRepository.setStatus(id, UserStatusEnum.Deactivated);
    await this.userRepository.incrementTokenVersion(id);
    this.activeUserCache.invalidate(id);
  }

  async validateActiveUser(userId: string, tokenVersion: number): Promise<User> {
    const cached = this.activeUserCache.get(userId, tokenVersion);
    if (cached) {
      return cached;
    }

    const user = await this.findById(userId);
    if (!user) {
      this.logger.warn(`auth denied userId=${userId} reason=user_not_found`);
      throw new UnauthorizedException();
    }
    if (user.status !== UserStatusEnum.Active) {
      this.logger.warn(`auth denied userId=${userId} reason=user_inactive`);
      throw new UnauthorizedException();
    }
    if (user.tokenVersion !== tokenVersion) {
      this.logger.warn(
        `auth denied userId=${userId} reason=token_version_mismatch tokenVersion=${tokenVersion} currentVersion=${user.tokenVersion}`,
      );
      throw new UnauthorizedException();
    }

    this.activeUserCache.set(userId, tokenVersion, user);
    return user;
  }
}

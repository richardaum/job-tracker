import { randomUUID } from "node:crypto";

import { Injectable, UnauthorizedException } from "@nestjs/common";

import { ActiveUserCacheService } from "./active-user-cache.service";
import { AuthProviderEnum } from "./auth-provider.enum";
import { RoleEnum } from "./role.enum";
import { UserRepository } from "./users.repository";
import type { NewUser, User } from "./users.schema";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly activeUserCache: ActiveUserCacheService,
  ) {}

  async listAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
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
      const user = await this.userRepository.insertUser(
        {
          id: userId,
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          role: profile.role ?? RoleEnum.User,
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

  async incrementTokenVersion(id: string): Promise<void> {
    await this.userRepository.incrementTokenVersion(id);
    this.activeUserCache.invalidate(id);
  }

  async setRefreshJti(id: string, jti: string | null): Promise<void> {
    await this.userRepository.setRefreshJti(id, jti);
    this.activeUserCache.invalidate(id);
  }

  async deactivateUser(id: string): Promise<void> {
    await this.userRepository.setActive(id, false);
    await this.userRepository.incrementTokenVersion(id);
    this.activeUserCache.invalidate(id);
  }

  async validateActiveUser(userId: string, tokenVersion: number): Promise<User> {
    const cached = this.activeUserCache.get(userId, tokenVersion);
    if (cached) {
      return cached;
    }

    const user = await this.findById(userId);
    if (!user || !user.active) {
      throw new UnauthorizedException();
    }
    if (user.tokenVersion !== tokenVersion) {
      throw new UnauthorizedException();
    }

    this.activeUserCache.set(userId, tokenVersion, user);
    return user;
  }
}

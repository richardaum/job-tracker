import { randomUUID } from "node:crypto";

import { Injectable, UnauthorizedException } from "@nestjs/common";

import { ActiveUserCacheService } from "./active-user-cache.service";
import { RoleEnum } from "./role.enum";
import { UserRepository } from "./users.repository";
import { User } from "./users.schema";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly activeUserCache: ActiveUserCacheService,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findOrCreateFromGoogle(profile: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  }): Promise<User> {
    const existing = await this.userRepository.findByGoogleId(profile.googleId);
    if (existing) {
      const updated = await this.userRepository.updateProfile(existing.id, {
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
      });
      if (!updated) {
        throw new Error("User profile update failed without returning a row.");
      }
      return updated;
    }

    return this.userRepository.create({
      id: randomUUID(),
      googleId: profile.googleId,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      role: RoleEnum.User,
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

  async validateActiveUser(
    userId: string,
    tokenVersion: number,
  ): Promise<User> {
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

import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";

import { AuthProviderEnum } from "./auth-provider.enum";
import { RoleEnum } from "./role.enum";
import { UserRepository } from "./users.repository";
import type { NewUser, User } from "./users.schema";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
      providerName: AuthProviderEnum.GOOGLE,
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
          {
            id: existingLink.userId,
            email: profile.email,
            name: profile.name,
            avatarUrl: profile.avatarUrl,
          },
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
        {
          id: randomUUID(),
          userId,
          providerName: profile.providerName,
          providerAccountId: profile.providerAccountId,
        },
        em,
      );
      return user;
    });
  }
}

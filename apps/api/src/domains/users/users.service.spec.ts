import { UserAccountEntity } from "@api/database/entities/user-account.entity";
import { UnauthorizedException } from "@nestjs/common";
import type { EntityManager } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ActiveUserCacheService } from "./active-user-cache.service";
import { AuthProviderEnum } from "./auth-provider.enum";
import { RoleEnum } from "./role.enum";
import { UserRepository } from "./users.repository";
import { User } from "./users.schema";
import { UserService } from "./users.service";

const mockUser: User = {
  id: "uuid-1",
  email: "test@example.com",
  name: "Test User",
  avatarUrl: "https://example.com/avatar.jpg",
  role: RoleEnum.User,
  active: true,
  tokenVersion: 0,
  refreshJti: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  accounts: [] as UserAccountEntity[],
};

describe("UserService", () => {
  let service: UserService;
  let repo: UserRepository;
  let em: EntityManager;

  beforeEach(() => {
    em = {} as EntityManager;
    repo = {
      manager: {
        transaction: vi.fn(
          async (fn: (manager: EntityManager) => Promise<User>) => fn(em),
        ),
      },
      findAccountByProvider: vi.fn(),
      saveUser: vi.fn(),
      insertUser: vi.fn(),
      insertAccount: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      incrementTokenVersion: vi.fn(),
      setRefreshJti: vi.fn(),
      setActive: vi.fn(),
    } as unknown as UserRepository;
    service = new UserService(repo, new ActiveUserCacheService());
  });

  describe("findOrCreateFromGoogle", () => {
    it("updates an existing linked user", async () => {
      vi.mocked(repo.findAccountByProvider).mockResolvedValue({
        userId: mockUser.id,
      } as UserAccountEntity);
      vi.mocked(repo.saveUser).mockResolvedValue(mockUser);

      const profile = {
        googleId: "google-123",
        email: "test@example.com",
        name: "Test User",
        avatarUrl: "https://example.com/avatar.jpg",
      };

      const result = await service.findOrCreateFromGoogle(profile);

      expect(repo.findAccountByProvider).toHaveBeenCalledWith(
        AuthProviderEnum.GOOGLE,
        profile.googleId,
        em,
      );
      expect(repo.saveUser).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
        },
        em,
      );
      expect(repo.insertUser).not.toHaveBeenCalled();
      expect(repo.insertAccount).not.toHaveBeenCalled();
      expect(result).toBe(mockUser);
    });

    it("creates a user and provider link when none exists", async () => {
      vi.mocked(repo.findAccountByProvider).mockResolvedValue(null);
      vi.mocked(repo.insertUser).mockResolvedValue(mockUser);
      vi.mocked(repo.insertAccount).mockResolvedValue({} as UserAccountEntity);

      const profile = {
        googleId: "google-456",
        email: "other@example.com",
        name: "Other User",
        avatarUrl: null,
      };

      const result = await service.findOrCreateFromGoogle(profile);

      expect(repo.insertUser).toHaveBeenCalledOnce();
      expect(repo.insertUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: profile.email,
          name: profile.name,
          avatarUrl: null,
          role: RoleEnum.User,
        }),
        em,
      );
      const insertedUser = vi.mocked(repo.insertUser).mock.calls[0]?.[0];
      expect(repo.insertAccount).toHaveBeenCalledOnce();
      expect(repo.insertAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: insertedUser?.id,
          providerName: AuthProviderEnum.GOOGLE,
          providerAccountId: profile.googleId,
        }),
        em,
      );
      expect(result).toBe(mockUser);
    });
  });

  describe("incrementTokenVersion", () => {
    it("delegates to UserRepository.incrementTokenVersion", async () => {
      await service.incrementTokenVersion("uuid-1");
      expect(repo.incrementTokenVersion).toHaveBeenCalledWith("uuid-1");
    });

    it("invalidates validateActiveUser cache", async () => {
      vi.mocked(repo.findById).mockResolvedValue(mockUser);
      await service.validateActiveUser("uuid-1", 0);
      await service.incrementTokenVersion("uuid-1");
      await service.validateActiveUser("uuid-1", 0);
      expect(repo.findById).toHaveBeenCalledTimes(2);
    });
  });

  describe("setRefreshJti", () => {
    it("delegates to UserRepository.setRefreshJti", async () => {
      await service.setRefreshJti("uuid-1", "jti-123");
      expect(repo.setRefreshJti).toHaveBeenCalledWith("uuid-1", "jti-123");
    });
  });

  describe("validateActiveUser", () => {
    it("returns user when active and tokenVersion matches", async () => {
      vi.mocked(repo.findById).mockResolvedValue(mockUser);
      const result = await service.validateActiveUser("uuid-1", 0);
      expect(result).toBe(mockUser);
    });

    it("returns cached user without a second DB lookup", async () => {
      vi.mocked(repo.findById).mockResolvedValue(mockUser);
      await service.validateActiveUser("uuid-1", 0);
      await service.validateActiveUser("uuid-1", 0);
      expect(repo.findById).toHaveBeenCalledTimes(1);
    });

    it("throws UnauthorizedException when user not found", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null);
      await expect(service.validateActiveUser("uuid-1", 0)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("throws UnauthorizedException when user is inactive", async () => {
      vi.mocked(repo.findById).mockResolvedValue({
        ...mockUser,
        active: false,
      });
      await expect(service.validateActiveUser("uuid-1", 0)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("throws UnauthorizedException when tokenVersion mismatches", async () => {
      vi.mocked(repo.findById).mockResolvedValue(mockUser);
      await expect(service.validateActiveUser("uuid-1", 5)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("deactivateUser", () => {
    it("sets user inactive and increments token version", async () => {
      await service.deactivateUser("uuid-1");
      expect(repo.setActive).toHaveBeenCalledWith("uuid-1", false);
      expect(repo.incrementTokenVersion).toHaveBeenCalledWith("uuid-1");
    });

    it("invalidates validateActiveUser cache", async () => {
      vi.mocked(repo.findById).mockResolvedValue(mockUser);
      await service.validateActiveUser("uuid-1", 0);
      await service.deactivateUser("uuid-1");
      await service.validateActiveUser("uuid-1", 0);
      expect(repo.findById).toHaveBeenCalledTimes(2);
    });
  });
});

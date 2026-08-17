import { UserAccountEntity } from "@api/database/entities/user-account.entity";
import { PostHogService } from "@api/domains/feature-flags/posthog.service";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import type { EntityManager } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ActiveUserCacheService } from "./active-user-cache.service";
import { AuthProviderEnum } from "./auth-provider.enum";
import { RoleEnum } from "./role.enum";
import { UserStatusEnum } from "./user-status.enum";
import { UserRepository } from "./users.repository";
import { User } from "./users.schema";
import { UserService } from "./users.service";

const mockUser: User = {
  id: "uuid-1",
  email: "test@example.com",
  name: "Test User",
  avatarUrl: "https://example.com/avatar.jpg",
  role: RoleEnum.User,
  status: UserStatusEnum.Active,
  tokenVersion: 0,
  refreshJti: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  accounts: [] as UserAccountEntity[],
};

describe("UserService", () => {
  let service: UserService;
  let repo: UserRepository;
  let postHogService: PostHogService;
  let em: EntityManager;

  beforeEach(() => {
    em = {} as EntityManager;
    repo = {
      manager: { transaction: vi.fn(async (fn: (manager: EntityManager) => Promise<User>) => fn(em)) },
      findAll: vi.fn(),
      findAccountByProvider: vi.fn(),
      saveUser: vi.fn(),
      insertUser: vi.fn(),
      insertAccount: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(null),
      incrementTokenVersion: vi.fn(),
      setRefreshJti: vi.fn(),
      setStatus: vi.fn(),
    } as unknown as UserRepository;
    postHogService = { isFeatureEnabled: vi.fn().mockResolvedValue(false) } as unknown as PostHogService;
    service = new UserService(repo, new ActiveUserCacheService(), postHogService);
  });

  describe("findOrCreateFromGoogle", () => {
    it("updates an existing linked user", async () => {
      vi.mocked(repo.findAccountByProvider).mockResolvedValue({ userId: mockUser.id } as UserAccountEntity);
      vi.mocked(repo.saveUser).mockResolvedValue(mockUser);

      const profile = {
        googleId: "google-123",
        email: "test@example.com",
        name: "Test User",
        avatarUrl: "https://example.com/avatar.jpg",
      };

      const result = await service.findOrCreateFromGoogle(profile);

      expect(repo.findAccountByProvider).toHaveBeenCalledWith(AuthProviderEnum.Google, profile.googleId, em);
      expect(repo.saveUser).toHaveBeenCalledWith(
        { id: mockUser.id, email: profile.email, name: profile.name, avatarUrl: profile.avatarUrl },
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

      const profile = { googleId: "google-456", email: "other@example.com", name: "Other User", avatarUrl: null };

      const result = await service.findOrCreateFromGoogle(profile);

      expect(repo.insertUser).toHaveBeenCalledOnce();
      expect(repo.insertUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: profile.email,
          name: profile.name,
          avatarUrl: null,
          role: RoleEnum.User,
          status: UserStatusEnum.Pending,
        }),
        em,
      );
      const insertedUser = vi.mocked(repo.insertUser).mock.calls[0]?.[0];
      expect(repo.insertAccount).toHaveBeenCalledOnce();
      expect(repo.insertAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: insertedUser?.id,
          providerName: AuthProviderEnum.Google,
          providerAccountId: profile.googleId,
        }),
        em,
      );
      expect(result).toBe(mockUser);
    });

    it("creates a new user as active when the auto-accept flag is enabled", async () => {
      vi.mocked(repo.findAccountByProvider).mockResolvedValue(null);
      vi.mocked(repo.insertUser).mockResolvedValue(mockUser);
      vi.mocked(repo.insertAccount).mockResolvedValue({} as UserAccountEntity);
      vi.mocked(postHogService.isFeatureEnabled).mockResolvedValue(true);

      const profile = { googleId: "google-789", email: "flag-on@example.com", name: "Flag On", avatarUrl: null };
      await service.findOrCreateFromGoogle(profile);

      expect(postHogService.isFeatureEnabled).toHaveBeenCalledWith("auto-accept-register-enabled", "system");
      expect(repo.insertUser).toHaveBeenCalledWith(expect.objectContaining({ status: UserStatusEnum.Active }), em);
    });

    it("creates a new user as pending when the flag is disabled and the email has no prior approval", async () => {
      vi.mocked(repo.findAccountByProvider).mockResolvedValue(null);
      vi.mocked(repo.insertUser).mockResolvedValue(mockUser);
      vi.mocked(repo.insertAccount).mockResolvedValue({} as UserAccountEntity);
      vi.mocked(postHogService.isFeatureEnabled).mockResolvedValue(false);
      vi.mocked(repo.findByEmail).mockResolvedValue(null);

      const profile = { googleId: "google-999", email: "new@example.com", name: "New Person", avatarUrl: null };
      await service.findOrCreateFromGoogle(profile);

      expect(repo.insertUser).toHaveBeenCalledWith(expect.objectContaining({ status: UserStatusEnum.Pending }), em);
    });

    it("creates a new user as active when the flag is disabled but the email was previously approved", async () => {
      vi.mocked(repo.findAccountByProvider).mockResolvedValue(null);
      vi.mocked(repo.insertUser).mockResolvedValue(mockUser);
      vi.mocked(repo.insertAccount).mockResolvedValue({} as UserAccountEntity);
      vi.mocked(postHogService.isFeatureEnabled).mockResolvedValue(false);
      vi.mocked(repo.findByEmail).mockResolvedValue({ ...mockUser, status: UserStatusEnum.Active });

      const profile = { googleId: "google-111", email: "approved@example.com", name: "Approved", avatarUrl: null };
      await service.findOrCreateFromGoogle(profile);

      expect(repo.insertUser).toHaveBeenCalledWith(expect.objectContaining({ status: UserStatusEnum.Active }), em);
    });

    it("does not touch status for an existing linked user, regardless of the flag", async () => {
      vi.mocked(repo.findAccountByProvider).mockResolvedValue({ userId: mockUser.id } as UserAccountEntity);
      vi.mocked(repo.saveUser).mockResolvedValue(mockUser);
      vi.mocked(postHogService.isFeatureEnabled).mockResolvedValue(false);

      const profile = {
        googleId: "google-123",
        email: "test@example.com",
        name: "Test User",
        avatarUrl: "https://example.com/avatar.jpg",
      };
      await service.findOrCreateFromGoogle(profile);

      expect(postHogService.isFeatureEnabled).not.toHaveBeenCalled();
      expect(repo.saveUser).toHaveBeenCalledWith(
        { id: mockUser.id, email: profile.email, name: profile.name, avatarUrl: profile.avatarUrl },
        em,
      );
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
      await expect(service.validateActiveUser("uuid-1", 0)).rejects.toThrow(UnauthorizedException);
    });

    it("throws UnauthorizedException when user is pending", async () => {
      vi.mocked(repo.findById).mockResolvedValue({ ...mockUser, status: UserStatusEnum.Pending });
      await expect(service.validateActiveUser("uuid-1", 0)).rejects.toThrow(UnauthorizedException);
    });

    it("throws UnauthorizedException when user is rejected", async () => {
      vi.mocked(repo.findById).mockResolvedValue({ ...mockUser, status: UserStatusEnum.Rejected });
      await expect(service.validateActiveUser("uuid-1", 0)).rejects.toThrow(UnauthorizedException);
    });

    it("throws UnauthorizedException when user is deactivated", async () => {
      vi.mocked(repo.findById).mockResolvedValue({ ...mockUser, status: UserStatusEnum.Deactivated });
      await expect(service.validateActiveUser("uuid-1", 0)).rejects.toThrow(UnauthorizedException);
    });

    it("throws UnauthorizedException when tokenVersion mismatches", async () => {
      vi.mocked(repo.findById).mockResolvedValue(mockUser);
      await expect(service.validateActiveUser("uuid-1", 5)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("deactivateUser", () => {
    it("sets user status to deactivated and increments token version", async () => {
      await service.deactivateUser("uuid-1");
      expect(repo.setStatus).toHaveBeenCalledWith("uuid-1", UserStatusEnum.Deactivated);
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

  describe("listRegistrations", () => {
    const users = [
      { ...mockUser, id: "u1", status: UserStatusEnum.Pending },
      { ...mockUser, id: "u2", status: UserStatusEnum.Active },
      { ...mockUser, id: "u3", status: UserStatusEnum.Rejected },
    ];

    it("returns all users when no status filter is given", async () => {
      vi.mocked(repo.findAll).mockResolvedValue(users);
      const result = await service.listRegistrations();
      expect(result).toEqual(users);
    });

    it("filters users by status when given", async () => {
      vi.mocked(repo.findAll).mockResolvedValue(users);
      const result = await service.listRegistrations(UserStatusEnum.Pending);
      expect(result).toEqual([users[0]]);
    });
  });

  describe("approveRegistration", () => {
    it("sets status to active and returns the updated user for a pending user", async () => {
      vi.mocked(repo.findById).mockResolvedValue({ ...mockUser, status: UserStatusEnum.Pending });
      const result = await service.approveRegistration("uuid-1");
      expect(repo.setStatus).toHaveBeenCalledWith("uuid-1", UserStatusEnum.Active);
      expect(result.status).toBe(UserStatusEnum.Active);
    });

    it("throws BadRequestException when the user is not pending", async () => {
      vi.mocked(repo.findById).mockResolvedValue({ ...mockUser, status: UserStatusEnum.Active });
      await expect(service.approveRegistration("uuid-1")).rejects.toThrow(BadRequestException);
      expect(repo.setStatus).not.toHaveBeenCalled();
    });

    it("throws BadRequestException when the user does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null);
      await expect(service.approveRegistration("missing")).rejects.toThrow(BadRequestException);
    });
  });

  describe("rejectRegistration", () => {
    it("sets status to rejected and returns the updated user for a pending user", async () => {
      vi.mocked(repo.findById).mockResolvedValue({ ...mockUser, status: UserStatusEnum.Pending });
      const result = await service.rejectRegistration("uuid-1");
      expect(repo.setStatus).toHaveBeenCalledWith("uuid-1", UserStatusEnum.Rejected);
      expect(result.status).toBe(UserStatusEnum.Rejected);
    });

    it("throws BadRequestException when the user is not pending", async () => {
      vi.mocked(repo.findById).mockResolvedValue({ ...mockUser, status: UserStatusEnum.Rejected });
      await expect(service.rejectRegistration("uuid-1")).rejects.toThrow(BadRequestException);
      expect(repo.setStatus).not.toHaveBeenCalled();
    });
  });
});

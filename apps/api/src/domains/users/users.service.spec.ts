import { UnauthorizedException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ActiveUserCacheService } from "./active-user-cache.service";
import { RoleEnum } from "./role.enum";
import { UserRepository } from "./users.repository";
import { User } from "./users.schema";
import { UserService } from "./users.service";

const mockUser: User = {
  id: "uuid-1",
  googleId: "google-123",
  email: "test@example.com",
  name: "Test User",
  avatarUrl: "https://example.com/avatar.jpg",
  role: RoleEnum.User,
  active: true,
  tokenVersion: 0,
  refreshJti: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("UserService", () => {
  let service: UserService;
  let repo: UserRepository;

  beforeEach(() => {
    repo = {
      findByGoogleId: vi.fn(),
      create: vi.fn(),
      updateProfile: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      incrementTokenVersion: vi.fn(),
      setRefreshJti: vi.fn(),
      setActive: vi.fn(),
    } as unknown as UserRepository;
    service = new UserService(repo, new ActiveUserCacheService());
  });

  describe("findOrCreateFromGoogle", () => {
    it("creates a user when none exists for the googleId", async () => {
      vi.mocked(repo.findByGoogleId).mockResolvedValue(null);
      vi.mocked(repo.create).mockResolvedValue(mockUser);

      const profile = {
        googleId: "google-123",
        email: "test@example.com",
        name: "Test User",
        avatarUrl: "https://example.com/avatar.jpg",
      };

      const result = await service.findOrCreateFromGoogle(profile);

      expect(repo.findByGoogleId).toHaveBeenCalledWith("google-123");
      expect(repo.create).toHaveBeenCalledOnce();
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          googleId: profile.googleId,
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          role: RoleEnum.User,
        }),
      );
      expect(result).toBe(mockUser);
    });

    it("updates profile when user already exists", async () => {
      const updatedUser: User = { ...mockUser, name: "Updated Name" };
      vi.mocked(repo.findByGoogleId).mockResolvedValue(mockUser);
      vi.mocked(repo.updateProfile).mockResolvedValue(updatedUser);

      const profile = {
        googleId: "google-123",
        email: "test@example.com",
        name: "Updated Name",
        avatarUrl: null,
      };

      const result = await service.findOrCreateFromGoogle(profile);

      expect(repo.updateProfile).toHaveBeenCalledWith(mockUser.id, {
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
      });
      expect(result).toBe(updatedUser);
    });

    it("passes avatarUrl as null when not provided", async () => {
      const userWithoutAvatar: User = { ...mockUser, avatarUrl: null };
      vi.mocked(repo.findByGoogleId).mockResolvedValue(null);
      vi.mocked(repo.create).mockResolvedValue(userWithoutAvatar);

      const profile = {
        googleId: "google-456",
        email: "other@example.com",
        name: "Other User",
        avatarUrl: null,
      };

      const result = await service.findOrCreateFromGoogle(profile);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ avatarUrl: null }),
      );
      expect(result.avatarUrl).toBeNull();
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

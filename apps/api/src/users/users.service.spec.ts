import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserService } from "./users.service";
import { UserRepository } from "./users.repository";
import { User } from "./users.schema";

const mockUser: User = {
  id: "uuid-1",
  googleId: "google-123",
  email: "test@example.com",
  name: "Test User",
  avatarUrl: "https://example.com/avatar.jpg",
  role: "user",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("UserService", () => {
  let service: UserService;
  let repo: UserRepository;

  beforeEach(() => {
    repo = {
      findByGoogleId: vi.fn(),
      upsert: vi.fn(),
    } as unknown as UserRepository;
    service = new UserService(repo);
  });

  describe("findOrCreateFromGoogle", () => {
    it("delegates to UserRepository.upsert and returns the result", async () => {
      vi.mocked(repo.upsert).mockResolvedValue(mockUser);

      const profile = {
        googleId: "google-123",
        email: "test@example.com",
        name: "Test User",
        avatarUrl: "https://example.com/avatar.jpg",
      };

      const result = await service.findOrCreateFromGoogle(profile);

      expect(repo.upsert).toHaveBeenCalledOnce();
      expect(repo.upsert).toHaveBeenCalledWith(profile);
      expect(result).toBe(mockUser);
    });

    it("passes avatarUrl as null when not provided", async () => {
      const userWithoutAvatar: User = { ...mockUser, avatarUrl: null };
      vi.mocked(repo.upsert).mockResolvedValue(userWithoutAvatar);

      const profile = {
        googleId: "google-456",
        email: "other@example.com",
        name: "Other User",
        avatarUrl: null,
      };

      const result = await service.findOrCreateFromGoogle(profile);

      expect(repo.upsert).toHaveBeenCalledWith(profile);
      expect(result.avatarUrl).toBeNull();
    });
  });
});

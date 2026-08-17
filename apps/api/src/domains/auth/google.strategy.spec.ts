import "reflect-metadata";

import { UserAccountEntity } from "@api/database/entities/user-account.entity";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UserStatusEnum } from "@api/domains/users/user-status.enum";
import type { User } from "@api/domains/users/users.schema";
import { UserService } from "@api/domains/users/users.service";
import { UnauthorizedException } from "@nestjs/common";
import type { Profile } from "passport-google-oauth20";
import { describe, expect, it, vi } from "vitest";

import { GoogleStrategy } from "./google.strategy";

const mockUser: User = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  avatarUrl: null,
  role: RoleEnum.User,
  status: UserStatusEnum.Active,
  tokenVersion: 0,
  refreshJti: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  accounts: [] as UserAccountEntity[],
};

const mockProfile = {
  id: "google-1",
  emails: [{ value: mockUser.email }],
  displayName: mockUser.name,
  photos: [{ value: "https://example.com/avatar.jpg" }],
} as unknown as Profile;

function makeStrategy(user: User) {
  const userService = { findOrCreateFromGoogle: vi.fn().mockResolvedValue(user) } as unknown as UserService;
  return new GoogleStrategy(userService);
}

describe("GoogleStrategy", () => {
  it("returns the user when status is active", async () => {
    const strategy = makeStrategy(mockUser);

    await expect(strategy.validate("token", "refresh", mockProfile)).resolves.toBe(mockUser);
  });

  it("returns the user when status is pending (the callback decides how to respond)", async () => {
    const strategy = makeStrategy({ ...mockUser, status: UserStatusEnum.Pending });

    await expect(strategy.validate("token", "refresh", mockProfile)).resolves.toMatchObject({
      status: UserStatusEnum.Pending,
    });
  });

  it("returns the user when status is rejected (the callback decides how to respond)", async () => {
    const strategy = makeStrategy({ ...mockUser, status: UserStatusEnum.Rejected });

    await expect(strategy.validate("token", "refresh", mockProfile)).resolves.toMatchObject({
      status: UserStatusEnum.Rejected,
    });
  });

  it("throws UnauthorizedException when status is deactivated", async () => {
    const strategy = makeStrategy({ ...mockUser, status: UserStatusEnum.Deactivated });

    await expect(strategy.validate("token", "refresh", mockProfile)).rejects.toThrow(UnauthorizedException);
  });
});

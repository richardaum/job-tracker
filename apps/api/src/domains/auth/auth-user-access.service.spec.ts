import "reflect-metadata";

import { RoleEnum } from "@api/domains/users/role.enum";
import type { User } from "@api/domains/users/users.schema";
import { UserService } from "@api/domains/users/users.service";
import { ForbiddenException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import { AuthUserAccessService } from "./auth-user-access.service";

const mockUser: User = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  avatarUrl: null,
  role: RoleEnum.User,
  active: true,
  tokenVersion: 0,
  refreshJti: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  accounts: [],
};

describe("AuthUserAccessService", () => {
  it("returns user when active and tokenVersion matches", async () => {
    const userService = {
      validateActiveUser: vi.fn().mockResolvedValue(mockUser),
    } as unknown as UserService;
    const service = new AuthUserAccessService(userService);

    await expect(
      service.assertAuthenticatedUser(mockUser.id, mockUser.tokenVersion),
    ).resolves.toEqual(mockUser);
  });

  it("throws ForbiddenException when role is not allowed", async () => {
    const userService = {
      validateActiveUser: vi.fn().mockResolvedValue(mockUser),
    } as unknown as UserService;
    const service = new AuthUserAccessService(userService);

    await expect(
      service.assertAuthenticatedUser(mockUser.id, mockUser.tokenVersion, [
        RoleEnum.Admin,
      ]),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("returns user when role is in allowedRoles", async () => {
    const userService = {
      validateActiveUser: vi.fn().mockResolvedValue(mockUser),
    } as unknown as UserService;
    const service = new AuthUserAccessService(userService);

    await expect(
      service.assertAuthenticatedUser(mockUser.id, mockUser.tokenVersion, [
        RoleEnum.User,
      ]),
    ).resolves.toEqual(mockUser);
  });
});

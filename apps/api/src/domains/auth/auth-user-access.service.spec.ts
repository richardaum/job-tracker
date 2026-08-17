import "reflect-metadata";

import { RoleEnum } from "@api/domains/users/role.enum";
import { UserStatusEnum } from "@api/domains/users/user-status.enum";
import type { User } from "@api/domains/users/users.schema";
import { UserService } from "@api/domains/users/users.service";
import { ForbiddenException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import { AuthUserAccessService } from "./auth-user-access.service";
import { RoleService } from "./role.service";

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
  accounts: [],
};

function makeService(userService: UserService) {
  const roleService = { isAllowed: vi.fn((r, a) => a.includes(r)) } as unknown as RoleService;
  return new AuthUserAccessService(userService, roleService);
}

describe("AuthUserAccessService", () => {
  it("returns user when active and tokenVersion matches", async () => {
    const userService = { validateActiveUser: vi.fn().mockResolvedValue(mockUser) } as unknown as UserService;
    const service = makeService(userService);

    await expect(service.assertAuthenticatedUser(mockUser.id, mockUser.tokenVersion)).resolves.toEqual(mockUser);
  });

  it("throws ForbiddenException when role is not allowed", async () => {
    const userService = { validateActiveUser: vi.fn().mockResolvedValue(mockUser) } as unknown as UserService;
    const service = makeService(userService);

    await expect(
      service.assertAuthenticatedUser(mockUser.id, mockUser.tokenVersion, [RoleEnum.Admin]),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("allows admin when role is not in allowedRoles", async () => {
    const adminUser = { ...mockUser, role: RoleEnum.Admin };
    const userService = { validateActiveUser: vi.fn().mockResolvedValue(adminUser) } as unknown as UserService;
    const roleService = { isAllowed: vi.fn().mockReturnValue(true) } as unknown as RoleService;
    const service = new AuthUserAccessService(userService, roleService);

    await expect(
      service.assertAuthenticatedUser(adminUser.id, adminUser.tokenVersion, [RoleEnum.User]),
    ).resolves.toEqual(adminUser);
    expect(roleService.isAllowed).toHaveBeenCalledWith(RoleEnum.Admin, [RoleEnum.User]);
  });

  it("returns user when role is in allowedRoles", async () => {
    const userService = { validateActiveUser: vi.fn().mockResolvedValue(mockUser) } as unknown as UserService;
    const service = makeService(userService);

    await expect(service.assertAuthenticatedUser(mockUser.id, mockUser.tokenVersion, [RoleEnum.User])).resolves.toEqual(
      mockUser,
    );
  });
});

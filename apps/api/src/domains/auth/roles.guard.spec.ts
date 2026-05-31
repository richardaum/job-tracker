import "reflect-metadata";

import { RoleEnum } from "@api/domains/users/role.enum";
import { UserService } from "@api/domains/users/users.service";
import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { describe, expect, it, vi } from "vitest";

import { RoleService } from "./role.service";
import { RolesGuard } from "./roles.guard";

function makeContext(
  user: { userId: string; role?: string } | undefined,
): ExecutionContext {
  const request = { user };
  const gqlContext = { req: request };
  const args = [{}, {}, gqlContext, {}];

  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    getType: () => "graphql",
    getArgs: () => args,
    getArgByIndex: (index: number) => args[index],
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function makeGuard(reflector: Reflector, userService: UserService) {
  const roleService = new RoleService();
  return new RolesGuard(reflector, userService, roleService);
}

describe("RolesGuard", () => {
  it("allows when DB role matches required", async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue([RoleEnum.User]),
    } as unknown as Reflector;
    const userService = {
      findById: vi.fn().mockResolvedValue({ role: RoleEnum.User }),
    } as unknown as UserService;
    const guard = makeGuard(reflector, userService);
    expect(await guard.canActivate(makeContext({ userId: "user-1" }))).toBe(
      true,
    );
    expect(userService.findById).toHaveBeenCalledWith("user-1");
  });

  it("blocks when DB role does not match required", async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue([RoleEnum.Admin]),
    } as unknown as Reflector;
    const userService = {
      findById: vi.fn().mockResolvedValue({ role: RoleEnum.User }),
    } as unknown as UserService;
    const guard = makeGuard(reflector, userService);
    expect(await guard.canActivate(makeContext({ userId: "user-1" }))).toBe(
      false,
    );
    expect(userService.findById).toHaveBeenCalledWith("user-1");
  });

  it("allows admin regardless of requiredRoles", async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue([RoleEnum.User]),
    } as unknown as Reflector;
    const userService = {
      findById: vi.fn().mockResolvedValue({ role: RoleEnum.Admin }),
    } as unknown as UserService;
    const guard = makeGuard(reflector, userService);
    expect(await guard.canActivate(makeContext({ userId: "admin-1" }))).toBe(
      true,
    );
    expect(userService.findById).toHaveBeenCalledWith("admin-1");
  });

  it("allows when no roles metadata is set (public route)", async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const userService = { findById: vi.fn() } as unknown as UserService;
    const guard = makeGuard(reflector, userService);
    expect(await guard.canActivate(makeContext(undefined))).toBe(true);
    expect(userService.findById).not.toHaveBeenCalled();
  });

  it("blocks when user has no userId", async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue([RoleEnum.User]),
    } as unknown as Reflector;
    const userService = { findById: vi.fn() } as unknown as UserService;
    const guard = makeGuard(reflector, userService);
    expect(await guard.canActivate(makeContext({} as { userId: string }))).toBe(
      false,
    );
  });
});

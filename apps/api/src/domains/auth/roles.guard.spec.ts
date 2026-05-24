import "reflect-metadata";

import { RoleEnum } from "@api/domains/users/role.enum";
import { UserService } from "@api/domains/users/users.service";
import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { describe, expect, it, vi } from "vitest";

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

describe("RolesGuard", () => {
  it("allows when user role matches required role (cached)", async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(["user"]),
    } as unknown as Reflector;
    const userService = { findById: vi.fn() } as unknown as UserService;
    const guard = new RolesGuard(reflector, userService);
    expect(
      await guard.canActivate(
        makeContext({ userId: "user-1", role: RoleEnum.User }),
      ),
    ).toBe(true);
    expect(userService.findById).not.toHaveBeenCalled();
  });

  it("blocks when user role does not match required role (cached)", async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(["admin"]),
    } as unknown as Reflector;
    const userService = { findById: vi.fn() } as unknown as UserService;
    const guard = new RolesGuard(reflector, userService);
    expect(
      await guard.canActivate(
        makeContext({ userId: "user-1", role: RoleEnum.User }),
      ),
    ).toBe(false);
    expect(userService.findById).not.toHaveBeenCalled();
  });

  it("falls back to DB when request.user has no role set", async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(["user"]),
    } as unknown as Reflector;
    const userService = {
      findById: vi.fn().mockResolvedValue({ role: RoleEnum.User }),
    } as unknown as UserService;
    const guard = new RolesGuard(reflector, userService);
    expect(await guard.canActivate(makeContext({ userId: "user-1" }))).toBe(
      true,
    );
    expect(userService.findById).toHaveBeenCalledWith("user-1");
  });

  it("allows when no roles metadata is set (public route)", async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const userService = { findById: vi.fn() } as unknown as UserService;
    const guard = new RolesGuard(reflector, userService);
    expect(await guard.canActivate(makeContext(undefined))).toBe(true);
    expect(userService.findById).not.toHaveBeenCalled();
  });
});

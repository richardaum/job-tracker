import "reflect-metadata";

import { UserService } from "@api/domains/users/users.service";
import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { describe, expect, it, vi } from "vitest";

import { RolesGuard } from "./roles.guard";

function makeContext(userId: string | undefined): ExecutionContext {
  const request = { user: userId !== undefined ? { userId } : undefined };
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
  it("allows when user role matches required role", async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(["user"]),
    } as unknown as Reflector;
    const userService = {
      findById: vi.fn().mockResolvedValue({ role: "user" }),
    } as unknown as UserService;
    const guard = new RolesGuard(reflector, userService);
    expect(await guard.canActivate(makeContext("user-1"))).toBe(true);
  });

  it("blocks when user role does not match required role", async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(["admin"]),
    } as unknown as Reflector;
    const userService = {
      findById: vi.fn().mockResolvedValue({ role: "user" }),
    } as unknown as UserService;
    const guard = new RolesGuard(reflector, userService);
    expect(await guard.canActivate(makeContext("user-1"))).toBe(false);
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

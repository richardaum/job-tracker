import "reflect-metadata";
import { describe, it, expect, vi } from "vitest";
import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";

function makeContext(role: string | undefined): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: role !== undefined ? { role } : undefined }),
    }),
  } as unknown as ExecutionContext;
}

describe("RolesGuard", () => {
  it("allows when role matches required role", () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(["user"]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(makeContext("user"))).toBe(true);
  });

  it("blocks when role does not match required role", () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(["admin"]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(makeContext("user"))).toBe(false);
  });

  it("allows when no roles metadata is set (public route)", () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(makeContext(undefined))).toBe(true);
  });
});

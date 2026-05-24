import "reflect-metadata";

import type { AuthUserAccessService } from "@api/domains/auth/auth-user-access.service";
import { describe, expect, it, vi } from "vitest";

import type { DevAuthBypassService } from "./dev-auth-bypass.service";
import { JwtStrategy } from "./jwt.strategy";
import { JwtAuthGuard } from "./jwt-auth.guard";

describe("JwtAuthGuard", () => {
  const mockBypass = {
    isEnabled: vi.fn().mockReturnValue(false),
    getBypassUser: vi.fn(),
  } as unknown as DevAuthBypassService;
  const mockAuthUserAccessService = {} as unknown as AuthUserAccessService;

  it("is defined", () => {
    expect(JwtAuthGuard).toBeDefined();
  });

  it("can be instantiated", () => {
    const guard = new JwtAuthGuard(mockBypass, mockAuthUserAccessService);
    expect(guard).toBeDefined();
  });
});

describe("JwtStrategy", () => {
  it("validate returns userId and tokenVersion from payload", () => {
    const strategy = new JwtStrategy();
    const result = strategy.validate({ sub: "user-1", tv: 3 });
    expect(result).toEqual({ userId: "user-1", tokenVersion: 3 });
  });

  it("validate defaults tokenVersion to 0 when tv is missing (legacy tokens)", () => {
    const strategy = new JwtStrategy();
    const result = strategy.validate({ sub: "user-1" });
    expect(result).toEqual({ userId: "user-1", tokenVersion: 0 });
  });
});

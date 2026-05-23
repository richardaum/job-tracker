import "reflect-metadata";

import { describe, expect, it, vi } from "vitest";

import type { DevAuthBypassService } from "./dev-auth-bypass.service";
import { JwtStrategy } from "./jwt.strategy";
import { JwtAuthGuard } from "./jwt-auth.guard";

describe("JwtAuthGuard", () => {
  const mockBypass = {
    isEnabled: vi.fn().mockReturnValue(false),
    getBypassUser: vi.fn(),
  } as unknown as DevAuthBypassService;

  it("is defined", () => {
    expect(JwtAuthGuard).toBeDefined();
  });

  it("can be instantiated", () => {
    const guard = new JwtAuthGuard(mockBypass);
    expect(guard).toBeDefined();
  });
});

describe("JwtStrategy", () => {
  it("validate returns only userId from payload (role resolved via DB)", () => {
    const strategy = new JwtStrategy();
    const result = strategy.validate({ sub: "user-1" });
    expect(result).toEqual({ userId: "user-1" });
  });
});

import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { JwtStrategy } from "./jwt.strategy";

describe("JwtAuthGuard", () => {
  it("is defined", () => {
    expect(JwtAuthGuard).toBeDefined();
  });

  it("can be instantiated", () => {
    const guard = new JwtAuthGuard();
    expect(guard).toBeDefined();
  });
});

describe("JwtStrategy", () => {
  it("validate returns userId and role from payload", () => {
    const strategy = new JwtStrategy();
    const result = strategy.validate({ sub: "user-1", role: "user" });
    expect(result).toEqual({ userId: "user-1", role: "user" });
  });
});

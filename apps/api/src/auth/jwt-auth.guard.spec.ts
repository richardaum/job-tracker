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
  it("validate returns only userId from payload (role resolved via DB)", () => {
    const strategy = new JwtStrategy();
    const result = strategy.validate({ sub: "user-1" });
    expect(result).toEqual({ userId: "user-1" });
  });
});

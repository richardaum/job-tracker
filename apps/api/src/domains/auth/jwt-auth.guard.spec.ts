import "reflect-metadata";

import { describe, expect, it } from "vitest";

import { JwtStrategy } from "./jwt.strategy";
import { JwtAuthGuard } from "./jwt-auth.guard";

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

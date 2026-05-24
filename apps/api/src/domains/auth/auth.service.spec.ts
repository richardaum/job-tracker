import "reflect-metadata";

import { UserAccountEntity } from "@api/database/entities/user-account.entity";
import { RoleEnum } from "@api/domains/users/role.enum";
import type { User } from "@api/domains/users/users.schema";
import { JwtService } from "@nestjs/jwt";
import * as jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it } from "vitest";

import { AuthService } from "./auth.service";

const mockUser: User = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  avatarUrl: null,
  role: RoleEnum.User,
  createdAt: new Date(),
  updatedAt: new Date(),
  accounts: [] as UserAccountEntity[],
};

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(new JwtService({}));
  });

  it("generateAccessToken returns a JWT with sub (no role) and 15m expiry", () => {
    const token = service.generateAccessToken(mockUser);
    const decoded = jwt.decode(token) as jwt.JwtPayload;

    expect(decoded.sub).toBe(mockUser.id);
    expect(decoded.role).toBeUndefined();

    const nowSeconds = Math.floor(Date.now() / 1000);
    const expectedExpiry = nowSeconds + 15 * 60;
    expect(decoded.exp).toBeGreaterThanOrEqual(expectedExpiry - 5);
    expect(decoded.exp).toBeLessThanOrEqual(expectedExpiry + 5);
  });

  it("generateRefreshToken returns a JWT with sub (no role) and 7d expiry", () => {
    const token = service.generateRefreshToken(mockUser);
    const decoded = jwt.decode(token) as jwt.JwtPayload;

    expect(decoded.sub).toBe(mockUser.id);
    expect(decoded.role).toBeUndefined();

    const nowSeconds = Math.floor(Date.now() / 1000);
    const expectedExpiry = nowSeconds + 7 * 24 * 60 * 60;
    expect(decoded.exp).toBeGreaterThanOrEqual(expectedExpiry - 5);
    expect(decoded.exp).toBeLessThanOrEqual(expectedExpiry + 5);
  });

  it("verifyRefreshToken returns user id from token sub", () => {
    const token = service.generateRefreshToken(mockUser);
    const payload = service.verifyRefreshToken(token);
    expect(payload.userId).toBe(mockUser.id);
  });

  it("verifyAccessToken returns user id from access token sub", () => {
    const token = service.generateAccessToken(mockUser);
    const payload = service.verifyAccessToken(token);
    expect(payload.userId).toBe(mockUser.id);
  });
});

import "reflect-metadata";

import { UserAccountEntity } from "@api/database/entities/user-account.entity";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UserStatusEnum } from "@api/domains/users/user-status.enum";
import type { User } from "@api/domains/users/users.schema";
import * as jwt from "jsonwebtoken";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockUser: User = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  avatarUrl: null,
  role: RoleEnum.User,
  status: UserStatusEnum.Active,
  tokenVersion: 0,
  refreshJti: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  accounts: [] as UserAccountEntity[],
};

const tokenVersion = 0;

describe("AuthService", () => {
  let service: import("./auth.service").AuthService;

  beforeEach(async () => {
    vi.resetModules();
    const { AuthService } = await import("./auth.service");
    service = new AuthService();
  });

  it("generateAccessToken returns a JWT with sub, tv, kid current and 15m expiry", () => {
    const token = service.generateAccessToken(mockUser, tokenVersion);
    const decoded = jwt.decode(token, { complete: true });

    expect(decoded).not.toBeNull();
    expect(typeof decoded).not.toBe("string");
    if (!decoded || typeof decoded === "string") {
      throw new Error("expected decoded JWT object");
    }
    if (typeof decoded.payload === "string") {
      throw new Error("expected object JWT payload");
    }
    const jwtPayload = decoded.payload;

    expect(decoded.header.kid).toBe("current");
    expect(jwtPayload.sub).toBe(mockUser.id);
    expect(jwtPayload.tv).toBe(tokenVersion);
    expect(jwtPayload.role).toBeUndefined();

    const nowSeconds = Math.floor(Date.now() / 1000);
    const expectedExpiry = nowSeconds + 15 * 60;
    expect(jwtPayload.exp).toBeGreaterThanOrEqual(expectedExpiry - 5);
    expect(jwtPayload.exp).toBeLessThanOrEqual(expectedExpiry + 5);
  });

  it("generateRefreshToken returns a JWT with sub, tv, jti, kid current and 7d expiry", () => {
    const jti = "11111111-2222-4333-8444-555555555555";
    const token = service.generateRefreshToken(mockUser, tokenVersion, jti);
    const decoded = jwt.decode(token, { complete: true });

    expect(decoded).not.toBeNull();
    expect(typeof decoded).not.toBe("string");
    if (!decoded || typeof decoded === "string") {
      throw new Error("expected decoded JWT object");
    }
    if (typeof decoded.payload === "string") {
      throw new Error("expected object JWT payload");
    }
    const jwtPayload = decoded.payload;

    expect(decoded.header.kid).toBe("current");
    expect(jwtPayload.sub).toBe(mockUser.id);
    expect(jwtPayload.tv).toBe(tokenVersion);
    expect(jwtPayload.jti).toBe(jti);
    expect(jwtPayload.role).toBeUndefined();

    const nowSeconds = Math.floor(Date.now() / 1000);
    const expectedExpiry = nowSeconds + 7 * 24 * 60 * 60;
    expect(jwtPayload.exp).toBeGreaterThanOrEqual(expectedExpiry - 5);
    expect(jwtPayload.exp).toBeLessThanOrEqual(expectedExpiry + 5);
  });

  it("verifyRefreshToken returns user id, token version, and jti from token", () => {
    const jti = "11111111-2222-4333-8444-555555555555";
    const token = service.generateRefreshToken(mockUser, tokenVersion, jti);
    const payload = service.verifyRefreshToken(token);
    expect(payload.userId).toBe(mockUser.id);
    expect(payload.tokenVersion).toBe(tokenVersion);
    expect(payload.jti).toBe(jti);
  });

  it("verifyAccessToken returns user id and token version from access token", () => {
    const token = service.generateAccessToken(mockUser, tokenVersion);
    const payload = service.verifyAccessToken(token);
    expect(payload.userId).toBe(mockUser.id);
    expect(payload.tokenVersion).toBe(tokenVersion);
  });

  it("verifyRefreshToken defaults tokenVersion to 0 for legacy tokens without tv", () => {
    const legacyToken = jwt.sign({ sub: "user-legacy" }, "test-refresh-secret");
    const payload = service.verifyRefreshToken(legacyToken);
    expect(payload.userId).toBe("user-legacy");
    expect(payload.tokenVersion).toBe(0);
  });
});

describe("AuthService JWT secret rotation", () => {
  const rotationSecrets = {
    jwtAccessSecrets: { current: "new-access-secret", previous: "old-access-secret" },
    jwtRefreshSecrets: { current: "new-refresh-secret", previous: "old-refresh-secret" },
  };

  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@api/env/server", async () => {
      const actual = await vi.importActual<typeof import("@api/env/server")>("@api/env/server");
      return { ...actual, ...rotationSecrets };
    });
  });

  afterEach(() => {
    vi.doUnmock("@api/env/server");
    vi.resetModules();
  });

  it("verifyAccessToken accepts tokens signed with previous secret during rotation", async () => {
    const { AuthService } = await import("./auth.service");
    const rotatingService = new AuthService();

    const previousSecretToken = jwt.sign(
      { sub: mockUser.id, tv: tokenVersion },
      rotationSecrets.jwtAccessSecrets.previous,
      { header: { kid: "current", alg: "HS256" }, expiresIn: "15m" },
    );

    const payload = rotatingService.verifyAccessToken(previousSecretToken);
    expect(payload.userId).toBe(mockUser.id);
    expect(payload.tokenVersion).toBe(tokenVersion);
  });

  it("verifyRefreshToken accepts tokens signed with previous secret during rotation", async () => {
    const { AuthService } = await import("./auth.service");
    const rotatingService = new AuthService();

    const previousSecretToken = jwt.sign(
      { sub: mockUser.id, tv: tokenVersion },
      rotationSecrets.jwtRefreshSecrets.previous,
      { header: { kid: "previous", alg: "HS256" }, expiresIn: "7d" },
    );

    const payload = rotatingService.verifyRefreshToken(previousSecretToken);
    expect(payload.userId).toBe(mockUser.id);
    expect(payload.tokenVersion).toBe(tokenVersion);
  });
});

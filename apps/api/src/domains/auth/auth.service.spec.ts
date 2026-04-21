import "reflect-metadata";
import { describe, it, expect, beforeEach } from "vitest";
import { JwtService } from "@nestjs/jwt";
import * as jwt from "jsonwebtoken";
import { AuthService } from "./auth.service";
import type { User } from "@api/domains/users/users.schema";

const mockUser: User = {
  id: "user-123",
  googleId: "google-456",
  email: "test@example.com",
  name: "Test User",
  avatarUrl: null,
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
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
});

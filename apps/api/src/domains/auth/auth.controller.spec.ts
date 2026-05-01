import "reflect-metadata";

import type { User } from "@api/domains/users/users.schema";
import { UserService } from "@api/domains/users/users.service";
import { WEB_URL } from "@api/env/server";
import type { ExecutionContext, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { DevAuthBypassService } from "./dev-auth-bypass.service";
import { GoogleAuthGuard } from "./google-auth.guard";

const mockUser: User = {
  id: "user-1",
  googleId: "google-123",
  email: "test@example.com",
  name: "Test User",
  avatarUrl: null,
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("AuthController (integration)", () => {
  let app: INestApplication;
  const loginUrl = new URL("/login", WEB_URL).toString();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            generateAccessToken: () => "mock-access-token",
            generateRefreshToken: () => "mock-refresh-token",
            verifyRefreshToken: () => ({ userId: mockUser.id }),
          },
        },
        { provide: UserService, useValue: {} },
        { provide: DevAuthBypassService, useValue: { isEnabled: () => false } },
      ],
    })
      .overrideGuard(GoogleAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          ctx.switchToHttp().getRequest().user = mockUser;
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it("GET /auth/google/callback sets cookies and redirects to login", async () => {
    const res = await request(app.getHttpServer())
      .get("/auth/google/callback")
      .set("Host", "localhost:3100");

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe(loginUrl);

    const cookies = ([] as string[]).concat(res.headers["set-cookie"] ?? []);
    expect(cookies.some((c) => c.startsWith("access_token="))).toBe(true);
    expect(
      cookies.some(
        (c) =>
          c.startsWith("refresh_token=") &&
          c.toLowerCase().includes("httponly"),
      ),
    ).toBe(true);
  });

  it("GET /auth/google/callback preserves safe returnTo from oauth state", async () => {
    const res = await request(app.getHttpServer())
      .get("/auth/google/callback?state=%2Fapplications%2F123")
      .set("Host", "localhost:3100");

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe(
      `${loginUrl}?returnTo=%2Fapplications%2F123`,
    );
  });

  it("GET /auth/google/callback ignores unsafe oauth state", async () => {
    const res = await request(app.getHttpServer())
      .get("/auth/google/callback?state=https%3A%2F%2Fevil.example")
      .set("Host", "localhost:3100");

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe(loginUrl);
  });

  it("POST /auth/logout clears auth cookies", async () => {
    const res = await request(app.getHttpServer()).post("/auth/logout");

    expect(res.statusCode).toBe(200);
    const cookies = ([] as string[]).concat(res.headers["set-cookie"] ?? []);
    expect(cookies.some((c) => c.startsWith("access_token=;"))).toBe(true);
    expect(cookies.some((c) => c.startsWith("refresh_token=;"))).toBe(true);
  });

  it("POST /auth/refresh sets a new access token cookie", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/refresh")
      .set("Cookie", ["refresh_token=valid-refresh"]);

    expect(res.statusCode).toBe(200);
    const cookies = ([] as string[]).concat(res.headers["set-cookie"] ?? []);
    expect(cookies.some((c) => c.startsWith("access_token="))).toBe(true);
    expect(cookies.some((c) => c.startsWith("refresh_token="))).toBe(false);
  });

  it("POST /auth/refresh returns 401 without refresh cookie", async () => {
    const res = await request(app.getHttpServer()).post("/auth/refresh");
    expect(res.statusCode).toBe(401);
  });
});

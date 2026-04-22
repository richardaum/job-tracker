import "reflect-metadata";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Test } from "@nestjs/testing";
import type { INestApplication, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserService } from "@api/domains/users/users.service";
import type { User } from "@api/domains/users/users.schema";
import { WEB_URL } from "@api/env/server";

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
      ],
    })
      .overrideGuard(AuthGuard("google"))
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

  afterAll(() => app.close());

  it("GET /auth/google/callback sets cookies and redirects to WEB_URL", async () => {
    const res = await request(app.getHttpServer()).get("/auth/google/callback");

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe(WEB_URL);

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

import "reflect-metadata";

import { UserAccountEntity } from "@api/database/entities/user-account.entity";
import {
  AUTH_ACTION_HEADER,
  AUTH_ACTION_VALUE,
} from "@api/domains/auth/auth-mutation.util";
import { AuthUserAccessService } from "@api/domains/auth/auth-user-access.service";
import { RoleEnum } from "@api/domains/users/role.enum";
import type { User } from "@api/domains/users/users.schema";
import { UserService } from "@api/domains/users/users.service";
import { apiEnv } from "@api/env/server";
import type { ExecutionContext, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ThrottlerGuard } from "@nestjs/throttler";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { DevAuthBypassService } from "./dev-auth-bypass.service";
import { GoogleAuthGuard } from "./google-auth.guard";

const mockUser: User = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  avatarUrl: null,
  role: RoleEnum.User,
  active: true,
  tokenVersion: 0,
  refreshJti: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  accounts: [] as UserAccountEntity[],
};

const authMutationHeader = { [AUTH_ACTION_HEADER]: AUTH_ACTION_VALUE };
const currentJti = "550e8400-e29b-41d4-a716-446655440000";

describe("AuthController (integration)", () => {
  let app: INestApplication;
  const webUrl = new URL(apiEnv.WEB_URL);
  const loginUrl = new URL("/login", webUrl).toString();
  const host = webUrl.host;
  let incrementTokenVersion: ReturnType<typeof vi.fn>;
  let setRefreshJti: ReturnType<typeof vi.fn>;
  let findById: ReturnType<typeof vi.fn>;
  let verifyRefreshToken: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    incrementTokenVersion = vi.fn().mockResolvedValue(undefined);
    setRefreshJti = vi.fn().mockResolvedValue(undefined);
    findById = vi
      .fn()
      .mockResolvedValueOnce({
        ...mockUser,
        refreshJti: currentJti,
        tokenVersion: mockUser.tokenVersion,
      })
      .mockResolvedValue({
        ...mockUser,
        refreshJti: currentJti,
        tokenVersion: 1,
      });
    verifyRefreshToken = vi
      .fn()
      .mockReturnValue({
        userId: mockUser.id,
        tokenVersion: mockUser.tokenVersion,
        jti: currentJti,
      });

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            generateAccessToken: () => "mock-access-token",
            generateRefreshToken: () => "mock-refresh-token",
            verifyRefreshToken,
          },
        },
        {
          provide: UserService,
          useValue: {
            validateActiveUser: vi
              .fn()
              .mockResolvedValue({
                ...mockUser,
                active: true,
                tokenVersion: 0,
              }),
            incrementTokenVersion,
            setRefreshJti,
            findById,
          },
        },
        {
          provide: AuthUserAccessService,
          useValue: {
            assertAuthenticatedUser: vi
              .fn()
              .mockResolvedValue({
                ...mockUser,
                active: true,
                tokenVersion: 0,
              }),
          },
        },
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
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
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
      .set("Host", host);

    expect(res.statusCode).toBe(302);
    expect(setRefreshJti).toHaveBeenCalledWith(
      mockUser.id,
      expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      ),
    );
    expect(res.headers.location).toBe(loginUrl);

    const cookies = ([] as string[]).concat(res.headers["set-cookie"] ?? []);
    expect(cookies.some((c) => c.startsWith("access_token="))).toBe(true);
    expect(cookies.some((c) => c.toLowerCase().includes("samesite=none"))).toBe(
      true,
    );
    expect(cookies.some((c) => c.toLowerCase().includes("secure"))).toBe(true);
    expect(
      cookies.some(
        (c) =>
          c.startsWith("refresh_token=") &&
          c.toLowerCase().includes("path=/auth") &&
          c.toLowerCase().includes("httponly"),
      ),
    ).toBe(true);
  });

  it("GET /auth/google/callback preserves safe returnTo from oauth state", async () => {
    const res = await request(app.getHttpServer())
      .get("/auth/google/callback?state=%2Fapplications%2F123")
      .set("Host", host);

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe(
      `${loginUrl}?returnTo=%2Fapplications%2F123`,
    );
  });

  it("GET /auth/google/callback ignores unsafe oauth state", async () => {
    const res = await request(app.getHttpServer())
      .get("/auth/google/callback?state=https%3A%2F%2Fevil.example")
      .set("Host", host);

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe(loginUrl);
  });

  it("POST /auth/logout clears auth cookies and increments tokenVersion", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/logout")
      .set(authMutationHeader)
      .set("Cookie", ["refresh_token=valid-refresh"]);

    expect(res.statusCode).toBe(200);
    expect(incrementTokenVersion).toHaveBeenCalledWith(mockUser.id);
    const cookies = ([] as string[]).concat(res.headers["set-cookie"] ?? []);
    expect(cookies.some((c) => c.startsWith("access_token=;"))).toBe(true);
    const refreshClears = cookies.filter((c) =>
      c.startsWith("refresh_token=;"),
    );
    expect(refreshClears.length).toBe(2);
  });

  it("POST /auth/logout handles missing refresh token gracefully", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/logout")
      .set(authMutationHeader);

    expect(res.statusCode).toBe(200);
  });

  it("POST /auth/refresh rotates jti and sets new access and refresh token cookies", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/refresh")
      .set(authMutationHeader)
      .set("Cookie", ["refresh_token=valid-refresh"]);

    expect(res.statusCode).toBe(200);
    expect(setRefreshJti).toHaveBeenCalledWith(
      mockUser.id,
      expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      ),
    );
    expect(incrementTokenVersion).toHaveBeenCalledWith(mockUser.id);
    expect(findById).toHaveBeenCalledWith(mockUser.id);
    const cookies = ([] as string[]).concat(res.headers["set-cookie"] ?? []);
    expect(cookies.some((c) => c.startsWith("access_token="))).toBe(true);
    expect(cookies.some((c) => c.startsWith("refresh_token="))).toBe(true);
  });

  it("POST /auth/refresh returns 401 and invalidates sessions on jti reuse", async () => {
    setRefreshJti.mockClear();
    verifyRefreshToken.mockReturnValueOnce({
      userId: mockUser.id,
      tokenVersion: mockUser.tokenVersion,
      jti: "reused-jti",
    });
    findById.mockResolvedValueOnce({
      ...mockUser,
      refreshJti: currentJti,
      tokenVersion: mockUser.tokenVersion,
    });

    const res = await request(app.getHttpServer())
      .post("/auth/refresh")
      .set(authMutationHeader)
      .set("Cookie", ["refresh_token=reused-refresh"]);

    expect(res.statusCode).toBe(401);
    expect(incrementTokenVersion).toHaveBeenCalledWith(mockUser.id);
    expect(setRefreshJti).not.toHaveBeenCalled();
  });

  it("POST /auth/refresh allows legacy tokens without jti once and rotates", async () => {
    verifyRefreshToken.mockReturnValueOnce({
      userId: mockUser.id,
      tokenVersion: mockUser.tokenVersion,
    });
    findById
      .mockResolvedValueOnce({
        ...mockUser,
        refreshJti: null,
        tokenVersion: mockUser.tokenVersion,
      })
      .mockResolvedValueOnce({
        ...mockUser,
        refreshJti: currentJti,
        tokenVersion: 1,
      });

    const res = await request(app.getHttpServer())
      .post("/auth/refresh")
      .set(authMutationHeader)
      .set("Cookie", ["refresh_token=legacy-refresh"]);

    expect(res.statusCode).toBe(200);
    expect(setRefreshJti).toHaveBeenCalledWith(
      mockUser.id,
      expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      ),
    );
    expect(incrementTokenVersion).toHaveBeenCalledWith(mockUser.id);
  });

  it("POST /auth/refresh returns 401 without refresh cookie", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/refresh")
      .set(authMutationHeader);
    expect(res.statusCode).toBe(401);
  });

  it("POST /auth/logout returns 401 without X-Auth-Action header", async () => {
    const res = await request(app.getHttpServer()).post("/auth/logout");
    expect(res.statusCode).toBe(401);
  });

  it("POST /auth/refresh returns 401 without X-Auth-Action header", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/refresh")
      .set("Cookie", ["refresh_token=valid-refresh"]);
    expect(res.statusCode).toBe(401);
  });

  it("POST /auth/logout returns 401 with cross-origin request", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/logout")
      .set(authMutationHeader)
      .set("Origin", "https://evil.example.com");

    expect(res.statusCode).toBe(401);
  });

  it("POST /auth/refresh returns 401 with cross-origin request", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/refresh")
      .set(authMutationHeader)
      .set("Origin", "https://evil.example.com");

    expect(res.statusCode).toBe(401);
  });
});

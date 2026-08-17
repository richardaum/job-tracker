import "reflect-metadata";

import { UserAccountEntity } from "@api/database/entities/user-account.entity";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UserStatusEnum } from "@api/domains/users/user-status.enum";
import type { User } from "@api/domains/users/users.schema";
import { UserService } from "@api/domains/users/users.service";
import type { ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloDriver } from "@nestjs/apollo";
import type { ExecutionContext, INestApplication } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { AuthResolver } from "./auth.resolver";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";

const mockUser: User = {
  id: "user-1",
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

describe("AuthResolver (integration)", () => {
  let app: INestApplication;
  let deactivateUser: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    deactivateUser = vi.fn().mockResolvedValue(undefined);
    const moduleRef = await Test.createTestingModule({
      imports: [GraphQLModule.forRoot<ApolloDriverConfig>({ driver: ApolloDriver, autoSchemaFile: true })],
      providers: [
        AuthResolver,
        { provide: UserService, useValue: { findById: vi.fn().mockResolvedValue(mockUser), deactivateUser } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const gqlCtx = GqlExecutionContext.create(ctx);
          const req = gqlCtx.getContext<{ req: Request & { headers: Record<string, string>; user?: unknown } }>().req;
          if (!req.headers["authorization"]) throw new UnauthorizedException();
          req.user = { userId: mockUser.id };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it("me returns user fields when authenticated", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("Authorization", "Bearer mock-token")
      .send({ query: "{ me { id email name role } }" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.me).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
    });
  });

  it("me returns UNAUTHENTICATED error when no token provided", async () => {
    const res = await request(app.getHttpServer()).post("/graphql").send({ query: "{ me { id email } }" });

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].extensions.code).toBe("UNAUTHENTICATED");
  });

  it("deactivateAccount deactivates the authenticated user", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set("Authorization", "Bearer mock-token")
      .send({ query: "mutation { deactivateAccount }" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.deactivateAccount).toBe(true);
    expect(deactivateUser).toHaveBeenCalledWith(mockUser.id);
  });
});

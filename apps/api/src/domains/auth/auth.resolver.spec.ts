import "reflect-metadata";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { Test } from "@nestjs/testing";
import type { INestApplication, ExecutionContext } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver } from "@nestjs/apollo";
import type { ApolloDriverConfig } from "@nestjs/apollo";
import { GqlExecutionContext } from "@nestjs/graphql";
import request from "supertest";
import { AuthResolver } from "./auth.resolver";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";
import { UserService } from "../users/users.service";
import type { User } from "../users/users.schema";

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

describe("AuthResolver (integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
        }),
      ],
      providers: [
        AuthResolver,
        {
          provide: UserService,
          useValue: { findById: vi.fn().mockResolvedValue(mockUser) },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const gqlCtx = GqlExecutionContext.create(ctx);
          const req = gqlCtx.getContext<{
            req: Request & { headers: Record<string, string>; user?: unknown };
          }>().req;
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
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .send({ query: "{ me { id email } }" });

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].extensions.code).toBe("UNAUTHENTICATED");
  });
});

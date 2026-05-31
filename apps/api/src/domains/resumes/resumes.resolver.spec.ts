import "reflect-metadata";

import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { graphqlFormatError } from "@api/graphql/graphql-format-error";
import type { ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloDriver } from "@nestjs/apollo";
import type { ExecutionContext, INestApplication } from "@nestjs/common";
import { ForbiddenException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { ResumeResolver } from "./resumes.resolver";
import { ResumeService } from "./resumes.service";

describe("ResumeResolver (integration)", () => {
  let app: INestApplication;
  let service: {
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeAll(async () => {
    const mockResume = {
      id: "resume-1",
      userId: "user-1",
      title: "CV",
      content: "{}",
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    service = {
      findAll: vi.fn().mockResolvedValue([mockResume]),
      findOne: vi.fn().mockResolvedValue(mockResume),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
          formatError: graphqlFormatError,
        }),
      ],
      providers: [
        ResumeResolver,
        {
          provide: ResumeService,
          useValue: {
            ...service,
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
          },
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
          req.user = { userId: "user-1" };
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

  const auth = { Authorization: "Bearer mock-token" };

  it("resume maps NotFound to NOT_FOUND", async () => {
    service.findOne.mockRejectedValueOnce(new NotFoundException("Resume r not found"));
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `{ resume(id: "r") { id } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors[0].extensions.code).toBe("NOT_FOUND");
    expect(res.body.errors[0].message).toBe("Resource not found");
  });

  it("resume masks ForbiddenException as NOT_FOUND", async () => {
    service.findOne.mockRejectedValueOnce(new ForbiddenException());
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `{ resume(id: "r") { id } }` });

    expect(res.body.errors[0].extensions.code).toBe("NOT_FOUND");
  });
});

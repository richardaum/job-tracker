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

import { CompaniesResolver } from "./companies.resolver";
import { CompanyService } from "./companies.service";

describe("CompaniesResolver (integration)", () => {
  let app: INestApplication;
  let service: {
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    jobsCount: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeAll(async () => {
    const mockCompany = {
      id: "company-1",
      userId: "user-1",
      name: "Acme",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    service = {
      findAll: vi.fn().mockResolvedValue([mockCompany]),
      findOne: vi.fn().mockResolvedValue(mockCompany),
      jobsCount: vi.fn().mockResolvedValue(0),
      update: vi.fn().mockResolvedValue(mockCompany),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
          formatError: graphqlFormatError,
        }),
      ],
      providers: [CompaniesResolver, { provide: CompanyService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const gqlCtx = GqlExecutionContext.create(ctx);
          const req = gqlCtx.getContext<{ req: Request & { headers: Record<string, string>; user?: unknown } }>().req;
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

  it("company query returns one by id", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `{ company(id: "company-1") { id name } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.company.id).toBe("company-1");
  });

  it("company query maps NotFound to NOT_FOUND without leaking id", async () => {
    service.findOne.mockRejectedValueOnce(new NotFoundException("Company secret-id not found"));
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `{ company(id: "nope") { id } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0].extensions.code).toBe("NOT_FOUND");
    expect(res.body.errors[0].message).toBe("Resource not found");
    expect(res.body.errors[0].message).not.toContain("secret-id");
  });

  it("company query masks ForbiddenException as NOT_FOUND", async () => {
    service.findOne.mockRejectedValueOnce(new ForbiddenException("no"));
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `{ company(id: "c") { id } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors[0].extensions.code).toBe("NOT_FOUND");
    expect(res.body.errors[0].extensions.code).not.toBe("FORBIDDEN");
  });
});

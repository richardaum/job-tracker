import "reflect-metadata";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { Test } from "@nestjs/testing";
import type { INestApplication, ExecutionContext } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver } from "@nestjs/apollo";
import type { ApolloDriverConfig } from "@nestjs/apollo";
import { GqlExecutionContext } from "@nestjs/graphql";
import { UnauthorizedException } from "@nestjs/common";
import request from "supertest";
import { ApplicationResolver } from "./applications.resolver";
import { ApplicationService } from "./applications.service";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import type { Application } from "./applications.schema";

const mockApp: Application = {
  id: "app-1",
  userId: "user-1",
  title: "Software Engineer",
  companyId: "company-1",
  company: {
    id: "company-1",
    userId: "user-1",
    name: "Acme Corp",
    description: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  description: "Frontend role with React",
  url: "https://acme.com",
  salaryMinCents: null,
  salaryMaxCents: null,
  salaryCurrency: null,
  salaryPeriod: null,
  tags: [],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
} as unknown as Application;

describe("ApplicationResolver (integration)", () => {
  let app: INestApplication;
  let service: {
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    createWithAI: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeAll(async () => {
    service = {
      findAll: vi.fn().mockResolvedValue([mockApp]),
      findOne: vi.fn().mockResolvedValue(mockApp),
      create: vi.fn().mockResolvedValue(mockApp),
      createWithAI: vi.fn().mockResolvedValue(mockApp),
      update: vi.fn().mockResolvedValue(mockApp),
      remove: vi.fn().mockResolvedValue(mockApp),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
        }),
      ],
      providers: [
        ApplicationResolver,
        { provide: ApplicationService, useValue: service },
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

  it("applications query returns list", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: "{ applications { id title company { name } } }" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.applications).toHaveLength(1);
    expect(res.body.data.applications[0].title).toBe("Software Engineer");
    expect(res.body.data.applications[0].company.name).toBe("Acme Corp");
  });

  it("applications query accepts company argument", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query:
          '{ applications(company: "Acme Corp") { id title company { name } } }',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.applications).toHaveLength(1);
    expect(service.findAll).toHaveBeenCalledWith(
      "user-1",
      undefined,
      "Acme Corp",
    );
  });

  it("application query returns one by id", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `{ application(id: "app-1") { id title } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.application.id).toBe("app-1");
  });

  it("createApplication mutation creates and returns application", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `mutation {
          createApplication(input: { title: "Engineer", company: "Acme" }) {
            id title company { name }
          }
        }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.createApplication.id).toBe("app-1");
    expect(res.body.data.createApplication.company.name).toBe("Acme Corp");
  });

  it("createApplicationWithAI mutation creates and returns application", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `mutation {
          createApplicationWithAI(
            input: {
              prompt: "Senior React Engineer at Acme"
              fields: [{ label: "Title", metadata: "as field value" }]
            }
          ) {
            id
            title
          }
        }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.createApplicationWithAI.id).toBe("app-1");
  });

  it("updateApplication mutation updates and returns application", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `mutation {
          updateApplication(id: "app-1", input: { title: "Senior Engineer" }) {
            id title
          }
        }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.updateApplication.id).toBe("app-1");
  });

  it("deleteApplication mutation returns true", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `mutation { deleteApplication(id: "app-1") }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.deleteApplication).toBe(true);
  });
});

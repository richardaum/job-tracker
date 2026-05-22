import "reflect-metadata";

import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { graphqlFormatError } from "@api/graphql/graphql-format-error";
import type { ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloDriver } from "@nestjs/apollo";
import type { ExecutionContext, INestApplication } from "@nestjs/common";
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { JobsResolver } from "./jobs.resolver";
import type { Job } from "./jobs.schema";
import { JobsService } from "./jobs.service";
import { SummaryService } from "./summary/summary.service";

const mockJob: Job = {
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
  urls: ["https://acme.com"],
  source: null,
  salaryMinCents: null,
  salaryMaxCents: null,
  salaryCurrency: null,
  salaryPeriod: null,
  tags: [],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
} as unknown as Job;

const mockJobWithFillProcessing = {
  ...mockJob,
  fillMetadata: {
    status: AsyncMetadataStatusEnum.PROCESSING,
    error: null,
    timestamp: new Date("2026-01-02T00:00:00.000Z"),
  },
} as unknown as Job;

describe("JobsResolver (integration)", () => {
  let app: INestApplication;
  let service: {
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    fillJobAutomatically: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    removeStageEvent: ReturnType<typeof vi.fn>;
    generateCompanyDescription: ReturnType<typeof vi.fn>;
  };

  beforeAll(async () => {
    service = {
      findAll: vi.fn().mockResolvedValue([mockJob]),
      findOne: vi.fn().mockResolvedValue(mockJob),
      create: vi.fn().mockResolvedValue(mockJob),
      fillJobAutomatically: vi
        .fn()
        .mockResolvedValue(mockJobWithFillProcessing),
      update: vi.fn().mockResolvedValue(mockJob),
      remove: vi.fn().mockResolvedValue(mockJob),
      removeStageEvent: vi.fn().mockResolvedValue(undefined),
      generateCompanyDescription: vi
        .fn()
        .mockResolvedValue(JSON.stringify({ type: "doc", content: [] })),
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
        JobsResolver,
        { provide: JobsService, useValue: service },
        {
          provide: SummaryService,
          useValue: { generateSummaryForJob: vi.fn() },
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

  it("jobs query returns list", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: "{ jobs { id title company { name } } }" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.jobs).toHaveLength(1);
    expect(res.body.data.jobs[0].title).toBe("Software Engineer");
    expect(res.body.data.jobs[0].company.name).toBe("Acme Corp");
  });

  it("jobs query accepts company argument", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: '{ jobs(company: "Acme Corp") { id title company { name } } }',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.jobs).toHaveLength(1);
    expect(service.findAll).toHaveBeenLastCalledWith(
      "user-1",
      undefined,
      "Acme Corp",
      undefined,
    );
  });

  it("job query returns one by id", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `{ job(id: "app-1") { id title } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.job.id).toBe("app-1");
  });

  it("createJob mutation creates and returns job", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `mutation {
          createJob(input: { title: "Engineer", company: "Acme" }) {
            id title company { name }
          }
        }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.createJob.id).toBe("app-1");
    expect(res.body.data.createJob.company.name).toBe("Acme Corp");
  });

  it("createJob forwards optional htmlContent to service", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `mutation {
          createJob(input: { company: "Acme", htmlContent: "<p>capture</p>" }) {
            id
          }
        }`,
      });

    expect(res.statusCode).toBe(200);
    expect(service.create).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ htmlContent: "<p>capture</p>" }),
    );
  });

  it("fillJobAutomatically mutation delegates to JobsService.fillJobAutomatically", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `mutation {
          fillJobAutomatically(jobId: "app-1") {
            id
            fillMetadata {
              status
            }
          }
        }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.fillJobAutomatically.id).toBe("app-1");
    expect(res.body.data.fillJobAutomatically.fillMetadata.status).toBe(
      "PROCESSING",
    );
    expect(service.fillJobAutomatically).toHaveBeenCalledWith(
      "user-1",
      "app-1",
    );
  });

  it("removed createDraftJob mutation yields GraphQL validation error", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `mutation {
          createDraftJob(input: { title: "x", htmlContent: "<p>h</p>" }) { id }
        }`,
      });

    expect(res.body.errors?.length ?? 0).toBeGreaterThan(0);
  });

  it("updateJob mutation updates and returns job", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `mutation {
          updateJob(id: "app-1", input: { title: "Senior Engineer" }) {
            id title
          }
        }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.updateJob.id).toBe("app-1");
  });

  it("generateCompanyDescription forwards user id and trimmed company name", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query:
          "query ($name: String!) { generateCompanyDescription(companyName: $name) }",
        variables: { name: "  Acme  " },
      });

    expect(res.statusCode).toBe(200);
    expect(service.generateCompanyDescription).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ companyName: "  Acme  " }),
    );
  });

  it("deleteJob mutation returns payload", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: 'mutation { deleteJob(id: "app-1") { success deletedId } }',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.deleteJob).toEqual({
      success: true,
      deletedId: "app-1",
    });
  });

  it("job query maps missing entity to NOT_FOUND without leaking id", async () => {
    service.findOne.mockRejectedValueOnce(
      new NotFoundException(
        "Job 00000000-0000-4000-8000-000000000099 not found",
      ),
    );
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `{ job(id: "missing") { id } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0].extensions.code).toBe("NOT_FOUND");
    expect(res.body.errors[0].message).toBe("Resource not found");
    expect(res.body.errors[0].message).not.toContain("00000000");
    expect(res.body.errors[0].message).not.toContain("missing");
  });

  it("job query masks ForbiddenException as NOT_FOUND", async () => {
    service.findOne.mockRejectedValueOnce(new ForbiddenException("Denied"));
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `{ job(id: "app-x") { id } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0].extensions.code).toBe("NOT_FOUND");
    expect(res.body.errors[0].extensions.code).not.toBe("FORBIDDEN");
    expect(res.body.errors[0].message).toBe("Resource not found");
  });

  it("job query returns null title when underlying job has no title", async () => {
    service.findOne.mockResolvedValueOnce({
      ...mockJob,
      title: null,
    } as unknown as Job);
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `{ job(id: "app-1") { id title } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.job.title).toBeNull();
  });

  it("deleteJobStageEvent mutation returns payload", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query:
          'mutation { deleteJobStageEvent(id: "event-1") { success deletedId } }',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.deleteJobStageEvent).toEqual({
      success: true,
      deletedId: "event-1",
    });
  });
});

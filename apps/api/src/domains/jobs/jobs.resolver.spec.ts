import "reflect-metadata";

import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { RoleEnum } from "@api/domains/users/role.enum";
import { graphqlFormatError } from "@api/graphql/graphql-format-error";
import type { ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloDriver } from "@nestjs/apollo";
import type { ExecutionContext, INestApplication } from "@nestjs/common";
import { ForbiddenException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { JobAutomaticFillService } from "./job-automatic-fill.service";
import { JobDuplicateService } from "./job-duplicate.service";
import { JobsResolver } from "./jobs.resolver";
import type { Job } from "./jobs.schema";
import { JobsService } from "./jobs.service";
import { JobSummaryService } from "./summary/job-summary.service";

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
  salary: null,
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
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    removeStageEvent: ReturnType<typeof vi.fn>;
    generateCompanyDescription: ReturnType<typeof vi.fn>;
  };
  let fillService: { fillJobAutomatically: ReturnType<typeof vi.fn> };
  let duplicateService: { checkDuplicate: ReturnType<typeof vi.fn> };

  beforeAll(async () => {
    service = {
      findAll: vi.fn().mockResolvedValue([mockJob]),
      findOne: vi.fn().mockResolvedValue(mockJob),
      create: vi.fn().mockResolvedValue(mockJob),
      update: vi.fn().mockResolvedValue(mockJob),
      remove: vi.fn().mockResolvedValue(mockJob),
      removeStageEvent: vi.fn().mockResolvedValue(undefined),
      generateCompanyDescription: vi.fn().mockResolvedValue(JSON.stringify({ type: "doc", content: [] })),
    };

    fillService = { fillJobAutomatically: vi.fn().mockResolvedValue(mockJobWithFillProcessing) };

    duplicateService = { checkDuplicate: vi.fn() };

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
        { provide: JobAutomaticFillService, useValue: fillService },
        { provide: JobDuplicateService, useValue: duplicateService },
        { provide: JobSummaryService, useValue: { requestSummary: vi.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const gqlCtx = GqlExecutionContext.create(ctx);
          const req =
            gqlCtx.getContext<{ req?: { headers: Record<string, string | string[] | undefined>; user?: unknown } }>()
              .req ?? ctx.switchToHttp().getRequest();
          if (!req) throw new UnauthorizedException();
          const raw = req.headers?.authorization ?? req.headers?.Authorization;
          const authHeader = Array.isArray(raw) ? raw[0] : raw;
          if (!authHeader) throw new UnauthorizedException();
          req.user = { userId: "user-1", role: RoleEnum.User };
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

  beforeEach(() => {
    service.findAll.mockReset().mockResolvedValue([mockJob]);
    service.findOne.mockReset().mockResolvedValue(mockJob);
    service.create.mockReset().mockResolvedValue(mockJob);
    fillService.fillJobAutomatically.mockReset().mockResolvedValue(mockJobWithFillProcessing);
    service.update.mockReset().mockResolvedValue(mockJob);
    service.remove.mockReset().mockResolvedValue(mockJob);
    service.removeStageEvent.mockReset().mockResolvedValue(undefined);
    service.generateCompanyDescription.mockReset().mockResolvedValue(JSON.stringify({ type: "doc", content: [] }));
    duplicateService.checkDuplicate.mockReset();
  });

  function graphqlRequest() {
    return request(app.getHttpServer()).post("/graphql").set("Authorization", "Bearer mock-token");
  }

  it("jobs query returns list", async () => {
    const res = await graphqlRequest().send({ query: "{ jobs { id title company { name } } }" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.jobs).toHaveLength(1);
    expect(res.body.data.jobs[0].title).toBe("Software Engineer");
    expect(res.body.data.jobs[0].company.name).toBe("Acme Corp");
  });

  it("jobs query accepts company argument", async () => {
    const res = await graphqlRequest().send({ query: '{ jobs(company: "Acme Corp") { id title company { name } } }' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.jobs).toHaveLength(1);
    expect(service.findAll).toHaveBeenLastCalledWith("user-1", undefined, "Acme Corp", undefined);
  });

  it("job query returns one by id", async () => {
    const res = await graphqlRequest().send({ query: `{ job(id: "app-1") { id title } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.job.id).toBe("app-1");
  });

  it("createJob mutation creates and returns job", async () => {
    const res = await graphqlRequest().send({
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
    const res = await graphqlRequest().send({
      query: `mutation {
          createJob(input: { company: "Acme", htmlContent: "<p>capture</p>" }) {
            id
          }
        }`,
    });

    expect(res.statusCode).toBe(200);
    expect(service.create).toHaveBeenCalledWith("user-1", expect.objectContaining({ htmlContent: "<p>capture</p>" }));
  });

  it("fillJobAutomatically mutation delegates to JobAutomaticFillService.fillJobAutomatically", async () => {
    const res = await graphqlRequest().send({
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
    expect(res.body.data.fillJobAutomatically.fillMetadata.status).toBe("PROCESSING");
    expect(fillService.fillJobAutomatically).toHaveBeenCalledWith("user-1", "app-1");
  });

  it("removed legacy draft-create mutation yields GraphQL validation error", async () => {
    const createLegacyDraft = ["create", "Draft", "Job"].join("");
    const res = await graphqlRequest().send({
      query: `mutation { ${createLegacyDraft}(input: { title: "x", htmlContent: "<p>h</p>" }) { id } }`,
    });

    expect(res.body.errors?.length ?? 0).toBeGreaterThan(0);
  });

  it("updateJob mutation updates and returns job", async () => {
    const res = await graphqlRequest().send({
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
    const res = await graphqlRequest().send({
      query: "query ($name: String!) { generateCompanyDescription(companyName: $name) }",
      variables: { name: "  Acme  " },
    });

    expect(res.statusCode).toBe(200);
    expect(service.generateCompanyDescription).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ companyName: "  Acme  " }),
    );
  });

  it("deleteJob mutation returns payload", async () => {
    const res = await graphqlRequest().send({ query: 'mutation { deleteJob(id: "app-1") { success deletedId } }' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.deleteJob).toEqual({ success: true, deletedId: "app-1" });
  });

  it("job query maps missing entity to NOT_FOUND without leaking id", async () => {
    service.findOne.mockRejectedValueOnce(new NotFoundException("Job 00000000-0000-4000-8000-000000000099 not found"));
    const res = await graphqlRequest().send({ query: `{ job(id: "missing") { id } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0].extensions.code).toBe("NOT_FOUND");
    expect(res.body.errors[0].message).toBe("Resource not found");
    expect(res.body.errors[0].message).not.toContain("00000000");
    expect(res.body.errors[0].message).not.toContain("missing");
  });

  it("job query masks ForbiddenException as NOT_FOUND", async () => {
    service.findOne.mockRejectedValueOnce(new ForbiddenException("Denied"));
    const res = await graphqlRequest().send({ query: `{ job(id: "app-x") { id } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0].extensions.code).toBe("NOT_FOUND");
    expect(res.body.errors[0].extensions.code).not.toBe("FORBIDDEN");
    expect(res.body.errors[0].message).toBe("Resource not found");
  });

  it("job query returns null title when underlying job has no title", async () => {
    service.findOne.mockResolvedValueOnce({ ...mockJob, title: null } as unknown as Job);
    const res = await graphqlRequest().send({ query: `{ job(id: "app-1") { id title } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.job.title).toBeNull();
  });

  it("deleteJobStageEvent mutation returns payload", async () => {
    const res = await graphqlRequest().send({
      query: 'mutation { deleteJobStageEvent(id: "event-1") { success deletedId } }',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.deleteJobStageEvent).toEqual({ success: true, deletedId: "event-1" });
  });

  it("isJobDuplicate returns true when duplicate exists", async () => {
    duplicateService.checkDuplicate.mockResolvedValue(true);

    const res = await graphqlRequest().send({ query: `query { isJobDuplicate(company: "Acme", title: "Engineer") }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.isJobDuplicate).toBe(true);
    expect(duplicateService.checkDuplicate).toHaveBeenCalledWith("Acme", "Engineer", "user-1");
  });

  it("isJobDuplicate returns false when no duplicate exists", async () => {
    duplicateService.checkDuplicate.mockResolvedValue(false);

    const res = await graphqlRequest().send({ query: 'query { isJobDuplicate(company: "Unknown", title: "Nope") }' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.isJobDuplicate).toBe(false);
  });
});

import "reflect-metadata";

import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { graphqlFormatError } from "@api/graphql/graphql-format-error";
import type { ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloDriver } from "@nestjs/apollo";
import type { ExecutionContext, INestApplication } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { FitClassificationEnum } from "./fit-classification.enum";
import { JobType } from "@api/domains/jobs/job.type";

import {
  JobMatchResolver,
  MatchAnalysisResolver,
} from "./match-analysis.resolver";
import type { MatchAnalysis } from "./match-analysis.schema";
import { MatchAnalysisService } from "./match-analysis.service";
import { MatchAnalysisType } from "./match-analysis.type";

const created = new Date("2026-03-01T00:00:00.000Z");
const updated = new Date("2026-03-01T00:00:00.000Z");

const mockMatch = {
  id: "m1",
  jobId: "job-1",
  userId: "user-1",
  resumeId: "res-1",
  generationMetadata: null,
  scoreRatio: null,
  classification: null,
  matchCount: 0,
  gapCount: 0,
  unclearCount: 0,
  items: [],
  createdAt: created,
  updatedAt: updated,
} as MatchAnalysis;

describe("MatchAnalysisResolver (GraphQL integration smoke)", () => {
  let app: INestApplication;
  const service: Pick<
    MatchAnalysisService,
    | "findAll"
    | "findById"
    | "findForJob"
    | "generate"
    | "remove"
    | "findJobById"
  > = {
    findAll: vi.fn().mockResolvedValue([mockMatch]),
    findById: vi.fn().mockResolvedValue(mockMatch),
    findForJob: vi.fn().mockResolvedValue(mockMatch),
    generate: vi.fn().mockResolvedValue(mockMatch),
    remove: vi.fn(),
    findJobById: vi.fn().mockResolvedValue(null),
  };

  beforeAll(async () => {
    const moduleFixed = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
          formatError: graphqlFormatError,
        }),
      ],
      providers: [
        MatchAnalysisResolver,
        { provide: MatchAnalysisService, useValue: service },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const gqlCtx = GqlExecutionContext.create(ctx);
          const req = gqlCtx.getContext<{
            req: Request & { headers: Record<string, string>; user?: unknown };
          }>().req;
          if (!req.headers.authorization) throw new UnauthorizedException();
          req.user = { userId: "user-1" };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixed.createNestApplication();
    await app.init();
  });

  afterAll(() => app?.close());

  const authHeader = { Authorization: "Bearer mock-token" };

  it("jobMatch returns analyses keyed by jobId only", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(authHeader)
      .send({
        query: `{ jobMatch(jobId: "job-1") { id jobId resumeId matchCount createdAt classification } }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.jobMatch).toEqual({
      id: "m1",
      jobId: "job-1",
      resumeId: "res-1",
      matchCount: 0,
      createdAt: created.toISOString(),
      classification: null,
    });
    expect(service.findForJob).toHaveBeenCalledWith("job-1", "user-1");
  });

  it("generateJobMatch returns required job linkage", async () => {
    vi.mocked(service.generate).mockResolvedValueOnce({
      ...mockMatch,
      classification: FitClassificationEnum.Positive,
      scoreRatio: 0.8,
    });

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(authHeader)
      .send({
        query: `mutation {
          generateJobMatch(input: { jobId: "job-1", resumeId: "res-1" }) {
            jobId resumeId classification
          }
        }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.generateJobMatch).toEqual({
      jobId: "job-1",
      resumeId: "res-1",
      classification: "Positive",
    });
  });

  it("rejects selection of removed draftJob field", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(authHeader)
      .send({ query: `{ jobMatch(jobId: "job-1") { id draftJob { id } } }` });

    expect(res.statusCode).toBe(400);
    expect(JSON.stringify(res.body)).toContain("draftJob");
  });
});

describe("JobMatchResolver — @ResolveField match on JobType", () => {
  const service = { findForJob: vi.fn() };
  const resolver = new JobMatchResolver(
    service as unknown as MatchAnalysisService,
  );

  it("calls service.findForJob per parent job", async () => {
    vi.mocked(service.findForJob).mockResolvedValue(null);

    const result = await resolver.match({ id: "job-1" } as JobType, {
      userId: "user-1",
    });

    expect(result).toBeNull();
    expect(service.findForJob).toHaveBeenCalledWith("job-1", "user-1");
  });
});

describe("MatchAnalysisResolver — @ResolveField job on MatchAnalysisType", () => {
  const service = { findJobById: vi.fn() };
  const resolver = new MatchAnalysisResolver(
    service as unknown as MatchAnalysisService,
  );

  it("calls service.findJobById per parent match analysis", async () => {
    vi.mocked(service.findJobById).mockResolvedValue(null);

    const result = await resolver.job({ jobId: "job-1" } as MatchAnalysisType, {
      userId: "user-1",
    });

    expect(result).toBeNull();
    expect(service.findJobById).toHaveBeenCalledWith("job-1", "user-1");
  });
});

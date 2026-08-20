import "reflect-metadata";

import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { graphqlFormatError } from "@api/graphql/graphql-format-error";
import type { ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloDriver } from "@nestjs/apollo";
import type { ExecutionContext, INestApplication } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { GqlExecutionContext, GraphQLModule } from "@nestjs/graphql";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { AiUsageResolver } from "./ai-usage.resolver";
import { AiUsageService } from "./ai-usage.service";

describe("AiUsageResolver", () => {
  let app: INestApplication;
  const service = { getSummary: vi.fn() };

  beforeAll(async () => {
    service.getSummary.mockResolvedValue({
      personalKey: { inputTokens: 10, outputTokens: 5, totalTokens: 15, calls: 1 },
      trial: { inputTokens: 0, outputTokens: 0, totalTokens: 0, calls: 0 },
      trialCallsUsed: 4,
      trialCallsLimit: 50,
    });
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
          formatError: graphqlFormatError,
        }),
      ],
      providers: [AiUsageResolver, { provide: AiUsageService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const requestContext = GqlExecutionContext.create(context).getContext<{
            req: Request & { headers: Record<string, string>; user?: unknown };
          }>();
          if (!requestContext.req.headers["authorization"]) throw new UnauthorizedException();
          requestContext.req.user = { userId: "user-1" };
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

  it("returns only the authenticated user's summary", async () => {
    const response = await request(app.getHttpServer())
      .post("/graphql")
      .set({ Authorization: "Bearer mock-token" })
      .send({
        query: `{ aiUsage { personalKey { inputTokens outputTokens totalTokens calls } trial { inputTokens outputTokens totalTokens calls } trialCallsUsed trialCallsLimit } }`,
      });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.aiUsage.personalKey).toEqual({
      inputTokens: 10,
      outputTokens: 5,
      totalTokens: 15,
      calls: 1,
    });
    expect(service.getSummary).toHaveBeenCalledWith("user-1");
  });

  it("rejects an unauthenticated query", async () => {
    const response = await request(app.getHttpServer())
      .post("/graphql")
      .send({ query: `{ aiUsage { trialCallsUsed } }` });

    expect(response.body.data).toBeNull();
    expect(response.body.errors[0].extensions.code).toBe("UNAUTHENTICATED");
  });
});

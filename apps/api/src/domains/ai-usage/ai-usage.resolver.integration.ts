import "reflect-metadata";

import { AiUsageRecordEntity } from "@api/database/entities/ai-usage-record.entity";
import { UserSettingEntity } from "@api/database/entities/user-setting.entity";
import { insertUserWithAuthAccount } from "@api/database/integration-test-user";
import { createTestDataSource } from "@api/database/test-db";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import type { SettingsService } from "@api/domains/settings/settings.service";
import { apiEnv } from "@api/env/server";
import { graphqlFormatError } from "@api/graphql/graphql-format-error";
import type { ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloDriver } from "@nestjs/apollo";
import type { ExecutionContext, INestApplication } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { GqlExecutionContext, GraphQLModule } from "@nestjs/graphql";
import { Test } from "@nestjs/testing";
import request from "supertest";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AiUsageRepository } from "./ai-usage.repository";
import { AiUsageResolver } from "./ai-usage.resolver";
import { AiUsageService } from "./ai-usage.service";
import { AiUsageSourceEnum } from "./ai-usage-source.enum";

const hasDb = !!apiEnv.DATABASE_INTEGRATION_URL;

describe.skipIf(!hasDb)("AiUsageResolver (database integration)", () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userId: string;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    userId = (
      await insertUserWithAuthAccount(dataSource, {
        email: "ai-usage-graphql-owner@example.com",
        name: "AI Usage GraphQL Owner",
        providerAccountId: "ai-usage-graphql-owner",
      })
    ).id;
    const otherUserId = (
      await insertUserWithAuthAccount(dataSource, {
        email: "ai-usage-graphql-other@example.com",
        name: "AI Usage GraphQL Other",
        providerAccountId: "ai-usage-graphql-other",
      })
    ).id;
    await dataSource.getRepository(UserSettingEntity).save({ userId, trialCallsUsed: 6, trialCallsLimit: 40 });

    const repository = new AiUsageRepository(dataSource.getRepository(AiUsageRecordEntity));
    await repository.record(userId, AiUsageSourceEnum.PersonalKey, {
      inputTokens: 12,
      outputTokens: 8,
      totalTokens: 20,
    });
    await repository.record(otherUserId, AiUsageSourceEnum.PersonalKey, {
      inputTokens: 900,
      outputTokens: 100,
      totalTokens: 1000,
    });

    const settingsService = {
      getSettings: (requestedUserId: string) =>
        dataSource.getRepository(UserSettingEntity).findOneByOrFail({ userId: requestedUserId }),
    };
    const service = new AiUsageService(repository, settingsService as SettingsService);
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
          requestContext.req.user = { userId };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await dataSource?.destroy();
  });

  it("returns only the authenticated user's records and existing trial allowance", async () => {
    const response = await request(app.getHttpServer())
      .post("/graphql")
      .set({ Authorization: "Bearer mock-token" })
      .send({
        query: `{ aiUsage { personalKey { inputTokens outputTokens totalTokens calls } trial { totalTokens calls } trialCallsUsed trialCallsLimit } }`,
      });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.aiUsage).toEqual({
      personalKey: { inputTokens: 12, outputTokens: 8, totalTokens: 20, calls: 1 },
      trial: { totalTokens: 0, calls: 0 },
      trialCallsUsed: 6,
      trialCallsLimit: 40,
    });
  });
});

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

import { SettingsResolver } from "./settings.resolver";
import { SettingsService } from "./settings.service";
import { UserSettingFieldsResolver } from "./user-setting.fields.resolver";

describe("SettingsResolver (integration)", () => {
  let app: INestApplication;
  let service: {
    getSettings: ReturnType<typeof vi.fn>;
    updateSettings: ReturnType<typeof vi.fn>;
  };

  beforeAll(async () => {
    const mockSettings = {
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      duplicateWindowDays: 30,
    };

    service = {
      getSettings: vi.fn().mockResolvedValue(mockSettings),
      updateSettings: vi.fn().mockResolvedValue(mockSettings),
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
        SettingsResolver,
        UserSettingFieldsResolver,
        { provide: SettingsService, useValue: service },
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

  it("settings query returns UserSetting for authenticated user", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `{ settings { id userId autoFillEnabled autoSummaryEnabled duplicateWindowDays } }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.settings).toMatchObject({
      id: "user-1",
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      duplicateWindowDays: 30,
    });
    expect(service.getSettings).toHaveBeenCalledWith("user-1");
  });

  it("settings query returns error for unauthenticated request", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .send({ query: `{ settings { userId } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0].extensions.code).toBe("UNAUTHENTICATED");
  });

  it("updateSettings mutation persists changes", async () => {
    service.updateSettings.mockResolvedValue({
      userId: "user-1",
      autoFillEnabled: true,
      autoSummaryEnabled: false,
      duplicateWindowDays: 30,
    });

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `mutation { updateSettings(input: { autoFillEnabled: true }) { userId autoFillEnabled autoSummaryEnabled duplicateWindowDays } }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.updateSettings).toMatchObject({
      autoFillEnabled: true,
      autoSummaryEnabled: false,
      duplicateWindowDays: 30,
    });
    expect(service.updateSettings).toHaveBeenCalledWith("user-1", {
      autoFillEnabled: true,
    });
  });

  it("updateSettings partial update — only changes provided fields", async () => {
    vi.mocked(service.updateSettings).mockClear();
    service.updateSettings.mockResolvedValue({
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: true,
      duplicateWindowDays: 7,
    });

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `mutation { updateSettings(input: { autoSummaryEnabled: true, duplicateWindowDays: 7 }) { userId autoFillEnabled autoSummaryEnabled duplicateWindowDays } }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.updateSettings).toMatchObject({
      autoFillEnabled: false,
      autoSummaryEnabled: true,
      duplicateWindowDays: 7,
    });
    expect(service.updateSettings).toHaveBeenCalledWith("user-1", {
      autoSummaryEnabled: true,
      duplicateWindowDays: 7,
    });
  });
});

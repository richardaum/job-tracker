import "reflect-metadata";

import { UserSettingEntity } from "@api/database/entities/user-setting.entity";
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
    saveOpenAiKey: ReturnType<typeof vi.fn>;
    removeOpenAiKey: ReturnType<typeof vi.fn>;
  };

  beforeAll(async () => {
    const mockSettings = {
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      aiEnabled: true,
      trialCallsUsed: 0,
      trialCallsLimit: 50,
      lastQuickTipId: null,
      dismissedQuickTipIds: [],
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    };

    service = {
      getSettings: vi.fn().mockResolvedValue(mockSettings),
      updateSettings: vi.fn().mockResolvedValue(mockSettings),
      saveOpenAiKey: vi.fn().mockResolvedValue(mockSettings),
      removeOpenAiKey: vi.fn().mockResolvedValue(mockSettings),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
          formatError: graphqlFormatError,
        }),
      ],
      providers: [SettingsResolver, UserSettingFieldsResolver, { provide: SettingsService, useValue: service }],
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

  it("settings query returns UserSetting for authenticated user", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `{ settings { id userId autoFillEnabled autoSummaryEnabled autoMatchEnabled aiEnabled hasOpenAiKey trialCallsUsed trialCallsLimit duplicateWindowDays blockedKeywords { keyword scope matchMode } blockedCompanies } }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.settings).toMatchObject({
      id: "user-1",
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      aiEnabled: true,
      hasOpenAiKey: false,
      trialCallsUsed: 0,
      trialCallsLimit: 50,
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    });
    expect(service.getSettings).toHaveBeenCalledWith("user-1");
  });

  it("settings query exposes persisted quick-tip state", async () => {
    service.getSettings.mockResolvedValue({
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      aiEnabled: true,
      trialCallsUsed: 0,
      trialCallsLimit: 50,
      lastQuickTipId: "paste-to-draft:v1",
      dismissedQuickTipIds: ["extension-import:v1"],
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    });

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `{ settings { lastQuickTipId dismissedQuickTipIds } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.settings).toEqual({
      lastQuickTipId: "paste-to-draft:v1",
      dismissedQuickTipIds: ["extension-import:v1"],
    });
  });

  it("settings query returns error for unauthenticated request", async () => {
    const res = await request(app.getHttpServer()).post("/graphql").send({ query: `{ settings { userId } }` });

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
      aiEnabled: true,
      trialCallsUsed: 0,
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    });

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `mutation { updateSettings(input: { autoFillEnabled: true }) { userId autoFillEnabled autoSummaryEnabled aiEnabled trialCallsUsed duplicateWindowDays blockedKeywords { keyword scope matchMode } blockedCompanies } }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.updateSettings).toMatchObject({
      autoFillEnabled: true,
      autoSummaryEnabled: false,
      aiEnabled: true,
      trialCallsUsed: 0,
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    });
    expect(service.updateSettings).toHaveBeenCalledWith("user-1", { autoFillEnabled: true });
  });

  it("updateSettings partial update — only changes provided fields", async () => {
    vi.mocked(service.updateSettings).mockClear();
    service.updateSettings.mockResolvedValue({
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: true,
      aiEnabled: true,
      trialCallsUsed: 0,
      duplicateWindowDays: 7,
      blockedKeywords: [],
      blockedCompanies: [],
    });

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `mutation { updateSettings(input: { autoSummaryEnabled: true, duplicateWindowDays: 7 }) { userId autoFillEnabled autoSummaryEnabled aiEnabled duplicateWindowDays } }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.updateSettings).toMatchObject({
      autoFillEnabled: false,
      autoSummaryEnabled: true,
      aiEnabled: true,
      duplicateWindowDays: 7,
    });
    expect(service.updateSettings).toHaveBeenCalledWith("user-1", { autoSummaryEnabled: true, duplicateWindowDays: 7 });
  });

  it("updateSettings with aiEnabled: false — updates only that field, leaving other settings untouched", async () => {
    vi.mocked(service.updateSettings).mockClear();
    service.updateSettings.mockResolvedValue({
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      aiEnabled: false,
      trialCallsUsed: 0,
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    });

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `mutation { updateSettings(input: { aiEnabled: false }) { userId autoFillEnabled autoSummaryEnabled autoMatchEnabled aiEnabled duplicateWindowDays } }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.updateSettings).toMatchObject({
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      aiEnabled: false,
      duplicateWindowDays: 30,
    });
    expect(service.updateSettings).toHaveBeenCalledWith("user-1", { aiEnabled: false });
  });

  it("settings query with encrypted key — hasOpenAiKey returns true and raw key is never exposed", async () => {
    const settingsWithKey = {
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      aiEnabled: true,
      trialCallsUsed: 5,
      trialCallsLimit: 50,
      openaiApiKeyEncrypted: "encrypted-base64-string",
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    };

    vi.mocked(service.getSettings).mockResolvedValue(settingsWithKey as unknown as UserSettingEntity);

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `{ settings { userId hasOpenAiKey trialCallsUsed trialCallsLimit } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.settings).toMatchObject({
      userId: "user-1",
      hasOpenAiKey: true,
      trialCallsUsed: 5,
      trialCallsLimit: 50,
    });
    expect(res.body.data.settings.openaiApiKeyEncrypted).toBeUndefined();
  });

  it("saveOpenAiKey mutation with invalid key — returns AI_KEY_INVALID error and does not call service save", async () => {
    const { GraphQLError } = await import("graphql");
    vi.mocked(service.saveOpenAiKey).mockRejectedValueOnce(
      new GraphQLError("The provided OpenAI key is invalid.", { extensions: { code: "AI_KEY_INVALID" } }),
    );

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `mutation { saveOpenAiKey(key: "invalid-key") { userId hasOpenAiKey } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].extensions.code).toBe("AI_KEY_INVALID");
  });

  it("saveOpenAiKey mutation with valid key — persists encrypted key and returns hasOpenAiKey: true", async () => {
    const settingsWithKey = {
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      aiEnabled: true,
      trialCallsUsed: 0,
      openaiApiKeyEncrypted: "encrypted-key",
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    };

    vi.mocked(service.saveOpenAiKey).mockResolvedValue(settingsWithKey as unknown as UserSettingEntity);

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `mutation { saveOpenAiKey(key: "valid-key") { userId hasOpenAiKey aiEnabled } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.saveOpenAiKey).toMatchObject({ userId: "user-1", hasOpenAiKey: true, aiEnabled: true });
    expect(res.body.data.saveOpenAiKey.openaiApiKeyEncrypted).toBeUndefined();
    expect(service.saveOpenAiKey).toHaveBeenCalledWith("user-1", "valid-key");
  });

  it("removeOpenAiKey mutation — clears key and returns hasOpenAiKey: false", async () => {
    const settingsWithoutKey = {
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      aiEnabled: true,
      trialCallsUsed: 5,
      openaiApiKeyEncrypted: null,
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    };

    vi.mocked(service.removeOpenAiKey).mockResolvedValue(settingsWithoutKey as unknown as UserSettingEntity);

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `mutation { removeOpenAiKey { userId hasOpenAiKey trialCallsUsed aiEnabled } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.removeOpenAiKey).toMatchObject({
      userId: "user-1",
      hasOpenAiKey: false,
      trialCallsUsed: 5,
      aiEnabled: true,
    });
    expect(service.removeOpenAiKey).toHaveBeenCalledWith("user-1");
  });

  it("removeOpenAiKey mutation — does not modify aiEnabled or trialCallsUsed", async () => {
    const settingsUnchanged = {
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      aiEnabled: false,
      trialCallsUsed: 50,
      openaiApiKeyEncrypted: null,
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    };

    vi.mocked(service.removeOpenAiKey).mockResolvedValue(settingsUnchanged as unknown as UserSettingEntity);

    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `mutation { removeOpenAiKey { userId aiEnabled trialCallsUsed hasOpenAiKey } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.removeOpenAiKey).toMatchObject({
      userId: "user-1",
      aiEnabled: false,
      trialCallsUsed: 50,
      hasOpenAiKey: false,
    });
  });
});

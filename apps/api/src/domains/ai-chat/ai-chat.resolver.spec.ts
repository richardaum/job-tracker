import "reflect-metadata";

import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import type { ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloDriver } from "@nestjs/apollo";
import type { ExecutionContext, INestApplication } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { AiChatResolver } from "./ai-chat.resolver";
import { AiChatService } from "./ai-chat.service";

const mockConversation = {
  id: "conv-1",
  jobId: "job-1",
  title: "New conversation",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const mockMessage = {
  id: "msg-1",
  conversationId: "conv-1",
  role: "User",
  content: "Hello",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("AiChatResolver (integration)", () => {
  let app: INestApplication;
  let service: {
    createConversation: ReturnType<typeof vi.fn>;
    listConversations: ReturnType<typeof vi.fn>;
    deleteConversation: ReturnType<typeof vi.fn>;
    listMessages: ReturnType<typeof vi.fn>;
    askQuestion: ReturnType<typeof vi.fn>;
  };

  beforeAll(async () => {
    service = {
      createConversation: vi.fn().mockResolvedValue(mockConversation),
      listConversations: vi.fn().mockResolvedValue([mockConversation]),
      deleteConversation: vi.fn().mockResolvedValue({ success: true, deletedId: "conv-1" }),
      listMessages: vi.fn().mockResolvedValue([mockMessage]),
      askQuestion: vi.fn().mockResolvedValue({ success: true }),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [GraphQLModule.forRoot<ApolloDriverConfig>({ driver: ApolloDriver, autoSchemaFile: true })],
      providers: [
        AiChatResolver,
        { provide: AiChatService, useValue: service },
        { provide: "PUB_SUB", useValue: { asyncIterableIterator: vi.fn() } },
      ],
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

  it("createAiConversation mutation creates conversation", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `mutation { createAiConversation(jobId: "job-1") { id jobId title } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.createAiConversation.id).toBe("conv-1");
  });

  it("aiConversations query returns list", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `{ aiConversations(jobId: "job-1") { id jobId title } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.aiConversations).toHaveLength(1);
  });

  it("aiMessages query returns messages", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `{ aiMessages(conversationId: "conv-1") { id role content } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.aiMessages).toHaveLength(1);
  });

  it("deleteAiConversation mutation returns payload", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `mutation { deleteAiConversation(id: "conv-1") { success deletedId } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.deleteAiConversation).toEqual({ success: true, deletedId: "conv-1" });
  });

  it("askAiQuestion mutation returns success", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `mutation { askAiQuestion(conversationId: "conv-1", content: "What is this job?") { success } }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.askAiQuestion).toEqual({ success: true });
    expect(service.askQuestion).toHaveBeenCalledWith("conv-1", "user-1", "What is this job?");
  });

  it("unauthenticated request returns 401", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .send({ query: `{ aiConversations(jobId: "job-1") { id } }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toBe("Unauthorized");
  });
});

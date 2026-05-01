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

import { NoteResolver } from "./notes.resolver";
import type { Note } from "./notes.schema";
import { NoteService } from "./notes.service";

const mockNote: Note = {
  id: "note-1",
  applicationId: "app-1",
  userId: "user-1",
  content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
  revision: 1,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
} as unknown as Note;

describe("NoteResolver (integration)", () => {
  let app: INestApplication;
  let service: {
    listNotes: ReturnType<typeof vi.fn>;
    createNote: ReturnType<typeof vi.fn>;
    updateNote: ReturnType<typeof vi.fn>;
    removeNote: ReturnType<typeof vi.fn>;
    generateNoteWithAI: ReturnType<typeof vi.fn>;
  };

  beforeAll(async () => {
    service = {
      listNotes: vi.fn().mockResolvedValue([mockNote]),
      createNote: vi.fn().mockResolvedValue(mockNote),
      updateNote: vi.fn().mockResolvedValue({ ...mockNote, revision: 2 }),
      removeNote: vi.fn().mockResolvedValue(mockNote),
      generateNoteWithAI: vi
        .fn()
        .mockResolvedValue(
          JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
        ),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
        }),
      ],
      providers: [NoteResolver, { provide: NoteService, useValue: service }],
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

  it("applicationNotes query returns list", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `{ applicationNotes(applicationId: "app-1") { id content revision } }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.applicationNotes).toHaveLength(1);
  });

  it("createApplicationNote mutation returns note", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `mutation {
          createApplicationNote(
            input: { applicationId: "app-1", content: "{\\"type\\":\\"doc\\",\\"content\\":[{\\"type\\":\\"paragraph\\"}]}" }
          ) { id revision }
        }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.createApplicationNote.id).toBe("note-1");
  });

  it("updateApplicationNote mutation returns updated note", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `mutation {
          updateApplicationNote(
            id: "note-1",
            input: { expectedRevision: 1, content: "{\\"type\\":\\"doc\\",\\"content\\":[{\\"type\\":\\"paragraph\\"}]}" }
          ) { id revision }
        }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.updateApplicationNote.revision).toBe(2);
  });

  it("deleteApplicationNote mutation returns true", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({ query: `mutation { deleteApplicationNote(id: "note-1") }` });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.deleteApplicationNote).toBe(true);
  });

  it("generateApplicationNoteWithAI query returns generated content", async () => {
    const res = await request(app.getHttpServer())
      .post("/graphql")
      .set(auth)
      .send({
        query: `query {
          generateApplicationNoteWithAI(applicationId: "app-1", note: "follow up with recruiter") 
        }`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.generateApplicationNoteWithAI).toContain(
      '"type":"doc"',
    );
  });
});

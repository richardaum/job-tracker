import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { ApplicationService } from "./applications.service";
import { ApplicationRepository } from "./applications.repository";
import { Application } from "./applications.schema";
import { Note } from "./application-notes.schema";
import { ApplicationStageEvent } from "./application-stage-events.schema";
import { ApplicationStageEnum } from "./application-stage.enum";
import { CompanyService } from "@api/domains/companies/companies.service";
import { CompensationService } from "./compensation.service";
import { TagService } from "./tag.service";
import { ApplicationAiService } from "@api/domains/application-ai/application-ai.service";

const makeApp = (overrides: Partial<Application> = {}): Application =>
  ({
    id: "app-1",
    userId: "user-1",
    title: "Engineer",
    companyId: "company-1",
    company: {
      id: "company-1",
      name: "Acme",
      userId: "user-1",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    description: null,
    url: null,
    salaryMinCents: null,
    salaryMaxCents: null,
    salaryCurrency: null,
    salaryPeriod: null,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as unknown as Application;

const makeEvent = (
  overrides: Partial<ApplicationStageEvent> = {},
): ApplicationStageEvent =>
  ({
    id: "event-1",
    applicationId: "app-1",
    userId: "user-1",
    fromStage: null,
    toStage: "new",
    source: "manual",
    reason: null,
    createdAt: new Date("2026-01-02"),
    ...overrides,
    scheduledAt: overrides.scheduledAt ?? null,
  }) as unknown as ApplicationStageEvent;

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  id: "note-1",
  applicationId: "app-1",
  userId: "user-1",
  content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
  revision: 1,
  createdAt: new Date("2026-01-02"),
  updatedAt: new Date("2026-01-02"),
  ...overrides,
});

describe("ApplicationService", () => {
  let service: ApplicationService;
  let repo: ApplicationRepository;
  let companyService: CompanyService;
  let compensationService: CompensationService;
  let tagService: TagService;
  let applicationAiService: ApplicationAiService;

  beforeEach(() => {
    repo = {
      findAllByUserId: vi.fn(),
      findOneByIdAndUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findStageEventsByApplicationIdAndUserId: vi.fn(),
      findLatestStageEventByApplicationIdAndUserId: vi.fn(),
      findStageEventByIdAndUserId: vi.fn(),
      createStageEvent: vi.fn(),
      updateStageEvent: vi.fn(),
      findNotesByApplicationIdAndUserId: vi.fn(),
      findNoteByIdAndUserId: vi.fn(),
      createNote: vi.fn(),
      updateNoteWithRevision: vi.fn(),
      deleteNote: vi.fn(),
    } as unknown as ApplicationRepository;

    companyService = {
      findOne: vi.fn(),
      findOrCreateByName: vi.fn(),
      update: vi.fn(),
    } as unknown as CompanyService;

    compensationService = new CompensationService();
    tagService = new TagService();
    applicationAiService = {
      generateDraft: vi.fn(),
    } as unknown as ApplicationAiService;

    service = new ApplicationService(
      repo,
      companyService,
      compensationService,
      tagService,
      applicationAiService,
    );
  });

  it("findAll delegates to repo", async () => {
    vi.mocked(repo.findAllByUserId).mockResolvedValue([makeApp()]);
    const result = await service.findAll("user-1");
    expect(result).toHaveLength(1);
    expect(repo.findAllByUserId).toHaveBeenCalledWith("user-1", undefined);
  });

  it("findOne returns application when found", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(makeApp());
    const result = await service.findOne("app-1", "user-1");
    expect(result.id).toBe("app-1");
  });

  it("findOne throws NotFoundException when not found", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(null);
    await expect(service.findOne("app-1", "user-1")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("create persists application and emits initial New stage event", async () => {
    const app = makeApp();
    vi.mocked(companyService.findOrCreateByName).mockResolvedValue(app.company);
    vi.mocked(repo.create).mockResolvedValue(app);
    vi.mocked(repo.createStageEvent).mockResolvedValue(
      makeEvent({ toStage: "new", source: "system" }),
    );
    const result = await service.create("user-1", {
      title: "Engineer",
      company: "Acme",
      description: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "React role" }],
          },
        ],
      }),
    });
    expect(result).toBe(app);
    expect(companyService.findOrCreateByName).toHaveBeenCalledWith(
      "user-1",
      "Acme",
    );
    expect(repo.createStageEvent).toHaveBeenCalledWith("user-1", app.id, {
      fromStage: null,
      toStage: "new",
      source: "system",
      reason: null,
      scheduledAt: null,
    });
  });

  it("update throws NotFoundException when application not found", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(null);
    await expect(
      service.update("app-1", "user-1", { title: "X" }),
    ).rejects.toThrow(NotFoundException);
  });

  it("create throws for invalid TipTap description JSON", async () => {
    await expect(
      service.create("user-1", {
        title: "Engineer",
        company: "Acme",
        description: "plain text",
      }),
    ).rejects.toThrow("description must be valid TipTap document JSON");
  });

  it("createWithAI persists application and note from generated draft", async () => {
    const app = makeApp();
    vi.mocked(applicationAiService.generateDraft).mockResolvedValue({
      title: "Engineer",
      company: "Acme",
      description: JSON.stringify({ type: "doc", content: [] }),
      url: "https://acme.com/jobs/1",
      salaryMinCents: null,
      salaryMaxCents: null,
      salaryCurrency: null,
      salaryPeriod: null,
      tags: ["React"],
      noteContents: [
        JSON.stringify({ type: "doc", content: [] }),
        JSON.stringify({
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Second note" }],
            },
          ],
        }),
      ],
    });
    vi.mocked(companyService.findOrCreateByName).mockResolvedValue(app.company);
    vi.mocked(repo.create).mockResolvedValue(app);
    vi.mocked(repo.createStageEvent).mockResolvedValue(
      makeEvent({ toStage: "new", source: "system" }),
    );
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(app);
    vi.mocked(repo.createNote).mockResolvedValue(makeNote());

    const result = await service.createWithAI("user-1", {
      prompt: "Senior React Engineer",
      tags: [{ label: "Title", metadata: "as field value" }],
    });

    expect(result.id).toBe("app-1");
    expect(applicationAiService.generateDraft).toHaveBeenCalledWith({
      prompt: "Senior React Engineer",
      tags: [{ label: "Title", metadata: "as field value" }],
    });
    expect(repo.createNote).toHaveBeenCalledTimes(2);
  });

  it("update throws for invalid TipTap description JSON", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(makeApp());

    await expect(
      service.update("app-1", "user-1", {
        description: "plain text",
      }),
    ).rejects.toThrow("description must be valid TipTap document JSON");
  });

  it("createNote throws for invalid TipTap note JSON", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(makeApp());

    await expect(
      service.createNote("user-1", {
        applicationId: "app-1",
        content: "plain text",
      }),
    ).rejects.toThrow("content must be valid TipTap document JSON");
  });

  it("remove throws NotFoundException when application not found", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(null);
    await expect(service.remove("app-1", "user-1")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("listStageEvents returns ordered events for owned application", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(makeApp());
    vi.mocked(repo.findStageEventsByApplicationIdAndUserId).mockResolvedValue([
      makeEvent(),
    ]);

    const events = await service.listStageEvents("app-1", "user-1");
    expect(events).toHaveLength(1);
    expect(events[0].toStage).toBe("new");
  });

  it("createStageEvent uses previous stage as fromStage", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(makeApp());
    vi.mocked(
      repo.findLatestStageEventByApplicationIdAndUserId,
    ).mockResolvedValue(makeEvent({ toStage: "technical" }));
    vi.mocked(repo.createStageEvent).mockResolvedValue(
      makeEvent({ fromStage: "technical", toStage: "offer" }),
    );

    const created = await service.createStageEvent("user-1", {
      applicationId: "app-1",
      toStage: ApplicationStageEnum.OFFER,
    });

    expect(created.fromStage).toBe("technical");
    expect(repo.createStageEvent).toHaveBeenCalledWith("user-1", "app-1", {
      fromStage: "technical",
      toStage: "offer",
      source: "manual",
      reason: null,
      scheduledAt: null,
    });
  });

  it("updateStageEvent updates existing event", async () => {
    vi.mocked(repo.findStageEventByIdAndUserId).mockResolvedValue(makeEvent());
    vi.mocked(repo.updateStageEvent).mockResolvedValue(
      makeEvent({ toStage: "technical" }),
    );

    const updated = await service.updateStageEvent("event-1", "user-1", {
      toStage: ApplicationStageEnum.TECHNICAL,
      scheduledAt: null,
    });

    expect(updated.toStage).toBe("technical");
    expect(repo.updateStageEvent).toHaveBeenCalledWith("event-1", "user-1", {
      toStage: "technical",
      reason: undefined,
      scheduledAt: null,
    });
  });

  it("updateNote throws ConflictException for stale revision", async () => {
    vi.mocked(repo.findNoteByIdAndUserId).mockResolvedValue(makeNote());
    vi.mocked(repo.updateNoteWithRevision).mockResolvedValue(null);

    await expect(
      service.updateNote("note-1", "user-1", {
        content: JSON.stringify({
          type: "doc",
          content: [{ type: "paragraph" }],
        }),
        expectedRevision: 1,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it("createNote throws when application is not found", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(null);

    await expect(
      service.createNote("user-1", {
        applicationId: "app-1",
        content: JSON.stringify({
          type: "doc",
          content: [{ type: "paragraph" }],
        }),
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it("removeNote throws NotFoundException when note is not found", async () => {
    vi.mocked(repo.findNoteByIdAndUserId).mockResolvedValue(null);

    await expect(service.removeNote("note-1", "user-1")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("removeNote deletes an existing note", async () => {
    vi.mocked(repo.findNoteByIdAndUserId).mockResolvedValue(makeNote());
    vi.mocked(repo.deleteNote).mockResolvedValue(makeNote());

    const deleted = await service.removeNote("note-1", "user-1");
    expect(deleted.id).toBe("note-1");
    expect(repo.deleteNote).toHaveBeenCalledWith("note-1", "user-1");
  });

  it("removeNote throws NotFoundException when deleteNote returns null", async () => {
    vi.mocked(repo.findNoteByIdAndUserId).mockResolvedValue(makeNote());
    vi.mocked(repo.deleteNote).mockResolvedValue(null);

    await expect(service.removeNote("note-1", "user-1")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("updateNote throws BadRequestException for invalid TipTap content", async () => {
    vi.mocked(repo.findNoteByIdAndUserId).mockResolvedValue(makeNote());

    await expect(
      service.updateNote("note-1", "user-1", {
        content: "plain text",
        expectedRevision: 1,
      }),
    ).rejects.toThrow("content must be valid TipTap document JSON");
  });

  it("updateNote returns updated note on success", async () => {
    const updated = makeNote({
      content: JSON.stringify({ type: "doc", content: [] }),
    });
    vi.mocked(repo.findNoteByIdAndUserId).mockResolvedValue(makeNote());
    vi.mocked(repo.updateNoteWithRevision).mockResolvedValue(updated);

    const result = await service.updateNote("note-1", "user-1", {
      content: JSON.stringify({ type: "doc", content: [] }),
      expectedRevision: 1,
    });
    expect(result.id).toBe("note-1");
  });

  it("removeTag removes matching tag and updates application", async () => {
    const app = makeApp({ tags: ["react", "typescript"] });
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(app);
    vi.mocked(repo.update).mockResolvedValue(makeApp({ tags: ["typescript"] }));

    const result = await service.removeTag("app-1", "user-1", "react");
    expect(result.tags).toEqual(["typescript"]);
    expect(repo.update).toHaveBeenCalledWith("app-1", "user-1", {
      tags: ["typescript"],
    });
  });

  it("removeTag is case-insensitive", async () => {
    const app = makeApp({ tags: ["React"] });
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(app);
    vi.mocked(repo.update).mockResolvedValue(makeApp({ tags: [] }));

    await service.removeTag("app-1", "user-1", "react");
    expect(repo.update).toHaveBeenCalledWith("app-1", "user-1", { tags: [] });
  });

  it("removeTag throws NotFoundException when update returns null", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(
      makeApp({ tags: ["react"] }),
    );
    vi.mocked(repo.update).mockResolvedValue(null);

    await expect(service.removeTag("app-1", "user-1", "react")).rejects.toThrow(
      NotFoundException,
    );
  });
});

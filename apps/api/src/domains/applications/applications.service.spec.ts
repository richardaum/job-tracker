import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { ApplicationService } from "./applications.service";
import { ApplicationRepository } from "./applications.repository";
import { Application } from "./applications.schema";
import { Note } from "./application-notes.schema";
import { ApplicationStageEvent } from "./application-stage-events.schema";
import { ApplicationStageEnum } from "./application-stage.enum";

const makeApp = (overrides: Partial<Application> = {}): Application => ({
  id: "app-1",
  userId: "user-1",
  title: "Engineer",
  company: "Acme",
  description: null,
  url: null,
  salaryMinCents: null,
  salaryMaxCents: null,
  salaryCurrency: null,
  salaryPeriod: null,
  salaryTags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeEvent = (
  overrides: Partial<ApplicationStageEvent> = {},
): ApplicationStageEvent => ({
  id: "event-1",
  applicationId: "app-1",
  userId: "user-1",
  fromStage: null,
  toStage: "new",
  source: "manual",
  createdAt: new Date("2026-01-02"),
  ...overrides,
  scheduledAt: overrides.scheduledAt ?? null,
});

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
    service = new ApplicationService(repo);
  });

  it("findAll delegates to repo", async () => {
    vi.mocked(repo.findAllByUserId).mockResolvedValue([makeApp()]);
    const result = await service.findAll("user-1");
    expect(result).toHaveLength(1);
    expect(repo.findAllByUserId).toHaveBeenCalledWith("user-1");
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
    expect(repo.createStageEvent).toHaveBeenCalledWith("user-1", app.id, {
      fromStage: null,
      toStage: "new",
      source: "system",
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
});

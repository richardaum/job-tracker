import { JobEventBus } from "@api/domains/jobs/job-event.bus";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NoteGenerationService } from "./ai/note-generation.service";
import { NoteRepository } from "./notes.repository";
import type { Note } from "./notes.schema";
import { NoteService } from "./notes.service";

const makeNote = (overrides: Partial<Note> = {}): Note =>
  ({
    id: "note-1",
    jobId: "app-1",
    userId: "user-1",
    content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
    revision: 1,
    createdAt: new Date("2026-01-02"),
    updatedAt: new Date("2026-01-02"),
    ...overrides,
  }) as Note;

describe("NoteService", () => {
  let service: NoteService;
  let repo: NoteRepository;
  let noteAiService: NoteGenerationService;
  let eventBus: JobEventBus;

  beforeEach(() => {
    repo = {
      hasJob: vi.fn(),
      findApplicationByIdAndUserId: vi.fn(),
      findByJobIdAndUserId: vi.fn(),
      findByIdAndUserId: vi.fn(),
      create: vi.fn(),
      updateWithRevision: vi.fn(),
      delete: vi.fn(),
    } as unknown as NoteRepository;

    noteAiService = { generateNote: vi.fn() } as unknown as NoteGenerationService;
    eventBus = { emit: vi.fn() } as unknown as JobEventBus;
    service = new NoteService(repo, noteAiService, eventBus);
  });

  it("listNotes throws when job is not found", async () => {
    vi.mocked(repo.hasJob).mockResolvedValue(false);

    await expect(service.listNotes("app-1", "user-1")).rejects.toThrow(NotFoundException);
  });

  it("listNotes returns notes for owned job", async () => {
    vi.mocked(repo.hasJob).mockResolvedValue(true);
    vi.mocked(repo.findByJobIdAndUserId).mockResolvedValue([makeNote()]);

    const notes = await service.listNotes("app-1", "user-1");
    expect(notes).toHaveLength(1);
  });

  it("createNote validates TipTap JSON", async () => {
    await expect(service.createNote("user-1", { jobId: "app-1", content: "plain text" })).rejects.toThrow(
      BadRequestException,
    );
  });

  it("createNote throws when job does not exist", async () => {
    vi.mocked(repo.hasJob).mockResolvedValue(false);

    await expect(
      service.createNote("user-1", {
        jobId: "app-1",
        content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it("createNote creates note when valid", async () => {
    vi.mocked(repo.hasJob).mockResolvedValue(true);
    vi.mocked(repo.create).mockResolvedValue(makeNote());

    const created = await service.createNote("user-1", {
      jobId: "app-1",
      content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
    });

    expect(created.id).toBe("note-1");
    expect(repo.create).toHaveBeenCalledOnce();
  });

  describe("createPlainTextNote", () => {
    const plainContent = 'Auto-rejected by keyword blocker: keyword "test" matched in TITLE';

    it("creates note successfully with plain text", async () => {
      vi.mocked(repo.hasJob).mockResolvedValue(true);
      vi.mocked(repo.create).mockResolvedValue(makeNote({ content: plainContent }));

      const note = await service.createPlainTextNote("user-1", { jobId: "app-1", content: plainContent });

      expect(note.content).toBe(plainContent);
      expect(repo.hasJob).toHaveBeenCalledWith("app-1", "user-1");
      expect(repo.create).toHaveBeenCalledWith("user-1", { jobId: "app-1", content: plainContent });
    });

    it("throws BadRequestException when job does not exist", async () => {
      vi.mocked(repo.hasJob).mockResolvedValue(false);

      await expect(service.createPlainTextNote("user-1", { jobId: "app-1", content: plainContent })).rejects.toThrow(
        BadRequestException,
      );
    });

    it("emits JobUpdated event on successful creation", async () => {
      vi.mocked(repo.hasJob).mockResolvedValue(true);
      vi.mocked(repo.create).mockResolvedValue(makeNote({ content: plainContent }));

      await service.createPlainTextNote("user-1", { jobId: "app-1", content: plainContent });

      expect(eventBus.emit).toHaveBeenCalledWith(expect.objectContaining({ jobId: "app-1" }));
    });

    it("does not validate TipTap content", async () => {
      vi.mocked(repo.hasJob).mockResolvedValue(true);
      vi.mocked(repo.create).mockResolvedValue(makeNote({ content: "plain text without tiptap structure" }));

      const note = await service.createPlainTextNote("user-1", {
        jobId: "app-1",
        content: "plain text without tiptap structure",
      });

      expect(note.content).toBe("plain text without tiptap structure");
    });
  });

  it("updateNote throws when note is not found", async () => {
    vi.mocked(repo.findByIdAndUserId).mockResolvedValue(null);

    await expect(service.updateNote("note-1", "user-1", { expectedRevision: 1 })).rejects.toThrow(NotFoundException);
  });

  it("updateNote validates TipTap JSON", async () => {
    vi.mocked(repo.findByIdAndUserId).mockResolvedValue(makeNote());

    await expect(
      service.updateNote("note-1", "user-1", { expectedRevision: 1, content: "plain text" }),
    ).rejects.toThrow(BadRequestException);
  });

  it("updateNote throws on revision mismatch", async () => {
    vi.mocked(repo.findByIdAndUserId).mockResolvedValue(makeNote());
    vi.mocked(repo.updateWithRevision).mockResolvedValue(null);

    await expect(
      service.updateNote("note-1", "user-1", {
        expectedRevision: 1,
        content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
      }),
    ).rejects.toThrow(ConflictException);
  });

  it("updateNote updates successfully", async () => {
    vi.mocked(repo.findByIdAndUserId).mockResolvedValue(makeNote());
    vi.mocked(repo.updateWithRevision).mockResolvedValue(makeNote({ revision: 2 }));

    const updated = await service.updateNote("note-1", "user-1", {
      expectedRevision: 1,
      content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
    });

    expect(updated.revision).toBe(2);
  });

  it("removeNote throws when note is missing", async () => {
    vi.mocked(repo.findByIdAndUserId).mockResolvedValue(null);

    await expect(service.removeNote("note-1", "user-1")).rejects.toThrow(NotFoundException);
  });

  it("removeNote deletes note when present", async () => {
    vi.mocked(repo.findByIdAndUserId).mockResolvedValue(makeNote());
    vi.mocked(repo.delete).mockResolvedValue(makeNote());

    const deleted = await service.removeNote("note-1", "user-1");
    expect(deleted.id).toBe("note-1");
  });

  it("generateNoteWithAI throws when job is not found", async () => {
    vi.mocked(repo.findApplicationByIdAndUserId).mockResolvedValue(null);

    await expect(service.generateNoteWithAI("user-1", "app-1", "draft note")).rejects.toThrow(NotFoundException);
  });

  it("generateNoteWithAI returns tiptap JSON string", async () => {
    vi.mocked(repo.findApplicationByIdAndUserId).mockResolvedValue({
      id: "app-1",
      userId: "user-1",
      title: "Engineer",
      description: "React role",
      company: { name: "Acme" },
    } as never);
    vi.mocked(noteAiService.generateNote).mockResolvedValue({ type: "doc", content: [{ type: "paragraph" }] });

    const result = await service.generateNoteWithAI("user-1", "app-1", "draft note");

    expect(result).toContain('"type":"doc"');
  });
});

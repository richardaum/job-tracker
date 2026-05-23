import { JobNoteEntity } from "@api/database/entities/job-note.entity";
import { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";
import {
  SummaryGenerationRequested,
  SummaryStatusChanged,
} from "@api/domains/jobs/job.events";
import { JobAsyncMetadataRepository } from "@api/domains/jobs/job-async-metadata.repository";
import { JobEventBus } from "@api/domains/jobs/job-event.bus";
import { ApplicationStageEnum } from "@api/domains/jobs/job-stage.enum";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { htmlToPlainText } from "@api/domains/shared/html-plain-text.util";
import { tipTapToPlainText } from "@job-tracker/tiptap";
import { Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SummaryService } from "./summary.service";
import { SummaryAiService } from "./summary-ai.service";

const TIPTAP_HELLO = JSON.stringify({
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "Hello JD" }] },
  ],
});

describe("SummaryService", () => {
  let service: SummaryService;
  let appRepo: Pick<JobsRepository, "findOneByIdAndUserId" | "updateSummary">;
  let asyncMetadataRepo: Pick<JobAsyncMetadataRepository, "updateCas">;
  let summaryAiService: Pick<SummaryAiService, "generateSummary">;
  let eventBus: Pick<JobEventBus, "emit">;
  /** Shared chain returned by `stageEventsRepo.createQueryBuilder("e")`. */
  let stageTimelineQb: {
    where: ReturnType<typeof vi.fn>;
    orderBy: ReturnType<typeof vi.fn>;
    addOrderBy: ReturnType<typeof vi.fn>;
    getMany: ReturnType<typeof vi.fn>;
  };
  let stageEventsRepo: Pick<
    Repository<JobStageEventEntity>,
    "createQueryBuilder"
  >;
  let notesRepo: Pick<Repository<JobNoteEntity>, "find">;

  beforeEach(() => {
    appRepo = { findOneByIdAndUserId: vi.fn(), updateSummary: vi.fn() };

    asyncMetadataRepo = { updateCas: vi.fn() };

    summaryAiService = { generateSummary: vi.fn() };

    eventBus = { emit: vi.fn() };

    notesRepo = { find: vi.fn().mockResolvedValue([]) };

    stageTimelineQb = {
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      addOrderBy: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue([]),
    };

    stageEventsRepo = {
      createQueryBuilder: vi.fn(() => stageTimelineQb),
    } as unknown as Pick<Repository<JobStageEventEntity>, "createQueryBuilder">;

    service = new SummaryService(
      summaryAiService as SummaryAiService,
      eventBus as JobEventBus,
      appRepo as JobsRepository,
      asyncMetadataRepo as JobAsyncMetadataRepository,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
      notesRepo as Repository<JobNoteEntity>,
    );
  });

  it("generateSummary skips when job is missing", async () => {
    vi.mocked(appRepo.findOneByIdAndUserId).mockResolvedValue(null);

    await service.generateSummary("job-1", "user-1");

    expect(asyncMetadataRepo.updateCas).not.toHaveBeenCalled();
    expect(eventBus.emit).not.toHaveBeenCalled();
  });

  it("generateSummary skips when summary is already PROCESSING", async () => {
    vi.mocked(appRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-1",
      title: "T",
      summaryMetadata: {
        status: AsyncMetadataStatusEnum.PROCESSING,
        error: null,
        timestamp: null,
      },
    } as never);

    await service.generateSummary("job-1", "user-1");

    expect(asyncMetadataRepo.updateCas).not.toHaveBeenCalled();
  });

  it("generateSummary transitions metadata to PROCESSING and emits events on success", async () => {
    vi.mocked(appRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-1",
      title: "T",
      company: { name: "Co" },
      description: TIPTAP_HELLO,
      summaryMetadata: null,
    } as never);
    vi.mocked(asyncMetadataRepo.updateCas).mockResolvedValueOnce(true);

    await service.generateSummary("job-1", "user-1");

    expect(asyncMetadataRepo.updateCas).toHaveBeenCalledWith(
      "summary",
      "job-1",
      "user-1",
      null,
      { status: AsyncMetadataStatusEnum.PROCESSING },
    );

    expect(eventBus.emit).toHaveBeenCalledWith(
      expect.any(SummaryStatusChanged),
    );
    expect(eventBus.emit).toHaveBeenCalledWith(
      expect.any(SummaryGenerationRequested),
    );
  });

  it("generateSummary exits quietly when optimistic update fails", async () => {
    vi.mocked(appRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-1",
      title: "T",
      description: TIPTAP_HELLO,
      summaryMetadata: null,
    } as never);
    vi.mocked(asyncMetadataRepo.updateCas).mockResolvedValue(false);

    await service.generateSummary("job-1", "user-1");

    expect(eventBus.emit).not.toHaveBeenCalled();
  });

  it("doGenerate completes summary metadata and persists TipTap JSON (from AI markdown via markdownToTipTap)", async () => {
    vi.mocked(appRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-1",
      title: "Role",
      company: { name: "Globex" },
      description: TIPTAP_HELLO,
      tags: ["python"],
      location: null,
      workRegion: null,
      source: null,
      salary: null,
      summaryMetadata: { status: AsyncMetadataStatusEnum.PROCESSING },
    } as never);
    vi.mocked(summaryAiService.generateSummary).mockResolvedValue(
      "# Summary md",
    );
    vi.mocked(asyncMetadataRepo.updateCas).mockResolvedValue(true);
    vi.mocked(appRepo.updateSummary).mockResolvedValue(true);

    await service.doGenerate("job-1", "user-1");

    expect(stageTimelineQb.orderBy).toHaveBeenCalledWith(
      "COALESCE(e.schedule_at, e.created_at)",
      "DESC",
    );
    expect(stageTimelineQb.addOrderBy).toHaveBeenNthCalledWith(
      1,
      "e.created_at",
      "DESC",
    );
    expect(stageTimelineQb.addOrderBy).toHaveBeenNthCalledWith(
      2,
      "e.id",
      "DESC",
    );

    expect(summaryAiService.generateSummary).toHaveBeenCalled();

    const prompt =
      vi.mocked(summaryAiService.generateSummary).mock.calls[0]?.[0] ?? "";
    expect(prompt).toContain(tipTapToPlainText(TIPTAP_HELLO));

    expect(asyncMetadataRepo.updateCas).toHaveBeenCalledWith(
      "summary",
      "job-1",
      "user-1",
      { status: AsyncMetadataStatusEnum.PROCESSING },
      expect.objectContaining({ status: AsyncMetadataStatusEnum.COMPLETED }),
    );

    expect(appRepo.updateSummary).toHaveBeenCalledWith(
      "job-1",
      expect.any(String),
      "user-1",
    );

    expect(eventBus.emit).toHaveBeenCalledWith(
      expect.any(SummaryStatusChanged),
    );
  });

  it("doGenerate without description omits Description when no posting HTML", async () => {
    vi.mocked(appRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-1",
      title: "Role",
      company: null,
      description: null,
      htmlContent: null,
      tags: [],
      salary: null,
      location: null,
      workRegion: null,
      source: null,
      summaryMetadata: { status: AsyncMetadataStatusEnum.PROCESSING },
    } as never);
    vi.mocked(summaryAiService.generateSummary).mockResolvedValue("x");
    vi.mocked(asyncMetadataRepo.updateCas).mockResolvedValue(true);
    vi.mocked(appRepo.updateSummary).mockResolvedValue(true);

    await service.doGenerate("job-1", "user-1");

    expect(summaryAiService.generateSummary).toHaveBeenCalled();
    expect(
      vi.mocked(summaryAiService.generateSummary).mock.calls[0][0],
    ).not.toMatch(/^Description:/m);
  });

  it("doGenerate includes posting body from htmlContent when description is empty", async () => {
    const html = "<p>Hello <strong>World</strong></p>";
    vi.mocked(appRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-1",
      title: "Role",
      company: null,
      description: null,
      htmlContent: html,
      tags: [],
      salary: null,
      location: null,
      workRegion: null,
      source: null,
      summaryMetadata: { status: AsyncMetadataStatusEnum.PROCESSING },
    } as never);
    vi.mocked(summaryAiService.generateSummary).mockResolvedValue("ok");
    vi.mocked(asyncMetadataRepo.updateCas).mockResolvedValue(true);
    vi.mocked(appRepo.updateSummary).mockResolvedValue(true);

    await service.doGenerate("job-1", "user-1");

    const ctx =
      vi.mocked(summaryAiService.generateSummary).mock.calls[0][0] ?? "";
    expect(ctx).toContain("Description:");
    expect(ctx).toContain(htmlToPlainText(html));
  });

  it("doGenerate prefers posting HTML plain text over TipTap description when both exist", async () => {
    vi.mocked(appRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-1",
      title: "Role",
      company: null,
      description: TIPTAP_HELLO,
      htmlContent: "<p>Rust backend focus</p>",
      tags: [],
      salary: null,
      location: null,
      workRegion: null,
      source: null,
      summaryMetadata: { status: AsyncMetadataStatusEnum.PROCESSING },
    } as never);
    vi.mocked(summaryAiService.generateSummary).mockResolvedValue("ok");
    vi.mocked(asyncMetadataRepo.updateCas).mockResolvedValue(true);
    vi.mocked(appRepo.updateSummary).mockResolvedValue(true);

    await service.doGenerate("job-1", "user-1");

    const ctx =
      vi.mocked(summaryAiService.generateSummary).mock.calls[0][0] ?? "";
    expect(ctx).toContain(htmlToPlainText("<p>Rust backend focus</p>"));
    expect(ctx).not.toContain(tipTapToPlainText(TIPTAP_HELLO));
  });

  it("doGenerate with empty strings still completes when AI succeeds", async () => {
    vi.mocked(appRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-1",
      title: " ",
      company: undefined,
      description: null,
      tags: [],
      summaryMetadata: { status: AsyncMetadataStatusEnum.PROCESSING },
    } as never);
    vi.mocked(summaryAiService.generateSummary).mockResolvedValue("ok");
    vi.mocked(asyncMetadataRepo.updateCas).mockResolvedValue(true);
    vi.mocked(appRepo.updateSummary).mockResolvedValue(true);

    await service.doGenerate("job-1", "user-1");

    expect(summaryAiService.generateSummary).toHaveBeenCalled();
    expect(asyncMetadataRepo.updateCas).toHaveBeenCalledWith(
      "summary",
      "job-1",
      "user-1",
      { status: AsyncMetadataStatusEnum.PROCESSING },
      expect.objectContaining({ status: AsyncMetadataStatusEnum.COMPLETED }),
    );
  });

  it("doGenerate sets FAILED summary metadata when AI throws", async () => {
    vi.mocked(appRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-1",
      title: "Role",
      company: null,
      description: TIPTAP_HELLO,
      summaryMetadata: { status: AsyncMetadataStatusEnum.PROCESSING },
    } as never);
    vi.mocked(summaryAiService.generateSummary).mockRejectedValue(
      new Error("quota exceeded"),
    );
    vi.mocked(asyncMetadataRepo.updateCas).mockResolvedValue(true);

    await service.doGenerate("job-1", "user-1");

    expect(asyncMetadataRepo.updateCas).toHaveBeenCalledWith(
      "summary",
      "job-1",
      "user-1",
      { status: AsyncMetadataStatusEnum.PROCESSING },
      expect.objectContaining({
        status: AsyncMetadataStatusEnum.FAILED,
        error: "quota exceeded",
      }),
    );

    expect(eventBus.emit).toHaveBeenCalledWith(
      expect.any(SummaryStatusChanged),
    );
  });

  it("generateSummarySync no-ops immediately when PROCESSING metadata", async () => {
    vi.mocked(appRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-1",
      title: "T",
      summaryMetadata: {
        status: AsyncMetadataStatusEnum.PROCESSING,
        error: null,
        timestamp: null,
      },
    } as never);

    await service.generateSummarySync("job-1", "user-1");

    expect(asyncMetadataRepo.updateCas).not.toHaveBeenCalled();
  });

  it("includes stage-event context when query returns rows", async () => {
    const stageEv = Object.assign(new JobStageEventEntity(), {
      id: "e1",
      jobId: "job-1",
      userId: "user-1",
      toStage: ApplicationStageEnum.TECHNICAL,
      reason: "Loop",
      createdAt: new Date(),
      scheduledAt: null,
    });

    vi.mocked(stageTimelineQb.getMany).mockResolvedValue([stageEv]);

    vi.mocked(appRepo.findOneByIdAndUserId).mockResolvedValue({
      id: "job-1",
      title: "Role",
      company: null,
      description: TIPTAP_HELLO,
      summaryMetadata: { status: AsyncMetadataStatusEnum.PROCESSING },
    } as never);
    vi.mocked(summaryAiService.generateSummary).mockResolvedValue("s");
    vi.mocked(asyncMetadataRepo.updateCas).mockResolvedValue(true);
    vi.mocked(appRepo.updateSummary).mockResolvedValue(true);

    await service.doGenerate("job-1", "user-1");

    const ctx =
      vi.mocked(summaryAiService.generateSummary).mock.calls[0][0] ?? "";
    expect(ctx).toContain("TECHNICAL");
    expect(ctx).toContain("Loop");
  });
});

import { SalaryEmbedded } from "@api/database/embeddeds/salary.embedded";
import type { JobNoteEntity } from "@api/database/entities/job-note.entity";
import type { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";
import { JobEventBus } from "@api/domains/jobs/job-event.bus";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import type { Job } from "@api/domains/jobs/jobs.schema";
import { SalaryPeriodEnum } from "@api/domains/jobs/salary/salary-period.enum";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import type { Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SummaryService } from "./summary.service";
import { SummaryAiService } from "./summary-ai.service";

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: "job-1",
    userId: "user-1",
    title: "Software Engineer",
    companyId: "company-1",
    company: {
      id: "company-1",
      name: "Acme Corp",
      userId: "user-1",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    description: null,
    urls: [],
    source: null,
    salary: null,
    tags: [],
    location: null,
    workRegion: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    sourceRunId: null,
    ...overrides,
  } as unknown as Job;
}

describe("SummaryService", () => {
  let service: SummaryService;
  let summaryAiService: { generateSummary: ReturnType<typeof vi.fn> };
  let eventBus: { emit: ReturnType<typeof vi.fn> };
  let appRepo: JobsRepository;
  let notesRepo: { find: ReturnType<typeof vi.fn> };
  let stageEventsRepo: { createQueryBuilder: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    summaryAiService = {
      generateSummary: vi.fn().mockResolvedValue("Summary text"),
    };
    eventBus = { emit: vi.fn() };

    appRepo = {
      findOneByIdAndUserId: vi.fn(),
      updateSummaryMetadata: vi.fn().mockResolvedValue(true),
      updateSummary: vi.fn().mockResolvedValue(true),
    } as unknown as JobsRepository;

    const mockQb = {
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      addOrderBy: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue([]),
    };
    stageEventsRepo = { createQueryBuilder: vi.fn().mockReturnValue(mockQb) };
    notesRepo = { find: vi.fn().mockResolvedValue([]) };

    service = new SummaryService(
      summaryAiService as unknown as SummaryAiService,
      eventBus as unknown as JobEventBus,
      appRepo,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
      notesRepo as unknown as Repository<JobNoteEntity>,
    );
  });

  it("doGenerate with salary null → salary text omitted from context", async () => {
    const job = makeJob({ salary: null });
    vi.mocked(appRepo.findOneByIdAndUserId).mockResolvedValue(job);

    await service.doGenerate("job-1", "user-1");

    expect(summaryAiService.generateSummary).toHaveBeenCalledTimes(1);
    const contextArg = summaryAiService.generateSummary.mock
      .calls[0][0] as string;
    expect(contextArg).toContain("Software Engineer");
    expect(contextArg).not.toContain("Salary:");
  });

  it("doGenerate with salary.minCents set → salary text includes min value", async () => {
    const embedded = new SalaryEmbedded();
    embedded.minCents = 100000;
    embedded.currency = "USD";
    embedded.period = SalaryPeriodEnum.YEAR;

    const job = makeJob({ salary: embedded });
    vi.mocked(appRepo.findOneByIdAndUserId).mockResolvedValue(job);

    await service.doGenerate("job-1", "user-1");

    const contextArg = summaryAiService.generateSummary.mock
      .calls[0][0] as string;
    expect(contextArg).toContain("Salary:");
    expect(contextArg).toContain("$1,000");
    expect(contextArg).toContain("USD");
    expect(contextArg).toContain("YEAR");
  });

  it("doGenerate with salary fully populated → all fields reflected", async () => {
    const embedded = new SalaryEmbedded();
    embedded.minCents = 5000000;
    embedded.maxCents = 7000000;
    embedded.currency = "BRL";
    embedded.period = SalaryPeriodEnum.MONTH;

    const job = makeJob({ salary: embedded });
    vi.mocked(appRepo.findOneByIdAndUserId).mockResolvedValue(job);

    await service.doGenerate("job-1", "user-1");

    const contextArg = summaryAiService.generateSummary.mock
      .calls[0][0] as string;
    expect(contextArg).toContain("$50,000");
    expect(contextArg).toContain("$70,000");
    expect(contextArg).toContain("BRL");
    expect(contextArg).toContain("MONTH");
  });

  it("doGenerate with salary partial (only min, no max) → includes only set fields", async () => {
    const embedded = new SalaryEmbedded();
    embedded.minCents = 250000;
    embedded.currency = "EUR";
    embedded.period = SalaryPeriodEnum.MONTH;

    const job = makeJob({ salary: embedded });
    vi.mocked(appRepo.findOneByIdAndUserId).mockResolvedValue(job);

    await service.doGenerate("job-1", "user-1");

    const contextArg = summaryAiService.generateSummary.mock
      .calls[0][0] as string;
    expect(contextArg).toContain("$2,500");
    expect(contextArg).toContain("EUR");
  });

  it("doGenerate failure → marks metadata as FAILED with error message", async () => {
    const job = makeJob({ salary: null, summaryMetadata: undefined });
    vi.mocked(appRepo.findOneByIdAndUserId).mockResolvedValue(job);
    const error = new Error("AI service unavailable");
    vi.mocked(summaryAiService.generateSummary).mockRejectedValue(error);

    await service.doGenerate("job-1", "user-1");

    expect(appRepo.updateSummaryMetadata).toHaveBeenCalledWith(
      "job-1",
      { status: AsyncMetadataStatusEnum.PROCESSING },
      {
        status: AsyncMetadataStatusEnum.FAILED,
        error: "AI service unavailable",
      },
      "user-1",
    );
  });
});

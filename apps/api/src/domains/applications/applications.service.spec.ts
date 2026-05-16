import { DraftApplicationConversionStatusEnum } from "@api/database/entities/draft-application.entity";
import { FitAnalysisEntity } from "@api/database/entities/fit-analysis.entity";
import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { CompanyDescriptionService } from "@api/domains/companies/ai/company-description.service";
import { CompanyService } from "@api/domains/companies/companies.service";
import { DraftExtractionService } from "@api/domains/draft-applications/ai/draft-extraction.service";
import { DraftExtractionNormalizationService } from "@api/domains/draft-applications/ai/draft-extraction-normalization.service";
import { DraftApplicationEventBus } from "@api/domains/draft-applications/draft-application-event.bus";
import { DraftApplicationsService } from "@api/domains/draft-applications/draft-applications.service";
import { LocationInferenceService } from "@api/lib/ai";
import { NotFoundException } from "@nestjs/common";
import type { Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationEventBus } from "./application-event.bus";
import { ApplicationStageEnum } from "./application-stage.enum";
import { ApplicationStageEvent } from "./application-stage-events.schema";
import { ApplicationRepository } from "./applications.repository";
import { Application } from "./applications.schema";
import { ApplicationService } from "./applications.service";
import { SalaryService } from "./salary/salary.service";
import { TagService } from "./tags/tag.service";

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
    urls: [],
    source: null,
    salaryMinCents: null,
    salaryMaxCents: null,
    salaryCurrency: null,
    salaryPeriod: null,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    sourceRunId: null,
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
    toStage: ApplicationStageEnum.NEW,
    source: "manual",
    reason: null,
    createdAt: new Date("2026-01-02"),
    ...overrides,
    scheduledAt: overrides.scheduledAt ?? null,
  }) as unknown as ApplicationStageEvent;

describe("ApplicationService", () => {
  let service: ApplicationService;
  let sourceRunsRepo: Pick<Repository<SourceRunEntity>, "findOne">;
  let repo: ApplicationRepository;
  let companyService: CompanyService;
  let salaryService: SalaryService;
  let tagService: TagService;
  let companyDescriptionService: CompanyDescriptionService;
  let draftApplicationsService: DraftApplicationsService;
  let draftExtractionService: DraftExtractionService;
  let draftExtractionNormalizationService: DraftExtractionNormalizationService;
  let locationInferenceService: LocationInferenceService;

  beforeEach(() => {
    sourceRunsRepo = { findOne: vi.fn().mockResolvedValue(null) };

    repo = {
      findAllByUserId: vi.fn(),
      findOneByIdAndUserId: vi.fn(),
      findLatestStageSummariesByApplicationIds: vi
        .fn()
        .mockResolvedValue(new Map()),
      hasRecentDuplicateSameRoleAndCompany: vi.fn().mockResolvedValue(false),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findStageEventsByApplicationIdAndUserId: vi.fn(),
      findLatestStageEventByApplicationIdAndUserId: vi.fn(),
      findStageEventByIdAndUserId: vi.fn(),
      createStageEvent: vi.fn(),
      updateStageEvent: vi.fn(),
      deleteStageEvent: vi.fn(),
      findUpToTwoJobPostingContextsByCompanyName: vi.fn().mockResolvedValue([]),
    } as unknown as ApplicationRepository;

    companyService = {
      findOne: vi.fn(),
      findOrCreateByName: vi.fn(),
      update: vi.fn(),
    } as unknown as CompanyService;

    salaryService = new SalaryService();
    tagService = new TagService();
    companyDescriptionService = {
      generateCompanyDescription: vi.fn(),
    } as unknown as CompanyDescriptionService;
    draftApplicationsService = {
      findOne: vi.fn(),
      update: vi.fn(),
      updateConversionMetadata: vi.fn(),
    } as unknown as DraftApplicationsService;
    draftExtractionService = {
      extract: vi.fn(),
    } as unknown as DraftExtractionService;
    draftExtractionNormalizationService = {
      normalizeExtraction: vi.fn(),
    } as unknown as DraftExtractionNormalizationService;
    locationInferenceService = {
      inferLocation: vi.fn(),
      inferWorkRegion: vi.fn(),
    } as unknown as LocationInferenceService;

    const eventBus = {
      emit: vi.fn(),
      emitApplicationCreated: vi.fn(),
    } as unknown as ApplicationEventBus;

    const draftEventBus = {
      emit: vi.fn(),
      emitDraftConversionStatusChanged: vi.fn(),
    } as unknown as DraftApplicationEventBus;

    service = new ApplicationService(
      sourceRunsRepo as unknown as Repository<SourceRunEntity>,
      {
        update: vi.fn().mockResolvedValue({ affected: 1 }),
      } as unknown as Repository<FitAnalysisEntity>,
      repo,
      companyService,
      salaryService,
      tagService,
      companyDescriptionService,
      draftApplicationsService,
      draftExtractionService,
      draftExtractionNormalizationService,
      locationInferenceService,
      eventBus,
      draftEventBus,
    );
  });

  it("findAll delegates to repo and attaches current stage", async () => {
    const app = makeApp();
    vi.mocked(repo.findAllByUserId).mockResolvedValue([app]);
    const result = await service.findAll("user-1");
    expect(result).toHaveLength(1);
    expect(repo.findAllByUserId).toHaveBeenCalledWith(
      "user-1",
      undefined,
      undefined,
      undefined,
    );
    expect(
      vi.mocked(repo.findLatestStageSummariesByApplicationIds),
    ).toHaveBeenCalledWith("user-1", [app.id]);
    expect(result[0]?.currentStage).toBe(ApplicationStageEnum.NEW);
  });

  it("findOne returns application when found", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(makeApp());
    const result = await service.findOne("app-1", "user-1");
    expect(result.id).toBe("app-1");
    expect(
      vi.mocked(repo.findLatestStageSummariesByApplicationIds),
    ).toHaveBeenCalledWith("user-1", ["app-1"]);
    expect(result.currentStage).toBe(ApplicationStageEnum.NEW);
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
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(app);
    vi.mocked(repo.createStageEvent).mockResolvedValue(
      makeEvent({ toStage: ApplicationStageEnum.NEW, source: "system" }),
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
    expect(result).toEqual(
      expect.objectContaining({
        id: app.id,
        currentStage: ApplicationStageEnum.NEW,
        currentStageReason: null,
      }),
    );
    expect(companyService.findOrCreateByName).toHaveBeenCalledWith(
      "user-1",
      "Acme",
    );
    expect(repo.createStageEvent).toHaveBeenCalledWith("user-1", app.id, {
      fromStage: null,
      toStage: ApplicationStageEnum.NEW,
      source: "system",
      reason: null,
      scheduledAt: null,
    });
    expect(repo.hasRecentDuplicateSameRoleAndCompany).toHaveBeenCalledWith(
      "user-1",
      app.id,
      app.company.id,
      "Engineer",
      expect.any(Date),
      expect.any(Number),
    );
  });

  it("create uses Duplicated initial stage when matching application exists in lookback window", async () => {
    const app = makeApp();
    vi.mocked(companyService.findOrCreateByName).mockResolvedValue(app.company);
    vi.mocked(repo.create).mockResolvedValue(app);
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(app);
    vi.mocked(repo.hasRecentDuplicateSameRoleAndCompany).mockResolvedValue(
      true,
    );
    vi.mocked(repo.findLatestStageSummariesByApplicationIds).mockResolvedValue(
      new Map([
        [
          app.id,
          {
            toStage: ApplicationStageEnum.DUPLICATED,
            reason: null,
            statusAt: new Date(),
          },
        ],
      ]),
    );
    vi.mocked(repo.createStageEvent).mockResolvedValue(
      makeEvent({ toStage: ApplicationStageEnum.DUPLICATED, source: "system" }),
    );
    const result = await service.create("user-1", {
      title: "Engineer",
      company: "Acme",
      description: JSON.stringify({
        type: "doc",
        content: [{ type: "paragraph", content: [] }],
      }),
    });
    expect(result.currentStage).toBe(ApplicationStageEnum.DUPLICATED);
    expect(repo.createStageEvent).toHaveBeenCalledWith("user-1", app.id, {
      fromStage: null,
      toStage: ApplicationStageEnum.DUPLICATED,
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

  it("generateCompanyDescription loads postings and forwards to company AI", async () => {
    const snippets = [
      { title: "Engineer", plainTextDescription: "Product analytics team" },
    ];
    vi.mocked(
      repo.findUpToTwoJobPostingContextsByCompanyName,
    ).mockResolvedValue(snippets);
    vi.mocked(
      companyDescriptionService.generateCompanyDescription,
    ).mockResolvedValue("{}");

    await service.generateCompanyDescription("user-1", {
      companyName: "  Acme  ",
    });

    expect(
      repo.findUpToTwoJobPostingContextsByCompanyName,
    ).toHaveBeenCalledWith("user-1", "  Acme  ");
    expect(
      vi.mocked(companyDescriptionService.generateCompanyDescription),
    ).toHaveBeenCalledWith({
      companyName: "  Acme  ",
      jobPostingContexts: snippets,
    });
  });

  it("createApplicationWithAI marks draft as processing and returns immediately", async () => {
    vi.mocked(draftApplicationsService.findOne)
      .mockResolvedValueOnce({
        id: "draft-1",
        applicationId: null,
        title: "Page title",
        url: "https://jobs.example.com/x",
        htmlContent: "<p>Posting</p>",
        conversionMetadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .mockResolvedValueOnce({
        id: "draft-1",
        applicationId: null,
        title: "Page title",
        url: "https://jobs.example.com/x",
        htmlContent: "<p>Posting</p>",
        conversionMetadata: {
          status: DraftApplicationConversionStatusEnum.PROCESSING,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    vi.mocked(
      draftApplicationsService.updateConversionMetadata,
    ).mockResolvedValue(true);
    vi.mocked(draftExtractionService.extract).mockRejectedValue(
      new Error("openai down"),
    );

    const result = await service.createApplicationWithAI("user-1", "draft-1");

    expect(result.conversionMetadata?.status).toBe(
      DraftApplicationConversionStatusEnum.PROCESSING,
    );
    expect(
      draftApplicationsService.updateConversionMetadata,
    ).toHaveBeenCalledWith("draft-1", "user-1", null, {
      status: DraftApplicationConversionStatusEnum.PROCESSING,
    });
  });

  it("createApplicationWithAI background conversion records Applied after New", async () => {
    const app = makeApp();
    const idleDraft = {
      id: "draft-1",
      applicationId: null,
      title: "Page title",
      url: "https://jobs.example.com/x",
      htmlContent: "<p>Posting</p>",
      conversionMetadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const processingDraft = {
      ...idleDraft,
      conversionMetadata: {
        status: DraftApplicationConversionStatusEnum.PROCESSING,
      },
    };
    vi.mocked(draftApplicationsService.findOne)
      .mockResolvedValueOnce(idleDraft as never)
      .mockResolvedValueOnce(processingDraft as never)
      .mockResolvedValue(processingDraft as never);
    vi.mocked(
      draftApplicationsService.updateConversionMetadata,
    ).mockResolvedValue(true);
    vi.mocked(draftExtractionService.extract).mockResolvedValue({
      title: "Senior Engineer",
      company: "Acme",
      url: "https://jobs.example.com/x",
      description: "Job description",
      salary: { min: null, max: null, currency: null, period: null },
      tags: [],
      location: null,
      workRegion: null,
    });
    vi.mocked(
      draftExtractionNormalizationService.normalizeExtraction,
    ).mockReturnValue({
      title: "Senior Engineer",
      company: "Acme",
      description: null,
      salaryMinCents: null,
      salaryMaxCents: null,
      salaryCurrency: null,
      salaryPeriod: null,
      tags: [],
      location: null,
      workRegion: null,
    });
    vi.mocked(companyService.findOrCreateByName).mockResolvedValue(app.company);
    vi.mocked(repo.create).mockResolvedValue(app);
    vi.mocked(repo.hasRecentDuplicateSameRoleAndCompany).mockResolvedValue(
      false,
    );
    vi.mocked(companyService.findOrCreateByName).mockResolvedValue(app.company);
    vi.mocked(repo.create).mockResolvedValue(app);
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(app);
    vi.mocked(repo.createStageEvent)
      .mockResolvedValueOnce(
        makeEvent({ toStage: ApplicationStageEnum.NEW, source: "system" }),
      )
      .mockResolvedValueOnce(
        makeEvent({
          fromStage: ApplicationStageEnum.NEW,
          toStage: ApplicationStageEnum.APPLIED,
          source: "system",
        }),
      );
    vi.mocked(
      repo.findLatestStageEventByApplicationIdAndUserId,
    ).mockResolvedValue(
      makeEvent({ toStage: ApplicationStageEnum.NEW, source: "system" }),
    );

    await service.createApplicationWithAI("user-1", "draft-1");
    await service.processDraftConversion("user-1", "draft-1");

    expect(
      draftApplicationsService.updateConversionMetadata,
    ).toHaveBeenCalledWith("draft-1", "user-1", null, {
      status: DraftApplicationConversionStatusEnum.PROCESSING,
    });

    expect(
      draftApplicationsService.updateConversionMetadata,
    ).toHaveBeenCalledWith(
      "draft-1",
      "user-1",
      { status: DraftApplicationConversionStatusEnum.PROCESSING },
      expect.objectContaining({
        status: DraftApplicationConversionStatusEnum.SUCCEEDED,
      }),
    );

    expect(repo.create).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ draftApplicationId: "draft-1" }),
    );

    expect(repo.createStageEvent).toHaveBeenNthCalledWith(
      1,
      "user-1",
      app.id,
      expect.objectContaining({
        fromStage: null,
        toStage: ApplicationStageEnum.NEW,
        source: "system",
      }),
    );
    expect(repo.createStageEvent).toHaveBeenNthCalledWith(
      2,
      "user-1",
      app.id,
      expect.objectContaining({
        fromStage: ApplicationStageEnum.NEW,
        toStage: ApplicationStageEnum.APPLIED,
        source: "system",
      }),
    );
  });

  it("createApplicationWithAI does not emit Applied when create detects duplicate", async () => {
    const app = makeApp();
    const idleDraft = {
      id: "draft-1",
      applicationId: null,
      title: "Page title",
      url: "https://jobs.example.com/x",
      htmlContent: "<p>Posting</p>",
      conversionMetadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const processingDraft = {
      ...idleDraft,
      conversionMetadata: {
        status: DraftApplicationConversionStatusEnum.PROCESSING,
      },
    };
    vi.mocked(draftApplicationsService.findOne)
      .mockResolvedValueOnce(idleDraft as never)
      .mockResolvedValueOnce(processingDraft as never)
      .mockResolvedValue(processingDraft as never);
    vi.mocked(
      draftApplicationsService.updateConversionMetadata,
    ).mockResolvedValue(true);
    vi.mocked(draftExtractionService.extract).mockResolvedValue({
      title: "Senior Engineer",
      company: "Acme",
      url: "https://jobs.example.com/x",
      description: "Job description",
      salary: { min: null, max: null, currency: null, period: null },
      tags: [],
      location: null,
      workRegion: null,
    });
    vi.mocked(
      draftExtractionNormalizationService.normalizeExtraction,
    ).mockReturnValue({
      title: "Senior Engineer",
      company: "Acme",
      description: null,
      salaryMinCents: null,
      salaryMaxCents: null,
      salaryCurrency: null,
      salaryPeriod: null,
      tags: [],
      location: null,
      workRegion: null,
    });
    vi.mocked(companyService.findOrCreateByName).mockResolvedValue(app.company);
    vi.mocked(repo.hasRecentDuplicateSameRoleAndCompany).mockResolvedValue(
      true,
    );
    vi.mocked(repo.create).mockResolvedValue(app);
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(app);
    vi.mocked(repo.findLatestStageSummariesByApplicationIds).mockResolvedValue(
      new Map([
        [
          app.id,
          {
            toStage: ApplicationStageEnum.DUPLICATED,
            reason: null,
            statusAt: new Date(),
          },
        ],
      ]),
    );
    vi.mocked(repo.createStageEvent).mockResolvedValue(
      makeEvent({ toStage: ApplicationStageEnum.DUPLICATED, source: "system" }),
    );

    await service.createApplicationWithAI("user-1", "draft-1");
    await service.processDraftConversion("user-1", "draft-1");

    expect(
      draftApplicationsService.updateConversionMetadata,
    ).toHaveBeenCalledWith(
      "draft-1",
      "user-1",
      { status: DraftApplicationConversionStatusEnum.PROCESSING },
      expect.objectContaining({
        status: DraftApplicationConversionStatusEnum.SUCCEEDED,
      }),
    );

    expect(repo.create).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ draftApplicationId: "draft-1" }),
    );

    expect(repo.createStageEvent).toHaveBeenCalledTimes(1);
    expect(repo.createStageEvent).toHaveBeenCalledWith(
      "user-1",
      app.id,
      expect.objectContaining({
        fromStage: null,
        toStage: ApplicationStageEnum.DUPLICATED,
        source: "system",
      }),
    );
  });

  it("update throws for invalid TipTap description JSON", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(makeApp());

    await expect(
      service.update("app-1", "user-1", { description: "plain text" }),
    ).rejects.toThrow("description must be valid TipTap document JSON");
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
    expect(events[0].toStage).toBe(ApplicationStageEnum.NEW);
  });

  it("createStageEvent uses previous stage as fromStage", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(makeApp());
    vi.mocked(
      repo.findLatestStageEventByApplicationIdAndUserId,
    ).mockResolvedValue(makeEvent({ toStage: ApplicationStageEnum.TECHNICAL }));
    vi.mocked(repo.createStageEvent).mockResolvedValue(
      makeEvent({
        fromStage: ApplicationStageEnum.TECHNICAL,
        toStage: ApplicationStageEnum.OFFER,
      }),
    );

    const created = await service.createStageEvent("user-1", {
      applicationId: "app-1",
      toStage: ApplicationStageEnum.OFFER,
    });

    expect(created.fromStage).toBe(ApplicationStageEnum.TECHNICAL);
    expect(repo.createStageEvent).toHaveBeenCalledWith("user-1", "app-1", {
      fromStage: ApplicationStageEnum.TECHNICAL,
      toStage: ApplicationStageEnum.OFFER,
      source: "manual",
      reason: null,
      scheduledAt: null,
    });
  });

  it("updateStageEvent updates existing event", async () => {
    vi.mocked(repo.findStageEventByIdAndUserId).mockResolvedValue(makeEvent());
    vi.mocked(repo.updateStageEvent).mockResolvedValue(
      makeEvent({ toStage: ApplicationStageEnum.TECHNICAL }),
    );

    const updated = await service.updateStageEvent("event-1", "user-1", {
      toStage: ApplicationStageEnum.TECHNICAL,
      scheduledAt: null,
    });

    expect(updated.toStage).toBe(ApplicationStageEnum.TECHNICAL);
    expect(repo.updateStageEvent).toHaveBeenCalledWith("event-1", "user-1", {
      toStage: ApplicationStageEnum.TECHNICAL,
      reason: undefined,
      scheduledAt: null,
    });
  });

  it("removeStageEvent deletes existing event", async () => {
    vi.mocked(repo.findStageEventByIdAndUserId).mockResolvedValue(makeEvent());
    vi.mocked(repo.deleteStageEvent).mockResolvedValue(true);

    await expect(
      service.removeStageEvent("event-1", "user-1"),
    ).resolves.toBeUndefined();
    expect(repo.deleteStageEvent).toHaveBeenCalledWith("event-1", "user-1");
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

import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";
import {
  DraftApplicationConversionStatusEnum,
  DraftApplicationEntity,
} from "@api/database/entities/draft-application.entity";
import { FitAnalysisEntity } from "@api/database/entities/fit-analysis.entity";
import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { UserEntity } from "@api/database/entities/user.entity";
import { resetPublicSchemaAndMigrate } from "@api/database/test-db";
import { CompanyDescriptionService } from "@api/domains/companies/ai/company-description.service";
import { CompanyService } from "@api/domains/companies/companies.service";
import { DraftExtractionService } from "@api/domains/draft-applications/ai/draft-extraction.service";
import { DraftExtractionNormalizationService } from "@api/domains/draft-applications/ai/draft-extraction-normalization.service";
import {
  DraftConversionRequested,
  DraftConversionStatusChanged,
} from "@api/domains/draft-applications/draft-application.events";
import { DraftApplicationEventBus } from "@api/domains/draft-applications/draft-application-event.bus";
import { DraftApplicationsRepository } from "@api/domains/draft-applications/draft-applications.repository";
import { DraftApplicationsService } from "@api/domains/draft-applications/draft-applications.service";
import { LocationInferenceService } from "@api/lib/ai";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { ApplicationEventBus } from "./application-event.bus";
import { ApplicationRepository } from "./applications.repository";
import { ApplicationService } from "./applications.service";
import { SalaryService } from "./salary/salary.service";
import { TagService } from "./tags/tag.service";

const DATABASE_URL = process.env.DATABASE_URL;
const hasDb = !!DATABASE_URL;

describe.skipIf(!hasDb)(
  "ApplicationService → DraftConversionEventBus (integration)",
  () => {
    let dataSource: DataSource;
    let service: ApplicationService;
    let draftEventBus: DraftApplicationEventBus;
    let userId: string;
    let draftId: string;

    beforeAll(async () => {
      dataSource = await resetPublicSchemaAndMigrate(DATABASE_URL as string);

      const userRepo = dataSource.getRepository(UserEntity);
      const user = await userRepo.save(
        userRepo.create({
          googleId: "google-eventbus-test",
          email: "eventbus@example.com",
          name: "EventBus User",
          avatarUrl: null,
          role: "user",
        }),
      );
      userId = user.id;

      // Real repositories
      const draftRepo = new DraftApplicationsRepository(
        dataSource.getRepository(DraftApplicationEntity),
        dataSource.getRepository(ApplicationEntity),
      );
      const appRepo = new ApplicationRepository(
        dataSource.getRepository(ApplicationEntity),
        dataSource.getRepository(ApplicationStageEventEntity),
      );
      const draftApplicationsService = new DraftApplicationsService(draftRepo);

      // Real EventBus
      draftEventBus = new DraftApplicationEventBus();
      const appEventBus = { emit: vi.fn() } as unknown as ApplicationEventBus;

      // Mocked external services
      const draftExtractionService = {
        extract: vi.fn(),
      } as unknown as DraftExtractionService;
      const draftExtractionNormalizationService = {
        normalizeExtraction: vi.fn(),
      } as unknown as DraftExtractionNormalizationService;
      const locationInferenceService = {
        inferLocation: vi.fn().mockResolvedValue(null),
        inferWorkRegion: vi.fn().mockResolvedValue(null),
      } as unknown as LocationInferenceService;

      service = new ApplicationService(
        dataSource.getRepository(SourceRunEntity),
        dataSource.getRepository(FitAnalysisEntity),
        appRepo,
        {} as unknown as CompanyService,
        new SalaryService(),
        new TagService(),
        {} as unknown as CompanyDescriptionService,
        draftApplicationsService,
        draftExtractionService,
        draftExtractionNormalizationService,
        locationInferenceService,
        appEventBus,
        draftEventBus,
      );

      // Create a draft
      const draft = await dataSource
        .getRepository(DraftApplicationEntity)
        .save(
          dataSource
            .getRepository(DraftApplicationEntity)
            .create({
              userId,
              title: "Engineer @ Acme",
              htmlContent: "<p>Test content</p>",
            }),
        );
      draftId = draft.id;
    });

    afterAll(async () => {
      if (dataSource?.isInitialized) {
        await dataSource.query(
          "TRUNCATE draft_applications, companies, application_notes, application_stage_events, applications, users CASCADE",
        );
        await dataSource.destroy();
      }
    });

    it("emits DraftConversionStatusChanged(PROCESSING) when conversion starts", async () => {
      const emittedEvents: unknown[] = [];
      draftEventBus.on(DraftConversionStatusChanged, (event) => {
        emittedEvents.push(event);
      });

      const result = await service.createApplicationWithAI(userId, draftId);

      expect(result.conversionMetadata?.status).toBe(
        DraftApplicationConversionStatusEnum.PROCESSING,
      );

      const processingEvent = emittedEvents.find(
        (e) =>
          (e as DraftConversionStatusChanged).status ===
          DraftApplicationConversionStatusEnum.PROCESSING,
      );
      expect(processingEvent).toBeDefined();
      expect((processingEvent as DraftConversionStatusChanged).draftId).toBe(
        draftId,
      );
      expect((processingEvent as DraftConversionStatusChanged).userId).toBe(
        userId,
      );
    });

    it("emits DraftConversionRequested when conversion starts", async () => {
      const emittedEvents: unknown[] = [];
      draftEventBus.on(DraftConversionRequested, (event) => {
        emittedEvents.push(event);
      });

      // Need a fresh draft since the previous one is now PROCESSING
      const fresh = await dataSource
        .getRepository(DraftApplicationEntity)
        .save(
          dataSource
            .getRepository(DraftApplicationEntity)
            .create({
              userId,
              title: "Dev @ Beta",
              htmlContent: "<p>Fresh</p>",
            }),
        );

      await service.createApplicationWithAI(userId, fresh.id);

      const requestedEvent = emittedEvents.find(
        (e) => (e as DraftConversionRequested).draftId === fresh.id,
      );
      expect(requestedEvent).toBeDefined();
      expect((requestedEvent as DraftConversionRequested).userId).toBe(userId);
    });

    it("does not emit events when conversion is already in progress", async () => {
      // draftId is still PROCESSING from the first test
      const eventsAfter: unknown[] = [];
      draftEventBus.on(DraftConversionStatusChanged, () => {
        eventsAfter.push(true);
      });

      await expect(
        service.createApplicationWithAI(userId, draftId),
      ).rejects.toThrow("already in progress");

      expect(eventsAfter).toHaveLength(0);
    });

    it("persists PROCESSING status in the database", async () => {
      const row = await dataSource
        .getRepository(DraftApplicationEntity)
        .findOneBy({ id: draftId });

      expect(row?.conversionMetadata!.status).toBe(
        DraftApplicationConversionStatusEnum.PROCESSING,
      );
    });
  },
);

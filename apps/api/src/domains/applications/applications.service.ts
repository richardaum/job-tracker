import { ApplicationAiService } from "@api/domains/application-ai/application-ai.service";
import { CompanyService } from "@api/domains/companies/companies.service";
import { CompanyAiService } from "@api/domains/company-ai/company-ai.service";
import { NoteService } from "@api/domains/notes/notes.service";
import { isTipTapDocumentString } from "@api/domains/shared/tiptap.util";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { ApplicationQuickFilterEnum } from "./application-quick-filter.enum";
import { ApplicationSource } from "./application-source.enum";
import { inferApplicationSourceFromUrl } from "./application-source.util";
import { ApplicationStageEnum } from "./application-stage.enum";
import { ApplicationStageEvent } from "./application-stage-events.schema";
import {
  ApplicationRepository,
  CreateApplicationRepoDto,
  UpdateApplicationRepoDto,
} from "./applications.repository";
import { Application } from "./applications.schema";
import { CompensationService } from "./compensation.service";
import {
  type AiExtractionFieldInput,
  type CreateApplicationWithAIInput,
} from "./create-application-with-ai.input";
import { SalaryPeriodEnum } from "./salary-period.enum";
import { TagService } from "./tag.service";

type CreateDto = {
  title: string;
  company: string;
  companyId?: string | null;
  description?: string | null;
  url?: string | null;
  source?: ApplicationSource | null;
  salaryMinCents?: number | null;
  salaryMaxCents?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: SalaryPeriodEnum | null;
  tags?: string[] | null;
};
type UpdateDto = Partial<CreateDto>;
type CreateStageEventDto = {
  applicationId: string;
  toStage: ApplicationStageEnum;
  source?: string;
  reason?: string | null;
  scheduledAt?: Date;
};
type UpdateStageEventDto = {
  toStage?: ApplicationStageEnum;
  reason?: string | null;
  scheduledAt?: Date | null;
};
type CreateWithAIDto = {
  prompt: string;
  fields?: AiExtractionFieldInput[] | null;
};
type GenerateCompanyDescriptionDto = { companyName: string };

type ApplicationWithCurrentStage = Application & {
  currentStage: ApplicationStageEnum;
  currentStageReason: string | null;
  currentStageAt: Date;
};

@Injectable()
export class ApplicationService {
  constructor(
    private readonly repo: ApplicationRepository,
    private readonly companyService: CompanyService,
    private readonly compensationService: CompensationService,
    private readonly tagService: TagService,
    private readonly applicationAiService: ApplicationAiService,
    private readonly companyAiService: CompanyAiService,
    private readonly noteService: NoteService,
  ) {}

  async findAll(
    userId: string,
    filter?: ApplicationQuickFilterEnum,
    company?: string,
  ): Promise<ApplicationWithCurrentStage[]> {
    const apps = await this.repo.findAllByUserId(userId, filter, company);
    return this.attachCurrentStage(userId, apps);
  }

  async findOne(
    id: string,
    userId: string,
  ): Promise<ApplicationWithCurrentStage> {
    const app = await this.repo.findOneByIdAndUserId(id, userId);
    if (!app) throw new NotFoundException(`Application ${id} not found`);
    return (await this.attachCurrentStage(userId, [app]))[0]!;
  }

  private async attachCurrentStage(
    userId: string,
    apps: Application[],
  ): Promise<ApplicationWithCurrentStage[]> {
    if (apps.length === 0) {
      return [];
    }
    const byId = await this.repo.findLatestStageSummariesByApplicationIds(
      userId,
      apps.map((a) => a.id),
    );
    return apps.map((app) => {
      const s = byId.get(app.id);
      return {
        ...app,
        currentStage: (s?.toStage ??
          ApplicationStageEnum.NEW) as ApplicationStageEnum,
        currentStageReason: s?.reason ?? null,
        currentStageAt: s?.statusAt ?? app.createdAt,
      };
    });
  }

  async create(
    userId: string,
    dto: CreateDto,
  ): Promise<ApplicationWithCurrentStage> {
    if (
      dto.description !== undefined &&
      dto.description !== null &&
      !isTipTapDocumentString(dto.description)
    ) {
      throw new BadRequestException(
        "description must be valid TipTap document JSON",
      );
    }

    const companyId = await this.resolveCompanyId(
      userId,
      dto.company,
      dto.companyId,
    );

    if (!companyId) {
      throw new BadRequestException("Company could not be resolved");
    }
    const compensation = this.compensationService.getCreateCompensation(dto);
    const tags = this.tagService.normalizeTags(dto.tags);

    const repoDto: CreateApplicationRepoDto = {
      title: dto.title,
      companyId,
      description: dto.description ?? null,
      url: dto.url ?? null,
      source:
        dto.source !== undefined
          ? dto.source
          : inferApplicationSourceFromUrl(dto.url),
      tags,
      ...compensation,
    };

    const application = await this.repo.create(userId, repoDto);

    await this.repo.createStageEvent(userId, application.id, {
      fromStage: null,
      toStage: ApplicationStageEnum.NEW,
      source: "system",
      reason: null,
      scheduledAt: null,
    });
    const hydrated = await this.findOne(application.id, userId);
    return hydrated;
  }

  async createWithAI(
    userId: string,
    dto: CreateWithAIDto | CreateApplicationWithAIInput,
  ): Promise<ApplicationWithCurrentStage> {
    const draft = await this.applicationAiService.generateDraft({
      prompt: dto.prompt,
      fields: dto.fields ?? [],
    });

    const created = await this.create(userId, {
      title: draft.title,
      company: draft.company,
      description: draft.description,
      url: draft.url,
      salaryMinCents: draft.salaryMinCents,
      salaryMaxCents: draft.salaryMaxCents,
      salaryCurrency: draft.salaryCurrency,
      salaryPeriod: draft.salaryPeriod,
      tags: draft.tags,
    });

    for (const noteContent of draft.noteContents) {
      await this.noteService.createNote(userId, {
        applicationId: created.id,
        content: noteContent,
      });
    }

    return this.findOne(created.id, userId);
  }

  generateDraftWithAI(dto: CreateWithAIDto | CreateApplicationWithAIInput) {
    return this.applicationAiService.generateDraft({
      prompt: dto.prompt,
      fields: dto.fields ?? [],
    });
  }

  async generateCompanyDescription(
    userId: string,
    dto: GenerateCompanyDescriptionDto,
  ) {
    const jobPostingContexts =
      await this.repo.findUpToTwoJobPostingContextsByCompanyName(
        userId,
        dto.companyName,
      );

    return this.companyAiService.generateCompanyDescription({
      companyName: dto.companyName,
      jobPostingContexts,
    });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateDto,
  ): Promise<ApplicationWithCurrentStage> {
    const existing = await this.findOne(id, userId);
    if (
      dto.description !== undefined &&
      dto.description !== null &&
      !isTipTapDocumentString(dto.description)
    ) {
      throw new BadRequestException(
        "description must be valid TipTap document JSON",
      );
    }

    const companyId = await this.resolveCompanyId(
      userId,
      dto.company,
      dto.companyId,
    );
    const compensation = this.compensationService.getUpdateCompensation(
      existing,
      dto,
    );
    const tags =
      dto.tags !== undefined
        ? this.tagService.normalizeTags(dto.tags)
        : undefined;

    const repoDto: UpdateApplicationRepoDto = {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(companyId !== undefined ? { companyId } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description }
        : {}),
      ...(dto.url !== undefined ? { url: dto.url } : {}),
      ...(dto.source !== undefined
        ? { source: dto.source }
        : dto.url !== undefined
          ? { source: inferApplicationSourceFromUrl(dto.url) }
          : {}),
      ...(tags !== undefined ? { tags } : {}),
      ...(compensation ?? {}),
    };

    const updated = await this.repo.update(id, userId, repoDto);

    if (!updated) throw new NotFoundException(`Application ${id} not found`);
    return (await this.attachCurrentStage(userId, [updated]))[0]!;
  }

  private async resolveCompanyId(
    userId: string,
    companyName?: string,
    companyId?: string | null,
  ): Promise<string | undefined> {
    if (companyId) {
      const company = await this.companyService.findOne(companyId, userId);
      return company.id;
    }
    if (companyName) {
      const company = await this.companyService.findOrCreateByName(
        userId,
        companyName,
      );
      return company.id;
    }
    return undefined;
  }

  async remove(
    id: string,
    userId: string,
  ): Promise<ApplicationWithCurrentStage> {
    await this.findOne(id, userId);
    const deleted = await this.repo.delete(id, userId);
    if (!deleted) throw new NotFoundException(`Application ${id} not found`);
    return (await this.attachCurrentStage(userId, [deleted]))[0]!;
  }

  async listStageEvents(
    applicationId: string,
    userId: string,
  ): Promise<ApplicationStageEvent[]> {
    await this.findOne(applicationId, userId);
    return this.repo.findStageEventsByApplicationIdAndUserId(
      applicationId,
      userId,
    );
  }

  async createStageEvent(
    userId: string,
    dto: CreateStageEventDto,
  ): Promise<ApplicationStageEvent> {
    await this.findOne(dto.applicationId, userId);
    const latest = await this.repo.findLatestStageEventByApplicationIdAndUserId(
      dto.applicationId,
      userId,
    );
    return this.repo.createStageEvent(userId, dto.applicationId, {
      fromStage: latest?.toStage ?? null,
      toStage: dto.toStage,
      source: dto.source ?? "manual",
      reason: dto.reason ?? null,
      scheduledAt: dto.scheduledAt ?? null,
    });
  }

  async updateStageEvent(
    stageEventId: string,
    userId: string,
    dto: UpdateStageEventDto,
  ): Promise<ApplicationStageEvent> {
    const stageEvent = await this.repo.findStageEventByIdAndUserId(
      stageEventId,
      userId,
    );
    if (!stageEvent) {
      throw new NotFoundException(`Stage event ${stageEventId} not found`);
    }

    const updated = await this.repo.updateStageEvent(stageEventId, userId, {
      toStage: dto.toStage,
      reason: dto.reason,
      scheduledAt: dto.scheduledAt,
    });
    if (!updated) {
      throw new NotFoundException(`Stage event ${stageEventId} not found`);
    }
    return updated;
  }

  async removeStageEvent(stageEventId: string, userId: string): Promise<void> {
    const deleted = await this.repo.deleteStageEvent(stageEventId, userId);
    if (!deleted) {
      throw new NotFoundException(`Stage event ${stageEventId} not found`);
    }
  }

  async removeTag(
    id: string,
    userId: string,
    tag: string,
  ): Promise<ApplicationWithCurrentStage> {
    const existing = await this.findOne(id, userId);
    const tags = (existing.tags ?? []).filter(
      (t) => t.toLowerCase() !== tag.toLowerCase(),
    );
    const updated = await this.repo.update(id, userId, { tags });
    if (!updated) throw new NotFoundException(`Application ${id} not found`);
    return (await this.attachCurrentStage(userId, [updated]))[0]!;
  }
}

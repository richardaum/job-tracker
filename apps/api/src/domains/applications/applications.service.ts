import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Note } from "./application-notes.schema";
import { ApplicationQuickFilterEnum } from "./application-quick-filter.enum";
import { ApplicationStageEvent } from "./application-stage-events.schema";
import { ApplicationStageEnum } from "./application-stage.enum";
import {
  ApplicationRepository,
  CreateApplicationRepoDto,
  UpdateApplicationRepoDto,
} from "./applications.repository";
import { Application } from "./applications.schema";
import { CompensationService } from "./compensation.service";
import { SalaryPeriodEnum } from "./salary-period.enum";
import { TagService } from "./tag.service";
import { CompanyService } from "@api/domains/companies/companies.service";

type CreateDto = {
  title: string;
  company: string;
  companyId?: string | null;
  description?: string | null;
  url?: string | null;
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
  scheduledAt?: Date;
};
type UpdateStageEventDto = {
  toStage?: ApplicationStageEnum;
  scheduledAt?: Date | null;
};
type CreateNoteDto = {
  applicationId: string;
  content: string;
};
type UpdateNoteDto = {
  content?: string;
  expectedRevision: number;
};

function isValidTipTapDocument(value: string): boolean {
  try {
    const parsed = JSON.parse(value) as { type?: unknown; content?: unknown };
    return parsed.type === "doc" && Array.isArray(parsed.content);
  } catch {
    return false;
  }
}

function isValidTipTapDescription(value: string): boolean {
  return isValidTipTapDocument(value);
}

@Injectable()
export class ApplicationService {
  constructor(
    private readonly repo: ApplicationRepository,
    private readonly companyService: CompanyService,
    private readonly compensationService: CompensationService,
    private readonly tagService: TagService,
  ) {}

  findAll(
    userId: string,
    filter?: ApplicationQuickFilterEnum,
  ): Promise<Application[]> {
    return this.repo.findAllByUserId(userId, filter);
  }

  async findOne(id: string, userId: string): Promise<Application> {
    const app = await this.repo.findOneByIdAndUserId(id, userId);
    if (!app) throw new NotFoundException(`Application ${id} not found`);
    return app;
  }

  async create(userId: string, dto: CreateDto): Promise<Application> {
    if (
      dto.description !== undefined &&
      dto.description !== null &&
      !isValidTipTapDescription(dto.description)
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
      tags,
      ...compensation,
    };

    const application = await this.repo.create(userId, repoDto);

    await this.repo.createStageEvent(userId, application.id, {
      fromStage: null,
      toStage: ApplicationStageEnum.NEW,
      source: "system",
      scheduledAt: null,
    });
    return application;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateDto,
  ): Promise<Application> {
    const existing = await this.findOne(id, userId);
    if (
      dto.description !== undefined &&
      dto.description !== null &&
      !isValidTipTapDescription(dto.description)
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
      ...(tags !== undefined ? { tags } : {}),
      ...(compensation ?? {}),
    };

    const updated = await this.repo.update(id, userId, repoDto);

    if (!updated) throw new NotFoundException(`Application ${id} not found`);
    return updated;
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

  async remove(id: string, userId: string): Promise<Application> {
    await this.findOne(id, userId);
    const deleted = await this.repo.delete(id, userId);
    if (!deleted) throw new NotFoundException(`Application ${id} not found`);
    return deleted;
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
      scheduledAt: dto.scheduledAt,
    });
    if (!updated) {
      throw new NotFoundException(`Stage event ${stageEventId} not found`);
    }
    return updated;
  }

  async listNotes(applicationId: string, userId: string): Promise<Note[]> {
    await this.findOne(applicationId, userId);
    return this.repo.findNotesByApplicationIdAndUserId(applicationId, userId);
  }

  async createNote(userId: string, dto: CreateNoteDto): Promise<Note> {
    if (!isValidTipTapDocument(dto.content)) {
      throw new BadRequestException(
        "content must be valid TipTap document JSON",
      );
    }
    await this.findOne(dto.applicationId, userId);

    return this.repo.createNote(userId, {
      applicationId: dto.applicationId,
      content: dto.content,
    });
  }

  async updateNote(
    noteId: string,
    userId: string,
    dto: UpdateNoteDto,
  ): Promise<Note> {
    const note = await this.repo.findNoteByIdAndUserId(noteId, userId);
    if (!note)
      throw new NotFoundException(`Application note ${noteId} not found`);
    const nextContent = dto.content ?? note.content;
    if (!isValidTipTapDocument(nextContent)) {
      throw new BadRequestException(
        "content must be valid TipTap document JSON",
      );
    }

    const updated = await this.repo.updateNoteWithRevision(
      noteId,
      userId,
      dto.expectedRevision,
      {
        content: nextContent,
      },
    );

    if (!updated) {
      throw new ConflictException(
        `Application note ${noteId} revision mismatch`,
      );
    }

    return updated;
  }

  async removeTag(
    id: string,
    userId: string,
    tag: string,
  ): Promise<Application> {
    const existing = await this.findOne(id, userId);
    const tags = (existing.tags ?? []).filter(
      (t) => t.toLowerCase() !== tag.toLowerCase(),
    );
    const updated = await this.repo.update(id, userId, { tags });
    if (!updated) throw new NotFoundException(`Application ${id} not found`);
    return updated;
  }

  async removeNote(noteId: string, userId: string): Promise<Note> {
    const note = await this.repo.findNoteByIdAndUserId(noteId, userId);
    if (!note)
      throw new NotFoundException(`Application note ${noteId} not found`);

    const deleted = await this.repo.deleteNote(noteId, userId);
    if (!deleted)
      throw new NotFoundException(`Application note ${noteId} not found`);
    return deleted;
  }
}

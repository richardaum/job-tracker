import { ApplicationEntity } from "@api/database/entities/application.entity";
import {
  DraftApplicationConversionStatus,
  DraftApplicationEntity,
} from "@api/database/entities/draft-application.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class DraftApplicationsRepository {
  constructor(
    @InjectRepository(DraftApplicationEntity)
    private readonly draftApplicationsRepo: Repository<DraftApplicationEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationsRepo: Repository<ApplicationEntity>,
  ) {}

  async findAll(userId: string): Promise<DraftApplicationEntity[]> {
    return this.draftApplicationsRepo.find({
      where: { userId },
      order: { updatedAt: "DESC" },
    });
  }

  async findOne(
    id: string,
    userId: string,
  ): Promise<DraftApplicationEntity | null> {
    return this.draftApplicationsRepo.findOne({ where: { id, userId } });
  }

  async findLatestApplicationIdByDraftId(
    draftId: string,
  ): Promise<string | null> {
    const row = await this.applicationsRepo
      .createQueryBuilder("a")
      .select("a.id", "id")
      .where("a.draft_application_id = :draftId", { draftId })
      .orderBy("a.created_at", "DESC")
      .getRawOne<{ id: string }>();

    return row?.id ?? null;
  }

  async deleteApplicationsByDraftId(
    draftId: string,
    userId: string,
  ): Promise<void> {
    await this.applicationsRepo
      .createQueryBuilder()
      .delete()
      .from(ApplicationEntity)
      .where("draft_application_id = :draftId AND user_id = :userId", {
        draftId,
        userId,
      })
      .execute();
  }

  async create(params: {
    url: string | null;
    title: string;
    htmlContent: string;
    userId: string;
    conversionStatus?: DraftApplicationEntity["conversionStatus"];
    conversionError?: string | null;
  }): Promise<DraftApplicationEntity> {
    const row = this.draftApplicationsRepo.create({
      url: params.url,
      title: params.title,
      htmlContent: params.htmlContent,
      userId: params.userId,
      conversionStatus: params.conversionStatus,
      conversionError: params.conversionError ?? null,
    });

    return this.draftApplicationsRepo.save(row);
  }

  async save(row: DraftApplicationEntity): Promise<DraftApplicationEntity> {
    return this.draftApplicationsRepo.save(row);
  }

  async updateById(
    id: string,
    userId: string,
    patch: Partial<
      Pick<
        DraftApplicationEntity,
        | "url"
        | "title"
        | "htmlContent"
        | "conversionStatus"
        | "conversionError"
        | "convertedAt"
      >
    >,
  ): Promise<DraftApplicationEntity | null> {
    const row = await this.findOne(id, userId);
    if (!row) {
      return null;
    }

    Object.assign(row, patch);
    return this.draftApplicationsRepo.save(row);
  }

  async deleteById(id: string, userId: string): Promise<void> {
    await this.draftApplicationsRepo.delete({ id, userId });
  }

  async resetStaleProcessingDrafts(): Promise<number> {
    const result = await this.draftApplicationsRepo.update(
      { conversionStatus: DraftApplicationConversionStatus.PROCESSING },
      {
        conversionStatus: DraftApplicationConversionStatus.IDLE,
        conversionError:
          "Conversion interrupted and reset to idle after server restart.",
      },
    );

    return result.affected ?? 0;
  }
}

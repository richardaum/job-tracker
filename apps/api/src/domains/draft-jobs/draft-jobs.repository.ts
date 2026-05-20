import type { ConversionMetadata } from "@api/database/entities/draft-job.entity";
import {
  DraftJobConversionStatusEnum,
  DraftJobEntity,
} from "@api/database/entities/draft-job.entity";
import { JobEntity } from "@api/database/entities/job.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class DraftJobsRepository {
  constructor(
    @InjectRepository(DraftJobEntity)
    private readonly draftJobsRepo: Repository<DraftJobEntity>,
    @InjectRepository(JobEntity)
    private readonly applicationsRepo: Repository<JobEntity>,
  ) {}

  async findAll(userId: string): Promise<DraftJobEntity[]> {
    return this.draftJobsRepo.find({
      where: { userId },
      order: { updatedAt: "DESC" },
    });
  }

  async findOne(id: string, userId: string): Promise<DraftJobEntity | null> {
    return this.draftJobsRepo.findOne({ where: { id, userId } });
  }

  async findLatestJobIdByDraftId(draftId: string): Promise<string | null> {
    const row = await this.applicationsRepo
      .createQueryBuilder("a")
      .select("a.id", "id")
      .where("a.draft_application_id = :draftId", { draftId })
      .orderBy("a.created_at", "DESC")
      .getRawOne<{ id: string }>();

    return row?.id ?? null;
  }

  async deleteJobsByDraftId(draftId: string, userId: string): Promise<void> {
    await this.applicationsRepo
      .createQueryBuilder()
      .delete()
      .from(JobEntity)
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
  }): Promise<DraftJobEntity> {
    const row = this.draftJobsRepo.create({
      url: params.url,
      title: params.title,
      htmlContent: params.htmlContent,
      userId: params.userId,
    });

    return this.draftJobsRepo.save(row);
  }

  async save(row: DraftJobEntity): Promise<DraftJobEntity> {
    return this.draftJobsRepo.save(row);
  }

  async updateById(
    id: string,
    userId: string,
    patch: Partial<Pick<DraftJobEntity, "url" | "title" | "htmlContent">>,
  ): Promise<DraftJobEntity | null> {
    const row = await this.findOne(id, userId);
    if (!row) {
      return null;
    }

    Object.assign(row, patch);
    return this.draftJobsRepo.save(row);
  }

  async updateConversionMetadata(
    id: string,
    userId: string,
    expectedStatus: Pick<ConversionMetadata, "status"> | null,
    patch: Partial<ConversionMetadata> & {
      status: ConversionMetadata["status"];
    },
  ): Promise<boolean> {
    const patchJson = JSON.stringify(patch);
    const qb = this.draftJobsRepo
      .createQueryBuilder()
      .update(DraftJobEntity)
      .set({
        conversionMetadata: () =>
          `"conversion_metadata" || '${patchJson}'::jsonb`,
      })
      .where(`"id" = :id AND "user_id" = :userId`, { id, userId });

    if (expectedStatus === null) {
      qb.andWhere(`"conversion_metadata" IS NULL`);
    } else {
      qb.andWhere(`"conversion_metadata"->>'status' = :expected`, {
        expected: expectedStatus.status,
      });
    }

    const result = await qb.execute();
    return (result.affected ?? 0) > 0;
  }

  async deleteById(id: string, userId: string): Promise<void> {
    await this.draftJobsRepo.delete({ id, userId });
  }

  async resetStaleProcessingDrafts(): Promise<number> {
    const result = await this.draftJobsRepo
      .createQueryBuilder()
      .update()
      .set({
        conversionMetadata: () =>
          `'{"status": "${DraftJobConversionStatusEnum.FAILED}", "error": "Conversion interrupted and reset to idle after server restart."}'::jsonb`,
      })
      .where(`"conversion_metadata"->>'status' = :processing`, {
        processing: DraftJobConversionStatusEnum.PROCESSING,
      })
      .execute();

    return result.affected ?? 0;
  }
}

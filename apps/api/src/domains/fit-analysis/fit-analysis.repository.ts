import { FitAnalysisEntity } from "@api/database/entities/fit-analysis.entity";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class FitAnalysisRepository {
  constructor(
    @InjectRepository(FitAnalysisEntity)
    private readonly repo: Repository<FitAnalysisEntity>,
  ) {}

  async findById(
    id: string,
    userId?: string,
  ): Promise<FitAnalysisEntity | null> {
    return this.repo.findOne({ where: { id, ...(userId ? { userId } : {}) } });
  }

  async findByApplicationId(
    applicationId: string,
    userId?: string,
  ): Promise<FitAnalysisEntity | null> {
    return this.repo.findOne({
      where: { applicationId, ...(userId ? { userId } : {}) },
    });
  }

  async findByDraftApplicationId(
    draftApplicationId: string,
    userId?: string,
  ): Promise<FitAnalysisEntity | null> {
    return this.repo.findOne({
      where: { draftApplicationId, ...(userId ? { userId } : {}) },
    });
  }

  async findAllByUserId(userId: string): Promise<FitAnalysisEntity[]> {
    return this.repo.find({ where: { userId }, order: { updatedAt: "DESC" } });
  }

  async upsert(entity: FitAnalysisEntity): Promise<FitAnalysisEntity> {
    const existing = entity.applicationId
      ? await this.findByApplicationId(
          entity.applicationId,
          entity.userId ?? undefined,
        )
      : entity.draftApplicationId
        ? await this.findByDraftApplicationId(
            entity.draftApplicationId,
            entity.userId ?? undefined,
          )
        : null;

    if (existing) {
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      return this.repo.save(entity);
    }
    return this.repo.save(entity);
  }

  async deleteById(id: string, userId: string): Promise<boolean> {
    const result = await this.repo.delete({ id, userId });
    return (result.affected ?? 0) > 0;
  }

  async deleteByApplicationId(
    applicationId: string,
    userId?: string,
  ): Promise<boolean> {
    const result = await this.repo.delete({
      applicationId,
      ...(userId ? { userId } : {}),
    });
    return (result.affected ?? 0) > 0;
  }

  async deleteByDraftApplicationId(
    draftApplicationId: string,
    userId?: string,
  ): Promise<boolean> {
    const result = await this.repo.delete({
      draftApplicationId,
      ...(userId ? { userId } : {}),
    });
    return (result.affected ?? 0) > 0;
  }

  async updateById(
    id: string,
    expectedStatus: AsyncMetadataStatusEnum,
    patch: Partial<FitAnalysisEntity>,
    userId?: string,
  ): Promise<FitAnalysisEntity | null> {
    const qb = this.repo
      .createQueryBuilder("f")
      .where("f.id = :id AND f.generation_status = :expectedStatus", {
        id,
        expectedStatus,
      });
    if (userId) {
      qb.andWhere("f.user_id = :userId", { userId });
    }
    const entity = await qb.getOne();
    if (!entity) return null;
    Object.assign(entity, patch);
    return this.repo.save(entity);
  }

  async resetStaleProcessing(): Promise<number> {
    const stale = await this.repo
      .createQueryBuilder("f")
      .where("f.generation_status = :status", {
        status: AsyncMetadataStatusEnum.PROCESSING,
      })
      .getMany();
    for (const entity of stale) {
      entity.generationMetadata = {
        status: AsyncMetadataStatusEnum.FAILED,
        error: "Analysis interrupted and reset to failed after server restart.",
        timestamp: new Date(),
      };
    }
    if (stale.length > 0) {
      await this.repo.save(stale);
    }
    return stale.length;
  }
}

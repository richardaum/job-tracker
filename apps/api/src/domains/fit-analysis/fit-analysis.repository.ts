import {
  FitAnalysisEntity,
  FitAnalysisStatus,
} from "@api/database/entities/fit-analysis.entity";
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

  async updateStatus(
    applicationId: string,
    expectedStatus: FitAnalysisStatus,
    patch: Partial<FitAnalysisEntity>,
  ): Promise<boolean> {
    const result = await this.repo.update(
      { applicationId, status: expectedStatus },
      patch,
    );
    return (result.affected ?? 0) > 0;
  }

  async updateStatusByDraftId(
    draftApplicationId: string,
    expectedStatus: FitAnalysisStatus,
    patch: Partial<FitAnalysisEntity>,
  ): Promise<boolean> {
    const result = await this.repo.update(
      { draftApplicationId, status: expectedStatus },
      patch,
    );
    return (result.affected ?? 0) > 0;
  }

  async updateStatusById(
    id: string,
    expectedStatus: FitAnalysisStatus,
    patch: Partial<FitAnalysisEntity>,
    userId?: string,
  ): Promise<boolean> {
    const result = await this.repo.update(
      { id, status: expectedStatus, ...(userId ? { userId } : {}) },
      patch,
    );
    return (result.affected ?? 0) > 0;
  }

  async setApplicationId(
    id: string,
    applicationId: string,
    userId?: string,
  ): Promise<boolean> {
    const result = await this.repo.update(
      { id, ...(userId ? { userId } : {}) },
      { applicationId },
    );
    return (result.affected ?? 0) > 0;
  }

  async resetStaleProcessing(): Promise<number> {
    const result = await this.repo.update(
      { status: FitAnalysisStatus.PROCESSING },
      {
        status: FitAnalysisStatus.FAILED,
        error: "Analysis interrupted and reset to failed after server restart.",
      },
    );
    return result.affected ?? 0;
  }
}

import { ImportRunEntity } from "@api/database/entities/import-run.entity";
import { ImportRunStatusEnum } from "@api/domains/imports/import-run-status.enum";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ImportsRepository {
  constructor(
    @InjectRepository(ImportRunEntity)
    private readonly runsRepo: Repository<ImportRunEntity>,
  ) {}

  async listByUserId(userId: string): Promise<ImportRunEntity[]> {
    return this.runsRepo.find({
      where: { userId },
      order: { startedAt: "DESC", id: "DESC" },
    });
  }

  async create(params: {
    userId: string;
    importerId: string;
    importerName: string;
    entryUrl: string;
    executorPlanJson?: string | null;
    status: ImportRunStatusEnum;
    startedAt: Date;
  }): Promise<ImportRunEntity> {
    const row = this.runsRepo.create({
      userId: params.userId,
      importerId: params.importerId,
      importerName: params.importerName,
      entryUrl: params.entryUrl,
      executorPlanJson: params.executorPlanJson ?? null,
      status: params.status,
      startedAt: params.startedAt,
    });
    return this.runsRepo.save(row);
  }

  async deleteByUser(params: { id: string; userId: string }): Promise<boolean> {
    const result = await this.runsRepo.delete({
      id: params.id,
      userId: params.userId,
    });
    return (result.affected ?? 0) > 0;
  }

  async deleteAllByUserId(userId: string): Promise<number> {
    const result = await this.runsRepo.delete({ userId });
    return result.affected ?? 0;
  }

  async findByUserAndId(params: {
    id: string;
    userId: string;
  }): Promise<ImportRunEntity | null> {
    return this.runsRepo.findOne({
      where: { id: params.id, userId: params.userId },
    });
  }

  async updateStatus(params: {
    id: string;
    userId: string;
    status: ImportRunStatusEnum;
  }): Promise<boolean> {
    const result = await this.runsRepo.update(
      { id: params.id, userId: params.userId },
      { status: params.status },
    );
    return (result.affected ?? 0) > 0;
  }
}

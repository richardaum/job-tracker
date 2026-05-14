import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { SourceTemplateEntity } from "@api/database/entities/source-template.entity";
import { SourceRunStatusEnum } from "@api/domains/sources/source-run-status.enum";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class SourcesRepository {
  constructor(
    @InjectRepository(SourceRunEntity)
    private readonly runsRepo: Repository<SourceRunEntity>,
    @InjectRepository(SourceTemplateEntity)
    private readonly templatesRepo: Repository<SourceTemplateEntity>,
  ) {}

  async listTemplatesByUserId(userId: string): Promise<SourceTemplateEntity[]> {
    return this.templatesRepo.find({
      where: { userId },
      order: { createdAt: "ASC", id: "ASC" },
    });
  }

  async listTemplatesByUserAndSourceProfileId(params: {
    userId: string;
    sourceProfileId: string;
  }): Promise<SourceTemplateEntity[]> {
    return this.templatesRepo.find({
      where: { userId: params.userId, sourceProfileId: params.sourceProfileId },
      order: { createdAt: "DESC", id: "DESC" },
    });
  }

  async findOrCreateTemplate(params: {
    userId: string;
    sourceProfileId: string;
    surfaceUrl: string;
  }): Promise<SourceTemplateEntity> {
    const existing = await this.templatesRepo.findOne({
      where: { userId: params.userId, sourceProfileId: params.sourceProfileId },
    });
    if (existing) {
      return existing;
    }
    const row = this.templatesRepo.create({
      userId: params.userId,
      sourceProfileId: params.sourceProfileId,
      surfaceUrl: params.surfaceUrl,
      scheduleEnabled: false,
      scheduleCron: null,
    });
    return this.templatesRepo.save(row);
  }

  async findTemplateByUserAndId(params: {
    userId: string;
    id: string;
  }): Promise<SourceTemplateEntity | null> {
    return this.templatesRepo.findOne({
      where: { id: params.id, userId: params.userId },
    });
  }

  async patchSourceTemplate(params: {
    userId: string;
    id: string;
    patch: {
      scheduleCron?: string | null;
      scheduleEnabled?: boolean | null;
      surfaceUrl?: string;
    };
  }): Promise<SourceTemplateEntity | null> {
    const existing = await this.findTemplateByUserAndId({
      userId: params.userId,
      id: params.id,
    });
    if (!existing) {
      return null;
    }

    let scheduleCron = existing.scheduleCron;
    let scheduleEnabled = existing.scheduleEnabled;
    let surfaceUrl = existing.surfaceUrl;

    if (params.patch.scheduleCron !== undefined) {
      const raw = params.patch.scheduleCron;
      scheduleCron = raw === null || raw.trim() === "" ? null : raw.trim();
    }
    if (params.patch.scheduleEnabled !== undefined) {
      scheduleEnabled = Boolean(params.patch.scheduleEnabled);
    }
    if (params.patch.surfaceUrl !== undefined) {
      const raw = params.patch.surfaceUrl;
      surfaceUrl = raw.trim();
    }

    const result = await this.templatesRepo.update(
      { id: params.id, userId: params.userId },
      { scheduleCron, scheduleEnabled, surfaceUrl },
    );
    if ((result.affected ?? 0) === 0) {
      return null;
    }
    return this.findTemplateByUserAndId({
      userId: params.userId,
      id: params.id,
    });
  }

  async deleteTemplateForUser(params: {
    userId: string;
    id: string;
  }): Promise<boolean> {
    const result = await this.templatesRepo.delete({
      id: params.id,
      userId: params.userId,
    });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Runs are newest-first (`startedAt` desc, then `id` desc) for stable UI lists.
   */
  async findRunsForTemplate(params: {
    userId: string;
    templateId: string;
  }): Promise<SourceRunEntity[]> {
    return this.runsRepo.find({
      where: { userId: params.userId, templateId: params.templateId },
      relations: { template: true },
      order: { startedAt: "DESC", id: "DESC" },
    });
  }

  async listByUserId(userId: string): Promise<SourceRunEntity[]> {
    return this.runsRepo.find({
      where: { userId },
      relations: { template: true },
      order: { startedAt: "DESC", id: "DESC" },
    });
  }

  async createRun(params: {
    userId: string;
    templateId: string;
    status: SourceRunStatusEnum;
    startedAt: Date;
    surfaceUrl: string;
  }): Promise<SourceRunEntity> {
    const row = this.runsRepo.create({
      userId: params.userId,
      templateId: params.templateId,
      status: params.status,
      startedAt: params.startedAt,
      surfaceUrl: params.surfaceUrl,
    });
    return this.runsRepo.save(row);
  }

  async deleteTemplatesByUserId(userId: string): Promise<void> {
    await this.templatesRepo.delete({ userId });
  }

  async deleteByUser(params: { id: string; userId: string }): Promise<boolean> {
    const result = await this.runsRepo.delete({
      id: params.id,
      userId: params.userId,
    });
    return (result.affected ?? 0) > 0;
  }

  async findByUserAndId(params: {
    id: string;
    userId: string;
  }): Promise<SourceRunEntity | null> {
    return this.runsRepo.findOne({
      where: { id: params.id, userId: params.userId },
      relations: { template: true },
    });
  }

  async updateRunSurfaceUrl(params: {
    id: string;
    userId: string;
    surfaceUrl: string;
  }): Promise<boolean> {
    const result = await this.runsRepo.update(
      { id: params.id, userId: params.userId },
      { surfaceUrl: params.surfaceUrl },
    );
    return (result.affected ?? 0) > 0;
  }

  async updateStatus(params: {
    id: string;
    userId: string;
    status: SourceRunStatusEnum;
  }): Promise<boolean> {
    const result = await this.runsRepo.update(
      { id: params.id, userId: params.userId },
      { status: params.status },
    );
    return (result.affected ?? 0) > 0;
  }

  async resetStaleInProgressRuns(cutoff: Date): Promise<number> {
    const result = await this.runsRepo
      .createQueryBuilder()
      .update(SourceRunEntity)
      .set({ status: SourceRunStatusEnum.RUNNING })
      .where("status = :status", { status: SourceRunStatusEnum.IN_PROGRESS })
      .andWhere("started_at < :cutoff", { cutoff: cutoff.toISOString() })
      .execute();

    return result.affected ?? 0;
  }

  /**
   * Atomic compare-and-swap claim: transitions a run from RUNNING -> IN_PROGRESS.
   */
  async claimRunning(params: {
    id: string;
    userId: string;
  }): Promise<SourceRunEntity | null> {
    const result = await this.runsRepo
      .createQueryBuilder()
      .update(SourceRunEntity)
      .set({ status: SourceRunStatusEnum.IN_PROGRESS })
      .where("id = :id AND user_id = :userId AND status = :runningStatus", {
        id: params.id,
        userId: params.userId,
        runningStatus: SourceRunStatusEnum.RUNNING,
      })
      .execute();

    if ((result.affected ?? 0) === 0) {
      return null;
    }

    return this.findByUserAndId({ id: params.id, userId: params.userId });
  }
}

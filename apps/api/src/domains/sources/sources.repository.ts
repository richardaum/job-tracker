import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { SourceTemplateEntity } from "@api/database/entities/source-template.entity";
import { SourceRunActivityEvent } from "@api/domains/sources/source-run-activity-event.type";
import { SourceRunStatusEnum } from "@api/domains/sources/source-run-status.enum";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";

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
      relations: { plan: true },
      order: { createdAt: "ASC", id: "ASC" },
    });
  }

  async findOrCreateTemplate(params: {
    userId: string;
    planId: string;
    surfaceUrl: string;
    config?: Record<string, unknown> | null;
  }): Promise<SourceTemplateEntity> {
    const existing = await this.templatesRepo.findOne({
      where: { userId: params.userId, planId: params.planId },
      relations: { plan: true },
    });
    if (existing) {
      return existing;
    }
    const row = this.templatesRepo.create({
      userId: params.userId,
      planId: params.planId,
      surfaceUrl: params.surfaceUrl,
      scheduleEnabled: false,
      scheduleCron: null,
      config: params.config ?? null,
    });
    const saved = await this.templatesRepo.save(row);
    return this.templatesRepo.findOneOrFail({ where: { id: saved.id }, relations: { plan: true } });
  }

  async findTemplateByUserAndId(params: { userId: string; id: string }): Promise<SourceTemplateEntity | null> {
    return this.templatesRepo.findOne({ where: { id: params.id, userId: params.userId }, relations: { plan: true } });
  }

  async listTemplatesByUserAndPlanId(userId: string, planId: string): Promise<SourceTemplateEntity[]> {
    return this.templatesRepo.find({
      where: { userId, planId },
      relations: { plan: true },
      order: { createdAt: "DESC", id: "DESC" },
    });
  }

  async findTemplateByUserAndPlanId(params: { userId: string; planId: string }): Promise<SourceTemplateEntity | null> {
    return this.templatesRepo.findOne({
      where: { userId: params.userId, planId: params.planId },
      relations: { plan: true },
    });
  }

  async patchSourceTemplate(params: {
    userId: string;
    id: string;
    patch: {
      scheduleCron?: string | null;
      scheduleEnabled?: boolean | null;
      surfaceUrl?: string;
      config?: Record<string, unknown> | null;
    };
  }): Promise<SourceTemplateEntity | null> {
    const existing = await this.findTemplateByUserAndId({ userId: params.userId, id: params.id });
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

    const updateFields: Record<string, unknown> = { scheduleCron, scheduleEnabled, surfaceUrl };
    if (params.patch.config !== undefined) {
      updateFields.config = params.patch.config;
    }

    const result = await this.templatesRepo.update({ id: params.id, userId: params.userId }, updateFields);
    if ((result.affected ?? 0) === 0) {
      return null;
    }
    return this.findTemplateByUserAndId({ userId: params.userId, id: params.id });
  }

  async deleteTemplateForUser(params: { userId: string; id: string }): Promise<boolean> {
    const result = await this.templatesRepo.delete({ id: params.id, userId: params.userId });
    return (result.affected ?? 0) > 0;
  }

  async findRunsForTemplate(params: { userId: string; templateId: string }): Promise<SourceRunEntity[]> {
    return this.runsRepo.find({
      where: { userId: params.userId, templateId: params.templateId },
      relations: { template: { plan: true } },
      order: { startedAt: "DESC", id: "DESC" },
    });
  }

  async listByUserId(userId: string): Promise<SourceRunEntity[]> {
    return this.runsRepo.find({
      where: { userId },
      relations: { template: { plan: true } },
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

  async deleteRunsByTemplateId(params: { userId: string; templateId: string }): Promise<number> {
    const result = await this.runsRepo.delete({ userId: params.userId, templateId: params.templateId });
    return result.affected ?? 0;
  }

  async deleteByUser(params: { id: string; userId: string }): Promise<boolean> {
    const result = await this.runsRepo.delete({ id: params.id, userId: params.userId });
    return (result.affected ?? 0) > 0;
  }

  async findByUserAndId(params: { id: string; userId: string }): Promise<SourceRunEntity | null> {
    return this.runsRepo.findOne({
      where: { id: params.id, userId: params.userId },
      relations: { template: { plan: true } },
    });
  }

  async updateRunSurfaceUrl(params: { id: string; userId: string; surfaceUrl: string }): Promise<boolean> {
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
    errorMessage?: string | null;
  }): Promise<boolean> {
    const result = await this.runsRepo.update(
      { id: params.id, userId: params.userId },
      { status: params.status, errorMessage: params.errorMessage ?? null },
    );
    return (result.affected ?? 0) > 0;
  }

  async countStalePending(cutoff: Date): Promise<number> {
    return this.runsRepo.count({ where: { status: SourceRunStatusEnum.Pending, startedAt: LessThan(cutoff) } });
  }

  async findActivityEventsByRunId(userId: string, runId: string): Promise<SourceRunActivityEvent[]> {
    const rows = await this.runsRepo.manager.query(
      `SELECT type, summary, payload, occurred_at
       FROM extension_activity_events
       WHERE user_id = $1 AND correlation_id = $2
               ORDER BY occurred_at DESC, id DESC`,
      [userId, runId],
    );
    return rows.map(
      (r: { type: string; summary: string; payload: Record<string, unknown> | null; occurred_at: string }) => ({
        type: r.type,
        summary: r.summary,
        payload: r.payload,
        occurredAt: r.occurred_at,
      }),
    );
  }
}

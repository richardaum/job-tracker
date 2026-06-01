import { ExtensionActivityEventEntity } from "@api/database/entities/extension-activity-event.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ExtensionActivityEventTypeEnum } from "./extension-activity-event-type.enum";

export type CreateExtensionActivityEventRepoDto = {
  type: ExtensionActivityEventTypeEnum;
  summary: string;
  sourceRunId?: string | null;
  payload?: Record<string, unknown> | null;
  extensionVersion?: string | null;
  browser?: string | null;
  occurredAt: Date;
};

@Injectable()
export class ExtensionActivityRepository {
  constructor(
    @InjectRepository(ExtensionActivityEventEntity)
    private readonly repo: Repository<ExtensionActivityEventEntity>,
  ) {}

  async create(userId: string, dto: CreateExtensionActivityEventRepoDto): Promise<ExtensionActivityEventEntity> {
    const row = this.repo.create({
      userId,
      type: dto.type,
      summary: dto.summary,
      sourceRunId: dto.sourceRunId ?? null,
      payload: dto.payload ?? null,
      extensionVersion: dto.extensionVersion ?? null,
      browser: dto.browser ?? null,
      occurredAt: dto.occurredAt,
    });
    return this.repo.save(row);
  }

  async listRecentByUserId(userId: string, limit: number): Promise<ExtensionActivityEventEntity[]> {
    return this.repo
      .createQueryBuilder("event")
      .where("event.user_id = :userId", { userId })
      .orderBy("event.occurred_at", "DESC")
      .addOrderBy("event.id", "DESC")
      .limit(limit)
      .getMany();
  }
}

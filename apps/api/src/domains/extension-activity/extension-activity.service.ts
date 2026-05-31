import { ExtensionActivityEventEntity } from "@api/database/entities/extension-activity-event.entity";
import { ExtensionActivityReported } from "@api/domains/extension-activity/extension-activity.events";
import { ExtensionActivityRepository } from "@api/domains/extension-activity/extension-activity.repository";
import { ExtensionActivityEventBus } from "@api/domains/extension-activity/extension-activity-event.bus";
import { ExtensionActivityEvent } from "@api/domains/extension-activity/extension-activity-event.type";
import { ReportExtensionActivityInput } from "@api/domains/extension-activity/report-extension-activity.input";
import { BadRequestException, Injectable } from "@nestjs/common";

const DEFAULT_LIST_LIMIT = 100;
const MAX_LIST_LIMIT = 500;

@Injectable()
export class ExtensionActivityService {
  constructor(
    private readonly repo: ExtensionActivityRepository,
    private readonly eventBus: ExtensionActivityEventBus,
  ) {}

  async listActivityEvents(userId: string, limit?: number | null): Promise<ExtensionActivityEvent[]> {
    const resolvedLimit = this.resolveListLimit(limit);
    const rows = await this.repo.listRecentByUserId(userId, resolvedLimit);
    return rows.map((row) => this.toGql(row));
  }

  async reportActivity(userId: string, input: ReportExtensionActivityInput): Promise<ExtensionActivityEvent> {
    const summary = input.summary.trim();
    if (!summary) {
      throw new BadRequestException("Activity summary is required");
    }

    const row = await this.repo.create(userId, {
      type: input.type,
      summary,
      sourceRunId: input.sourceRunId ?? null,
      payload: input.payload ?? null,
      extensionVersion: input.extensionVersion ?? null,
      browser: input.browser ?? null,
      occurredAt: input.occurredAt ?? new Date(),
    });

    const payload = this.toGql(row);
    this.eventBus.emit(new ExtensionActivityReported(userId, payload));
    return payload;
  }

  private resolveListLimit(limit?: number | null): number {
    if (limit == null || !Number.isFinite(limit)) {
      return DEFAULT_LIST_LIMIT;
    }
    return Math.min(Math.max(Math.trunc(limit), 1), MAX_LIST_LIMIT);
  }

  private toGql(row: ExtensionActivityEventEntity): ExtensionActivityEvent {
    return {
      id: row.id,
      type: row.type,
      summary: row.summary,
      sourceRunId: row.sourceRunId,
      payload: row.payload,
      extensionVersion: row.extensionVersion,
      browser: row.browser,
      occurredAt: row.occurredAt,
    };
  }
}

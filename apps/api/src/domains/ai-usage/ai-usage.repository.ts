import { AiUsageRecordEntity } from "@api/database/entities/ai-usage-record.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";

import type { AiUsageSourceEnum } from "./ai-usage-source.enum";
import type { AiTokenUsage, AiUsageAggregate } from "./ai-usage.schema";

type AggregateRow = {
  source: AiUsageSourceEnum;
  inputTokens: string;
  outputTokens: string;
  totalTokens: string;
  calls: string;
};

@Injectable()
export class AiUsageRepository {
  constructor(
    @InjectRepository(AiUsageRecordEntity)
    private readonly repo: Repository<AiUsageRecordEntity>,
  ) {}

  async record(userId: string, source: AiUsageSourceEnum, usage: AiTokenUsage): Promise<void> {
    await this.repo.save(this.repo.create({ userId, source, ...usage }));
  }

  async aggregateSince(userId: string, since: Date): Promise<AiUsageAggregate[]> {
    const rows = await this.repo
      .createQueryBuilder("usage")
      .select("usage.source", "source")
      .addSelect("SUM(usage.input_tokens)", "inputTokens")
      .addSelect("SUM(usage.output_tokens)", "outputTokens")
      .addSelect("SUM(usage.total_tokens)", "totalTokens")
      .addSelect("COUNT(*)", "calls")
      .where("usage.user_id = :userId", { userId })
      .andWhere("usage.created_at >= :since", { since })
      .groupBy("usage.source")
      .getRawMany<AggregateRow>();

    return rows.map((row) => ({
      source: row.source,
      inputTokens: Number(row.inputTokens),
      outputTokens: Number(row.outputTokens),
      totalTokens: Number(row.totalTokens),
      calls: Number(row.calls),
    }));
  }
}

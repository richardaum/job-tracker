import { AiUsageRecordEntity } from "@api/database/entities/ai-usage-record.entity";
import { insertIntegrationUser } from "@api/database/integration-test-user";
import { createTestDataSource } from "@api/database/test-db";
import { apiEnv } from "@api/env/server";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AiUsageRepository } from "./ai-usage.repository";
import { AiUsageSourceEnum } from "./ai-usage-source.enum";

const hasDb = !!apiEnv.DATABASE_INTEGRATION_URL;

describe.skipIf(!hasDb)("AiUsageRepository (integration)", () => {
  let dataSource: DataSource;
  let repository: AiUsageRepository;
  let userId: string;
  let otherUserId: string;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    repository = new AiUsageRepository(dataSource.getRepository(AiUsageRecordEntity));
    userId = (await insertIntegrationUser(dataSource, { email: "ai-usage-owner@example.com", name: "AI Usage Owner" }))
      .id;
    otherUserId = (
      await insertIntegrationUser(dataSource, { email: "ai-usage-other@example.com", name: "AI Usage Other" })
    ).id;

    const entityRepository = dataSource.getRepository(AiUsageRecordEntity);
    await entityRepository.save([
      entityRepository.create({
        userId,
        source: AiUsageSourceEnum.PersonalKey,
        inputTokens: 10,
        outputTokens: 5,
        totalTokens: 15,
        createdAt: new Date("2026-08-01T00:00:00.000Z"),
      }),
      entityRepository.create({
        userId,
        source: AiUsageSourceEnum.Trial,
        inputTokens: 3,
        outputTokens: 2,
        totalTokens: 5,
        createdAt: new Date("2026-07-21T00:00:00.000Z"),
      }),
      entityRepository.create({
        userId,
        source: AiUsageSourceEnum.Trial,
        inputTokens: 100,
        outputTokens: 100,
        totalTokens: 200,
        createdAt: new Date("2026-07-20T23:59:59.999Z"),
      }),
      entityRepository.create({
        userId: otherUserId,
        source: AiUsageSourceEnum.PersonalKey,
        inputTokens: 500,
        outputTokens: 500,
        totalTokens: 1000,
        createdAt: new Date("2026-08-10T00:00:00.000Z"),
      }),
    ]);
  });

  afterAll(async () => dataSource?.destroy());

  it("separates sources, includes the cutoff, excludes older records, and isolates users", async () => {
    const aggregates = await repository.aggregateSince(userId, new Date("2026-07-21T00:00:00.000Z"));

    expect(aggregates).toHaveLength(2);
    expect(aggregates).toEqual(
      expect.arrayContaining([
        { source: AiUsageSourceEnum.PersonalKey, inputTokens: 10, outputTokens: 5, totalTokens: 15, calls: 1 },
        { source: AiUsageSourceEnum.Trial, inputTokens: 3, outputTokens: 2, totalTokens: 5, calls: 1 },
      ]),
    );
  });
});

import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { SourceTemplateEntity } from "@api/database/entities/source-template.entity";
import { UserEntity } from "@api/database/entities/user.entity";
import { createTestDataSource } from "@api/database/test-db";
import { SourceRunStatusEnum } from "@api/domains/sources/source-run-status.enum";
import { SourcesRepository } from "@api/domains/sources/sources.repository";
import { RoleEnum } from "@api/domains/users/role.enum";
import { serverEnv } from "@api/env/server";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const hasDb = !!serverEnv.DATABASE_INTEGRATION_URL;

describe.skipIf(!hasDb)("SourcesRepository (integration)", () => {
  let dataSource: DataSource;
  let repo: SourcesRepository;
  let userId: string;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    repo = new SourcesRepository(
      dataSource.getRepository(SourceRunEntity),
      dataSource.getRepository(SourceTemplateEntity),
    );

    const userRepo = dataSource.getRepository(UserEntity);
    const user = await userRepo.save(
      userRepo.create({
        googleId: "google-sources-repo-test",
        email: "sourcesrepo@example.com",
        name: "Sources Repo User",
        avatarUrl: null,
        role: RoleEnum.User,
      }),
    );
    userId = user.id;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query(
        "TRUNCATE source_runs, source_templates, users CASCADE",
      );
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    await dataSource.query("TRUNCATE source_runs, source_templates CASCADE");
  });

  async function seedRunningRun(): Promise<SourceRunEntity> {
    const templates = dataSource.getRepository(SourceTemplateEntity);
    const template = await templates.save(
      templates.create({
        userId,
        sourceProfileId: "remoteyeah",
        surfaceUrl: "https://example.com/initial",
        scheduleEnabled: false,
        scheduleCron: null,
      }),
    );
    return repo.createRun({
      userId,
      templateId: template.id,
      status: SourceRunStatusEnum.RUNNING,
      startedAt: new Date("2026-05-01T12:00:00.000Z"),
      surfaceUrl: "https://example.com/listing",
    });
  }

  it("claimRunning transitions RUNNING -> IN_PROGRESS and returns the row", async () => {
    const seeded = await seedRunningRun();

    const claimed = await repo.claimRunning({ id: seeded.id, userId });

    expect(claimed).not.toBeNull();
    expect(claimed?.id).toBe(seeded.id);
    expect(claimed?.status).toBe(SourceRunStatusEnum.IN_PROGRESS);
    expect(claimed?.userId).toBe(userId);
    expect(claimed?.startedAt).toBeInstanceOf(Date);

    const reloaded = await repo.findByUserAndId({ id: seeded.id, userId });
    expect(reloaded?.status).toBe(SourceRunStatusEnum.IN_PROGRESS);
  });

  it("claimRunning returns null when run is not RUNNING", async () => {
    const seeded = await seedRunningRun();
    await repo.updateStatus({
      id: seeded.id,
      userId,
      status: SourceRunStatusEnum.IN_PROGRESS,
    });

    const claimed = await repo.claimRunning({ id: seeded.id, userId });
    expect(claimed).toBeNull();
  });

  it("claimRunning returns null when row belongs to another user", async () => {
    const seeded = await seedRunningRun();

    const claimed = await repo.claimRunning({
      id: seeded.id,
      userId: "other-user",
    });
    expect(claimed).toBeNull();

    const reloaded = await repo.findByUserAndId({ id: seeded.id, userId });
    expect(reloaded?.status).toBe(SourceRunStatusEnum.RUNNING);
  });

  it("claimRunning returns null for missing run id", async () => {
    const claimed = await repo.claimRunning({
      id: "00000000-0000-0000-0000-000000000000",
      userId,
    });
    expect(claimed).toBeNull();
  });

  it("concurrent claimRunning produces exactly one winner", async () => {
    const seeded = await seedRunningRun();

    const racers = Array.from({ length: 8 }, () =>
      repo.claimRunning({ id: seeded.id, userId }),
    );
    const results = await Promise.all(racers);

    const winners = results.filter((r) => r !== null);
    const losers = results.filter((r) => r === null);

    expect(winners).toHaveLength(1);
    expect(losers).toHaveLength(racers.length - 1);
    expect(winners[0]?.status).toBe(SourceRunStatusEnum.IN_PROGRESS);

    const reloaded = await repo.findByUserAndId({ id: seeded.id, userId });
    expect(reloaded?.status).toBe(SourceRunStatusEnum.IN_PROGRESS);
  });

  it("findRunsForTemplate returns runs newest-started first", async () => {
    const templates = dataSource.getRepository(SourceTemplateEntity);
    const template = await templates.save(
      templates.create({
        userId,
        sourceProfileId: "remoteyeah",
        surfaceUrl: "https://example.com/initial",
        scheduleEnabled: false,
        scheduleCron: null,
      }),
    );

    const older = await repo.createRun({
      userId,
      templateId: template.id,
      status: SourceRunStatusEnum.COMPLETED,
      startedAt: new Date("2026-05-01T10:00:00.000Z"),
      surfaceUrl: "https://example.com/surface",
    });
    const newer = await repo.createRun({
      userId,
      templateId: template.id,
      status: SourceRunStatusEnum.COMPLETED,
      startedAt: new Date("2026-05-02T10:00:00.000Z"),
      surfaceUrl: "https://example.com/surface",
    });

    const runs = await repo.findRunsForTemplate({
      userId,
      templateId: template.id,
    });

    expect(runs.map((r) => r.id)).toEqual([newer.id, older.id]);
  });
});

import { ImportRunEntity } from "@api/database/entities/import-run.entity";
import { UserEntity } from "@api/database/entities/user.entity";
import { resetPublicSchemaAndMigrate } from "@api/database/test-db";
import { ImportRunStatusEnum } from "@api/domains/imports/import-run-status.enum";
import { ImportsRepository } from "@api/domains/imports/imports.repository";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const DATABASE_URL = process.env.DATABASE_URL;
const hasDb = !!DATABASE_URL;

describe.skipIf(!hasDb)("ImportsRepository (integration)", () => {
  let dataSource: DataSource;
  let repo: ImportsRepository;
  let userId: string;

  beforeAll(async () => {
    dataSource = await resetPublicSchemaAndMigrate(DATABASE_URL as string);
    repo = new ImportsRepository(dataSource.getRepository(ImportRunEntity));

    const userRepo = dataSource.getRepository(UserEntity);
    const user = await userRepo.save(
      userRepo.create({
        googleId: "google-imports-repo-test",
        email: "importsrepo@example.com",
        name: "Imports Repo User",
        avatarUrl: null,
        role: "user",
      }),
    );
    userId = user.id;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query("TRUNCATE import_runs, users CASCADE");
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    await dataSource.query("TRUNCATE import_runs CASCADE");
  });

  async function seedRunningRun(): Promise<ImportRunEntity> {
    return repo.create({
      userId,
      importerId: "remoteyeah",
      importerName: "RemoteYeah",
      entryUrl: "https://remoteyeah.com/board",
      status: ImportRunStatusEnum.RUNNING,
      startedAt: new Date("2026-05-01T12:00:00.000Z"),
    });
  }

  it("claimRunning transitions RUNNING -> IN_PROGRESS and returns the row", async () => {
    const seeded = await seedRunningRun();

    const claimed = await repo.claimRunning({ id: seeded.id, userId });

    expect(claimed).not.toBeNull();
    expect(claimed?.id).toBe(seeded.id);
    expect(claimed?.status).toBe(ImportRunStatusEnum.IN_PROGRESS);
    expect(claimed?.userId).toBe(userId);
    expect(claimed?.startedAt).toBeInstanceOf(Date);

    const reloaded = await repo.findByUserAndId({ id: seeded.id, userId });
    expect(reloaded?.status).toBe(ImportRunStatusEnum.IN_PROGRESS);
  });

  it("claimRunning returns null when run is not RUNNING", async () => {
    const seeded = await seedRunningRun();
    await repo.updateStatus({
      id: seeded.id,
      userId,
      status: ImportRunStatusEnum.IN_PROGRESS,
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
    expect(reloaded?.status).toBe(ImportRunStatusEnum.RUNNING);
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
    expect(winners[0]?.status).toBe(ImportRunStatusEnum.IN_PROGRESS);

    const reloaded = await repo.findByUserAndId({ id: seeded.id, userId });
    expect(reloaded?.status).toBe(ImportRunStatusEnum.IN_PROGRESS);
  });
});

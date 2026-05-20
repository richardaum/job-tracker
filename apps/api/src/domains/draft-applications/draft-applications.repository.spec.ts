import { ApplicationEntity } from "@api/database/entities/application.entity";
import {
  DraftApplicationConversionStatusEnum,
  DraftApplicationEntity,
} from "@api/database/entities/draft-application.entity";
import { UserEntity } from "@api/database/entities/user.entity";
import { resetPublicSchemaAndMigrate } from "@api/database/test-db";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DraftApplicationsRepository } from "./draft-applications.repository";

const DATABASE_URL = process.env.DATABASE_URL;
const hasDb = !!DATABASE_URL;

describe.skipIf(!hasDb)("DraftApplicationsRepository (integration)", () => {
  let dataSource: DataSource;
  let repo: DraftApplicationsRepository;
  let userId: string;

  beforeAll(async () => {
    dataSource = await resetPublicSchemaAndMigrate(DATABASE_URL as string);
    const draftRepo = dataSource.getRepository(DraftApplicationEntity);
    const applicationRepo = dataSource.getRepository(ApplicationEntity);
    repo = new DraftApplicationsRepository(draftRepo, applicationRepo);

    const userRepo = dataSource.getRepository(UserEntity);
    const user = await userRepo.save(
      userRepo.create({
        googleId: "google-draft-repo-test",
        email: "draftrepo@example.com",
        name: "Draft Repo User",
        avatarUrl: null,
        role: "user",
      }),
    );
    userId = user.id;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query(
        "TRUNCATE draft_applications, companies, application_notes, application_stage_events, applications, users CASCADE",
      );
      await dataSource.destroy();
    }
  });

  async function createDraft(title: string): Promise<DraftApplicationEntity> {
    const draftRepo = dataSource.getRepository(DraftApplicationEntity);
    return draftRepo.save(
      draftRepo.create({ userId, title, htmlContent: "<p></p>" }),
    );
  }

  it("updateConversionMetadata sets PROCESSING from NULL and preserves the value", async () => {
    const draft = await createDraft("Test Draft");
    expect(draft.conversionMetadata!.status).toBeNull();

    const result = await repo.updateConversionMetadata(draft.id, userId, null, {
      status: DraftApplicationConversionStatusEnum.PROCESSING,
    });

    expect(result).toBe(true);

    const updated = await dataSource
      .getRepository(DraftApplicationEntity)
      .findOneBy({ id: draft.id });
    expect(updated?.conversionMetadata!.status).toBe(
      DraftApplicationConversionStatusEnum.PROCESSING,
    );
  });

  it("updateConversionMetadata transitions PROCESSING → SUCCEEDED", async () => {
    const draft = await createDraft("Test Draft 2");
    expect(draft.conversionMetadata!.status).toBeNull();

    const step1 = await repo.updateConversionMetadata(draft.id, userId, null, {
      status: DraftApplicationConversionStatusEnum.PROCESSING,
    });
    expect(step1).toBe(true);

    const step2 = await repo.updateConversionMetadata(
      draft.id,
      userId,
      { status: DraftApplicationConversionStatusEnum.PROCESSING },
      {
        status: DraftApplicationConversionStatusEnum.SUCCEEDED,
        timestamp: new Date(),
      },
    );
    expect(step2).toBe(true);

    const updated = await dataSource
      .getRepository(DraftApplicationEntity)
      .findOneBy({ id: draft.id });
    expect(updated?.conversionMetadata!.status).toBe(
      DraftApplicationConversionStatusEnum.SUCCEEDED,
    );
    expect(updated?.conversionMetadata!.timestamp).toBeDefined();
  });

  it("updateConversionMetadata fails when expected status does not match", async () => {
    const draft = await createDraft("Test Draft 3");

    const result = await repo.updateConversionMetadata(
      draft.id,
      userId,
      { status: DraftApplicationConversionStatusEnum.PROCESSING },
      { status: DraftApplicationConversionStatusEnum.SUCCEEDED },
    );
    expect(result).toBe(false);
  });

  it("updateConversionMetadata fails when already PROCESSING and trying to re-set PROCESSING from NULL", async () => {
    const draft = await createDraft("Test Draft 4");

    await repo.updateConversionMetadata(draft.id, userId, null, {
      status: DraftApplicationConversionStatusEnum.PROCESSING,
    });

    const second = await repo.updateConversionMetadata(draft.id, userId, null, {
      status: DraftApplicationConversionStatusEnum.PROCESSING,
    });
    expect(second).toBe(false);
  });
});

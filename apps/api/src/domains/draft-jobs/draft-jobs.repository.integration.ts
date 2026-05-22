import {
  DraftJobConversionStatusEnum,
  DraftJobEntity,
} from "@api/database/entities/draft-job.entity";
import { JobEntity } from "@api/database/entities/job.entity";
import { UserEntity } from "@api/database/entities/user.entity";
import { createTestDataSource } from "@api/database/test-db";
import type { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DraftJobsRepository } from "./draft-jobs.repository";

const hasDb = !!process.env.DATABASE_E2E_URL;

describe.skipIf(!hasDb)(
  "DraftJobsRepository — async metadata (integration)",
  () => {
    let dataSource: DataSource;
    let repo: DraftJobsRepository;
    let userId: string;

    beforeAll(async () => {
      dataSource = await createTestDataSource();
      repo = new DraftJobsRepository(
        dataSource.getRepository(DraftJobEntity),
        dataSource.getRepository(JobEntity),
      );

      const userRepo = dataSource.getRepository(UserEntity);
      const user = await userRepo.save(
        userRepo.create({
          googleId: "google-draft-metadata-test",
          email: "draftmetadata@example.com",
          name: "Draft Meta User",
          avatarUrl: null,
          role: "user",
        }),
      );
      userId = user.id;
    });

    afterAll(async () => {
      if (dataSource?.isInitialized) {
        await dataSource.query("TRUNCATE draft_jobs, jobs, users CASCADE");
        await dataSource.destroy();
      }
    });

    async function createDraft(overrides?: Partial<DraftJobEntity>) {
      const row = dataSource
        .getRepository(DraftJobEntity)
        .create({
          userId,
          title: "Test Draft",
          htmlContent: "<p>HTML</p>",
          ...overrides,
        });
      return dataSource.getRepository(DraftJobEntity).save(row);
    }

    describe("updateConversionMetadata — transitions", () => {
      it("NULL → PROCESSING (first transition)", async () => {
        const draft = await createDraft();
        expect(draft.conversionMetadata?.status ?? null).toBeNull();

        const ok = await repo.updateConversionMetadata(draft.id, userId, null, {
          status: DraftJobConversionStatusEnum.PROCESSING,
        });
        expect(ok).toBe(true);

        const row = await dataSource.query(
          `SELECT conversion_status, conversion_error FROM draft_jobs WHERE id = $1`,
          [draft.id],
        );
        expect(row[0].conversion_status).toBe(
          DraftJobConversionStatusEnum.PROCESSING,
        );
        expect(row[0].conversion_error).toBeNull();
      });

      it("PROCESSING → SUCCEEDED", async () => {
        const draft = await createDraft();
        await dataSource.query(
          `UPDATE draft_jobs SET conversion_status = $1 WHERE id = $2`,
          [DraftJobConversionStatusEnum.PROCESSING, draft.id],
        );

        const now = new Date();
        const ok = await repo.updateConversionMetadata(
          draft.id,
          userId,
          { status: DraftJobConversionStatusEnum.PROCESSING },
          { status: DraftJobConversionStatusEnum.SUCCEEDED, timestamp: now },
        );
        expect(ok).toBe(true);

        const row = await dataSource.query(
          `SELECT conversion_status, conversion_timestamp FROM draft_jobs WHERE id = $1`,
          [draft.id],
        );
        expect(row[0].conversion_status).toBe(
          DraftJobConversionStatusEnum.SUCCEEDED,
        );
      });

      it("PROCESSING → FAILED with error", async () => {
        const draft = await createDraft();
        await dataSource.query(
          `UPDATE draft_jobs SET conversion_status = $1 WHERE id = $2`,
          [DraftJobConversionStatusEnum.PROCESSING, draft.id],
        );

        const ok = await repo.updateConversionMetadata(
          draft.id,
          userId,
          { status: DraftJobConversionStatusEnum.PROCESSING },
          {
            status: DraftJobConversionStatusEnum.FAILED,
            error: "OpenAI timeout",
            timestamp: new Date(),
          },
        );
        expect(ok).toBe(true);

        const row = await dataSource.query(
          `SELECT conversion_status, conversion_error FROM draft_jobs WHERE id = $1`,
          [draft.id],
        );
        expect(row[0].conversion_status).toBe(
          DraftJobConversionStatusEnum.FAILED,
        );
        expect(row[0].conversion_error).toBe("OpenAI timeout");
      });

      it("rejects when expected status does not match (optimistic concurrency)", async () => {
        const draft = await createDraft();
        await dataSource.query(
          `UPDATE draft_jobs SET conversion_status = $1 WHERE id = $2`,
          [DraftJobConversionStatusEnum.SUCCEEDED, draft.id],
        );

        const ok = await repo.updateConversionMetadata(
          draft.id,
          userId,
          { status: DraftJobConversionStatusEnum.PROCESSING },
          {
            status:
              DraftJobConversionStatusEnum.SUCCEEDED as DraftJobConversionStatusEnum,
          },
        );
        expect(ok).toBe(false);

        const row = await dataSource.query(
          `SELECT conversion_status FROM draft_jobs WHERE id = $1`,
          [draft.id],
        );
        expect(row[0].conversion_status).toBe(
          DraftJobConversionStatusEnum.SUCCEEDED,
        );
      });

      it("rejects when another user tries to update", async () => {
        const draft = await createDraft();

        const ok = await repo.updateConversionMetadata(
          draft.id,
          "wrong-user-id",
          null,
          { status: DraftJobConversionStatusEnum.PROCESSING },
        );
        expect(ok).toBe(false);
      });
    });

    describe("resetStaleProcessingDrafts", () => {
      it("resets PROCESSING → FAILED, ignores others", async () => {
        await dataSource.query("TRUNCATE draft_jobs, jobs CASCADE");

        const d1 = await createDraft();
        const d2 = await createDraft();
        const d3 = await createDraft();
        const d4 = await createDraft();

        await dataSource.query(
          `UPDATE draft_jobs SET conversion_status = $1 WHERE id = $2`,
          [DraftJobConversionStatusEnum.PROCESSING, d1.id],
        );
        await dataSource.query(
          `UPDATE draft_jobs SET conversion_status = $1 WHERE id = $2`,
          [DraftJobConversionStatusEnum.PROCESSING, d2.id],
        );
        await dataSource.query(
          `UPDATE draft_jobs SET conversion_status = $1 WHERE id = $2`,
          [DraftJobConversionStatusEnum.SUCCEEDED, d3.id],
        );

        const count = await repo.resetStaleProcessingDrafts();
        expect(count).toBe(2);

        const rows: Array<{
          id: string;
          conversion_status: string;
          conversion_error: string | null;
        }> = await dataSource.query(
          `SELECT id, conversion_status, conversion_error FROM draft_jobs WHERE id IN ($1, $2, $3, $4)`,
          [d1.id, d2.id, d3.id, d4.id],
        );

        const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
        expect(byId[d1.id].conversion_status).toBe(
          DraftJobConversionStatusEnum.FAILED,
        );
        expect(byId[d1.id].conversion_error).toBeTruthy();

        expect(byId[d2.id].conversion_status).toBe(
          DraftJobConversionStatusEnum.FAILED,
        );

        expect(byId[d3.id].conversion_status).toBe(
          DraftJobConversionStatusEnum.SUCCEEDED,
        );

        expect(byId[d4.id].conversion_status).toBeNull();
      });
    });
  },
);

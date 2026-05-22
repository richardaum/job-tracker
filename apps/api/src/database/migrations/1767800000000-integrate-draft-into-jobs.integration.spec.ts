import { randomUUID } from "node:crypto";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import {
  IntegrateDraftIntoJobs1767800000000,
  migrationsBeforeIntegrateDraftIntoJobs,
  PLACEHOLDER_DRAFT_COMPANY_NAME,
} from "@api/database/migrations";
import type { QueryRunner } from "typeorm";
import { DataSource } from "typeorm";
import { beforeAll, describe, expect, it } from "vitest";

const hasDb = !!process.env.DATABASE_E2E_URL;

const defaultTipTapDoc = '{"type":"doc","content":[{"type":"paragraph"}]}';

async function withQueryRunner(
  ds: DataSource,
  fn: (qr: QueryRunner) => Promise<void>,
) {
  const qr = ds.createQueryRunner();
  await qr.connect();
  try {
    await fn(qr);
  } finally {
    await qr.release();
  }
}

describe.skipIf(!hasDb)(
  "IntegrateDraftIntoJobs1767800000000 — DB migration integration",
  () => {
    let databaseUrl: string;

    beforeAll(() => {
      databaseUrl = process.env.DATABASE_E2E_URL!;
    });

    async function bootstrapPreDraftMerge(): Promise<DataSource> {
      const baseOpts = buildDataSourceOptions(databaseUrl);

      const dataSource = new DataSource({
        type: "postgres",
        url: databaseUrl,
        entities: baseOpts.entities ?? [],
        subscribers: baseOpts.subscribers,
        migrations: migrationsBeforeIntegrateDraftIntoJobs,
        namingStrategy: baseOpts.namingStrategy,
        migrationsTableName: baseOpts.migrationsTableName,
        synchronize: baseOpts.synchronize,
        migrationsRun: false,
        logging: baseOpts.logging,
      });

      await dataSource.initialize();
      await dataSource.query("DROP SCHEMA IF EXISTS public CASCADE");
      await dataSource.query("CREATE SCHEMA public");
      await dataSource.runMigrations({ transaction: "each" });
      return dataSource;
    }

    async function destroy(ds: DataSource) {
      if (ds?.isInitialized) {
        await ds.destroy();
      }
    }

    it("linked job merges html_content / fill metadata and dedupes urls", async () => {
      const ds = await bootstrapPreDraftMerge();

      try {
        const userId = randomUUID();
        const draftId = randomUUID();
        const jobId = randomUUID();
        const companyId = randomUUID();

        await ds.query(
          `
          INSERT INTO users (id, google_id, email, name, avatar_url, role, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NULL, 'user', now(), now())
        `,
          [userId, `g-${userId}`, `${userId}@example.com`, "Migration User"],
        );

        await ds.query(
          `
          INSERT INTO companies (id, user_id, name, description, created_at, updated_at)
          VALUES ($1, $2, 'Linked Co', NULL, now(), now())
        `,
          [companyId, userId],
        );

        await ds.query(
          `
          INSERT INTO draft_jobs (
            id, url, title, user_id, html_content,
            conversion_status, conversion_error, conversion_timestamp,
            created_at, updated_at
          ) VALUES (
            $1,
            $2,
            'Draft Title',
            $3,
            $4,
            'FAILED',
            'conv-err',
            now(),
            now(),
            now()
          )
        `,
          [
            draftId,
            "https://example.com/role",
            userId,
            "<main>Captured</main>",
          ],
        );

        await ds.query(
          `
          INSERT INTO jobs (
            id, user_id, title, company_id, description, urls,
            tags, draft_job_id, created_at, updated_at
          ) VALUES (
            $1,
            $2,
            'Role',
            $3,
            NULL,
            ARRAY['https://example.com/role']::text[],
            ARRAY[]::text[],
            $4,
            now(),
            now()
          )
        `,
          [jobId, userId, companyId, draftId],
        );

        await ds.query(
          `
          INSERT INTO job_stage_events (
            id, job_id, user_id, from_stage, to_stage, source, reason, schedule_at, created_at
          ) VALUES (
            $1::text,
            $2::text,
            $3::text,
            NULL,
            'NEW'::application_stage,
            'System'::stage_event_source,
            NULL,
            NULL,
            now()
          )
        `,
          [randomUUID(), jobId, userId],
        );

        const mig = new IntegrateDraftIntoJobs1767800000000();
        await withQueryRunner(ds, (qr) => mig.up(qr));

        const rows = await ds.query(
          `SELECT html_content, urls, fill_status FROM jobs WHERE id = $1`,
          [jobId],
        );
        const row = rows[0] as {
          html_content: string;
          urls: string[];
          fill_status: string | null;
        };

        expect(row.html_content).toBe("<main>Captured</main>");
        expect([...row.urls].sort()).toEqual(["https://example.com/role"]);
        expect(row.fill_status).toBe("FAILED");

        expect(
          (
            await ds.query(
              `SELECT 1 FROM information_schema.tables WHERE table_name='draft_jobs'`,
            )
          ).length,
        ).toBe(0);
      } finally {
        await destroy(ds);
      }
    });

    it("orphan draft + match_analysis is repointed to the new job id", async () => {
      const ds = await bootstrapPreDraftMerge();

      try {
        const userId = randomUUID();
        const draftId = randomUUID();
        const resumeId = randomUUID();

        await ds.query(
          `
          INSERT INTO users (id, google_id, email, name, avatar_url, role, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NULL, 'user', now(), now())
        `,
          [userId, `g-${userId}`, `${userId}@example.com`, "Draft-only User"],
        );

        await ds.query(
          `
          INSERT INTO draft_jobs (
            id, url, title, user_id, html_content,
            conversion_status,
            created_at, updated_at
          ) VALUES (
            $1, 'https://only.example/a', '', $2, '<p>d</p>', NULL,
            now(), now()
          )
        `,
          [draftId, userId],
        );

        await ds.query(
          `
          INSERT INTO resumes (id, user_id, title, content, is_default, created_at, updated_at)
          VALUES ($1, $2, 'CV', $3::text, false, now(), now())
        `,
          [resumeId, userId, defaultTipTapDoc],
        );

        await ds.query(
          `
          INSERT INTO match_analysis (
            id, job_id, draft_job_id, user_id, resume_id,
            score_ratio, fit_count, gap_count, unclear_count, items,
            classification, created_at, updated_at
          ) VALUES (
            $1, NULL, $2, $3, $4,
            NULL, 0, 0, 0, '[]'::jsonb,
            NULL, now(), now()
          )
        `,
          [randomUUID(), draftId, userId, resumeId],
        );

        const mig = new IntegrateDraftIntoJobs1767800000000();
        await withQueryRunner(ds, (qr) => mig.up(qr));

        const jobRows = await ds.query(
          `SELECT stage::text AS stage, html_content FROM jobs WHERE id = $1`,
          [draftId],
        );
        const jobRow = jobRows[0] as { stage: string; html_content: string };

        expect(jobRow.stage).toBe("DRAFT");
        expect(jobRow.html_content).toBe("<p>d</p>");

        const mas = await ds.query(`SELECT job_id FROM match_analysis LIMIT 1`);
        const ma = mas[0] as { job_id: string | null };
        expect(ma.job_id).toBe(draftId);

        expect(
          (
            await ds.query(
              `SELECT column_name FROM information_schema.columns WHERE table_name='match_analysis' AND column_name='draft_job_id'`,
            )
          ).length,
        ).toBe(0);
      } finally {
        await destroy(ds);
      }
    });

    it("no draft_jobs rows — migration still removes the drafts table", async () => {
      const ds = await bootstrapPreDraftMerge();

      try {
        const userId = randomUUID();

        await ds.query(
          `
          INSERT INTO users (id, google_id, email, name, avatar_url, role, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NULL, 'user', now(), now())
        `,
          [userId, `g-${userId}`, `${userId}@example.com`, "Empty-draft User"],
        );

        await ds.query(
          `
          INSERT INTO companies (id, user_id, name, description, created_at, updated_at)
          VALUES ($1, $2, 'Standalone Co', NULL, now(), now())
        `,
          [randomUUID(), userId],
        );

        const mig = new IntegrateDraftIntoJobs1767800000000();
        await withQueryRunner(ds, (qr) => mig.up(qr));

        expect(
          (
            await ds.query(
              `SELECT 1 FROM information_schema.tables WHERE table_name='draft_jobs'`,
            )
          ).length,
        ).toBe(0);
      } finally {
        await destroy(ds);
      }
    });

    it("down restores orphaned placeholder jobs into draft_jobs and drops added job columns", async () => {
      const ds = await bootstrapPreDraftMerge();

      try {
        const userId = randomUUID();
        const draftId = randomUUID();

        await ds.query(
          `
          INSERT INTO users (id, google_id, email, name, avatar_url, role, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NULL, 'user', now(), now())
        `,
          [userId, `g-${userId}`, `${userId}@example.com`, "Rollback User"],
        );

        await ds.query(
          `
          INSERT INTO draft_jobs (
            id, url, title, user_id, html_content, created_at, updated_at
          ) VALUES (
            $1, NULL, 't', $2, '<hr/>', now(), now()
          )
        `,
          [draftId, userId],
        );

        const mig = new IntegrateDraftIntoJobs1767800000000();
        await withQueryRunner(ds, (qr) => mig.up(qr));

        await withQueryRunner(ds, (qr) => mig.down(qr));

        expect(
          (
            await ds.query(
              `SELECT 1 FROM information_schema.tables WHERE table_name='draft_jobs'`,
            )
          ).length,
        ).toBe(1);

        const restoredRows = await ds.query(
          `SELECT html_content FROM draft_jobs WHERE id = $1`,
          [draftId],
        );
        const restored = restoredRows[0] as { html_content: string };
        expect(restored.html_content).toContain("<hr");

        expect(
          (
            await ds.query(
              `SELECT column_name FROM information_schema.columns WHERE table_name='jobs' AND column_name='html_content'`,
            )
          ).length,
        ).toBe(0);

        expect(
          (
            await ds.query(
              `SELECT 1 FROM companies WHERE LOWER(trim(name)) = LOWER(trim($1))`,
              [PLACEHOLDER_DRAFT_COMPANY_NAME],
            )
          ).length,
        ).toBe(0);
      } finally {
        await destroy(ds);
      }
    });
  },
);

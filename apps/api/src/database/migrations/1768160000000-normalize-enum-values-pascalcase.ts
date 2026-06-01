import type { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizeEnumValuesPascalcase1768160000000 implements MigrationInterface {
  name = "NormalizeEnumValuesPascalcase1768160000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    // 1. AsyncMetadataStatusEnum — text columns (fill, summary, generation)
    await queryRunner.query(`
      UPDATE "jobs" SET "fill_status" = CASE "fill_status"
        WHEN 'PROCESSING' THEN 'Processing'
        WHEN 'COMPLETED' THEN 'Completed'
        WHEN 'FAILED' THEN 'Failed'
        ELSE "fill_status"
      END WHERE "fill_status" IS NOT NULL
    `);
    await queryRunner.query(`
      UPDATE "jobs" SET "summary_status" = CASE "summary_status"
        WHEN 'PROCESSING' THEN 'Processing'
        WHEN 'COMPLETED' THEN 'Completed'
        WHEN 'FAILED' THEN 'Failed'
        ELSE "summary_status"
      END WHERE "summary_status" IS NOT NULL
    `);
    await queryRunner.query(`
      UPDATE "match_analysis" SET "generation_status" = CASE "generation_status"
        WHEN 'PROCESSING' THEN 'Processing'
        WHEN 'COMPLETED' THEN 'Completed'
        WHEN 'FAILED' THEN 'Failed'
        ELSE "generation_status"
      END WHERE "generation_status" IS NOT NULL
    `);

    // 2. application_stage PG enum
    const stageValues = [
      "Draft",
      "New",
      "Applied",
      "RecruiterScreen",
      "Technical",
      "CulturalFit",
      "Offer",
      "Rejected",
      "Duplicated",
    ];
    const stageTmp = "application_stage_pc";
    await queryRunner.query(`CREATE TYPE "${stageTmp}" AS ENUM (${stageValues.map((v) => `'${v}'`).join(", ")})`);

    await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "stage" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "stage" TYPE "${stageTmp}" USING CASE "stage"::text
      WHEN 'DRAFT' THEN 'Draft'::"${stageTmp}"
      WHEN 'NEW' THEN 'New'::"${stageTmp}"
      WHEN 'APPLIED' THEN 'Applied'::"${stageTmp}"
      WHEN 'RECRUITER_SCREEN' THEN 'RecruiterScreen'::"${stageTmp}"
      WHEN 'TECHNICAL' THEN 'Technical'::"${stageTmp}"
      WHEN 'CULTURAL_FIT' THEN 'CulturalFit'::"${stageTmp}"
      WHEN 'OFFER' THEN 'Offer'::"${stageTmp}"
      WHEN 'REJECTED' THEN 'Rejected'::"${stageTmp}"
      WHEN 'DUPLICATED' THEN 'Duplicated'::"${stageTmp}"
    END`);
    await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "stage" SET DEFAULT 'New'::"${stageTmp}"`);

    await queryRunner.query(`ALTER TABLE "job_stage_events" ALTER COLUMN "from_stage" TYPE "${stageTmp}" USING CASE "from_stage"::text
      WHEN 'DRAFT' THEN 'Draft'::"${stageTmp}"
      WHEN 'NEW' THEN 'New'::"${stageTmp}"
      WHEN 'APPLIED' THEN 'Applied'::"${stageTmp}"
      WHEN 'RECRUITER_SCREEN' THEN 'RecruiterScreen'::"${stageTmp}"
      WHEN 'TECHNICAL' THEN 'Technical'::"${stageTmp}"
      WHEN 'CULTURAL_FIT' THEN 'CulturalFit'::"${stageTmp}"
      WHEN 'OFFER' THEN 'Offer'::"${stageTmp}"
      WHEN 'REJECTED' THEN 'Rejected'::"${stageTmp}"
      WHEN 'DUPLICATED' THEN 'Duplicated'::"${stageTmp}"
    END`);

    await queryRunner.query(`ALTER TABLE "job_stage_events" ALTER COLUMN "to_stage" TYPE "${stageTmp}" USING CASE "to_stage"::text
      WHEN 'DRAFT' THEN 'Draft'::"${stageTmp}"
      WHEN 'NEW' THEN 'New'::"${stageTmp}"
      WHEN 'APPLIED' THEN 'Applied'::"${stageTmp}"
      WHEN 'RECRUITER_SCREEN' THEN 'RecruiterScreen'::"${stageTmp}"
      WHEN 'TECHNICAL' THEN 'Technical'::"${stageTmp}"
      WHEN 'CULTURAL_FIT' THEN 'CulturalFit'::"${stageTmp}"
      WHEN 'OFFER' THEN 'Offer'::"${stageTmp}"
      WHEN 'REJECTED' THEN 'Rejected'::"${stageTmp}"
      WHEN 'DUPLICATED' THEN 'Duplicated'::"${stageTmp}"
    END`);

    await queryRunner.query(`DROP TYPE IF EXISTS "application_stage" CASCADE`);
    await queryRunner.query(`ALTER TYPE "${stageTmp}" RENAME TO "application_stage"`);

    // 3. auth_provider PG enum
    const authTmp = "auth_provider_pc";
    await queryRunner.query(`CREATE TYPE "${authTmp}" AS ENUM ('Google')`);
    await queryRunner.query(`ALTER TABLE "user_accounts" ALTER COLUMN "provider_name" TYPE "${authTmp}" USING CASE "provider_name"::text
      WHEN 'GOOGLE' THEN 'Google'::"${authTmp}"
    END`);
    await queryRunner.query(`DROP TYPE IF EXISTS "auth_provider" CASCADE`);
    await queryRunner.query(`ALTER TYPE "${authTmp}" RENAME TO "auth_provider"`);

    // 4. application_source PG enum
    const sourceValues = ["Linkedin", "Jack", "Wellfound", "RemoteYeah"];
    const sourceTmp = "application_source_pc";
    await queryRunner.query(`CREATE TYPE "${sourceTmp}" AS ENUM (${sourceValues.map((v) => `'${v}'`).join(", ")})`);
    await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "source" TYPE "${sourceTmp}" USING CASE "source"::text
      WHEN 'LINKEDIN' THEN 'Linkedin'::"${sourceTmp}"
      WHEN 'JACK' THEN 'Jack'::"${sourceTmp}"
      WHEN 'WELLFOUND' THEN 'Wellfound'::"${sourceTmp}"
      WHEN 'REMOTE_YEAH' THEN 'RemoteYeah'::"${sourceTmp}"
    END`);
    await queryRunner.query(`DROP TYPE IF EXISTS "application_source" CASCADE`);
    await queryRunner.query(`ALTER TYPE "${sourceTmp}" RENAME TO "application_source"`);

    // 5. salary_period PG enum
    const periodValues = ["Year", "Month", "Hour"];
    const periodTmp = "salary_period_pc";
    await queryRunner.query(`CREATE TYPE "${periodTmp}" AS ENUM (${periodValues.map((v) => `'${v}'`).join(", ")})`);
    await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "salary_period" TYPE "${periodTmp}" USING CASE "salary_period"::text
      WHEN 'YEAR' THEN 'Year'::"${periodTmp}"
      WHEN 'MONTH' THEN 'Month'::"${periodTmp}"
      WHEN 'HOUR' THEN 'Hour'::"${periodTmp}"
    END`);
    await queryRunner.query(`DROP TYPE IF EXISTS "salary_period" CASCADE`);
    await queryRunner.query(`ALTER TYPE "${periodTmp}" RENAME TO "salary_period"`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // 1. AsyncMetadataStatusEnum — revert text columns
    await queryRunner.query(`
      UPDATE "jobs" SET "fill_status" = CASE "fill_status"
        WHEN 'Processing' THEN 'PROCESSING'
        WHEN 'Completed' THEN 'COMPLETED'
        WHEN 'Failed' THEN 'FAILED'
        ELSE "fill_status"
      END WHERE "fill_status" IS NOT NULL
    `);
    await queryRunner.query(`
      UPDATE "jobs" SET "summary_status" = CASE "summary_status"
        WHEN 'Processing' THEN 'PROCESSING'
        WHEN 'Completed' THEN 'COMPLETED'
        WHEN 'Failed' THEN 'FAILED'
        ELSE "summary_status"
      END WHERE "summary_status" IS NOT NULL
    `);
    await queryRunner.query(`
      UPDATE "match_analysis" SET "generation_status" = CASE "generation_status"
        WHEN 'Processing' THEN 'PROCESSING'
        WHEN 'Completed' THEN 'COMPLETED'
        WHEN 'Failed' THEN 'FAILED'
        ELSE "generation_status"
      END WHERE "generation_status" IS NOT NULL
    `);

    // 2. application_stage — revert to UPPERCASE
    const stageValues = [
      "DRAFT",
      "NEW",
      "APPLIED",
      "RECRUITER_SCREEN",
      "TECHNICAL",
      "CULTURAL_FIT",
      "OFFER",
      "REJECTED",
      "DUPLICATED",
    ];
    const stageTmp = "application_stage_old";
    await queryRunner.query(`CREATE TYPE "${stageTmp}" AS ENUM (${stageValues.map((v) => `'${v}'`).join(", ")})`);

    await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "stage" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "stage" TYPE "${stageTmp}" USING CASE "stage"::text
      WHEN 'Draft' THEN 'DRAFT'::"${stageTmp}"
      WHEN 'New' THEN 'NEW'::"${stageTmp}"
      WHEN 'Applied' THEN 'APPLIED'::"${stageTmp}"
      WHEN 'RecruiterScreen' THEN 'RECRUITER_SCREEN'::"${stageTmp}"
      WHEN 'Technical' THEN 'TECHNICAL'::"${stageTmp}"
      WHEN 'CulturalFit' THEN 'CULTURAL_FIT'::"${stageTmp}"
      WHEN 'Offer' THEN 'OFFER'::"${stageTmp}"
      WHEN 'Rejected' THEN 'REJECTED'::"${stageTmp}"
      WHEN 'Duplicated' THEN 'DUPLICATED'::"${stageTmp}"
    END`);
    await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "stage" SET DEFAULT 'NEW'::"${stageTmp}"`);

    await queryRunner.query(`ALTER TABLE "job_stage_events" ALTER COLUMN "from_stage" TYPE "${stageTmp}" USING CASE "from_stage"::text
      WHEN 'Draft' THEN 'DRAFT'::"${stageTmp}"
      WHEN 'New' THEN 'NEW'::"${stageTmp}"
      WHEN 'Applied' THEN 'APPLIED'::"${stageTmp}"
      WHEN 'RecruiterScreen' THEN 'RECRUITER_SCREEN'::"${stageTmp}"
      WHEN 'Technical' THEN 'TECHNICAL'::"${stageTmp}"
      WHEN 'CulturalFit' THEN 'CULTURAL_FIT'::"${stageTmp}"
      WHEN 'Offer' THEN 'OFFER'::"${stageTmp}"
      WHEN 'Rejected' THEN 'REJECTED'::"${stageTmp}"
      WHEN 'Duplicated' THEN 'DUPLICATED'::"${stageTmp}"
    END`);

    await queryRunner.query(`ALTER TABLE "job_stage_events" ALTER COLUMN "to_stage" TYPE "${stageTmp}" USING CASE "to_stage"::text
      WHEN 'Draft' THEN 'DRAFT'::"${stageTmp}"
      WHEN 'New' THEN 'NEW'::"${stageTmp}"
      WHEN 'Applied' THEN 'APPLIED'::"${stageTmp}"
      WHEN 'RecruiterScreen' THEN 'RECRUITER_SCREEN'::"${stageTmp}"
      WHEN 'Technical' THEN 'TECHNICAL'::"${stageTmp}"
      WHEN 'CulturalFit' THEN 'CULTURAL_FIT'::"${stageTmp}"
      WHEN 'Offer' THEN 'OFFER'::"${stageTmp}"
      WHEN 'Rejected' THEN 'REJECTED'::"${stageTmp}"
      WHEN 'Duplicated' THEN 'DUPLICATED'::"${stageTmp}"
    END`);

    await queryRunner.query(`DROP TYPE IF EXISTS "application_stage" CASCADE`);
    await queryRunner.query(`ALTER TYPE "${stageTmp}" RENAME TO "application_stage"`);

    // 3. auth_provider — revert
    const authTmp = "auth_provider_old";
    await queryRunner.query(`CREATE TYPE "${authTmp}" AS ENUM ('GOOGLE')`);
    await queryRunner.query(`ALTER TABLE "user_accounts" ALTER COLUMN "provider_name" TYPE "${authTmp}" USING CASE "provider_name"::text
      WHEN 'Google' THEN 'GOOGLE'::"${authTmp}"
    END`);
    await queryRunner.query(`DROP TYPE IF EXISTS "auth_provider" CASCADE`);
    await queryRunner.query(`ALTER TYPE "${authTmp}" RENAME TO "auth_provider"`);

    // 4. application_source — revert
    const sourceValues = ["LINKEDIN", "JACK", "WELLFOUND", "REMOTE_YEAH"];
    const sourceTmp = "application_source_old";
    await queryRunner.query(`CREATE TYPE "${sourceTmp}" AS ENUM (${sourceValues.map((v) => `'${v}'`).join(", ")})`);
    await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "source" TYPE "${sourceTmp}" USING CASE "source"::text
      WHEN 'Linkedin' THEN 'LINKEDIN'::"${sourceTmp}"
      WHEN 'Jack' THEN 'JACK'::"${sourceTmp}"
      WHEN 'Wellfound' THEN 'WELLFOUND'::"${sourceTmp}"
      WHEN 'RemoteYeah' THEN 'REMOTE_YEAH'::"${sourceTmp}"
    END`);
    await queryRunner.query(`DROP TYPE IF EXISTS "application_source" CASCADE`);
    await queryRunner.query(`ALTER TYPE "${sourceTmp}" RENAME TO "application_source"`);

    // 5. salary_period — revert
    const periodValues = ["YEAR", "MONTH", "HOUR"];
    const periodTmp = "salary_period_old";
    await queryRunner.query(`CREATE TYPE "${periodTmp}" AS ENUM (${periodValues.map((v) => `'${v}'`).join(", ")})`);
    await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "salary_period" TYPE "${periodTmp}" USING CASE "salary_period"::text
      WHEN 'Year' THEN 'YEAR'::"${periodTmp}"
      WHEN 'Month' THEN 'MONTH'::"${periodTmp}"
      WHEN 'Hour' THEN 'HOUR'::"${periodTmp}"
    END`);
    await queryRunner.query(`DROP TYPE IF EXISTS "salary_period" CASCADE`);
    await queryRunner.query(`ALTER TYPE "${periodTmp}" RENAME TO "salary_period"`);
  }
}

import type { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizeEnumValuesUppercase1767200000000 implements MigrationInterface {
  name = "NormalizeEnumValuesUppercase1767200000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    // 1. summary_metadata JSONB
    await queryRunner.query(`
      UPDATE "applications" SET "summary_metadata" =
        jsonb_set("summary_metadata", '{status}',
          to_jsonb(upper("summary_metadata"->>'status'))
        )
      WHERE "summary_metadata" IS NOT NULL
    `);

    // 2. items JSONB
    await queryRunner.query(`
      UPDATE "fit_analysis" SET "items" = (
        SELECT jsonb_agg(jsonb_set(item, '{type}',
          CASE item->>'type'
            WHEN 'must_have' THEN '"MUST_HAVE"'
            WHEN 'nice_to_have' THEN '"NICE_TO_HAVE"'
            WHEN 'soft_skill' THEN '"SOFT_SKILL"'
            ELSE item->'type'
          END
        )) FROM jsonb_array_elements("items") AS item
      ) WHERE "items" IS NOT NULL
    `);

    // 3-8: recreate each PG enum type with uppercase values
    const enums: {
      name: string;
      tmp: string;
      values: string[];
      tables: { table: string; col: string; def: string }[];
      map: string;
    }[] = [
      {
        name: "fit_analysis_status",
        tmp: "fit_analysis_status_up",
        values: ["PROCESSING", "COMPLETED", "FAILED"],
        tables: [{ table: "fit_analysis", col: "status", def: "COMPLETED" }],
        map: `WHEN 'processing' THEN 'PROCESSING'::fit_analysis_status_up WHEN 'completed' THEN 'COMPLETED'::fit_analysis_status_up WHEN 'failed' THEN 'FAILED'::fit_analysis_status_up`,
      },
      {
        name: "draft_application_conversion_status",
        tmp: "draft_application_conversion_status_up",
        values: ["IDLE", "PROCESSING", "SUCCEEDED", "FAILED"],
        tables: [
          {
            table: "draft_applications",
            col: "conversion_status",
            def: "IDLE",
          },
        ],
        map: `WHEN 'idle' THEN 'IDLE'::draft_application_conversion_status_up WHEN 'processing' THEN 'PROCESSING'::draft_application_conversion_status_up WHEN 'succeeded' THEN 'SUCCEEDED'::draft_application_conversion_status_up WHEN 'failed' THEN 'FAILED'::draft_application_conversion_status_up`,
      },
      {
        name: "salary_period",
        tmp: "salary_period_up",
        values: ["YEAR", "MONTH", "HOUR"],
        tables: [{ table: "applications", col: "salary_period", def: "" }],
        map: `WHEN 'year' THEN 'YEAR'::salary_period_up WHEN 'month' THEN 'MONTH'::salary_period_up WHEN 'hour' THEN 'HOUR'::salary_period_up`,
      },
      {
        name: "application_stage",
        tmp: "application_stage_up",
        values: [
          "NEW",
          "APPLIED",
          "RECRUITER_SCREEN",
          "TECHNICAL",
          "CULTURAL_FIT",
          "OFFER",
          "REJECTED",
          "DUPLICATED",
        ],
        tables: [
          { table: "application_stage_events", col: "to_stage", def: "" },
          { table: "application_stage_events", col: "from_stage", def: "" },
        ],
        map: `WHEN 'new' THEN 'NEW'::application_stage_up WHEN 'applied' THEN 'APPLIED'::application_stage_up WHEN 'recruiter_screen' THEN 'RECRUITER_SCREEN'::application_stage_up WHEN 'technical' THEN 'TECHNICAL'::application_stage_up WHEN 'cultural_fit' THEN 'CULTURAL_FIT'::application_stage_up WHEN 'offer' THEN 'OFFER'::application_stage_up WHEN 'rejected' THEN 'REJECTED'::application_stage_up WHEN 'duplicated' THEN 'DUPLICATED'::application_stage_up`,
      },
      {
        name: "application_source",
        tmp: "application_source_up",
        values: ["LINKEDIN", "JACK", "WELLFOUND", "REMOTE_YEAH"],
        tables: [{ table: "applications", col: "source", def: "" }],
        map: `WHEN 'Linkedin' THEN 'LINKEDIN'::application_source_up WHEN 'Jack' THEN 'JACK'::application_source_up WHEN 'Wellfound' THEN 'WELLFOUND'::application_source_up WHEN 'RemoteYeah' THEN 'REMOTE_YEAH'::application_source_up`,
      },
      {
        name: "source_run_status",
        tmp: "source_run_status_up",
        values: ["RUNNING", "IN_PROGRESS", "COMPLETED", "FAILED"],
        tables: [{ table: "source_runs", col: "status", def: "RUNNING" }],
        map: `WHEN 'running' THEN 'RUNNING'::source_run_status_up WHEN 'in_progress' THEN 'IN_PROGRESS'::source_run_status_up WHEN 'completed' THEN 'COMPLETED'::source_run_status_up WHEN 'failed' THEN 'FAILED'::source_run_status_up`,
      },
    ];

    for (const e of enums) {
      await queryRunner.query(
        `CREATE TYPE "${e.tmp}" AS ENUM (${e.values.map((v) => `'${v}'`).join(", ")})`,
      );
      for (const t of e.tables) {
        await queryRunner.query(
          `ALTER TABLE "${t.table}" ALTER COLUMN "${t.col}" DROP DEFAULT`,
        );
        await queryRunner.query(
          `ALTER TABLE "${t.table}" ALTER COLUMN "${t.col}" TYPE "${e.tmp}" USING CASE "${t.col}"::text ${e.map} END`,
        );
        if (t.def) {
          await queryRunner.query(
            `ALTER TABLE "${t.table}" ALTER COLUMN "${t.col}" SET DEFAULT '${t.def}'::"${e.tmp}"`,
          );
        }
      }
      await queryRunner.query(`DROP TYPE IF EXISTS "${e.name}" CASCADE`);
      await queryRunner.query(`ALTER TYPE "${e.tmp}" RENAME TO "${e.name}"`);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "applications" SET "summary_metadata" =
        jsonb_set("summary_metadata", '{status}',
          to_jsonb(lower("summary_metadata"->>'status'))
        )
      WHERE "summary_metadata" IS NOT NULL
    `);

    await queryRunner.query(`
      UPDATE "fit_analysis" SET "items" = (
        SELECT jsonb_agg(jsonb_set(item, '{type}',
          CASE item->>'type'
            WHEN 'MUST_HAVE' THEN '"must_have"'
            WHEN 'NICE_TO_HAVE' THEN '"nice_to_have"'
            WHEN 'SOFT_SKILL' THEN '"soft_skill"'
            ELSE item->'type'
          END
        )) FROM jsonb_array_elements("items") AS item
      ) WHERE "items" IS NOT NULL
    `);

    const enums: {
      name: string;
      tmp: string;
      values: string[];
      tables: { table: string; col: string; def: string }[];
      map: string;
    }[] = [
      {
        name: "fit_analysis_status",
        tmp: "fas_lower",
        values: ["processing", "completed", "failed"],
        tables: [{ table: "fit_analysis", col: "status", def: "completed" }],
        map: `WHEN 'PROCESSING' THEN 'processing'::fas_lower WHEN 'COMPLETED' THEN 'completed'::fas_lower WHEN 'FAILED' THEN 'failed'::fas_lower`,
      },
      {
        name: "draft_application_conversion_status",
        tmp: "dacs_lower",
        values: ["idle", "processing", "succeeded", "failed"],
        tables: [
          {
            table: "draft_applications",
            col: "conversion_status",
            def: "idle",
          },
        ],
        map: `WHEN 'IDLE' THEN 'idle'::dacs_lower WHEN 'PROCESSING' THEN 'processing'::dacs_lower WHEN 'SUCCEEDED' THEN 'succeeded'::dacs_lower WHEN 'FAILED' THEN 'failed'::dacs_lower`,
      },
      {
        name: "salary_period",
        tmp: "sp_lower",
        values: ["year", "month", "hour"],
        tables: [{ table: "applications", col: "salary_period", def: "" }],
        map: `WHEN 'YEAR' THEN 'year'::sp_lower WHEN 'MONTH' THEN 'month'::sp_lower WHEN 'HOUR' THEN 'hour'::sp_lower`,
      },
      {
        name: "application_stage",
        tmp: "as_lower",
        values: [
          "new",
          "applied",
          "recruiter_screen",
          "technical",
          "cultural_fit",
          "offer",
          "rejected",
          "duplicated",
        ],
        tables: [
          { table: "application_stage_events", col: "to_stage", def: "" },
          { table: "application_stage_events", col: "from_stage", def: "" },
        ],
        map: `WHEN 'NEW' THEN 'new'::as_lower WHEN 'APPLIED' THEN 'applied'::as_lower WHEN 'RECRUITER_SCREEN' THEN 'recruiter_screen'::as_lower WHEN 'TECHNICAL' THEN 'technical'::as_lower WHEN 'CULTURAL_FIT' THEN 'cultural_fit'::as_lower WHEN 'OFFER' THEN 'offer'::as_lower WHEN 'REJECTED' THEN 'rejected'::as_lower WHEN 'DUPLICATED' THEN 'duplicated'::as_lower`,
      },
      {
        name: "application_source",
        tmp: "asrc_lower",
        values: ["Linkedin", "Jack", "Wellfound", "RemoteYeah"],
        tables: [{ table: "applications", col: "source", def: "" }],
        map: `WHEN 'LINKEDIN' THEN 'Linkedin'::asrc_lower WHEN 'JACK' THEN 'Jack'::asrc_lower WHEN 'WELLFOUND' THEN 'Wellfound'::asrc_lower WHEN 'REMOTE_YEAH' THEN 'RemoteYeah'::asrc_lower`,
      },
      {
        name: "source_run_status",
        tmp: "srs_lower",
        values: ["running", "in_progress", "completed", "failed"],
        tables: [{ table: "source_runs", col: "status", def: "running" }],
        map: `WHEN 'RUNNING' THEN 'running'::srs_lower WHEN 'IN_PROGRESS' THEN 'in_progress'::srs_lower WHEN 'COMPLETED' THEN 'completed'::srs_lower WHEN 'FAILED' THEN 'failed'::srs_lower`,
      },
    ];

    for (const e of enums) {
      await queryRunner.query(
        `CREATE TYPE "${e.tmp}" AS ENUM (${e.values.map((v) => `'${v}'`).join(", ")})`,
      );
      for (const t of e.tables) {
        await queryRunner.query(
          `ALTER TABLE "${t.table}" ALTER COLUMN "${t.col}" DROP DEFAULT`,
        );
        await queryRunner.query(
          `ALTER TABLE "${t.table}" ALTER COLUMN "${t.col}" TYPE "${e.tmp}" USING CASE "${t.col}"::text ${e.map} END`,
        );
        if (t.def)
          await queryRunner.query(
            `ALTER TABLE "${t.table}" ALTER COLUMN "${t.col}" SET DEFAULT '${t.def}'::"${e.tmp}"`,
          );
      }
      await queryRunner.query(`DROP TYPE IF EXISTS "${e.name}" CASCADE`);
      await queryRunner.query(`ALTER TYPE "${e.tmp}" RENAME TO "${e.name}"`);
    }
  }
}

import type { MigrationInterface, QueryRunner } from "typeorm";

export class RenameEmbeddedColumnsToSnakeCase1768000000000 implements MigrationInterface {
  name = "RenameEmbeddedColumnsToSnakeCase1768000000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await this.safeRenameColumn(
      queryRunner,
      "jobs",
      "summary_Status",
      "summary_status",
    );
    await this.safeRenameColumn(
      queryRunner,
      "jobs",
      "summary_Error",
      "summary_error",
    );
    await this.safeRenameColumn(
      queryRunner,
      "jobs",
      "summary_Timestamp",
      "summary_timestamp",
    );

    await this.safeRenameColumn(
      queryRunner,
      "draft_jobs",
      "conversion_Status",
      "conversion_status",
    );
    await this.safeRenameColumn(
      queryRunner,
      "draft_jobs",
      "conversion_Error",
      "conversion_error",
    );
    await this.safeRenameColumn(
      queryRunner,
      "draft_jobs",
      "conversion_Timestamp",
      "conversion_timestamp",
    );

    await this.safeRenameColumn(
      queryRunner,
      "match_analysis",
      "generation_Status",
      "generation_status",
    );
    await this.safeRenameColumn(
      queryRunner,
      "match_analysis",
      "generation_Error",
      "generation_error",
    );
    await this.safeRenameColumn(
      queryRunner,
      "match_analysis",
      "generation_Timestamp",
      "generation_timestamp",
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await this.safeRenameColumn(
      queryRunner,
      "jobs",
      "summary_status",
      "summary_Status",
    );
    await this.safeRenameColumn(
      queryRunner,
      "jobs",
      "summary_error",
      "summary_Error",
    );
    await this.safeRenameColumn(
      queryRunner,
      "jobs",
      "summary_timestamp",
      "summary_Timestamp",
    );

    await this.safeRenameColumn(
      queryRunner,
      "draft_jobs",
      "conversion_status",
      "conversion_Status",
    );
    await this.safeRenameColumn(
      queryRunner,
      "draft_jobs",
      "conversion_error",
      "conversion_Error",
    );
    await this.safeRenameColumn(
      queryRunner,
      "draft_jobs",
      "conversion_timestamp",
      "conversion_Timestamp",
    );

    await this.safeRenameColumn(
      queryRunner,
      "match_analysis",
      "generation_status",
      "generation_Status",
    );
    await this.safeRenameColumn(
      queryRunner,
      "match_analysis",
      "generation_error",
      "generation_Error",
    );
    await this.safeRenameColumn(
      queryRunner,
      "match_analysis",
      "generation_timestamp",
      "generation_Timestamp",
    );
  }

  private async safeRenameColumn(
    queryRunner: QueryRunner,
    table: string,
    oldName: string,
    newName: string,
  ): Promise<void> {
    const rows: { column_name: string }[] = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
      [table, oldName],
    );
    if (rows.length > 0) {
      await queryRunner.query(
        `ALTER TABLE "${table}" RENAME COLUMN "${oldName}" TO "${newName}"`,
      );
    }
  }
}

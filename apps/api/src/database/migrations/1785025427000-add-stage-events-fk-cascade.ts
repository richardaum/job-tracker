import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddStageEventsFkCascade1785025427000 implements MigrationInterface {
  name = "AddStageEventsFkCascade1785025427000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM job_stage_events WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_stage_events.job_id)`,
    );

    await queryRunner.query(
      `ALTER TABLE job_stage_events ADD CONSTRAINT "FK_job_stage_events_job_id" FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE job_stage_events DROP CONSTRAINT "FK_job_stage_events_job_id"`);
  }
}

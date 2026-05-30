import type { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizeStopwhenToArray1768100000000 implements MigrationInterface {
  name = "NormalizeStopwhenToArray1768100000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE source_templates
       SET config = jsonb_set(config, '{stopWhen}', to_jsonb(ARRAY[config->>'stopWhen']))
       WHERE config IS NOT NULL
         AND config->>'stopWhen' IS NOT NULL
         AND jsonb_typeof(config->'stopWhen') <> 'array'`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE source_templates
       SET config = jsonb_set(config, '{stopWhen}', to_jsonb(config->'stopWhen'->>0))
       WHERE config IS NOT NULL
         AND jsonb_typeof(config->'stopWhen') = 'array'`,
    );
  }
}

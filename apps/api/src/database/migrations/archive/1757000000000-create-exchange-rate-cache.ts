import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateExchangeRateCache1757000000000 implements MigrationInterface {
  name = "CreateExchangeRateCache1757000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS exchange_rate_cache (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        base_currency text NOT NULL,
        rates_json jsonb NOT NULL,
        ttl_seconds integer NOT NULL,
        expires_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT pk_exchange_rate_cache PRIMARY KEY (id),
        CONSTRAINT uq_exchange_rate_base_currency UNIQUE (base_currency)
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_exchange_rate_base_currency
      ON exchange_rate_cache (base_currency)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "DROP INDEX IF EXISTS idx_exchange_rate_base_currency",
    );
    await queryRunner.query("DROP TABLE IF EXISTS exchange_rate_cache");
  }
}

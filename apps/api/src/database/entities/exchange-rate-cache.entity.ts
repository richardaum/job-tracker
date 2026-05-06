import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "exchange_rate_cache" })
@Index("idx_exchange_rate_base_currency", ["baseCurrency"], { unique: true })
export class ExchangeRateCacheEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "base_currency", type: "text", unique: true })
  baseCurrency!: string;

  @Column({ name: "rates_json", type: "jsonb" })
  ratesJson!: Record<string, number>;

  @Column({ name: "ttl_seconds", type: "integer" })
  ttlSeconds!: number;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt!: Date;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}

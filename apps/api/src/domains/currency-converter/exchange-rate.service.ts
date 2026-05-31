import { ExchangeRateEntity } from "@api/database/entities/exchange-rate.entity";
import { tryRun } from "@job-tracker/try-run";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

export interface CachedExchangeRates {
  baseCurrency: string;
  rates: Record<string, number>;
  expiresAt: Date;
  ttlSeconds: number;
}

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);

  constructor(
    @InjectRepository(ExchangeRateEntity)
    private readonly repo: Repository<ExchangeRateEntity>,
  ) {}

  async get(baseCurrency: string): Promise<CachedExchangeRates | null> {
    const [findErr, entry] = await tryRun(this.repo.findOne({ where: { baseCurrency } }));
    if (findErr) {
      this.logger.error(`Failed to read cache for ${baseCurrency}`, findErr);
      return null;
    }
    if (!entry) return null;

    if (entry.expiresAt < new Date()) {
      const [delErr] = await tryRun(this.repo.delete({ id: entry.id }));
      if (delErr) {
        this.logger.error(`Failed to read cache for ${baseCurrency}`, delErr);
        return null;
      }
      this.logger.debug(`Cache expired for ${baseCurrency}, deleted entry`);
      return null;
    }

    return {
      baseCurrency: entry.baseCurrency,
      rates: entry.ratesJson,
      expiresAt: entry.expiresAt,
      ttlSeconds: entry.ttlSeconds,
    };
  }

  async set(
    baseCurrency: string,
    rates: Record<string, number>,
    ttlSeconds: number,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    const [upsertErr] = await tryRun(
      this.repo.upsert({ baseCurrency, ratesJson: rates, ttlSeconds, expiresAt }, ["baseCurrency"]),
    );

    if (upsertErr) {
      this.logger.error(`Failed to cache rates for ${baseCurrency}`, upsertErr);
      return;
    }

    this.logger.debug(`Cached rates for ${baseCurrency} (TTL: ${ttlSeconds}s)`);
  }

  async delete(baseCurrency: string): Promise<void> {
    const [delErr] = await tryRun(this.repo.delete({ baseCurrency }));
    if (delErr) {
      this.logger.error(`Failed to delete cache for ${baseCurrency}`, delErr);
      return;
    }
    this.logger.debug(`Deleted cache for ${baseCurrency}`);
  }

  async cleanExpired(): Promise<number> {
    const [cleanErr, result] = await tryRun(this.repo.delete({ expiresAt: new Date() }));
    if (cleanErr) {
      this.logger.error("Failed to clean expired cache entries", cleanErr);
      return 0;
    }

    const deleted = result.affected ?? 0;
    if (deleted > 0) {
      this.logger.log(`Cleaned ${deleted} expired cache entries`);
    }
    return deleted;
  }
}

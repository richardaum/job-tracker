import { ExchangeRateCacheEntity } from "@api/database/entities/exchange-rate-cache.entity";
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
export class ExchangeRateCacheService {
  private readonly logger = new Logger(ExchangeRateCacheService.name);

  constructor(
    @InjectRepository(ExchangeRateCacheEntity)
    private readonly repo: Repository<ExchangeRateCacheEntity>,
  ) {}

  async get(baseCurrency: string): Promise<CachedExchangeRates | null> {
    try {
      const entry = await this.repo.findOne({ where: { baseCurrency } });

      if (!entry) return null;

      if (entry.expiresAt < new Date()) {
        await this.repo.delete({ id: entry.id });
        this.logger.debug(`Cache expired for ${baseCurrency}, deleted entry`);
        return null;
      }

      return {
        baseCurrency: entry.baseCurrency,
        rates: entry.ratesJson,
        expiresAt: entry.expiresAt,
        ttlSeconds: entry.ttlSeconds,
      };
    } catch (error) {
      this.logger.error(`Failed to read cache for ${baseCurrency}`, error);
      return null;
    }
  }

  async set(
    baseCurrency: string,
    rates: Record<string, number>,
    ttlSeconds: number,
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

      await this.repo.upsert(
        { baseCurrency, ratesJson: rates, ttlSeconds, expiresAt },
        ["baseCurrency"],
      );

      this.logger.debug(
        `Cached rates for ${baseCurrency} (TTL: ${ttlSeconds}s)`,
      );
    } catch (error) {
      this.logger.error(`Failed to cache rates for ${baseCurrency}`, error);
    }
  }

  async delete(baseCurrency: string): Promise<void> {
    try {
      await this.repo.delete({ baseCurrency });
      this.logger.debug(`Deleted cache for ${baseCurrency}`);
    } catch (error) {
      this.logger.error(`Failed to delete cache for ${baseCurrency}`, error);
    }
  }

  async cleanExpired(): Promise<number> {
    try {
      const result = await this.repo.delete({ expiresAt: new Date() });
      const deleted = result.affected ?? 0;
      if (deleted > 0) {
        this.logger.log(`Cleaned ${deleted} expired cache entries`);
      }
      return deleted;
    } catch (error) {
      this.logger.error("Failed to clean expired cache entries", error);
      return 0;
    }
  }
}

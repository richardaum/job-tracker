import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

import { ExchangeRateCacheService } from "./exchange-rate-cache.service";

const CURRENCY_API_BASE = "https://api.frankfurter.app";
const FALLBACK_API_BASE = "https://open.er-api.com/v6/latest";

const FRANKFURTER_SUPPORTED = new Set([
  "USD",
  "EUR",
  "GBP",
  "CHF",
  "AUD",
  "CAD",
  "JPY",
  "CNY",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "CZK",
  "HUF",
  "RON",
  "BGN",
  "HRK",
  "ISK",
  "TRY",
  "ILS",
  "INR",
  "KRW",
  "SGD",
  "THB",
  "MYR",
  "IDR",
  "PHP",
  "MXN",
  "ZAR",
  "NZD",
  "HKD",
]);

const DEFAULT_TTL_SECONDS = 60 * 60;

@Injectable()
export class CurrencyConverterService implements OnModuleInit {
  private readonly logger = new Logger(CurrencyConverterService.name);

  constructor(private readonly cacheService: ExchangeRateCacheService) {}

  onModuleInit() {
    this.logger.log("Currency converter service initialized");
  }

  async getRates(
    base: string,
    targets: string[],
    ttlSeconds = DEFAULT_TTL_SECONDS,
  ): Promise<Record<string, number>> {
    const cached = await this.cacheService.get(base);
    if (cached) {
      return this.filterRates(cached.rates, targets, base);
    }

    let fetchedRates: Record<string, number> | null = null;
    let fetchError: Error | null = null;
    try {
      fetchedRates =
        (await this.fetchFromPrimary(base)) ??
        (await this.fetchFromFallback(base));
      if (!fetchedRates) {
        throw new Error("Failed to fetch exchange rates from all sources");
      }

      await this.cacheService.set(base, fetchedRates, ttlSeconds);
      return this.filterRates(fetchedRates, targets, base);
    } catch (error) {
      fetchError = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to fetch rates for ${base}`, error);
    }

    throw fetchError ?? new Error("Failed to fetch exchange rates");
  }

  async refreshRates(
    base: string,
    targets: string[],
    ttlSeconds = DEFAULT_TTL_SECONDS,
  ): Promise<Record<string, number>> {
    await this.cacheService.delete(base);
    return this.getRates(base, targets, ttlSeconds);
  }

  private async fetchFromPrimary(
    base: string,
  ): Promise<Record<string, number> | null> {
    if (!FRANKFURTER_SUPPORTED.has(base)) {
      return null;
    }

    try {
      const response = await fetch(`${CURRENCY_API_BASE}/latest?from=${base}`);
      if (!response.ok) return null;
      const data = (await response.json()) as { rates: Record<string, number> };
      return data.rates;
    } catch {
      return null;
    }
  }

  private async fetchFromFallback(
    base: string,
  ): Promise<Record<string, number> | null> {
    try {
      const response = await fetch(`${FALLBACK_API_BASE}/${base}`);
      if (!response.ok) return null;
      const data = (await response.json()) as { rates: Record<string, number> };
      return data.rates;
    } catch {
      return null;
    }
  }

  private filterRates(
    rates: Record<string, number>,
    targets: string[],
    base: string,
  ): Record<string, number> {
    const filtered: Record<string, number> = {};
    filtered[base] = 1;
    for (const target of targets) {
      if (rates[target] !== undefined) {
        filtered[target] = rates[target];
      }
    }
    return filtered;
  }
}

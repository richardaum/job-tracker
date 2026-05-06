import { ExchangeRateCacheEntity } from "@api/database/entities/exchange-rate-cache.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CurrencyConverterResolver } from "./currency-converter.resolver";
import { CurrencyConverterService } from "./currency-converter.service";
import { ExchangeRateCacheService } from "./exchange-rate-cache.service";

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([ExchangeRateCacheEntity])],
  providers: [
    ExchangeRateCacheService,
    CurrencyConverterService,
    CurrencyConverterResolver,
  ],
  exports: [CurrencyConverterService],
})
export class CurrencyConverterModule {}

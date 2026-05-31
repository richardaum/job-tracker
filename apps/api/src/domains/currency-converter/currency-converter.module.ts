import { ExchangeRateEntity } from "@api/database/entities/exchange-rate.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CurrencyConverterResolver } from "./currency-converter.resolver";
import { CurrencyConverterService } from "./currency-converter.service";
import { ExchangeRateService } from "./exchange-rate.service";

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([ExchangeRateEntity])],
  providers: [
    ExchangeRateService,
    CurrencyConverterService,
    CurrencyConverterResolver,
  ],
  exports: [CurrencyConverterService],
})
export class CurrencyConverterModule {}

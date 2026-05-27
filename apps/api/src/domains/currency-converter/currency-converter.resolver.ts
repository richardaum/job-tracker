import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";

import { CurrencyRates } from "./currency.types";
import { CurrencyConverterService } from "./currency-converter.service";

@Resolver(() => CurrencyRates)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class CurrencyConverterResolver {
  constructor(private readonly service: CurrencyConverterService) {}

  @Query(() => CurrencyRates)
  async exchangeRates(
    @Args("base") base: string,
    @Args("currencies", { type: () => [String] }) currencies: string[],
  ): Promise<CurrencyRates> {
    const rates = await this.service.getRates(base, currencies);
    return {
      base,
      rates: Object.entries(rates).map(([currency, rate]) => ({
        currency,
        rate,
      })),
    };
  }
}

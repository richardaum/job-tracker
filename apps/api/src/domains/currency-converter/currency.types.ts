import { Field, Float, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ExchangeRate {
  @Field(() => String)
  currency!: string;

  @Field(() => Float)
  rate!: number;
}

@ObjectType()
export class CurrencyRates {
  @Field(() => String)
  base!: string;

  @Field(() => [ExchangeRate])
  rates!: ExchangeRate[];
}

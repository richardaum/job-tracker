import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType("AiUsageTotals")
export class AiUsageTotalsType {
  @Field(() => Int)
  inputTokens!: number;

  @Field(() => Int)
  outputTokens!: number;

  @Field(() => Int)
  totalTokens!: number;

  @Field(() => Int)
  calls!: number;
}

@ObjectType("AiUsageSummary")
export class AiUsageSummaryType {
  @Field(() => AiUsageTotalsType)
  personalKey!: AiUsageTotalsType;

  @Field(() => AiUsageTotalsType)
  trial!: AiUsageTotalsType;

  @Field(() => Int)
  trialCallsUsed!: number;

  @Field(() => Int)
  trialCallsLimit!: number;
}

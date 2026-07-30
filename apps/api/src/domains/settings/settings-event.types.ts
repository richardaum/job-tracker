import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AiUsageChangedEventType {
  @Field(() => Int)
  trialCallsUsed!: number;

  @Field()
  hasOpenAiKey!: boolean;
}

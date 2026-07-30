import { Field, Int, ObjectType } from "@nestjs/graphql";

import { BlockedKeywordType } from "./keyword-blocker.types";

@ObjectType("UserSetting")
export class UserSettingType {
  @Field()
  userId!: string;

  @Field()
  autoFillEnabled!: boolean;

  @Field()
  autoSummaryEnabled!: boolean;

  @Field()
  autoMatchEnabled!: boolean;

  @Field()
  aiEnabled!: boolean;

  @Field()
  hasOpenAiKey!: boolean;

  @Field(() => Int)
  duplicateWindowDays!: number;

  @Field(() => Int)
  trialCallsUsed!: number;

  @Field(() => Int)
  trialCallsLimit!: number;

  @Field(() => [BlockedKeywordType], { nullable: true })
  blockedKeywords?: BlockedKeywordType[];

  @Field(() => [String], { nullable: true })
  blockedCompanies?: string[];
}

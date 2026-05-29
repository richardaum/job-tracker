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

  @Field(() => Int)
  duplicateWindowDays!: number;

  @Field(() => [BlockedKeywordType], { nullable: true })
  blockedKeywords?: BlockedKeywordType[];

  @Field(() => [String], { nullable: true })
  blockedCompanies?: string[];
}

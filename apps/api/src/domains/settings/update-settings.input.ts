import { Field, InputType, Int } from "@nestjs/graphql";

import { BlockedKeywordInput } from "./keyword-blocker.types";

@InputType("UpdateSettingsInput")
export class UpdateSettingsInput {
  @Field(() => Boolean, { nullable: true })
  autoFillEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  autoSummaryEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  autoMatchEnabled?: boolean;

  @Field(() => Int, { nullable: true })
  duplicateWindowDays?: number;

  @Field(() => [BlockedKeywordInput], { nullable: true })
  blockedKeywords?: BlockedKeywordInput[];

  @Field(() => [String], { nullable: true })
  blockedCompanies?: string[];
}

import { Field, InputType, Int } from "@nestjs/graphql";

@InputType("UpdateSettingsInput")
export class UpdateSettingsInput {
  @Field(() => Boolean, { nullable: true })
  autoFillEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  autoSummaryEnabled?: boolean;

  @Field(() => Int, { nullable: true })
  duplicateWindowDays?: number;
}

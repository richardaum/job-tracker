import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType("UserSetting")
export class UserSettingType {
  @Field()
  userId!: string;

  @Field()
  autoFillEnabled!: boolean;

  @Field()
  autoSummaryEnabled!: boolean;

  @Field(() => Int)
  duplicateWindowDays!: number;
}

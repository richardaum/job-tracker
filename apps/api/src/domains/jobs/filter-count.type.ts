import { Field, Int, ObjectType } from "@nestjs/graphql";

import { ApplicationQuickFilterEnum } from "./job-quick-filter.enum";

@ObjectType()
export class FilterCountType {
  @Field(() => ApplicationQuickFilterEnum)
  key!: ApplicationQuickFilterEnum;

  @Field(() => Int)
  count!: number;
}

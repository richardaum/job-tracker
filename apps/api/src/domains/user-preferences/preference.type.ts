import { Field, ObjectType } from "@nestjs/graphql";

import { WeightEnum } from "./weight.enum";

@ObjectType()
export class PreferenceType {
  @Field()
  text!: string;

  @Field(() => WeightEnum)
  weight!: WeightEnum;
}

import { Field, InputType } from "@nestjs/graphql";

import { WeightEnum } from "./weight.enum";

@InputType()
export class PreferenceInput {
  @Field()
  text!: string;

  @Field(() => WeightEnum)
  weight!: WeightEnum;
}

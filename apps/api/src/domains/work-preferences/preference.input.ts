import { Field, InputType } from "@nestjs/graphql";
import { MaxLength } from "class-validator";

import { WeightEnum } from "./weight.enum";

@InputType()
export class PreferenceInput {
  @Field()
  @MaxLength(255)
  text!: string;

  @Field(() => WeightEnum)
  weight!: WeightEnum;
}

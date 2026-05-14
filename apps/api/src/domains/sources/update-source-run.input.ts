import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateSourceRunInput {
  @Field(() => String)
  surfaceUrl!: string;
}

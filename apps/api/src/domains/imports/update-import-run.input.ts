import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateImportRunInput {
  @Field(() => String)
  surfaceUrl!: string;
}

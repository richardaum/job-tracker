import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateResumeInput {
  @Field()
  title!: string;

  @Field()
  content!: string;

  @Field({ defaultValue: false })
  isDefault?: boolean;
}

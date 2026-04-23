import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class CreateApplicationInput {
  @Field()
  title!: string;

  @Field()
  company!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  url?: string | null;
}

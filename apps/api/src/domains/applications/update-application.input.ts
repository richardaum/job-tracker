import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class UpdateApplicationInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  company?: string;

  @Field(() => String, { nullable: true })
  url?: string | null;

  @Field({ nullable: true })
  appliedAt?: Date;
}

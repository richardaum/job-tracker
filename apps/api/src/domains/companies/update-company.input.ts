import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class UpdateCompanyInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;
}

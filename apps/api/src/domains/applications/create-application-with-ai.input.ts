import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class AiExtractionFieldInput {
  @Field()
  label!: string;

  @Field(() => String, { nullable: true })
  metadata?: string | null;
}

@InputType()
export class CreateApplicationWithAIInput {
  @Field()
  prompt!: string;

  @Field(() => [AiExtractionFieldInput], { nullable: true })
  fields?: AiExtractionFieldInput[] | null;
}

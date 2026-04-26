import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class AiExtractionTagInput {
  @Field()
  label!: string;

  @Field(() => String, { nullable: true })
  metadata?: string | null;
}

@InputType()
export class CreateApplicationWithAIInput {
  @Field()
  prompt!: string;

  @Field(() => [AiExtractionTagInput], { nullable: true })
  tags?: AiExtractionTagInput[] | null;
}

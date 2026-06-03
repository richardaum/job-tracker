import { Field, ID, ObjectType } from "@nestjs/graphql";
import { AsyncMetadataType } from "@api/domains/shared/async-metadata.type";

@ObjectType()
export class AiConversationType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  jobId!: string;

  @Field()
  title!: string;

  @Field(() => AsyncMetadataType, { nullable: true })
  generatingStatus?: AsyncMetadataType | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

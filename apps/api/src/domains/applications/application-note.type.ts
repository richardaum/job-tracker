import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ApplicationNoteType {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  applicationId!: string | null;

  @Field()
  userId!: string;

  @Field()
  content!: string;

  @Field(() => Int)
  revision!: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

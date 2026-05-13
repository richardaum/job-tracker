import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ResumeType {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field()
  title!: string;

  @Field()
  content!: string;

  @Field()
  isDefault!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

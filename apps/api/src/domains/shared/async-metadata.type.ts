import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";

export enum AsyncMetadataStatusEnum {
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}
registerEnumType(AsyncMetadataStatusEnum, { name: "AsyncMetadataStatus" });

export interface AsyncMetadata {
  status: AsyncMetadataStatusEnum;
  error?: string;
  generatedAt?: string;
}

@ObjectType()
export class AsyncMetadataType {
  @Field(() => AsyncMetadataStatusEnum)
  status!: AsyncMetadataStatusEnum;

  @Field(() => String, { nullable: true })
  error?: string | null;

  @Field(() => String, { nullable: true })
  generatedAt?: string | null;
}

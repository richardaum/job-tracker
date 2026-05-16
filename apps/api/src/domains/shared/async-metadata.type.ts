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
  timestamp?: string;
}

@ObjectType()
export class AsyncMetadataType {
  @Field(() => AsyncMetadataStatusEnum)
  status!: AsyncMetadataStatusEnum;

  @Field(() => String, { nullable: true })
  error?: string | null;

  @Field(() => String, { nullable: true })
  timestamp?: string | null;
}

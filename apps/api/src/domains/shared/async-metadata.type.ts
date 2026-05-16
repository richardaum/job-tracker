import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";

export enum AsyncMetadataStatus {
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}
registerEnumType(AsyncMetadataStatus, { name: "AsyncMetadataStatus" });

export interface AsyncMetadata {
  status: AsyncMetadataStatus;
  error?: string;
  generatedAt?: string;
}

@ObjectType()
export class AsyncMetadataType {
  @Field(() => AsyncMetadataStatus)
  status!: AsyncMetadataStatus;

  @Field(() => String, { nullable: true })
  error?: string | null;

  @Field(() => String, { nullable: false })
  generatedAt!: string;
}

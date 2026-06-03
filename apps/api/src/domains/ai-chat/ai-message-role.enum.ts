import { registerEnumType } from "@nestjs/graphql";

export enum AiMessageRoleEnum {
  User = "User",
  Assistant = "Assistant",
}

registerEnumType(AiMessageRoleEnum, { name: "AiMessageRole" });

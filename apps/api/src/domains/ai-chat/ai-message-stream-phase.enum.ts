import { registerEnumType } from "@nestjs/graphql";

export enum AiMessageStreamPhaseEnum {
  Ready = "Ready",
  Streaming = "Streaming",
  Complete = "Complete",
  Failed = "Failed",
}

registerEnumType(AiMessageStreamPhaseEnum, { name: "AiMessageStreamPhase" });

import { registerEnumType } from "@nestjs/graphql";

export enum WeightEnum {
  HIGH = "HIGH",
  LOW = "LOW",
}

registerEnumType(WeightEnum, { name: "Weight" });

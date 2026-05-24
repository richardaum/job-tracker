import { registerEnumType } from "@nestjs/graphql";

export enum WeightEnum {
  High = "High",
  Low = "Low",
}

registerEnumType(WeightEnum, { name: "Weight" });

import { ApplicationStage } from "@/gql/hooks";

export function formatStage(value: ApplicationStage) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

import { ApplicationStage, type JobQuery } from "@/gql/hooks";

export type JobDetailsValues = JobQuery["job"];

export function formatStage(value: ApplicationStage) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function getStageTimelineDotColor(stage: ApplicationStage) {
  switch (stage) {
    case ApplicationStage.Draft:
      return "text-text-muted";
    case ApplicationStage.Offer:
      return "text-text-success";
    case ApplicationStage.Rejected:
      return "text-text-error";
    case ApplicationStage.RecruiterScreen:
      return "text-text-warning";
    case ApplicationStage.Technical:
      return "text-text-brand";
    case ApplicationStage.CulturalFit:
      return "text-text-brand";
    case ApplicationStage.Duplicated:
      return "text-text-warning";
    default:
      return "text-text-secondary";
  }
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

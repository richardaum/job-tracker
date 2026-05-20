import { type JobQuery, JobStage } from "@/gql/hooks";

export type JobDetailsValues = JobQuery["job"];

export function formatStage(value: JobStage) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function getStageTimelineDotColor(stage: JobStage) {
  switch (stage) {
    case JobStage.Offer:
      return "text-text-success";
    case JobStage.Rejected:
      return "text-text-error";
    case JobStage.RecruiterScreen:
      return "text-text-warning";
    case JobStage.Technical:
      return "text-text-brand";
    case JobStage.CulturalFit:
      return "text-text-brand";
    case JobStage.Duplicated:
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
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

import {
  ApplicationSource,
  ApplicationStage,
  type SalaryPeriod,
} from "@/gql/hooks";

export interface ApplicationDetailsValues {
  id: string;
  title: string;
  companyId: string;
  company: { id: string; name: string; description?: string | null };
  description?: string | null;
  url?: string | null;
  source?: ApplicationSource | null;
  salaryMinCents?: number | null;
  salaryMaxCents?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: SalaryPeriod | null;
  tags?: string[];
}

export function formatStage(value: ApplicationStage) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function getStageTimelineDotColor(stage: ApplicationStage) {
  switch (stage) {
    case ApplicationStage.Offer:
      return "text-text-success";
    case ApplicationStage.Rejected:
      return "text-text-error";
    case ApplicationStage.RecruiterScreen:
      return "text-text-warning";
    case ApplicationStage.Technical:
      return "text-text-brand";
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

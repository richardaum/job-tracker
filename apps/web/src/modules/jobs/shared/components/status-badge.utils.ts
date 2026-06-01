import { ApplicationStage } from "@/gql/hooks";

const STAGE_LABEL_MAP: Record<ApplicationStage, string> = {
  [ApplicationStage.Draft]: "Draft",
  [ApplicationStage.New]: "New",
  [ApplicationStage.Applied]: "Applied",
  [ApplicationStage.RecruiterScreen]: "Recruiter Screen",
  [ApplicationStage.Technical]: "Technical",
  [ApplicationStage.CulturalFit]: "Cultural Fit",
  [ApplicationStage.Offer]: "Offer",
  [ApplicationStage.Rejected]: "Rejected",
  [ApplicationStage.Duplicated]: "Duplicated",
};

export function formatStage(value: ApplicationStage) {
  return STAGE_LABEL_MAP[value];
}

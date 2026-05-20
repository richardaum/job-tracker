import { FitClassification } from "@/gql/hooks";

export function formatFitClassification(
  classification: string | null | undefined,
): string {
  if (classification === FitClassification.Positive) return "Strong fit";
  if (classification === FitClassification.Negative) return "Weak fit";
  return "Inconclusive";
}

export function formatFitScore(
  scoreRatio: number | null | undefined,
): string | null {
  if (scoreRatio == null) return null;
  return `${Math.round(scoreRatio)}%`;
}

export function formatFitLabel(
  classification: string | null | undefined,
  scoreRatio: number | null | undefined,
): string {
  const label = formatFitClassification(classification);
  const score = formatFitScore(scoreRatio);
  return score ? `${label} - ${score}` : label;
}

export function formatRequirementType(type: string | null | undefined): string {
  if (type === "MUST_HAVE") return "Required";
  if (type === "NICE_TO_HAVE") return "Plus";
  if (type === "SOFT_SKILL") return "Soft Skill";
  return type ?? "";
}

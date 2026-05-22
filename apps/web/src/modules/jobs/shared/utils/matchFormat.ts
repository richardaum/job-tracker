import { FitClassification, RequirementType } from "@/gql/hooks";

export function formatMatchClassification(
  classification: string | null | undefined,
): string {
  if (classification === FitClassification.Positive) return "Strong match";
  if (classification === FitClassification.Negative) return "Weak match";
  return "Inconclusive";
}

export function formatMatchScore(
  scoreRatio: number | null | undefined,
): string | null {
  if (scoreRatio == null) return null;
  return `${Math.round(scoreRatio)}%`;
}

export function formatMatchLabel(
  classification: string | null | undefined,
  scoreRatio: number | null | undefined,
): string {
  const label = formatMatchClassification(classification);
  const score = formatMatchScore(scoreRatio);
  return score ? `${label} - ${score}` : label;
}

export function formatRequirementType(type: string | null | undefined): string {
  if (type === RequirementType.MustHave) return "Required";
  if (type === RequirementType.NiceToHave) return "Plus";
  if (type === RequirementType.SoftSkill) return "Soft Skill";
  return type ?? "";
}

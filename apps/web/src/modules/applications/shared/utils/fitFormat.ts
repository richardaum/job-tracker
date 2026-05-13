export function formatFitClassification(
  classification: string | null | undefined,
): string {
  if (classification === "positive") return "Strong fit";
  if (classification === "negative") return "Weak fit";
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
  if (type === "must_have") return "Required";
  if (type === "nice_to_have") return "Plus";
  if (type === "soft_skill") return "Soft Skill";
  return type ?? "";
}

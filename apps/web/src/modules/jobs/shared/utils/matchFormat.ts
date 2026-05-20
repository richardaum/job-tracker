export function formatMatchClassification(
  classification: string | null | undefined,
): string {
  if (classification === "positive") return "Strong match";
  if (classification === "negative") return "Weak match";
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
  if (type === "must_have") return "Required";
  if (type === "nice_to_have") return "Plus";
  if (type === "soft_skill") return "Soft Skill";
  return type ?? "";
}

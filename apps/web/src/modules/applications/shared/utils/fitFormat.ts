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

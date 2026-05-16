import type {
  FitClassification,
  FitItem,
} from "@api/database/entities/fit-analysis.entity";
import { RequirementTypeEnum } from "@api/database/entities/fit-analysis.entity";

export interface ScoreResult {
  scoreRatio: number;
  classification: FitClassification;
  fitCount: number;
  gapCount: number;
  unclearCount: number;
}

function itemPoints(item: FitItem): number {
  if (item.verdict !== "fit") return 0;

  if (item.source === "resume") {
    switch (item.type) {
      case RequirementTypeEnum.MUST_HAVE:
        return 5;
      case RequirementTypeEnum.NICE_TO_HAVE:
        return 2;
      case RequirementTypeEnum.SOFT_SKILL:
        return 1;
      default:
        return 1;
    }
  }

  // Preferences
  return item.weight === "high" ? 2 : 1;
}

function maxPossible(items: FitItem[]): number {
  if (items.length === 0) return 0;

  return items.reduce((sum, item) => {
    if (item.source === "resume") {
      switch (item.type) {
        case RequirementTypeEnum.MUST_HAVE:
          return sum + 5;
        case RequirementTypeEnum.NICE_TO_HAVE:
          return sum + 2;
        case RequirementTypeEnum.SOFT_SKILL:
          return sum + 1;
        default:
          return sum + 1;
      }
    }
    // Preferences
    return sum + (item.weight === "high" ? 2 : 1);
  }, 0);
}

export function computeScore(items: FitItem[]): ScoreResult {
  const total = items.reduce((sum, item) => sum + itemPoints(item), 0);
  const max = maxPossible(items);

  const fitCount = items.filter((i) => i.verdict === "fit").length;
  const gapCount = items.filter((i) => i.verdict === "gap").length;
  const unclearCount = items.filter((i) => i.verdict === "unclear").length;

  const hasMustHaveGap = items.some(
    (i) =>
      i.source === "resume" &&
      i.type === RequirementTypeEnum.MUST_HAVE &&
      i.verdict === "gap",
  );

  const scoreRatio = max > 0 ? (total / max) * 100 : 0;
  const unclearMajority = unclearCount > items.length / 2;

  let classification: FitClassification;
  if (items.length === 0 || unclearMajority) {
    classification = "neutral";
  } else if (scoreRatio >= 65 && !hasMustHaveGap) {
    classification = "positive";
  } else if (scoreRatio <= 35 || (scoreRatio < 65 && hasMustHaveGap)) {
    classification = "negative";
  } else {
    classification = "neutral";
  }

  return { scoreRatio, classification, fitCount, gapCount, unclearCount };
}

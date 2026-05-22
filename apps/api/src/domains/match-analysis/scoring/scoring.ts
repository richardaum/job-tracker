import type { MatchItem } from "@api/database/entities/match-analysis.entity";
import { RequirementTypeEnum } from "@api/database/entities/match-analysis.entity";
import { FitClassificationEnum } from "@api/domains/match-analysis/fit-classification.enum";
import { FitSourceEnum } from "@api/domains/match-analysis/fit-source.enum";
import { FitVerdictEnum } from "@api/domains/match-analysis/fit-verdict.enum";

export interface ScoreResult {
  scoreRatio: number;
  classification: FitClassificationEnum;
  matchCount: number;
  gapCount: number;
  unclearCount: number;
}

function itemPoints(item: MatchItem): number {
  if (item.verdict !== FitVerdictEnum.Fit) return 0;

  if (item.source === FitSourceEnum.Resume) {
    switch (item.type) {
      case RequirementTypeEnum.MustHave:
        return 5;
      case RequirementTypeEnum.NiceToHave:
        return 2;
      case RequirementTypeEnum.SoftSkill:
        return 1;
      default:
        return 1;
    }
  }

  // Preferences
  return item.weight === "high" ? 2 : 1;
}

function maxPossible(items: MatchItem[]): number {
  if (items.length === 0) return 0;

  return items.reduce((sum, item) => {
    if (item.source === FitSourceEnum.Resume) {
      switch (item.type) {
        case RequirementTypeEnum.MustHave:
          return sum + 5;
        case RequirementTypeEnum.NiceToHave:
          return sum + 2;
        case RequirementTypeEnum.SoftSkill:
          return sum + 1;
        default:
          return sum + 1;
      }
    }
    // Preferences
    return sum + (item.weight === "high" ? 2 : 1);
  }, 0);
}

export function computeScore(items: MatchItem[]): ScoreResult {
  const total = items.reduce((sum, item) => sum + itemPoints(item), 0);
  const max = maxPossible(items);

  const matchCount = items.filter(
    (i) => i.verdict === FitVerdictEnum.Fit,
  ).length;
  const gapCount = items.filter((i) => i.verdict === FitVerdictEnum.Gap).length;
  const unclearCount = items.filter(
    (i) => i.verdict === FitVerdictEnum.Unclear,
  ).length;

  const hasMustHaveGap = items.some(
    (i) =>
      i.source === FitSourceEnum.Resume &&
      i.type === RequirementTypeEnum.MustHave &&
      i.verdict === FitVerdictEnum.Gap,
  );

  const scoreRatio = max > 0 ? (total / max) * 100 : 0;
  const unclearMajority = unclearCount > items.length / 2;

  let classification: FitClassificationEnum;
  if (items.length === 0 || unclearMajority) {
    classification = FitClassificationEnum.Neutral;
  } else if (scoreRatio >= 65 && !hasMustHaveGap) {
    classification = FitClassificationEnum.Positive;
  } else if (scoreRatio <= 35 || (scoreRatio < 65 && hasMustHaveGap)) {
    classification = FitClassificationEnum.Negative;
  } else {
    classification = FitClassificationEnum.Neutral;
  }

  return { scoreRatio, classification, matchCount, gapCount, unclearCount };
}

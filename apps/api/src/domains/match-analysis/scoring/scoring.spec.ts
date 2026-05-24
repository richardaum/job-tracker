import {
  MatchItem,
  RequirementTypeEnum,
} from "@api/database/entities/match-analysis.entity";
import { FitClassificationEnum } from "@api/domains/match-analysis/fit-classification.enum";
import { MatchSourceEnum } from "@api/domains/match-analysis/match-source.enum";
import { MatchVerdictEnum } from "@api/domains/match-analysis/match-verdict.enum";
import { describe, expect, it } from "vitest";

import { computeScore } from "./scoring";

function resumeFit(overrides?: Partial<MatchItem>): MatchItem {
  return {
    requirement: "test",
    source: MatchSourceEnum.Resume,
    type: RequirementTypeEnum.NiceToHave,
    verdict: MatchVerdictEnum.Fit,
    jdQuote: "JD says X",
    sourceQuotes: ["Resume says X"],
    ...overrides,
  };
}

function mustHaveFit(overrides?: Partial<MatchItem>): MatchItem {
  return resumeFit({ type: RequirementTypeEnum.MustHave, ...overrides });
}

function mustHaveGap(overrides?: Partial<MatchItem>): MatchItem {
  return resumeFit({
    type: RequirementTypeEnum.MustHave,
    verdict: MatchVerdictEnum.Gap,
    sourceQuotes: [],
    ...overrides,
  });
}

function niceToHaveGap(overrides?: Partial<MatchItem>): MatchItem {
  return resumeFit({
    verdict: MatchVerdictEnum.Gap,
    sourceQuotes: [],
    ...overrides,
  });
}

function softSkillFit(overrides?: Partial<MatchItem>): MatchItem {
  return resumeFit({ type: RequirementTypeEnum.SoftSkill, ...overrides });
}

function resumeUnclear(overrides?: Partial<MatchItem>): MatchItem {
  return resumeFit({ verdict: MatchVerdictEnum.Unclear, ...overrides });
}

function prefFit(
  weight: "high" | "low",
  overrides?: Partial<MatchItem>,
): MatchItem {
  return resumeFit({
    source: MatchSourceEnum.Preference,
    weight,
    ...overrides,
  });
}

describe("computeScore", () => {
  describe("point assignments (weighted average)", () => {
    it("resume nice_to_have fit = full weight (2/2)", () => {
      const result = computeScore([resumeFit()]);
      expect(result.scoreRatio).toBe(100);
      expect(result.classification).toBe(FitClassificationEnum.Positive);
    });

    it("resume must_have fit = full weight (5/5)", () => {
      const result = computeScore([mustHaveFit()]);
      expect(result.scoreRatio).toBe(100);
      expect(result.classification).toBe(FitClassificationEnum.Positive);
    });

    it("resume soft_skill fit = full weight (1/1)", () => {
      const result = computeScore([softSkillFit()]);
      expect(result.scoreRatio).toBe(100);
      expect(result.classification).toBe(FitClassificationEnum.Positive);
    });

    it("resume nice_to_have gap = 0 points (0/2)", () => {
      const result = computeScore([niceToHaveGap()]);
      expect(result.scoreRatio).toBe(0);
      expect(result.classification).toBe(FitClassificationEnum.Negative);
    });

    it("resume must_have gap = 0 points (0/5)", () => {
      const result = computeScore([mustHaveGap()]);
      expect(result.scoreRatio).toBe(0);
      expect(result.classification).toBe(FitClassificationEnum.Negative);
    });

    it("preference fit low = full weight (1/1)", () => {
      const result = computeScore([prefFit("low")]);
      expect(result.scoreRatio).toBe(100);
      expect(result.classification).toBe(FitClassificationEnum.Positive);
    });

    it("preference fit high = full weight (2/2)", () => {
      const result = computeScore([prefFit("high")]);
      expect(result.scoreRatio).toBe(100);
      expect(result.classification).toBe(FitClassificationEnum.Positive);
    });
  });

  describe("proportionality", () => {
    it("must_have gap has more impact than nice_to_have fit", () => {
      // Must-have (5) GAP + Nice-to-have (2) FIT = 2 / 7 = 28.57%
      const items = [mustHaveGap(), resumeFit()];
      const result = computeScore(items);
      expect(result.scoreRatio).toBeCloseTo(28.57, 1);
      expect(result.classification).toBe(FitClassificationEnum.Negative);
    });

    it("must_have FIT + nice_to_have GAP = 5 / 7 = 71.43%", () => {
      const items = [mustHaveFit(), niceToHaveGap()];
      const result = computeScore(items);
      expect(result.scoreRatio).toBeCloseTo(71.43, 1);
      // Even with high score, should be neutral because of nice_to_have gap?
      // Actually, currently only must_have gap forces negative/neutral if score is high.
      expect(result.classification).toBe(FitClassificationEnum.Positive);
    });
  });

  describe("classification thresholds", () => {
    it("positive when ratio >= 65 and no must_have gap", () => {
      const items = [mustHaveFit(), mustHaveFit(), resumeFit()]; // (5+5+2)/12 = 100%
      const result = computeScore(items);
      expect(result.classification).toBe(FitClassificationEnum.Positive);
    });

    it("negative if must_have gap exists even if score is mid-range", () => {
      // must_have GAP (0) + 2x nice_to_have FIT (4) = 4 / 9 = 44.44%
      // Current rules: score <= 35 OR (score < 65 AND hasMustHaveGap) -> negative
      const items = [mustHaveGap(), resumeFit(), resumeFit()];
      const result = computeScore(items);
      expect(result.scoreRatio).toBeCloseTo(44.44, 1);
      expect(result.classification).toBe(FitClassificationEnum.Negative);
    });

    it("neutral if ratio is high but has must_have gap", () => {
      // 10x nice_to_have FIT (20) + must_have GAP (0) = 20 / 25 = 80%
      const items = [
        ...Array.from({ length: 10 }, () => resumeFit()),
        mustHaveGap(),
      ];
      const result = computeScore(items);
      expect(result.scoreRatio).toBe(80);
      expect(result.classification).toBe(FitClassificationEnum.Neutral);
    });
  });

  describe("unclear majority override", () => {
    it("neutral when unclear > 50% of items", () => {
      const items = [
        resumeUnclear(),
        resumeUnclear(),
        resumeUnclear(),
        resumeFit(),
      ];
      const result = computeScore(items);
      expect(result.classification).toBe(FitClassificationEnum.Neutral);
    });
  });

  describe("empty", () => {
    it("returns zeroes for empty items", () => {
      const result = computeScore([]);
      expect(result.scoreRatio).toBe(0);
      expect(result.classification).toBe(FitClassificationEnum.Neutral);
    });
  });
});

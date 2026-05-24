import {
  type MatchItem,
  RequirementTypeEnum,
} from "@api/database/entities/match-analysis.entity";
import { describe, expect, it } from "vitest";

import { MatchSourceEnum } from "./match-source.enum";
import { MatchVerdictEnum } from "./match-verdict.enum";
import {
  normalizeMatchItem,
  normalizeMatchSource,
  normalizeMatchVerdict,
  normalizeRequirementType,
} from "./normalize-match-items.util";

describe("normalizeMatchItems", () => {
  it("normalizes lowercase match source values", () => {
    expect(normalizeMatchSource("resume")).toBe(MatchSourceEnum.Resume);
    expect(normalizeMatchSource("preference")).toBe(MatchSourceEnum.Preference);
    expect(normalizeMatchSource("Resume")).toBe(MatchSourceEnum.Resume);
  });

  it("normalizes lowercase match verdict values", () => {
    expect(normalizeMatchVerdict("fit")).toBe(MatchVerdictEnum.Fit);
    expect(normalizeMatchVerdict("gap")).toBe(MatchVerdictEnum.Gap);
    expect(normalizeMatchVerdict("unclear")).toBe(MatchVerdictEnum.Unclear);
  });

  it("normalizes requirement type case-insensitively", () => {
    expect(normalizeRequirementType("musthave")).toBe(
      RequirementTypeEnum.MustHave,
    );
    expect(normalizeRequirementType("MUST_HAVE")).toBe(
      RequirementTypeEnum.MustHave,
    );
    expect(normalizeRequirementType("niceToHave")).toBe(
      RequirementTypeEnum.NiceToHave,
    );
    expect(normalizeRequirementType("NICE_TO_HAVE")).toBe(
      RequirementTypeEnum.NiceToHave,
    );
    expect(normalizeRequirementType("softskill")).toBe(
      RequirementTypeEnum.SoftSkill,
    );
    expect(normalizeRequirementType("SOFT_SKILL")).toBe(
      RequirementTypeEnum.SoftSkill,
    );
  });

  it("normalizes legacy lowercase match item fields for GraphQL", () => {
    const legacyItem = {
      requirement: "Rust",
      source: "resume",
      type: "MUST_HAVE",
      verdict: "fit",
      jdQuote: "Rust",
      sourceQuotes: [],
    } as unknown as MatchItem;

    expect(normalizeMatchItem(legacyItem)).toEqual({
      requirement: "Rust",
      source: MatchSourceEnum.Resume,
      type: RequirementTypeEnum.MustHave,
      verdict: MatchVerdictEnum.Fit,
      jdQuote: "Rust",
      sourceQuotes: [],
    });
  });
});

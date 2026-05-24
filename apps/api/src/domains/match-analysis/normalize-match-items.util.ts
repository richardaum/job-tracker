import type { MatchAnalysisEntity } from "@api/database/entities/match-analysis.entity";
import {
  type MatchItem,
  RequirementTypeEnum,
} from "@api/database/entities/match-analysis.entity";

import { MatchSourceEnum } from "./match-source.enum";
import { MatchVerdictEnum } from "./match-verdict.enum";

export function normalizeMatchSource(
  source: string | null | undefined,
): MatchSourceEnum | undefined {
  if (!source) return undefined;
  const capitalized =
    source.charAt(0).toUpperCase() + source.slice(1).toLowerCase();
  if (
    capitalized === MatchSourceEnum.Resume ||
    capitalized === MatchSourceEnum.Preference
  ) {
    return capitalized as MatchSourceEnum;
  }
  return undefined;
}

export function normalizeMatchVerdict(
  verdict: string | null | undefined,
): MatchVerdictEnum | undefined {
  if (!verdict) return undefined;
  const capitalized =
    verdict.charAt(0).toUpperCase() + verdict.slice(1).toLowerCase();
  if (
    capitalized === MatchVerdictEnum.Fit ||
    capitalized === MatchVerdictEnum.Gap ||
    capitalized === MatchVerdictEnum.Unclear
  ) {
    return capitalized as MatchVerdictEnum;
  }
  return undefined;
}

export function normalizeRequirementType(
  type: string | null | undefined,
): RequirementTypeEnum | undefined {
  if (!type) return undefined;
  const normalizedKey = type.toLowerCase().replace(/_/g, "");
  return Object.values(RequirementTypeEnum).find(
    (value) => value.toLowerCase().replace(/_/g, "") === normalizedKey,
  );
}

export function normalizeMatchItem(item: MatchItem): MatchItem {
  return {
    ...item,
    source: item.source
      ? (normalizeMatchSource(String(item.source)) ?? item.source)
      : item.source,
    type: item.type
      ? (normalizeRequirementType(String(item.type)) ?? item.type)
      : item.type,
    verdict: item.verdict
      ? (normalizeMatchVerdict(String(item.verdict)) ?? item.verdict)
      : item.verdict,
  };
}

export function normalizeMatchAnalysisEntity(
  entity: MatchAnalysisEntity | null,
): MatchAnalysisEntity | null {
  if (!entity?.items?.length) {
    return entity;
  }

  entity.items = entity.items.map(normalizeMatchItem);
  return entity;
}

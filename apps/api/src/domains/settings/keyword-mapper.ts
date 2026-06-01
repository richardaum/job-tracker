import { KeywordScopeEnum, MatchModeEnum } from "./keyword-blocker.types";

export interface LegacyKeyword {
  keyword: string;
  type: string;
}

export interface MappedBlockedKeyword {
  keyword: string;
  scope: KeywordScopeEnum;
  matchMode: MatchModeEnum;
}

const LEGACY_TYPE_MAP: Record<string, KeywordScopeEnum> = {
  title: KeywordScopeEnum.Title,
  partial: KeywordScopeEnum.Description,
  company: KeywordScopeEnum.Company,
  job: KeywordScopeEnum.Description,
};

export function mapLegacyType(type: string): KeywordScopeEnum {
  const scope = LEGACY_TYPE_MAP[type];
  if (!scope) {
    throw new Error(`Unknown legacy keyword type: "${type}"`);
  }
  return scope;
}

export function mapLegacyKeyword(legacy: LegacyKeyword): MappedBlockedKeyword {
  return { keyword: legacy.keyword, scope: mapLegacyType(legacy.type), matchMode: MatchModeEnum.Partial };
}

export function tryMapLegacyKeyword(
  legacy: LegacyKeyword,
): { ok: true; value: MappedBlockedKeyword } | { ok: false; error: string } {
  const scope = LEGACY_TYPE_MAP[legacy.type];
  if (!scope) {
    return { ok: false, error: `Unknown legacy keyword type: "${legacy.type}"` };
  }
  return { ok: true, value: { keyword: legacy.keyword, scope, matchMode: MatchModeEnum.Partial } };
}

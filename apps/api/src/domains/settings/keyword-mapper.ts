import { KeywordScope, MatchMode } from "./keyword-blocker.types";

export interface LegacyKeyword {
  keyword: string;
  type: string;
}

export interface MappedBlockedKeyword {
  keyword: string;
  scope: KeywordScope;
  matchMode: MatchMode;
}

const LEGACY_TYPE_MAP: Record<string, KeywordScope> = {
  title: KeywordScope.TITLE,
  partial: KeywordScope.DESCRIPTION,
  company: KeywordScope.COMPANY,
  job: KeywordScope.DESCRIPTION,
};

export function mapLegacyType(type: string): KeywordScope {
  const scope = LEGACY_TYPE_MAP[type];
  if (!scope) {
    throw new Error(`Unknown legacy keyword type: "${type}"`);
  }
  return scope;
}

export function mapLegacyKeyword(legacy: LegacyKeyword): MappedBlockedKeyword {
  return {
    keyword: legacy.keyword,
    scope: mapLegacyType(legacy.type),
    matchMode: MatchMode.PARTIAL,
  };
}

export function tryMapLegacyKeyword(
  legacy: LegacyKeyword,
): { ok: true; value: MappedBlockedKeyword } | { ok: false; error: string } {
  const scope = LEGACY_TYPE_MAP[legacy.type];
  if (!scope) {
    return { ok: false, error: `Unknown legacy keyword type: "${legacy.type}"` };
  }
  return { ok: true, value: { keyword: legacy.keyword, scope, matchMode: MatchMode.PARTIAL } };
}

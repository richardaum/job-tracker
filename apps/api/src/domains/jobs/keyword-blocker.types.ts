import type { BlockedKeyword } from "@api/domains/settings/keyword-blocker.types";
import { KeywordScopeEnum, MatchModeEnum } from "@api/domains/settings/keyword-blocker.types";

export { KeywordScopeEnum, MatchModeEnum };
export type { BlockedKeyword };

export interface BlockVerdict {
  matched: true;
  keyword: string;
  scope: KeywordScopeEnum;
}

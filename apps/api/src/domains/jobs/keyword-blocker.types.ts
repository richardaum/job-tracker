import type { BlockedKeyword } from "@api/domains/settings/keyword-blocker.types";
import {
  KeywordScope,
  MatchMode,
} from "@api/domains/settings/keyword-blocker.types";

export { KeywordScope, MatchMode };
export type { BlockedKeyword };

export interface BlockVerdict {
  matched: true;
  keyword: string;
  scope: KeywordScope;
}

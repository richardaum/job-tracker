import { SettingsService } from "@api/domains/settings/settings.service";
import { tipTapToPlainText } from "@job-tracker/tiptap";
import { Injectable, Logger } from "@nestjs/common";

import type { BlockVerdict } from "./keyword-blocker.types";
import { type BlockedKeyword, KeywordScope, MatchMode } from "./keyword-blocker.types";

@Injectable()
export class KeywordBlockerService {
  private readonly logger = new Logger(KeywordBlockerService.name);

  constructor(private readonly settingsService: SettingsService) {}

  async evaluate(
    userId: string,
    title: string,
    description: string | null,
    companyName: string,
  ): Promise<BlockVerdict | null> {
    const settings = await this.settingsService.getSettings(userId);
    const companies = (settings.blockedCompanies ?? []) as string[];
    const keywords = (settings.blockedKeywords ?? []) as BlockedKeyword[];

    if (companies.some((c) => c.toLowerCase() === companyName.toLowerCase())) {
      this.logger.log(`[KeywordBlocker] Blocked — company "${companyName}" matched in COMPANY`);
      return { matched: true, keyword: companyName, scope: KeywordScope.COMPANY };
    }

    const descriptionText = description ? tipTapToPlainText(description) : "";

    for (const bk of keywords) {
      const target =
        bk.scope === KeywordScope.TITLE ? title : bk.scope === KeywordScope.DESCRIPTION ? descriptionText : companyName;

      const match =
        bk.matchMode === MatchMode.EXACT
          ? target.toLowerCase() === bk.keyword.toLowerCase()
          : target.toLowerCase().includes(bk.keyword.toLowerCase());

      if (match) {
        this.logger.log(`[KeywordBlocker] Blocked — keyword "${bk.keyword}" matched in ${bk.scope}`);
        return { matched: true, keyword: bk.keyword, scope: bk.scope };
      }
    }

    return null;
  }
}

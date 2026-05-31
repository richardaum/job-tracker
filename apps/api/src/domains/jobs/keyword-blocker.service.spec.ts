import "reflect-metadata";

import { describe, expect, it, vi } from "vitest";

import { KeywordBlockerService } from "./keyword-blocker.service";
import { KeywordScope, MatchMode } from "./keyword-blocker.types";

const TIPTAP_DESCRIPTION = JSON.stringify({
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "We are looking for a senior engineer" }],
    },
  ],
});

function makeSettings(
  overrides: Partial<{
    blockedKeywords: {
      keyword: string;
      scope: KeywordScope;
      matchMode: MatchMode;
    }[];
    blockedCompanies: string[];
  }> = {},
) {
  return {
    userId: "user-1",
    autoFillEnabled: false,
    autoSummaryEnabled: false,
    autoMatchEnabled: false,
    duplicateWindowDays: 30,
    blockedKeywords: [],
    blockedCompanies: [],
    ...overrides,
  } as never;
}

function makeService(settings: ReturnType<typeof makeSettings>) {
  const settingsService = { getSettings: vi.fn().mockResolvedValue(settings) };
  return new KeywordBlockerService(settingsService as never);
}

describe("KeywordBlockerService", () => {
  describe("evaluate", () => {
    it("returns null when blocked keywords list is empty", async () => {
      const service = makeService(makeSettings({ blockedKeywords: [] }));
      const result = await service.evaluate("user-1", "Engineer", null, "Acme");
      expect(result).toBeNull();
    });

    it("returns null when blocked companies list is empty", async () => {
      const service = makeService(makeSettings({ blockedCompanies: [] }));
      const result = await service.evaluate("user-1", "Engineer", null, "Acme");
      expect(result).toBeNull();
    });

    it("returns verdict on blocked company exact match", async () => {
      const service = makeService(makeSettings({ blockedCompanies: ["Acme Corp"] }));
      const result = await service.evaluate("user-1", "Engineer", null, "Acme Corp");
      expect(result).toEqual({
        matched: true,
        keyword: "Acme Corp",
        scope: KeywordScope.COMPANY,
      });
    });

    it("returns verdict on blocked company case-insensitive match", async () => {
      const service = makeService(makeSettings({ blockedCompanies: ["acme corp"] }));
      const result = await service.evaluate("user-1", "Engineer", null, "Acme Corp");
      expect(result).toEqual({
        matched: true,
        keyword: "Acme Corp",
        scope: KeywordScope.COMPANY,
      });
    });

    it("returns null when blocked company does not match", async () => {
      const service = makeService(makeSettings({ blockedCompanies: ["Other Corp"] }));
      const result = await service.evaluate("user-1", "Engineer", null, "Acme Corp");
      expect(result).toBeNull();
    });

    it("returns verdict on keyword EXACT match on TITLE", async () => {
      const service = makeService(
        makeSettings({
          blockedKeywords: [
            {
              keyword: "Senior Engineer",
              scope: KeywordScope.TITLE,
              matchMode: MatchMode.EXACT,
            },
          ],
        }),
      );
      const result = await service.evaluate("user-1", "Senior Engineer", null, "Acme");
      expect(result).toEqual({
        matched: true,
        keyword: "Senior Engineer",
        scope: KeywordScope.TITLE,
      });
    });

    it("returns verdict on keyword PARTIAL match on TITLE", async () => {
      const service = makeService(
        makeSettings({
          blockedKeywords: [
            {
              keyword: "senior",
              scope: KeywordScope.TITLE,
              matchMode: MatchMode.PARTIAL,
            },
          ],
        }),
      );
      const result = await service.evaluate("user-1", "Senior Engineer", null, "Acme");
      expect(result).toEqual({
        matched: true,
        keyword: "senior",
        scope: KeywordScope.TITLE,
      });
    });

    it("returns null when keyword does not match TITLE", async () => {
      const service = makeService(
        makeSettings({
          blockedKeywords: [
            {
              keyword: "junior",
              scope: KeywordScope.TITLE,
              matchMode: MatchMode.PARTIAL,
            },
          ],
        }),
      );
      const result = await service.evaluate("user-1", "Senior Engineer", null, "Acme");
      expect(result).toBeNull();
    });

    it("returns verdict on keyword EXACT match on DESCRIPTION (plain text)", async () => {
      const service = makeService(
        makeSettings({
          blockedKeywords: [
            {
              keyword: "We are looking for a senior engineer",
              scope: KeywordScope.DESCRIPTION,
              matchMode: MatchMode.EXACT,
            },
          ],
        }),
      );
      const result = await service.evaluate("user-1", "Engineer", TIPTAP_DESCRIPTION, "Acme");
      expect(result).toEqual({
        matched: true,
        keyword: "We are looking for a senior engineer",
        scope: KeywordScope.DESCRIPTION,
      });
    });

    it("returns verdict on keyword PARTIAL match on DESCRIPTION (TipTap JSON)", async () => {
      const service = makeService(
        makeSettings({
          blockedKeywords: [
            {
              keyword: "senior",
              scope: KeywordScope.DESCRIPTION,
              matchMode: MatchMode.PARTIAL,
            },
          ],
        }),
      );
      const result = await service.evaluate("user-1", "Engineer", TIPTAP_DESCRIPTION, "Acme");
      expect(result).toEqual({
        matched: true,
        keyword: "senior",
        scope: KeywordScope.DESCRIPTION,
      });
    });

    it("returns null when keyword does not match DESCRIPTION", async () => {
      const service = makeService(
        makeSettings({
          blockedKeywords: [
            {
              keyword: "junior",
              scope: KeywordScope.DESCRIPTION,
              matchMode: MatchMode.PARTIAL,
            },
          ],
        }),
      );
      const result = await service.evaluate("user-1", "Engineer", TIPTAP_DESCRIPTION, "Acme");
      expect(result).toBeNull();
    });

    it("returns verdict on keyword COMPANY scope matching company name", async () => {
      const service = makeService(
        makeSettings({
          blockedKeywords: [
            {
              keyword: "acme",
              scope: KeywordScope.COMPANY,
              matchMode: MatchMode.PARTIAL,
            },
          ],
        }),
      );
      const result = await service.evaluate("user-1", "Engineer", null, "Acme Corp");
      expect(result).toEqual({
        matched: true,
        keyword: "acme",
        scope: KeywordScope.COMPANY,
      });
    });

    it("first matching keyword wins (order of keywords array)", async () => {
      const service = makeService(
        makeSettings({
          blockedKeywords: [
            {
              keyword: "senior",
              scope: KeywordScope.TITLE,
              matchMode: MatchMode.PARTIAL,
            },
            {
              keyword: "engineer",
              scope: KeywordScope.TITLE,
              matchMode: MatchMode.PARTIAL,
            },
          ],
        }),
      );
      const result = await service.evaluate("user-1", "Senior Engineer", null, "Acme");
      expect(result).toEqual({
        matched: true,
        keyword: "senior",
        scope: KeywordScope.TITLE,
      });
    });

    it("null description does not throw", async () => {
      const service = makeService(
        makeSettings({
          blockedKeywords: [
            {
              keyword: "test",
              scope: KeywordScope.DESCRIPTION,
              matchMode: MatchMode.PARTIAL,
            },
          ],
        }),
      );
      const result = await service.evaluate("user-1", "Engineer", null, "Acme");
      expect(result).toBeNull();
    });

    it("empty description does not throw", async () => {
      const service = makeService(
        makeSettings({
          blockedKeywords: [
            {
              keyword: "test",
              scope: KeywordScope.DESCRIPTION,
              matchMode: MatchMode.PARTIAL,
            },
          ],
        }),
      );
      const result = await service.evaluate("user-1", "Engineer", "", "Acme");
      expect(result).toBeNull();
    });

    it("blocked company takes priority over keywords", async () => {
      const service = makeService(
        makeSettings({
          blockedCompanies: ["Acme"],
          blockedKeywords: [
            {
              keyword: "Engineer",
              scope: KeywordScope.TITLE,
              matchMode: MatchMode.PARTIAL,
            },
          ],
        }),
      );
      const result = await service.evaluate("user-1", "Engineer", null, "Acme");
      expect(result).toEqual({
        matched: true,
        keyword: "Acme",
        scope: KeywordScope.COMPANY,
      });
    });
  });
});

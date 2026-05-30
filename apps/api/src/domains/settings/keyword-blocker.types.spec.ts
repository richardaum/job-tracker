import "reflect-metadata";

import { describe, expect, it } from "vitest";

import {
  BlockedKeywordInput,
  BlockedKeywordType,
  KeywordScope,
  MatchMode,
} from "./keyword-blocker.types";

describe("KeywordScope", () => {
  it("has TITLE member", () => {
    expect(KeywordScope.TITLE).toBe("TITLE");
  });

  it("has DESCRIPTION member", () => {
    expect(KeywordScope.DESCRIPTION).toBe("DESCRIPTION");
  });

  it("has COMPANY member", () => {
    expect(KeywordScope.COMPANY).toBe("COMPANY");
  });
});

describe("MatchMode", () => {
  it("has PARTIAL member", () => {
    expect(MatchMode.PARTIAL).toBe("PARTIAL");
  });

  it("has EXACT member", () => {
    expect(MatchMode.EXACT).toBe("EXACT");
  });
});

describe("BlockedKeywordType", () => {
  it("constructs with keyword, scope, and matchMode fields", () => {
    const instance = new BlockedKeywordType();
    instance.keyword = "test";
    instance.scope = KeywordScope.TITLE;
    instance.matchMode = MatchMode.PARTIAL;

    expect(instance.keyword).toBe("test");
    expect(instance.scope).toBe(KeywordScope.TITLE);
    expect(instance.matchMode).toBe(MatchMode.PARTIAL);
  });
});

describe("BlockedKeywordInput", () => {
  it("constructs with keyword, scope, and matchMode fields", () => {
    const instance = new BlockedKeywordInput();
    instance.keyword = "test";
    instance.scope = KeywordScope.DESCRIPTION;
    instance.matchMode = MatchMode.EXACT;

    expect(instance.keyword).toBe("test");
    expect(instance.scope).toBe(KeywordScope.DESCRIPTION);
    expect(instance.matchMode).toBe(MatchMode.EXACT);
  });
});

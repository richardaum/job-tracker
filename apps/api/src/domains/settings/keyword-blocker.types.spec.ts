import "reflect-metadata";

import { describe, expect, it } from "vitest";

import { BlockedKeywordInput, BlockedKeywordType, KeywordScopeEnum, MatchModeEnum } from "./keyword-blocker.types";

describe("KeywordScope", () => {
  it("has TITLE member", () => {
    expect(KeywordScopeEnum.Title).toBe("TITLE");
  });

  it("has DESCRIPTION member", () => {
    expect(KeywordScopeEnum.Description).toBe("DESCRIPTION");
  });

  it("has COMPANY member", () => {
    expect(KeywordScopeEnum.Company).toBe("COMPANY");
  });
});

describe("MatchMode", () => {
  it("has PARTIAL member", () => {
    expect(MatchModeEnum.Partial).toBe("PARTIAL");
  });

  it("has EXACT member", () => {
    expect(MatchModeEnum.Exact).toBe("EXACT");
  });
});

describe("BlockedKeywordType", () => {
  it("constructs with keyword, scope, and matchMode fields", () => {
    const instance = new BlockedKeywordType();
    instance.keyword = "test";
    instance.scope = KeywordScopeEnum.Title;
    instance.matchMode = MatchModeEnum.Partial;

    expect(instance.keyword).toBe("test");
    expect(instance.scope).toBe(KeywordScopeEnum.Title);
    expect(instance.matchMode).toBe(MatchModeEnum.Partial);
  });
});

describe("BlockedKeywordInput", () => {
  it("constructs with keyword, scope, and matchMode fields", () => {
    const instance = new BlockedKeywordInput();
    instance.keyword = "test";
    instance.scope = KeywordScopeEnum.Description;
    instance.matchMode = MatchModeEnum.Exact;

    expect(instance.keyword).toBe("test");
    expect(instance.scope).toBe(KeywordScopeEnum.Description);
    expect(instance.matchMode).toBe(MatchModeEnum.Exact);
  });
});

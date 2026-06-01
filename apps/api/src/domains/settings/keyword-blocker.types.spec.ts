import "reflect-metadata";

import { describe, expect, it } from "vitest";

import { BlockedKeywordInput, BlockedKeywordType, KeywordScopeEnum, MatchModeEnum } from "./keyword-blocker.types";

describe("KeywordScope", () => {
  it("has Title member", () => {
    expect(KeywordScopeEnum.Title).toBe("Title");
  });

  it("has Description member", () => {
    expect(KeywordScopeEnum.Description).toBe("Description");
  });

  it("has Company member", () => {
    expect(KeywordScopeEnum.Company).toBe("Company");
  });
});

describe("MatchMode", () => {
  it("has Partial member", () => {
    expect(MatchModeEnum.Partial).toBe("Partial");
  });

  it("has Exact member", () => {
    expect(MatchModeEnum.Exact).toBe("Exact");
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

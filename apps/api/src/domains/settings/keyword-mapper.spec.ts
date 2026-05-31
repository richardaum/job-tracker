import "reflect-metadata";

import { describe, expect, it } from "vitest";

import { KeywordScopeEnum, MatchModeEnum } from "./keyword-blocker.types";
import { mapLegacyKeyword, mapLegacyType } from "./keyword-mapper";

describe("mapLegacyType", () => {
  it('maps "title" to TITLE scope', () => {
    expect(mapLegacyType("title")).toBe(KeywordScopeEnum.Title);
  });

  it('maps "partial" to DESCRIPTION scope', () => {
    expect(mapLegacyType("partial")).toBe(KeywordScopeEnum.Description);
  });

  it('maps "company" to COMPANY scope', () => {
    expect(mapLegacyType("company")).toBe(KeywordScopeEnum.Company);
  });

  it('maps "job" to DESCRIPTION scope', () => {
    expect(mapLegacyType("job")).toBe(KeywordScopeEnum.Description);
  });

  it("throws on unknown legacy type", () => {
    expect(() => mapLegacyType("unknown")).toThrow('Unknown legacy keyword type: "unknown"');
  });

  it("throws on empty string type", () => {
    expect(() => mapLegacyType("")).toThrow('Unknown legacy keyword type: ""');
  });
});

describe("mapLegacyKeyword", () => {
  it("maps a title legacy keyword to BlockedKeyword with PARTIAL matchMode", () => {
    const result = mapLegacyKeyword({ keyword: "python", type: "title" });
    expect(result).toEqual({ keyword: "python", scope: KeywordScopeEnum.Title, matchMode: MatchModeEnum.Partial });
  });

  it("maps a partial legacy keyword to DESCRIPTION with PARTIAL matchMode", () => {
    const result = mapLegacyKeyword({ keyword: "desenvolvedor", type: "partial" });
    expect(result).toEqual({
      keyword: "desenvolvedor",
      scope: KeywordScopeEnum.Description,
      matchMode: MatchModeEnum.Partial,
    });
  });

  it("maps a company legacy keyword to COMPANY with PARTIAL matchMode", () => {
    const result = mapLegacyKeyword({ keyword: "acme", type: "company" });
    expect(result).toEqual({ keyword: "acme", scope: KeywordScopeEnum.Company, matchMode: MatchModeEnum.Partial });
  });

  it("maps a job legacy keyword to DESCRIPTION with PARTIAL matchMode", () => {
    const result = mapLegacyKeyword({ keyword: "híbrido", type: "job" });
    expect(result).toEqual({
      keyword: "híbrido",
      scope: KeywordScopeEnum.Description,
      matchMode: MatchModeEnum.Partial,
    });
  });

  it("throws on unknown legacy type in keyword mapping", () => {
    expect(() => mapLegacyKeyword({ keyword: "test", type: "invalid" })).toThrow();
  });
});

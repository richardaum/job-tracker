import "reflect-metadata";

import { describe, expect, it } from "vitest";

import { KeywordScope, MatchMode } from "./keyword-blocker.types";
import { mapLegacyKeyword, mapLegacyType } from "./keyword-mapper";

describe("mapLegacyType", () => {
  it('maps "title" to TITLE scope', () => {
    expect(mapLegacyType("title")).toBe(KeywordScope.TITLE);
  });

  it('maps "partial" to DESCRIPTION scope', () => {
    expect(mapLegacyType("partial")).toBe(KeywordScope.DESCRIPTION);
  });

  it('maps "company" to COMPANY scope', () => {
    expect(mapLegacyType("company")).toBe(KeywordScope.COMPANY);
  });

  it('maps "job" to DESCRIPTION scope', () => {
    expect(mapLegacyType("job")).toBe(KeywordScope.DESCRIPTION);
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
    expect(result).toEqual({
      keyword: "python",
      scope: KeywordScope.TITLE,
      matchMode: MatchMode.PARTIAL,
    });
  });

  it("maps a partial legacy keyword to DESCRIPTION with PARTIAL matchMode", () => {
    const result = mapLegacyKeyword({
      keyword: "desenvolvedor",
      type: "partial",
    });
    expect(result).toEqual({
      keyword: "desenvolvedor",
      scope: KeywordScope.DESCRIPTION,
      matchMode: MatchMode.PARTIAL,
    });
  });

  it("maps a company legacy keyword to COMPANY with PARTIAL matchMode", () => {
    const result = mapLegacyKeyword({ keyword: "acme", type: "company" });
    expect(result).toEqual({
      keyword: "acme",
      scope: KeywordScope.COMPANY,
      matchMode: MatchMode.PARTIAL,
    });
  });

  it("maps a job legacy keyword to DESCRIPTION with PARTIAL matchMode", () => {
    const result = mapLegacyKeyword({ keyword: "híbrido", type: "job" });
    expect(result).toEqual({
      keyword: "híbrido",
      scope: KeywordScope.DESCRIPTION,
      matchMode: MatchMode.PARTIAL,
    });
  });

  it("throws on unknown legacy type in keyword mapping", () => {
    expect(() => mapLegacyKeyword({ keyword: "test", type: "invalid" })).toThrow();
  });
});

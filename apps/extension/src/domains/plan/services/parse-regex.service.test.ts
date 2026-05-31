import { describe, expect, it } from "vitest";

import type { ParseRegexAction } from "@/domains/plan/model/types";

import { ParseRegexService } from "./parse-regex.service";

function makeAction(overrides: Partial<ParseRegexAction["input"]> = {}): ParseRegexAction {
  return {
    kind: "parse.regex",
    input: {
      text: "🚀 Senior Engineer\n🏢 Company: Acme",
      fields: [
        { key: "title", pattern: "🚀 (.+)" },
        { key: "company", pattern: "🏢 Company: (.+)" },
      ],
      ...overrides,
    },
  } as unknown as ParseRegexAction;
}

describe("ParseRegexService", () => {
  const svc = new ParseRegexService();

  it("extracts fields from raw text", () => {
    const result = svc.execute(makeAction());

    expect(result).toEqual({ title: "Senior Engineer", company: "Acme" });
  });

  it("returns null for unmatched optional fields", () => {
    const result = svc.execute(
      makeAction({
        fields: [
          { key: "title", pattern: "🚀 (.+)" },
          { key: "salary", pattern: "💰 (.+)" },
        ],
      }),
    );

    expect(result).toEqual({ title: "Senior Engineer", salary: null });
  });

  it("throws for unmatched required fields", () => {
    expect(() =>
      svc.execute(
        makeAction({
          fields: [
            { key: "title", pattern: "🚀 (.+)" },
            { key: "salary", pattern: "💰 (.+)", required: true },
          ],
        }),
      ),
    ).toThrow("Required field");
  });
});

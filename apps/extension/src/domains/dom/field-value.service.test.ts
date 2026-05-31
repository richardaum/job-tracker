import { describe, expect, it } from "vitest";

import {
  FieldFormatStrategyPicker,
  PassthroughFieldFormatStrategy,
} from "./field-format.strategy";
import { FieldValueService } from "./field-value.service";

describe("FieldValueService", () => {
  it("returns raw innerHTML string when format is omitted", () => {
    const svc = new FieldValueService();
    const el = {
      innerHTML: "<p>Hello</p>",
      innerText: "Hello",
      textContent: "Hello",
      getAttribute: () => null,
    };
    const field = {
      key: "description",
      selector: "x",
      type: "property" as const,
      value: "innerHTML" as const,
    };
    expect(svc.getFieldValue(el, field)).toBe("<p>Hello</p>");
  });

  it("converts innerHTML to TipTap JSON when format is tiptap", () => {
    const svc = new FieldValueService();
    const el = {
      innerHTML: "<p>Hello</p>",
      innerText: "Hello",
      textContent: "Hello",
      getAttribute: () => null,
    };
    const field = {
      key: "description",
      selector: "x",
      type: "property" as const,
      value: "innerHTML" as const,
      format: "tiptap" as const,
    };
    const result = svc.getFieldValue(el, field);
    expect(result).toMatchObject({ type: "doc", content: expect.any(Array) });
  });

  it("converts innerText to TipTap JSON when format is tiptap", () => {
    const svc = new FieldValueService();
    const el = {
      innerHTML: "",
      innerText: "Hello",
      textContent: "Hello",
      getAttribute: () => null,
    };
    const field = {
      key: "description",
      selector: "x",
      type: "property" as const,
      value: "innerText" as const,
      format: "tiptap" as const,
    };
    const result = svc.getFieldValue(el, field);
    expect(result).toMatchObject({ type: "doc", content: expect.any(Array) });
  });

  it("applies format salary to innerText → CreateJobInput-shaped payload", () => {
    const svc = new FieldValueService();
    const el = {
      innerHTML: "",
      innerText: "$120,000 – $150,000 / year",
      textContent: "$120,000 – $150,000 / year",
      getAttribute: () => null,
    };
    const field = {
      key: "salary",
      selector: "x",
      type: "property" as const,
      value: "innerText" as const,
      format: "salary" as const,
      validationRegex: {
        pattern:
          "\\$\\s?\\d[\\d,.]*\\s*\\p{Pd}\\s*\\$?\\s?\\d[\\d,.]*\\s*/\\s*(year|month|hour)",
        flags: "iu",
      },
    };
    const result = svc.getFieldValue(el, field);
    expect(result).toMatchObject({
      salaryMinCents: 120_000_00,
      salaryMaxCents: 150_000_00,
      salaryCurrency: "USD",
    });
  });

  it("throws when format is set but no strategy is registered for it", () => {
    const svc = new FieldValueService(
      new FieldFormatStrategyPicker(new PassthroughFieldFormatStrategy(), {}),
    );
    const el = {
      innerHTML: "<p>Hello</p>",
      innerText: "Hello",
      textContent: "Hello",
      getAttribute: () => null,
    };
    const field = {
      key: "description",
      selector: "x",
      type: "property" as const,
      value: "innerHTML" as const,
      format: "tiptap" as const,
    };
    expect(() => svc.getFieldValue(el, field)).toThrow(
      /Unknown field format "tiptap"/,
    );
  });
});

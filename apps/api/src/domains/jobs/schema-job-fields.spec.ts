import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const schemaPath = path.join(process.cwd(), "src/schema.gql");

describe("schema.gql Job / enum surface (task 03)", () => {
  const schema = readFileSync(schemaPath, "utf8");

  it("exposes nullable Job title plus htmlContent and fillMetadata", () => {
    const match = schema.match(/type JobType \{[^}]+\}/s)?.[0] ?? "";
    expect(match).toContain("title: String\n");
    expect(match).not.toContain("title: String!");
    expect(match).toContain("htmlContent: String\n");
    expect(match).toContain("fillMetadata: AsyncMetadataType\n");
    expect(match).not.toContain("draftJobId");
  });

  it("registers ApplicationStage with DRAFT", () => {
    const chunk = schema.match(/enum ApplicationStage \{[^}]+\}/s)?.[0] ?? "";
    expect(chunk.split("\n").map((s) => s.trim())).toContain("DRAFT");
  });

  it("registers ApplicationQuickFilter with DRAFT", () => {
    const chunk =
      schema.match(/enum ApplicationQuickFilter \{[^}]+\}/s)?.[0] ?? "";
    expect(chunk.split("\n").map((s) => s.trim())).toContain("DRAFT");
  });

  it("drops draftJobId from CreateJobInput", () => {
    const chunk = schema.match(/input CreateJobInput \{[^}]+\}/s)?.[0] ?? "";
    expect(chunk.length).toBeGreaterThan(0);
    expect(chunk).not.toContain("draftJobId");
    expect(chunk).toContain("htmlContent");
    expect(chunk.split("\n").map((s) => s.trim())).toContain(
      "createAsDraftCapture: Boolean",
    );
  });
});

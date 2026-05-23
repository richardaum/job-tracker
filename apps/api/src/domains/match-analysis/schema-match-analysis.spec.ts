import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const schemaPath = path.join(process.cwd(), "src/schema.gql");

describe("schema.gql MatchAnalysis surface (task 04)", () => {
  const schema = readFileSync(schemaPath, "utf8");

  it("does not expose draftJob or draftJobId on MatchAnalysisType", () => {
    const block = schema.match(/type MatchAnalysisType \{[^}]+\}/s)?.[0] ?? "";
    expect(block.length).toBeGreaterThan(0);
    expect(block).not.toContain("draftJob");
    expect(block).not.toContain("draftJobId");
    expect(block).toContain("jobId: ID!");
  });
});

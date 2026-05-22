import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const schemaPath = path.join(process.cwd(), "src/schema.gql");

describe("schema.gql draft removal + fill mutation (task 05)", () => {
  const schema = readFileSync(schemaPath, "utf8");

  it("exposes fillJobAutomatically and hides legacy draft-job GraphQL symbols", () => {
    expect(schema).toContain("fillJobAutomatically(jobId: ID!): JobType!");
    expect(schema).toContain(
      "fillMetadata: AsyncMetadataType\n  match: MatchAnalysisType",
    );

    for (const forbidden of [
      "type DraftJobType",
      "type ConversionMetadataType",
      "DraftJobConversionStatus",
      "input CreateDraftJobInput",
      "input UpdateDraftJobInput",
      "input GenerateDraftMatchInput",
      "createDraftJob",
      "createJobWithAI",
      "draftJobs",
      "draftJob(",
      "draftJobMatch",
      "generateDraftJobMatch",
    ]) {
      expect(schema).not.toContain(forbidden);
    }

    expect(schema).toContain("createAsDraftCapture");
  });
});

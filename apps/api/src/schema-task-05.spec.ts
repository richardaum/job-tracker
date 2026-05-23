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

    const dj = "Draft" + "Job";

    const forbiddenSyms = [
      `type ${dj}Type`,
      "type Conversion" + "Metadata" + "Type",
      `${dj}ConversionStatus`,
      `input Create${dj}Input`,
      `input Update${dj}Input`,
      "input Generate" + "Draft" + "MatchInput",
      `create${dj}`,
      `createJobWithAI`,
      "draftJobs",
      "draftJob(",
      "draftJobMatch",
      "generate" + `${dj}` + "Match",
    ];

    for (const forbidden of forbiddenSyms) {
      expect(schema).not.toContain(forbidden);
    }

    expect(schema).toContain("createAsDraftCapture");
  });
});

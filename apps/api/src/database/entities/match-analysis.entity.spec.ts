import {
  MatchAnalysisEntity,
  RequirementTypeEnum,
} from "@api/database/entities/match-analysis.entity";
import { FitClassificationEnum } from "@api/domains/match-analysis/fit-classification.enum";
import { MatchSourceEnum } from "@api/domains/match-analysis/match-source.enum";
import { MatchVerdictEnum } from "@api/domains/match-analysis/match-verdict.enum";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

function minimalMatchAnalysis(
  props: Partial<MatchAnalysisEntity> = {},
): MatchAnalysisEntity {
  const now = new Date("2026-01-01T00:00:00.000Z");
  return plainToInstance(MatchAnalysisEntity, {
    id: "match-spec-1",
    jobId: "job-1",
    userId: "user-1",
    resumeId: "resume-1",
    generationMetadata: {
      status: AsyncMetadataStatusEnum.COMPLETED,
      error: null,
      timestamp: now,
    },
    scoreRatio: 0.5,
    classification: FitClassificationEnum.Positive,
    matchCount: 1,
    gapCount: 0,
    unclearCount: 0,
    items: [
      {
        requirement: "Rust",
        source: MatchSourceEnum.Resume,
        type: RequirementTypeEnum.MustHave,
        verdict: MatchVerdictEnum.Fit,
        jdQuote: "Rust",
        sourceQuotes: [],
      },
    ],
    createdAt: now,
    updatedAt: now,
    ...props,
  });
}

describe("MatchAnalysisEntity", () => {
  it("instantiates with jobId only (no draft linkage)", () => {
    const row = minimalMatchAnalysis();
    expect(row.jobId).toBe("job-1");
    expect("draftJobId" in row).toBe(false);
  });

  it("class-validator rejects null jobId", async () => {
    const row = minimalMatchAnalysis({ jobId: null as unknown as string });
    const errs = await validate(row);
    expect(errs.some((e) => e.property === "jobId")).toBe(true);
  });

  it("class-validator rejects empty jobId", async () => {
    const row = minimalMatchAnalysis({ jobId: "" });
    const errs = await validate(row);
    expect(errs.some((e) => e.property === "jobId")).toBe(true);
  });

  it("class-validator accepts populated jobId", async () => {
    const row = minimalMatchAnalysis({ jobId: "draft-and-job-share-pk-1" });
    expect(await validate(row)).toHaveLength(0);
  });
});

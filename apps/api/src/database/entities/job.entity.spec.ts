import { JobEntity } from "@api/database/entities/job.entity";
import { ApplicationStageEnum } from "@api/domains/jobs/job-stage.enum";
import { JOB_TITLE_MAX_LENGTH } from "@api/domains/jobs/job-title.constraints";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

function minimalJob(props: Partial<JobEntity> = {}): JobEntity {
  const now = new Date("2026-01-01T00:00:00.000Z");
  return plainToInstance(JobEntity, {
    id: "job-spec-1",
    userId: "user-1",
    title: null,
    companyId: "company-1",
    description: null,
    urls: [],
    source: null,
    salary: null,
    tags: [],
    location: null,
    workRegion: null,
    htmlContent: null,
    fillMetadata: null,
    stage: ApplicationStageEnum.Draft,
    summary: null,
    summaryMetadata: null,
    sourceRunId: null,
    createdAt: now,
    updatedAt: now,
    ...props,
  });
}

describe("JobEntity", () => {
  it("serializes nullable title with htmlContent and fillMetadata", async () => {
    const row = minimalJob({
      title: null,
      htmlContent: "<html>h</html>",
      fillMetadata: undefined,
      stage: ApplicationStageEnum.New,
    });
    expect(row.title).toBeNull();
    expect(row.htmlContent).toContain("h");

    expect(await validate(row)).toHaveLength(0);
  });

  it("accepts max-length title boundary", async () => {
    const row = minimalJob({ title: "x".repeat(JOB_TITLE_MAX_LENGTH), stage: ApplicationStageEnum.New });
    expect(await validate(row)).toHaveLength(0);
  });

  it("rejects oversized title strings", async () => {
    const row = minimalJob({ title: "x".repeat(JOB_TITLE_MAX_LENGTH + 1), stage: ApplicationStageEnum.New });
    const errs = await validate(row);
    expect(errs.some((e) => e.property === "title")).toBe(true);
  });

  it("does not attach max-length errors when title is null", async () => {
    const row = minimalJob({ title: null, stage: ApplicationStageEnum.New });
    const errs = await validate(row).then((list) => list.filter((e) => e.property === "title"));
    expect(errs).toHaveLength(0);
  });
});

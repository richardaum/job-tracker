import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { CreateJobInput } from "./create-job.input";
import { JOB_TITLE_MAX_LENGTH } from "./job-title.constraints";

describe("CreateJobInput", () => {
  it("accepts omitting optional title and htmlContent", async () => {
    const input = plainToInstance(CreateJobInput, { company: "Acme" });
    expect(await validate(input)).toHaveLength(0);
  });

  it("rejects oversized title", async () => {
    const input = plainToInstance(CreateJobInput, { title: "t".repeat(JOB_TITLE_MAX_LENGTH + 1), company: "Acme" });
    const errs = await validate(input);
    expect(errs.some((e) => e.property === "title")).toBe(true);
  });
});

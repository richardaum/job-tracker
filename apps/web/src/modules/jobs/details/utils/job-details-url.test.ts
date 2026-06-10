import { describe, expect, it } from "vitest";

import {
  copySearchParams,
  jobDetailsHref,
  JOB_DETAILS_LAYOUT_QUERY_PARAMS,
  JOB_DETAILS_LINK_QUERY_PARAMS,
} from "./job-details-url";

describe("job-details-url", () => {
  it("exports link and layout param whitelists", () => {
    expect(JOB_DETAILS_LINK_QUERY_PARAMS).toEqual(["w"]);
    expect(JOB_DETAILS_LAYOUT_QUERY_PARAMS).toEqual(["w", "cid"]);
  });

  it("builds href with full-width and side panel params", () => {
    expect(jobDetailsHref("/jobs/job-1/chat", { fullWidth: true })).toBe("/jobs/job-1/chat?w=full");
    expect(jobDetailsHref("/jobs/job-1", { sidePanel: "chat", fullWidth: true })).toBe("/jobs/job-1?s=chat&w=full");
  });

  it("copies only selected search params", () => {
    const source = new URLSearchParams("w=full&cid=conv-1&q=draft");
    const target = new URLSearchParams();

    copySearchParams(target, source, JOB_DETAILS_LINK_QUERY_PARAMS);

    expect(target.toString()).toBe("w=full");
  });
});

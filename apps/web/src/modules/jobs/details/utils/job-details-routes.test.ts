import { describe, expect, it } from "vitest";

import {
  isJobDetailsSidePanelTab,
  jobDetailsHref,
  jobDetailsNotesFocusPath,
  jobDetailsPath,
  parseJobDetailsMainTab,
  parseJobDetailsTab,
  parseJobSidePanel,
} from "./job-details-routes";

describe("job-details-routes", () => {
  it("builds notes focus full-page path", () => {
    expect(jobDetailsNotesFocusPath("abc")).toBe("/jobs/abc/notes/focus");
  });

  it("builds overview and sub-tab paths", () => {
    expect(jobDetailsPath("abc")).toBe("/jobs/abc");
    expect(jobDetailsPath("abc", "match")).toBe("/jobs/abc/match");
    expect(jobDetailsPath("abc", "notes")).toBe("/jobs/abc/notes");
    expect(jobDetailsPath("abc", "history")).toBe("/jobs/abc/history");
    expect(jobDetailsPath("abc", "chat")).toBe("/jobs/abc/chat");
  });

  it("builds side-panel hrefs on the current tab path", () => {
    expect(jobDetailsHref("abc", "match", "notes")).toBe("/jobs/abc/match?s=notes");
  });

  it("parses tab from pathname", () => {
    expect(parseJobDetailsTab("/jobs/abc")).toBe("overview");
    expect(parseJobDetailsTab("/jobs/abc/match")).toBe("match");
    expect(parseJobDetailsTab("/jobs/abc/notes")).toBe("notes");
    expect(parseJobDetailsTab("/jobs/abc/history")).toBe("history");
    expect(parseJobDetailsTab("/jobs/abc/chat")).toBe("chat");
  });

  it("parses main tab from pathname", () => {
    expect(parseJobDetailsMainTab("/jobs/abc")).toBe("overview");
    expect(parseJobDetailsMainTab("/jobs/abc/match")).toBe("match");
    expect(parseJobDetailsMainTab("/jobs/abc/notes")).toBe("overview");
    expect(parseJobDetailsMainTab("/jobs/abc/chat")).toBe("overview");
  });

  it("parses side panel query values", () => {
    expect(parseJobSidePanel("notes")).toBe("notes");
    expect(parseJobSidePanel("history")).toBe("history");
    expect(parseJobSidePanel("chat")).toBe("chat");
    expect(parseJobSidePanel("other")).toBeNull();
  });

  it("detects side-panel tabs", () => {
    expect(isJobDetailsSidePanelTab("notes")).toBe(true);
    expect(isJobDetailsSidePanelTab("history")).toBe(true);
    expect(isJobDetailsSidePanelTab("chat")).toBe(true);
    expect(isJobDetailsSidePanelTab("overview")).toBe(false);
    expect(isJobDetailsSidePanelTab("match")).toBe(false);
    expect(isJobDetailsSidePanelTab("description")).toBe(false);
    expect(isJobDetailsSidePanelTab("source")).toBe(false);
  });

  it("returns overview for notes focus route outside detail tabs", () => {
    expect(parseJobDetailsTab("/jobs/abc/notes/focus")).toBe("overview");
  });
});

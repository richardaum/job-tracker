import { describe, expect, it } from "vitest";

import { legacyRouteRedirects } from "./legacy-route-redirects";

describe("legacyRouteRedirects", () => {
  it("redirects /draft-jobs (list bookmarks) to /jobs?q=draft", () => {
    const listRule = legacyRouteRedirects.find(
      (r) => r.source === "/draft-jobs",
    );
    expect(listRule).toBeDefined();
    expect(listRule!.destination).toBe("/jobs?q=draft");
    expect(listRule!.permanent).toBe(false);
  });

  it("redirects /draft-jobs/[id] to /jobs/[id] preserving bookmarks", () => {
    const detailRule = legacyRouteRedirects.find(
      (r) => r.source === "/draft-jobs/:id",
    );
    expect(detailRule).toBeDefined();
    expect(detailRule!.destination).toBe("/jobs/:id");
    expect(detailRule!.permanent).toBe(false);
  });

  it("redirects legacy /matches/[id] bookmarks to job Match tab (308)", () => {
    const matchDetail = legacyRouteRedirects.find(
      (r) => r.source === "/matches/:id",
    );
    expect(matchDetail).toBeDefined();
    expect(matchDetail!.destination).toBe("/jobs/:id/match");
    expect(matchDetail!.permanent).toBe(true);
  });

  it("redirects ?s=notes on /jobs/[id] to notes subpage", () => {
    const notesRule = legacyRouteRedirects.find(
      (r) =>
        r.source === "/jobs/:id" &&
        "has" in r &&
        r.has?.some(
          (entry) =>
            entry.type === "query" &&
            entry.key === "s" &&
            entry.value === "notes",
        ),
    );
    expect(notesRule).toBeDefined();
    expect(notesRule!.destination).toBe("/jobs/:id/notes");
    expect(notesRule!.permanent).toBe(false);
  });

  it("defines exactly five legacy redirects", () => {
    expect(legacyRouteRedirects).toHaveLength(5);
  });
});

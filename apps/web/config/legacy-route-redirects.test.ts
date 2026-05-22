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

  it("defines exactly the two legacy draft-jobs redirects", () => {
    expect(legacyRouteRedirects).toHaveLength(2);
    expect(new Set(legacyRouteRedirects.map((r) => r.source))).toEqual(
      new Set(["/draft-jobs/:id", "/draft-jobs"]),
    );
  });
});

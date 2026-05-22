import { describe, expect, it, vi } from "vitest";

import HomePage from "./page";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

describe("HomePage", () => {
  it("redirects to /jobs", async () => {
    const { redirect } = await import("next/navigation");
    HomePage();
    expect(redirect).toHaveBeenCalledWith("/jobs");
  });
});

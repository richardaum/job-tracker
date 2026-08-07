import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WELCOME_TOUR_JOB_DRAFT_ID, saveWelcomeTourJobDraft } from "@/modules/welcome-tour/welcomeTourJobDraft";

import { useCreateLocalJob } from "./useCreateLocalJob";

vi.mock("@/modules/welcome-tour/welcomeTourJobDraft", () => ({
  WELCOME_TOUR_JOB_DRAFT_ID: "welcome-tour-job",
  saveWelcomeTourJobDraft: vi.fn(),
}));

describe("useCreateLocalJob", () => {
  it("persists a tutorial job and returns its virtual ID", async () => {
    vi.mocked(saveWelcomeTourJobDraft).mockResolvedValue(true);
    const { result } = renderHook(() => useCreateLocalJob());

    let jobId: string | null = null;
    await act(async () => {
      jobId = await result.current.createLocalJob({ title: "Frontend Engineer", company: "Acme" });
    });

    expect(saveWelcomeTourJobDraft).toHaveBeenCalledWith({ title: "Frontend Engineer", company: "Acme" });
    expect(jobId).toBe(WELCOME_TOUR_JOB_DRAFT_ID);
  });
});

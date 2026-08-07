import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ONBOARDING_JOB_DRAFT_ID, saveOnboardingJobDraft } from "@/modules/onboarding/utils/onboardingJobDraft";

import { useCreateLocalJob } from "./useCreateLocalJob";

vi.mock("@/modules/onboarding/utils/onboardingJobDraft", () => ({
  ONBOARDING_JOB_DRAFT_ID: "onboarding-job",
  saveOnboardingJobDraft: vi.fn(),
}));

describe("useCreateLocalJob", () => {
  it("persists a tutorial job and returns its virtual ID", async () => {
    vi.mocked(saveOnboardingJobDraft).mockResolvedValue(true);
    const { result } = renderHook(() => useCreateLocalJob());

    let jobId: string | null = null;
    await act(async () => {
      jobId = await result.current.createLocalJob({ title: "Frontend Engineer", company: "Acme" });
    });

    expect(saveOnboardingJobDraft).toHaveBeenCalledWith({ title: "Frontend Engineer", company: "Acme" });
    expect(jobId).toBe(ONBOARDING_JOB_DRAFT_ID);
  });
});

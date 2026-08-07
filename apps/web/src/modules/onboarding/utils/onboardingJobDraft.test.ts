import { describe, expect, it, vi } from "vitest";

import {
  ONBOARDING_JOB_DRAFT_ID,
  ONBOARDING_JOB_DRAFT_STORAGE_KEY,
  saveOnboardingJobDraft,
  toSyntheticJob,
} from "./onboardingJobDraft";

describe("saveOnboardingJobDraft", () => {
  it("persists a versioned tutorial-only job draft", async () => {
    const before = Date.now();

    await expect(saveOnboardingJobDraft({ title: "Frontend Engineer", company: "Acme" })).resolves.toBe(true);

    const savedValue = localStorage.getItem(ONBOARDING_JOB_DRAFT_STORAGE_KEY);
    expect(savedValue).not.toBeNull();

    const draft = JSON.parse(savedValue ?? "");
    expect(draft).toMatchObject({ id: ONBOARDING_JOB_DRAFT_ID, title: "Frontend Engineer", company: "Acme" });
    expect(new Date(draft.createdAt).getTime()).toBeGreaterThanOrEqual(before);
  });

  it("returns false when browser storage is unavailable", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    await expect(saveOnboardingJobDraft({ title: "Frontend Engineer", company: "Acme" })).resolves.toBe(false);

    setItem.mockRestore();
  });
});

describe("toSyntheticJob", () => {
  it("maps the tutorial draft into the job details selection", () => {
    const draft = {
      id: ONBOARDING_JOB_DRAFT_ID,
      title: "Frontend Engineer",
      company: "Acme",
      createdAt: "2026-08-07T12:00:00.000Z",
    };

    expect(toSyntheticJob(draft)).toMatchObject({
      id: ONBOARDING_JOB_DRAFT_ID,
      title: "Frontend Engineer",
      currentStage: "New",
      currentStageAt: draft.createdAt,
      createdAt: draft.createdAt,
      company: { id: "onboarding-company", name: "Acme" },
      urls: [],
      tags: [],
    });
  });
});

import { describe, expect, it, vi } from "vitest";

import {
  ONBOARDING_JOB_DRAFT_ID,
  ONBOARDING_JOB_DRAFT_STORAGE_KEY,
  saveOnboardingJobDraft,
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

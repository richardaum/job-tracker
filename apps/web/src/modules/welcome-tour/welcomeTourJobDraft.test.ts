import { describe, expect, it, vi } from "vitest";

import { ApplicationStage } from "@/gql/hooks";

import {
  createWelcomeTourJobStageEvent,
  getWelcomeTourJobDraft,
  saveWelcomeTourJobDraft,
  toSyntheticJob,
  updateWelcomeTourJobDraft,
  WELCOME_TOUR_JOB_DRAFT_ID,
  WELCOME_TOUR_JOB_DRAFT_STORAGE_KEY,
} from "./welcomeTourJobDraft";

describe("saveWelcomeTourJobDraft", () => {
  it("persists a versioned tutorial-only job draft", async () => {
    const before = Date.now();

    await expect(saveWelcomeTourJobDraft({ title: "Frontend Engineer", company: "Acme" })).resolves.toBe(true);

    const savedValue = localStorage.getItem(WELCOME_TOUR_JOB_DRAFT_STORAGE_KEY);
    expect(savedValue).not.toBeNull();

    const draft = JSON.parse(savedValue ?? "");
    expect(draft).toMatchObject({ id: WELCOME_TOUR_JOB_DRAFT_ID, title: "Frontend Engineer", company: "Acme" });
    expect(new Date(draft.createdAt).getTime()).toBeGreaterThanOrEqual(before);
  });

  it("returns false when browser storage is unavailable", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    await expect(saveWelcomeTourJobDraft({ title: "Frontend Engineer", company: "Acme" })).resolves.toBe(false);

    setItem.mockRestore();
  });
});

describe("toSyntheticJob", () => {
  it("maps the tutorial draft into the job details selection", () => {
    const draft = {
      id: WELCOME_TOUR_JOB_DRAFT_ID,
      title: "Frontend Engineer",
      company: "Acme",
      createdAt: "2026-08-07T12:00:00.000Z",
    };

    expect(toSyntheticJob(draft)).toMatchObject({
      id: WELCOME_TOUR_JOB_DRAFT_ID,
      title: "Frontend Engineer",
      currentStage: "New",
      currentStageAt: draft.createdAt,
      createdAt: draft.createdAt,
      company: { id: "welcome-tour-company", name: "Acme" },
      description: expect.stringContaining("Acme is looking for a Frontend Engineer"),
      urls: [],
      tags: [],
    });
  });
});

describe("updateWelcomeTourJobDraft", () => {
  it("updates the local description used by the tutorial job", async () => {
    await saveWelcomeTourJobDraft({ title: "Frontend Engineer", company: "Acme" });

    await expect(
      updateWelcomeTourJobDraft(WELCOME_TOUR_JOB_DRAFT_ID, { description: '{"type":"doc","content":[]}' }),
    ).resolves.toBe(true);

    expect(getWelcomeTourJobDraft()?.description).toBe('{"type":"doc","content":[]}');
  });
});

describe("createWelcomeTourJobStageEvent", () => {
  it("persists the local status event and exposes it through the synthetic job", async () => {
    await saveWelcomeTourJobDraft({ title: "Frontend Engineer", company: "Acme" });

    await expect(
      createWelcomeTourJobStageEvent({
        jobId: WELCOME_TOUR_JOB_DRAFT_ID,
        toStage: ApplicationStage.Applied,
        reason: "Submitted application",
      }),
    ).resolves.toBe(true);

    const draft = getWelcomeTourJobDraft();
    expect(draft?.stageEvents).toHaveLength(1);
    if (!draft) throw new Error("Expected the welcome tour job draft to exist.");
    const job = toSyntheticJob(draft);
    expect(job.currentStage).toBe(ApplicationStage.Applied);
    expect(job.currentStageReason).toBe("Submitted application");
  });
});

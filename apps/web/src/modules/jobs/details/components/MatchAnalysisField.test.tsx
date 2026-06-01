import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AsyncMetadataStatus, FitClassification } from "@/gql/hooks";
import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";

import { MatchAnalysisField } from "./MatchAnalysisField";

const routerPushSpy = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: routerPushSpy }) }));

describe("MatchAnalysisField", () => {
  it("navigates to /jobs/:jobId/match when opening full analysis", async () => {
    const user = userEvent.setup();
    routerPushSpy.mockClear();

    const match = {
      id: "match-99",
      classification: FitClassification.Positive,
      scoreRatio: 0.8,
      matchCount: 1,
      gapCount: 0,
      unclearCount: 0,
      generationMetadata: { status: AsyncMetadataStatus.Completed },
    } as unknown as NonNullable<JobDetailsValues["match"]>;

    render(<MatchAnalysisField jobId="job-42" match={match} />);

    await user.click(screen.getByRole("button", { name: "View full match analysis" }));

    expect(routerPushSpy).toHaveBeenCalledWith("/jobs/job-42/match");
  });
});

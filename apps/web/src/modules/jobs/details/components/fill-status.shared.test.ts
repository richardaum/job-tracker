import { describe, expect, it } from "vitest";

import { AsyncMetadataStatus } from "@/gql/hooks";

import { getFillStatusTooltipContent } from "./fill-status.shared";

describe("getFillStatusTooltipContent", () => {
  it("returns processing tooltip", () => {
    expect(getFillStatusTooltipContent(AsyncMetadataStatus.Processing)).toBe(
      "Filling job fields automatically. Updates will appear when complete.",
    );
  });

  it("returns completed tooltip", () => {
    expect(getFillStatusTooltipContent(AsyncMetadataStatus.Completed)).toBe(
      "Job fields were filled automatically. Open Overview to review.",
    );
  });

  it("includes error details when fill failed", () => {
    expect(
      getFillStatusTooltipContent(
        AsyncMetadataStatus.Failed,
        "LLM unreachable",
      ),
    ).toBe(
      "Automatic fill failed. Retry from Actions or review fields on Overview. LLM unreachable",
    );
  });
});

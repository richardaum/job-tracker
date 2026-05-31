import { describe, expect, it } from "vitest";

import { AsyncMetadataStatus } from "@/gql/hooks";

import { deriveJobFillButtonState } from "./deriveJobFillButtonState";

describe("deriveJobFillButtonState", () => {
  it("is loading during mutation regardless of persisted status", () => {
    expect(deriveJobFillButtonState(AsyncMetadataStatus.Completed, true)).toBe("loading");
    expect(deriveJobFillButtonState(undefined, true)).toBe("loading");
  });

  it("is loading when persisted fill metadata is PROCESSING", () => {
    expect(deriveJobFillButtonState(AsyncMetadataStatus.Processing, false)).toBe("loading");
  });

  it("is default otherwise", () => {
    expect(deriveJobFillButtonState(AsyncMetadataStatus.Completed, false)).toBe("default");
    expect(deriveJobFillButtonState(undefined, false)).toBe("default");
  });
});

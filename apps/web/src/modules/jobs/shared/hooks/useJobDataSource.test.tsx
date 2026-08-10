import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useJobDataSource } from "./useJobDataSource";

const useWelcomeTourMock = vi.fn();

vi.mock("@/modules/welcome-tour/useWelcomeTour", () => ({ useWelcomeTour: () => useWelcomeTourMock() }));

describe("useJobDataSource", () => {
  it("uses local data while the welcome tour is active", () => {
    useWelcomeTourMock.mockReturnValue({ activePhase: "job-creation" });

    const { result } = renderHook(() => useJobDataSource());

    expect(result.current).toBe("local");
  });

  it("uses database when there is no active tour", () => {
    useWelcomeTourMock.mockReturnValue({ activePhase: null });

    const { result } = renderHook(() => useJobDataSource());

    expect(result.current).toBe("database");
  });
});

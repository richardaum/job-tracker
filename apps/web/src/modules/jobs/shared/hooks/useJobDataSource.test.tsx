import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { TourContext } from "@/modules/tour/tour.context";
import { WELCOME_TOUR_REGISTRY } from "@/modules/welcome-tour/welcomeTourDefinitions";

import { useJobDataSource } from "./useJobDataSource";

function Wrapper({ children, activeTour }: { children: ReactNode; activeTour: "welcome-tour" | null }) {
  return (
    <TourContext.Provider
      value={{
        activeTour: activeTour ? { ...WELCOME_TOUR_REGISTRY[activeTour], phase: "job-creation" } : null,
        startTour: () => undefined,
        completeCurrentSegment: () => undefined,
        completeTour: () => undefined,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

describe("useJobDataSource", () => {
  it("uses the data source declared by the active tour", () => {
    const { result } = renderHook(() => useJobDataSource(), {
      wrapper: ({ children }) => <Wrapper activeTour="welcome-tour">{children}</Wrapper>,
    });

    expect(result.current).toBe("local");
  });

  it("uses database when there is no active tour", () => {
    const { result } = renderHook(() => useJobDataSource(), {
      wrapper: ({ children }) => <Wrapper activeTour={null}>{children}</Wrapper>,
    });

    expect(result.current).toBe("database");
  });
});

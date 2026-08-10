import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { WelcomeTourProvider } from "./WelcomeTourProvider";
import { useWelcomeTour } from "./useWelcomeTour";

function Wrapper({ children }: { children: ReactNode }) {
  return <WelcomeTourProvider>{children}</WelcomeTourProvider>;
}

describe("WelcomeTourProvider", () => {
  afterEach(() => window.sessionStorage.clear());

  it("keeps the created-job toast ID until the details segment consumes it", () => {
    const { result } = renderHook(() => useWelcomeTour(), { wrapper: Wrapper });

    act(() => result.current.setCreatedJobToastId("toast-1"));

    expect(result.current.createdJobToastId).toBe("toast-1");

    let toastId: string | null = null;
    act(() => {
      toastId = result.current.takeCreatedJobToastId();
    });

    expect(toastId).toBe("toast-1");
    expect(result.current.createdJobToastId).toBeNull();
  });
});

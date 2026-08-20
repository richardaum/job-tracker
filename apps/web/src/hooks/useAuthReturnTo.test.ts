import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useAuthReturnTo } from "./useAuthReturnTo";

const usePathnameMock = vi.fn();
const useSearchParamsMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
  useSearchParams: () => useSearchParamsMock(),
}));

describe("useAuthReturnTo", () => {
  it("builds login redirect url with current path and query", () => {
    usePathnameMock.mockReturnValue("/jobs");
    useSearchParamsMock.mockReturnValue(new URLSearchParams("status=OPEN"));

    const { result } = renderHook(() => useAuthReturnTo());

    expect(result.current.loginRedirectUrl).toBe("/login?returnTo=%2Fjobs%3Fstatus%3DOPEN");
  });

  it("returns safe returnTo from query param", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(new URLSearchParams("returnTo=%2Fjobs%2F123"));

    const { result } = renderHook(() => useAuthReturnTo());

    expect(result.current.safeReturnTo).toBe("/jobs/123");
  });

  it("falls back to jobs when returnTo is missing", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(new URLSearchParams());

    const { result } = renderHook(() => useAuthReturnTo());

    expect(result.current.safeReturnTo).toBe("/jobs");
  });

  it("falls back to jobs for an unsafe returnTo", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(new URLSearchParams("returnTo=https%3A%2F%2Fevil.example"));

    const { result } = renderHook(() => useAuthReturnTo());

    expect(result.current.safeReturnTo).toBe("/jobs");
  });
});

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ApplicationQuickFilter } from "@/gql/hooks";

import { useQuickFilter } from "./useQuickFilter";

const navigationMocks = { searchParams: "" };

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigationMocks.searchParams),
}));

describe("useQuickFilter", () => {
  it("maps q=draft to ApplicationQuickFilter.Draft", () => {
    navigationMocks.searchParams = "q=draft";
    const { result } = renderHook(() => useQuickFilter());
    expect(result.current).toBe(ApplicationQuickFilter.Draft);
  });

  it("defaults to Incoming when q is absent", () => {
    navigationMocks.searchParams = "";
    const { result } = renderHook(() => useQuickFilter());
    expect(result.current).toBe(ApplicationQuickFilter.Incoming);
  });

  it("returns null for unknown q values", () => {
    navigationMocks.searchParams = "q=unknown";
    const { result } = renderHook(() => useQuickFilter());
    expect(result.current).toBeNull();
  });
});

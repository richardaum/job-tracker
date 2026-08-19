import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useMapFromArray } from "./useMapFromArray";

describe("useMapFromArray", () => {
  it("builds a map using the supplied key", () => {
    const items = [
      { id: "first", label: "First" },
      { id: "second", label: "Second" },
    ];
    const { result } = renderHook(() => useMapFromArray(items, (item) => item.id));

    expect(result.current).toEqual(new Map(items.map((item) => [item.id, item])));
  });

  it("returns an empty map when items are missing", () => {
    const { result } = renderHook(() => useMapFromArray(undefined, (item: { id: string }) => item.id));

    expect(result.current).toEqual(new Map());
  });
});

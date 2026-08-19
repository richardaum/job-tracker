import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useFilteredResults } from "./useFilteredResults";

const items = [
  { id: "1", name: "Acme Corporation" },
  { id: "2", name: "Northstar Labs" },
];

describe("useFilteredResults", () => {
  it("returns the original items when the search is blank", () => {
    const { result } = renderHook(() =>
      useFilteredResults({ items, search: "  ", getSearchableText: (item) => item.name }),
    );

    expect(result.current).toBe(items);
  });

  it("matches text case-insensitively after trimming the search", () => {
    const { result } = renderHook(() =>
      useFilteredResults({ items, search: "  NORTH  ", getSearchableText: (item) => item.name }),
    );

    expect(result.current).toEqual([items[1]]);
  });
});

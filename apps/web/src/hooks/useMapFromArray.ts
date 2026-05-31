import { useMemo } from "react";

/**
 * Builds a `Map` keyed by `getKey(item)` from an optional array. Empty / missing
 * arrays yield an empty map.
 */
export function useMapFromArray<T, K>(items: readonly T[] | undefined, getKey: (item: T) => K): Map<K, T> {
  return useMemo(() => {
    const rows = items ?? [];
    return new Map(rows.map((item) => [getKey(item), item]));
  }, [getKey, items]);
}

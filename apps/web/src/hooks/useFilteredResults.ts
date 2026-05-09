import { useMemo } from "react";

export type UseFilteredResultsOptions<T> = {
  items: readonly T[];
  /** Search string; leading/trailing space is ignored. */
  search: string;
  /** Return the text to match against; keep this a stable reference (e.g. module-level fn). */
  getSearchableText: (item: T) => string;
};

/**
 * Client-side substring filter: empty `search` returns `items` as-is; otherwise keeps items
 * whose searchable text includes the normalized search string.
 */
export function useFilteredResults<T>({
  items,
  search,
  getSearchableText,
}: UseFilteredResultsOptions<T>): T[] {
  const normalized = search.trim().toLowerCase();

  return useMemo(() => {
    if (normalized.length === 0) {
      return items as T[];
    }

    return items.filter((item) =>
      getSearchableText(item).toLowerCase().includes(normalized),
    );
  }, [getSearchableText, items, normalized]);
}

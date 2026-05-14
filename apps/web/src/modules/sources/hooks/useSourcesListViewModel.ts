import { useMemo, useState } from "react";

import { type SourceProfilesListQuery, useSourceProfilesListQuery } from "@/gql/hooks";

export type SourceProfileRow = SourceProfilesListQuery["sourceProfiles"][number];

function sourceProfileSearchHaystack(row: SourceProfileRow): string {
  return `${row.name}\n${row.sourceProfileId}`.toLowerCase();
}

export function useSourcesListViewModel() {
  const { data, loading, error } = useSourceProfilesListQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const trimmedSearch = searchQuery.trim().toLowerCase();

  const sourceProfiles = useMemo(() => {
    const rows = data?.sourceProfiles ?? [];
    const sorted = [...rows].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
    if (!trimmedSearch) return sorted;
    return sorted.filter((row) =>
      sourceProfileSearchHaystack(row).includes(trimmedSearch),
    );
  }, [data?.sourceProfiles, trimmedSearch]);

  const showInitialLoading = loading && !data;

  return { sourceProfiles, searchQuery, setSearchQuery, error, showInitialLoading };
}

import { useMemo, useState } from "react";

import { type ImportersListQuery, useImportersListQuery } from "@/gql/hooks";

export type ImporterRow = ImportersListQuery["importers"][number];

function importerSearchHaystack(row: ImporterRow): string {
  return `${row.name}\n${row.importerId}`.toLowerCase();
}

export function useImportersListViewModel() {
  const { data, loading, error } = useImportersListQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const trimmedSearch = searchQuery.trim().toLowerCase();

  const importers = useMemo(() => {
    const rows = data?.importers ?? [];
    const sorted = [...rows].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
    if (!trimmedSearch) return sorted;
    return sorted.filter((row) =>
      importerSearchHaystack(row).includes(trimmedSearch),
    );
  }, [data?.importers, trimmedSearch]);

  const showInitialLoading = loading && !data;

  return { importers, searchQuery, setSearchQuery, error, showInitialLoading };
}

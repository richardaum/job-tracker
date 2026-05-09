"use client";

import { useMemo } from "react";

import type { BuiltInImportersQuery, ImportRunsQuery } from "@/gql/hooks";
import type { ImportRun } from "@/modules/imports/types/importRun";

export type BuiltInImporterForRunModel =
  BuiltInImportersQuery["builtInImporters"][number];

type GqlImportRunRow = ImportRunsQuery["importRuns"][number];

function mapGqlImportRunsToModels(
  rows: readonly GqlImportRunRow[] | undefined | null,
  builtInImporterById: ReadonlyMap<string, BuiltInImporterForRunModel>,
): ImportRun[] {
  return (rows ?? []).map((r) => ({
    id: r.id,
    importerId: r.importerId,
    importerName: builtInImporterById.get(r.importerId)?.name ?? r.importerId,
    importerSource: r.importerSource,
    status: r.status,
    startedAt:
      typeof r.startedAt === "string"
        ? r.startedAt
        : new Date(r.startedAt as unknown as Date).toISOString(),
    entryUrl: r.entryUrl,
  }));
}

export function useImportRunsModel(
  importRuns: ImportRunsQuery["importRuns"] | undefined | null,
  builtInImporterById: ReadonlyMap<string, BuiltInImporterForRunModel>,
): ImportRun[] {
  return useMemo(
    () => mapGqlImportRunsToModels(importRuns, builtInImporterById),
    [importRuns, builtInImporterById],
  );
}

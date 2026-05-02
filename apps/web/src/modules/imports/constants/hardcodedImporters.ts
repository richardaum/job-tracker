import type { HardcodedImporterOption } from "@/modules/imports/types/importRun";

/** Built-in importer registry (v1). Extend per board; DB-backed list comes later. */
export const HARDCODED_IMPORTERS: readonly HardcodedImporterOption[] = [
  { id: "remoteyeah", name: "RemoteYeah" },
];

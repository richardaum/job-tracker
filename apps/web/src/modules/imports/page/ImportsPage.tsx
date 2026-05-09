"use client";

import { Button, cn, ConfirmDialog, Stack, Text } from "@job-tracker/ui";
import { TrashSimpleIcon } from "@phosphor-icons/react";
import { useCallback, useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import {
  ImportRunsDocument,
  useBuiltInImportersQuery,
  useClearImportRunsMutation,
  useCreateImportRunMutation,
  useImportRunsQuery,
} from "@/gql/hooks";
import { useFilteredResults } from "@/hooks/useFilteredResults";
import { useMapFromArray } from "@/hooks/useMapFromArray";
import { SearchInput } from "@/modules/applications/shared/components/SearchInput";
import { useImportRunsModel } from "@/modules/imports/hooks/useImportRunsModel";
import { ImportRunCard } from "@/modules/imports/list/components/ImportRunCard";
import { importRunSearchHaystack } from "@/modules/imports/utils/importRunDisplay";

import { ImportRunDetails } from "./ImportRunDetails";
import { NewImportRunDialog } from "./NewImportRunDialog";

export default function ImportsPage() {
  const { data: builtInData } = useBuiltInImportersQuery();
  const { data, loading: loadingRuns } = useImportRunsQuery();
  const [createImportRun, { loading: creatingRun }] =
    useCreateImportRunMutation({
      refetchQueries: [{ query: ImportRunsDocument }],
      awaitRefetchQueries: true,
    });
  const [clearImportRuns] = useClearImportRunsMutation({
    refetchQueries: [{ query: ImportRunsDocument }],
    awaitRefetchQueries: true,
  });

  const builtInImporterById = useMapFromArray(
    builtInData?.builtInImporters,
    builtInImporterKey,
  );

  const runs = useImportRunsModel(data?.importRuns, builtInImporterById);

  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [newRunOpen, setNewRunOpen] = useState(false);
  const [importerComboValue, setImporterComboValue] = useState("");
  const [query, setQuery] = useState("");

  const selectedImporter =
    builtInImporterById.get(importerComboValue.trim()) ?? null;

  const selectedRun = useMemo(
    () => runs.find((r) => r.id === selectedRunId) ?? null,
    [runs, selectedRunId],
  );

  const filteredRuns = useFilteredResults({
    items: runs,
    search: query,
    getSearchableText: importRunSearchHaystack,
  });

  const handleOpenChange = useCallback((open: boolean) => {
    setNewRunOpen(open);
    if (!open) {
      setImporterComboValue("");
    }
  }, []);

  const handleStartRun = useCallback(async () => {
    if (!selectedImporter) return;
    const res = await createImportRun({
      variables: { input: { importerId: selectedImporter.importerId } },
    });
    const created = res.data?.createImportRun;
    if (created) {
      setSelectedRunId(created.id);
    }
    handleOpenChange(false);
  }, [createImportRun, handleOpenChange, selectedImporter]);

  const handleClearAllImports = useCallback(async () => {
    await clearImportRuns();
    setSelectedRunId(null);
  }, [clearImportRuns]);

  const listEmpty = !loadingRuns && filteredRuns.length === 0;

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <div
        className={cn(
          "flex shrink-0 flex-col gap-3 border-b border-border-subtle p-4  sm:flex-row sm:items-center sm:justify-between sm:px-6",
        )}
      >
        <div className={cn("flex w-full flex-col gap-2 sm:max-w-sm")}>
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search import runs..."
            ariaLabel="Search import runs"
          />
        </div>
        <div className={cn("flex flex-wrap items-center gap-2")}>
          <ConfirmDialog
            title="Clear import runs"
            description="Remove every import run from your history for this account. This cannot be undone. You can start new runs afterward."
            confirmLabel="Clear all"
            trigger={
              <Button
                intent="destructive"
                size="md"
                type="button"
                disabled={runs.length === 0}
                leftIcon={<TrashSimpleIcon size={16} weight="regular" />}
              >
                Clear imports
              </Button>
            }
            onConfirm={handleClearAllImports}
          />
          <NewImportRunDialog
            open={newRunOpen}
            onOpenChange={handleOpenChange}
            importerComboValue={importerComboValue}
            onImporterComboValueChange={setImporterComboValue}
            canStart={Boolean(selectedImporter)}
            creatingRun={creatingRun}
            onStart={handleStartRun}
          />
        </div>
      </div>

      <div className={cn("flex min-h-0 flex-1 flex-col md:flex-row")}>
        <div
          className={cn(
            "flex max-h-[40vh] shrink-0 flex-col border-b border-border-subtle md:max-h-none",
            selectedRun
              ? "md:w-80 md:border-b-0 md:border-r"
              : "md:w-full md:flex-1 md:border-b-0",
          )}
        >
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-y-auto p-3 sm:p-4",
            )}
          >
            {loadingRuns ? (
              <Text size="sm" color="secondary">
                Loading runs…
              </Text>
            ) : listEmpty ? (
              <EmptyState
                variant="actionHint"
                headline="No import runs yet"
                description="Pick a built-in importer to start a run. It will show up in this list while it executes."
                onAction={() => setNewRunOpen(true)}
              />
            ) : (
              <Stack gap="xs">
                {filteredRuns.map((run) => (
                  <ImportRunCard
                    key={run.id}
                    run={run}
                    selected={run.id === selectedRunId}
                    onSelect={() => setSelectedRunId(run.id)}
                  />
                ))}
              </Stack>
            )}
          </div>
        </div>

        {selectedRun ? (
          <ImportRunDetails
            run={selectedRun}
            onDeleted={() => setSelectedRunId(null)}
          />
        ) : null}
      </div>
    </div>
  );
}

function builtInImporterKey(row: { importerId: string }) {
  return row.importerId;
}

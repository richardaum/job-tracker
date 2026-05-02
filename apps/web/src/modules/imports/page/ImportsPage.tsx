"use client";

import {
  Button,
  cn,
  Combobox,
  type ComboboxOption,
  Dialog,
  Heading,
  Stack,
  Text,
} from "@job-tracker/ui";
import { PlusIcon } from "@phosphor-icons/react";
import { useCallback, useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import {
  ImportRunsDocument,
  useCreateImportRunMutation,
  useImportRunsQuery,
} from "@/gql/hooks";
import { HARDCODED_IMPORTERS } from "@/modules/imports/constants/hardcodedImporters";
import { ImportRunCard } from "@/modules/imports/list/components/ImportRunCard";
import type { ImportRun } from "@/modules/imports/types/importRun";

import { ImportRunDetails } from "./ImportRunDetails";

const IMPORTER_COMBO_ID = "imports-new-run-importer";

const IMPORTER_COMBO_OPTIONS: ComboboxOption[] = HARDCODED_IMPORTERS.map(
  (imp) => ({ value: imp.id, label: imp.name }),
);

export default function ImportsPage() {
  const { data, loading: loadingRuns } = useImportRunsQuery();
  const [createImportRun, { loading: creatingRun }] =
    useCreateImportRunMutation({
      refetchQueries: [{ query: ImportRunsDocument }],
      awaitRefetchQueries: true,
    });

  const runs: ImportRun[] = useMemo(
    () =>
      (data?.importRuns ?? []).map((r) => ({
        id: r.id,
        importerId: r.importerId,
        importerName: r.importerName,
        importerSource: r.importerSource,
        status: r.status,
        startedAt:
          typeof r.startedAt === "string"
            ? r.startedAt
            : new Date(r.startedAt as unknown as Date).toISOString(),
        entryUrl: r.entryUrl,
      })),
    [data?.importRuns],
  );

  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [newRunOpen, setNewRunOpen] = useState(false);
  const [importerComboValue, setImporterComboValue] = useState("");

  const selectedHardcoded = useMemo(
    () =>
      HARDCODED_IMPORTERS.find(
        (i) =>
          i.id === importerComboValue.trim() ||
          i.name === importerComboValue.trim(),
      ) ?? null,
    [importerComboValue],
  );

  const selectedRun = useMemo(
    () => runs.find((r) => r.id === selectedRunId) ?? null,
    [runs, selectedRunId],
  );

  const handleOpenChange = useCallback((open: boolean) => {
    setNewRunOpen(open);
    if (!open) {
      setImporterComboValue("");
    }
  }, []);

  const handleStartRun = useCallback(async () => {
    if (!selectedHardcoded) return;
    const res = await createImportRun({
      variables: { input: { importerId: selectedHardcoded.id } },
    });
    const created = res.data?.createImportRun;
    if (created) {
      setSelectedRunId(created.id);
    }
    handleOpenChange(false);
  }, [createImportRun, handleOpenChange, selectedHardcoded]);

  const listEmpty = !loadingRuns && runs.length === 0;

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <div
        className={cn(
          "flex shrink-0 flex-col gap-3 border-b border-border-subtle px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        )}
      >
        <Heading as="h1" size="xl">
          Imports
        </Heading>
        <Dialog
          open={newRunOpen}
          onOpenChange={handleOpenChange}
          title="New run"
          size="sm"
          trigger={
            <Button
              intent="primary"
              size="sm"
              leftIcon={<PlusIcon size={16} weight="bold" />}
              type="button"
            >
              New run
            </Button>
          }
          footer={
            <div className={cn("flex w-full justify-end gap-2")}>
              <Button
                intent="secondary"
                size="sm"
                type="button"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                intent="primary"
                size="sm"
                type="button"
                disabled={!selectedHardcoded || creatingRun}
                onClick={() => void handleStartRun()}
              >
                Start
              </Button>
            </div>
          }
        >
          <Combobox
            id={IMPORTER_COMBO_ID}
            value={importerComboValue}
            onValueChange={setImporterComboValue}
            options={IMPORTER_COMBO_OPTIONS}
            placeholder="Choose importer"
            size="sm"
            autoComplete="off"
          />
        </Dialog>
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
                {runs.map((run) => (
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

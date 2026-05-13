"use client";

import { tryRun } from "@job-tracker/try-run";
import {
  Button,
  cn,
  Dialog,
  FormField,
  Input,
  Select,
  type SelectOption,
  Skeleton,
  Stack,
  Text,
} from "@job-tracker/ui";
import React, { useCallback, useMemo, useState } from "react";

import {
  ImportersListDocument,
  ImportTemplatesForImporterDocument,
  useCreateImportTemplateMutation,
  useImportersForNewImportTemplatePickerQuery,
} from "@/gql/hooks";

export type NewImportTemplateDialogImporterRef = {
  importerId: string;
  name: string;
};

type NewImportTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (importer: NewImportTemplateDialogImporterRef) => void;
};

export function NewImportTemplateDialog({
  open,
  onOpenChange,
  onCreated,
}: NewImportTemplateDialogProps) {
  const [selectedImporterId, setSelectedImporterId] = useState("");
  const [surfaceUrl, setSurfaceUrl] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const notifyOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setSelectedImporterId("");
        setSurfaceUrl("");
        setSubmitError(null);
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );
  const close = useCallback(() => notifyOpenChange(false), [notifyOpenChange]);

  const [createImportTemplate] = useCreateImportTemplateMutation({
    awaitRefetchQueries: true,
  });

  const {
    data,
    loading,
    error: loadError,
  } = useImportersForNewImportTemplatePickerQuery({
    skip: !open,
    fetchPolicy: "cache-and-network",
  });

  const sortedImporters = useMemo(() => {
    const rows = data?.importers ?? [];
    return [...rows].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
  }, [data?.importers]);

  const selectOptions: SelectOption[] = useMemo(
    () =>
      sortedImporters.map((row) => ({
        value: row.importerId,
        label: row.name,
      })),
    [sortedImporters],
  );

  const selectedRow = sortedImporters.find(
    (row) => row.importerId === selectedImporterId,
  );

  async function handleCreate() {
    if (!selectedRow) return;
    const trimmedSurfaceUrl = surfaceUrl.trim();
    if (trimmedSurfaceUrl === "") {
      setSubmitError("Listing URL is mandatory.");
      return;
    }

    setSaving(true);
    setSubmitError(null);
    const importerId = selectedRow.importerId;
    const [err] = await tryRun(
      createImportTemplate({
        variables: { input: { importerId, surfaceUrl: trimmedSurfaceUrl } },
        refetchQueries: [
          ImportersListDocument,
          {
            query: ImportTemplatesForImporterDocument,
            variables: { importerId },
          },
        ],
      }),
    );
    setSaving(false);
    if (err) {
      setSubmitError("Could not create import template. Try again.");
      return;
    }
    onCreated?.({ importerId: selectedRow.importerId, name: selectedRow.name });
    close();
  }

  const pickerDisabled = loading || Boolean(loadError);
  const showSkeleton = loading && sortedImporters.length === 0 && !loadError;

  return (
    <Dialog
      open={open}
      onOpenChange={notifyOpenChange}
      size="md"
      title="New import template"
      description={
        <Text size="sm" color="secondary">
          Pick an importer and provide the listing URL to create a template.
        </Text>
      }
    >
      <Stack gap="sm">
        {loadError ? (
          <Text size="sm" color="error">
            Could not load importers. Close and try again.
          </Text>
        ) : null}
        {showSkeleton ? (
          <Skeleton variant="rect" className={cn("h-10 w-full")} />
        ) : (
          <Stack gap="sm">
            <FormField label="Importer">
              <Select
                options={selectOptions}
                placeholder="Choose importer…"
                value={
                  selectedImporterId === "" ? undefined : selectedImporterId
                }
                onValueChange={setSelectedImporterId}
                disabled={pickerDisabled}
                size="md"
              />
            </FormField>
            <FormField label="Listing URL">
              <Input
                placeholder="https://…"
                value={surfaceUrl}
                onChange={(e) => setSurfaceUrl(e.target.value)}
                disabled={pickerDisabled || saving}
              />
            </FormField>
          </Stack>
        )}
        {submitError ? (
          <Text size="sm" color="error">
            {submitError}
          </Text>
        ) : null}
        <div className={cn("flex justify-end gap-2")}>
          <Button intent="secondary" disabled={saving} onClick={close}>
            Cancel
          </Button>
          <Button
            intent="primary"
            state={saving ? "loading" : "default"}
            disabled={!selectedRow || pickerDisabled}
            onClick={() => void handleCreate()}
          >
            Create template
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}

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
  SourceProfilesListDocument,
  SourcesForSourceProfileDocument,
  useCreateSourceTemplateMutation,
  useSourceProfilesListAllQuery,
} from "@/gql/hooks";

type NewSourceDialogSourceProfileRef = {
  sourceProfileId: string;
  name: string;
};

type NewSourceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (sourceProfile: NewSourceDialogSourceProfileRef) => void;
};

export function NewSourceDialog({
  open,
  onOpenChange,
  onCreated,
}: NewSourceDialogProps) {
  const [selectedSourceProfileId, setSelectedSourceProfileId] = useState("");
  const [surfaceUrl, setSurfaceUrl] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const notifyOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setSelectedSourceProfileId("");
        setSurfaceUrl("");
        setSubmitError(null);
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );
  const close = useCallback(() => notifyOpenChange(false), [notifyOpenChange]);

  const [createSource] = useCreateSourceTemplateMutation({
    awaitRefetchQueries: true,
  });

  const {
    data,
    loading,
    error: loadError,
  } = useSourceProfilesListAllQuery({
    skip: !open,
    fetchPolicy: "cache-and-network",
  });

  const selectOptions: SelectOption[] = useMemo(
    () =>
      (data?.sourceProfiles ?? []).map((row) => ({
        value: row.sourceProfileId,
        label: row.name,
      })),
    [data?.sourceProfiles],
  );

  const selectedRow = (data?.sourceProfiles ?? []).find(
    (row) => row.sourceProfileId === selectedSourceProfileId,
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
    const sourceProfileId = selectedRow.sourceProfileId;
    const [err] = await tryRun(
      createSource({
        variables: {
          input: { sourceProfileId, surfaceUrl: trimmedSurfaceUrl },
        },
        refetchQueries: [
          SourceProfilesListDocument,
          {
            query: SourcesForSourceProfileDocument,
            variables: { sourceProfileId },
          },
        ],
      }),
    );
    setSaving(false);
    if (err) {
      setSubmitError("Could not create source. Try again.");
      return;
    }
    onCreated?.({
      sourceProfileId: selectedRow.sourceProfileId,
      name: selectedRow.name,
    });
    close();
  }

  const pickerDisabled = loading || Boolean(loadError);
  const showSkeleton =
    loading && (data?.sourceProfiles ?? []).length === 0 && !loadError;

  return (
    <Dialog
      open={open}
      onOpenChange={notifyOpenChange}
      size="md"
      title="New source"
      description={
        <Text size="sm" color="secondary">
          Pick a source profile and provide the listing URL to create a source.
        </Text>
      }
    >
      <Stack gap="sm">
        {loadError ? (
          <Text size="sm" color="error">
            Could not load sources. Close and try again.
          </Text>
        ) : null}
        {showSkeleton ? (
          <Skeleton variant="rect" className={cn("h-10 w-full")} />
        ) : (
          <Stack gap="sm">
            <FormField label="Source profile">
              <Select
                options={selectOptions}
                placeholder="Choose source profile…"
                value={
                  selectedSourceProfileId === ""
                    ? undefined
                    : selectedSourceProfileId
                }
                onValueChange={setSelectedSourceProfileId}
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
            Create source
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}

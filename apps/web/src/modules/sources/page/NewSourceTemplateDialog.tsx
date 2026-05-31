"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, cn, Dialog, FormField, Input, Select, Stack, Text } from "@job-tracker/ui";
import { useCallback, useState } from "react";

import { useCreateSourceTemplateMutation } from "@/gql/hooks";

type StopWhen = "CatchUp" | "FirstRunMaxPages" | "OlderThan";

const stopWhenOptions = [
  { label: "CatchUp", value: "CatchUp" },
  { label: "First run max pages", value: "FirstRunMaxPages" },
  { label: "Older than", value: "OlderThan" },
];

function buildConfig(
  stopWhen: StopWhen,
  catchUpThreshold: string,
  maxPages: string,
  olderThanDays: string,
): Record<string, unknown> | null {
  if (stopWhen === "CatchUp" && catchUpThreshold) {
    return { stopWhen, catchUpThreshold: Number(catchUpThreshold) };
  }
  if (stopWhen === "FirstRunMaxPages" && maxPages) {
    return { stopWhen, maxPages: Number(maxPages) };
  }
  if (stopWhen === "OlderThan" && olderThanDays) {
    return { stopWhen, olderThanDays: Number(olderThanDays) };
  }
  return null;
}

type NewSourceTemplateDialogProps = { open: boolean; planId: string; onOpenChange: (open: boolean) => void };

export function NewSourceTemplateDialog({ open, planId, onOpenChange }: NewSourceTemplateDialogProps) {
  const [surfaceUrl, setSurfaceUrl] = useState("");
  const [stopWhen, setStopWhen] = useState<StopWhen>("CatchUp");
  const [catchUpThreshold, setCatchUpThreshold] = useState("");
  const [maxPages, setMaxPages] = useState("");
  const [olderThanDays, setOlderThanDays] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const paramError =
    stopWhen === "CatchUp" && !catchUpThreshold
      ? "Consecutive Duplicates is required when stop condition is CatchUp"
      : stopWhen === "FirstRunMaxPages" && !maxPages
        ? "Max Pages is required when stop condition is First run max pages"
        : stopWhen === "OlderThan" && !olderThanDays
          ? "Max Age is required when stop condition is Older than"
          : null;

  const notifyOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setSurfaceUrl("");
        setStopWhen("CatchUp");
        setCatchUpThreshold("");
        setMaxPages("");
        setOlderThanDays("");
        setSubmitError(null);
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );
  const close = useCallback(() => notifyOpenChange(false), [notifyOpenChange]);

  const [createTemplate] = useCreateSourceTemplateMutation({ awaitRefetchQueries: true });

  async function handleCreate() {
    const trimmed = surfaceUrl.trim();
    if (trimmed === "") {
      setSubmitError("Listing URL is mandatory.");
      return;
    }

    if (paramError) {
      setSubmitError(paramError);
      return;
    }

    setSaving(true);
    setSubmitError(null);

    const config = buildConfig(stopWhen, catchUpThreshold, maxPages, olderThanDays);

    const [err] = await tryRun(
      createTemplate({
        variables: { input: { planId, surfaceUrl: trimmed, config } },
        refetchQueries: ["Plans", "SourceTemplatesAll"],
      }),
    );
    setSaving(false);
    if (err) {
      setSubmitError("Could not create template. Try again.");
      return;
    }
    close();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={notifyOpenChange}
      size="md"
      title="New template"
      description={
        <Text size="sm" color="secondary">
          Provide the listing URL and configure scan stop conditions.
        </Text>
      }
    >
      <Stack gap="sm">
        <FormField label="Listing URL">
          <Input
            placeholder="https://…"
            value={surfaceUrl}
            onChange={(e) => setSurfaceUrl(e.target.value)}
            disabled={saving}
          />
        </FormField>

        <FormField label="Stop Condition" required>
          <Select
            placeholder="Select stop condition"
            options={stopWhenOptions}
            value={stopWhen}
            onValueChange={(v) => {
              setStopWhen(v as StopWhen);
              setSubmitError(null);
            }}
            disabled={saving}
            required
          />
        </FormField>

        {stopWhen === "CatchUp" && (
          <FormField label="Consecutive Duplicates" hint="Number of duplicate jobs in a row before stopping">
            <Input
              type="number"
              min={1}
              value={catchUpThreshold}
              onChange={(e) => {
                setCatchUpThreshold(e.target.value);
                setSubmitError(null);
              }}
              disabled={saving}
              placeholder="e.g. 5"
            />
          </FormField>
        )}

        {stopWhen === "FirstRunMaxPages" && (
          <FormField label="Max Pages" hint="Maximum number of pages to scan">
            <Input
              type="number"
              min={1}
              value={maxPages}
              onChange={(e) => {
                setMaxPages(e.target.value);
                setSubmitError(null);
              }}
              disabled={saving}
              placeholder="e.g. 3"
            />
          </FormField>
        )}

        {stopWhen === "OlderThan" && (
          <FormField label="Max Age (days)" hint="Stop when jobs are older than this many days">
            <Input
              type="number"
              min={1}
              value={olderThanDays}
              onChange={(e) => {
                setOlderThanDays(e.target.value);
                setSubmitError(null);
              }}
              disabled={saving}
              placeholder="e.g. 30"
            />
          </FormField>
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
            disabled={!surfaceUrl.trim()}
            onClick={() => void handleCreate()}
          >
            Create template
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}

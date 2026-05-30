"use client";

import { tryRun } from "@job-tracker/try-run";
import {
  Button,
  cn,
  Dialog,
  FormField,
  Input,
  Stack,
  Text,
} from "@job-tracker/ui";
import React, { useCallback, useState } from "react";

import { useCreateSourceTemplateMutation } from "@/gql/hooks";

type NewSourceTemplateDialogProps = {
  open: boolean;
  planId: string;
  onOpenChange: (open: boolean) => void;
};

export function NewSourceTemplateDialog({
  open,
  planId,
  onOpenChange,
}: NewSourceTemplateDialogProps) {
  const [surfaceUrl, setSurfaceUrl] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const notifyOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setSurfaceUrl("");
        setSubmitError(null);
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );
  const close = useCallback(() => notifyOpenChange(false), [notifyOpenChange]);

  const [createTemplate] = useCreateSourceTemplateMutation({
    awaitRefetchQueries: true,
  });

  async function handleCreate() {
    const trimmed = surfaceUrl.trim();
    if (trimmed === "") {
      setSubmitError("Listing URL is mandatory.");
      return;
    }

    setSaving(true);
    setSubmitError(null);
    const [err] = await tryRun(
      createTemplate({
        variables: { input: { planId, surfaceUrl: trimmed } },
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
          Provide the listing URL to create a new template.
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

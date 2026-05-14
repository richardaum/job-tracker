"use client";

import { tryRun } from "@job-tracker/try-run";
import {
  Button,
  Checkbox,
  cn,
  Dialog,
  FormField,
  Input,
  Stack,
  Text,
} from "@job-tracker/ui";
import React, { useCallback, useState } from "react";

import {
  SourcesForSourceProfileDocument,
  useUpdateSourceTemplateMutation,
} from "@/gql/hooks";
import type { SourceListItem } from "@/modules/sources/page/source-template-list.shared";

function useSourceMutationOptions(sourceProfileId: string) {
  return sourceProfileId
    ? {
        refetchQueries: [
          {
            query: SourcesForSourceProfileDocument,
            variables: { sourceProfileId },
          },
        ],
      }
    : {};
}

type SourceScheduleFormInnerProps = {
  template: SourceListItem;
  sourceProfileId: string;
  close: () => void;
  onScheduleSaved?: (
    id: string,
    patch: Pick<SourceListItem, "scheduleEnabled" | "scheduleCron">,
  ) => void;
};

function SourceScheduleFormInner({
  template,
  sourceProfileId,
  close,
  onScheduleSaved,
}: SourceScheduleFormInnerProps) {
  const refetchSources = useSourceMutationOptions(sourceProfileId);
  const [updateSource] = useUpdateSourceTemplateMutation(refetchSources);
  const [enabledDraft, setEnabledDraft] = useState(
    () => template.scheduleEnabled,
  );
  const [cronDraft, setCronDraft] = useState(() => template.scheduleCron ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const input: { scheduleEnabled: boolean; scheduleCron?: string | null } = {
      scheduleEnabled: enabledDraft,
    };
    if (enabledDraft) {
      const cronTrim = cronDraft.trim();
      input.scheduleCron = cronTrim === "" ? null : cronTrim;
    }
    const [err] = await tryRun(
      updateSource({ variables: { id: template.id, input } }),
    );
    setSaving(false);
    if (err) {
      setError("Could not save schedule. Try again.");
      return;
    }
    const cronTrimmed = cronDraft.trim() === "" ? null : cronDraft.trim();
    onScheduleSaved?.(template.id, {
      scheduleEnabled: enabledDraft,
      scheduleCron: enabledDraft ? cronTrimmed : template.scheduleCron,
    });
    close();
  }

  return (
    <Stack gap="sm">
      <label className={cn("flex cursor-pointer items-center gap-2")}>
        <Checkbox
          checked={enabledDraft}
          onCheckedChange={(checked) => setEnabledDraft(checked === true)}
          disabled={saving}
        />
        <Text size="sm">Enable scheduled sources</Text>
      </label>
      <FormField
        label="Cron expression"
        htmlFor={`template-schedule-cron-${template.id}`}
      >
        <Input
          id={`template-schedule-cron-${template.id}`}
          value={cronDraft}
          onChange={(event) => setCronDraft(event.target.value)}
          placeholder="0 9 * * *"
          disabled={saving || !enabledDraft}
        />
      </FormField>
      {error ? (
        <Text size="sm" color="error">
          {error}
        </Text>
      ) : null}
      <div className={cn("flex justify-end gap-2")}>
        <Button intent="secondary" disabled={saving} onClick={close}>
          Cancel
        </Button>
        <Button
          intent="primary"
          state={saving ? "loading" : "default"}
          onClick={() => void handleSave()}
        >
          Save
        </Button>
      </div>
    </Stack>
  );
}

type SourceScheduleDialogProps = {
  sourceProfileId: string;
  template: SourceListItem | null;
  onOpenChange: (open: boolean) => void;
  onScheduleSaved?: (
    id: string,
    patch: Pick<SourceListItem, "scheduleEnabled" | "scheduleCron">,
  ) => void;
};

export function SourceScheduleDialog({
  sourceProfileId,
  template,
  onOpenChange,
  onScheduleSaved,
}: SourceScheduleDialogProps) {
  const open = template !== null;
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="Schedule"
      description={
        <Text size="sm" color="secondary">
          Enable periodic runs with a cron expression (server timezone).
        </Text>
      }
    >
      {open && template ? (
        <SourceScheduleFormInner
          key={template.id}
          template={template}
          sourceProfileId={sourceProfileId}
          close={close}
          onScheduleSaved={onScheduleSaved}
        />
      ) : null}
    </Dialog>
  );
}

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
  ImportTemplatesForImporterDocument,
  useUpdateImportTemplateMutation,
} from "@/gql/hooks";
import type { ImportTemplateListItem } from "@/modules/imports/page/import-template-list.shared";

function useImporterTemplateMutationOptions(importerId: string) {
  return importerId
    ? {
        refetchQueries: [
          {
            query: ImportTemplatesForImporterDocument,
            variables: { importerId },
          },
        ],
      }
    : {};
}

type ImportTemplateScheduleFormInnerProps = {
  template: ImportTemplateListItem;
  importerId: string;
  close: () => void;
  onScheduleSaved?: (
    id: string,
    patch: Pick<ImportTemplateListItem, "scheduleEnabled" | "scheduleCron">,
  ) => void;
};

function ImportTemplateScheduleFormInner({
  template,
  importerId,
  close,
  onScheduleSaved,
}: ImportTemplateScheduleFormInnerProps) {
  const refetchTemplates = useImporterTemplateMutationOptions(importerId);
  const [updateImportTemplate] =
    useUpdateImportTemplateMutation(refetchTemplates);
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
      updateImportTemplate({ variables: { id: template.id, input } }),
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
        <Text size="sm">Enable scheduled imports</Text>
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

type ImportTemplateScheduleDialogProps = {
  importerId: string;
  template: ImportTemplateListItem | null;
  onOpenChange: (open: boolean) => void;
  onScheduleSaved?: (
    id: string,
    patch: Pick<ImportTemplateListItem, "scheduleEnabled" | "scheduleCron">,
  ) => void;
};

export function ImportTemplateScheduleDialog({
  importerId,
  template,
  onOpenChange,
  onScheduleSaved,
}: ImportTemplateScheduleDialogProps) {
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
        <ImportTemplateScheduleFormInner
          key={template.id}
          template={template}
          importerId={importerId}
          close={close}
          onScheduleSaved={onScheduleSaved}
        />
      ) : null}
    </Dialog>
  );
}

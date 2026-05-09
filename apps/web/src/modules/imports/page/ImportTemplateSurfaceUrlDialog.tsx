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

const hiddenDialogTrigger = (
  <button type="button" className={cn("hidden")} aria-hidden />
);

type ImportTemplateSurfaceUrlFormInnerProps = {
  template: ImportTemplateListItem;
  importerId: string;
  close: () => void;
  onSurfaceSaved?: (id: string, surfaceUrl: string) => void;
};

function ImportTemplateSurfaceUrlFormInner({
  template,
  importerId,
  close,
  onSurfaceSaved,
}: ImportTemplateSurfaceUrlFormInnerProps) {
  const refetchTemplates = useImporterTemplateMutationOptions(importerId);
  const [updateImportTemplate] =
    useUpdateImportTemplateMutation(refetchTemplates);
  const [draft, setDraft] = useState(() => template.surfaceUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const trimmed = draft.trim();
    const next = trimmed;
    const prev = template.surfaceUrl?.trim() ?? "";
    const prevNorm = prev === "" ? null : prev;
    if (next === prevNorm) {
      close();
      return;
    }
    setSaving(true);
    setError(null);
    const [err] = await tryRun(
      updateImportTemplate({
        variables: { id: template.id, input: { surfaceUrl: next } },
      }),
    );
    setSaving(false);
    if (err) {
      setError("Could not save surface URL. Try again.");
      return;
    }
    onSurfaceSaved?.(template.id, next);
    close();
  }

  return (
    <Stack gap="sm">
      <FormField
        label="Listing URL"
        htmlFor={`template-surface-url-${template.id}`}
      >
        <Input
          id={`template-surface-url-${template.id}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="https://…"
          disabled={saving}
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

type ImportTemplateSurfaceUrlDialogProps = {
  importerId: string;
  template: ImportTemplateListItem | null;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful mutation so callers can reconcile other UI (e.g. open runs dialog). */
  onSurfaceSaved?: (id: string, surfaceUrl: string) => void;
};

export function ImportTemplateSurfaceUrlDialog({
  importerId,
  template,
  onOpenChange,
  onSurfaceSaved,
}: ImportTemplateSurfaceUrlDialogProps) {
  const open = template !== null;
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={hiddenDialogTrigger}
      size="md"
      title="Surface URL"
      description={
        <Text size="sm" color="secondary">
          Used as the listing URL for new and rerun imports. This field is
          mandatory.
        </Text>
      }
    >
      {open && template ? (
        <ImportTemplateSurfaceUrlFormInner
          key={template.id}
          template={template}
          importerId={importerId}
          close={close}
          onSurfaceSaved={onSurfaceSaved}
        />
      ) : null}
    </Dialog>
  );
}

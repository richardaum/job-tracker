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

type SourceSurfaceUrlFormInnerProps = {
  template: SourceListItem;
  sourceProfileId: string;
  close: () => void;
  onSurfaceSaved?: (id: string, surfaceUrl: string) => void;
};

function SourceSurfaceUrlFormInner({
  template,
  sourceProfileId,
  close,
  onSurfaceSaved,
}: SourceSurfaceUrlFormInnerProps) {
  const refetchSources = useSourceMutationOptions(sourceProfileId);
  const [updateSource] = useUpdateSourceTemplateMutation(refetchSources);
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
      updateSource({
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

type SourceSurfaceUrlDialogProps = {
  sourceProfileId: string;
  template: SourceListItem | null;
  onOpenChange: (open: boolean) => void;
  onSurfaceSaved?: (id: string, surfaceUrl: string) => void;
};

export function SourceSurfaceUrlDialog({
  sourceProfileId,
  template,
  onOpenChange,
  onSurfaceSaved,
}: SourceSurfaceUrlDialogProps) {
  const open = template !== null;
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="Surface URL"
      description={
        <Text size="sm" color="secondary">
          Used as the listing URL for new and rerun sources. This field is
          mandatory.
        </Text>
      }
    >
      {open && template ? (
        <SourceSurfaceUrlFormInner
          key={template.id}
          template={template}
          sourceProfileId={sourceProfileId}
          close={close}
          onSurfaceSaved={onSurfaceSaved}
        />
      ) : null}
    </Dialog>
  );
}

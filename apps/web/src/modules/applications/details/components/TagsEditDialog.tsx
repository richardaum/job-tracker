"use client";

import { Button, cn, Dialog, FormField, Stack } from "@job-tracker/ui";
import React, { useState } from "react";

import {
  ApplicationDocument,
  ApplicationsDocument,
  useUpdateApplicationMutation,
} from "@/gql/hooks";
import {
  TagsInput,
  type TagWithMetadata,
} from "@/modules/applications/shared/components/TagsInput";

import { FieldEditTriggerButton } from "./FieldEditTriggerButton";

interface TagsEditDialogProps {
  applicationId: string;
  tags: string[];
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function TagsEditDialog({
  applicationId,
  tags,
  onSuccess,
  onError,
}: TagsEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TagWithMetadata[]>([]);
  const [saving, setSaving] = useState(false);

  const [update] = useUpdateApplicationMutation({
    refetchQueries: [
      { query: ApplicationDocument, variables: { id: applicationId } },
      { query: ApplicationsDocument },
    ],
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setDraft(tags.map((tag) => ({ label: tag })));
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await update({
        variables: {
          id: applicationId,
          input: {
            tags: draft
              .map((tag) => tag.label.trim())
              .filter((tag) => tag.length > 0),
          },
        },
      });
      onSuccess?.("Tags updated.");
      setOpen(false);
    } catch {
      onError?.("Could not update tags.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      title="Edit tags"
      description="Add, remove, or rename tags used to organize this application."
      open={open}
      onOpenChange={handleOpenChange}
      trigger={<FieldEditTriggerButton label="Edit tags" />}
    >
      <Stack gap="sm">
        <FormField
          label="Tags"
          htmlFor="ov-tags"
          hint="Press Enter or comma to add"
        >
          <TagsInput
            id="ov-tags"
            value={draft}
            onChange={setDraft}
            disabled={saving}
          />
        </FormField>
        <div className={cn("flex justify-end")}>
          <Button
            intent="primary"
            onClick={() => void handleSave()}
            state={saving ? "loading" : "default"}
            disabled={saving}
          >
            Save
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}

"use client";

import { Button, cn, Dialog, FormField, Stack } from "@job-tracker/ui";
import { type DialogControl } from "@job-tracker/ui";
import { useState } from "react";

import { JobDocument, JobsDocument, useUpdateJobMutation } from "@/gql/hooks";
import {
  TagsInput,
  type TagWithMetadata,
} from "@/modules/jobs/shared/components/TagsInput";

interface TagsEditDialogProps {
  control: DialogControl;
  jobId: string;
  tags: string[];
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function TagsEditDialog({
  control,
  jobId,
  tags,
  onSuccess,
  onError,
}: TagsEditDialogProps) {
  const [draft, setDraft] = useState<TagWithMetadata[]>([]);
  const [saving, setSaving] = useState(false);

  const [update] = useUpdateJobMutation({
    refetchQueries: [
      { query: JobDocument, variables: { id: jobId } },
      { query: JobsDocument },
    ],
  });

  function handleOpenChange(next: boolean) {
    control.onOpenChange(next);
    if (next) {
      setDraft(tags.map((tag) => ({ label: tag })));
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await update({
        variables: {
          id: jobId,
          input: {
            tags: draft
              .map((tag) => tag.label.trim())
              .filter((tag) => tag.length > 0),
          },
        },
      });
      onSuccess?.("Tags updated.");
      control.close();
    } catch {
      onError?.("Could not update tags.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      title="Edit tags"
      description="Add, remove, or rename tags used to organize this job."
      open={control.isOpen}
      onOpenChange={handleOpenChange}
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

"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, cn, Stack } from "@job-tracker/ui";
import { useState } from "react";

import {
  ApplicationDocument,
  ApplicationsDocument,
  useUpdateApplicationMutation,
} from "@/gql/hooks";
import { useRestructureJobDescriptionAiAction } from "@/modules/ai/actions/useRestructureJobDescriptionAiAction";
import {
  EMPTY_TIPTAP_DOC,
  normalizeTipTapDocument,
  tipTapToPlainText,
} from "@/modules/applications/shared/utils/tiptap";

import { TipTapEditor } from "./TipTapEditor";

export function DescriptionEditor({
  applicationId,
  initialDescription,
  onSuccess,
  onError,
}: {
  applicationId: string;
  initialDescription?: string | null;
  onSuccess: () => void;
  onError: () => void;
}) {
  const [description, setDescription] = useState<string>(
    normalizeTipTapDocument(initialDescription),
  );
  const restructureDescriptionAction = useRestructureJobDescriptionAiAction();

  const [updateApplication, { loading: saving }] = useUpdateApplicationMutation(
    {
      refetchQueries: [
        { query: ApplicationDocument, variables: { id: applicationId } },
        { query: ApplicationsDocument },
      ],
    },
  );

  async function handleSaveDescription() {
    const nextDescription =
      tipTapToPlainText(description).trim().length > 0 ? description : null;

    const [error] = await tryRun(
      updateApplication({
        variables: {
          id: applicationId,
          input: { description: nextDescription },
        },
      }),
    );
    if (error) {
      onError();
      return;
    }
    onSuccess();
  }

  return (
    <Stack gap="sm" className={cn("h-full min-h-0")}>
      <div className={cn("flex-1 min-h-0")}>
        <TipTapEditor
          id="details-description"
          value={description}
          onChange={(nextValue) =>
            setDescription(nextValue || EMPTY_TIPTAP_DOC)
          }
          placeholder="Add role context, stack, interview notes..."
          disabled={saving}
          autofocus="end"
          fillHeight
          aiActions={[restructureDescriptionAction]}
        />
      </div>
      <div className={cn("flex justify-end")}>
        <Button
          intent="primary"
          size="md"
          onClick={handleSaveDescription}
          state={saving ? "loading" : "default"}
        >
          Save description
        </Button>
      </div>
    </Stack>
  );
}

"use client";

import React, { useState } from "react";
import { Button, Dialog, FormField, Input, Stack, cn } from "@job-tracker/ui";
import {
  ApplicationDocument,
  ApplicationsDocument,
  useUpdateApplicationMutation,
  useUpdateCompanyMutation,
} from "@/gql/hooks";
import { FieldEditTriggerButton } from "@/modules/applications/details/components/HoverEditableFieldRow";
import { TipTapEditor } from "@/modules/applications/details/components/TipTapEditor";
import {
  EMPTY_TIPTAP_DOC,
  normalizeTipTapDocument,
  tipTapToPlainText,
} from "@/modules/applications/shared/utils/tiptap";
import { useCompanyDescriptionAiContentGeneration } from "@/modules/applications/shared/hooks/useCompanyDescriptionAiContentGeneration";

export interface CompanyEditDialogApplication {
  id: string;
  company: {
    id: string;
    name: string;
    description?: string | null;
  };
}

interface CompanyEditDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  application: CompanyEditDialogApplication;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function CompanyEditDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  application,
  onSuccess,
  onError,
}: CompanyEditDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen;

  const [nameDraft, setNameDraft] = useState(application.company.name);
  const [descriptionDraft, setDescriptionDraft] = useState(
    normalizeTipTapDocument(application.company.description),
  );
  const [saving, setSaving] = useState(false);

  const [updateApplication] = useUpdateApplicationMutation({
    refetchQueries: [
      { query: ApplicationDocument, variables: { id: application.id } },
      { query: ApplicationsDocument },
    ],
  });

  const [updateCompany] = useUpdateCompanyMutation({
    refetchQueries: [
      { query: ApplicationDocument, variables: { id: application.id } },
      { query: ApplicationsDocument },
    ],
  });

  const aiContentGeneration = useCompanyDescriptionAiContentGeneration({
    companyName: nameDraft,
    disabled: saving,
    onError,
  });

  async function handleSave() {
    const nextName = nameDraft.trim();
    const nextDescription =
      tipTapToPlainText(descriptionDraft).trim().length > 0
        ? descriptionDraft
        : null;

    const nameChanged = nextName !== application.company.name;
    const descriptionChanged =
      (nextDescription ?? "") !==
      normalizeTipTapDocument(application.company.description);

    if (!nextName || (!nameChanged && !descriptionChanged)) {
      onOpenChange(false);
      return;
    }

    setSaving(true);
    try {
      let targetCompanyId = application.company.id;

      if (nameChanged) {
        const result = await updateApplication({
          variables: { id: application.id, input: { company: nextName } },
        });
        targetCompanyId =
          result.data?.updateApplication.company.id ?? targetCompanyId;
      }

      if (descriptionChanged) {
        await updateCompany({
          variables: {
            id: targetCompanyId,
            input: { description: nextDescription },
          },
        });
      }

      onSuccess?.("Company updated.");
      onOpenChange(false);
    } catch {
      onError?.("Could not update company.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      title="Edit company"
      size="2xl"
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) {
          setNameDraft(application.company.name);
          setDescriptionDraft(
            normalizeTipTapDocument(application.company.description),
          );
        }
      }}
      trigger={
        controlledOpen !== undefined ? (
          <span aria-hidden style={{ display: "none" }} />
        ) : (
          <FieldEditTriggerButton label="Edit company" />
        )
      }
    >
      <Stack gap="sm">
        <FormField label="Company name" htmlFor="edit-company-name">
          <Input
            id="edit-company-name"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="e.g. Acme Corp"
            disabled={saving}
          />
        </FormField>
        <FormField label="Description" htmlFor="edit-company-description">
          <TipTapEditor
            id="edit-company-description"
            value={descriptionDraft}
            onChange={(nextValue) =>
              setDescriptionDraft(nextValue || EMPTY_TIPTAP_DOC)
            }
            autofocus="end"
            disabled={saving}
            aiContentGeneration={aiContentGeneration}
          />
        </FormField>
        <div className={cn("flex justify-end")}>
          <Button
            intent="primary"
            size="sm"
            onClick={() => void handleSave()}
            disabled={!nameDraft.trim() || saving}
            state={saving ? "loading" : "default"}
          >
            Save
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}

"use client";

import { Button, cn, Dialog, FormField, Input, Stack } from "@job-tracker/ui";
import React, { useMemo, useState } from "react";

import {
  ApplicationDocument,
  ApplicationsDocument,
  CompaniesDocument,
  useUpdateCompanyMutation,
} from "@/gql/hooks";
import { useGenerateCompanyDescriptionAiAction } from "@/modules/ai/actions/useGenerateCompanyDescriptionAiAction";
import { useRewriteTextAiAction } from "@/modules/ai/actions/useRewriteTextAiAction";
import { FieldEditTriggerButton } from "@/modules/applications/details/components/HoverEditableFieldRow";
import { TipTapEditor } from "@/modules/applications/details/components/TipTapEditor";
import { useControllableState } from "@/modules/applications/shared/hooks/useControllableState";
import {
  EMPTY_TIPTAP_DOC,
  normalizeTipTapDocument,
  tipTapToPlainText,
} from "@/modules/applications/shared/utils/tiptap";

export interface CompanyEditDialogApplication {
  id: string;
  company: { id: string; name: string; description?: string | null };
}

interface CompanyEditDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  application?: CompanyEditDialogApplication;
  company?: { id: string; name: string; description?: string | null };
  refetchCompanies?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function CompanyEditDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  application,
  company,
  refetchCompanies = false,
  onSuccess,
  onError,
}: CompanyEditDialogProps) {
  const sourceCompany = company ?? application?.company;
  const editingCompany = sourceCompany ?? {
    id: "",
    name: "",
    description: null,
  };

  const [open, onOpenChange] = useControllableState<boolean>({
    value: controlledOpen,
    defaultValue: false,
    onChange: controlledOnOpenChange,
  });

  const [nameDraft, setNameDraft] = useState(editingCompany.name);
  const [descriptionDraft, setDescriptionDraft] = useState(
    normalizeTipTapDocument(editingCompany.description),
  );
  const [saving, setSaving] = useState(false);

  const [updateCompany] = useUpdateCompanyMutation({
    refetchQueries: [
      ...(application
        ? [
            { query: ApplicationDocument, variables: { id: application.id } },
            { query: ApplicationsDocument },
          ]
        : []),
      ...(refetchCompanies ? [{ query: CompaniesDocument }] : []),
    ],
  });

  const generateCompanyDescriptionAction =
    useGenerateCompanyDescriptionAiAction({
      companyName: nameDraft,
      disabled: saving,
      onError,
    });
  const rewriteCompanyDescriptionAction = useRewriteTextAiAction({
    disabled: saving,
  });
  const companyDescriptionAiActions = useMemo(
    () => [generateCompanyDescriptionAction, rewriteCompanyDescriptionAction],
    [generateCompanyDescriptionAction, rewriteCompanyDescriptionAction],
  );

  async function handleSave() {
    if (!sourceCompany) {
      onOpenChange(false);
      return;
    }

    const nextName = nameDraft.trim();
    const nextDescription =
      tipTapToPlainText(descriptionDraft).trim().length > 0
        ? descriptionDraft
        : null;

    const nameChanged = nextName !== editingCompany.name;
    const descriptionChanged =
      (nextDescription ?? "") !==
      normalizeTipTapDocument(editingCompany.description);

    if (!nextName || (!nameChanged && !descriptionChanged)) {
      onOpenChange(false);
      return;
    }

    setSaving(true);
    try {
      if (nameChanged || descriptionChanged) {
        await updateCompany({
          variables: {
            id: editingCompany.id,
            input: {
              ...(nameChanged ? { name: nextName } : {}),
              ...(descriptionChanged ? { description: nextDescription } : {}),
            },
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

  if (!sourceCompany) {
    return null;
  }

  return (
    <Dialog
      title="Edit company"
      description="Update the company name and description used across your applications."
      size="2xl"
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next && sourceCompany) {
          setNameDraft(editingCompany.name);
          setDescriptionDraft(
            normalizeTipTapDocument(editingCompany.description),
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
            aiActions={companyDescriptionAiActions}
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

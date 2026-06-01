"use client";

import { EMPTY_TIPTAP_DOC, normalizeTipTapDocument, tipTapToPlainText } from "@job-tracker/tiptap";
import { Button, cn, Dialog, FormField, Input, Stack } from "@job-tracker/ui";
import { type DialogControl } from "@job-tracker/ui";
import { useMemo, useState } from "react";

import { CompaniesDocument, JobDocument, JobsDocument, useUpdateCompanyMutation } from "@/gql/hooks";
import { useGenerateCompanyDescriptionAiAction } from "@/modules/ai/actions/useGenerateCompanyDescriptionAiAction";
import { useRewriteTextAiAction } from "@/modules/ai/actions/useRewriteTextAiAction";
import { TipTapEditor } from "@/modules/jobs/details/components/TipTapEditor";

export interface CompanyEditDialogJob {
  id: string;
  company?: { id: string; name: string; description?: string | null } | null;
}

interface CompanyEditDialogProps {
  control: DialogControl;
  job?: CompanyEditDialogJob;
  company?: { id: string; name: string; description?: string | null };
  refetchCompanies?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function CompanyEditDialog({
  control: _control,
  job,
  company,
  refetchCompanies = false,
  onSuccess,
  onError,
}: CompanyEditDialogProps) {
  const sourceCompany = company ?? job?.company;
  const editingCompany = sourceCompany ?? { id: "", name: "", description: null };

  const [nameDraft, setNameDraft] = useState(editingCompany.name);
  const [descriptionDraft, setDescriptionDraft] = useState(normalizeTipTapDocument(editingCompany.description));
  const [saving, setSaving] = useState(false);

  const [updateCompany] = useUpdateCompanyMutation({
    refetchQueries: [
      ...(job ? [{ query: JobDocument, variables: { id: job.id } }, { query: JobsDocument }] : []),
      ...(refetchCompanies ? [{ query: CompaniesDocument }] : []),
    ],
  });

  const generateCompanyDescriptionAction = useGenerateCompanyDescriptionAiAction({
    companyName: nameDraft,
    disabled: saving,
    onError,
  });
  const rewriteCompanyDescriptionAction = useRewriteTextAiAction({ disabled: saving });
  const companyDescriptionAiActions = useMemo(
    () => [generateCompanyDescriptionAction, rewriteCompanyDescriptionAction],
    [generateCompanyDescriptionAction, rewriteCompanyDescriptionAction],
  );

  async function handleSave() {
    if (!sourceCompany) {
      _control.close();
      return;
    }

    const nextName = nameDraft.trim();
    const nextDescription = tipTapToPlainText(descriptionDraft).trim().length > 0 ? descriptionDraft : null;

    const nameChanged = nextName !== editingCompany.name;
    const descriptionChanged = (nextDescription ?? "") !== normalizeTipTapDocument(editingCompany.description);

    if (!nextName || (!nameChanged && !descriptionChanged)) {
      _control.close();
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
      _control.close();
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
      description="Update the company name and description used across your jobs."
      size="2xl"
      open={_control.isOpen}
      onOpenChange={(next) => {
        _control.onOpenChange(next);
        if (next && sourceCompany) {
          setNameDraft(editingCompany.name);
          setDescriptionDraft(normalizeTipTapDocument(editingCompany.description));
        }
      }}
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
            onChange={(nextValue) => setDescriptionDraft(nextValue || EMPTY_TIPTAP_DOC)}
            autofocus="end"
            disabled={saving}
            aiActions={companyDescriptionAiActions}
          />
        </FormField>
        <div className={cn("flex justify-end")}>
          <Button
            intent="primary"
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

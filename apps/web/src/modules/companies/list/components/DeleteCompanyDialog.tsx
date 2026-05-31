"use client";

import { Button, Dialog, Stack } from "@job-tracker/ui";
import React from "react";

import {
  CompaniesDocument,
  useCompanyJobsCountLazyQuery,
  useDeleteCompanyMutation,
} from "@/gql/hooks";

interface DeleteCompanyDialogProps {
  trigger: React.ReactElement;
  companyId: string;
  companyName: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function DeleteCompanyDialog({
  trigger,
  companyId,
  companyName,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: DeleteCompanyDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [step, setStep] = React.useState<"initial" | "cascade">("initial");
  const [associatedJobsCount, setAssociatedJobsCount] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const dialogOpen = open ?? internalOpen;

  function handleOpenChange(nextOpen: boolean) {
    if (open === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  }

  const [fetchJobsCount] = useCompanyJobsCountLazyQuery();
  const [deleteCompany] = useDeleteCompanyMutation({
    refetchQueries: [{ query: CompaniesDocument }],
    awaitRefetchQueries: true,
  });

  async function handleInitialConfirm() {
    setSubmitting(true);
    try {
      const result = await fetchJobsCount({ variables: { id: companyId } });
      const count = result.data?.companyJobsCount ?? 0;

      if (count > 0) {
        setAssociatedJobsCount(count);
        setStep("cascade");
        return;
      }

      await deleteCompany({ variables: { id: companyId } });
      onSuccess?.(`"${companyName}" was deleted.`);
      handleOpenChange(false);
    } catch {
      onError?.("Could not delete company.");
      throw new Error("Failed to delete company");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCascadeConfirm() {
    setSubmitting(true);
    try {
      await deleteCompany({ variables: { id: companyId } });
      onSuccess?.(
        `"${companyName}" and ${associatedJobsCount} associated ${associatedJobsCount === 1 ? "job" : "jobs"} were deleted.`,
      );
      handleOpenChange(false);
    } catch {
      onError?.("Could not delete company.");
      throw new Error("Failed to delete company");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      trigger={trigger}
      title="Delete company"
      description={
        step === "initial"
          ? `Are you sure you want to delete "${companyName}"? This cannot be undone.`
          : `"${companyName}" has ${associatedJobsCount} associated ${associatedJobsCount === 1 ? "job" : "jobs"}. Deleting this company will also remove ${associatedJobsCount === 1 ? "that job" : "those jobs"}. Do you want to continue?`
      }
      open={dialogOpen}
      onOpenChange={(nextOpen) => {
        handleOpenChange(nextOpen);
        if (!nextOpen) {
          setStep("initial");
          setAssociatedJobsCount(0);
        }
      }}
      footer={
        <Stack direction="row" gap="xs" justify="end">
          <Button intent="secondary" onClick={() => handleOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            intent="destructive"
            state={submitting ? "loading" : "default"}
            disabled={submitting}
            onClick={() =>
              void (step === "initial" ? handleInitialConfirm() : handleCascadeConfirm())
            }
          >
            {step === "initial" ? "Delete" : "Delete company and jobs"}
          </Button>
        </Stack>
      }
    />
  );
}

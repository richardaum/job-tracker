"use client";

import { ConfirmDialog } from "@job-tracker/ui";
import React from "react";

interface ConvertDraftConfirmationDialogProps {
  open: boolean;
  draftSummary: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

export function ConvertDraftConfirmationDialog({
  open,
  draftSummary,
  onOpenChange,
  onConfirm,
}: ConvertDraftConfirmationDialogProps) {
  return (
    <ConfirmDialog
      title="Convert draft to job"
      description={`Do you want to convert "${draftSummary}" to an job?`}
      confirmLabel="Convert"
      confirmIntent="primary"
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  );
}

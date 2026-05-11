"use client";

import { ConfirmDialog } from "@job-tracker/ui";
import React from "react";

interface DeleteResumeDialogProps {
  trigger: React.ReactElement;
  resumeId: string;
  resumeTitle: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
}

export function DeleteResumeDialog({
  trigger,
  resumeId: _resumeId,
  resumeTitle,
  open,
  onOpenChange,
  onConfirm,
}: DeleteResumeDialogProps) {
  return (
    <ConfirmDialog
      trigger={trigger}
      title="Delete resume"
      description={`Are you sure you want to delete "${resumeTitle}"? This cannot be undone.`}
      confirmLabel="Delete"
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={async () => {
        onConfirm?.();
      }}
    />
  );
}

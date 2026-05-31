"use client";

import { ConfirmDialog } from "@job-tracker/ui";
import type { ReactElement } from "react";

interface DeletePreferenceDialogProps {
  trigger: ReactElement;
  preferenceText: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
}

export function DeletePreferenceDialog({
  trigger,
  preferenceText,
  open,
  onOpenChange,
  onConfirm,
}: DeletePreferenceDialogProps) {
  return (
    <ConfirmDialog
      trigger={trigger}
      title="Delete preference"
      description={`Are you sure you want to delete "${preferenceText}"? This cannot be undone.`}
      confirmLabel="Delete"
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={async () => {
        onConfirm?.();
      }}
    />
  );
}

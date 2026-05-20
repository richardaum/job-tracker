"use client";

import { ConfirmDialog } from "@job-tracker/ui";
import React from "react";

interface NoteDeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function NoteDeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: NoteDeleteConfirmDialogProps) {
  return (
    <ConfirmDialog
      title="Delete note"
      description="Delete this note? This action cannot be undone."
      confirmLabel="Delete"
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  );
}

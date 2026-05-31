"use client";

import type { ButtonIntent } from "@ui/components/Button/Button";
import { Button } from "@ui/components/Button/Button";
import { Dialog } from "@ui/components/Dialog/Dialog";
import { Stack } from "@ui/components/Stack/Stack";
import React, { useState } from "react";

export interface ConfirmDialogProps {
  trigger?: React.ReactElement;
  title: string;
  description: string;
  children?: React.ReactNode;
  /** Primary action label (default: "Delete"). */
  confirmLabel?: string;
  cancelLabel?: string;
  confirmIntent?: ButtonIntent;
  onConfirm: () => void | Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  contentClassName?: string;
}

/**
 * Standard confirmation pattern: `Dialog` with Cancel + primary action,
 * loading state while `onConfirm` runs, and close only after `onConfirm` resolves.
 * If `onConfirm` throws, the dialog stays open. Prefer this over `window.confirm`.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  children,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  confirmIntent = "destructive",
  onConfirm,
  open: openControlled,
  onOpenChange,
  defaultOpen = false,
  contentClassName,
}: ConfirmDialogProps) {
  const isControlled = openControlled !== undefined;
  const [openUncontrolled, setOpenUncontrolled] = useState(defaultOpen);
  const open = isControlled ? openControlled : openUncontrolled;
  const [submitting, setSubmitting] = useState(false);

  function handleOpenChange(next: boolean) {
    if (!isControlled) {
      setOpenUncontrolled(next);
    }
    onOpenChange?.(next);
  }

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm();
      handleOpenChange(false);
    } catch {
      // Leave dialog open; callers can show toasts or surface errors.
    } finally {
      setSubmitting(false);
    }
  }

  const footer = (
    <Stack direction="row" gap="xs" justify="end">
      <Button intent="secondary" onClick={() => handleOpenChange(false)} disabled={submitting}>
        {cancelLabel}
      </Button>
      <Button
        intent={confirmIntent}
        state={submitting ? "loading" : "default"}
        onClick={() => void handleConfirm()}
      >
        {confirmLabel}
      </Button>
    </Stack>
  );

  return (
    <Dialog
      trigger={trigger}
      title={title}
      description={description}
      children={children}
      footer={footer}
      open={open}
      onOpenChange={handleOpenChange}
      contentClassName={contentClassName}
    />
  );
}

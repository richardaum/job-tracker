"use client";

import { useEffect, useState } from "react";
import { Button, Dialog, Stack } from "@job-tracker/ui";
import Link from "next/link";
import { aiBlockedDialogState, type AiBlockedReason } from "@/lib/ai-blocked-dialog-state";

export function AiBlockedDialog() {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<AiBlockedReason | undefined>();

  useEffect(() => {
    const unsubscribe = aiBlockedDialogState.subscribe((state) => {
      setOpen(state.open);
      setReason(state.reason);
    });

    return unsubscribe;
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      aiBlockedDialogState.closeDialog();
      setOpen(false);
    }
  };

  const title = "AI Features Unavailable";

  const description =
    reason === "AI_DISABLED_BY_USER"
      ? "AI is turned off for your account. You can turn it back on in your settings."
      : reason === "AI_KEY_REQUIRED"
        ? "Your AI trial is over — add your own OpenAI key to keep using AI features."
        : "";

  return (
    <Dialog
      title={title}
      description={description}
      open={open}
      onOpenChange={handleOpenChange}
      size="sm"
      footer={
        <Stack direction="row" gap="xs" justify="end">
          <Button intent="secondary" onClick={() => handleOpenChange(false)}>
            Dismiss
          </Button>
          <Link href="/profile/settings">
            <Button intent="primary" onClick={() => handleOpenChange(false)}>
              Go to Settings
            </Button>
          </Link>
        </Stack>
      }
    />
  );
}

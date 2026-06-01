"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, cn, IconButton, ListItemCard } from "@job-tracker/ui";
import { PlayIcon } from "@phosphor-icons/react";
import { useState } from "react";

import type { SourceRunStatus } from "@/gql/graphql";
import { SourceTemplateDocument, useRerunSourceTemplateMutation } from "@/gql/hooks";
import { sendSourceRunStart, wakeExtension } from "@/modules/admin/extension/lib/extension-bridge.protocol";

type SourceRunSummary = { id: string; status: SourceRunStatus; startedAt: unknown };

type RunSourceTemplateButtonProps = {
  templateId: string;
  label: string;
  tooltip: string;
  variant?: "icon" | "button";
  onRunStarted?: (templateId: string, run: SourceRunSummary) => void;
};

export function RunSourceTemplateButton({
  templateId,
  label,
  tooltip,
  variant = "icon",
  onRunStarted,
}: RunSourceTemplateButtonProps) {
  const [running, setRunning] = useState(false);
  const [rerunSourceTemplate] = useRerunSourceTemplateMutation({
    refetchQueries: [{ query: SourceTemplateDocument, variables: { id: templateId } }, "SourceTemplatesAll"],
    awaitRefetchQueries: true,
  });

  async function handleRun() {
    setRunning(true);
    const wakeResult = await wakeExtension();
    console.log("[source] wakeExtension result", wakeResult ? "ok" : "timeout");
    const [err, result] = await tryRun(rerunSourceTemplate({ variables: { templateId } }));
    setRunning(false);
    if (err || !result.data?.rerunSourceTemplate) {
      return;
    }

    const run = result.data.rerunSourceTemplate;
    sendSourceRunStart(run.id, run.surfaceUrl, run.planId);
    onRunStarted?.(templateId, run);
  }

  if (variant === "button") {
    return (
      <Button
        intent="primary"
        size="md"
        type="button"
        state={running ? "loading" : "default"}
        onClick={() => void handleRun()}
      >
        {label}
      </Button>
    );
  }

  return (
    <IconButton
      intent="ghost"
      size="sm"
      label={label}
      tooltip={tooltip}
      disabled={running}
      className={cn(ListItemCard.actionIconButtonClassName)}
      icon={<PlayIcon size={13} weight="regular" />}
      onClick={() => void handleRun()}
    />
  );
}
